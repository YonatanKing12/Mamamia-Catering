/**
 * ═══════════════════════════════════════════════════════════════════════
 *  page-meta-extra — רשומות המטא למסלולים השיווקיים, ואיחוד הטבלאות.
 * ═══════════════════════════════════════════════════════════════════════
 *
 * spec 01 §2 (מלאי הדפים), §4 (חוזי הדפים), §5.1 (שכבת ה־head), T-3, T-4.
 * ‏`00-spec-review.md` §A גובר על המפרט בכל מקום שבו הם חלוקים.
 *
 * ─────────────────────────────────────────────────────────────────────
 *  למה מודול נפרד — הנימוק המעודכן
 * ─────────────────────────────────────────────────────────────────────
 * המודול נולד כשל־`lib/seo.ts` היה בעלים אחר ואסור היה לגעת בו. הבעלות
 * התאחדה, ובכל זאת הפיצול נשאר — משתי סיבות שהן עכשיו החלטה ולא כורח:
 *
 *   1. ‏`lib/seo.ts` הוא **המנגנון**: זהות המותג, מערכת הכותרות, בוני
 *      ה־JSON-LD והביקורת. הקובץ הזה הוא **הקופי**: שמונה־עשרה רשומות
 *      טקסט. ערבוב השניים מייצר קובץ שאיש לא יקרא לפני שהוא עורך אותו.
 *   2. הכיוון חד־סטרי ונשאר כזה: **הקובץ הזה מייבא מ־`lib/seo.ts`,
 *      ולעולם לא להפך.** `lib/seo.ts` אינו מייבא כלום מכאן, ולכן אין
 *      מעגל ואין צורך בבנייה עצלה מטעמי מעגל (ה־memo נשאר, כי הטבלה
 *      נבנית מפונקציות שקוראות למשבצות ואין טעם לחזור עליהן).
 *
 * הפער שהפיצול הותיר — **שתי טבלאות מטא לאותו אתר** — נסגר כאן:
 * ‏`allPageMeta()` הוא האיחוד, ו־`resolveSiteMeta()` הוא הפותר היחיד
 * שיודע לענות על כל כתובת באתר. מי שצריך מטא לנתיב שאינו יודע מראש
 * מאיזו טבלה הוא בא — משתמש בהם, לא ב־`resolveMeta()`.
 *
 * ─────────────────────────────────────────────────────────────────────
 *  מה `mergePageMeta` מוחק
 * ─────────────────────────────────────────────────────────────────────
 * ‏`SUPERSEDED_PATHS` — `/kitchens` ושלושת דפי הסניף — נמחקים במיזוג.
 * הם המודל הישן: קייטרינג שיוצא משלושה מטבחים. אין להם קובץ עמוד,
 * ‏`shared/routes.ts` משאיר אותם `enabled: false`, וכל עוד נתיב כזה חי
 * בטבלה הוא מקבל קנוני לדף שאינו קיים.
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
 * ‏**`auditPageMeta()` (`lib/seo.ts`) אוכף את הרשימה הזאת** על שתי
 * הטבלאות יחד. `auditSiteMeta()` שבתחתית הקובץ הוא הקריאה המוכנה.
 *
 * ─────────────────────────────────────────────────────────────────────
 *  כותרות
 * ─────────────────────────────────────────────────────────────────────
 * **אף כותרת כאן אינה נכתבת כמחרוזת שלמה.** כל רשומה מוסרת `topicHe` —
 * שאילתת המטרה בעברית — ו־`composeTitle()` מרכיב ממנה
 * `נושא · מודיפייר | מותג`. שתי המשבצות של המודיפיירים (עוגן מחיר, גוף
 * מכשיר נקוב) `null` היום ונכנסות מעצמן. ראו `lib/seo.ts`.
 *
 * הכלל התוכני: **כותרת רשאית לנקוב בנושא הדף; אסור לה להוסיף עליו
 * טענה.** דף שכל קיומו תלוי בעובדה חסרה (`/pasta-bar`, `/catering/shiva`)
 * אינו נרשם עד שהעובדה תימסר — `content/occasions.ts` הוא שקובע זאת, לא
 * הטבלה הזאת — ולכן נקיבת הנושא בכותרת אינה הצהרה עודפת. מכאן שלוש
 * חריגות מנוסח המפרט, כולן הסרות:
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
 * רשומה מצביעה על עצמה, `canonicalUrl(meta)` הוא הכתובת המלאה,
 * ופרמטרים של קמפיין לעולם לא נכנסים אליה.
 */

