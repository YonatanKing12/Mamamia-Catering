/**
 * ═══════════════════════════════════════════════════════════════════════
 *  המסעדות — הקשר מותג. והקייטרינג — אזור השירות שלו, בנפרד.
 * ═══════════════════════════════════════════════════════════════════════
 *
 * הקובץ הזה מחזיק **שני דברים שאסור לערבב**, וכל המבנה שלו נועד למנוע
 * את הערבוב הזה:
 *
 *   1. `RESTAURANTS` — שלוש המסעדות. כתובת, שעות, שף, תפריט חי, פרופיל
 *      Google. אלה עובדות על **מסעדה שפועלת לקהל הרחב**, והן הקשר מותג.
 *   2. `CATERING_SERVICE_AREA` — לאן הקייטרינג מגיע. עובדה **נפרדת**,
 *      שאינה נגזרת ואינה ניתנת לגזירה משלוש הנקודות שלמעלה.
 *
 * ─────────────────────────────────────────────────────────────────────
 *  למה ההפרדה הזאת היא כל הקובץ
 * ─────────────────────────────────────────────────────────────────────
 * הקייטרינג מבושל במטבח של **אחת** מהמסעדות (`business.ts`, מקטע המיצוב).
 * איזו — לא נמסר, ולכן `SLOTS.cateringKitchenBranch` הוא `null`.
 *
 * מכאן נובע כלל שאין ממנו חריגה: **אזור שירות אינו נגזר ממיקומי המסעדות.**
 * מפה עם שלוש נעצים ורדיוס סביבן היא ניחוש שנראה כמו נתון. אם המטבח
 * המבשל הוא בפתח תקווה, «רדיוס סביב הרצליה פיתוח» הוא הבטחת חלוקה שאין
 * מאחוריה כלום; ואם הוא בהרצליה — הוא עדיין לא מחויב לכל מה שנמצא בטווח
 * נסיעה ממנו. לכן הגרסה הקודמת של הקובץ, שהחזיקה `servesAreas` לכל סניף
 * ופונקציית ניתוב `branchForArea(city)` שהמירה עיר למטבח, נמחקה. אין
 * תחליף לה עד שהלקוח ימסור אזור חלוקה בפועל, ואז הוא ייכנס למשבצת אחת.
 *
 * מכאן נובע גם מה שאין כאן: **אין דפי סניף.** הגרסה הקודמת ייצרה
 * ‎`/kitchens/{slug}` לשלוש המסעדות והחזיקה מנגנון slugs, ספירת «עובדות
 * ייחודיות» וסף שחרור לכל דף. שלושה דפי מטבח הם בדיוק הטענה שנדחתה —
 * הם מציגים רשת קייטרינג בת שלושה מטבחים. המודול הזה משרת היום את דף
 * ‎`/kitchen` **היחיד** ואת הפוטר, ותו לא.
 *
 * ─────────────────────────────────────────────────────────────────────
 *  שלושה כללים
 * ─────────────────────────────────────────────────────────────────────
 *   · **שמות המסעדות אינם נכתבים כאן.** הם מיובאים מ־`business.ts`
 *     ומיוצאים מחדש. שני מקומות שבהם כתוב «רעננה» הם שני מקומות שיכולים
 *     להיפרד; שינוי ב־`BRANCHES` נשבר כאן בקומפילציה, וזה מה שצריך לקרות.
 *   · **כל שדה תפעולי הוא `Slot`, וכולם `null` היום.** קומפוננטה שנתקלת
 *     ב־null משמיטה את מה שהיא הייתה מציגה. אין ברירת מחדל, אין
 *     «צור קשר לפרטים», ואין תא ריק בטבלה.
 *   · **אין React ואין JSX כאן**, ואין ייבוא מ־`client/` מלבד מודולי
 *     ‎`content/`. אם הקובץ יעבור ל־`shared/` כדי שהשרת יבנה ממנו JSON-LD,
 *     זו הזזת קובץ ותיקון נתיב — לא כתיבה מחדש.
 */

