/**
 * ═══════════════════════════════════════════════════════════════════════
 *  בנאי ההצעה — קונפיגורציה, אפשרויות ותוויות.
 * ═══════════════════════════════════════════════════════════════════════
 *
 * spec 02 §3. כל האפשרויות שהבנאי מציג יושבות כאן, במקום אחד, כדי שאפשר
 * יהיה לקרוא אותן בלי לקרוא את הקומפוננטה — וכדי שיהיה מקום אחד לבדוק
 * מולו שאין כאן עובדה עסקית.
 *
 * מה **אין** כאן, וזה מכוון:
 *   · אין מינימום ואין מקסימום סועדים. טווחי הסועדים הם חיתוך UX ואנליטיקה
 *     בלבד (spec 02 §2.7) — לא מינימום מפורסם, לא מקסימום ולא מדרגת מחיר.
 *   · אין אזורי חלוקה. האזורים מגיעים מ־SLOTS.servesAreas; כשהוא null
 *     המסך מתנוון לשדה עיר חופשי ואיננו מפרסמים שום קטצ'מנט (spec 02 §3.7).
 *   · אין מחיר, אין תעריף ואין ₪.
 */

import { BRANCHES, SLOTS, filled, type BranchId } from "@/content/business";
import { GUEST_BANDS, type GuestBand } from "@shared/lead-schema";

/* ═══════════════════ שלבים ═══════════════════ */

export const STEP_COUNT = 5;
export const QUESTION_COUNT = 4;

export type StepNumber = 1 | 2 | 3 | 4 | 5;

/** מזהי השלבים כפי ש־lib/analytics.ts מכיר אותם. */
export const STEP_ID_BY_NUMBER = {
  1: "event_type",
  2: "guests",
  3: "date",
  4: "area",
  5: "contact",
} as const;

/** השהיית הקידום האוטומטי אחרי בחירת צ'יפ. spec 02 §3.11. */
export const AUTO_ADVANCE_MS = 220;

/* ═══════════════════ מסך 1 · סוג האירוע ═══════════════════ */

export interface EventTypeOption {
  /** הערך הנשמר. עברית — כך הוא מגיע גם למסך של בעל העסק. */
  value: string;
  label: string;
  /**
   * דורש אישור קיבולת לאירוע פרטי במסעדה. spec 02 §3.2, §0.1 A5:
   * הצגת האפשרות היא מצג שהמסעדות מארחות אירועים פרטיים.
   */
  requiresPrivateEventCapacity?: true;
}

const EVENT_TYPE_OPTIONS: readonly EventTypeOption[] = [
  { value: "אירוע חברה", label: "אירוע חברה" },
  { value: "שמחה פרטית", label: "שמחה פרטית" },
  { value: "אירוח משפחתי או חג", label: "אירוח משפחתי או חג" },
  { value: "יום כיף או כנס", label: "יום כיף או כנס" },
  { value: "אירוח אצלנו במסעדה", label: "אירוח אצלנו במסעדה", requiresPrivateEventCapacity: true },
  { value: "משהו אחר", label: "משהו אחר" },
];

/**
 * `offerAtRestaurant` מגיע מהעמוד ולא מכאן, ומקורו היחיד הלגיטימי הוא
 * קיבולת אירוע פרטי שנמסרה לסניף כלשהו. ברירת המחדל היא false, ולכן
 * במצב ההשקה הצ'יפ פשוט אינו קיים והאתר אינו אומר דבר על אירוח.
 */
export function eventTypeOptions(offerAtRestaurant = false): EventTypeOption[] {
  return EVENT_TYPE_OPTIONS.filter(
    (o) => !o.requiresPrivateEventCapacity || offerAtRestaurant,
  );
}

export function isKnownEventType(v: string, offerAtRestaurant = false): boolean {
  return eventTypeOptions(offerAtRestaurant).some((o) => o.value === v);
}

/* ═══════════════════ מסך 2 · מספר סועדים ═══════════════════ */

/**
 * תוויות טווחי הסועדים.
 *
 * **בכוונה לא** `GUEST_BAND_LABELS` מ־shared/lead-schema.ts: הן מחברות
 * ספרות בקו מפריד (`25–50`), ובפסקה RTL הצירוף הזה נקרא `50–25`. על בורר
 * מספר סועדים זו הצהרה עסקית שגויה ולא באג ויזואלי. הצורה התקינה היא
 * מחבר עברי עם מקף U+05BE (spec 02 §3.3).
 */
