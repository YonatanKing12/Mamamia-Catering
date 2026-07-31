/**
 * ═══════════════════════════════════════════════════════════════════════
 *  החבילות, הבחירה, והתמחור של המגדיר.
 * ═══════════════════════════════════════════════════════════════════════
 *
 * ‎spec: 04 §6. המסלול שנמדד באתר הייחוס הוא
 *
 *     כמות סועדים ← חבילה ← קטגוריה אחר קטגוריה ←
 *     בחירת מנות מול מכסה ← סיכום ← פרטי קשר ← ליד
 *
 * הקובץ הזה מחזיק את שלושת האיברים הראשונים ואת החשבון:
 * החבילה, מבנה `Selection`, והפונקציה היחידה שרשאית להוליד סכום.
 * הקבוצות, המכסות ושכבת המגדיר על המנה יושבות ב־`content/dish-categories.ts`;
 * המנה עצמה ב־`content/dishes.ts`. הכיוון תמיד
 * ‎`packages → dish-categories → dishes`, ואין צלע חוזרת.
 *
 * ─────────────────────────────────────────────────────────────────────
 *  למה מגדיר ולא עוד טופס
 * ─────────────────────────────────────────────────────────────────────
 * הטופס הקיים (`components/quote/`) **מבקש** הצעה בארבע שאלות והוא נשאר
 * כפי שהוא — הוא עובד גם כשאין נתונים. המגדיר **בונה** את האירוע: מי
 * שהשקיע עשר דקות בבחירת מנות נוטש פחות, והליד שנוצר מכיל את הבחירות
 * עצמן ולא רק «אירוע ל־80 איש». שני המסלולים חיים זה לצד זה.
 *
 * ─────────────────────────────────────────────────────────────────────
 *  הריק
 * ─────────────────────────────────────────────────────────────────────
 * ‎`PACKAGES` ריק, וזה המצב התקין להיום. `hasPackages()` מחזיר `false`,
 * ולכן המגדיר מחווט במלואו ואינו מרונדר בשום עמוד. אין חבילת דמו, אין
 * «חבילה בסיסית» כתובה בקוד, ואין מסך שמחכה לתוכן.
 *
 * ─────────────────────────────────────────────────────────────────────
 *  כסף — ארבעה מנעולים, זהים לאלה של `estimate.tsx`
 * ─────────────────────────────────────────────────────────────────────
 * ‎04 §6 קובע במפורש: «מנעולי המחיר מ־`estimate.tsx` חלים גם כאן. בלי
 * מחירון מאושר המגדיר מציג בחירות בלי סכומים, ולא ממציא מספר».
 *
 * ‎`priceSelection()` היא הפונקציה **היחידה** בקובץ שמחזירה סכום, והיא
 * מחזירה `null` אלא אם כל אלה עברו:
 *
 *   0. מחירון מאושר — `PRICING_APPROVAL`: תאריך אישור, הכרעת מע״מ,
 *      ונוסח הסייג שהבעלים כתב. שלושתם, או שאין תצוגה.
 *   1. מחיר בסיס לסועד על החבילה — `basePricePerGuest`.
 *   2. תוספת ידועה לכל מנה שנבחרה — `surcharge !== null`.
 *   3. תוספת חריגה ידועה לכל קטגוריה שחרגה, וחריגה שמותרת בכלל.
 *
 * הסייג, המע״מ והתאריך חוזרים **בתוך** אובייקט התוצאה ולא לצידו. זה
 * מכוון: אי אפשר להחזיק את המספר בלי להחזיק את הסייג שלו, ולכן אי אפשר
 * להעתיק את המספר לדף נחיתה חדש ולהשאיר את הסייג מאחור.
 *
 * ‎`null` הוא **התנהגות תקינה ומלאה**, לא שגיאה ולא מצב טעינה: המגדיר
 * מציג בחירות, מכסות וסיכום — בלי שורת סכום, בלי «₪0», ובלי שלד.
 * ‎`resolveSelection()` נותן בדיוק את הסיכום הזה, והוא לעולם לא נוגע בכסף.
 *
 * ─────────────────────────────────────────────────────────────────────
 *  יחידות
 * ─────────────────────────────────────────────────────────────────────
 * כל סכום כאן הוא **שקלים שלמים לסועד אחד**, וההכפלה במספר הסועדים קורה
 * במקום אחד בלבד, בסוף `priceSelection()`. `null` = לא נמסר, לעולם לא 0.
 *
 * ─────────────────────────────────────────────────────────────────────
 *  RTL
 * ─────────────────────────────────────────────────────────────────────
 * הקובץ מחזיר מספרים, לא מחרוזות. סכום מרונדר דרך `<Money>`, מכסה או
 * מספר סועדים דרך `<Num>`, וטווח נכתב «בין X ל־Y» — לעולם לא מקף בין שני
 * רצפי ספרות, שמתהפך ב־RTL.
 */