import { BRANCHES, PHONE, SLOTS, filled, type BranchId, type Slot } from "@/content/business";

export { BRANCHES, filled } from "@/content/business";
export type { BranchId, Slot } from "@/content/business";

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
 * ל־`openingHoursSpecification`. מחרוזת עברית חופשית אינה תקפה ב־JSON-LD,
 * ולכן השורה נושאת את שתי הצורות או אינה קיימת.
 *
 * שעות אלה הן **שעות המסעדה**. הן אינן שעות מענה לפניות קייטרינג ואינן
 * חלון חלוקה, ואין לרנדר אותן במשמעות הזאת.
 */
export interface OpeningHoursRow {
  labelHe: string;
  dayOfWeek: Weekday[];
  /** `HH:MM`, 24 שעות. */
  opens: string;
  closes: string;
}

/** כתובת מובנית. `streetHe` לבדו אינו כתובת — העיר מגיעה מהמסעדה. */
export interface PostalAddressHe {
  streetHe: string;
  postalCode?: Slot<string>;
}

/**
 * שף או מנהל מטבח.
 *
 * `consent === false` ⇒ השם אינו מרונדר בשום מקום, כולל ב־JSON-LD.
 * זו הסיבה שהשדה הזה אינו נקרא מ־`SLOTS.chefs`: שם יושב שם בלי רשומת
 * הסכמה, ושם של עובד אינו מתפרסם על סמך היעדר סירוב.
 */
export interface RestaurantChef {
  nameHe: string;
  roleHe: Slot<string>;
  /** הסכמה מפורשת לפרסום השם באתר. בלעדיה אין רינדור. */
  consent: boolean;
}

/**
 * קיבולת לאירוע פרטי **במסעדה**.
 *
 * זו עובדה על המסעדה, לא על הקייטרינג. עצם הצגתה היא מצג שהמסעדה מארחת
 * אירועים פרטיים; כל עוד אין כאן ולו מסעדה אחת מלאה — פורמט ההגשה
 * `at_restaurant` נשמט לגמרי, הצ׳יפ המקביל בבנאי אינו קיים, ושום דבר
 * באתר אינו רומז על השכרת מקום. (spec 01 P-09)
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
 * נגישות פיזית למסעדה.
 *
 * תקנות שוויון זכויות מחייבות שהצהרת הנגישות תתאר את המצב **בפועל**.
 * כל שדה כאן הוא תיאור שנמסר, לא הבטחה שהורכבה. ריק ⇒ הצהרת הנגישות
 * אינה אומרת דבר על המסעדה הזאת, וזו התשובה הנכונה.
 */
export interface RestaurantAccessibility {
  parkingHe: Slot<string>;
  entranceHe: Slot<string>;
  toiletHe: Slot<string>;
  seatingHe: Slot<string>;
  liftHe: Slot<string>;
}

/** טלפון מסעדתי, אם קיים כזה בנפרד מהמספר המרכזי. */
export interface RestaurantPhone {
  display: string;
  tel: string;
  wa: string;
}

/* ═══════════════════ המשבצות לכל מסעדה ═══════════════════ */

/**
 * כל מה שאינו מאומת. כל שדה `null`, וזה המצב התקין.
 * כשממלאים שדה — למחוק את ה־TODO ולציין מקור ותאריך, כמו ב־`PHONE`.
 *
 * שימו לב למה שאין ברשימה הזאת, ולמה: **אזור חלוקה, מינימום הזמנה,
 * קיבולת ליום ואיסוף עצמי אינם שדות של מסעדה.** הם שדות של מערך
 * הקייטרינג, שיוצא ממטבח אחד שזהותו אינה ידועה, ולכן הם יושבים במקטע
 * `CATERING_*` שלמטה — במשבצת אחת ולא בשלוש.
 */
