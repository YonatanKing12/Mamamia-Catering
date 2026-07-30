/**
 * ═══════════════════════════════════════════════════════════════════════
 *  הסניפים — נתוני המקום. spec 01 §6.1.
 * ═══════════════════════════════════════════════════════════════════════
 *
 * `business.ts` מחזיק את מה שמאומת על העסק כולו: הטלפון, השם המשפטי,
 * ושלושת שמות הסניפים. הקובץ הזה מחזיק את מה שנכון **לסניף** — כתובת,
 * שעות, אזור חלוקה, שף, איסוף עצמי, קיבולת לאירוע פרטי, נגישות פיזית,
 * וקישור לתפריט המסעדה החי ולפרופיל Google.
 *
 * שלושה כללים מחזיקים אותו:
 *
 *   1. **שמות הסניפים אינם נכתבים כאן.** הם מיובאים מ־`business.ts`
 *      ומיוצאים מחדש. שני מקומות שבהם כתוב «רעננה» הם שני מקומות
 *      שיכולים להיפרד; מזהה סניף חדש בעסק יישבר כאן בקומפילציה, וזה
 *      בדיוק מה שצריך לקרות.
 *
 *   2. **כל שדה תפעולי הוא `Slot` והוא `null` היום.** קומפוננטה
 *      שנתקלת ב־null משמיטה את מה שהיא הייתה מציגה. אין ברירת מחדל,
 *      אין «צור קשר לפרטים», ואין תא ריק בטבלה. שלושת דפי הסניף חייבים
 *      להיראות מכוונים ושלמים כשכל המשבצות ריקות — זה המצב היום.
 *
 *   3. **אין כאן העתק של עובדה שכבר יושבת ב־`business.ts`.** כתובת,
 *      שעות, אזורים ושפים קיימים שם כ־Slots שטוחים לכל העסק. הבוררים
 *      כאן קוראים משם כשאין להם צורה מובנית משלהם — כך שיש מקור אחד
 *      לכל עובדה גם כשיש לה שתי צורות ייצוג.
 *
 * ─────────────────────────────────────────────────────────────────────
 *  היכן זה יושב
 * ─────────────────────────────────────────────────────────────────────
 * spec 01 §6.1 קורא לקובץ `client/src/data/locations.ts`, ודוח הביקורת
 * (D3) מבקש להעביר אותו ל־`shared/` כדי שהשרת יוכל לייבא אותו ל־JSON-LD
 * ולניתוב אזור→סניף. הקובץ נכתב בהתאם: **אין בו React, אין JSX, ואין
 * ייבוא מ־`client/`** מלבד `content/business.ts`. העברה ל־`shared/`
 * היא הזזת שני קבצים ותיקון נתיבי ייבוא, לא כתיבה מחדש.
 */

import { BRANCHES, PHONE, SLOTS, filled, type BranchId, type Slot } from "@/content/business";

export { BRANCHES, filled } from "@/content/business";
export type { BranchId, Slot } from "@/content/business";

/* ═══════════════════ מזהים ═══════════════════ */

/** `herzliya_pituach` → `herzliya-pituach`. נגזר מהמזהה, לא נכתב ביד. */
type Dashed<S extends string> = S extends `${infer A}_${infer B}` ? `${A}-${Dashed<B>}` : S;

/** ה־slug של הסניף בכתובת — `/kitchens/{slug}`. spec 01 §1. */
export type BranchSlug = Dashed<BranchId>;

/**
 * גזירה זהה יושבת ב־`lib/seo.ts` (`branchSlug`). שתיהן נגזרות מ־`BranchId`
 * ואף אחת מהן אינה מחזיקה טבלת slugs כתובה ביד, ולכן מקור האמת נשאר
 * `BRANCHES`. אם ה־SEO וה־תוכן יאוחדו — זו הפונקציה שנשארת.
 */
export const branchSlug = (id: BranchId): BranchSlug => id.replace(/_/g, "-") as BranchSlug;

