/**
 * ═══════════════════════════════════════════════════════════════════════
 *  המנות — חומר הגלם של האתר.
 * ═══════════════════════════════════════════════════════════════════════
 *
 * הכיוון שנבחר הוא «התפריט הוא האתר»: שמות המנות הם הטיפוגרפיה, ולא
 * תוכן שנשפך אחר כך לתוך רשת של תמונות. לכן הקובץ הזה אינו קובץ נתונים
 * צדדי — הוא העמוד השדרה של העיצוב.
 *
 * והוא ריק. `DISHES` הוא מערך ריק, וזו המציאות היום: הלקוח טרם מסר אילו
 * מנות זמינות בפועל לקייטרינג. זו העובדה החוסמת היחידה שנותרה, והיא
 * מתועדת ככזו במפרט (02 §4.2 — "the direction's largest single-point
 * dependency").
 *
 * ─────────────────────────────────────────────────────────────────────
 *  החוק
 * ─────────────────────────────────────────────────────────────────────
 * כל צרכן חייב להתנוון לאין כשהרשימה ריקה. אין מנת דמו, אין שורת
 * «מנה לדוגמה», אין שלד אפור שממתין לתוכן. סקשן שלא נותרה בו ולו מנה
 * אחת — אינו מרונדר. עמוד שכל הסקשנים שלו כאלה נראה מכוון וגמור, כי
 * זה המצב שבו האתר עשוי לעלות לאוויר.
 *
 * העזרים כאן מחזירים `[]` או `false` במצב הריק, תמיד. אין להם מסלול
 * שבו הם מייצרים ערך שלא נמסר.
 *
 * אין שדה מחיר על מנה. מחיר למנה הוא מחיר, ומחירים חיים אך ורק מאחורי
 * המנעולים של `config/pricing.ts` — או שאינם קיימים. (01 §6.2, 02 §2.2)
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
 *   5. **באילו סניפים המטבח מבשל אותה בפועל** — אחד או יותר מתוך
 *      הרצליה פיתוח · רעננה · פתח תקווה. רשימה ריקה ⇒ המנה אינה מוצגת,
 *      גם אם סומנה זמינה: «זמין לקייטרינג» בלי מטבח שמבשל הוא הבטחה
 *      בלי כיסוי.
 *   6. **סימוני תזונה** — צמחוני / טבעוני / ללא גלוטן במרכיבים / חלבי.
 *      אפשר יותר מאחד, אפשר כלום.
 *   7. **קישור למנה בתפריט המסעדה החי** — לכל סניף בנפרד, אם יש. זה מה
 *      שמאפשר את הסימון «מוגש גם במסעדה ב…», שהוא ההוכחה החזקה ביותר
 *      שהקייטרינג יוצא ממטבח עובד.
 *   8. **לאילו תפריטי קייטרינג המנה שייכת** — מזהים מ־`content/menus.ts`.
 *      אפשר להשאיר ריק ולנהל את השיוך מצד התפריט; שני הכיוונים נתמכים.
 *
 * מה שהלקוח **אינו** צריך למסור: מזהים. את ה־`id` קובע מי שמזין את
 * הנתונים — slug לטיני קצר, יציב, שלא משתנה לעולם. הוא מימד באנליטיקה
 * ונשמר על שורת הליד (`leads.selected_dishes`); שינוי שלו מנתק היסטוריה.
 * שינוי שם עברי — מותר ורצוי. שינוי `id` — לא.
 *
 * ─────────────────────────────────────────────────────────────────────
 *  מה קורה ברגע שהרשימה מגיעה
 * ─────────────────────────────────────────────────────────────────────
 * מדביקים את השורות לתוך `DISHES` ושום קוד אחר לא משתנה. סקשן המנות,
 * שורות ההירו, «הוסיפו לתפריט שלי», סינון לפי סניף, קיבוץ לפי קטגוריה
 * וה־JSON-LD של ‎`/menus` — כולם נתלים בעזרים שבקובץ הזה ובודקים אותם
 * לפני שהם מרנדרים משהו.
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
 * ‎spec: 01 §6.2 (חוזה הנתונים), 02 §4.2 (הרשומה), 02 §3.2 (הסימון
 * «מוגש היום ב…»), 00-spec-review B1 (שתי ההגדרות הסותרות — 01 גובר),
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
 * ‎`platters` קיים במפרט 01 ואינו קיים ב־02. סקירת המפרטים (B1) קובעת
 * ש־01 בעל חוזי הנתונים — ולכן הוא כאן. מגשי אירוח הם קטגוריה מסחרית
 * נפרדת בקייטרינג, ובלעדיה עמוד `/catering/business` נשאר בלי החומר
 * שהוא בנוי סביבו.
 */