import type { Slot } from "@/content/business";
import type { OccasionId } from "@/content/occasions";
import { bandFromCount, type GuestBand } from "@shared/lead-constants";
import {
  CONFIGURATOR_DISHES,
  categoryById,
  dishesForCategory,
  hasCategoryDishes,
  type CategoryId,
  type ConfiguratorDish,
  type DishCategory,
  type DishId,
} from "@/content/dish-categories";

/**
 * ייצוא מחדש של השכבה שמתחת, כדי שקומפוננטת מגדיר תייבא מקובץ אחד.
 * אלה אותם טיפוסים, לא העתק שלהם.
 */
export type {
  CategoryId,
  ConfiguratorDish,
  DishCategory,
  DishExtra,
  DishId,
  OverQuotaPolicy,
} from "@/content/dish-categories";
export {
  CONFIGURATOR_DISHES,
  DISH_CATEGORIES,
  categoryById,
  configuratorDishById,
  dishesForCategory,
  hasCategoryDishes,
  hasConfigurator,
  imageFor,
  renderableCategories,
  visibleSurcharge,
} from "@/content/dish-categories";

/* ═══════════════════ אוצר מילים ═══════════════════ */

/** slug לטיני יציב. מימד אנליטיקה ושדה על שורת הליד — לא לשנות. */
export type PackageId = string;

/**
 * שיוך קטגוריה לחבילה, עם דריסת מכסה אופציונלית.
 *
 * ‎`includedQuota: null` ⇒ המכסה של הקטגוריה עצמה
 * (`DishCategory.includedQuota`). מספר ⇒ דורס אותה **בחבילה הזאת בלבד**.
 * זה המנגנון שבו «חבילה מורחבת» מקבלת תשע סלטים במקום שבעה, בלי לשכפל
 * את הקטגוריה ובלי לשכפל את המנות שבה.
 *
 * ההכרעה בין השניים יושבת אך ורק ב־`quotaFor()`. קומפוננטה שקוראת
 * ‎`category.includedQuota` ישירות תציג את המכסה הלא נכונה בחבילה שדרסה.
 */
export interface PackageCategory {
  categoryId: CategoryId;
  includedQuota: number | null;
  /**
   * דריסת תקרה, באותה מכניקה. `null` ⇒ התקרה של הקטגוריה.
   * ‎(`DishCategory.max`, ומשם `maxFor()`.)
   */
  max?: number | null;
}

/* ═══════════════════ הרשומה — חבילה ═══════════════════ */

export interface CateringPackage {
  /** slug יציב. לא לשנות אחרי שנקבע. */
  id: PackageId;

  /** שם החבילה בעברית, כלשון הלקוח. */
  nameHe: string;

  /** שורת פתיח מעל השם, או `null` — ואז הכרטיס נפתח בשם. */
  kickerHe: string | null;

  /**
   * משפט אחד על מה החבילה, או `null` — והשורה נשמטת לגמרי.
   *
   * אין לכתוב כאן מספרים («7 סלטים ו־3 עיקריות»): המכסות נגזרות
   * מ־`categories` ומורכבות למשפט בקומפוננטה דרך `<Num>`. תיאור שכתוב
   * ידנית יסטה מהנתונים ברגע שמישהו יעדכן מכסה במקום אחד.
   */
  descriptionHe: string | null;

  /**
   * הקטגוריות שהחבילה כוללת, **בסדר הצעדים במגדיר**. הסדר כאן הוא סדר
   * המסך, ולכן שינוי סדר כאן משנה את המסלול שהמשתמש עובר.
   */
  categories: readonly PackageCategory[];

  /** לאילו סוגי אירוע החבילה מתאימה. ריק הוא תקין. */
  occasions: readonly OccasionId[];

  /**
   * מחיר בסיס לסועד, בשקלים שלמים. **`null` היום, ונשאר `null` עד
   * שהבעלים מוסר מחירון ומאשר אותו.**
   *
   * זה השדה שמחזיק את כל התמחור: `null` כאן מאפס את `priceSelection()`
   * לכל הזמנה, בכל חבילה, בלי קשר לתוספות. אין לו עזר שפותר אותו
   * לתצוגה ואין דרך לרנדר אותו במקרה.
   */
  basePricePerGuest: Slot<number>;

  /** הערה למפתח. אינה מרונדרת לעולם. */
  note?: string;
}

