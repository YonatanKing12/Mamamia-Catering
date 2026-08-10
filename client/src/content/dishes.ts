/**
 * ═══════════════════════════════════════════════════════════════════════
 *  המנות — חומר הגלם של האתר.
 * ═══════════════════════════════════════════════════════════════════════
 *
 * הכיוון שנבחר הוא «התפריט הוא האתר»: שמות המנות הם הטיפוגרפיה, ולא
 * תוכן שנשפך אחר כך לתוך רשת של תמונות. לכן הקובץ הזה אינו קובץ נתונים
 * צדדי — הוא עמוד השדרה של העיצוב.
 *
 * והוא ריק. `DISHES` הוא מערך ריק, וזו המציאות היום: הלקוח טרם מסר אילו
 * מנות זמינות בפועל לקייטרינג. זו העובדה החוסמת היחידה שנותרה, והיא
 * מתועדת ככזו במפרט (01 §3.3, 02 §4.2).
 *
 * ─────────────────────────────────────────────────────────────────────
 *  החוק
 * ─────────────────────────────────────────────────────────────────────
 * כל צרכן חייב להתנוון לאין כשהרשימה ריקה. אין מנת דמו, אין שורת
 * «מנה לדוגמה», אין שלד אפור שממתין לתוכן. סקשן שלא נותרה בו ולו מנה
 * אחת — אינו מרונדר. עמוד שכל הסקשנים שלו כאלה נראה מכוון וגמור, כי
 * זה המצב שבו האתר עשוי לעלות לאוויר.
 *
 * העזרים כאן מחזירים `[]`, `null` או `false` במצב הריק, תמיד. אין להם
 * מסלול שבו הם מייצרים ערך שלא נמסר.
 *
 * אין שדה מחיר על מנה. מחיר למנה הוא מחיר, ומחירים חיים אך ורק מאחורי
 * המנעולים של `config/pricing.ts` — או שאינם קיימים. (01 §6.2, 02 §2.2)
 *
 * ─────────────────────────────────────────────────────────────────────
 *  המיצוב — מה המשמעות של `branches` כאן
 * ─────────────────────────────────────────────────────────────────────
 * לקרוא קודם את בלוק המיצוב בראש `content/business.ts`.
 *
 * המסעדות והקייטרינג הם שני עיסוקים נפרדים. הקייטרינג מבושל במטבח של
 * **אחת** מהמסעדות, ואיזו — לא נמסר (`SLOTS.cateringKitchenBranch === null`).
 *
 * לכן `dish.branches` **אינו** אומר «המטבחים שמייצרים את הקייטרינג».
 * הוא אומר דבר צר אחד בלבד:
 *
 *     באילו מסעדות המנה הזאת מופיעה בתפריט ומוגשת לסועדים.
 *
 * זו עובדה על **המסעדות**, והיא הקשר מותג. היא ההוכחה שהמנה אמיתית ולא
 * שם שהומצא לאתר — וזה בדיוק הערך שלה בכיוון «התפריט הוא האתר». היא
 * אינה, ואסור שתהפוך ל־, טענה על היכן מבושל הקייטרינג או על היקפו.
 *
 * המפרט (01 §6.2) מנסח את השדה «which kitchens actually cook it», ובסעיף
 * §3.2 מגדיר תג מקור דו־שכבתי שהשכבה השנייה שלו היא «מהמטבח ב{סניף}»
 * בקישור ל־`/kitchens/{branch}`. **השכבה השנייה אינה ממומשת כאן ולא
 * תמומש**: היא מייחסת את הקייטרינג למטבח של סניף מסוים, וזו בדיוק הטענה
 * שנמחקה מהאתר. ראו `provenanceMarkFor()`.
 *
 * ─────────────────────────────────────────────────────────────────────
 *  מה הלקוח צריך למסור, ובאיזה מבנה
 * ─────────────────────────────────────────────────────────────────────
 * טבלה אחת. שורה למנה. מספיק גיליון אחד:
 *
 *   1. **שם המנה** — כלשונו בתפריט המסעדה. לא לתרגם, לא לייפות, לא
 *      לקצר. השם הוא הטיפוגרפיה של האתר.
 *   2. **תיאור קצר** — עד ‎12 מילים, או ריק. ריק הוא תשובה תקינה ונפוצה;
 *      תפריט שף אמיתי מלא בשורות בלי תיאור. תיאור ארוך מ־12 מילים שובר
 *      את שורת המנה בעיצוב ונחסם ב־`validateDishes()`.
 *   3. **קטגוריה** — אחת מתוך: אנטיפסטי · פסטות · עיקריות · קינוחים ·
 *      מגשים. (`Course` למטה.)
 *   4. **זמינה לקייטרינג?** — כן / לא. **זו ההצהרה הקריטית.** «לא» או
 *      «לא בטוח» ⇒ המנה לעולם אינה מוצגת באתר. אין ברירת מחדל: מנה בלי
 *      תשובה מפורשת מתנהגת כ«לא».
 *   5. **באילו מסעדות המנה מוגשת בתפריט** — אחת או יותר מתוך הרצליה
 *      פיתוח · רעננה · פתח תקווה. רשימה ריקה ⇒ המנה אינה מוצגת, גם אם
 *      סומנה זמינה: מנה שאיננו יכולים להצביע על תפריט מסעדה שהיא יושבת
 *      בו היא שם בלי גיבוי, וזה כל מה שהכיוון הזה מוכר.
 *   6. **סימוני תזונה** — צמחוני / טבעוני / ללא גלוטן במרכיבים / חלבי.
 *      אפשר יותר מאחד, אפשר כלום.
 *   7. **קישור למנה בתפריט המסעדה החי** — לכל מסעדה בנפרד, אם יש. זה
 *      מה שמאפשר את תג המקור. בלי קישור אין תג.
 *   8. **לאילו תפריטי קייטרינג המנה שייכת** — מזהים מ־`content/menus.ts`.
 *      אפשר להשאיר ריק ולנהל את השיוך מצד התפריט; שני הכיוונים נתמכים.
 *
 * מה שהלקוח **אינו** צריך למסור: מזהים. את ה־`id` קובע מי שמזין את
 * הנתונים — slug לטיני קצר, יציב, שלא משתנה לעולם. הוא מימד באנליטיקה
 * ונשמר על שורת הליד; שינוי שלו מנתק היסטוריה. שינוי שם עברי — מותר
 * ורצוי. שינוי `id` — לא.
 *
 * ─────────────────────────────────────────────────────────────────────
 *  מה קורה ברגע שהרשימה מגיעה
 * ─────────────────────────────────────────────────────────────────────
 * מדביקים את השורות לתוך `DISHES` ושום קוד אחר לא משתנה. סקשן המנות,
 * שורות ההירו, «הוסיפו לתפריט שלי», סינון לפי מסעדה, קיבוץ לפי קטגוריה,
 * חתכי עמודי האירועים וה־JSON-LD של ‎`/menus` — כולם נתלים בעזרים שבקובץ
 * הזה ובודקים אותם לפני שהם מרנדרים משהו.
 *
 * ─────────────────────────────────────────────────────────────────────
 *  דוגמה — **בהערה בלבד. לעולם לא בתוך `DISHES`.**
 * ─────────────────────────────────────────────────────────────────────
 * ```ts
 * {
 *   id: "tagliatelle-ragu",
 *   nameHe: "טליאטלה ראגו",
 *   descriptionHe: "ראגו בקר בבישול ארוך, פרמז'ן מגורר בצד",
 *   course: "pasta",
 *   cateringAvailable: true,
 *   branches: ["herzliya_pituach", "raanana"],
 *   dietary: [],
 *   liveMenuUrl: { herzliya_pituach: "https://…/menu#tagliatelle" },
 *   menus: ["shef-italki"],
 *   heroEligible: true,
 * }
 * ```
 * שימו לב לְמה שאין בדוגמה: מחיר, מינימום מנות, זמן הכנה, משקל מגש.
 * כל אלה התחייבויות מסחריות, ואף אחת מהן אינה שדה של מנה.
 *
 * ‎spec: 01 §6.2 (חוזה הנתונים — גובר על 02 §4.2 לפי 00-spec-review B1),
 * 01 §3.2 (תג המקור), 01 §3.3 (רג'יסטר לפי מספר המנות),
 * 00-spec-review E3 (מזהים מיושנים בטיוטה משוחזרת).
 */