export interface RestaurantDetail {
  /** TODO(owner): רחוב ומספר, ומיקוד אם ידוע. */
  address: Slot<PostalAddressHe>;

  /** TODO(owner): קואורדינטות מדויקות של הכניסה, לא של מרכז העיר. */
  geo: Slot<{ lat: number; lng: number }>;

  /** TODO(owner): טלפון ישיר למסעדה. `null` ⇒ המספר המרכזי, דרך `phoneFor()`. */
  phone: Slot<RestaurantPhone>;

  /** TODO(owner): שעות פעילות המסעדה לקהל. לא שעות מענה לקייטרינג. */
  hours: Slot<OpeningHoursRow[]>;

  /** TODO(owner): שם ותפקיד + הסכמה מפורשת לפרסום. בלי הסכמה אין שם. */
  chef: Slot<RestaurantChef>;

  /** TODO(owner): קיבולת אירוע פרטי במסעדה. שער הפורמט `at_restaurant`. */
  privateEventCapacity: Slot<PrivateEventCapacity>;

  /**
   * TODO(owner): קישור לתפריט המסעדה החי.
   *
   * זה הנכס היחיד כאן שמוכיח את המיצוב במקום לטעון אותו: תפריט חי של
   * מסעדה שמגישה לסועדים היום. בלעדיו אין לכתוב שום סימן «מוגש היום
   * במסעדה», וגם לא גרסה מרוככת שלו.
   */
  liveMenuUrl: Slot<string>;

  /** TODO(owner): כתובת פרופיל Google של המסעדה. נכנסת ל־`sameAs`. */
  gbpUrl: Slot<string>;

  /** TODO(owner): נגישות פיזית — כפי שהיא, לא כפי שהיינו רוצים. */
  accessibility: Slot<RestaurantAccessibility>;
}

/** מסעדה שלמה: הזהות המאומתת מ־`business.ts` + המשבצות שטרם מולאו. */
export interface RestaurantLocation extends RestaurantDetail {
  id: BranchId;
  /** מ־`BRANCHES`. מאומת. */
  nameHe: string;
  /** היישוב. זהה לשם המסעדה, מאותו מקור מאומת. */
  cityHe: string;
  isFlagship: boolean;
}

const emptyDetail = (): RestaurantDetail => ({
  address: null,
  geo: null,
  phone: null,
  hours: null,
  chef: null,
  privateEventCapacity: null,
  liveMenuUrl: null,
  gbpUrl: null,
  accessibility: null,
});

/**
 * המצב היום: שלוש מסעדות מאומתות בשמן, אפס פרטים תפעוליים.
 *
 * כשמגיע מידע על מסעדה — מחליפים את `emptyDetail()` שלה באובייקט מפורש
 * ומשאירים את השאר כפי שהוא. אין למלא מסעדה אחת «לפי» אחרת, ובוודאי לא
 * להסיק שעות של רעננה משעות הרצליה.
 */
const DETAIL: Record<BranchId, RestaurantDetail> = {
  herzliya_pituach: emptyDetail(),
  raanana: emptyDetail(),
  petah_tikva: emptyDetail(),
};

/** שלוש המסעדות, בסדר שנקבע ב־`business.ts` — הדגל ראשון. */
export const RESTAURANTS: readonly RestaurantLocation[] = BRANCHES.map((b) => ({
  id: b.id,
  nameHe: b.name,
  cityHe: b.name,
  isFlagship: b.isFlagship,
...DETAIL[b.id],
}));

const BY_ID = new Map<string, RestaurantLocation>(RESTAURANTS.map((r) => [r.id, r]));

export const restaurantById = (id: BranchId): RestaurantLocation => BY_ID.get(id)!;

/* ═══════════════════ הקייטרינג — משבצות נפרדות ═══════════════════ */