/* ═══════════════════ המחירון המאושר ═══════════════════ */

/**
 * שלושת הנתונים שהופכים מחירון למחירון שמותר להציג. זהה במבנה ובכוונה
 * ל־props של `EstimateRange` (`components/quote/estimate.tsx`).
 */
export interface PricingApproval {
  /** תאריך המחירון שאושר, `YYYY-MM-DD`. */
  approvedAt: string;
  /** אחת משתי מחרוזות המע״מ הקבועות. בלעדיה כל מספר דו־משמעי משפטית. */
  vatLine: string;
  /** נוסח הסייג כפי שהבעלים כתב אותו. */
  qualifier: string;
}

/**
 * **`null`, וזה המצב התקין להיום.**
 *
 * TODO(owner): מחירון מאושר — תאריך אישור, הכרעת מע״מ, ונוסח הסייג.
 *
 * הבית הקבוע של הערך הזה הוא `config/pricing.ts` לפי המפרט; המודול ההוא
 * טרם נוצר. עד שייווצר הוא יושב כאן, מנעול אחד לכל המגדיר. כשיעבור —
 * להחליף בייבוא, בלי לשנות שורה אחת ב־`priceSelection()`.
 *
 * מספר בשקלים ליד פקד שנקרא כקבלה יכול להגיע ל«מסוימות» ולהפוך להצעה
 * לפי ס' ‎2(א) לחוק הגנת הצרכן. זה מה שהמנעול הזה מונע, וזו הסיבה שהוא
 * ‎`null` ולא ברירת מחדל סבירה.
 */
export const PRICING_APPROVAL: Slot<PricingApproval> = null;

/* ═══════════════════ הנתונים ═══════════════════ */

/**
 * ריק, וזה המצב התקין להיום.
 *
 * ─────────────────────────────────────────────────────────────────────
 *  מה הלקוח צריך למסור — חבילות
 * ─────────────────────────────────────────────────────────────────────
 * שורה לחבילה:
 *
 *   1. **שם החבילה** — כלשונו.
 *   2. **אילו קטגוריות היא כוללת, ובאיזה סדר** — הסדר הוא סדר המסכים.
 *   3. **מכסה לכל קטגוריה בחבילה הזאת** — רק אם היא שונה מהמכסה
 *      הרגילה של הקטגוריה. זהה ⇒ להשאיר ריק.
 *   4. **מחיר בסיס לסועד** — ובנפרד: **מה הוא כולל ומה לא, והאם כולל
 *      מע״מ**. מחיר בלי שני אלה אינו נכנס לקובץ ואינו מוצג.
 *   5. **לאילו סוגי אירוע היא מתאימה** — מזהים מ־`content/occasions.ts`.
 *
 * ובנוסף, פעם אחת לכל האתר: **תאריך אישור המחירון ונוסח הסייג**
 * (`PRICING_APPROVAL`). בלעדיהם נבנה מגדיר מלא ופעיל, בלי סכומים.
 *
 * ─────────────────────────────────────────────────────────────────────
 *  דוגמה — **בהערה בלבד. לעולם לא בתוך `PACKAGES`.**
 * ─────────────────────────────────────────────────────────────────────
 * ```ts
 * {
 *   id: "classic",
 *   nameHe: "החבילה הקלאסית",
 *   kickerHe: null,
 *   descriptionHe: null,
 *   categories: [
 *     { categoryId: "salads",   includedQuota: null },  // 7, מהקטגוריה
 *     { categoryId: "mains",    includedQuota: 3 },     // דריסה לחבילה הזאת
 *     { categoryId: "desserts", includedQuota: null },
 *   ],
 *   occasions: ["business", "private-events"],
 *   basePricePerGuest: null,
 * }
 * ```
 * שימו לב ל־`basePricePerGuest: null` בדוגמה. זה לא פספוס — זה המצב
 * שבו החבילה מוגדרת, נבחרת, ונשלחת בליד, בלי שהוצג עליה מספר.
 */
export const PACKAGES: readonly CateringPackage[] = [];

/* ═══════════════════ הבחירה ═══════════════════ */

/**
 * מה שהמשתמש בנה. הצורה שנשמרת בטיוטה ונשלחת עם הליד.
 *
 * שלושת השדות מ־04 §6 בדיוק. הטיוטה ב־`localStorage` שורדת ‎14 יום
 * וקובצי התוכן נערכים בינתיים, ולכן **כל מזהה כאן נחשב חשוד**:
 * ‎`resolveSelection()` זורק בשקט כל מנה שנעלמה, החליפה קטגוריה, או
 * איבדה את זמינותה לקייטרינג. אין מסלול שבו מזהה מיושן מתגלגל לכרטיס
 * הסיכום, משם להודעת הוואטסאפ, ומשם לעמודה בבסיס הנתונים.
 */
