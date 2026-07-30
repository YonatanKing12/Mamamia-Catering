/**
 * ═══════════════════════════════════════════════════════════════════════
 *  page-meta-extra — רשומות המטא למסלולים שנפתחים בסבב הזה.
 * ═══════════════════════════════════════════════════════════════════════
 *
 * spec 01 §2 (מלאי הדפים), §4 (חוזי הדפים), §5.1 (שכבת ה־head), T-3, T-4.
 * ‏`00-spec-review.md` §A גובר על המפרט בכל מקום שבו הם חלוקים.
 *
 * ─────────────────────────────────────────────────────────────────────
 *  למה מודול נפרד ולא הרחבה של `lib/seo.ts`
 * ─────────────────────────────────────────────────────────────────────
 * ‏`lib/seo.ts` אינו בבעלות אף אחד בסבב הזה ואסור לגעת בו. המסלולים
 * שנפתחים עכשיו צריכים בכל זאת רשומת מטא, ולכן הן יושבות כאן ובאותו
 * טיפוס בדיוק (`PageMeta`), כך שהמיזוג הוא קריאה אחת:
 *
 * ```ts
 * // בתוך lib/seo.ts, כשהבעלות תתאחד:
 * import { mergePageMeta } from "@/lib/page-meta-extra";
 * const ALL = mergePageMeta(PAGE_META);
 * ```
 *
 * **המיזוג עובר דרך פונקציה ולא דרך קבוע.** `lib/seo.ts` הוא המקור
 * לטיפוסים כאן; אילו ייבא בחזרה קבוע שנבנה בזמן טעינת המודול היה נוצר
 * מעגל ייבוא. בנייה עצלה + memo מסירה את הסיכון לחלוטין.
 *
 * ─────────────────────────────────────────────────────────────────────
 *  מה `mergePageMeta` מוחק, ולמה זה חלק מהמיזוג ולא ניקיון נפרד
 * ─────────────────────────────────────────────────────────────────────
 * ‏`PAGE_META` שב־seo.ts עדיין מחזיק את המודל הישן: `/kitchens` ושלושה
 * דפי סניף, וכותרות שמצהירות «שלוש מסעדות איטלקיות פעילות» ו«שלושה
 * מטבחי מסעדה». המיצוב תוקן — הקייטרינג יוצא ממטבח **אחד** שזהותו טרם
 * נמסרה (`content/business.ts`, מקטע המיצוב; `content/locations.ts`
 * מחק בהתאם את דפי הסניף). לכן:
 *
 *   · הרשומות כאן **גוברות** על רשומות באותו נתיב ב־`PAGE_META`;
 *   · `SUPERSEDED_PATHS` (‏`/kitchens` ושלושת דפי הסניף) נמחקים במיזוג.
 *
 * מחיקה שאינה חלק מהמיזוג היא מחיקה שמישהו ישכח, וכל עוד הנתיבים האלה
 * חיים בטבלה הם נפלטים ל־sitemap ומקבלים קנוני לדף שאינו קיים.
 *
 * ─────────────────────────────────────────────────────────────────────
 *  החוק שמחזיק את התיאורים — לקרוא לפני שמוסיפים רשומה
 * ─────────────────────────────────────────────────────────────────────
 * ‏meta description הוא הטקסט שגוגל מצטט כהבטחה של העסק, והוא נשאב
 * למנועי תשובות. סבב קודם שילח חמישה תיאורים שהצהירו על עובדות שאיש לא
 * מסר — מטבח שמבשל **כל יום**, **עמדה חיה** כשירות מוצע, ו**משלוח מהיר**
 * — ואחריו סבב ששתל שלוש ערים כמוצא של הקייטרינג. שניהם הוסרו.
 *
 * תיאור כאן רשאי לומר **רק** את אלה:
 *   1. שמדובר בקייטרינג מאמאמיה;
 *   2. שהוא מבושל במטבח של מסעדה איטלקית **פעילה** — לשון יחיד;
 *   3. שהוא כשר, **ורק בנוסח שמחזיר `kashrutClauseHe()`**;
 *   4. מה האירוע שהדף עוסק בו.
 *
 * ואסור לו לומר דבר על: עיר או אזור שממנו יוצא האוכל, כמה מטבחים,
 * ימים, שעות, מהירות, זמן תגובה, מינימום או מקסימום סועדים, מחיר, מה
 * כלול, צוות, מלצרים, עמדות חיות, טעימות, כתובות, או כל יכולת תפעולית
 * אחרת. שמות שלוש המסעדות אינם מופיעים כאן כלל: בתוך תיאור של דף
 * קייטרינג הם נקראים כאזור שירות, וזו בדיוק הגזירה האסורה.
 *
 * ─────────────────────────────────────────────────────────────────────
 *  כותרות
 * ─────────────────────────────────────────────────────────────────────
 * אותו חוק, בתוספת אחת: **כותרת רשאית לנקוב בנושא הדף; אסור לה להוסיף
 * עליו טענה.** דף שכל קיומו תלוי בעובדה חסרה (`/pasta-bar`, `/urgent`,
 * `/catering/shiva`) אינו נרשם עד שהעובדה תימסר — `content/occasions.ts`
 * הוא שקובע זאת, לא הטבלה הזאת — ולכן נקיבת הנושא בכותרת אינה הצהרה
 * עודפת. מכאן שלוש חריגות מנוסח המפרט, כולן הסרות:
 *
 *   · P-15 `/urgent` — הוסר `משלוח מהיר`. אין לו שדה ב־`business.ts`.
 *   · P-09 — הוסר `אירוע פרטי במסעדה`. אירוח בתוך המסעדה הוא יכולת
 *     תפעולית שלא נמסרה (`privateEventCapacityFor()` מחזיר null לכולן).
 *   · P-08 — הוסר `בהרצליה פיתוח`. עיר בכותרת של דף קייטרינג היא טענה
 *     על מוצא האוכל, ו־`SLOTS.cateringKitchenBranch` הוא `null`.
 *
 * ─────────────────────────────────────────────────────────────────────
 *  קנוני
 * ─────────────────────────────────────────────────────────────────────
 * ‏T-4: **`path` הוא הקנוני.** אין שדה קנוני נפרד ולא ייתכן כזה — כל
 * רשומה מצביעה על עצמה, `absoluteUrl(meta.path)` הוא הכתובת המלאה,
 * ופרמטרים של קמפיין לעולם לא נכנסים אליה.
 */

