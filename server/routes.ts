/**
 * נתיבי ה־API.
 *
 * ארבעה מסלולי קליטה, כולם כותבים לאותה טבלת leads:
 *   POST /api/quote      — טופס ההצעה המלא
 *   POST /api/wa-intent  — קליטה מקדימה לפני יציאה לוואטסאפ
 *   POST /api/draft      — טיוטה תוך כדי מילוי, בלי מידע אישי
 *   POST /api/lead/phone — קליק על מספר טלפון
 *
 * צפייה בלידים מוגנת בטוקן ומושבתת כברירת מחדל.
 */

import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { timingSafeEqual, createHash } from "crypto";
import { z } from "zod";
import { storage } from "./storage";
import { pingDatabase, hasDatabase } from "./db";
import { log } from "./vite";
import {
  quoteLeadSchema, waIntentSchema, draftSchema,
  toE164, GUEST_BANDS_VERSION, LEAD_STATUSES,
} from "@shared/lead-schema";
import type { InsertLead } from "@shared/schema";

/* ═════════════════ הגבלת קצב ═════════════════ */

function rateLimit({ windowMs, max }: { windowMs: number; max: number }) {
  const hits = new Map<string, number[]>();

  setInterval(() => {
    const cutoff = Date.now() - windowMs;
    for (const [key, times] of hits) {
      const kept = times.filter((t) => t > cutoff);
      kept.length ? hits.set(key, kept) : hits.delete(key);
    }
  }, windowMs).unref();

  return (req: Request, res: Response, next: NextFunction) => {
    const key = req.ip ?? "unknown";
    const now = Date.now();
    const times = (hits.get(key) ?? []).filter((t) => t > now - windowMs);

    if (times.length >= max) {
      res.status(429).json({
        success: false,
        error: "יותר מדי בקשות. נסו שוב בעוד כמה דקות, או התקשרו אלינו.",
      });
      return;
    }
    times.push(now);
    hits.set(key, times);
    next();
  };
}

/* ═════════════════ אימות אדמין ═════════════════ */

function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const expected = process.env.ADMIN_TOKEN;

  if (!expected || expected.length < 24) {
    res.status(503).json({
      success: false,
      error: "צפייה בלידים מושבתת. הגדירו ADMIN_TOKEN באורך 24 תווים ומעלה.",
    });
    return;
  }

  const header = req.header("authorization") ?? "";
  const provided = header.startsWith("Bearer ")
    ? header.slice(7)
    : req.header("x-admin-token") ?? "";

  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  const ok = a.length === b.length && timingSafeEqual(a, b);

  if (!ok) {
    log(`ניסיון גישה לא מורשה ל־${req.path}`, "security");
    res.status(401).json({ success: false, error: "לא מורשה" });
    return;
  }

  res.setHeader("Cache-Control", "no-store, private");
  /* מזהה מי שינה סטטוס בלי לשמור את הטוקן עצמו */
  (req as any).actor = sha256(expected).slice(0, 12);
  next();
}

/* ═════════════════ עזרים ═════════════════ */

const sha256 = (v: string) => createHash("sha256").update(v.trim().toLowerCase()).digest("hex");

/** מסמן שישי/שבת — משפיע על זמינות ועל תמחור, ונקבע פעם אחת בקליטה. */
function dateFlagOf(iso?: string | null): string | null {
  if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;
  const [y, m, d] = iso.split("-").map(Number);
  const day = new Date(y, m - 1, d).getDay();
  return day === 5 ? "friday" : day === 6 ? "saturday" : null;
}