export interface Selection {
  /** מספר סועדים מדויק. `null` = טרם נמסר. */
  guestCount: number | null;
  /** החבילה שנבחרה. `null` = טרם נבחרה. */
  packageId: PackageId | null;
  /** מזהי המנות שנבחרו, לכל קטגוריה. */
  byCategory: Readonly<Record<CategoryId, readonly DishId[]>>;
}

/** נקודת הפתיחה. אין בה שום ערך שהומצא. */
export const EMPTY_SELECTION: Selection = {
  guestCount: null,
  packageId: null,
  byCategory: {},
};

/* ═══════════════════ שליפה ═══════════════════ */

/** חבילה לפי מזהה, מהרשימה הגולמית. לא נמצאה — `null`. */
export function packageById(id: PackageId | null): CateringPackage | null {
  if (!id) return null;
  return PACKAGES.find((p) => p.id === id) ?? null;
}

/**
 * הקטגוריות של החבילה, בסדר שנקבע בה, **ורק אלה שיש בהן מנות**.
 *
 * זו הפונקציה שבונה את צעדי המגדיר. קטגוריה ריקה אינה מוחזרת — ולכן
 * ‎`.map()` על התוצאה אינו יכול לייצר צעד עם כותרת ובלי תוכן. קטגוריה
 * שנמחקה מ־`DISH_CATEGORIES` והחבילה עוד מפנה אליה נשמטת גם היא.
 *
 * מקבל מזהה או את הרשומה עצמה.
 */
export function categoriesForPackage(pkg: PackageId | CateringPackage | null): DishCategory[] {
  const record = typeof pkg === "string" || pkg === null ? packageById(pkg) : pkg;
  if (!record) return [];

  const out: DishCategory[] = [];
  const seen = new Set<CategoryId>();

  for (const entry of record.categories) {
    if (seen.has(entry.categoryId)) continue;
    const category = categoryById(entry.categoryId);
    if (!category) continue;
    if (!hasCategoryDishes(category)) continue;
    seen.add(category.id);
    out.push(category);
  }

  return out;
}

/** האם לחבילה יש בכלל מסלול להציע. השער של כל כרטיס חבילה. */
export function hasPackageCategories(pkg: PackageId | CateringPackage): boolean {
  return categoriesForPackage(pkg).length > 0;
}

/**
 * החבילות שמותר לרנדר: אלה שנותרה בהן ולו קטגוריה אחת עם מנות.
 * ‎`PACKAGES` הגולמי מיועד לכלים ולוולידציה בלבד.
 */
export function renderablePackages(): CateringPackage[] {
  return PACKAGES.filter(hasPackageCategories);
}

/**
 * האם יש בכלל מגדיר להציג. השורה הראשונה בכל עמוד או סקשן מגדיר:
 *
 *   `if (!hasPackages()) return null;`
 *
 * היום `false`.
 */
export function hasPackages(): boolean {
  return renderablePackages().length > 0;
}

/** החבילות המתאימות לסוג אירוע. `[]` ⇒ הסקשן אינו מרונדר בעמוד ההוא. */
export function packagesForOccasion(occasion: OccasionId): CateringPackage[] {
  return renderablePackages().filter((p) => p.occasions.includes(occasion));
}

/* ═══════════════════ מכסות ═══════════════════ */

const entryFor = (
  pkg: CateringPackage,
  categoryId: CategoryId,
): PackageCategory | null => pkg.categories.find((c) => c.categoryId === categoryId) ?? null;

/**
 * המכסה הכלולה של קטגוריה **בחבילה מסוימת**: הדריסה של החבילה אם יש,
 * אחרת המכסה של הקטגוריה.
 *
 * ‎`null` ⇒ הקטגוריה אינה חלק מהחבילה, או שאחת מהשתיים אינה קיימת.
 * ‎`null` **אינו** «בלי מכסה» — הוא «אין כאן מה למדוד», והקומפוננטה
 * משמיטה את שורת המכסה לגמרי.
 *
 * זו הפונקציה היחידה שיודעת להכריע בין השניים. אין לקרוא
 * ‎`category.includedQuota` ישירות בקומפוננטה.
 */
export function quotaFor(
  pkg: PackageId | CateringPackage | null,
  categoryId: CategoryId,
): number | null {
  const record = typeof pkg === "string" || pkg === null ? packageById(pkg) : pkg;
  if (!record) return null;

  const category = categoryById(categoryId);
  if (!category) return null;

  const entry = entryFor(record, categoryId);
  if (!entry) return null;

  const override = entry.includedQuota;
  if (typeof override === "number" && Number.isInteger(override) && override >= 0) {
    return override;
  }
  return category.includedQuota;
}