import { BRANCHES, CATERING_NAME, SLOTS, filled } from "@/content/business";
import { kashrutStatement } from "@/content/locations";
import type { OccasionId } from "@/content/occasions";
import type { Crumb, PageMeta } from "@/lib/seo";

/* ═══════════════════ הטיפוס ═══════════════════ */

/**
 * ‏`PageMeta` + שני שדות שאינם נפלטים לעולם ל־head.
 *
 * `occasion` הוא הקישור למודול העובדות: `content/occasions.ts` הוא
 * שקובע אם מסלול אירוע נבנה, נרשם ונכנס ל־sitemap (`isBuildable()`).
 * הטבלה הזאת **אינה** מחזיקה עותק שני של השערים — עותק שני של שער הוא
 * שער שיסתור את המקור בעוד שני סבבים. `null` ⇒ המסלול אינו דף אירוע.
 */
export interface PageMetaExtra extends PageMeta {
  readonly occasion: OccasionId | null;
  /** הערת פיתוח. אינה מרונדרת, אינה נפלטת, אינה נקראת בזמן ריצה. */
  readonly note?: string;
}

/* ═══════════════════ פירורי לחם משותפים ═══════════════════ */

const HOME: Crumb = { labelHe: "ראשי", path: "/" };
const CATERING: Crumb = { labelHe: "קייטרינג לאירועים", path: "/catering" };

/**
 * ‏og לדפים שאינם נסרקים.
 * ‏00-spec-review §E4: `/summary` מועבר הלאה בוואטסאפ, ולכן חייב כרטיס
 * **גנרי** — לעולם לא פרטי האירוע של הקונה, שיודלפו לתצוגה מקדימה
 * בקבוצת צ׳אט. כרטיס דף הבית הוא ברירת המחדל של האתר.
 */
const SITE_DEFAULT_OG = "/og/P-01.jpg";

/* ═══════════════════ שתי אבני הבניין של כל תיאור ═══════════════════ */