import { BRANCHES, CATERING_NAME } from "@/content/business";
import type { OccasionId } from "@/content/occasions";
import {
  FROM_ORIGIN_HE,
  ORIGIN_HE,
  PAGE_META,
  auditPageMeta,
  compact,
  composeTitle,
  kashrutClauseHe,
  withKashrut,
} from "@/lib/seo";
import type {
  Crumb,
  JsonLdNode,
  KashrutTier,
  MetaFinding,
  PageMeta,
} from "@/lib/seo";

/**
 * ‏`kashrutClauseHe` עברה ל־`lib/seo.ts` — שם יושבת גם `kashrutBadgeHe`
 * שבונה ממנה את באדג׳ הכותרת, ושתיהן חייבות לקרוא את אותה משבצת. היא
 * מיוצאת מחדש מכאן מפני ש־12 קבצי עמוד מייבאים אותה בנתיב הזה, ושינוי
 * נתיב ייבוא ב־12 קבצים שאינם בבעלות הסבב הזה הוא שינוי מיותר.
 */
export { kashrutClauseHe } from "@/lib/seo";
export type { KashrutTier } from "@/lib/seo";

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

/**
 * בונה רשומה. `topicHe` נשמר, הכותרת נגזרת ממנו, והתיאור מקבל את סיומת
 * הכשרות של אותו מפלס בדיוק — כך אי אפשר שכותרת תדבר על כשרות ותיאור לא,
 * או להפך.
 */
function entry(args: {
  id: string;
  path: string;
  topicHe: string;
  kashrut: KashrutTier;
  /** משפט התיאור **בלי** סיומת הכשרות. היא מתווספת לפי המפלס. */
  descriptionHe: string;
  breadcrumb: Crumb[];
  occasion: OccasionId | null;
  robots?: PageMeta["robots"];
  ogImage?: PageMeta["ogImage"];
  note?: string;
}): PageMetaExtra {
  return {
    id: args.id,
    path: args.path,
    topicHe: args.topicHe,
    kashrutTier: args.kashrut,
    titleHe: composeTitle({ topicHe: args.topicHe, kashrut: args.kashrut }),
    descriptionHe: withKashrut(args.descriptionHe, args.kashrut),
    robots: args.robots ?? "index,follow",
    ogImage: args.ogImage ?? "auto",
    breadcrumb: args.breadcrumb,
    occasion: args.occasion,
    note: args.note,
  };
}

/* ═══════════════════ הרשומות ═══════════════════ */