/* ═══════════════════ טיפוסי המשבצות ═══════════════════ */

/** שמות ימים באנגלית — הצורה היחידה ש־schema.org מקבל. */
export type Weekday =
  | "Sunday"
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday";

/**
 * שורת שעות. `labelHe` היא מה שנקרא על המסך, `dayOfWeek` היא מה שנפלט
 * ל־`openingHoursSpecification`. מחרוזת עברית חופשית אינה תקפה ב־JSON-LD
 * (`lib/seo.ts` מתעד זאת), ולכן השורה נושאת את שתי הצורות או אינה קיימת.
 */
export interface OpeningHoursRow {
  labelHe: string;
  dayOfWeek: Weekday[];
  /** `HH:MM`, 24 שעות. */
  opens: string;
  closes: string;
}

/** כתובת מובנית. `street` לבדו אינו כתובת — העיר מגיעה מהסניף. */
export interface PostalAddressHe {
  streetHe: string;
  postalCode?: Slot<string>;
}

/**
 * שף או מנהל מטבח.
 *
 * `consent === false` ⇒ השם אינו מרונדר בשום מקום, כולל ב־JSON-LD
 * (spec 01 §6.1). זו הסיבה שהשדה הזה אינו נקרא מ־`SLOTS.chefs`: שם
 * יושב שם בלי רשומת הסכמה, ושם של עובד אינו מתפרסם על סמך היעדר סירוב.
 */
export interface BranchChef {
  nameHe: string;
  roleHe: Slot<string>;
  /** הסכמה מפורשת לפרסום השם באתר. בלעדיה אין רינדור. */
  consent: boolean;
}

/** איסוף עצמי מהמטבח. */
export interface BranchPickup {
  offered: boolean;
  /** מינימום להזמנת איסוף — כלשון הבעלים. התחייבות מסחרית. */
  minimumHe: Slot<string>;
  hoursHe: Slot<string>;
  /** היכן עוצרים, האם יש פריקה, וכמה זמן. */
  loadingHe: Slot<string>;
}

/** יישוב שהמטבח הזה משרת בפועל. לא לנחש לפי מרחק. */
export interface ServedArea {
  cityHe: string;
  driveMinutes: Slot<number>;
  /** מינימום ודמי הובלה — כלשון הבעלים, אם נמסרו. */
  minimumHe: Slot<string>;
  deliveryFeeHe: Slot<string>;
}

/**
 * קיבולת לאירוע פרטי במסעדה.
 *
 * spec 01 P-09: עצם הצגת «אירוח אצלנו במסעדה» היא מצג שהמסעדות מארחות
 * אירועים פרטיים. כל עוד אין כאן ולו סניף אחד מלא — הפורמט השלישי אינו
 * מרונדר, הצ׳יפ בבנאי אינו קיים, ושום דבר באתר אינו רומז על השכרת מקום.
 */
export interface PrivateEventCapacity {
  seated: Slot<number>;
  standing: Slot<number>;
  /** האם ניתן לסגור את המקום לאירוע. */
  canClose: Slot<boolean>;
  parkingHe: Slot<string>;
  accessible: Slot<boolean>;
}

/**
 * נגישות פיזית לסניף.
 *
 * תקנות שוויון זכויות מחייבות שהצהרת הנגישות תתאר את המצב **בפועל**.
 * כל שדה כאן הוא תיאור שנמסר, לא הבטחה שהורכבה. ריק ⇒ הצהרת הנגישות
 * אינה אומרת דבר על הסניף הזה, וזו התשובה הנכונה.
 */
export interface BranchAccessibility {
  parkingHe: Slot<string>;
  entranceHe: Slot<string>;
  toiletHe: Slot<string>;
  seatingHe: Slot<string>;
  liftHe: Slot<string>;
}

/** טלפון סניפי, אם קיים כזה בנפרד מהמספר המרכזי. */
export interface BranchPhone {
  display: string;
  tel: string;
  wa: string;
}

/* ═══════════════════ המשבצות לכל סניף ═══════════════════ */