/**
 * הטענה היחידה על מוצא האוכל שמותר לכתוב, בלשון יחיד.
 * מקור: הלקוח, 30 ביולי 2026 (`business.ts`,
 * `COOKED_IN_ACTIVE_RESTAURANT_KITCHEN`). לא «שלושה מטבחים», לא עיר.
 */
const ORIGIN_HE = "מבושל במטבח של מסעדה איטלקית פעילה";

/** אותה טענה בנטייה שמשתלבת אחרי שם עצם. */
const FROM_ORIGIN_HE = "מהמטבח של מסעדה איטלקית פעילה";

/**
 * ‏«כשר X» כפי שנמסר בעל־פה, מ־`SLOTS.kashrutByBranch`. מוחזר **רק** אם
 * כל הערכים זהים: ערכים חלוקים אינם משפט אחד, והאתר לא ינחש איזה מהם.
 * לעולם לא נכתב כמחרוזת קשיחה כאן — LAW 1.
 */
function generalKashrutHe(): string | null {
  const byBranch = SLOTS.kashrutByBranch;
  if (!filled(byBranch)) return null;
  const values = BRANCHES.map((b) => byBranch[b.id]).filter((v): v is string => filled(v));
  if (values.length !== BRANCHES.length) return null;
  return values.every((v) => v === values[0]) ? values[0] : null;
}

/**
 * שני מפלסים של טענת כשרות, וההפרדה ביניהם היא ההחלטה הכבדה בקובץ.
 *
 *   · `"written"` — רק `CATERING_KASHRUT_STATEMENT` (`content/locations.ts`),
 *     הנוסח בכתב עם שם הגוף המכשיר המלא. הוא `null` היום, ולכן דפים
 *     במפלס הזה **אינם נושאים טענת כשרות בכלל**.
 *   · `"general"` — מתקבל גם «כשר בד״ץ» הכללי שנמסר בעל־פה.
 *
 * למה בכלל שני מפלסים: `business.ts` מתעד פער פתוח — «בד״ץ» אינו גוף
 * אחד, ולקוח שומר כשרות לא יזמין על סמך «בד״ץ» סתמי. ב־`/catering/shiva`,
 * `/catering/bar-mitzvah` ו־`/catering/holidays` הכשרות **היא** ההחלטה,
 * ותוצאת החיפוש היא הטקסט הראשון שהקונה רואה; שם רק נוסח בכתב מדבר.
 * בדפים האחרים «כשר בד״ץ» הוא הקשר מותג ולא עילת ההזמנה.
 *
 * כשהנוסח בכתב יימסר — כל התיאורים מקבלים אותו אוטומטית, בלי לגעת כאן.
 */
type KashrutTier = "written" | "general";

export function kashrutClauseHe(tier: KashrutTier): string | null {
  const written = kashrutStatement();
  if (filled(written)) return written;
  return tier === "general" ? generalKashrutHe() : null;
}

/** מחבר משפט תיאור לסיומת הכשרות, אם יש כזאת. */
const withKashrut = (sentence: string, tier: KashrutTier): string => {
  const clause = kashrutClauseHe(tier);
  return clause ? `${sentence} ${clause}.` : sentence;
};

/** כותרת: נושא הדף, ואחריו שם העסק כפי שהוא נסחר. */
const title = (topicHe: string): string => `${topicHe} | ${CATERING_NAME}`;

/* ═══════════════════ הרשומות ═══════════════════ */