/**
 * התקרה האפקטיבית — כמה מנות אפשר לבחור בפועל, כולל חריגה בתשלום.
 *
 *   מספר  — תקרה. `0` פירושו שאין מה לבחור: הקטגוריה אינה בחבילה.
 *   `null` — אין תקרה מוצהרת (רק כשהחריגה מותרת).
 *
 * כשהחריגה **אסורה**, התקרה היא המכסה — גם אם `max` הוא `null`. `null`
 * במקרה הזה אינו «בלי הגבלה»; קטגוריה שאוסרת חריגה ומרשה בחירה אינסופית
 * היא סתירה, וההכרעה הזאת חייבת לחיות במקום אחד.
 */
export function maxFor(
  pkg: PackageId | CateringPackage | null,
  categoryId: CategoryId,
): number | null {
  const record = typeof pkg === "string" || pkg === null ? packageById(pkg) : pkg;
  const category = categoryById(categoryId);
  if (!record || !category) return 0;

  const entry = entryFor(record, categoryId);
  if (!entry) return 0;

  const quota = quotaFor(record, categoryId) ?? category.includedQuota;
  if (!category.overQuota.allowed) return quota;

  const override = entry.max;
  if (override !== undefined && override !== null) return override;
  return category.max;
}

/* ═══════════════════ פתרון הבחירה ═══════════════════ */

/** קטגוריה אחת, אחרי שהבחירה בה נוקתה ונמדדה. בלי שום סכום. */
export interface ResolvedCategory {
  category: DishCategory;
  /** המנות שנבחרו בפועל, בסדר שנבחרו, בלי כפילויות ובלי מזהים מתים. */
  dishes: ConfiguratorDish[];
  count: number;
  /** המכסה בחבילה הזאת. */
  quota: number;
  /** התקרה האפקטיבית. `null` ⇒ אין תקרה מוצהרת. */
  max: number | null;
  /** כמה מעבר למכסה. ‎0 כשאין חריגה. */
  extras: number;
  /** האם נבחרו יותר מהמכסה. */
  overQuota: boolean;
  /** האם נחצתה התקרה — מצב לא חוקי שהתמחור מסרב לתמחר. */
  overMax: boolean;
}

/** הבחירה כולה, נקייה ומדודה. זה מה שכרטיס הסיכום מרנדר. */
export interface ResolvedSelection {
  pkg: CateringPackage;
  /** `null` כשטרם נמסר מספר סועדים תקין. */
  guestCount: number | null;
  /** קטגוריה לכל צעד בחבילה, בסדר הצעדים. */
  categories: ResolvedCategory[];
  /** סך המנות שנבחרו בכל הקטגוריות. */
  totalDishes: number;
}

/**
 * הפונקציה שכל השאר נשענות עליה: מנקה את הבחירה ומודדת אותה, בלי לגעת
 * בכסף. זו גם הצורה שנשלחת לליד — «מה הלקוח בנה» קיים ומלא גם כשאין
 * מחירון בעולם.
 *
 * מה נזרק בשקט, והכול מאותה סיבה — טיוטה בת ‎14 יום מול קובץ תוכן שנערך:
 *   · מזהה מנה שאינו קיים או שאיבד זמינות לקייטרינג.
 *   · מנה ששויכה לקטגוריה אחרת מזו שהיא נבחרה תחתיה.
 *   · כפילות.
 *   · קטגוריה שאינה בחבילה, או שנותרה בלי מנות.
 *
 * חבילה לא מוכרת ⇒ `null`, והמגדיר חוזר לצעד בחירת החבילה.
 */
export function resolveSelection(selection: Selection): ResolvedSelection | null {
  const pkg = packageById(selection.packageId);
  if (!pkg) return null;

  const categories: ResolvedCategory[] = [];
  let totalDishes = 0;

  for (const category of categoriesForPackage(pkg)) {
    const ids = selection.byCategory[category.id] ?? [];
    const pool = dishesForCategory(category);

    const seen = new Set<DishId>();
    const dishes: ConfiguratorDish[] = [];
    for (const id of ids) {
      if (seen.has(id)) continue;
      const dish = pool.find((d) => d.id === id);
      if (!dish) continue;
      seen.add(id);
      dishes.push(dish);
    }

    const quota = quotaFor(pkg, category.id) ?? category.includedQuota;
    const ceiling = maxFor(pkg, category.id);
    const count = dishes.length;

    categories.push({
      category,
      dishes,
      count,
      quota,
      max: ceiling,
      extras: Math.max(0, count - quota),
      overQuota: count > quota,
      overMax: ceiling !== null && count > ceiling,
    });

    totalDishes += count;
  }

  const guests = selection.guestCount;
  const guestCount =
    typeof guests === "number" && Number.isInteger(guests) && guests > 0 ? guests : null;

  return { pkg, guestCount, categories, totalDishes };
}