/**
 * כל מה שאינו מאומת. כל שדה `null`, וזה המצב התקין.
 * כשממלאים שדה — למחוק את ה־TODO ולציין מקור ותאריך, כמו ב־`PHONE`.
 */
export interface BranchDetail {
  /** TODO(owner): רחוב ומספר, ומיקוד אם ידוע. */
  address: Slot<PostalAddressHe>;

  /** TODO(owner): קואורדינטות מדויקות של הכניסה, לא של מרכז העיר. */
  geo: Slot<{ lat: number; lng: number }>;

  /** TODO(owner): טלפון ישיר לסניף. `null` ⇒ המספר המרכזי, דרך `phoneFor()`. */
  phone: Slot<BranchPhone>;

  /** TODO(owner): שעות פעילות המטבח. */
  hours: Slot<OpeningHoursRow[]>;

  /** TODO(owner): השעות שבהן פניית קייטרינג נענית — עשויות להיות אחרות. */
  answeringHoursHe: Slot<string>;

  /** TODO(owner): שם ותפקיד + הסכמה מפורשת לפרסום. בלי הסכמה אין שם. */
  chef: Slot<BranchChef>;

  /** TODO(owner): האם יש איסוף עצמי, ובאילו תנאים. */
  pickup: Slot<BranchPickup>;

  /** TODO(owner): הערים שהמטבח הזה משרת בפועל, וזמני נסיעה. */
  servesAreas: Slot<ServedArea[]>;

  /** TODO(owner): כמה האירועים שהמטבח הזה מייצר ביום, כלשון הבעלים. */
  capacityPerDayHe: Slot<string>;

  /** TODO(owner): קיבולת אירוע פרטי במסעדה. שער הפורמט השלישי. */
  privateEventCapacity: Slot<PrivateEventCapacity>;

  /** TODO(owner): קישור לתפריט המסעדה החי של הסניף. מזין את סימן «היום». */
  liveMenuUrl: Slot<string>;

  /** TODO(owner): כתובת פרופיל Google של הסניף. נכנסת ל־`sameAs`. */
  gbpUrl: Slot<string>;

  /** TODO(owner): נגישות פיזית — כפי שהיא, לא כפי שהיינו רוצים. */
  accessibility: Slot<BranchAccessibility>;

  /** TODO(owner): למה הסניף הזה מתאים באמת. משפט אחד, כלשון הבעלים. */
  bestSuitedForHe: Slot<string>;

  /**
   * TODO(owner): נוסח הכשרות **כלשונו**, בכתב, כולל שם הגוף המכשיר המלא.
   *
   * זה אינו העתק של `SLOTS.kashrutByBranch`. שם יושבת התשובה הכללית
   * שנמסרה בעל־פה («כשר בד״ץ»), ו־`business.ts` מתעד שני פערים פתוחים
   * בה: איזה בד״ץ, והאם על שלושת הסניפים. הנוסח כאן הוא המחרוזת
   * **היחידה** שמותר לה להופיע כטענת כשרות בדף (spec 01 P-10), והוא
   * גם מה שפותח את השער הקשיח של `/catering/shiva` (P-11). כל עוד הוא
   * `null` — אין נוסח, ואין דף שבעה.
   */
  kashrutStatementHe: Slot<string>;
}

/** סניף שלם: הזהות המאומתת מ־`business.ts` + המשבצות שטרם מולאו. */
export interface BranchLocation extends BranchDetail {
  id: BranchId;
  slug: BranchSlug;
  /** מ־`BRANCHES`. מאומת. */
  nameHe: string;
  /** היישוב. זהה לשם הסניף, מאותו מקור מאומת. */
  cityHe: string;
  isFlagship: boolean;
}

const emptyDetail = (): BranchDetail => ({
  address: null,
  geo: null,
  phone: null,
  hours: null,
  answeringHoursHe: null,
  chef: null,
  pickup: null,
  servesAreas: null,
  capacityPerDayHe: null,
  privateEventCapacity: null,
  liveMenuUrl: null,
  gbpUrl: null,
  accessibility: null,
  bestSuitedForHe: null,
  kashrutStatementHe: null,
});