function records(): PageMetaExtra[] {
  return [
    /* ─────────── P-02 · /menus ─────────── */
    {
      id: "P-02",
      path: "/menus",
      titleHe: title("התפריטים"),
      descriptionHe: withKashrut(
        `התפריטים של קייטרינג מאמאמיה, ומה מתוכם אפשר להזמין לאירוע. הכול ${ORIGIN_HE}.`,
        "general",
      ),
      robots: "index,follow",
      ogImage: "auto",
      breadcrumb: [HOME, { labelHe: "התפריטים", path: "/menus" }],
      occasion: null,
      note: "התפריטים עצמם ב־content/menus.ts. ריק היום ⇒ הדף עובר לרג׳יסטר התפעולי (01 §3.3).",
    },

    /* ─────────── P-03 · /kitchen ───────────
     * דף אחד, לא שלושה. הגרסה הקודמת החזיקה `/kitchens` + שלושה דפי
     * סניף, וזו הייתה בדיוק הטענה «רשת של שלושה מטבחי קייטרינג» שנדחתה.
     * המזהה P-03 נשמר מהמפרט כדי שכרטיס ה־og לא יתייתם. */
    {
      id: "P-03",
      path: "/kitchen",
      titleHe: title("המטבח שמבשל"),
      descriptionHe: withKashrut(
        "מי מבשל את הקייטרינג של מאמאמיה: מטבח של מסעדה איטלקית פעילה, ולא מטבח ייצור שנפתח לאירועים.",
        "general",
      ),
      robots: "index,follow",
      ogImage: "auto",
      breadcrumb: [HOME, { labelHe: "המטבח", path: "/kitchen" }],
      occasion: null,
      note: "בלוק פרטי המסעדות נשען על anyRestaurantDetail() — false היום. הדף עומד על הטענה בלבד.",
    },

    /* ─────────── P-07 · /catering ─────────── */
    {
      id: "P-07",
      path: "/catering",
      titleHe: title("קייטרינג לאירועים"),
      descriptionHe: withKashrut(
        `סוגי האירועים שקייטרינג מאמאמיה עושה, במקום אחד. ${ORIGIN_HE}.`,
        "general",
      ),
      robots: "index,follow",
      ogImage: "auto",
      breadcrumb: [HOME, CATERING],
      occasion: null,
      note: "מפרק בלבד. אינו נושא עובדה משלו, ולכן אין לו שער.",
    },

    /* ─────────── P-08 · /catering/business ─────────── */
    {
      id: "P-08",
      path: "/catering/business",
      titleHe: title("קייטרינג לחברות ולישיבות"),
      descriptionHe: withKashrut(
        `ארוחת צוות, כיבוד לישיבה ואירוע חברה — ${FROM_ORIGIN_HE}.`,
        "general",
      ),
      robots: "index,follow",
      ogImage: "auto",
      breadcrumb: [HOME, CATERING, { labelHe: "קייטרינג לחברות", path: "/catering/business" }],
      occasion: "business",
      note: "בלי חשבונית ובלי תנאי רכש בטקסט: companyId הוא null.",
    },

    /* ─────────── P-09 · /catering/private-events ─────────── */
    {
      id: "P-09",
      path: "/catering/private-events",
      titleHe: title("קייטרינג לשמחה פרטית ולאירוח בבית"),
      descriptionHe: withKashrut(
        `שמחה פרטית, יום הולדת או אירוח בבית — ${FROM_ORIGIN_HE}.`,
        "general",
      ),
      robots: "index,follow",
      ogImage: "auto",
      breadcrumb: [
        HOME,
        CATERING,
        { labelHe: "שמחות פרטיות", path: "/catering/private-events" },
      ],
      occasion: "private-events",
      note: "«אירוח אצלנו במסעדה» אינו נאמר: at_restaurant חסום על קיבולת שלא נמסרה.",
    },

    /* ─────────── P-10 · /catering/bar-mitzvah ───────────
     * מפלס `written`: `content/occasions.ts` מציב כאן שער רך על נוסח
     * הכשרות בכתב, ובלעדיו המילה «כשר» אינה נכתבת בדף — וכותרת ותיאור
     * הם הטקסט הראשון שהקונה רואה, לפני הדף. */
    {
      id: "P-10",
      path: "/catering/bar-mitzvah",
      titleHe: title("קייטרינג לבר מצווה ולבת מצווה"),
      descriptionHe: withKashrut(
        `בר מצווה ובת מצווה — ${FROM_ORIGIN_HE}. אתם מארחים, אנחנו מבשלים.`,
        "written",
      ),
      robots: "index,follow",
      ogImage: "auto",
      breadcrumb: [
        HOME,
        CATERING,
        { labelHe: "בר מצווה ובת מצווה", path: "/catering/bar-mitzvah" },
      ],
      occasion: "bar-mitzvah",
      note: "טענת כשרות תיכנס לתיאור מאליה ברגע ש־CATERING_KASHRUT_STATEMENT יימסר.",
    },

    /* ─────────── P-11 · /catering/shiva ───────────
     * ‏01 P-11: רג׳יסטר תפעולי ואוצר מילים מוגבל — אין «אירוע», אין
     * «חוויה», אין «לחגוג». הכלל חל על הכותרת ועל התיאור בדיוק כמו על
     * הדף, כי הם מה שהאבל רואה ראשון בתוצאת החיפוש. השער כאן **קשיח**
     * (`occasions.ts`): בלי נוסח כשרות בכתב הדף אינו נבנה כלל. */
    {
      id: "P-11",
      path: "/catering/shiva",
      titleHe: title("אוכל לשבעה ולאזכרה"),
      descriptionHe: withKashrut(
        `אוכל לבית אבלים בימי השבעה ולאזכרה, ${FROM_ORIGIN_HE}.`,
        "written",
      ),
      robots: "index,follow",
      ogImage: "auto",
      breadcrumb: [HOME, CATERING, { labelHe: "אירוח שבעה", path: "/catering/shiva" }],
      occasion: "shiva",
      note: "שער קשיח סגור היום. הרשומה קיימת כדי שהדף לא ייכתב מחדש כשהנוסח יימסר.",
    },

    /* ─────────── P-12 · /catering/holidays ───────────
     * הרשומה הבסיסית בלבד. החלופה העונתית (שם החג + שנה) יושבת ב־
     * `holidayMeta()` שב־`lib/seo.ts`, והיא **עדיין נוקבת בשלוש ערים**
     * בתיאור — פגם שיש לתקן שם, לא כאן. ראו דוח החזרה. */
    {
      id: "P-12",
      path: "/catering/holidays",
      titleHe: title("קייטרינג לחגים"),
      descriptionHe: withKashrut(`ארוחת חג לבית שמארח, ${FROM_ORIGIN_HE}.`, "written"),
      robots: "index,follow",
      ogImage: "auto",
      breadcrumb: [HOME, CATERING, { labelHe: "חגים", path: "/catering/holidays" }],
      occasion: "holidays",
      note: "מפלס written: ארוחת חג היא קלאסטר בכוונת כשרות, כמו שבעה ובר מצווה.",
    },

    /* ─────────── P-13 · /catering/fun-day ─────────── */
    {
      id: "P-13",
      path: "/catering/fun-day",
      titleHe: title("קייטרינג ליום גיבוש וליום כיף"),
      descriptionHe: withKashrut(
        `יום גיבוש או יום כיף לצוות, עם אוכל ${FROM_ORIGIN_HE}.`,
        "general",
      ),
      robots: "index,follow",
      ogImage: "auto",
      breadcrumb: [HOME, CATERING, { labelHe: "ימי גיבוש", path: "/catering/fun-day" }],
      occasion: "fun-day",
      note: "שער קשיח על liveStations. בינתיים עוגן #gibush בתוך /catering/business (01 P-13).",
    },

    /* ─────────── P-14 · /catering/dairy ───────────
     * «חלבי» כאן הוא סימון תזונתי מ־`content/dishes.ts` ותו לא: הוא אינו
     * אומר דבר על הפרדה במטבח ואינו טענת כשרות. */
    {
      id: "P-14",
      path: "/catering/dairy",
      titleHe: title("קייטרינג חלבי איטלקי"),
      descriptionHe: withKashrut(`תפריט חלבי איטלקי לאירוע, ${FROM_ORIGIN_HE}.`, "general"),
      robots: "index,follow",
      ogImage: "auto",
      breadcrumb: [HOME, CATERING, { labelHe: "קייטרינג חלבי", path: "/catering/dairy" }],
      occasion: "dairy",
      note: "אין טענת מחיר משווה. «אותו תקציב, שולחן עשיר יותר» נדחתה בביקורת (§A2).",
    },

    /* ─────────── P-15 · /urgent ───────────
     * הכותרת נוקבת בנושא הדף בלבד. הבטחת מהירות אינה נאמרת כאן ולא בשום
     * מקום אחר בשכבת ה־head: `sameDayCutoff` הוא Slot, ובלעדיו הדף עולה
     * בלי טענת קאט־אוף וקבוצת המודעות אינה רצה (01 P-15). */
    {
      id: "P-15",
      path: "/urgent",
      titleHe: title("קייטרינג להיום"),
      descriptionHe: withKashrut(`פנייה דחופה לקייטרינג, ${FROM_ORIGIN_HE}.`, "general"),
      robots: "index,follow",
      ogImage: "auto",
      breadcrumb: [HOME, { labelHe: "קייטרינג להיום", path: "/urgent" }],
      occasion: "urgent",
      note: "ההמרה בטלפון. שעת חיתום, אם תימסר, מוצגת ב־Asia/Jerusalem בלבד (INV-9).",
    },

    /* ─────────── P-16 · /pasta-bar ───────────
     * התיאור **אינו** מצהיר שעמדה חיה מוצעת כשירות: `SLOTS.liveStations`
     * הוא `null`, וזו אחת מהטענות שהוסרו. הוא מדבר על פסטה ועל המטבח,
     * שהם עובדות שיש לנו. הכותרת נוקבת בנושא, והמסלול ממילא אינו נרשם
     * עד שמגבלות העמדה יימסרו. */
    {
      id: "P-16",
      path: "/pasta-bar",
      titleHe: title("עמדת פסטה לאירועים"),
      descriptionHe: withKashrut(`פסטה לאירועים, ${FROM_ORIGIN_HE}.`, "general"),
      robots: "index,follow",
      ogImage: "auto",
      breadcrumb: [HOME, { labelHe: "עמדת פסטה", path: "/pasta-bar" }],
      occasion: "pasta-bar",
      note: "שער קשיח על liveStations. מגבלות העמדה ייכנסו ל־content/stations.ts, שטרם נוצר.",
    },

    /* ─────────── P-19 · /summary ───────────
     * ‏00-spec-review §E4: כרטיס ה־og גנרי ומשותף, לעולם לא פרטי האירוע
     * של הקונה — הדף נשלח הלאה בוואטסאפ, והתצוגה המקדימה נפתחת בקבוצה.
     * ‏§D6: `noindex` ולא `Disallow`, אחרת סורק לא יקרא את ה־noindex
     * ומייצר התצוגה המקדימה לא יביא כרטיס בכלל. */
    {
      id: "P-19",
      path: "/summary",
      titleHe: title("סיכום הפנייה"),
      descriptionHe: "סיכום הפרטים שנשלחו לקייטרינג מאמאמיה.",
      robots: "noindex,nofollow",
      ogImage: SITE_DEFAULT_OG,
      breadcrumb: [HOME],
      occasion: null,
      note: "אין כאן טענה עסקית בכוונה: זה הטקסט שנפתח בתצוגה מקדימה בקבוצת צ׳אט.",
    },

    /* ─────────── P-20 · /unsubscribe ─────────── */
    {
      id: "P-20",
      path: "/unsubscribe",
      titleHe: title("הסרה מרשימת הדיוור"),
      descriptionHe: "הסרה מרשימת הדיוור השיווקי של קייטרינג מאמאמיה.",
      robots: "noindex,nofollow",
      ogImage: SITE_DEFAULT_OG,
      breadcrumb: [HOME],
      occasion: null,
      note: "מגיעים לכאן מקישור עם טוקן ייעודי (00-spec-review §B8), לא עם ref.",
    },
  ];
}