export const GUEST_BAND_DISPLAY: Record<GuestBand, string> = {
  lt25: "עד 25",
  "25_50": "בין 25 ל־50",
  "50_100": "בין 50 ל־100",
  "100_200": "בין 100 ל־200",
  "200p": "200 ומעלה",
};

/** רצפת הטווח — משמשת רק להשוואה מול מינימום/מקסימום שנמסרו. */
export const GUEST_BAND_FLOOR: Record<GuestBand, number> = {
  lt25: 1,
  "25_50": 25,
  "50_100": 50,
  "100_200": 100,
  "200p": 200,
};

export const GUEST_BAND_CEILING: Record<GuestBand, number | null> = {
  lt25: 25,
  "25_50": 50,
  "50_100": 100,
  "100_200": 200,
  "200p": null,
};

export const guestBandOptions = (): readonly GuestBand[] => GUEST_BANDS;

/* ═══════════════════ פורמט שירות ═══════════════════ */

/**
 * תוויות תצוגה בלבד — שמות הדברים, לא הצהרה שהם מוצעים.
 *
 * הפורמט אינו נשאל בבנאי אלא נזרע מבחירת «תפריט שף» בסקשן 02, וסקשן 02
 * מרונדר אך ורק לפורמט ש־`offered === true` (spec 02 §3.4). כלומר תווית
 * מכאן מגיעה למסך רק אחרי שהמבקר בחר בפועל פורמט שהבעלים אישר.
 */
export const SERVICE_FORMAT_LABEL = {
  delivery: "מגשים — משלוח והנחה",
  buffet_on_site: "בופה במקום",
  plated_staffed: "מוגש בצלחות, עם צוות שלנו",
  at_restaurant: "אירוח אצלנו במסעדה",
} as const;

/* ═══════════════════ מסך 4 · אזור ═══════════════════ */

export interface AreaChip {
  label: string;
  branch: BranchId;
}

/**
 * האזורים מגיעים אך ורק מ־SLOTS.servesAreas. כשהוא null אין רשימה, ואז
 * המסך מציג שדה עיר חופשי בלי לנקוב בשם מטבח ובלי להבטיח שירות.
 * spec 02 §3.7 / §0.1 A3 — הגרסה הקודמת פרסמה כאן אזור חלוקה מומצא.
 */
export function areaChips(): AreaChip[] {
  const serves = SLOTS.servesAreas;
  if (!filled(serves)) return [];

  const seen = new Set<string>();
  const out: AreaChip[] = [];
  for (const branch of BRANCHES) {
    for (const area of serves[branch.id] ?? []) {
      const label = area.trim();
      if (!label || seen.has(label)) continue;
      seen.add(label);
      out.push({ label, branch: branch.id });
    }
  }
  return out;
}

/** צ'יפ קבוע שחושף את שדה הטקסט. לעולם אינו נוקב בשם מטבח. */
export const AREA_OTHER_LABEL = "אזור אחר";

export const BRANCH_NAME: Record<BranchId, string> = Object.fromEntries(
  BRANCHES.map((b) => [b.id, b.name]),
) as Record<BranchId, string>;

/**
 * שורת הניתוב מתחת לצ'יפ נבחר. מרונדרת **רק** כשיש כתובת לסניף —
 * בלי כתובת אין משפט, ולא ממציאים אחת. spec 02 §3.7.
 */
export function routingLine(branch: BranchId | null): string | null {
  if (!branch) return null;
  const addresses = SLOTS.addresses;
  if (!filled(addresses)) return null;
  const address = addresses[branch];
  if (!filled(address)) return null;
  return `המטבח שלנו ב${BRANCH_NAME[branch]} מבשל את האירוע הזה — ${address}.`;
}

/**
 * ניקוי שדה האזור החופשי לפני שהוא נכנס ל**טיוטה**.
 * הטיוטה חייבת להישאר נקייה ממידע אישי, וזה השדה החופשי היחיד בה: מבקר
 * שמקליד כתובת מלאה או מספר טלפון לא ייצור שורה אנונימית נושאת PII.
 * spec 02 §7.1. הסכימה בשרת דוחה ספרות ו־@ ממילא.
 */