function records(): PageMetaExtra[] {
  return [
    /* ─────────── P-02 · /menus ─────────── */
    entry({
      id: "P-02",
      path: "/menus",
      /* «תפריטי קייטרינג» ולא «התפריטים»: הראשון הוא מה שמחפשים, השני
         הוא מה שאנחנו קוראים לזה בפנים. */
      topicHe: "תפריטי קייטרינג",
      kashrut: "general",
      descriptionHe: `התפריטים של ${CATERING_NAME}, ומה מתוכם אפשר להזמין לאירוע. הכול ${ORIGIN_HE}.`,
      breadcrumb: [HOME, { labelHe: "התפריטים", path: "/menus" }],
      occasion: null,
      note: "התפריטים עצמם ב־content/menus.ts. ריק היום ⇒ הדף עובר לרג׳יסטר התפעולי (01 §3.3).",
    }),

    /* ─────────── P-03 · /kitchen ───────────
     * דף אחד, לא שלושה. הגרסה הקודמת החזיקה `/kitchens` + שלושה דפי
     * סניף, וזו הייתה בדיוק הטענה «רשת של שלושה מטבחי קייטרינג» שנדחתה.
     * המזהה P-03 נשמר מהמפרט כדי שכרטיס ה־og לא יתייתם. */
    entry({
      id: "P-03",
      path: "/kitchen",
      topicHe: "המטבח שמבשל את הקייטרינג",
      kashrut: "general",
      descriptionHe:
        "מי מבשל את הקייטרינג של מאמאמיה: מטבח של מסעדה איטלקית פעילה, ולא מטבח ייצור שנפתח לאירועים.",
      breadcrumb: [HOME, { labelHe: "המטבח", path: "/kitchen" }],
      occasion: null,
      note: "בלוק פרטי המסעדות נשען על anyRestaurantDetail() — false היום. הדף עומד על הטענה בלבד.",
    }),

    /* ─────────── P-07 · /catering ───────────
     * הנושא נבדל מדף הבית בכוונה: הבית לוקח «קייטרינג איטלקי לאירועים»,
     * והמפרק לוקח את הניסוח שמתאר מפרק — «לפי סוג האירוע». שתי כותרות
     * שמתחילות באותן שתי מילים הן שתי תוצאות שמתחרות זו בזו. */
    entry({
      id: "P-07",
      path: "/catering",
      topicHe: "קייטרינג לאירועים לפי סוג האירוע",
      kashrut: "general",
      descriptionHe: `סוגי האירועים שקייטרינג מאמאמיה עושה, במקום אחד. ${ORIGIN_HE}.`,
      breadcrumb: [HOME, CATERING],
      occasion: null,
      note: "מפרק בלבד. אינו נושא עובדה משלו, ולכן אין לו שער.",
    }),

    /* ─────────── P-08 · /catering/business ─────────── */
    entry({
      id: "P-08",
      path: "/catering/business",
      topicHe: "קייטרינג לחברות ולישיבות",
      kashrut: "general",
      descriptionHe: `ארוחת צוות, כיבוד לישיבה ואירוע חברה — ${FROM_ORIGIN_HE}. אתם קובעים תאריך, אנחנו מבשלים.`,
      breadcrumb: [HOME, CATERING, { labelHe: "קייטרינג לחברות", path: "/catering/business" }],
      occasion: "business",
      note: "בלי חשבונית ובלי תנאי רכש בטקסט: companyId הוא null.",
    }),

    /* ─────────── P-09 · /catering/private-events ─────────── */
    entry({
      id: "P-09",
      path: "/catering/private-events",
      topicHe: "קייטרינג לאירוע פרטי",
      kashrut: "general",
      descriptionHe: `שמחה פרטית, יום הולדת או אירוח בבית — ${FROM_ORIGIN_HE}.`,
      breadcrumb: [
        HOME,
        CATERING,
        { labelHe: "שמחות פרטיות", path: "/catering/private-events" },
      ],
      occasion: "private-events",
      note: "«אירוח אצלנו במסעדה» אינו נאמר: at_restaurant חסום על קיבולת שלא נמסרה.",
    }),

    /* ─────────── P-10 · /catering/bar-mitzvah ───────────
     * מפלס `written`: `content/occasions.ts` מציב כאן שער רך על נוסח
     * הכשרות בכתב, ובלעדיו המילה «כשר» אינה נכתבת בדף — וכותרת ותיאור
     * הם הטקסט הראשון שהקונה רואה, לפני הדף. */
    entry({
      id: "P-10",
      path: "/catering/bar-mitzvah",
      topicHe: "קייטרינג לבר מצווה ולבת מצווה",
      kashrut: "written",
      descriptionHe: `בר מצווה ובת מצווה — ${FROM_ORIGIN_HE}. אתם מארחים, אנחנו מבשלים.`,
      breadcrumb: [
        HOME,
        CATERING,
        { labelHe: "בר מצווה ובת מצווה", path: "/catering/bar-mitzvah" },
      ],
      occasion: "bar-mitzvah",
      note: "טענת כשרות תיכנס לכותרת ולתיאור מאליה ברגע ש־CATERING_KASHRUT_STATEMENT יימסר.",
    }),

    /* ─────────── P-11 · /catering/shiva ───────────
     * ‏01 P-11: רג׳יסטר תפעולי ואוצר מילים מוגבל — אין «אירוע», אין
     * «חוויה», אין «לחגוג». הכלל חל על הכותרת ועל התיאור בדיוק כמו על
     * הדף, כי הם מה שהאבל רואה ראשון בתוצאת החיפוש. השער כאן **קשיח**
     * (`occasions.ts`): בלי נוסח כשרות בכתב הדף אינו נבנה כלל. */
    entry({
      id: "P-11",
      path: "/catering/shiva",
      topicHe: "אוכל לשבעה ולאזכרה",
      kashrut: "written",
      descriptionHe: `אוכל לבית אבלים בימי השבעה ולאזכרה, ${FROM_ORIGIN_HE}. מגיעים עם הכול מוכן.`,
      breadcrumb: [HOME, CATERING, { labelHe: "אירוח שבעה", path: "/catering/shiva" }],
      occasion: "shiva",
      note: "שער קשיח סגור היום. הרשומה קיימת כדי שהדף לא ייכתב מחדש כשהנוסח יימסר.",
    }),

    /* ─────────── P-12 · /catering/holidays ───────────
     * הרשומה הבסיסית בלבד. החלופה העונתית (שם החג + שנה) נבנית ב־
     * `holidayMeta()` שב־`lib/seo.ts` — היא יורשת מכאן את מפלס הכשרות,
     * ואינה נוקבת בערים. */
    entry({
      id: "P-12",
      path: "/catering/holidays",
      topicHe: "קייטרינג לחגים",
      kashrut: "written",
      descriptionHe: `ארוחת חג לבית שמארח, ${FROM_ORIGIN_HE}. סוגרים תפריט מראש ולא מבשלים בערב החג.`,
      breadcrumb: [HOME, CATERING, { labelHe: "חגים", path: "/catering/holidays" }],
      occasion: "holidays",
      note: "מפלס written: ארוחת חג היא קלאסטר בכוונת כשרות, כמו שבעה ובר מצווה.",
    }),

    /* ─────────── P-13 · /catering/fun-day ─────────── */
    entry({
      id: "P-13",
      path: "/catering/fun-day",
      topicHe: "קייטרינג ליום גיבוש וליום כיף",
      kashrut: "general",
      descriptionHe: `יום גיבוש או יום כיף לצוות, עם אוכל ${FROM_ORIGIN_HE}.`,
      breadcrumb: [HOME, CATERING, { labelHe: "ימי גיבוש", path: "/catering/fun-day" }],
      occasion: "fun-day",
      note: "שער קשיח על liveStations. בינתיים עוגן #gibush בתוך /catering/business (01 P-13).",
    }),

    /* ─────────── P-14 · /catering/dairy ───────────
     * «חלבי» כאן הוא סימון תזונתי מ־`content/dishes.ts` ותו לא: הוא אינו
     * אומר דבר על הפרדה במטבח ואינו טענת כשרות. */
    entry({
      id: "P-14",
      path: "/catering/dairy",
      topicHe: "קייטרינג חלבי איטלקי",
      kashrut: "general",
      descriptionHe: `תפריט חלבי איטלקי לאירוע, ${FROM_ORIGIN_HE}. פסטות, אנטיפסטי וקינוחים.`,
      breadcrumb: [HOME, CATERING, { labelHe: "קייטרינג חלבי", path: "/catering/dairy" }],
      occasion: "dairy",
      note: "אין טענת מחיר משווה. «אותו תקציב, שולחן עשיר יותר» נדחתה בביקורת (§A2).",
    }),

    /* ─────────── P-15 · /urgent ───────────
     * הכותרת נוקבת בנושא הדף בלבד. הבטחת מהירות אינה נאמרת כאן ולא בשום
     * מקום אחר בשכבת ה־head: `sameDayCutoff` הוא Slot, ובלעדיו הדף עולה
     * בלי טענת קאט־אוף וקבוצת המודעות אינה רצה (01 P-15). */
    entry({
      id: "P-15",
      path: "/urgent",
      topicHe: "קייטרינג להיום",
      kashrut: "general",
      descriptionHe: `פנייה דחופה לקייטרינג, ${FROM_ORIGIN_HE}. מתקשרים, ואנחנו אומרים כן או לא.`,
      breadcrumb: [HOME, { labelHe: "קייטרינג להיום", path: "/urgent" }],
      occasion: "urgent",
      note: "ההמרה בטלפון. שעת חיתום, אם תימסר, מוצגת ב־Asia/Jerusalem בלבד (INV-9).",
    }),

    /* ─────────── P-16 · /pasta-bar ───────────
     * התיאור **אינו** מצהיר שעמדה חיה מוצעת כשירות: `SLOTS.liveStations`
     * הוא `null`, וזו אחת מהטענות שהוסרו. הוא מדבר על פסטה ועל המטבח,
     * שהם עובדות שיש לנו. הכותרת נוקבת בנושא, והמסלול ממילא אינו נרשם
     * עד שמגבלות העמדה יימסרו. */
    entry({
      id: "P-16",
      path: "/pasta-bar",
      topicHe: "עמדת פסטה לאירועים",
      kashrut: "general",
      descriptionHe: `פסטה לאירועים, ${FROM_ORIGIN_HE}. אותו מטבח שמבשל פסטה לסועדים במסעדה, מבשל גם לאירוע שלכם.`,
      breadcrumb: [HOME, { labelHe: "עמדת פסטה", path: "/pasta-bar" }],
      occasion: "pasta-bar",
      note: "שער קשיח על liveStations. מגבלות העמדה ייכנסו ל־content/stations.ts, שטרם נוצר.",
    }),

    /* ─────────── P-19 · /summary ───────────
     * ‏00-spec-review §E4: כרטיס ה־og גנרי ומשותף, לעולם לא פרטי האירוע
     * של הקונה — הדף נשלח הלאה בוואטסאפ, והתצוגה המקדימה נפתחת בקבוצה.
     * ‏§D6: `noindex` ולא `Disallow`, אחרת סורק לא יקרא את ה־noindex
     * ומייצר התצוגה המקדימה לא יביא כרטיס בכלל. */
    entry({
      id: "P-19",
      path: "/summary",
      topicHe: "סיכום הפנייה",
      kashrut: "none",
      descriptionHe: "סיכום הפרטים שנשלחו לקייטרינג מאמאמיה.",
      robots: "noindex,nofollow",
      ogImage: SITE_DEFAULT_OG,
      breadcrumb: [HOME],
      occasion: null,
      note: "אין כאן טענה עסקית בכוונה: זה הטקסט שנפתח בתצוגה מקדימה בקבוצת צ׳אט.",
    }),

    /* ─────────── P-20 · /unsubscribe ─────────── */
    entry({
      id: "P-20",
      path: "/unsubscribe",
      topicHe: "הסרה מרשימת הדיוור",
      kashrut: "none",
      descriptionHe: "הסרה מרשימת הדיוור השיווקי של קייטרינג מאמאמיה.",
      robots: "noindex,nofollow",
      ogImage: SITE_DEFAULT_OG,
      breadcrumb: [HOME],
      occasion: null,
      note: "מגיעים לכאן מקישור עם טוקן ייעודי (00-spec-review §B8), לא עם ref.",
    }),
  ];
}

