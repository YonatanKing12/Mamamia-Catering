/**
 * ═══════════════════════════════════════════════════════════════════════
 *  תפריטי הקייטרינג — הרכבות של מנות, לא מוצרים.
 * ═══════════════════════════════════════════════════════════════════════
 *
 * מנה בודדת יושבת ב־`content/dishes.ts`. הקובץ הזה מקבץ מנות לתפריטים
 * שאפשר לבחור בהם: סקשן «תפריטי השף», הבחירה שמזריעה `service_format`
 * לבנאי ההצעה, והחומר של עמודי האירועים.
 *
 * גם הוא ריק, ומאותה סיבה: תפריט הוא הצהרה של הלקוח על מה שהמטבח מוציא
 * בפועל ובאיזו צורת הגשה. שם תפריט שהומצא כאן הוא מוצר שהעסק לא מוכר.
 *
 * ─────────────────────────────────────────────────────────────────────
 *  החוק
 * ─────────────────────────────────────────────────────────────────────
 * תפריט שאין לו ולו מנה אחת זמינה לקייטרינג — **אינו קיים**. הוא לא
 * מרונדר, לא נספר, ולא מופיע בשום רשימה שהעזרים כאן מחזירים. לכן
 * ‎`MENUS` הוא הרשימה הגולמית, ו־`renderableMenus()` היא הרשימה שצרכן
 * עובד מולה. הפער הזה מכוון: הוא מבטיח שכרטיס תפריט לעולם לא ירונדר
 * מעל רשימה ריקה.
 *
 * ‎`pricePerPerson` נשאר `null`. תמיד. ראו את ההערה על השדה.
 *
 * ─────────────────────────────────────────────────────────────────────
 *  המיצוב
 * ─────────────────────────────────────────────────────────────────────
 * לקרוא את בלוק המיצוב בראש `content/business.ts`. בקצרה, ורלוונטי כאן:
 * הקייטרינג מבושל במטבח של **מסעדה אחת**, ואיזו — לא נמסר. אין לגזור
 * משיוך תפריט לסניף שום טענה על מטבח שמייצר, על אזור שירות או על היקף.
 * ‎`menusForBranch()` היא שאילתת תפריט, לא הצהרת קיבולת.
 *
 * ─────────────────────────────────────────────────────────────────────
 *  מה הלקוח צריך למסור, ובאיזה מבנה
 * ─────────────────────────────────────────────────────────────────────
 * שורה לתפריט:
 *
 *   1. **שם התפריט** — כפי שאומרים אותו ללקוח בטלפון.
 *   2. **שורת פתיח קצרה** (kicker) — משפט אחד מעל השם, או ריק. לא סיסמה
 *      ולא הבטחה: מה יש בתפריט הזה שאין באחר.
 *   3. **אילו מנות** — מזהים מ־`dishes.ts`. אפשר גם לנהל את השיוך מצד
 *      המנה; שני הכיוונים מתמזגים.
 *   4. **לאילו צורות הגשה התפריט מתאים** — משלוח מגשים · בופה במקום ·
 *      מוגש בצלחות עם צוות · אירוח אצלנו במסעדה. תפריט שאין לו אף צורת
 *      הגשה עדיין תקין: הוא פשוט לא יזריע כלום לבנאי.
 *   5. **לאילו סוגי אירוע הוא מתאים** — אופציונלי, מזהים מ־`OccasionId`
 *      (מוגדר ב־`content/occasions.ts`). שיוך כאן אינו הצהרה שהעמוד
 *      קיים או שהאירוע נתמך; הוא רק אומר לעמוד שכן קיים איזה תפריט
 *      להראות. השערים של האירועים עצמם יושבים ב־`occasions.ts`.
 *   6. **מחיר** — לא. לא כאן ולא בשום מקום עד שיהיה מנעול מחירים.
 *
 * ─────────────────────────────────────────────────────────────────────
 *  דוגמה — **בהערה בלבד. לעולם לא בתוך `MENUS`.**
 * ─────────────────────────────────────────────────────────────────────
 * ```ts
 * {
 *   id: "shef-italki",
 *   nameHe: "תפריט שף איטלקי",
 *   kickerHe: "המנות שהמסעדה מוציאה בערב רגיל",
 *   dishIds: ["antipasti-misto", "tagliatelle-ragu", "tiramisu"],
 *   serviceFormats: ["buffet_on_site", "plated_staffed"],
 *   occasions: ["private-events", "business"],
 *   pricePerPerson: null,
 * }
 * ```
 *
 * ‎spec: 01 §6.2, 02 §3.4 (סקשן «תפריטי השף» מרונדר רק לצורת הגשה
 * שאושרה), 02 §4.1 (בחירת תפריט מזריעה את הבנאי), 02 §2.2 (מנעולי המחיר).
 */