import type { BranchId } from "@/content/business";
import { BRANCHES } from "@/content/business";
import type { MenuId } from "@/content/menus";

/* ═══════════════════ אוצר מילים ═══════════════════ */

/** slug לטיני יציב. מימד אנליטיקה — אינו משתנה אחרי שנקבע. */
export type DishId = string;

/**
 * קטגוריות התפריט, לפי סדר ההגשה. הסדר כאן הוא סדר הקיבוץ בעמוד
 * (‎01 §4 P-02), ולכן שינוי סדר כאן משנה את סדר הסקשנים.
 *
 * המזהים מילה במילה מ־01 §6.2 — ובפרט `dessert` ביחיד. `content/occasions.ts`
 * מגדיר `CourseId` באותם ערכים בדיוק ומזין אותם ל־`MenuCut.courses`; כל
 * סטייה כאן (למשל `desserts` ברבים) לא תיצור שגיאת קומפילציה אלא תגרום
 * לחתך הקינוחים בעמודי האירועים להחזיר אפס מנות בשקט.
 */
export const COURSES = ["fish", "beef", "chicken", "vegetarian", "sides", "salads"] as const;

export type Course = (typeof COURSES)[number];

/** כותרות הקיבוץ, מילה במילה מ־01 §4 P-02. */
export const COURSE_LABEL: Record<Course, string> = {
  fish: "דגים",
  beef: "בקר",
  chicken: "עוף",
  vegetarian: "צמחוני",
  sides: "תוספות",
  salads: "סלטים",
};

/**
 * סימוני תזונה.
 *
 * ‎`gluten_free_ingredients` — ולא `gluten_free`. המטבח משותף, ולכן
 * «ללא גלוטן» סתמי הוא הצהרת בטיחות שאיננו יכולים לעמוד מאחוריה. הניסוח
 * המלא («מוכן במטבח שאינו נקי מגלוטן») הוא טקסט של הלקוח ומרונדר פעם
 * אחת בשאלות ותשובות — לא כאן, ולא כתגית. ‎(01 §6.2, 02 §4.2)
 *
 * ‎`dairy` — «חלבי» הוא סימון תזונתי וגם סימון כשרותי. הוא **אינו** אומר
 * דבר על ההפרדה במטבח או על תעודת הכשרות; אלה עובדות של הלקוח והן
 * יושבות ב־`SLOTS.kashrutByBranch`. הוא קיים כאן כי `content/occasions.ts`
 * מגדיר ‎`DishTag = "dairy"` ומזין אותו ל־`MenuCut.requiresTag` עבור
 * ‎`/catering/dairy`; המזהה חייב להישאר זהה בשני הקבצים.
 */
export const DIETARY_FLAGS = [
"vegetarian",
"vegan",
"gluten_free_ingredients",
"dairy",
] as const;

export type DietaryFlag = (typeof DIETARY_FLAGS)[number];