export const COURSES = ["antipasti", "pasta", "mains", "desserts", "platters"] as const;

export type Course = (typeof COURSES)[number];

/** כותרות הקיבוץ, מילה במילה מ־01 §4 P-02. */
export const COURSE_LABEL: Record<Course, string> = {
  antipasti: "אנטיפסטי וכיבוד",
  pasta: "פסטות",
  mains: "מנות עיקריות",
  desserts: "קינוחים",
  platters: "מגשים",
};

/**
 * סימוני תזונה.
 *
 * ‎`gluten_free_ingredients` — ולא `gluten_free`. המטבחים משותפים, ולכן
 * «ללא גלוטן» סתמי הוא הצהרת בטיחות שאיננו יכולים לעמוד מאחוריה. הניסוח
 * המלא («מוכן במטבח שאינו נקי מגלוטן») הוא טקסט של הלקוח ומרונדר פעם
 * אחת בשאלות ותשובות — לא כאן, ולא כתגית. ‎(02 §4.2)
 *
 * ‎`dairy` — «חלבי» הוא סימון תזונתי וגם סימון כשרותי. הוא **אינו** אומר
 * דבר על ההפרדה במטבח או על תעודת הכשרות; אלה עובדות של הלקוח והן
 * יושבות ב־`SLOTS.kashrutByBranch`.
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
   * המטבחים שמבשלים אותה בפועל. רשימה ריקה ⇒ המנה אינה מוצגת.
   * (‎01 §6.2 קורא לשדה `branches`; 02 §4.2 קרא לו `servedAtBranches`.
   * סקירת המפרטים B1 — 01 גובר.)
   */
  branches: readonly BranchId[];

  dietary: readonly DietaryFlag[];

  /**
   * קישור למנה בתפריט המסעדה החי, לכל סניף בנפרד.
   * מפעיל את הסימון «מוגש גם במסעדה ב…». חסר ⇒ אין סימון ואין קישור —
   * לא גרסה מרוככת של הסימון. ‎(02 §3.2)
   */
  liveMenuUrl?: Partial<Record<BranchId, string>>;

  /**
   * לאילו תפריטי קייטרינג המנה שייכת. אפשר להשאיר ריק ולנהל את השיוך
   * מצד התפריט (`menu.dishIds`) — `dishesForMenu()` מאחד את שני הכיוונים.
   */
  menus: readonly MenuId[];

  /**
   * רשאית להופיע בשורות המנה שמתחת לכותרת ההירו. ברירת המחדל היא לא:
   * שורת הירו היא בחירה עריכתית, לא כל מה שיש במטבח. ‎(01 §6.2)
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
export const DISHES: readonly Dish[] = [];

/* ═══════════════════ שער התצוגה ═══════════════════ */

/**
 * המבחן היחיד שקובע אם מנה קיימת מבחינת האתר.
 * ‎01 §6.2, נאכף בבדיקה: `cateringAvailable === true && branches.length ≥ 1`.
 */
export function isCateringDish(dish: Dish): boolean {
  return dish.cateringAvailable === true && dish.branches.length > 0;
}

/** כל המנות שעברו את השער, בסדר שבו נמסרו. הרשימה שכל צרכן עובד מולה. */
export const CATERING_DISHES: readonly Dish[] = DISHES.filter(isCateringDish);

/**
 * המספר שמפעיל את מתג הפריסה של ‎01 §3.3: כשהוא ‎0 העמוד עובר לרג'יסטר
 * התפעולי, סקשן המטבחים מקודם, וסקשן המנות אינו מרונדר.
 */
export const cateringAvailableCount: number = CATERING_DISHES.length;

/**
 * האם יש בכלל מה להראות. הבדיקה שכל סקשן מנות פותח בה.
 *
 *   `if (!hasDishes()) return null;`
 *
 * עם `branch` — האם למטבח הזה יש מנות משלו. עמוד סניף בלי אף מנה משלו
 * משמיט את סקשן המנות ואינו נופל חזרה לרשימה הכללית: הצגת מנה שמטבח
 * אחר מבשל, בעמוד של סניף, היא בדיוק ההבטחה שאסור לתת.
 */
