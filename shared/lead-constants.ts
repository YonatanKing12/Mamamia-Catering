/**
 * קבועים, טיפוסים ועוזרים משותפים — **בלי zod**.
 *
 * הפיצול הזה הוא תיקון ביצועים אמיתי ולא סידור אסתטי. כל ייבוא ערכי
 * מהקליינט אל `lead-schema` היה קבוע או עוזר — אף קומפוננטה לא מייבאת
 * סכימת zod כערך, כי הוולידציה היא צד־שרת. אבל `lib/analytics.ts` ייבא
 * מכאן ערכים, והוא מיובא כמעט מכל מקום, ולכן zod נגרר לצ'אנק הכניסה —
 * 64KB על כל מסלול, כולל /terms ו־/404 שאין בהם טופס בכלל.
 *
 * הקובץ הזה נטול תלויות בכוונה. אין להוסיף לו ייבוא של zod או של drizzle.
 */


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
