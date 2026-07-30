/**
 * ═══════════════════════════════════════════════════════════════════════
 *  טקסונומיית האירועים — מודול יחיד, איחוד סגור.
 * ═══════════════════════════════════════════════════════════════════════
 *
 * spec 02 §14.2. שמות האירועים והפרמטרים כאן הם החוזה. דף נחיתה שמומצא
 * תחת לחץ זמן אינו יכול להמציא שם אירוע משלו — הטיפוסים לא ייתנו.
 *
 * ─────────────────────────────────────────────────────────────────────
 *  המצב הנוכחי: אין תג. הקובץ הזה הוא no-op.
 * ─────────────────────────────────────────────────────────────────────
 * אין באתר GA4, אין Google Ads, אין Meta Pixel, ואין מזהה מדידה.
 * **אסור להמציא כאן מזהה תג.** מזהה שגוי שולח נתונים לנכס של מישהו אחר,
 * ומזהה מומצא נראה כמו מדידה עובדת עד שמישהו מחפש את הדוח.
 *
 * הזרקת התגים עצמם שייכת ל־`lib/consent.ts` (spec 02 §14.8) — הקובץ
 * היחיד שמותר לו ליצור `<script src>` לדומיין חיצוני. כשהוא ירוץ,
 * `window.gtag` יופיע והמודול הזה יתחיל לשלוח בלי שינוי קוד.
 *
 * עד אז כל קריאה כאן חייבת **לא לזרוק ולא להחזיר promise**. אירוע
 * אנליטיקס שמפיל קליק על כפתור וואטסאפ הוא באג חמור בהרבה מאירוע חסר.
 *
 * ─────────────────────────────────────────────────────────────────────
 *  לפני שהתג נדלק — שלושה דברים בהגדרות, לא בקוד (spec 02 §14.1)
 * ─────────────────────────────────────────────────────────────────────
 *  1. לכבות "Form interactions" ב־enhanced measurement, אחרת GA4 סופר
 *     form_start / form_submit אוטומטיים כפול מול quote_start / generate_lead.
 *  2. שמירת נתוני אירועים ל־14 חודשים ביום הראשון. ברירת המחדל היא
 *     חודשיים, והיא **אינה רטרואקטיבית** — מחזור מכירה של קייטרינג לא
 *     ניתן לניתוח בחודשיים.
 *  3. לרשום step_id, guest_band, branch_area, lead_source, wa_location,
 *     service_format, dish_id כמימדים מותאמים ברמת אירוע, אחרת הם
 *     אינם נראים בשום דוח.
 */

import type {
  Branch,
  GuestBand,
  ServiceFormat,
  WaLocation,
} from "@shared/lead-constants";

/* ═══════════════════ ערכים סגורים ═══════════════════ */

export const STEP_IDS = ["event_type", "guests", "date", "area", "contact"] as const;
export type StepId = (typeof STEP_IDS)[number];

export const LEAD_SOURCES = ["quote_builder", "whatsapp_handoff", "menu", "taste"] as const;
export type LeadSource = (typeof LEAD_SOURCES)[number];

export const SHARE_METHODS = ["webshare", "copy", "print"] as const;
export type ShareMethod = (typeof SHARE_METHODS)[number];

/* ═══════════════════ מפת האירועים ═══════════════════ */

/**
 * שמות שמורים של GA4 לייצור לידים (`generate_lead`, `working_lead`,
 * `qualify_lead`, `close_convert_lead`, `close_unconvert_lead`) הם מה
 * שמאכלס את דוחות ה־Lead Generation המובנים ואת תבניות הקהלים.
 * אין `lead_submit`, אין `form_success`, אין `quote_submit`.
 *
 * אירוע אחד עם פרמטרים, ולא שם נפרד לכל שלב: 500 שמות אירוע הם תקרה
 * קשיחה ב־GA4, וניתוח משפך על שם אחד פשוט יותר.
 */
export interface AnalyticsEventMap {
  /** הבילדר נכנס ל־viewport */
  quote_open: { source_page: string };

  /** התשובה הראשונה במסך 1 */
  quote_start: { source_page: string; event_type: string };

  /** בכל מעבר קדימה */
  quote_step_complete: {
    step_index: 1 | 2 | 3 | 4 | 5;
    step_id: StepId;
    event_type?: string;
    guest_band?: GuestBand;
    area?: string;
    date_known?: boolean;
  };

  /** ← חזרה */
  quote_step_back: { from_step: number };

  /** הוסיפו לתפריט שלי */
  add_to_brief: {
    dish_id: string;
    source_page: string;
    brief_size: number;
    service_format?: ServiceFormat | null;
  };

  /** הסרה מכרטיס התפריט */
  remove_from_brief: { dish_id: string; brief_size: number };

  /** בחירת תפריט שף בסקשן 02 */
  service_format_select: { service_format: ServiceFormat; source_page: string };

  /** רק כשארבעת המנעולים של spec 02 §2.2 עוברים. במצב ההשקה לא נורה כלל. */
  estimate_shown: {
    estimate_min: number;
    estimate_max: number;
    service_format: ServiceFormat;
  };