/**
 * התוויות מנוסחות כך שכל אחת עומדת בפני עצמה בלי הסתייגות נוספת.
 * ‎`gluten_free_ingredients` מנוסח על המרכיבים ולא על התוצאה, בכוונה.
 */
export const DIETARY_LABEL: Record<DietaryFlag, string> = {
  vegetarian: "צמחוני",
  vegan: "טבעוני",
  gluten_free_ingredients: "ללא גלוטן במרכיבים",
  dairy: "חלבי",
};

/* ═══════════════════ הרשומה ═══════════════════ */

export interface Dish {
  /** slug יציב. לא לשנות אחרי שנקבע — מימד אנליטיקה ושדה על שורת הליד. */
  id: DishId;

  /** שם המנה כלשונו בתפריט המסעדה. */
  nameHe: string;

  /** עד ‎12 מילים, או `null`. `null` הוא מצב תקין ונפוץ. */
  descriptionHe: string | null;

  course: Course;

  /**
   * עובדת לקוח. `true` בלבד מציג את המנה. `false` ו־`null` שקולים,
   * ובכוונה: «עוד לא בדקנו» אינו «כן».
   */
  cateringAvailable: boolean | null;

  /**
   * המסעדות שהמנה מופיעה בתפריט שלהן ומוגשת בהן לסועדים. עובדת מסעדה,
   * לא עובדת קייטרינג — ראו בלוק המיצוב בראש הקובץ.
   * רשימה ריקה ⇒ המנה אינה מוצגת בשום מקום.
   *
   * (‎01 §6.2 קורא לשדה `branches`; 02 §4.2 קרא לו `servedAtBranches`.
   * ‎00-spec-review B1 — 01 גובר.)
   */
  branches: readonly BranchId[];

  dietary: readonly DietaryFlag[];

  /**
   * קישור למנה בתפריט המסעדה החי, לכל מסעדה בנפרד.
   * זה, ורק זה, מפעיל את תג המקור. חסר ⇒ אין תג ואין קישור — לא גרסה
   * מרוככת של התג. ‎(01 §3.2, 02 §3.2)
   */
  liveMenuUrl?: Partial<Record<BranchId, string>>;

  /**
   * לאילו תפריטי קייטרינג המנה שייכת. אפשר להשאיר ריק ולנהל את השיוך
   * מצד התפריט (`menu.dishIds`) — `dishesForMenu()` מאחד את שני הכיוונים.
   */
  menus: readonly MenuId[];

  /**
   * רשאית להופיע בשורות המנה שמתחת לכותרת ההירו. ברירת המחדל היא לא:
   * שורת הירו היא בחירה עריכתית, לא כל מה שיש בתפריט. ‎(01 §6.2)
   */
  heroEligible?: boolean;
}

/* ═══════════════════ הנתונים ═══════════════════ */

/**
 * ריק, וזה המצב התקין להיום.
 *
 * למי שממלא: הדוגמה נמצאת בראש הקובץ, בהערה. אין להעתיק אותה לכאן
 * «רק כדי לראות איך זה נראה» — מנה מומצאת שמגיעה לענף ראשי היא מנה
 * שלקוח יזמין ושהמטבח לא יידע לבשל.
 */
/**
 * התפריט, כפי שנמסר על ידי הלקוח (תפריט מאמאמיה — טעמים של בית).
 * השמות הם שמות המנות כלשונם בתפריט. תיאורים, תמונות ותוספות מחיר
 * טרם נמסרו ולכן `null` — והקומפוננטות משמיטות אותם.
 */