/**
 * כמה מנות נבחרו — בקטגוריה אחת, או בכל הבחירה כשלא נמסרה קטגוריה.
 *
 * סופר **רק מנות שקיימות באמת** בקטגוריה שהן נבחרו תחתיה, בלי כפילויות.
 * זה הפרש מכוון מ־`selection.byCategory[id].length`, שסופר גם מזהים
 * מתים — ולכן קומפוננטה שקוראת את האורך הגולמי תציג «‎8 מתוך 7» על שבע
 * מנות אמיתיות ומזהה אחד שנמחק.
 */
export function countSelected(selection: Selection, categoryId?: CategoryId): number {
  const resolved = resolveSelection(selection);
  if (!resolved) return 0;
  if (categoryId === undefined) return resolved.totalDishes;
  return resolved.categories.find((c) => c.category.id === categoryId)?.count ?? 0;
}

/**
 * האם נבחרו יותר מהמכסה הכלולה בקטגוריה — כלומר האם הבחירה הזאת נכנסת
 * לתשלום נוסף.
 *
 * קטגוריה שאינה בחבילה ונבחרה בה מנה ⇒ `true`. זה נכון וגם בטוח: מצב
 * כזה אינו ניתן לתמחור, ו־`priceSelection()` יחזיר `null`.
 */
export function isOverQuota(selection: Selection, categoryId: CategoryId): boolean {
  const resolved = resolveSelection(selection);
  if (!resolved) return false;

  const line = resolved.categories.find((c) => c.category.id === categoryId);
  if (!line) return countSelected(selection, categoryId) > 0;
  return line.overQuota;
}

/**
 * קטגוריות חובה שטרם נבחר בהן דבר. `[]` ⇒ אפשר להמשיך לפרטי הקשר.
 * זה השער של כפתור ההמשך, והוא אינו קשור לכסף בשום צורה.
 */
export function missingRequiredCategories(selection: Selection): DishCategory[] {
  const resolved = resolveSelection(selection);
  if (!resolved) return [];
  return resolved.categories
    .filter((line) => line.category.required && line.count === 0)
    .map((line) => line.category);
}

/** האם הבחירה שלמה: חבילה, מספר סועדים, וכל קטגוריות החובה. */
export function isSelectionComplete(selection: Selection): boolean {
  const resolved = resolveSelection(selection);
  if (!resolved) return false;
  if (resolved.guestCount === null) return false;
  if (resolved.categories.some((line) => line.overMax)) return false;
  return missingRequiredCategories(selection).length === 0;
}

/**
 * רצועת הסועדים של הבחירה, לשורת הליד ולאנליטיקה. הרצועות מוגדרות פעם
 * אחת ב־`shared/lead-constants.ts` ואין לגזור אותן מחדש כאן.
 * ‎`null` ⇒ טרם נמסר מספר סועדים תקין.
 */
export function guestBandFor(selection: Selection): GuestBand | null {
  const n = selection.guestCount;
  if (typeof n !== "number" || !Number.isInteger(n) || n <= 0) return null;
  return bandFromCount(n) ?? null;
}

/* ═══════════════════ תמחור ═══════════════════ */

/** שורת תמחור לקטגוריה. כל הסכומים לסועד אחד. */
export interface PriceLine {
  categoryId: CategoryId;
  nameHe: string;
  count: number;
  quota: number;
  extras: number;
  /** סך התוספות של המנות שנבחרו בקטגוריה, לסועד. */
  dishSurchargePerGuest: number;
  /** התשלום על החריגה מהמכסה, לסועד. ‎0 כשאין חריגה. */
  overQuotaPerGuest: number;
}

/**
 * התוצאה — ורק כשכל ארבעת המנעולים עברו. שימו לב שהסייג, המע״מ והתאריך
 * יושבים כאן, בתוך אותו אובייקט עם המספרים.
 */
export interface PricedSelection {
  guestCount: number;
  basePerGuest: number;
  dishSurchargePerGuest: number;
  overQuotaPerGuest: number;
  /** סך הכול לסועד אחד. */
  perGuest: number;
  /** ‎`perGuest × guestCount`. ההכפלה קורית כאן ורק כאן. */
  total: number;
  lines: PriceLine[];
  /** נוסח הסייג של הבעלים. מרונדר **מעל** המספר, באותו גודל ומשקל. */
  qualifier: string;
  vatLine: string;
  /** תאריך המחירון, `YYYY-MM-DD`. */
  approvedAt: string;
}

