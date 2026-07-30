/**
 * ולידציה משותפת לקליינט ולשרת — zod בלבד.
 *
 * הקובץ הזה מיובא מהדפדפן. אסור לו לגעת ב־drizzle.
 * `shared/schema.ts` נשאר צד־שרת בלבד: הוא גורר את drizzle-orm/pg-core לבאנדל
 * (כ־45KB) וגם מפרסם את שמות הטבלאות והעמודות בקובץ JS ציבורי.
 */

import { z } from "zod";

/* ═══════════════════ רשימות סגורות ═══════════════════ */

export const GUEST_BANDS = ["lt25", "25_50", "50_100", "100_200", "200p"] as const;
export const SERVICE_FORMATS = ["delivery", "buffet_on_site", "plated_staffed", "at_restaurant"] as const;
export const WA_LOCATIONS = ["hero", "sticky", "footer", "quote_alt", "branch", "urgent", "shiva", "thanks"] as const;
export const BRANCHES = ["herzliya_pituach", "raanana", "petah_tikva"] as const;
export const LEAD_PATHS = ["quote_form", "wa_intent", "phone", "menu_download", "draft_upgrade"] as const;
export const LEAD_STATUSES = [
  "new", "contacted", "quoted", "won", "lost", "disqualified",
] as const;

export type GuestBand = (typeof GUEST_BANDS)[number];
export type ServiceFormat = (typeof SERVICE_FORMATS)[number];
export type WaLocation = (typeof WA_LOCATIONS)[number];
export type Branch = (typeof BRANCHES)[number];
export type LeadPath = (typeof LEAD_PATHS)[number];
export type LeadStatus = (typeof LEAD_STATUSES)[number];

/** תוויות עבריות לטווחי סועדים. הערכים עצמם יציבים, התוויות ניתנות לשינוי. */
export const GUEST_BAND_LABELS: Record<GuestBand, string> = {
  lt25: "עד 25",
  "25_50": "25 עד 50",
  "50_100": "50 עד 100",
  "100_200": "100 עד 200",
  "200p": "200 ומעלה",
};

/** גרסת הטווחים. נשמרת על כל ליד כדי שניתוח היסטורי לא יישבר בשינוי עתידי. */
export const GUEST_BANDS_VERSION = "1";

/** ממיר מספר סועדים מדויק לטווח. שימושי כשמגיע קלט חופשי במקום בחירה. */
export function bandFromCount(n: number | undefined | null): GuestBand | undefined {
  if (n == null || !Number.isFinite(n) || n <= 0) return undefined;
  if (n < 25) return "lt25";
  if (n < 50) return "25_50";
  if (n < 100) return "50_100";
  if (n < 200) return "100_200";
  return "200p";
}

/* ═══════════════════ מזהה פנייה ═══════════════════ */

/** בלי 0/O/1/I/L — כדי שאפשר יהיה להקריא את הקוד בטלפון בלי טעויות. */
const REF_ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
export const REF_PATTERN = /^MM-[2-9A-HJ-NP-Z]{6}$/;

export function generateRef(): string {
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  let out = "";
  for (const b of bytes) out += REF_ALPHABET[b % REF_ALPHABET.length];
  return `MM-${out}`;
}

/* ═══════════════════ טלפון ═══════════════════ */

/**
 * נרמול מספר ישראלי ל־E.164. מחזיר null אם המספר אינו תקין.
 * מקבל: 050-1234567 · 0501234567 · +972501234567 · 972501234567 · 05 0123 4567
 */
export function toE164(raw: string): string | null {
  const digits = String(raw).replace(/[^\d+]/g, "");
  let n = digits.startsWith("+") ? digits.slice(1) : digits;

  if (n.startsWith("972")) n = n.slice(3);
  else if (n.startsWith("0")) n = n.slice(1);
  else return null;

  /* נייד 5X, קווי 2/3/4/8/9, ו־7X של ספקים וירטואליים */
  if (!/^(5\d|7[2-9]|[23489])\d{7}$/.test(n)) return null;
  return `+972${n}`;
}

export const phoneField = z
  .string()
  .trim()
  .min(9)
  .max(25)
  .refine((v) => toE164(v) !== null, { message: "מספר הטלפון לא נראה תקין." });

/* ═══════════════════ ייחוס ═══════════════════ */

/**
 * UTM ומזהי קליק מגיעים מהכתובת, כלומר נשלטים על ידי מי ששלח את הקישור,
 * והם ייראו בסופו של דבר במסך של בעל העסק. מגבילים תווים ואורך כבר בכניסה.
 */
const utmValue = z.string().trim().max(120).regex(/^[\w\-. |/]*$/u).optional();
const clickId = z.string().trim().max(300).regex(/^[\w\-.]*$/).optional();