/**
 * אזור השירות של הקייטרינג.
 *
 * **אינו נגזר מ־`RESTAURANTS`, ולא ייגזר.** שלוש הנקודות שלמעלה הן
 * מיקומי מסעדות; הקייטרינג יוצא ממטבח אחד שזהותו לא נמסרה, ואפילו
 * כשתימסר — הטווח שהוא מוכן לנסוע הוא החלטה מסחרית של הבעלים ולא פונקציה
 * של מרחק אווירי. עד שיימסר, אין באתר טענת אזור: לא רשימת ערים, לא מפה,
 * לא «ובסביבה», ולא «גוש דן והשרון».
 *
 * זו גם המשבצת שחוסמת את `/areas/:city`. בלעדיה אין ולו עיר אחת שמותר
 * לבנות לה דף אזור, וזה מכוון — דף אזור בלי התחייבות חלוקה הוא דלת כניסה.
 */
export interface CateringServiceArea {
  /** הערים שהקייטרינג מחלק אליהן **בפועל**, כלשון הבעלים. לא לפי מרחק. */
  citiesHe: readonly string[];
  /** תיאור האזור במילים, אם הבעלים מנסח אותו כך ולא כרשימה. */
  descriptionHe: Slot<string>;
  /** דמי הובלה, אם יש. התחייבות מסחרית. */
  deliveryFeeHe: Slot<string>;
  /** מינימום הזמנה לחלוקה, כלשון הבעלים. */
  minimumHe: Slot<string>;
}

/** TODO(owner): לאן הקייטרינג מגיע בפועל. אין לגזור ממיקומי המסעדות. */
export const CATERING_SERVICE_AREA: Slot<CateringServiceArea> = null;

/**
 * נוסח הכשרות של הקייטרינג — **כלשונו, בכתב**, כולל שם הגוף המכשיר המלא.
 *
 * זה אינו העתק של `SLOTS.kashrutByBranch`. שם יושבת התשובה שנמסרה בעל־פה
 * («כשר בד״ץ»), ו־`business.ts` מתעד בה פער פתוח: **איזה** בד״ץ. «בד״ץ»
 * אינו גוף אחד, וללקוח שומר כשרות ההבדל הוא כל ההחלטה.
 *
 * המחרוזת הזאת היא היחידה שמותר לה להופיע כטענת כשרות בדף (spec 01 P-10),
 * והיא גם מה שפותח את השער הקשיח של `/catering/shiva` (P-11). כל עוד היא
 * `null` — אין נוסח, ואין דף שבעה.
 *
 * היא משבצת של **הקייטרינג** ולא של מסעדה, כי זה מה שהלקוח מזמין. הגרסה
 * הקודמת דרשה נוסח בכתב לשלוש המסעדות בנפרד, וזו הייתה שארית של מודל
 * שלושת המטבחים.
 *
 * TODO(owner): שם הגוף המכשיר המלא, נוסח מדויק, והעתק תעודה בתוקף.
 * TODO(dev): כשיימסר — מקומו הטבעי הוא `business.ts` לצד `kashrutByBranch`,
 * וכאן יישאר בורר בלבד. הקובץ ההוא בבעלות אחרת ולכן המשבצת יושבת כאן.
 */
export const CATERING_KASHRUT_STATEMENT: Slot<string> = null;

/* ═══════════════════ בוררים ═══════════════════ */
/*
 * לכל עובדה בורר אחד, והוא מחזיר `null` כשאין מה להציג. הדף שואל את
 * הבורר ולא את השדה, כדי שהכלל «יש צורה מובנית? קח אותה. אין? קח את
 * ה־Slot השטוח מ־business.ts» ייכתב פעם אחת ולא בשלושה מקומות.
 */

const flat = <T,>(rec: Slot<Record<BranchId, T>>, id: BranchId): T | null =>
  filled(rec) && filled(rec[id]) ? rec[id] : null;

/** שורת כתובת להצגה. מובנית אם יש, אחרת מ־`SLOTS.addresses`. */
export function addressLineFor(id: BranchId): string | null {
  const structured = restaurantById(id).address;
  if (filled(structured) && filled(structured.streetHe)) {
    return `${structured.streetHe}, ${restaurantById(id).cityHe}`;
  }
  return flat(SLOTS.addresses, id);
}

