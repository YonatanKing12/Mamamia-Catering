/**
 * סכימות ולידציה — zod.
 *
 * הקבועים והעוזרים חיים ב־`lead-constants.ts` ומיוצאים מחדש כאן, כדי
 * שהשרת ימשיך לייבא הכול ממקום אחד. קוד קליינט חייב לייבא מ־
 * `@shared/lead-constants` ישירות — ייבוא מכאן גורר את zod לבאנדל.
 */

import { z } from "zod";
import { toE164, REF_PATTERN, GUEST_BANDS, SERVICE_FORMATS, WA_LOCATIONS, BRANCHES } from "./lead-constants";

export * from "./lead-constants";

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
