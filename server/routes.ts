/**
 * נתיבי ה־API.
 *
 * תיקון אבטחה מרכזי לעומת הגרסה שנוצרה ברפליט:
 * שם היה `GET /api/contact` פתוח לחלוטין — כל אדם באינטרנט יכול היה לשלוף
 * את כל הלידים על שמותיהם, טלפוניהם והמיילים שלהם. הנתיב הוסר, ובמקומו
 * `GET /api/leads` שדורש טוקן אדמין ומושבת כברירת מחדל.
 */

import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { timingSafeEqual } from "crypto";
import { z } from "zod";
import { storage } from "./storage";
import { insertContactSubmissionSchema } from "@shared/schema";
import { pingDatabase, hasDatabase } from "./db";
import { log } from "./vite";

/* ═════════════════ הגבלת קצב ═════════════════ */

/** חלון גולש בזיכרון. מספיק לדף נחיתה יחיד ולא דורש תלות נוספת. */
function rateLimit({ windowMs, max }: { windowMs: number; max: number }) {
  const hits = new Map<string, number[]>();

  /* ניקוי תקופתי כדי שהמפה לא תגדל בלי סוף */
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

  /* בלי טוקן מוגדר הנתיב מושבת — לעולם לא פתוח בטעות */
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

  /* תשובות עם מידע אישי לא נשמרות בקאש בשום שלב בדרך */
  res.setHeader("Cache-Control", "no-store, private");
  next();
}

/* ═════════════════ סכימת הליד ═════════════════ */

const leadSchema = insertContactSubmissionSchema.extend({
  name: z.string().trim().min(2, "שם קצר מדי").max(80),
  phone: z
    .string()
    .trim()
    /* מספרים ישראליים בכל הפורמטים הנפוצים, כולל +972 ורווחים/מקפים */
    .regex(/^(\+?972[-\s]?|0)([23489]|5[0-9]|7[2-9])[-\s]?\d{3}[-\s]?\d{4}$/, "מספר טלפון לא תקין"),
  email: z.string().trim().email("כתובת מייל לא תקינה").max(120).optional().or(z.literal("")),
  eventType: z.string().trim().min(2).max(60),
  guestCount: z.coerce.number().int().min(1).max(5000).optional(),
  eventDate: z.string().trim().max(40).optional().or(z.literal("")),
  budget: z.string().trim().max(60).optional().or(z.literal("")),
  details: z.string().trim().max(2000).optional().or(z.literal("")),
});

/** מלכודת בוטים — שדה מוסתר שרק סקריפט אוטומטי ימלא. */
const honeypotSchema = z.object({ company_website: z.string().max(0).optional() });

/* ═════════════════ התראה על ליד חדש ═════════════════ */

/**
 * שולח את הליד ל־webhook חיצוני מיד עם קליטתו.
 * מכוון ל־Zapier / Make / n8n / ספק WhatsApp API — כך שאין צורך בתלות
 * נוספת בפרויקט, וניתן להחליף ערוץ התראה בלי לגעת בקוד.
 * נכשל בשקט: ליד לעולם לא נאבד בגלל התראה שלא נשלחה.
 */
async function notifyNewLead(lead: Record<string, unknown>) {
  const url = process.env.NOTIFY_WEBHOOK_URL;
  if (!url) return;

  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 5000);
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "new_lead", lead }),
      signal: ctrl.signal,
    });
    clearTimeout(timer);
  } catch (err) {
    log(`התראה על ליד נכשלה: ${(err as Error).message}`, "notify");
  }
}

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

  /* ───── קליטת ליד ───── */
  app.post(
    "/api/contact",
    rateLimit({ windowMs: 10 * 60_000, max: 8 }),
    async (req, res, next) => {
      try {
        const trap = honeypotSchema.safeParse(req.body);
        if (!trap.success || req.body?.company_website) {
          /* לבוט מחזירים הצלחה כדי שלא ינסה שוב בצורה אחרת */
          res.json({ success: true });
          return;
        }

        const data = leadSchema.parse(req.body);
        const submission = await storage.createContactSubmission(data);

        void notifyNewLead(submission as unknown as Record<string, unknown>);

        /* מוחזר רק אישור — אין צורך להחזיר את הליד עצמו ללקוח */
        res.status(201).json({ success: true, id: submission.id });
      } catch (error) {
        if (error instanceof z.ZodError) {
          res.status(400).json({
            success: false,
            error: "שדות לא תקינים",
            fields: error.flatten().fieldErrors,
          });
          return;
        }
        next(error);
      }
    },
  );

  /* ───── צפייה בלידים (אדמין) ───── */
  app.get("/api/leads", requireAdmin, async (_req, res, next) => {
    try {
      res.json({ success: true, data: await storage.getContactSubmissions() });
    } catch (error) {
      next(error);
    }
  });

  /* הנתיב הפתוח הישן — נשאר כדי שקישורים קיימים לא יחזירו HTML במקום JSON */
  app.get("/api/contact", (_req, res) => {
    res.status(410).json({
      success: false,
      error: "הנתיב הוסר מטעמי אבטחה. השתמשו ב־GET /api/leads עם טוקן אדמין.",
    });
  });

  return createServer(app);
}