export const DISHES: readonly Dish[] = [
  /* ── fish ── */
  { id: "fish-01", nameHe: "דג מרוקאי ברוטב", descriptionHe: null,
    course: "fish", cateringAvailable: true, dietary: [],
    branches: [], menus: [] },
  { id: "fish-02", nameHe: "שניצל דג מטוגן", descriptionHe: null,
    course: "fish", cateringAvailable: true, dietary: [],
    branches: [], menus: [] },
  { id: "fish-03", nameHe: "דג מרלוזה מטוגן", descriptionHe: null,
    course: "fish", cateringAvailable: true, dietary: [],
    branches: [], menus: [] },
  { id: "fish-04", nameHe: "קציצות דגים ברוטב", descriptionHe: null,
    course: "fish", cateringAvailable: true, dietary: [],
    branches: [], menus: [] },
  { id: "fish-05", nameHe: "דג נסיכה חריימה", descriptionHe: null,
    course: "fish", cateringAvailable: true, dietary: [],
    branches: [], menus: [] },
  { id: "fish-06", nameHe: "סלומון אפוי", descriptionHe: null,
    course: "fish", cateringAvailable: true, dietary: [],
    branches: [], menus: [] },

  /* ── beef ── */
  { id: "beef-01", nameHe: "צלי בקר", descriptionHe: null,
    course: "beef", cateringAvailable: true, dietary: [],
    branches: [], menus: [] },
  { id: "beef-02", nameHe: "מוקפץ רוסבייף", descriptionHe: null,
    course: "beef", cateringAvailable: true, dietary: [],
    branches: [], menus: [] },
  { id: "beef-03", nameHe: "מפרום ברוטב", descriptionHe: null,
    course: "beef", cateringAvailable: true, dietary: [],
    branches: [], menus: [] },
  { id: "beef-04", nameHe: "קציצות בקר ברוטב", descriptionHe: null,
    course: "beef", cateringAvailable: true, dietary: [],
    branches: [], menus: [] },
  { id: "beef-05", nameHe: "תבשיל גולש", descriptionHe: null,
    course: "beef", cateringAvailable: true, dietary: [],
    branches: [], menus: [] },
  { id: "beef-06", nameHe: "קובה סלק/דלעת", descriptionHe: null,
    course: "beef", cateringAvailable: true, dietary: [],
    branches: [], menus: [] },
  { id: "beef-07", nameHe: "קובה מטוגנת", descriptionHe: null,
    course: "beef", cateringAvailable: true, dietary: [],
    branches: [], menus: [] },
  { id: "beef-08", nameHe: "מוסקה חצילים", descriptionHe: null,
    course: "beef", cateringAvailable: true, dietary: [],
    branches: [], menus: [] },
  { id: "beef-09", nameHe: "בסטיל", descriptionHe: null,
    course: "beef", cateringAvailable: true, dietary: [],
    branches: [], menus: [] },

  /* ── chicken ── */
  { id: "chicken-01", nameHe: "כרעיים בתנור", descriptionHe: null,
    course: "chicken", cateringAvailable: true, dietary: [],
    branches: [], menus: [] },
  { id: "chicken-02", nameHe: "שניצלים מאמא", descriptionHe: null,
    course: "chicken", cateringAvailable: true, dietary: [],
    branches: [], menus: [] },
  { id: "chicken-03", nameHe: "מוקפץ עוף", descriptionHe: null,
    course: "chicken", cateringAvailable: true, dietary: [],
    branches: [], menus: [] },
  { id: "chicken-04", nameHe: "סטייק פרגית", descriptionHe: null,
    course: "chicken", cateringAvailable: true, dietary: [],
    branches: [], menus: [] },
  { id: "chicken-05", nameHe: "קציצות עוף ברוטב", descriptionHe: null,
    course: "chicken", cateringAvailable: true, dietary: [],
    branches: [], menus: [] },
  { id: "chicken-06", nameHe: "פרגית ממולא", descriptionHe: null,
    course: "chicken", cateringAvailable: true, dietary: [],
    branches: [], menus: [] },
  { id: "chicken-07", nameHe: "חזה עוף ממולא", descriptionHe: null,
    course: "chicken", cateringAvailable: true, dietary: [],
    branches: [], menus: [] },
  { id: "chicken-08", nameHe: "שווארמה פרגית", descriptionHe: null,
    course: "chicken", cateringAvailable: true, dietary: [],
    branches: [], menus: [] },
  { id: "chicken-09", nameHe: "קבב על האש", descriptionHe: null,
    course: "chicken", cateringAvailable: true, dietary: [],
    branches: [], menus: [] },
  { id: "chicken-10", nameHe: "מעורב ירושלמי", descriptionHe: null,
    course: "chicken", cateringAvailable: true, dietary: [],
    branches: [], menus: [] },
  { id: "chicken-11", nameHe: "חזה עוף בגריל", descriptionHe: null,
    course: "chicken", cateringAvailable: true, dietary: [],
    branches: [], menus: [] },

  /* ── vegetarian ── */
  { id: "vegetarian-01", nameHe: "קציצות ירק", descriptionHe: null,
    course: "vegetarian", cateringAvailable: true, dietary: ["vegetarian"],
    branches: [], menus: [] },
  { id: "vegetarian-02", nameHe: "שווארמה צמחונית", descriptionHe: null,
    course: "vegetarian", cateringAvailable: true, dietary: ["vegetarian"],
    branches: [], menus: [] },

  /* ── sides ── */
  { id: "sides-01", nameHe: "אורז לבן", descriptionHe: null,
    course: "sides", cateringAvailable: true, dietary: ["vegetarian"],
    branches: [], menus: [] },
  { id: "sides-02", nameHe: "אורז ירוק פרסי", descriptionHe: null,
    course: "sides", cateringAvailable: true, dietary: ["vegetarian"],
    branches: [], menus: [] },
  { id: "sides-03", nameHe: "אורז מקלובה", descriptionHe: null,
    course: "sides", cateringAvailable: true, dietary: ["vegetarian"],
    branches: [], menus: [] },
  { id: "sides-04", nameHe: "אורז מגדרה", descriptionHe: null,
    course: "sides", cateringAvailable: true, dietary: ["vegetarian"],
    branches: [], menus: [] },
  { id: "sides-05", nameHe: "אורז אדום", descriptionHe: null,
    course: "sides", cateringAvailable: true, dietary: ["vegetarian"],
    branches: [], menus: [] },
  { id: "sides-06", nameHe: "שעועית ירוקה ברוטב", descriptionHe: null,
    course: "sides", cateringAvailable: true, dietary: ["vegetarian"],
    branches: [], menus: [] },
  { id: "sides-07", nameHe: "שעועית לבנה ברוטב", descriptionHe: null,
    course: "sides", cateringAvailable: true, dietary: ["vegetarian"],
    branches: [], menus: [] },
  { id: "sides-08", nameHe: "שעועית צהובה עם ירקות", descriptionHe: null,
    course: "sides", cateringAvailable: true, dietary: ["vegetarian"],
    branches: [], menus: [] },
  { id: "sides-09", nameHe: "אנטיפסטי", descriptionHe: null,
    course: "sides", cateringAvailable: true, dietary: ["vegetarian"],
    branches: [], menus: [] },
  { id: "sides-10", nameHe: "זיתים מרוקאים ברוטב", descriptionHe: null,
    course: "sides", cateringAvailable: true, dietary: ["vegetarian"],
    branches: [], menus: [] },
  { id: "sides-11", nameHe: "קוסקוס ירקות", descriptionHe: null,
    course: "sides", cateringAvailable: true, dietary: ["vegetarian"],
    branches: [], menus: [] },
  { id: "sides-12", nameHe: "תפו״א אפוי בתנור", descriptionHe: null,
    course: "sides", cateringAvailable: true, dietary: ["vegetarian"],
    branches: [], menus: [] },
  { id: "sides-13", nameHe: "תפו״א פרוסות", descriptionHe: null,
    course: "sides", cateringAvailable: true, dietary: ["vegetarian"],
    branches: [], menus: [] },
  { id: "sides-14", nameHe: "תפו״א סירה", descriptionHe: null,
    course: "sides", cateringAvailable: true, dietary: ["vegetarian"],
    branches: [], menus: [] },

  /* ── salads ── */
  { id: "salads-01", nameHe: "חמוצי הבית", descriptionHe: null,
    course: "salads", cateringAvailable: true, dietary: ["vegetarian"],
    branches: [], menus: [] },
  { id: "salads-02", nameHe: "גזר בלימון", descriptionHe: null,
    course: "salads", cateringAvailable: true, dietary: ["vegetarian"],
    branches: [], menus: [] },
  { id: "salads-03", nameHe: "גזר מרוקאי", descriptionHe: null,
    course: "salads", cateringAvailable: true, dietary: ["vegetarian"],
    branches: [], menus: [] },
  { id: "salads-04", nameHe: "גרגירי חומוס", descriptionHe: null,
    course: "salads", cateringAvailable: true, dietary: ["vegetarian"],
    branches: [], menus: [] },
  { id: "salads-05", nameHe: "חומוס", descriptionHe: null,
    course: "salads", cateringAvailable: true, dietary: ["vegetarian"],
    branches: [], menus: [] },
  { id: "salads-06", nameHe: "טחינה", descriptionHe: null,
    course: "salads", cateringAvailable: true, dietary: ["vegetarian"],
    branches: [], menus: [] },
  { id: "salads-07", nameHe: "סחוג אדום", descriptionHe: null,
    course: "salads", cateringAvailable: true, dietary: ["vegetarian"],
    branches: [], menus: [] },
  { id: "salads-08", nameHe: "סחוג ירוק", descriptionHe: null,
    course: "salads", cateringAvailable: true, dietary: ["vegetarian"],
    branches: [], menus: [] },
  { id: "salads-09", nameHe: "פלפל חריף מטוגן", descriptionHe: null,
    course: "salads", cateringAvailable: true, dietary: ["vegetarian"],
    branches: [], menus: [] },
  { id: "salads-10", nameHe: "חצילים פיקנטי", descriptionHe: null,
    course: "salads", cateringAvailable: true, dietary: ["vegetarian"],
    branches: [], menus: [] },
  { id: "salads-11", nameHe: "חציל יווני", descriptionHe: null,
    course: "salads", cateringAvailable: true, dietary: ["vegetarian"],
    branches: [], menus: [] },
  { id: "salads-12", nameHe: "סלט ירקות קצוץ", descriptionHe: null,
    course: "salads", cateringAvailable: true, dietary: ["vegetarian"],
    branches: [], menus: [] },
  { id: "salads-13", nameHe: "סלט סלק", descriptionHe: null,
    course: "salads", cateringAvailable: true, dietary: ["vegetarian"],
    branches: [], menus: [] },
  { id: "salads-14", nameHe: "סלט תפו״א", descriptionHe: null,
    course: "salads", cateringAvailable: true, dietary: ["vegetarian"],
    branches: [], menus: [] },
  { id: "salads-15", nameHe: "מטבוחה", descriptionHe: null,
    course: "salads", cateringAvailable: true, dietary: ["vegetarian"],
    branches: [], menus: [] },
  { id: "salads-16", nameHe: "כרוב לבן בלימון", descriptionHe: null,
    course: "salads", cateringAvailable: true, dietary: ["vegetarian"],
    branches: [], menus: [] },
  { id: "salads-17", nameHe: "חציל במיונז", descriptionHe: null,
    course: "salads", cateringAvailable: true, dietary: ["vegetarian"],
    branches: [], menus: [] },
  { id: "salads-18", nameHe: "כרוב לבן במיונז", descriptionHe: null,
    course: "salads", cateringAvailable: true, dietary: ["vegetarian"],
    branches: [], menus: [] },
  { id: "salads-19", nameHe: "כרוב אדום במיונז", descriptionHe: null,
    course: "salads", cateringAvailable: true, dietary: ["vegetarian"],
    branches: [], menus: [] },
  { id: "salads-20", nameHe: "סלט בורגול", descriptionHe: null,
    course: "salads", cateringAvailable: true, dietary: ["vegetarian"],
    branches: [], menus: [] },
  { id: "salads-21", nameHe: "סלט טורקי", descriptionHe: null,
    course: "salads", cateringAvailable: true, dietary: ["vegetarian"],
    branches: [], menus: [] },
  { id: "salads-22", nameHe: "סלט עגבניות חריף", descriptionHe: null,
    course: "salads", cateringAvailable: true, dietary: ["vegetarian"],
    branches: [], menus: [] },
  { id: "salads-23", nameHe: "משוואיה עגבניות", descriptionHe: null,
    course: "salads", cateringAvailable: true, dietary: ["vegetarian"],
    branches: [], menus: [] },
];