export function sanitiseAreaForDraft(raw: string): string {
  return raw.replace(/[\d@]/g, "").replace(/\s+/g, " ").trim().slice(0, 60);
}

/* ═══════════════════ מגבלות סועדים — רק אם נמסרו ═══════════════════ */

/**
 * spec 02 §2.5 / §2.6. שתי ההודעות מרונדרות אך ורק כשהבעלים מסר מספר.
 * בלי מספר — אין הודעה, ואף טווח אינו נחשב קטן מדי או גדול מדי.
 * הליד נקלט בכל מקרה.
 */
export function guestBandNote(band: GuestBand | null): string | null {
  if (!band) return null;

  const min = SLOTS.minGuests;
  if (filled(min) && GUEST_BAND_FLOOR[band] < min) {
    return (
      `מתחת ל־${min} סועדים קייטרינג מלא פשוט לא משתלם לכם. ` +
      `נשמח להציע מגשי אירוח מהמסעדה — זה יוצא מאותו מטבח.`
    );
  }

  const max = SLOTS.maxGuests;
  if (filled(max) && GUEST_BAND_FLOOR[band] > max) {
    return (
      `${max} סועדים זה הרף שאנחנו מרימים בשלושת המטבחים יחד. ` +
      `מעל זה — דברו איתנו, נגיד לכם ישר אם זה אפשרי.`
    );
  }

  return null;
}

/* ═══════════════════ נוסחי מסך ═══════════════════ */

export const COPY = {
  heading: "התפריט שלכם",
  sectionNum: "05",

  legend1: "איזה אירוע?",
  legend2: "כמה סועדים, בערך?",
  hint2: "אפשר לשנות אחר כך — אנחנו יודעים שהמספר הסופי מתגבש ברגע האחרון.",
  legend3: "מתי?",
  hint3: "אם זה בימים הקרובים — כתבו. יש לנו שלושה מטבחים, לפעמים זה מסתדר.",
  dateLabel: "תאריך האירוע",
  dateUnknown: "התאריך עוד לא נקבע",
  legend4: "איפה האירוע?",
  areaFreeLabel: "עיר האירוע",
  areaFreeHint: "נבדוק הובלה ונגיד לכם ישר, לפני שתשקיעו בזה זמן.",
  legend5: "לאן נחזור אליכם?",

  next: "הלאה",
  back: "→ חזרה",
  submit: "שלחו לי הצעה",
  submitWa: "עדיף לי בוואטסאפ",
  restart: "להתחיל מחדש",
  resumed: "המשכנו מאיפה שעצרתם.",

  nameLabel: "שם",
  phoneLabel: "טלפון",
  emailLabel: "אימייל",
  emailReveal: "הצעה כתובה לשלוח למישהו נוסף?",
  channelLegend: "איך נוח לכם?",
  channelWa: "וואטסאפ",
  channelPhone: "שיחה",

  /* spec 02 §3.8 — ניתן לאכיפה בעיצוב, בניגוד להצהרה שלא נאסוף קטינים. */
  ageAndMedicalNotice:
    "הטופס מיועד לבני 18 ומעלה. אין למסור כאן מידע רפואי או פרטים של אנשים אחרים.",
} as const;

/** spec 02 §3.11 · spec 03 §10.9 — נוסחי השגיאה, מילה במילה. */
export const ERRORS = {
  eventType: "בחרו סוג אירוע כדי להמשיך.",
  guestBand: "בחרו מספר סועדים משוער.",
  area: "כתבו איפה האירוע כדי שנדע איזה מטבח מבשל.",
  name: "צריך שם, כדי שנדע למי לחזור.",
  phone: "המספר לא נראה תקין — בדקו שוב.",
  email: "כתובת המייל לא נראית תקינה.",
  date: "התאריך לא נראה תקין — יום, חודש ושנה.",
} as const;

/**
 * גרסאות הנוסח. נשמרות על שורת הליד כדי שיהיה אפשר להוכיח שנה אחר כך
 * מה בדיוק הוצג למי שסימן את תיבת ההסכמה. spec 02 §3.9.
 * **לעדכן בכל שינוי מילה בנוסח המתאים.**
 */
export const NOTICE_VERSION = "collection-2026-07-a";
export const CONSENT_TEXT_VERSION = "marketing-2026-07-a";