/**
 * שולח את הליד ל־webhook חיצוני מיד עם קליטתו.
 * מכוון ל־Zapier / Make / n8n / ספק WhatsApp API, כדי שאפשר יהיה להחליף
 * ערוץ התראה בלי לגעת בקוד. נכשל בשקט — ליד לא נאבד בגלל התראה.
 *
 * ⚠ חובת גילוי — לקרוא לפני כתיבת דף הפרטיות או קופי הרגעה בטופס.
 *
 * הפונקציה הזאת מעבירה שם וטלפון חייג של כל ליד לצד שלישי, וברוב המקרים
 * גם אל מחוץ לישראל. מבחינת חוק הגנת הפרטיות הספק הזה הוא "מחזיק",
 * וההעברה טעונה גילוי בהודעת האיסוף ובמדיניות הפרטיות, בציון סוג הספק.
 *
 * לכן אסור שיופיע באתר משפט כמו "לא מעבירים את הפרטים לאף אחד" —
 * הוא שקרי מעצם הארכיטקטורה כל עוד NOTIFY_WEBHOOK_URL מוגדר.
 * "לא שולחים ניוזלטר" מותר: הוא נאכף בפועל על ידי עמודת consentMarketing.
 *
 * מי שמסיר את ההתראה הזאת — מוזמן לעדכן גם את הקופי בהתאם.
 */
async function notify(kind: string, lead: Record<string, unknown>) {
  const url = process.env.NOTIFY_WEBHOOK_URL;
  if (!url) return;
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 5000);
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: kind, lead }),
      signal: ctrl.signal,
    });
    clearTimeout(timer);
  } catch (err) {
    log(`התראה נכשלה: ${(err as Error).message}`, "notify");
  }
}

/** שדות הייחוס משותפים לכל מסלולי הקליטה. */
function attributionOf(v: Record<string, any>): Partial<InsertLead> {
  return {
    sourcePage: v.sourcePage ?? null,
    landingPage: v.landingPage ?? null,
    referrer: v.referrer ?? null,
    sessionId: v.sessionId ?? null,
    utmSource: v.utmSource ?? null,
    utmMedium: v.utmMedium ?? null,
    utmCampaign: v.utmCampaign ?? null,
    utmTerm: v.utmTerm ?? null,
    utmContent: v.utmContent ?? null,
    utmId: v.utmId ?? null,
    gclid: v.gclid ?? null,
    gbraid: v.gbraid ?? null,
    wbraid: v.wbraid ?? null,
    fbclid: v.fbclid ?? null,
    msclkid: v.msclkid ?? null,
    ttclid: v.ttclid ?? null,
    clickIdCapturedAt: v.gclid || v.gbraid || v.wbraid || v.fbclid ? new Date() : null,
    gaClientId: v.gaClientId ?? null,
    gaSessionId: v.gaSessionId ?? null,
  };
}

const zodFail = (res: Response, error: z.ZodError) =>
  res.status(400).json({
    success: false,
    error: "שדות לא תקינים",
    fields: error.flatten().fieldErrors,
  });

/* ═════════════════ רישום הנתיבים ═════════════════ */