import type { Slot, BranchId } from "@/content/business";
import type { ServiceFormat } from "@shared/lead-constants";
import type { OccasionId } from "@/content/occasions";
import {
  CATERING_DISHES,
  isCateringDish,
  type Dish,
  type DishId,
} from "@/content/dishes";

/* ═══════════════════ אוצר מילים ═══════════════════ */

/** slug לטיני יציב, כמו `DishId`. מימד אנליטיקה. */
export type MenuId = string;

/**
 * ‎`OccasionId` מוגדר **פעם אחת בלבד**, ב־`content/occasions.ts`, שם הוא
 * יושב לצד הנתיב, שורת הכוונה והשער של כל אירוע. הוא מיוצא מחדש כאן רק
 * כדי שצרכן שכבר מייבא מהמודול הזה לא ייאלץ לייבא משני קבצים.
 *
 * גרסה קודמת של הקובץ הזה הגדירה רשימת אירועים משלה. היא הייתה צרה יותר
 * (חסרו `urgent` ו־`pasta-bar`), ושתי הגדרות מתחרות לאותו מזהה הן בדיוק
 * סוג התקלה שלא מתפוצצת בקומפילציה אלא מחזירה רשימה ריקה בשקט.
 *
 * ⚠ הייבוא מ־`occasions.ts` חייב להישאר **type-only**, כאן ובכל מקום
 * בקובץ הזה. `occasions.ts` מייבא מכאן ערך של ממש (`menusForOccasion`),
 * ולכן ייבוא ערך בכיוון ההפוך סוגר מעגל: `menus → occasions → menus`.
 * ייבוא טיפוסים נמחק בקומפילציה ולכן אינו יוצר צלע במעגל הריצה; ייבוא
 * ערך כן, ואז קבוע ברמת המודול שנגזר ממנו יתפוצץ ב־TDZ בטעינה, לפני
 * שהאפליקציה עולה. גרף הריצה חייב להישאר `occasions → menus → dishes`.
 */
export type { OccasionId } from "@/content/occasions";

/* ═══════════════════ הרשומה ═══════════════════ */

export interface CateringMenu {
  /** slug יציב. לא לשנות אחרי שנקבע. */
  id: MenuId;

  nameHe: string;

  /** שורת פתיח מעל השם. `null` ⇒ השורה נשמטת, והכרטיס נפתח בשם. */
  kickerHe: string | null;

  /**
   * המנות שבתפריט, בסדר שבו יופיעו. אפשר להשאיר ריק ולשייך מצד המנה
   * (`dish.menus`) — `dishesForMenu()` מאחד את שני הכיוונים ומעדיף את
   * הסדר שנקבע כאן.
   */
  dishIds: readonly DishId[];

  /**
   * צורות ההגשה שהתפריט מתאים להן.
   *
   * תפריט שיש לו בדיוק אחת מזריע את `service_format` בבנאי ההצעה
   * (‎02 §4.1). יותר מאחת — לא מזריע דבר, וזו התנהגות תקינה ולא שגיאה.
   *
   * התאמה אינה הצעה: האם צורת הגשה **מוצעת** בכלל היא עובדת לקוח נפרדת
   * שמקומה ב־`config/service-formats.ts`.
   */
  serviceFormats: readonly ServiceFormat[];

  /** תיוג לעמודי האירועים. ריק הוא תקין. */
  occasions: readonly OccasionId[];