/**
 * ═══════════════════════════════════════════════════════════════════
 *  הפונקציה היחידה בקובץ שיכולה להוליד סכום.
 * ═══════════════════════════════════════════════════════════════════
 *
 * טהורה: אותה בחירה, אותה תוצאה, בלי תאריך, בלי אקראיות, בלי רשת.
 * קלה לבדיקה בבידוד — וזו הנקודה. ‎`resolveEstimate()`
 * ב־`components/quote/estimate.tsx` בנויה באותה צורה ומאותה סיבה.
 *
 * מחזירה `null` — כלומר «אין תצוגת מחיר» — בכל אחד מאלה, וכל אחד לבדו:
 *
 *   · אין מחירון מאושר (`PRICING_APPROVAL`), או שאחד משלושת חלקיו ריק
 *     או פגום.
 *   · החבילה לא נמצאה.
 *   · אין מספר סועדים שלם וחיובי.
 *   · אין מחיר בסיס לסועד, או שאינו מספר חיובי סופי.
 *   · **למנה אחת שנבחרה אין תוספת מוצהרת** (`surcharge === null`).
 *   · קטגוריה חרגה מהמכסה ואין תוספת חריגה מוצהרת, או שהחריגה בכלל
 *     אסורה בה.
 *   · קטגוריה חצתה את התקרה — בחירה לא חוקית, ואין לתמחר אותה.
 *
 * ‎`null` הוא תשובה מלאה ותקינה. הקומפוננטה שקוראת לזה מרנדרת את הסיכום
 * מ־`resolveSelection()` ומשמיטה **את שורת הסכום בלבד** — לא כותרת
 * יתומה, לא «₪—», לא «המחיר ייקבע בהמשך» כטקסט שממלא את החור.
 *
 * ואזהרה אחרונה: תוצאה שאינה `null` היא רשות לרנדר **את האובייקט הזה
 * כולו** — הסייג מעל המספר, באותו גודל ואותו משקל. סכום שמרונדר בלי
 * ‎`qualifier` הוא בדיוק הדפוס שנכשל במבחן הצרכן הסביר, ואין שום מצב
 * שבו הפרדה ביניהם נכונה.
 */
export function priceSelection(
  selection: Selection,
  approval: Slot<PricingApproval> = PRICING_APPROVAL,
): PricedSelection | null {
  /* 0 — מחירון מאושר, על שלושת חלקיו */
  if (!approval) return null;
  const { approvedAt, vatLine, qualifier } = approval;
  if (typeof approvedAt !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(approvedAt)) return null;
  if (typeof vatLine !== "string" || vatLine.trim().length === 0) return null;
  if (typeof qualifier !== "string" || qualifier.trim().length === 0) return null;

  const resolved = resolveSelection(selection);
  if (!resolved) return null;

  /* מספר סועדים */
  const guestCount = resolved.guestCount;
  if (guestCount === null) return null;

  /* 1 — מחיר בסיס לסועד */
  const basePerGuest = resolved.pkg.basePricePerGuest;
  if (
    typeof basePerGuest !== "number" ||
    !Number.isFinite(basePerGuest) ||
    basePerGuest <= 0
  ) {
    return null;
  }

  const lines: PriceLine[] = [];
  let dishSurchargePerGuest = 0;
  let overQuotaPerGuest = 0;

  for (const line of resolved.categories) {
    /* בחירה לא חוקית — לא מתמחרים אותה, לא מעגלים אותה למטה */
    if (line.overMax) return null;

    /* 2 — תוספת מוצהרת לכל מנה שנבחרה */
    let dishSum = 0;
    for (const dish of line.dishes) {
      const s = dish.surcharge;
      if (typeof s !== "number" || !Number.isFinite(s) || s < 0) return null;
      dishSum += s;
    }

    /* 3 — חריגה: מותרת, ובמחיר מוצהר */
    let extraSum = 0;
    if (line.extras > 0) {
      const policy = line.category.overQuota;
      if (!policy.allowed) return null;
      const per = policy.surchargePerExtra;
      if (typeof per !== "number" || !Number.isFinite(per) || per <= 0) return null;
      extraSum = per * line.extras;
    }

    dishSurchargePerGuest += dishSum;
    overQuotaPerGuest += extraSum;

    lines.push({
      categoryId: line.category.id,
      nameHe: line.category.nameHe,
      count: line.count,
      quota: line.quota,
      extras: line.extras,
      dishSurchargePerGuest: dishSum,
      overQuotaPerGuest: extraSum,
    });
  }

  const perGuest = basePerGuest + dishSurchargePerGuest + overQuotaPerGuest;
  if (!Number.isFinite(perGuest) || perGuest <= 0) return null;

  const total = perGuest * guestCount;
  if (!Number.isFinite(total) || total <= 0) return null;

  return {
    guestCount,
    basePerGuest,
    dishSurchargePerGuest,
    overQuotaPerGuest,
    perGuest,
    total,
    lines,
    qualifier: qualifier.trim(),
    vatLine: vatLine.trim(),
    approvedAt,
  };
}