/* ═══════════════════ הטבלה ═══════════════════ */

let memo: Readonly<Record<string, PageMetaExtra>> | null = null;

/**
 * הטבלה, לפי נתיב. **נבנית עצלה** — ראו הערת המעגל בראש הקובץ.
 * המפתח הוא ה־`path` עצמו, כדי שהמיזוג יהיה פעולה אחת.
 */
export function pageMetaExtra(): Readonly<Record<string, PageMetaExtra>> {
  if (memo) return memo;
  const table: Record<string, PageMetaExtra> = {};
  for (const m of records()) table[m.path] = m;
  memo = Object.freeze(table);
  return memo;
}

/** רשימה שטוחה, בסדר יציב (sitemap, בדיקות). */
export function pageMetaExtraList(): PageMetaExtra[] {
  return Object.values(pageMetaExtra());
}

/**
 * נתיבים שהמודל הישן ייצר ושאין מאחוריהם דף: מפרק שלושת המטבחים ושלושת
 * דפי הסניף. נגזרים מ־`BRANCHES` ולא נכתבים ביד, כדי שהם יישברו יחד
 * עם המקור אם הרשימה תשתנה.
 */
export const SUPERSEDED_PATHS: readonly string[] = Object.freeze([
  "/kitchens",
  ...BRANCHES.map((b) => `/kitchens/${b.id.replace(/_/g, "-")}`),
]);