/* ═══════════════════ הטבלה ═══════════════════ */

let memo: Readonly<Record<string, PageMetaExtra>> | null = null;

/** הטבלה של המודול הזה, לפי נתיב. נבנית פעם אחת. */
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
 * ממזג את הרשומות כאן לתוך טבלה קיימת. הרשומות כאן **גוברות**,
 * ו־`SUPERSEDED_PATHS` נמחקים. הקלט אינו משתנה.
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

let allMemo: Readonly<Record<string, PageMeta>> | null = null;

/**
 * **טבלת המטא של כל האתר** — `PAGE_META` שב־`lib/seo.ts` (בית, הצעה,
 * דפי שירות) + הרשומות כאן, פחות הנתיבים שהוחלפו.
 *
 * זו הטבלה שמזינה בדיקת ייחודיות, מחולל sitemap, וכל הזרקת head בשרת.
 * שתי הטבלאות הנפרדות אינן אמורות להיקרא ישירות לשם כך.
 */
export function allPageMeta(): Readonly<Record<string, PageMeta>> {
  if (!allMemo) allMemo = mergePageMeta(PAGE_META);
  return allMemo;
}

/** נרמול זהה ל־`normalizePath()` שב־seo.ts. */
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
 * פותר מטא לנתיב **מכל האתר**. זה הפותר שיש להשתמש בו כשלא ידוע מראש
 * מאיזו טבלה הנתיב בא — למשל בהזרקת head בשרת, שרואה כתובת ולא עמוד.
 */