export async function registerRoutes(app: Express): Promise<Server> {
  /* ───── בדיקת חיים ───── */
  app.get("/api/health", async (_req, res) => {
    res.json({
      ok: true,
      storage: hasDatabase ? "postgres" : "memory",
      db: hasDatabase ? await pingDatabase() : null,
      uptime: Math.round(process.uptime()),
    });
  });

  /* ───── טיוטה — בלי מידע אישי, .strict() חוסם דליפה ───── */
  app.post("/api/draft", rateLimit({ windowMs: 60_000, max: 40 }), async (req, res, next) => {
    try {
      const d = draftSchema.parse(req.body);
      await storage.upsertDraft({
        draftId: d.draftId,
        sessionId: d.sessionId ?? null,
        step: d.step,
        eventType: d.eventType ?? null,
        guestBand: d.guestBand ?? null,
        eventDate: d.eventDate ?? null,
        area: d.area ?? null,
        serviceFormat: d.serviceFormat ?? null,
        selectedDishes: d.selectedDishes ?? null,
        sourcePage: d.sourcePage ?? null,
        utmSource: d.utmSource ?? null,
        utmCampaign: d.utmCampaign ?? null,
      });
      res.status(204).end();
    } catch (error) {
      if (error instanceof z.ZodError) return void zodFail(res, error);
      next(error);
    }
  });

  /* ───── ליד מלא מהטופס ───── */
  app.post("/api/quote", rateLimit({ windowMs: 10 * 60_000, max: 8 }), async (req, res, next) => {
    try {
      /* מלכודת בוט: לבוט מחזירים הצלחה כדי שלא ינסה בדרך אחרת */
      if (req.body?.company_website) {
        res.status(201).json({ success: true });
        return;
      }

      const v = quoteLeadSchema.parse(req.body);

      /* מילוי טופס מהיר מדי הוא חתימה של בוט, לא של אדם */
      if (v.mountedAt && Date.now() - v.mountedAt < 2500) {
        res.status(201).json({ success: true, ref: v.ref });
        return;
      }

      const e164 = toE164(v.phone)!;
      const now = new Date();

      /* אותה לשונית שכבר יצרה ליד וואטסאפ — משדרגים במקום לכפול */
      const existing = v.sessionId
        ? await storage.findRecentLeadBySession(v.sessionId, 6 * 60 * 60_000)
        : undefined;

      const fields: Partial<InsertLead> = {
        ...attributionOf(v),
        name: v.name,
        phone: v.phone,
        phoneE164: e164,
        phoneSha256: sha256(e164),
        email: v.email || null,
        emailSha256: v.email ? sha256(v.email) : null,
        contactChannel: v.contactChannel,
        eventType: v.eventType,
        guestBand: v.guestBand,
        guestBandVersion: v.guestBandVersion ?? GUEST_BANDS_VERSION,
        eventDate: v.eventDate || null,
        dateFlexible: v.dateFlexible,
        dateFlag: dateFlagOf(v.eventDate),
        area: v.area,
        areaIsFreeText: v.areaIsFreeText,
        serviceFormat: v.serviceFormat ?? null,
        selectedDishes: v.selectedDishes,
        notes: v.notes || null,
        answers: v as unknown as Record<string, unknown>,
        consentMarketing: v.consentMarketing,
        consentMarketingAt: v.consentMarketing ? now : null,
        consentTextVersion: v.consentTextVersion ?? null,
        noticeVersion: v.noticeVersion ?? null,
        draftId: v.draftId ?? null,
        stepsCompleted: v.stepsCompleted ?? null,
        timeToCompleteMs: v.timeToCompleteMs ?? null,
      };

      const lead = existing
        ? await storage.updateLead(existing.id, { ...fields, path: "draft_upgrade" })
        : await storage.createLead({ ...fields, ref: v.ref, path: "quote_form" } as InsertLead);

      if (!lead) throw new Error("שמירת הליד נכשלה");

      await storage.logLeadEvent({
        leadId: lead.id,
        eventName: existing ? "lead_upgraded" : "lead_created",
        payload: { path: lead.path, sourcePage: lead.sourcePage },
      });

      void notify("new_lead", {
        ref: lead.ref, name: lead.name, phone: lead.phone,
        eventType: lead.eventType, guestBand: lead.guestBand,
        eventDate: lead.eventDate, area: lead.area, notes: lead.notes,
        sourcePage: lead.sourcePage, utmSource: lead.utmSource,
      });

      res.status(201).json({ success: true, ref: lead.ref });
    } catch (error) {
      if (error instanceof z.ZodError) return void zodFail(res, error);
      next(error);
    }
  });

  /* ───── קליטה מקדימה לפני יציאה לוואטסאפ ─────
     זו הנקודה הקריטית: קליק לוואטסאפ מוציא את המשתמש מהאתר, ובלי
     הקליטה הזאת הליד פשוט לא קיים אצלנו. חייב להיות מהיר ולא חוסם. */
  app.post("/api/wa-intent", rateLimit({ windowMs: 60_000, max: 20 }), async (req, res, next) => {
    try {
      const v = waIntentSchema.parse(req.body);

      /* אותה לשונית לחצה כבר — מעדכנים ולא כופלים */
      const existing = v.sessionId
        ? await storage.findRecentLeadBySession(v.sessionId, 60 * 60_000)
        : undefined;

      const fields: Partial<InsertLead> = {
        ...attributionOf(v),
        waLocation: v.waLocation,
        branch: v.branch ?? null,
        eventType: v.eventType ?? null,
        guestBand: v.guestBand ?? null,
        eventDate: v.eventDate ?? null,
        dateFlag: dateFlagOf(v.eventDate),
        area: v.area ?? null,
        serviceFormat: v.serviceFormat ?? null,
        selectedDishes: v.dishIds ?? null,
        name: v.name ?? null,
        phone: v.phone ?? null,
        phoneE164: v.phone ? toE164(v.phone) : null,
        contactChannel: "whatsapp",
      };

      const lead = existing
        ? await storage.updateLead(existing.id, fields)
        : await storage.createLead({ ...fields, ref: v.ref, path: "wa_intent" } as InsertLead);

      if (lead) {
        await storage.logLeadEvent({
          leadId: lead.id,
          eventName: "wa_intent",
          payload: { waLocation: v.waLocation, sourcePage: v.sourcePage },
        });
        void notify("wa_intent", {
          ref: lead.ref, waLocation: v.waLocation,
          eventType: lead.eventType, guestBand: lead.guestBand,
          sourcePage: lead.sourcePage, utmSource: lead.utmSource,
        });
      }

      res.status(202).json({ success: true, ref: v.ref });
    } catch (error) {
      if (error instanceof z.ZodError) return void zodFail(res, error);
      next(error);
    }
  });

  /* ───── קליק על טלפון ───── */
  app.post("/api/lead/phone", rateLimit({ windowMs: 60_000, max: 20 }), async (req, res, next) => {
    try {
      const v = waIntentSchema.pick({ ref: true, sourcePage: true, sessionId: true }).parse(req.body);
      const lead = await storage.createLead({
        ref: v.ref, path: "phone",
        sourcePage: v.sourcePage ?? null, sessionId: v.sessionId ?? null,
        contactChannel: "phone",
      } as InsertLead);
      await storage.logLeadEvent({ leadId: lead.id, eventName: "phone_click", payload: null });
      res.status(202).json({ success: true });
    } catch (error) {
      if (error instanceof z.ZodError) return void zodFail(res, error);
      next(error);
    }
  });

  /* ───── אדמין ───── */
  app.get("/api/leads", requireAdmin, async (req, res, next) => {
    try {
      const status = typeof req.query.status === "string" ? req.query.status : undefined;
      const limit = Math.min(Number(req.query.limit) || 200, 500);
      const offset = Number(req.query.offset) || 0;
      res.json({ success: true, data: await storage.listLeads({ status, limit, offset }) });
    } catch (error) {
      next(error);
    }
  });

  app.patch("/api/leads/:id", requireAdmin, async (req, res, next) => {
    try {
      const body = z
        .object({
          status: z.enum(LEAD_STATUSES).optional(),
          lostReason: z.string().max(200).optional(),
          quotedValueIls: z.coerce.number().int().min(0).max(10_000_000).optional(),
          wonValueIls: z.coerce.number().int().min(0).max(10_000_000).optional(),
          notes: z.string().max(2000).optional(),
        })
        .strict()
        .parse(req.body);

      const now = new Date();
      const patch: Partial<InsertLead> = { ...body };
      if (body.status) {
        patch.statusChangedAt = now;
        patch.statusChangedBy = (req as any).actor ?? null;
        if (body.status === "won") patch.wonAt = now;
      }

      const lead = await storage.updateLead(req.params.id, patch);
      if (!lead) {
        res.status(404).json({ success: false, error: "ליד לא נמצא" });
        return;
      }

      await storage.logLeadEvent({
        leadId: lead.id,
        eventName: "status_changed",
        payload: { to: lead.status, by: (req as any).actor },
      });

      res.json({ success: true, data: lead });
    } catch (error) {
      if (error instanceof z.ZodError) return void zodFail(res, error);
      next(error);
    }
  });

  /* ───── נתיבים ישנים ───── */
  app.all("/api/contact", (_req, res) => {
    res.status(410).json({
      success: false,
      error: "הנתיב הוסר. השתמשו ב־POST /api/quote, או ב־GET /api/leads עם טוקן אדמין.",
    });
  });

  return createServer(app);
}