/**
 * ממזג את הרשומות כאן לתוך טבלה קיימת (`PAGE_META` שב־seo.ts).
 * הרשומות כאן **גוברות**, ו־`SUPERSEDED_PATHS` נמחקים. הקלט אינו משתנה.
 */
export function mergePageMeta(
  base: Readonly<Record<string, PageMeta>>,
): Readonly<Record<string, PageMeta>> {
  const out: Record<string, PageMeta> = {};
  for (const [path, meta] of Object.entries(base)) {
    if (SUPERSEDED_PATHS.includes(path)) continue;
    out[path] = meta;
  }
  for (const [path, meta] of Object.entries(pageMetaExtra())) out[path] = meta;
  return Object.freeze(out);
}

/** נרמול זהה ל־`normalizePath()` שב־seo.ts, בלי לייבא ערך ולסגור מעגל. */
function normalize(pathname: string): string {
  const clean = pathname.split("?")[0].split("#")[0];
  if (clean === "" || clean === "/") return "/";
  return clean.replace(/\/+$/, "") || "/";
}

/**
 * פותר מטא לנתיב **מהמודול הזה בלבד**. מחזיר `null` לנתיב לא מוכר,
 * מאותה סיבה ש־`resolveMeta()` עושה זאת: כותרת גנרית וקנוני לדף שאינו
 * קיים גרועים מ־404.
 */