/** כתובת ל־JSON-LD. דורשת רחוב מובנה — שורת טקסט חופשי אינה `PostalAddress`. */
export function postalAddressFor(
  id: BranchId,
): { streetAddress: string; addressLocality: string; postalCode?: string } | null {
  const a = restaurantById(id).address;
  if (!filled(a) || !filled(a.streetHe)) return null;
  return {
    streetAddress: a.streetHe,
    addressLocality: restaurantById(id).cityHe,
...(filled(a.postalCode) ? { postalCode: a.postalCode } : {}),
  };
}

/**
 * שעות המסעדה. `rows` להצגה מובנית ול־JSON-LD, `textHe` לנפילה אחורה על
 * המחרוזת החופשית שב־`business.ts`. שניהם ריקים ⇒ `null`, והבלוק נעלם.
 */
export function hoursFor(
  id: BranchId,
): { rows: OpeningHoursRow[] | null; textHe: string | null } | null {
  const rows = restaurantById(id).hours;
  const structured = filled(rows) && rows.length > 0 ? rows : null;
  const textHe = flat(SLOTS.openingHours, id);
  if (!structured && !textHe) return null;
  return { rows: structured, textHe };
}

/**
 * שם השף — **רק** בהסכמה מפורשת.
 *
 * `SLOTS.chefs` אינו נקרא כאן במכוון: הוא מחזיק שם בלי רשומת הסכמה, ושם
 * של עובד אינו מתפרסם בהיעדר סירוב.
 */
export function chefFor(id: BranchId): RestaurantChef | null {
  const chef = restaurantById(id).chef;
  if (!filled(chef) || !filled(chef.nameHe) || chef.consent !== true) return null;
  return chef;
}

export function privateEventCapacityFor(id: BranchId): PrivateEventCapacity | null {
  const c = restaurantById(id).privateEventCapacity;
  if (!filled(c)) return null;
  const hasAny =
    filled(c.seated) || filled(c.standing) || c.canClose === true || filled(c.parkingHe);
  return hasAny ? c : null;
}

/** שער «אירוח אצלנו במסעדה» (spec 01 P-09, 02 §3.4). */
export const anyPrivateEventCapacity = (): boolean =>
  RESTAURANTS.some((r) => privateEventCapacityFor(r.id) !== null);

/** המסעדות שיש להן קיבולת — כדי שהשורה תנקוב בהן בשמן ולא תדבר בכללי. */
export const restaurantsWithPrivateEvents = (): RestaurantLocation[] =>
  RESTAURANTS.filter((r) => privateEventCapacityFor(r.id) !== null);

export function accessibilityFor(id: BranchId): RestaurantAccessibility | null {
  const a = restaurantById(id).accessibility;
  if (!filled(a)) return null;
  const hasAny = [a.parkingHe, a.entranceHe, a.toiletHe, a.seatingHe, a.liftHe].some(filled);
  return hasAny ? a : null;
}

/** תפריט המסעדה החי. בלעדיו אין סימן «מוגש היום במסעדה» בשום ניסוח. */
export const liveMenuUrlFor = (id: BranchId): string | null => {
  const v = restaurantById(id).liveMenuUrl;
  return filled(v) ? v : null;
};

export const gbpUrlFor = (id: BranchId): string | null => {
  const v = restaurantById(id).gbpUrl;
  return filled(v) ? v : null;
};

/** טלפון המסעדה אם נמסר, אחרת המספר המרכזי. לעולם לא מספר קשיח בקומפוננטה. */
export const phoneFor = (id: BranchId): RestaurantPhone => {
  const p = restaurantById(id).phone;
  return filled(p) ? p : PHONE;
};