/* ═══════════════════ שער התצוגה ═══════════════════ */

/**
 * המבחן היחיד שקובע אם מנה קיימת מבחינת האתר.
 * ‎01 §6.2: `cateringAvailable === true && branches.length ≥ 1`.
 */
export function isCateringDish(dish: Dish): boolean {
  /*
   * זמינות לקייטרינג היא תכונה של המנה, לא של סניף.
   *
   * הגרסה הקודמת דרשה גם `branches.length > 0`. הדרישה הזאת נולדה במודל
   * המחוק שבו הקייטרינג יצא משלושה מטבחי מסעדה ומנה הייתה זמינה או לא
   * זמינה לפי סניף. במיצוב הנכון הקייטרינג מבושל במטבח **אחד**, ואיזה —
   * לא נמסר; `branches` ריק בכל 65 המנות, ולכן התנאי איפס את כל התפריט
   * בשקט ודף התפריטים הוגש בלי מנה אחת.
   *
   * זה אותו סוג שריד כמו מסלולי `/kitchens/:slug` שנמחקו: שער שנשאר
   * מהמודל הישן וחסם עובדה שכן בידינו.
   */
  return dish.cateringAvailable === true;
}

/** כל המנות שעברו את השער, בסדר שבו נמסרו. הרשימה שכל צרכן עובד מולה. */
export const CATERING_DISHES: readonly Dish[] = DISHES.filter(isCateringDish);