/**
 * המצב היום: שלושה סניפים מאומתים, אפס פרטים תפעוליים.
 *
 * כשמגיע מידע על סניף — מחליפים את `emptyDetail()` שלו באובייקט מפורש
 * ומשאירים את השאר כפי שהוא. אין למלא סניף אחד «לפי» סניף אחר, וגם לא
 * להסיק שעות של רעננה משעות הרצליה.
 */
const DETAIL: Record<BranchId, BranchDetail> = {
  herzliya_pituach: emptyDetail(),
  raanana: emptyDetail(),
  petah_tikva: emptyDetail(),
};

/** שלושת הסניפים, בסדר שנקבע ב־`business.ts` — הדגל ראשון. */
export const LOCATIONS: readonly BranchLocation[] = BRANCHES.map((b) => ({
  id: b.id,
  slug: branchSlug(b.id),
  nameHe: b.name,
  cityHe: b.name,
  isFlagship: b.isFlagship,
  ...DETAIL[b.id],
}));

const BY_ID = new Map<string, BranchLocation>(LOCATIONS.map((l) => [l.id, l]));
const BY_SLUG = new Map<string, BranchLocation>(LOCATIONS.map((l) => [l.slug, l]));

export const locationById = (id: BranchId): BranchLocation => BY_ID.get(id)!;

/** מחזיר `null` ל־slug שאינו אחד משלושת הסניפים — מזין 404 אמיתי. */
export const locationBySlug = (slug: string): BranchLocation | null => BY_SLUG.get(slug) ?? null;

/* ═══════════════════ בוררים ═══════════════════ */
/*
 * לכל עובדה בורר אחד, והוא מחזיר `null` כשאין מה להציג. הדף שואל את
 * הבורר ולא את השדה, כדי שהכלל «יש צורה מובנית? קח אותה. אין? קח את
 * ה־Slot השטוח מ־business.ts» ייכתב פעם אחת ולא בשלושה דפים.
 */

const flat = <T,>(rec: Slot<Record<BranchId, T>>, id: BranchId): T | null =>
  filled(rec) && filled(rec[id]) ? rec[id] : null;

/** שורת כתובת להצגה. מובנית אם יש, אחרת מ־`SLOTS.addresses`. */
export function addressLineFor(id: BranchId): string | null {
  const structured = locationById(id).address;
  if (filled(structured) && filled(structured.streetHe)) {
    return `${structured.streetHe}, ${locationById(id).cityHe}`;
  }
  return flat(SLOTS.addresses, id);
}

/** כתובת ל־JSON-LD. דורשת רחוב מובנה — שורת טקסט חופשי אינה `PostalAddress`. */
export function postalAddressFor(
  id: BranchId,
): { streetAddress: string; addressLocality: string; postalCode?: string } | null {
  const a = locationById(id).address;
  if (!filled(a) || !filled(a.streetHe)) return null;
  return {
    streetAddress: a.streetHe,
    addressLocality: locationById(id).cityHe,
    ...(filled(a.postalCode) ? { postalCode: a.postalCode } : {}),
  };
}

/**
 * שעות. `rows` להצגה מובנית ול־JSON-LD, `textHe` לנפילה אחורה על
 * המחרוזת החופשית שב־`business.ts`. שניהם ריקים ⇒ `null`, והבלוק נעלם.
 */
export function hoursFor(
  id: BranchId,
): { rows: OpeningHoursRow[] | null; textHe: string | null } | null {
  const rows = locationById(id).hours;
  const structured = filled(rows) && rows.length > 0 ? rows : null;
  const textHe = flat(SLOTS.openingHours, id);
  if (!structured && !textHe) return null;
  return { rows: structured, textHe };
}