export function resolveExtraMeta(pathname: string): PageMetaExtra | null {
  return pageMetaExtra()[normalize(pathname)] ?? null;
}

/**
 * המסלולים כאן שרשאים להיכנס ל־sitemap **מבחינת ה־head בלבד**:
 * `index,follow`. זה תנאי הכרחי ולא מספיק — מסלול אירוע נכנס רק אם
 * `isBuildable()` ב־`content/occasions.ts` מאשר אותו, ומחולל ה־sitemap
 * חייב לשאול גם אותו. השער אינו משוכפל לכאן בכוונה.
 */
export function indexableExtraPaths(): string[] {
  return pageMetaExtraList()
    .filter((m) => m.robots === "index,follow")
    .map((m) => m.path);
}

/* ═══════════════════ ניקוי לפני סריאליזציה ═══════════════════ */

/**
 * מפתחות שנמחקים בכוח מכל צומת (spec 01 §7.3). זהה לרשימה שב־`lib/seo.ts`;
 * מוחזק כאן כדי שהמודול לא יִיבא **ערך** מ־seo.ts ויסגור מעגל ייבוא.
 * אלה השדות שהגרסה הקודמת שידרה בהם שקר, ורשת ביטחון עדיפה על משמעת.
 */
const FORBIDDEN_KEYS: ReadonlySet<string> = new Set([
  "priceRange",
  "aggregateRating",
  "review",
  "reviews",
  "ratingValue",
  "hasCertification",
]);

/** טיפוסים שכל תוכנם הוא הטיפוס עצמו, ולכן שורדים גם בלי שדות מצהירים. */
const TYPE_ONLY_NODES: ReadonlySet<string> = new Set(["BusinessAudience"]);

const isPlainObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" &&
  v !== null &&
  !Array.isArray(v) &&
  (Object.getPrototypeOf(v) === Object.prototype || Object.getPrototypeOf(v) === null);

interface PruneRules {
  /** מוחק `priceRange` וחבריו. */
  readonly forbid: boolean;
  /** מוחק צומת שנותרו בו `@type` / `@context` בלבד. */
  readonly dropTypeOnly: boolean;
}