export const attributionSchema = z.object({
  sourcePage: z.string().trim().max(200).optional(),
  landingPage: z.string().trim().max(200).optional(),
  referrer: z.string().trim().max(300).optional(),
  sessionId: z.string().trim().max(40).regex(/^[\w-]*$/).optional(),

  utmSource: utmValue,
  utmMedium: utmValue,
  utmCampaign: utmValue,
  utmTerm: utmValue,
  utmContent: utmValue,
  utmId: utmValue,

  /* ב־iOS מגיעים gbraid/wbraid במקום gclid, לעולם לא יחד איתו */
  gclid: clickId,
  gbraid: clickId,
  wbraid: clickId,
  fbclid: clickId,
  msclkid: clickId,
  ttclid: clickId,

  gaClientId: z.string().trim().max(60).regex(/^[\w.\-]*$/).optional(),
  gaSessionId: z.string().trim().max(40).regex(/^[\w.\-]*$/).optional(),
});

export type Attribution = z.infer<typeof attributionSchema>;

/* ═══════════════════ ליד מלא מהטופס ═══════════════════ */

export const quoteLeadSchema = attributionSchema.extend({
  ref: z.string().regex(REF_PATTERN, "מזהה פנייה לא תקין"),

  name: z.string().trim().min(2, "צריך שם, כדי שנדע למי לחזור.").max(80),
  phone: phoneField,
  email: z.string().trim().email("כתובת המייל לא נראית תקינה.").max(120).optional().or(z.literal("")),
  contactChannel: z.enum(["whatsapp", "phone"]).default("whatsapp"),

  eventType: z.string().trim().min(2).max(60),
  guestBand: z.enum(GUEST_BANDS),
  guestBandVersion: z.string().max(20).optional(),
  eventDate: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/, "תאריך לא תקין").optional().or(z.literal("")),
  dateFlexible: z.boolean().default(false),
  area: z.string().trim().max(60),
  areaIsFreeText: z.boolean().default(false),
  serviceFormat: z.enum(SERVICE_FORMATS).nullish(),
  selectedDishes: z.array(z.string().max(60)).max(40).default([]),
  notes: z.string().trim().max(2000).optional().or(z.literal("")),

  consentMarketing: z.boolean().default(false),
  consentTextVersion: z.string().max(40).optional(),
  noticeVersion: z.string().max(40).optional(),

  draftId: z.string().max(40).optional(),
  stepsCompleted: z.coerce.number().int().min(1).max(5).optional(),
  timeToCompleteMs: z.coerce.number().int().min(0).max(3_600_000).optional(),

  /* אנטי־ספאם: זמן טעינת הטופס, ומלכודת שרק בוט ימלא */
  mountedAt: z.coerce.number().int().optional(),
  company_website: z.string().max(0).optional(),
});

export type QuoteLeadInput = z.infer<typeof quoteLeadSchema>;

/* ═══════════════════ כוונת וואטסאפ ═══════════════════ */

/**
 * נשלח *לפני* שהמשתמש עוזב את האתר לוואטסאפ.
 * זה הפתרון לבעיה המרכזית: קליק לוואטסאפ מוציא את המשתמש מהאתר,
 * ובלי הקליטה המקדימה הזאת הליד פשוט לא קיים אצלנו.
 */
export const waIntentSchema = attributionSchema.extend({
  ref: z.string().regex(REF_PATTERN),
  waLocation: z.enum(WA_LOCATIONS),
  branch: z.enum(BRANCHES).nullish(),

  eventType: z.string().trim().max(60).optional(),
  guestBand: z.enum(GUEST_BANDS).optional(),
  eventDate: z.string().trim().max(20).optional(),
  area: z.string().trim().max(60).optional(),
  serviceFormat: z.enum(SERVICE_FORMATS).nullish(),
  dishIds: z.array(z.string().max(60)).max(40).optional(),

  name: z.string().trim().max(80).optional(),
  phone: z.string().trim().max(25).optional(),
});

export type WaIntentInput = z.infer<typeof waIntentSchema>;

/* ═══════════════════ טיוטה ═══════════════════ */

/**
 * טיוטת מחשבון — נשמרת תוך כדי מילוי, לפני שנמסרו פרטי קשר.
 *
 * `.strict()` כאן נושא משקל: הוא מה שהופך מפתח `phone` שנשלח בטעות
 * לשגיאת 400 במקום לכתיבה שקטה של מידע אישי לטבלה שאמורה להיות נקייה ממנו.
 */
export const draftSchema = attributionSchema
  .extend({
    draftId: z.string().max(40),
    step: z.coerce.number().int().min(1).max(4),
    eventType: z.string().trim().max(60).optional(),
    guestBand: z.enum(GUEST_BANDS).optional(),
    eventDate: z.string().trim().max(20).optional(),
    /* מנוקה: בלי ספרות ובלי @, כדי שטלפון או מייל לא ייכנסו דרך שדה חופשי */
    area: z.string().trim().max(60).regex(/^[^\d@]*$/, "אזור לא תקין").optional(),
    serviceFormat: z.enum(SERVICE_FORMATS).nullish(),
    selectedDishes: z.array(z.string().max(60)).max(40).optional(),
  })
  .strict();

export type DraftInput = z.infer<typeof draftSchema>;