/* ═══════════════════ בדיקת שפיות ═══════════════════ */

/**
 * מאתרת את הטעויות שקורות כשמזינים גיליון ידנית. מוחזרת כרשימת מחרוזות
 * ולא זורקת — קובץ נתונים שגוי אסור לו להפיל עמוד ללקוח.
 */
export function validatePackages(packages: readonly CateringPackage[] = PACKAGES): string[] {
  const problems: string[] = [];
  const seen = new Set<PackageId>();

  for (const pkg of packages) {
    const at = `package "${pkg.id || "(ללא מזהה)"}"`;

    if (!pkg.id) problems.push(`${at}: חסר מזהה`);
    else if (seen.has(pkg.id)) problems.push(`${at}: מזהה כפול`);
    else seen.add(pkg.id);

    if (!pkg.nameHe?.trim()) problems.push(`${at}: חסר שם`);

    if (pkg.categories.length === 0) {
      problems.push(`${at}: חבילה בלי קטגוריות — אין מסלול לעבור`);
    }

    const seenCat = new Set<CategoryId>();
    for (const entry of pkg.categories) {
      if (seenCat.has(entry.categoryId)) {
        problems.push(`${at}: קטגוריה כפולה "${entry.categoryId}"`);
      }
      seenCat.add(entry.categoryId);

      const category = categoryById(entry.categoryId);
      if (!category) {
        problems.push(`${at}: קטגוריה לא מוכרת "${entry.categoryId}"`);
        continue;
      }

      const quota = entry.includedQuota;
      if (quota !== null && (!Number.isInteger(quota) || quota < 0)) {
        problems.push(`${at}: דריסת מכסה ל־"${entry.categoryId}" חייבת להיות שלם אי־שלילי או null`);
      }

      const ceiling = entry.max;
      if (ceiling !== undefined && ceiling !== null) {
        if (!Number.isInteger(ceiling) || ceiling < 1) {
          problems.push(`${at}: דריסת תקרה ל־"${entry.categoryId}" חייבת להיות שלם חיובי או null`);
        } else {
          const effective = quota ?? category.includedQuota;
          if (ceiling < effective) {
            problems.push(`${at}: תקרה ${ceiling} קטנה מהמכסה ${effective} ב־"${entry.categoryId}"`);
          }
        }
      }
    }

    const base = pkg.basePricePerGuest;
    if (base !== null && (!Number.isFinite(base) || base <= 0)) {
      problems.push(`${at}: מחיר בסיס חייב להיות חיובי או null`);
    }
    if (base !== null && !PRICING_APPROVAL) {
      problems.push(`${at}: מחיר בסיס הוזן בלי מחירון מאושר — לא יוצג לאיש`);
    }

    if (/₪|\bש"?ח\b|\d/.test(`${pkg.descriptionHe ?? ""} ${pkg.kickerHe ?? ""}`)) {
      problems.push(`${at}: ספרה או מחיר בקופי. מספרים מורכבים בקומפוננטה דרך <Num>/<Money>`);
    }
  }

  /* מנה בקטגוריה שאף חבילה אינה כוללת — מנה שהוזנה ולא תוצג לעולם. */
  const reachable = new Set<CategoryId>();
  for (const pkg of packages) {
    for (const entry of pkg.categories) reachable.add(entry.categoryId);
  }
  for (const dish of CONFIGURATOR_DISHES) {
    if (!reachable.has(dish.category)) {
      problems.push(`dish "${dish.id}": קטגוריה "${dish.category}" אינה נכללת באף חבילה`);
    }
  }

  return problems;
}

/* אזהרה בפיתוח בלבד. בפרודקשן אין לוג ואין השפעה על הרינדור. */
if (import.meta.env?.DEV) {
  const problems = validatePackages();
  if (problems.length > 0) {
    console.warn(`[packages.ts] ${problems.length} בעיות:\n · ${problems.join("\n · ")}`);
  }
}