/** שעות מענה לפניות קייטרינג. `null` ⇒ אין הבטחה על שעות. */
export const answeringHoursFor = (id: BranchId): string | null => {
  const v = locationById(id).answeringHoursHe;
  return filled(v) ? v : filled(SLOTS.staffedHours) ? SLOTS.staffedHours : null;
};

/** אזורי חלוקה. מובנה אם יש, אחרת שמות ערים בלבד מ־`SLOTS.servesAreas`. */
export function servedAreasFor(id: BranchId): ServedArea[] | null {
  const structured = locationById(id).servesAreas;
  if (filled(structured) && structured.length > 0) return structured;

  const names = flat(SLOTS.servesAreas, id);
  if (!names || names.length === 0) return null;
  return names.map((cityHe) => ({
    cityHe,
    driveMinutes: null,
    minimumHe: null,
    deliveryFeeHe: null,
  }));
}

/**
 * שם השף — **רק** בהסכמה מפורשת.
 *
 * `SLOTS.chefs` אינו נקרא כאן במכוון: הוא מחזיק שם בלי רשומת הסכמה,
 * ושם של עובד אינו מתפרסם בהיעדר סירוב. סניף שיש לו שם שם ואין לו
 * רשומה כאן — לא יציג שף, וזו התנהגות תקינה.
 */
export function chefFor(id: BranchId): BranchChef | null {
  const chef = locationById(id).chef;
  if (!filled(chef) || !filled(chef.nameHe) || chef.consent !== true) return null;
  return chef;
}

export function pickupFor(id: BranchId): BranchPickup | null {
  const p = locationById(id).pickup;
  return filled(p) && p.offered === true ? p : null;
}

export function privateEventCapacityFor(id: BranchId): PrivateEventCapacity | null {
  const c = locationById(id).privateEventCapacity;
  if (!filled(c)) return null;
  const hasAny =
    filled(c.seated) || filled(c.standing) || c.canClose === true || filled(c.parkingHe);
  return hasAny ? c : null;
}

/**
 * שער «אירוח אצלנו במסעדה» (spec 01 P-09, 02 §3.4).
 * מזין גם את `offerAtRestaurant` בבנאי ההצעה.
 */
export const anyPrivateEventCapacity = (): boolean =>
  LOCATIONS.some((l) => privateEventCapacityFor(l.id) !== null);

/** הסניפים שיש להם קיבולת — כדי שהשורה תנקוב בהם בשמם ולא תדבר בכללי. */
export const branchesWithPrivateEvents = (): BranchLocation[] =>
  LOCATIONS.filter((l) => privateEventCapacityFor(l.id) !== null);

export function accessibilityFor(id: BranchId): BranchAccessibility | null {
  const a = locationById(id).accessibility;
  if (!filled(a)) return null;
  const hasAny = [a.parkingHe, a.entranceHe, a.toiletHe, a.seatingHe, a.liftHe].some(filled);
  return hasAny ? a : null;
}

/** תפריט המסעדה החי. בלעדיו סימן «מוגש היום ב…» אינו נכתב (spec 01 §3.2). */
export const liveMenuUrlFor = (id: BranchId): string | null => {
  const v = locationById(id).liveMenuUrl;
  return filled(v) ? v : null;
};

export const gbpUrlFor = (id: BranchId): string | null => {
  const v = locationById(id).gbpUrl;
  return filled(v) ? v : null;
};

export const capacityPerDayFor = (id: BranchId): string | null => {
  const v = locationById(id).capacityPerDayHe;
  return filled(v) ? v : null;
};

export const bestSuitedForFor = (id: BranchId): string | null => {
  const v = locationById(id).bestSuitedForHe;
  return filled(v) ? v : null;
};

/**
 * נוסח הכשרות של הסניף, כלשון הבעלים.
 * **אין כאן נפילה אחורה על `SLOTS.kashrutByBranch`**: התשובה הכללית
 * שנמסרה בעל־פה אינה נוסח בכתב, והשער של P-11 נשען על ההבחנה הזאת.
 */
export const kashrutStatementFor = (id: BranchId): string | null => {
  const v = locationById(id).kashrutStatementHe;
  return filled(v) ? v : null;
};