export function resolveSiteMeta(pathname: string): PageMeta | null {
  return allPageMeta()[normalize(pathname)] ?? null;
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

/**
 * ביקורת הכנות על **כל** טבלאות המטא של האתר. פונקציית בדיקה.
 * מערך ריק ⇒ אין ולו כותרת או תיאור אחד שמצהיר על עובדה שאין לה משבצת.
 */
export function auditSiteMeta(): MetaFinding[] {
  return auditPageMeta(allPageMeta());
}

/* ═══════════════════ ניקוי לפני סריאליזציה ═══════════════════ */

const isPlainObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" &&
  v !== null &&
  !Array.isArray(v) &&
  (Object.getPrototypeOf(v) === Object.prototype || Object.getPrototypeOf(v) === null);

/**
 * ─────────────────────────────────────────────────────────────────────
 *  ‏`stripEmpty` — הגרסה הכללית, שאינה יודעת דבר על schema.org
 * ─────────────────────────────────────────────────────────────────────
 * מוחק **רקורסיבית** כל מפתח שערכו `null` / `undefined` / מחרוזת ריקה
 * (או רווחים בלבד) / מערך ריק / אובייקט שהתרוקן.
 *
 * `false` ו־`0` נשמרים — שניהם ערכים אמיתיים, ומחיקתם הייתה הופכת
 * `"isAccessibleForFree": false` מהצהרה להיעדר הצהרה.
 *
 * לצמתי JSON-LD יש להשתמש ב־`stripEmptyJsonLd()`.
 */
export function stripEmpty<T>(value: T): T | undefined {
  const walk = (v: unknown): unknown => {
    if (v === null || v === undefined) return undefined;
    if (typeof v === "string") {
      const trimmed = v.trim();
      return trimmed === "" ? undefined : trimmed;
    }
    if (typeof v === "boolean" || typeof v === "bigint") return v;
    if (typeof v === "number") return Number.isFinite(v) ? v : undefined;
    if (Array.isArray(v)) {
      const items = v.map(walk).filter((x) => x !== undefined);
      return items.length > 0 ? items : undefined;
    }
    if (isPlainObject(v)) {
      const out: Record<string, unknown> = {};
      for (const [key, raw] of Object.entries(v)) {
        const cleaned = walk(raw);
        if (cleaned !== undefined) out[key] = cleaned;
      }
      return Object.keys(out).length > 0 ? out : undefined;
    }
    /* פונקציה, Symbol, Date, Map, מופע של מחלקה — אינם ניתנים
       לסריאליזציה בטוחה, ולכן מושמטים במקום להיפלט כ־`{}`. */
    return undefined;
  };
  return walk(value) as T | undefined;
}

/**
 * ─────────────────────────────────────────────────────────────────────
 *  ‏`stripEmptyJsonLd` — ניקוי צומת JSON-LD
 * ─────────────────────────────────────────────────────────────────────
 * **מאציל ל־`compact()` שב־`lib/seo.ts`, ואינו מממש כלל משלו.**
 *
 * עד עכשיו היו כאן עותק שני של אלגוריתם הניקוי, עותק שני של
 * `FORBIDDEN_KEYS` ועותק שני של `TYPE_ONLY_NODES` — שלושתם כדי להימנע
 * ממעגל ייבוא שכבר אינו קיים. שני מימושים לכלל שמונע פליטת טענה שקרית
 * הם שני מימושים שייפרדו, וברגע שייפרדו — אחד מהם יפלוט `priceRange`.
 *
 * הסיבה שהכלל קיים בכלל: `content/business.ts` מלא ב־Slots שערכם `null`.
 * צומת שנבנה מהם ופולט `"streetAddress": null` **מצהיר על השדה** בעיני
 * צרכני הגרף. גוגל מציג את זה כעובדה, מנועי תשובות שואבים את זה, וזו
 * התחייבות מסחרית. **היעדר נתון עדיף על נתון ריק שמוצג כנתון.**
 *
 * מחזיר `null` כשלא נותר דבר, כדי שיתאים לחתימה של `serializeJsonLd()`.
 */
export function stripEmptyJsonLd<T extends object>(node: T): T | null {
  return compact(node as unknown as JsonLdNode) as T | null;
}