  /**
   * שליחה שאושרה על ידי השרת.
   *
   * **בלי `value` ובלי `currency`** (spec 02 §14.3). ערך לליד דורש רווח
   * גולמי לסועד וסיכוי סגירה אמיתי לכל טווח — נתונים שהבעלים לא מסר.
   * גזירת ערך מתעריפי המחשבון שנמחק הייתה גורמת ל־Smart Bidding להמר
   * כסף אמיתי נגד כלכלה מומצאת.
   */
  generate_lead: {
    lead_source: LeadSource;
    lead_ref: string;
    guest_band?: GuestBand;
    event_type?: string;
    branch_area?: string;
    service_format?: ServiceFormat | null;
    value?: never;
    currency?: never;
  };

  /** כל CTA של וואטסאפ */
  whatsapp_click: { wa_location: WaLocation; has_lead: boolean };

  /** openWhatsApp() — אחרי שהקליטה המקדימה נשלחה, לפני הניווט */
  whatsapp_handoff: { lead_ref: string; wa_location: WaLocation; branch?: Branch | null };

  /**
   * כל קליק על `tel:`.
   *
   * `is_business_hours` מגיע **מהשרת בלבד** ורק אם נמסרו שעות מאוישות.
   * שעון המכשיר אינו נאמן (spec 02 §3.6, כלל אזור הזמן), ושעות המענה הן
   * Slot ריק — לכן במצב ההשקה הפרמטר פשוט מושמט.
   */
  call_click: { call_location: string; is_business_hours?: boolean };

  /** באנר הטעימות — רק כששער §1.6 עובר */
  taste_intent: { source_page: string; branch?: Branch | null };

  /** קישור ההדפסה */
  menu_print: { source_page: string };

  /** שיתוף מתוך /summary */
  summary_share: { lead_ref: string; share_method: ShareMethod };

  /** כל קישור אל /kitchens/:slug */
  kitchen_page_click: { branch: Branch; source_page: string };

  /** כל קישור אל דף אירוע /catering/* */
  event_page_click: { target_route: string; source_page: string };
}

export type AnalyticsEventName = keyof AnalyticsEventMap;

/**
 * ארבעת אלה נורים **מהשרת בלבד**, דרך Measurement Protocol, מתוך שינוי
 * סטטוס במסך האדמין. הם מופיעים כאן כדי שאיש לא ינסה לירות אותם מהדפדפן
 * — הדפדפן אינו יודע מתי ליד הפך למאושר או לסגור.
 * זו גם הסיבה ש־`gaClientId` נשמר על שורת הליד.
 */
export const SERVER_SIDE_EVENTS = [
  "working_lead",
  "qualify_lead",
  "close_convert_lead",
  "close_unconvert_lead",
] as const;

/* ═══════════════════ הגשר לתג ═══════════════════ */

type GtagFn = (command: "event", name: string, params?: Record<string, unknown>) => void;

declare global {
  interface Window {
    gtag?: GtagFn;
    dataLayer?: unknown[];
  }
}

/** האם קיים תג מדידה טעון. במצב הנוכחי: false. */
export function analyticsReady(): boolean {
  return typeof window !== "undefined" && typeof window.gtag === "function";
}

/* ═══════════════════ ניקוי פרמטרים ═══════════════════ */

/**
 * GA4 חותך ערכי טקסט ב־100 תווים ומגביל ל־25 פרמטרים לאירוע. עדיף לחתוך
 * כאן, בצורה צפויה, מאשר לגלות בדוח ערך קטוע באמצע מילה עברית.
 */
function sanitiseParams(raw: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  let n = 0;
  for (const [k, v] of Object.entries(raw)) {
    if (v === undefined || v === null || v === "") continue;
    if (n >= 25) break;
    if (typeof v === "string") out[k] = v.slice(0, 100);
    else if (typeof v === "number") out[k] = Number.isFinite(v) ? v : 0;
    else if (typeof v === "boolean") out[k] = v;
    else continue;
    n++;
  }
  return out;
}

/* ═══════════════════ מאגר בדיקה ═══════════════════ */

const RECENT_LIMIT = 50;
const recent: Array<{ name: AnalyticsEventName; params: Record<string, unknown>; at: number }> = [];

/**
 * מה שנורה בסשן הנוכחי. משמש לבדיקת ידיים ולבדיקות אוטומטיות בזמן
 * שאין תג — לא נשלח לשום מקום ולא נשמר.
 */
export function recentEvents(): ReadonlyArray<{ name: string; params: Record<string, unknown>; at: number }> {
  return recent;
}

/* ═══════════════════ הפונקציה היחידה ═══════════════════ */

/**
 * שולחת אירוע. **לעולם לא זורקת ולעולם לא מחזירה promise.**
 *
 * בלי תג טעון זו פעולה ריקה. זה המצב הנוכחי והוא תקין — אין להוסיף
 * fallback שכותב ל־endpoint משלנו, ואין להזריק כאן סקריפט.
 */
export function track<K extends AnalyticsEventName>(
  name: K,
  params: AnalyticsEventMap[K],
): void {
  try {
    const clean = sanitiseParams(params as Record<string, unknown>);

    recent.push({ name, params: clean, at: Date.now() });
    if (recent.length > RECENT_LIMIT) recent.shift();

    if (import.meta.env?.DEV) {
      // eslint-disable-next-line no-console
      console.debug("[analytics]", name, clean);
    }

    if (typeof window === "undefined") return;
    const gtag = window.gtag;
    if (typeof gtag !== "function") return; /* אין תג — no-op, וזה בסדר */

    gtag("event", name, clean);
  } catch {
    /* מדידה לעולם לא מפילה אינטראקציה של משתמש */
  }
}