export function hasDishes(branch?: BranchId): boolean {
  if (branch === undefined) return CATERING_DISHES.length > 0;
  return CATERING_DISHES.some((d) => d.branches.includes(branch));
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
 * המנות שמטבח מסוים מבשל. זה הסינון של סקשן המנות בעמוד סניף
 * (‎01 §4 P-04…P-06: `dish.branches.includes(branch)`).
 */
export function dishesForBranch(branch: BranchId): Dish[] {
  return CATERING_DISHES.filter((d) => d.branches.includes(branch));
}

/** מנות עם סימון תזונה מסוים — הבסיס לעמוד `/catering/dairy` וכדומה. */
export function dishesWithDietary(flag: DietaryFlag): Dish[] {
  return CATERING_DISHES.filter((d) => d.dietary.includes(flag));
}

/**
 * שורות המנה שמתחת לכותרת ההירו. רק מנות שסומנו `heroEligible`, וברירת
 * המחדל היא רשימה ריקה — כלומר הירו נשאר טיפוגרפיה בלבד עד שהלקוח יבחר
 * אילו שמות ראויים לעמוד שם.
 */
export function heroDishes(limit = 3): Dish[] {
  return CATERING_DISHES.filter((d) => d.heroEligible === true).slice(0, limit);
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
 * הסניף באמת מבשל אותה, ויש כתובת. חסר אחד מהשלושה — `null`, והסימון
 * נשמט לגמרי. ‎(02 §3.2 — "the mark is omitted, not softened")
 */
export function liveMenuUrlFor(dish: Dish, branch: BranchId): string | null {
  if (!isCateringDish(dish)) return null;
  if (!dish.branches.includes(branch)) return null;
  const url = dish.liveMenuUrl?.[branch];
  return url && url.length > 0 ? url : null;
}

/** תוויות התזונה של מנה, מוכנות לרינדור. אין סימונים — מערך ריק. */
export function dietaryLabels(dish: Dish): string[] {
  return dish.dietary.map((flag) => DIETARY_LABEL[flag]);
}

/**
 * הצורה שבנאי ההצעה שומר (`DishSelection` ב־`quote/use-quote-builder.ts`):
 * מזהה ושם, בלי שום דבר נוסף. הטיוטה חייבת להישאר נקייה, ושם מנה הוא
 * המקסימום שמותר לה לשאת.
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

/**
 * מאתרת את הטעויות שקורות כשמזינים טבלה ידנית. מוחזרת כרשימת מחרוזות
 * ולא זורקת: קובץ נתונים שגוי אסור לו להפיל עמוד ללקוח.
 *
 * מה שנבדק, ולמה כל אחד:
 *   · מזהה כפול — שתי מנות מתחלפות באנליטיקה ובטיוטה.
 *   · תיאור מעל ‎12 מילים — שובר את שורת המנה בעיצוב (01 §6.2, נאכף בלינט).
 *   · סניף לא מוכר — מנה שלא תוצג באף עמוד סניף, בלי שאיש ישים לב.
 *   · «זמין לקייטרינג» בלי אף סניף — הבטחה בלי מטבח שמבשל.
 *   · ‎`liveMenuUrl` לסניף שאינו ברשימת הסניפים של המנה — קישור «מוגש
 *     גם ב…» למקום שלא מבשל אותה.
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

    if (dish.descriptionHe) {
      const words = dish.descriptionHe.trim().split(/\s+/).length;
      if (words > MAX_DESCRIPTION_WORDS) {
        problems.push(`${at}: תיאור באורך ${words} מילים, המקסימום ${MAX_DESCRIPTION_WORDS}`);
      }
    }

    for (const branch of dish.branches) {
      if (!BRANCH_IDS.has(branch)) problems.push(`${at}: סניף לא מוכר "${branch}"`);
    }

    if (dish.cateringAvailable === true && dish.branches.length === 0) {
      problems.push(`${at}: מסומנת זמינה לקייטרינג אך אין סניף שמבשל אותה`);
    }

    for (const branch of Object.keys(dish.liveMenuUrl ?? {})) {
      if (!dish.branches.includes(branch as BranchId)) {
        problems.push(`${at}: קישור לתפריט חי בסניף "${branch}" שאינו ברשימת הסניפים שלה`);
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