  /**
   * **נשאר `null`.**
   *
   * מחיר לסועד הוא ההתחייבות המסחרית המסוכנת ביותר באתר, ואין לו מנעול:
   * לא נמסר מחיר פתיחה, לא נמסר מה הוא כולל, ולא נמסר אם הוא כולל מע״מ.
   * מספר בלי שלושת אלה מעגן כל שיחת מכירה במקום הלא נכון.
   *
   * הקובץ הזה גם אינו הבית של מחירים כשיגיעו — הם חיים ב־`config/pricing.ts`
   * מאחורי המנעולים של ‎02 §2.2, וקומפוננטת המחיר מסרבת לרנדר בלי טקסט
   * ההסתייגות של הלקוח. השדה קיים כאן כדי שהמבנה יהיה מלא ומתועד, וכדי
   * שיהיה מקום אחד לבדוק מולו שהוא ריק — `validateMenus()` מתריעה אם לא.
   * בכוונה אין לו עזר שפותר אותו לתצוגה: אין דרך לרנדר אותו בטעות.
   */
  pricePerPerson: Slot<number>;
}

/* ═══════════════════ הנתונים ═══════════════════ */

/** ריק, וזה המצב התקין להיום. */
export const MENUS: readonly CateringMenu[] = [];

/* ═══════════════════ פתרון מנות ═══════════════════ */

/**
 * המנות של תפריט: איחוד שני כיווני השיוך, מסונן דרך שער התצוגה של המנה.
 *
 * הסדר: קודם `menu.dishIds` לפי סדרו — סדר בתפריט הוא החלטה עריכתית
 * ולא מקרה — ואחריו מנות שהצהירו על השיוך מצידן, בסדר שבו נמסרו.
 * כפילויות נזרקות. מזהה שאינו קיים, או מנה שאיבדה את זמינותה
 * לקייטרינג, נשמטים בשקט.
 *
 * מקבל מזהה או את הרשומה עצמה. תפריט לא מוכר ⇒ `[]`.
 */
export function dishesForMenu(menu: MenuId | CateringMenu): Dish[] {
  const record = typeof menu === "string" ? menuById(menu) : menu;
  if (!record) return [];

  const seen = new Set<DishId>();
  const out: Dish[] = [];

  for (const id of record.dishIds) {
    if (seen.has(id)) continue;
    const dish = CATERING_DISHES.find((d) => d.id === id);
    if (!dish) continue;
    seen.add(id);
    out.push(dish);
  }

  for (const dish of CATERING_DISHES) {
    if (seen.has(dish.id)) continue;
    if (!dish.menus.includes(record.id)) continue;
    seen.add(dish.id);
    out.push(dish);
  }

  return out;
}

/** האם לתפריט יש בכלל מה להראות. השער של כל כרטיס תפריט. */
export function hasMenuDishes(menu: MenuId | CateringMenu): boolean {
  return dishesForMenu(menu).length > 0;
}

/* ═══════════════════ שליפה ═══════════════════ */

/** תפריט לפי מזהה, מהרשימה הגולמית. לא נמצא — `null`. */
export function menuById(id: MenuId): CateringMenu | null {
  return MENUS.find((m) => m.id === id) ?? null;
}

/**
 * התפריטים שמותר לרנדר: אלה שנותרה בהם ולו מנה אחת זמינה לקייטרינג.
 * זו הרשימה שכל צרכן עובד מולה. `MENUS` הגולמי מיועד לכלים בלבד.
 */
export function renderableMenus(): CateringMenu[] {
  return MENUS.filter(hasMenuDishes);
}

/** האם יש בכלל תפריט להראות. `if (!hasMenus()) return null;` */
export function hasMenus(): boolean {
  return MENUS.some(hasMenuDishes);
}

/**
 * התפריטים המתאימים לסוג אירוע. עמוד אירוע קורא לזה, ואם חזר `[]` —
 * סקשן התפריטים שלו לא מרונדר, והעמוד נשען על מה שהוא כן יודע.
 */
export function menusForOccasion(occasion: OccasionId): CateringMenu[] {
  return renderableMenus().filter((m) => m.occasions.includes(occasion));
}

/** האם לאירוע יש תפריט להראות. */
export const hasMenusForOccasion = (occasion: OccasionId): boolean =>
  menusForOccasion(occasion).length > 0;

/**
 * התפריטים המתאימים לצורת הגשה. הבסיס לסקשן «תפריטי השף» (02 §3.4).
 *
 * שימו לב: החזרת תפריט כאן אינה אומרת שצורת ההגשה מוצעת. אישור צורת
 * ההגשה הוא עובדת לקוח נפרדת, ומקומה ב־`config/service-formats.ts`.
 * כשהמודול ההוא ייווצר, הצרכן חייב לחתוך את שתי הרשימות.
 */