/**
 * המספר שמפעיל את מתג הפריסה של ‎01 §3.3. מיוצא בנפרד כי המפרט דורש
 * ערך מחושב יחיד שאפשר לקבע עליו בדיקה.
 */
export const cateringAvailableCount: number = CATERING_DISHES.length;

/**
 * האם יש בכלל מה להראות. הבדיקה שכל סקשן מנות פותח בה.
 *
 *   `if (!hasDishes()) return null;`
 *
 * עם `branch` — האם למסעדה הזאת יש מנות משלה בתפריט. עמוד מסעדה בלי אף
 * מנה משלה משמיט את סקשן המנות ואינו נופל חזרה לרשימה הכללית: הצגת מנה
 * שלא הוצהר עליה כמוגשת שם, בעמוד של אותה מסעדה, היא בדיוק הטענה
 * חסרת הגיבוי שהתג הדו־שכבתי נועד למנוע.
 */
export function hasDishes(branch?: BranchId): boolean {
  /*
   * הארגומנט `branch` נשמר לתאימות קריאה, אך אינו מסנן: התפריט אינו
   * מוגדר לפי סניף (ראו `isCateringDish`). קריאה עם סניף מחזירה את אותה
   * תשובה כמו בלעדיו, ולא `false` שקרי.
   */
  void branch;
  return CATERING_DISHES.length > 0;
}

/* ═══════════════════ רג'יסטר הפריסה (01 §3.3) ═══════════════════ */

/**
 * ‎`none`     ‎0 מנות. סקשן המנות אינו מרונדר, `/menus` אינו קיים,
 *            והעמוד עובר לרג'יסטר התפעולי. **זה המצב היום.**
 * ‎`minimal`  ‎בין 1 ל־3. רשימה קצרה, בלי שורות מנה בהירו.
 * ‎`short`    ‎בין 4 ל־7. שורות הירו כן, קיבוץ לקטגוריות לא.
 * ‎`full`     ‎8 ומעלה. המערכת המלאה.
 */
export type MenuRegister = "none" | "minimal" | "short" | "full";

/**
 * הפונקציה היחידה שמכירה את הספים. שום עמוד לא כותב אותם מחדש —
 * סף שמשוכפל הוא סף שיסטה כשמישהו יעדכן רק עותק אחד.
 */
export function menuRegister(count: number = cateringAvailableCount): MenuRegister {
  if (count <= 0) return "none";
  if (count <= 3) return "minimal";
  if (count <= 7) return "short";
  return "full";
}

/** האם לקבץ לכותרות קטגוריה. רק ברג'יסטר המלא. */
export const shouldGroupByCourse = (): boolean => menuRegister() === "full";

/**
 * כמה שורות מנה מותר להירו. ‎01 §3.3 קובע ‎4 בשני הרג'יסטרים העליונים,
 * ‎0 בשניים התחתונים — ולכן הירו נשאר טיפוגרפיה בלבד היום.
 */
export function heroDishLineCount(): number {
  const register = menuRegister();
  return register === "full" || register === "short" ? 4 : 0;
}

/* ═══════════════════ שליפה ═══════════════════ */

/** מנה לפי מזהה, מבין הזמינות לקייטרינג בלבד. לא נמצאה — `null`. */
export function dishById(id: DishId): Dish | null {
  return CATERING_DISHES.find((d) => d.id === id) ?? null;
}

/**
 * המרת רשימת מזהים לרשימת מנות, בסדר שנמסר, **תוך השמטה שקטה** של כל
 * מזהה שאינו קיים או שאיבד את זמינותו לקייטרינג.
 *
 * זה התיקון ל־E3 בסקירת המפרטים: הטיוטה ב־localStorage שורדת ‎14 יום,
 * והקובץ הזה נערך בינתיים. מזהה מיושן שלא ייזרק כאן יתגלגל לשורה ריקה
 * בכרטיס הסיכום, משם להודעת הוואטסאפ, ומשם לעמודה בבסיס הנתונים.
 * כפילויות נזרקות גם הן.
 */
export function dishesByIds(ids: readonly DishId[]): Dish[] {
  const seen = new Set<DishId>();
  const out: Dish[] = [];
  for (const id of ids) {
    if (seen.has(id)) continue;
    const dish = dishById(id);
    if (!dish) continue;
    seen.add(id);
    out.push(dish);
  }
  return out;
}

/**
 * המנות שמסעדה מסוימת מגישה בתפריט שלה. זה הסינון של סקשן המנות בעמוד
 * מסעדה (‎01 §4 P-04…P-06: `dish.branches.includes(branch)`).
 *
 * שוב, ובמפורש: התוצאה אינה «מה שהמטבח הזה מייצר לקייטרינג». איזו מסעדה
 * מבשלת את הקייטרינג לא נמסר, ואין לגזור זאת מכאן.
 */
export function dishesForBranch(branch: BranchId): Dish[] {
  return CATERING_DISHES.filter((d) => d.branches.includes(branch));
}