/** האם קיים נוסח כשרות בכתב לכל שלושת הסניפים. שער `/catering/shiva`. */
export const kashrutStatementComplete = (): boolean =>
  LOCATIONS.every((l) => kashrutStatementFor(l.id) !== null);

/** טלפון הסניף אם נמסר, אחרת המספר המרכזי. לעולם לא מספר קשיח בקומפוננטה. */
export const phoneFor = (id: BranchId): BranchPhone => {
  const p = locationById(id).phone;
  return filled(p) ? p : PHONE;
};

/**
 * ניתוב עיר → מטבח. מזין את שורת הניתוב בבנאי ואת שיוך הליד בשרת.
 * התאמה מדויקת בלבד — «כפר סבא» אינה «כפר סבא, שכונה» ואיננו מנחשים.
 */
export function branchForArea(cityHe: string): BranchId | null {
  const needle = cityHe.trim();
  if (!needle) return null;
  for (const l of LOCATIONS) {
    const areas = servedAreasFor(l.id);
    if (areas?.some((a) => a.cityHe.trim() === needle)) return l.id;
  }
  return null;
}

/* ═══════════════════ שערי רינדור ═══════════════════ */

/**
 * המשבצות שדף הסניף בונה מהן את גיליון הייצור (spec 01 P-04 `BranchFacts`).
 * הסדר הוא סדר ההצגה. שורה בלי ערך אינה מרונדרת.
 */
export const BRANCH_FACT_KEYS = [
  "address",
  "hours",
  "chef",
  "pickup",
  "servesAreas",
  "capacityPerDay",
  "accessibility",
] as const;

export type BranchFactKey = (typeof BRANCH_FACT_KEYS)[number];

/** תוויות שדה — לא קופי. הקופי של הדף יושב בדף. */
export const BRANCH_FACT_LABEL_HE: Record<BranchFactKey, string> = {
  address: "כתובת",
  hours: "שעות המטבח",
  chef: "מי מנהל",
  pickup: "איסוף עצמי",
  servesAreas: "אזור חלוקה",
  capacityPerDay: "קיבולת ליום",
  accessibility: "נגישות",
};

/** אילו שורות עובדה יש לסניף בפועל. ריק ⇒ `BranchFacts` אינו מרונדר. */
export function filledFactKeys(id: BranchId): BranchFactKey[] {
  const has: Record<BranchFactKey, boolean> = {
    address: addressLineFor(id) !== null,
    hours: hoursFor(id) !== null,
    chef: chefFor(id) !== null,
    pickup: pickupFor(id) !== null,
    servesAreas: servedAreasFor(id) !== null,
    capacityPerDay: capacityPerDayFor(id) !== null,
    accessibility: accessibilityFor(id) !== null,
  };
  return BRANCH_FACT_KEYS.filter((k) => has[k]);
}

export const hasAnyFacts = (id: BranchId): boolean => filledFactKeys(id).length > 0;

/**
 * spec 01 P-04: דף סניף לא ישוחרר עם פחות משבע עובדות ייחודיות מלאות.
 * הפונקציה אינה חוסמת רינדור — היא מה שהבדיקה ומסך הבעלים שואלים.
 * היום היא מחזירה 0 לכל סניף, וזה הדיווח הנכון.
 */
export const uniqueFactCount = (id: BranchId): number => {
  const l = locationById(id);
  return [
    postalAddressFor(id) !== null,
    filled(l.geo),
    filled(l.phone),
    hoursFor(id) !== null,
    chefFor(id) !== null,
    pickupFor(id) !== null,
    servedAreasFor(id) !== null,
    capacityPerDayFor(id) !== null,
    gbpUrlFor(id) !== null,
    accessibilityFor(id) !== null,
    bestSuitedForFor(id) !== null,
    liveMenuUrlFor(id) !== null,
  ].filter(Boolean).length;
};

export const BRANCH_PAGE_MIN_UNIQUE_FACTS = 7;