export function menusForServiceFormat(format: ServiceFormat): CateringMenu[] {
  return renderableMenus().filter((m) => m.serviceFormats.includes(format));
}

/**
 * התפריטים שיש בהם מנה שמוגשת במסעדה הזאת — שאילתת תפריט לעמוד מסעדה.
 *
 * **לא** «התפריטים שהמטבח הזה מוציא». איזו מסעדה מבשלת את הקייטרינג לא
 * נמסר, ואין לגזור זאת מכאן. ראו `dishesForBranch()` ב־`dishes.ts`.
 */
export function menusForBranch(branch: BranchId): CateringMenu[] {
  return renderableMenus().filter((m) =>
    dishesForMenu(m).some((d) => d.branches.includes(branch)),
  );
}

/**
 * צורות ההגשה שיש להן לפחות תפריט אחד עם מנות. מחזיר `[]` היום, ולכן
 * סקשן «תפריטי השף» אינו מרונדר בשום עמוד.
 */
export function serviceFormatsWithMenus(): ServiceFormat[] {
  const seen = new Set<ServiceFormat>();
  for (const menu of renderableMenus()) {
    for (const format of menu.serviceFormats) seen.add(format);
  }
  return [...seen];
}

/**
 * צורת ההגשה שבחירת התפריט מזריעה לבנאי ההצעה, אם היא חד־משמעית.
 * יותר מאחת, או אף אחת — `null`, והבנאי פשוט לא שואל כלום. ‎(02 §4.1)
 */
export function seededServiceFormat(menu: MenuId | CateringMenu): ServiceFormat | null {
  const record = typeof menu === "string" ? menuById(menu) : menu;
  if (!record) return null;
  return record.serviceFormats.length === 1 ? record.serviceFormats[0] : null;
}

/* ═══════════════════ בדיקת שפיות ═══════════════════ */

/**
 * כמו `validateDishes()` — מחזירה רשימת בעיות ולא זורקת.
 *
 * הבדיקה החשובה כאן היא מזהה מנה שאינו קיים: הוא נשמט בשקט בתצוגה,
 * ובלי אזהרה אף אחד לא ישים לב שהתפריט התקצר.
 *
 * מזהי אירוע **אינם** נבדקים כאן, בכוונה: `OccasionId` הוא איחוד סגור,
 * והמקום היחיד שבו מזהה אירוע נכתב הוא ליטרל `MENUS` שבקובץ הזה — כלומר
 * הקומפיילר כבר תופס כל מזהה שגוי. בדיקה בזמן ריצה הייתה מחייבת לייבא
 * את `OCCASIONS` כערך מ־`occasions.ts`, וזה סוגר את מעגל הריצה שמתואר
 * למעלה. תמורת אפס ביטחון נוסף.
 */
export function validateMenus(
  menus: readonly CateringMenu[] = MENUS,
  dishes: readonly Dish[] = CATERING_DISHES,
): string[] {
  const problems: string[] = [];
  const seen = new Set<MenuId>();
  const known = new Map(dishes.map((d) => [d.id, d] as const));

  for (const menu of menus) {
    const at = `menu "${menu.id || "(ללא מזהה)"}"`;

    if (!menu.id) problems.push(`${at}: חסר מזהה`);
    else if (seen.has(menu.id)) problems.push(`${at}: מזהה כפול`);
    else seen.add(menu.id);

    if (!menu.nameHe?.trim()) problems.push(`${at}: חסר שם`);

    for (const id of menu.dishIds) {
      const dish = known.get(id);
      if (!dish) problems.push(`${at}: מזהה מנה לא מוכר או לא זמינה לקייטרינג — "${id}"`);
      else if (!isCateringDish(dish)) problems.push(`${at}: המנה "${id}" אינה זמינה לקייטרינג`);
    }

    if (menu.pricePerPerson !== null) {
      problems.push(`${at}: מחיר על תפריט. מחירים חיים רק ב־config/pricing.ts`);
    }

    if (/₪|\bש"?ח\b/.test(`${menu.nameHe} ${menu.kickerHe ?? ""}`)) {
      problems.push(`${at}: מחיר בטקסט`);
    }
  }

  return problems;
}

if (import.meta.env?.DEV) {
  const problems = validateMenus();
  if (problems.length > 0) {
    console.warn(`[menus.ts] ${problems.length} בעיות:\n · ${problems.join("\n · ")}`);
  }
}