function prune(value: unknown, rules: PruneRules): unknown {
  if (value === null || value === undefined) return undefined;

  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed === "" ? undefined : trimmed;
  }

  /* `false` ו־`0` הם ערכים אמיתיים ונשמרים: מחיקתם הייתה הופכת
     `"isAccessibleForFree": false` מהצהרה להיעדר הצהרה. */
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return Number.isFinite(value) ? value : undefined;
  if (typeof value === "bigint") return value;

  if (Array.isArray(value)) {
    const items = value.map((v) => prune(v, rules)).filter((v) => v !== undefined);
    return items.length > 0 ? items : undefined;
  }

  if (isPlainObject(value)) {
    const out: Record<string, unknown> = {};
    for (const [key, raw] of Object.entries(value)) {
      if (rules.forbid && FORBIDDEN_KEYS.has(key)) continue;
      const cleaned = prune(raw, rules);
      if (cleaned !== undefined) out[key] = cleaned;
    }
    const keys = Object.keys(out);
    if (keys.length === 0) return undefined;

    if (rules.dropTypeOnly) {
      /* הפניה ב־`@id` היא קשת בגרף — זה כל תוכנה, והיא שורדת. */
      const hasRef = Object.prototype.hasOwnProperty.call(out, "@id");
      const declarative = keys.filter((k) => k !== "@type" && k !== "@context");
      const typeOnlyAllowed =
        typeof out["@type"] === "string" && TYPE_ONLY_NODES.has(out["@type"] as string);
      if (!hasRef && declarative.length === 0 && !typeOnlyAllowed) return undefined;
    }
    return out;
  }

  /* פונקציה, Symbol, Date, Map, מופע של מחלקה — אינם ניתנים לסריאליזציה
     בטוחה ל־JSON-LD, ולכן מושמטים במקום להיפלט כ־`{}` או כמחרוזת מפתיעה. */
  return undefined;
}

/**
 * ─────────────────────────────────────────────────────────────────────
 *  ‏`stripEmpty` — הכלל שמחזיק את הנתונים המובנים
 * ─────────────────────────────────────────────────────────────────────
 * מוחק **רקורסיבית** כל מפתח שערכו `null` / `undefined` / מחרוזת ריקה
 * (או רווחים בלבד) / מערך ריק / אובייקט שהתרוקן.
 *
 * הסיבה, ולא לשם קפדנות: `content/business.ts` מלא ב־Slots שערכם `null`
 * — כתובות, שעות, מחירים, מינימום סועדים, אזורי חלוקה. צומת JSON-LD
 * שנבנה מהם ופולט `"streetAddress": null` או `"minValue": ""` **מצהיר על
 * השדה** בעיני צרכני הגרף. גוגל מציג את זה כעובדה על העסק, מנועי תשובות
 * שואבים את זה, וזו התחייבות מסחרית לכל דבר. **היעדר נתון עדיף על נתון
 * ריק שמוצג כנתון.**
 *
 * `false` ו־`0` נשמרים — שניהם ערכים אמיתיים.
 *
 * מוחזר `undefined` כשכל האובייקט התרוקן, כדי שהקורא ישמיט את הצומת
 * כולו במקום לפלוט `{}`.
 *
 * זו הגרסה הכללית: היא אינה יודעת דבר על schema.org ומתאימה לכל אובייקט.
 * לצמתי JSON-LD יש להשתמש ב־`stripEmptyJsonLd()`.
 */
export function stripEmpty<T>(value: T): T | undefined {
  return prune(value, { forbid: false, dropTypeOnly: false }) as T | undefined;
}

/**
 * ‏`stripEmpty` + שני הכללים של הגרף (spec 01 §7.3):
 *
 *  · `priceRange`, `aggregateRating`, `review`, `ratingValue`,
 *    `hasCertification` נמחקים בכוח בכל עומק. אלה השדות שהגרסה הקודמת
 *    שידרה בהם שקר — טווח מחיר מומצא, דירוג שלא נאסף, ביקורות שלא
 *    נכתבו, והתעדה שלא הוצגה.
 *  · צומת שנותרו בו `@type` ו־`@context` בלבד מושמט:
 *    `{"@type":"PostalAddress"}` מצהיר שיש כתובת ואינו אומר אותה. חריג
 *    יחיד — הפניה ב־`@id`, שהיא קשת בגרף וזה כל תוכנה.
 *
 * מחזיר `null` (ולא `undefined`) כשלא נותר דבר, כדי שיתאים לחתימה של
 * `serializeJsonLd()` ושיהיה בר־החלפה ב־`compact()` שב־seo.ts.
 */
export function stripEmptyJsonLd<T extends object>(node: T): T | null {
  const result = prune(node, { forbid: true, dropTypeOnly: true });
  return result === undefined ? null : (result as T);
}