/** מנות עם סימון תזונה מסוים — הבסיס ל־`/catering/dairy` וכדומה. */
export function dishesWithDietary(flag: DietaryFlag): Dish[] {
  return CATERING_DISHES.filter((d) => d.dietary.includes(flag));
}

/** מנות בקטגוריה אחת. */
export function dishesForCourse(course: Course): Dish[] {
  return CATERING_DISHES.filter((d) => d.course === course);
}

/**
 * שורות המנה שמתחת לכותרת ההירו. רק מנות שסומנו `heroEligible`, וכמה
 * מהן מותר — נקבע ברג'יסטר ולא בעמוד. היום מחזיר `[]` בכל מקרה, ולכן
 * ההירו נשאר טיפוגרפיה בלבד.
 */
export function heroDishes(limit: number = heroDishLineCount()): Dish[] {
  if (limit <= 0) return [];
  return CATERING_DISHES.filter((d) => d.heroEligible === true).slice(0, limit);
}

/* ═══════════════════ חתך תפריט (עמודי אירועים) ═══════════════════ */

/**
 * החתך שעמוד אירוע מבקש. תואם מבנית ל־`MenuCut` מ־`content/occasions.ts`
 * ולכן אפשר להעביר אותו ישירות, בלי מיפוי ובלי לייבא בין המודולים.
 */
export interface MenuCutQuery {
  /** קטגוריות, בסדר ההצגה. ריק ⇒ אין מה להציג. */
  courses: readonly Course[];
  /** סימון תזונה שכל מנה חייבת לשאת. `null` ⇒ אין סינון נוסף. */
  requiresDietary: DietaryFlag | null;
}

/**
 * המנות שעמוד אירוע מציג, לפי החתך שלו ובסדר הקטגוריות שהוא ביקש.
 * חתך בלי קטגוריות, או חתך שלא נותרה בו מנה — `[]`, והסקשן לא מרונדר.
 */
export function dishesForCut(cut: MenuCutQuery): Dish[] {
  const out: Dish[] = [];
  for (const course of cut.courses) {
    for (const dish of CATERING_DISHES) {
      if (dish.course !== course) continue;
      if (cut.requiresDietary !== null && !dish.dietary.includes(cut.requiresDietary)) continue;
      out.push(dish);
    }
  }
  return out;
}

/* ═══════════════════ קיבוץ ═══════════════════ */

export interface CourseGroup {
  course: Course;
  /** הכותרת המוכנה לרינדור. */
  label: string;
  dishes: Dish[];
}

/**
 * קיבוץ לפי קטגוריה, בסדר ההגשה. **קטגוריה ריקה אינה מוחזרת** — ולכן
 * צרכן שעושה `.map()` על התוצאה לא יכול לייצר כותרת מעל רשימה ריקה.
 *
 * בלי ארגומנט — כל המנות הזמינות. עם ארגומנט — קיבוץ תת־רשימה שכבר
 * סוננה (למשל `dishesForBranch()` או `dishesForMenu()`).
 *
 * הקיבוץ עצמו אינו מחליט אם להציג כותרות: זה `shouldGroupByCourse()`.
 */
export function dishesByCourse(dishes: readonly Dish[] = CATERING_DISHES): CourseGroup[] {
  const out: CourseGroup[] = [];
  for (const course of COURSES) {
    const inCourse = dishes.filter((d) => d.course === course);
    if (inCourse.length === 0) continue;
    out.push({ course, label: COURSE_LABEL[course], dishes: inCourse });
  }
  return out;
}

/* ═══════════════════ הצגה ═══════════════════ */

/**
 * הקישור לתפריט החי, ורק כשמותר להציג אותו: המנה זמינה לקייטרינג,
 * המסעדה באמת מגישה אותה, ויש כתובת. חסר אחד מהשלושה — `null`.
 */
export function liveMenuUrlFor(dish: Dish, branch: BranchId): string | null {
  if (!isCateringDish(dish)) return null;
  if (!dish.branches.includes(branch)) return null;
  const url = dish.liveMenuUrl?.[branch];
  return url && url.length > 0 ? url : null;
}

/** תג מקור, מוכן לרינדור. תואם ל־`DishMark` ב־`components/bands/dish-list`. */
export interface ProvenanceMark {
  labelHe: string;
  href: string;
}

/**
 * תג המקור של שורת מנה — **שכבה אחת בלבד**, ורק כשיש עובדה סמוכה
 * שאפשר לבדוק מולה: קישור לתפריט המסעדה החי.
 *
 * שתי סטיות מכוונות מ־01 §3.2, שתיהן לצד המחמיר:
 *
 *   1. **השכבה השנייה («מהמטבח ב{סניף}» ← `/kitchens/{branch}`) אינה
 *      ממומשת.** היא מייחסת את הקייטרינג למטבח של סניף מסוים. הקייטרינג
 *      יוצא ממטבח **אחד**, ואיזה — לא נמסר. תג כזה על מנה שמופיעה בשלוש
 *      מסעדות מייצר בדיוק את טענת «שלושת המטבחים» שנמחקה מהאתר.
 *   2. **המילה «היום» אינה נכתבת.** המפרט מרשה אותה כשיש קישור חי, אבל
 *      «מוגש היום» טוען גם שהמסעדה פתוחה היום — ושעות הפעילות הן
 *      ‎`SLOTS.openingHours`, שהוא `null`. הקישור מגבה תפריט, לא יום.
 *      הניסוח כאן מגבה בדיוק את מה שהקישור מראה, ולא יותר.
 *
 * אין קישור ⇒ `null` והתג נשמט לגמרי. אין גרסה מרוככת.
 */