/**
 * המסעדה שבמטבח שלה מבושל הקייטרינג.
 *
 * `null` היום, ולכן **אין באתר שום מקום שנוקב בעיר כמוצא הקייטרינג**.
 * הבורר קיים כדי שהתשובה תיכנס בנקודה אחת כשתימסר, ולא כדי שדף כלשהו
 * ינחש בינתיים איזו מהשלוש זו.
 */
export const cateringKitchenRestaurant = (): RestaurantLocation | null =>
  filled(SLOTS.cateringKitchenBranch) ? restaurantById(SLOTS.cateringKitchenBranch) : null;

/** אזור השירות של הקייטרינג. `null` ⇒ אין באתר טענת אזור, בשום ניסוח. */
export function cateringServiceArea(): CateringServiceArea | null {
  const a = CATERING_SERVICE_AREA;
  if (!filled(a)) return null;
  const hasAny =
    a.citiesHe.length > 0 || filled(a.descriptionHe) || filled(a.deliveryFeeHe) || filled(a.minimumHe);
  return hasAny ? a : null;
}

/** הערים שמותר לבנות להן דף אזור. ריק היום ⇒ `/areas/:city` חסום. */
export const cateringServiceCities = (): readonly string[] => cateringServiceArea()?.citiesHe ?? [];

/**
 * נוסח הכשרות בכתב. שער `/catering/shiva` (spec 01 P-11) ושער המילה
 * «כשר» בכל דף (P-10) נשענים על זה, ולא על `SLOTS.kashrutByBranch`.
 */
export const kashrutStatement = (): string | null =>
  filled(CATERING_KASHRUT_STATEMENT) ? CATERING_KASHRUT_STATEMENT : null;

export const kashrutStatementWritten = (): boolean => kashrutStatement() !== null;

/* ═══════════════════ שערי רינדור ═══════════════════ */

/**
 * השורות שדף `/kitchen` בונה מהן את בלוק המסעדות. הסדר הוא סדר ההצגה,
 * ושורה בלי ערך אינה מרונדרת.
 *
 * אין כאן `servesAreas` ואין `capacityPerDay`: הראשון אינו עובדה של
 * מסעדה, והשני אינו עובדה שנמסרה.
 */
export const RESTAURANT_FACT_KEYS = ["address", "hours", "chef", "accessibility"] as const;

export type RestaurantFactKey = (typeof RESTAURANT_FACT_KEYS)[number];

/** תוויות שדה — לא קופי. הקופי של הדף יושב בדף. */
export const RESTAURANT_FACT_LABEL_HE: Record<RestaurantFactKey, string> = {
  address: "כתובת",
  hours: "שעות המסעדה",
  chef: "מי מנהל את המטבח",
  accessibility: "נגישות",
};

/** אילו שורות עובדה יש למסעדה בפועל. ריק ⇒ הבלוק שלה אינו מרונדר. */
export function filledFactKeys(id: BranchId): RestaurantFactKey[] {
  const has: Record<RestaurantFactKey, boolean> = {
    address: addressLineFor(id) !== null,
    hours: hoursFor(id) !== null,
    chef: chefFor(id) !== null,
    accessibility: accessibilityFor(id) !== null,
  };
  return RESTAURANT_FACT_KEYS.filter((k) => has[k]);
}

export const hasAnyFacts = (id: BranchId): boolean => filledFactKeys(id).length > 0;

/**
 * האם ידוע על המסעדות משהו מעבר לשמן.
 *
 * `false` היום. דף `/kitchen` **נבנה בכל מקרה** — הטענה שהוא נושא היא
 * «מבושל במטבח של מסעדה פעילה», והיא מאומתת ואינה תלויה בשום משבצת כאן.
 * מה שהשער הזה קובע הוא רק אם מרונדר בלוק פרטי המסעדות, או שהדף עומד על
 * הטענה בלבד.
 */
export const anyRestaurantDetail = (): boolean => RESTAURANTS.some((r) => hasAnyFacts(r.id));