export function provenanceMarkFor(dish: Dish, branch: BranchId): ProvenanceMark | null {
  const href = liveMenuUrlFor(dish, branch);
  if (!href) return null;
  const name = BRANCHES.find((b) => b.id === branch)?.name;
  if (!name) return null;
  return { labelHe: `מוגש בתפריט המסעדה ב${name}`, href };
}

/**
 * התג הראשון שנמצא למנה, על פני המסעדות שמגישות אותה לפי סדרן ב־`BRANCHES`.
 * זה מה ששורת מנה בעמוד כללי (`/`, `/menus`) קוראת לו — עמוד מסעדה קורא
 * ל־`provenanceMarkFor()` עם הסניף שלו.
 */
export function provenanceMark(dish: Dish): ProvenanceMark | null {
  for (const branch of BRANCHES) {
    const mark = provenanceMarkFor(dish, branch.id);
    if (mark) return mark;
  }
  return null;
}

/** תוויות התזונה של מנה, מוכנות לרינדור. אין סימונים — מערך ריק. */
export function dietaryLabels(dish: Dish): string[] {
  return dish.dietary.map((flag) => DIETARY_LABEL[flag]);
}

/**
 * הצורה שבנאי ההצעה שומר: מזהה ושם, בלי שום דבר נוסף. הטיוטה חייבת
 * להישאר נקייה, ושם מנה הוא המקסימום שמותר לה לשאת.
 *
 * הטיפוס נכתב כאן במפורש ולא מיובא — כדי שמודול התוכן לא ייתלה
 * בקומפוננטה. הצורות חייבות להישאר זהות.
 */
export function dishSelection(dish: Dish): { id: string; name: string } {
  return { id: dish.id, name: dish.nameHe };
}

/* ═══════════════════ בדיקת שפיות ═══════════════════ */

const MAX_DESCRIPTION_WORDS = 12;
const BRANCH_IDS = new Set<string>(BRANCHES.map((b) => b.id));
const COURSE_IDS = new Set<string>(COURSES);
const DIETARY_IDS = new Set<string>(DIETARY_FLAGS);

/**
 * מאתרת את הטעויות שקורות כשמזינים טבלה ידנית. מוחזרת כרשימת מחרוזות
 * ולא זורקת: קובץ נתונים שגוי אסור לו להפיל עמוד ללקוח.
 *
 * מה שנבדק, ולמה כל אחד:
 *   · מזהה כפול — שתי מנות מתחלפות באנליטיקה ובטיוטה.
 *   · תיאור מעל ‎12 מילים — שובר את שורת המנה בעיצוב (01 §6.2).
 *   · קטגוריה או סימון תזונה לא מוכרים — נכתבים בטיפוס, אבל נתונים
 *     שמודבקים מגיליון עוקפים אותו בקלות ואז המנה נעלמת מכל קיבוץ.
 *   · סניף לא מוכר — מנה שלא תוצג באף עמוד מסעדה, בלי שאיש ישים לב.
 *   · «זמין לקייטרינג» בלי אף מסעדה — שם בלי תפריט שאפשר להצביע עליו.
 *   · ‎`liveMenuUrl` למסעדה שאינה ברשימת המסעדות של המנה — קישור לתפריט
 *     שהמנה לא הוצהרה כמופיעה בו.
 *   · סימן ‎₪ או מחיר בשדה טקסט — מחיר שדולף דרך תיאור מנה.
 */
export function validateDishes(dishes: readonly Dish[] = DISHES): string[] {
  const problems: string[] = [];
  const seen = new Set<DishId>();

  for (const dish of dishes) {
    const at = `dish "${dish.id || "(ללא מזהה)"}"`;

    if (!dish.id) problems.push(`${at}: חסר מזהה`);
    else if (seen.has(dish.id)) problems.push(`${at}: מזהה כפול`);
    else seen.add(dish.id);

    if (!dish.nameHe?.trim()) problems.push(`${at}: חסר שם`);

    if (!COURSE_IDS.has(dish.course)) {
      problems.push(`${at}: קטגוריה לא מוכרת "${dish.course}"`);
    }

    if (dish.descriptionHe) {
      const words = dish.descriptionHe.trim().split(/\s+/).length;
      if (words > MAX_DESCRIPTION_WORDS) {
        problems.push(`${at}: תיאור באורך ${words} מילים, המקסימום ${MAX_DESCRIPTION_WORDS}`);
      }
    }

    for (const flag of dish.dietary) {
      if (!DIETARY_IDS.has(flag)) problems.push(`${at}: סימון תזונה לא מוכר "${flag}"`);
    }

    for (const branch of dish.branches) {
      if (!BRANCH_IDS.has(branch)) problems.push(`${at}: סניף לא מוכר "${branch}"`);
    }

    if (dish.cateringAvailable === true && dish.branches.length === 0) {
      problems.push(`${at}: מסומנת זמינה לקייטרינג אך לא הוצהרה מסעדה שמגישה אותה`);
    }

    for (const branch of Object.keys(dish.liveMenuUrl ?? {})) {
      if (!dish.branches.includes(branch as BranchId)) {
        problems.push(`${at}: קישור לתפריט חי בסניף "${branch}" שאינו ברשימת המסעדות שלה`);
      }
    }

    if (/₪|\bש"?ח\b/.test(`${dish.nameHe} ${dish.descriptionHe ?? ""}`)) {
      problems.push(`${at}: מחיר בטקסט. מחירים חיים רק ב־config/pricing.ts`);
    }
  }

  return problems;
}

/* אזהרה בפיתוח בלבד. בפרודקשן אין לוג ואין השפעה על הרינדור. */
if (import.meta.env?.DEV) {
  const problems = validateDishes();
  if (problems.length > 0) {
    console.warn(`[dishes.ts] ${problems.length} בעיות:\n · ${problems.join("\n · ")}`);
  }
}
