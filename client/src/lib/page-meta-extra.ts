/**
 * ═══════════════════════════════════════════════════════════════════════
 *  page-meta-extra — רשומות המטא למסלולים שנבנים בסבב הזה.
 * ═══════════════════════════════════════════════════════════════════════
 *
 * spec 01 §2 (מלאי הדפים), §4 (חוזי הדפים), §5.1 (שכבת ה־head), T-3, T-4.
 * ‏00-spec-review.md §A — ומעליו LAW 1 של הבריף: עובדה עסקית שאינה
 * ב־`content/business.ts` אינה קיימת.
 *
 * ─────────────────────────────────────────────────────────────────────
 *  למה מודול נפרד ולא הרחבה של `lib/seo.ts`
 * ─────────────────────────────────────────────────────────────────────
 * ‏`lib/seo.ts` הוא בבעלות אף אחד בסבב הזה ואסור לגעת בו. המסלולים
 * שנפתחים עכשיו צריכים בכל זאת רשומת מטא, ולכן הן יושבות כאן ובאותו
 * טיפוס בדיוק (`PageMeta`), כך שהמיזוג לתוך `PAGE_META` הוא פעולה אחת:
 *
 * ```ts
 * // בתוך lib/seo.ts, כשהבעלות תתאחד:
 * import { pageMetaExtra } from "@/lib/page-meta-extra";
 * const ALL = { ...PAGE_META, ...pageMetaExtra() };
 * ```
 *
 * **המיזוג חייב לעבור דרך הפונקציה ולא דרך קבוע.** `lib/seo.ts` הוא
 * המקור לטיפוסים כאן; אם הוא יִיבא בחזרה קבוע שנבנה בזמן טעינת המודול
 * ייווצר מעגל ייבוא שבו `SITE_NAME_HE` עדיין `undefined`. בנייה עצלה
 * (‏`pageMetaExtra()` + memo) מסירה את הסיכון לחלוטין.
 *
 * ─────────────────────────────────────────────────────────────────────
 *  החוק שמחזיק את התיאורים — קִראו לפני שמוסיפים רשומה
 * ─────────────────────────────────────────────────────────────────────
 * ‏meta description הוא הטקסט שגוגל מצטט כהבטחה של העסק, והוא נשאב
 * למנועי תשובות. הסבב הקודם שילח חמישה תיאורים שהצהירו על עובדות
 * שאיש לא מסר — מטבח שמבשל **כל יום**, **עמדה חיה** כשירות מוצע,
 * ו**משלוח מהיר**. הם הוסרו. אין להחזיר אותם בשום ניסוח.
 *
 * תיאור כאן רשאי לומר **רק** את אלה:
 *   1. שמדובר בקייטרינג;
 *   2. שהוא מגיע ממסעדה איטלקית;
 *   3. ששלושת המטבחים הם הרצליה פיתוח, רעננה ופתח תקווה;
 *   4. מה האירוע שהדף עוסק בו.
 *
 * ואסור לו לומר דבר על: ימים, שעות, מהירות, זמן תגובה, מינימום או
 * מקסימום סועדים, מחיר, מה כלול, צוות, מלצרים, עמדות חיות, טעימות,
 * כתובות, אזורי חלוקה, כשרות, או כל יכולת תפעולית אחרת.
 *
 * ─────────────────────────────────────────────────────────────────────
 *  כותרות: המפרט מילה במילה, ושלוש חריגות מנומקות
 * ─────────────────────────────────────────────────────────────────────
 * הכותרות מועתקות מ־`01` §4 כלשונן, למעט שלוש. הכלל שהפעלנו:
 *
 *   **כותרת רשאית לנקוב בנושא הדף עצמו; אסור לה להוסיף עליו טענה.**
 *
 * דף שכל קיומו תלוי בעובדה חסרה (‏`/pasta-bar`, `/urgent`) פשוט לא
 * נבנה עד שהעובדה תימסר — ראו `gate` בכל רשומה — ולכן נקיבת הנושא
 * בכותרת אינה הצהרה עודפת. טענה **נוספת** על הנושא כן.
 *
 *   · P-15 `/urgent` — הוסר `משלוח מהיר` מהכותרת. הבטחת מהירות אין לה
 *     שדה ב־`business.ts` בכלל, והיא אחת מחמש הטענות שהוסרו. הנושא
 *     (`קייטרינג להיום`) נשמר, ו־`sameDayCutoff` שומר על הדף.
 *   · P-09 `/catering/private-events` — `אירוע פרטי במסעדה` הוחלף.
 *     אירוח אירוע פרטי בתוך המסעדה הוא יכולת תפעולית שלא נמסרה, והיא
 *     תוספת על נושא הדף (קייטרינג לשמחה פרטית), לא הנושא עצמו.
 *   · P-14 `/catering/dairy` — המפרט לא סיפק כותרת; נגזרה מה־H1.
 *
 * ─────────────────────────────────────────────────────────────────────
 *  קנוני
 * ─────────────────────────────────────────────────────────────────────
 * ‏T-4: **`path` הוא הקנוני.** אין שדה קנוני נפרד ולא ייתכן כזה — כל
 * רשומה מצביעה על עצמה, `absoluteUrl(meta.path)` הוא הכתובת המלאה,
 * ופרמטרים של קמפיין לעולם לא נכנסים אליה. אין כאן כתובת שהקנוני שלה
 * דף אחר; חלופה עונתית לדף החגים כבר קיימת ב־`holidayMeta()` שב־seo.ts
 * והיא שומרת על אותו `path`.
 */

import { BRANCHES } from "@/content/business";
import type { Crumb, PageMeta } from "@/lib/seo";

/* ═══════════════════ טיפוס ═══════════════════ */

/**
 * ‏`PageMeta` + שדה תיעוד אחד.
 *
 * `gate` הוא **רשימת העובדות שחייבות להימסר לפני שהמסלול נבנה בכלל**
 * (‏`01` §2, עמודת Gate). הוא לא משנה כלום בזמן ריצה — הוא קיים כדי
 * שמחולל ה־sitemap ורשימת המסלולים לא יפרסמו כתובת שהדף שמאחוריה
 * עדיין לא ניתן לכתוב ביושר. רשימה ריקה ⇒ אין עובדה חוסמת.
 */
export interface PageMetaExtra extends PageMeta {
  readonly gate: readonly string[];
}

/* ═══════════════════ פירורי לחם משותפים ═══════════════════ */

const HOME: Crumb = { labelHe: "ראשי", path: "/" };
const KITCHENS: Crumb = { labelHe: "המטבחים שלנו", path: "/kitchens" };
const CATERING: Crumb = { labelHe: "קייטרינג לאירועים", path: "/catering" };

/**
 * ‏og לדפים שאינם נסרקים ואינם ראויים לכרטיס משלהם.
 * ‏00-spec-review §E4: `/summary` מועבר הלאה בוואטסאפ, ולכן חייב כרטיס
 * **גנרי** — לעולם לא פרטי האירוע של הקונה, שיודלפו לתצוגה מקדימה
 * בקבוצה. הכרטיס של דף הבית הוא ברירת המחדל של האתר.
 */
const SITE_DEFAULT_OG = "/og/P-01.jpg";

/** מזהי הסניפים לפי הסדר הנעול ב־`BRANCHES`: P-04, P-05, P-06. */
const branchSlugOf = (id: string): string => id.replace(/_/g, "-");

/* ═══════════════════ הרשומות ═══════════════════ */

/**
 * דפי הסניפים. שלושה מופעים, חוזה אחד (`01` P-04…P-06).
 * התיאור נבדל בשם היישוב בלבד — וזה כל מה שמותר לו להיבדל בו (T-3).
 */
function branchRecords(): PageMetaExtra[] {
  return BRANCHES.map((b, i) => {
    const slug = branchSlugOf(b.id);
    return {
      id: `P-0${4 + i}`,
      path: `/kitchens/${slug}`,
      titleHe: `קייטרינג איטלקי ב${b.name} | מהמטבח של המסעדה שלנו ב${b.name} — מאמא מיה`,
      descriptionHe: `המסעדה של מאמאמיה ב${b.name}. הקייטרינג מבושל במטבח של מסעדה פעילה.`,
      robots: "index,follow" as const,
      ogImage: "auto" as const,
      breadcrumb: [HOME, KITCHENS, { labelHe: b.name, path: `/kitchens/${slug}` }],
      gate: ["כתובת הסניף", "שעות הסניף", "לפחות עובדה ייחודית אחת לסניף"],
    };
  });
}

function staticRecords(): PageMetaExtra[] {
  return [
    /* ─────────── P-02 · /menus ─────────── */
    {
      id: "P-02",
      path: "/menus",
      titleHe: "התפריטים | קייטרינג מאמא מיה — מהמטבח של המסעדה",
      descriptionHe:
        "התפריטים של קייטרינג מאמאמיה. מבושל במטבח של מסעדה איטלקית פעילה, כשר בד״ץ.",
      robots: "index,follow",
      ogImage: "auto",
      breadcrumb: [HOME, { labelHe: "התפריטים", path: "/menus" }],
      gate: ["לפחות מנה אחת שזמינה לקייטרינג"],
    },

    /* ─────────── P-03 · /kitchens ─────────── */
    {
      id: "P-03",
      path: "/kitchens",
      titleHe: "המטבחים שלנו | שלוש מסעדות איטלקיות פעילות — מאמא מיה",
      descriptionHe:
        "שלושת המטבחים של מאמא מיה: הרצליה פיתוח, רעננה ופתח תקווה. אותם מטבחים מבשלים גם לקייטרינג.",
      robots: "index,follow",
      ogImage: "auto",
      breadcrumb: [HOME, KITCHENS],
      gate: ["כתובות", "שעות פעילות"],
    },

    /* ─────────── P-07 · /catering ─────────── */
    {
      id: "P-07",
      path: "/catering",
      titleHe: "קייטרינג לאירועים | מאמא מיה — שלושה מטבחי מסעדה",
      descriptionHe:
        "קייטרינג לאירועים מהמטבחים של מאמא מיה, מסעדה איטלקית בהרצליה פיתוח, ברעננה ובפתח תקווה.",
      robots: "index,follow",
      ogImage: "auto",
      breadcrumb: [HOME, CATERING],
      gate: [],
    },

    /* ─────────── P-08 · /catering/business ─────────── */
    {
      id: "P-08",
      path: "/catering/business",
      titleHe: "מגשי אירוח וקייטרינג לחברות בהרצליה פיתוח | מאמא מיה — מטבח מסעדה",
      descriptionHe:
        "קייטרינג לחברות ולישיבות מהמטבח של המסעדה האיטלקית שלנו בהרצליה פיתוח. עוד שני מטבחים ברעננה ובפתח תקווה.",
      robots: "index,follow",
      ogImage: "auto",
      breadcrumb: [HOME, CATERING, { labelHe: "קייטרינג לחברות", path: "/catering/business" }],
      gate: ["שעת חיתום", "מינימום סועדים", "תנאי רכש"],
    },

    /* ─────────── P-09 · /catering/private-events ─────────── */
    {
      id: "P-09",
      path: "/catering/private-events",
      titleHe: "קייטרינג לשמחה פרטית ולאירוח בבית | מאמא מיה — מטבח מסעדה איטלקית",
      descriptionHe:
        "קייטרינג לשמחה פרטית ולאירוח בבית, מהמטבחים של המסעדה האיטלקית שלנו — הרצליה פיתוח, רעננה ופתח תקווה.",
      robots: "index,follow",
      ogImage: "auto",
      breadcrumb: [
        HOME,
        CATERING,
        { labelHe: "שמחות פרטיות", path: "/catering/private-events" },
      ],
      gate: ["מינימום סועדים", "תשובה על צוות והגשה"],
    },

    /* ─────────── P-10 · /catering/bar-mitzvah ─────────── */
    {
      id: "P-10",
      path: "/catering/bar-mitzvah",
      titleHe: "קייטרינג לבר מצווה ולבת מצווה | מאמא מיה — מטבח מסעדה איטלקית",
      descriptionHe:
        "קייטרינג לבר מצווה ולבת מצווה מהמטבחים של המסעדה האיטלקית שלנו בהרצליה פיתוח, ברעננה ובפתח תקווה.",
      robots: "index,follow",
      ogImage: "auto",
      breadcrumb: [
        HOME,
        CATERING,
        { labelHe: "בר מצווה ובת מצווה", path: "/catering/bar-mitzvah" },
      ],
      gate: ["תשובת כשרות מלאה", "מינימום סועדים", "תשובה על צוות והגשה"],
    },

    /* ─────────── P-11 · /catering/shiva ───────────
     * ‏01 P-11: הדף כפוף לרגיסטר תפעולי ואוצר מילים מוגבל — אין `אירוע`,
     * אין `חוויה`, אין `לחגוג`. הכלל חל גם על הכותרת ועל התיאור, כי הם
     * הטקסט שהאבל רואה ראשון, בתוצאת החיפוש. */
    {
      id: "P-11",
      path: "/catering/shiva",
      titleHe: "אוכל לשבעה — משלוח מהמטבח שלנו | מאמא מיה",
      descriptionHe:
        "אוכל לשבעה ולאזכרה מהמטבח של המסעדה האיטלקית שלנו — הרצליה פיתוח, רעננה ופתח תקווה.",
      robots: "index,follow",
      ogImage: "auto",
      breadcrumb: [HOME, CATERING, { labelHe: "אירוח שבעה", path: "/catering/shiva" }],
      gate: [
        "תשובת כשרות מלאה (חסם קשיח)",
        "זמן התראה",
        "חלון משלוח",
        "שעות מאוישות לטלפון",
      ],
    },

    /* ─────────── P-12 · /catering/holidays ───────────
     * הרשומה הבסיסית. החלופה העונתית (שם החג + שנה) כבר קיימת
     * ב־`holidayMeta()` שב־`lib/seo.ts` ואין לשכפל אותה כאן. */
    {
      id: "P-12",
      path: "/catering/holidays",
      titleHe: "קייטרינג לחגים | מאמא מיה — מטבח מסעדה איטלקית",
      descriptionHe:
        "ארוחת חג מהמטבחים של המסעדה האיטלקית שלנו — הרצליה פיתוח, רעננה ופתח תקווה.",
      robots: "index,follow",
      ogImage: "auto",
      breadcrumb: [HOME, CATERING, { labelHe: "חגים", path: "/catering/holidays" }],
      gate: ["יכולת לכל חג", "תאריך הזמנה אחרון חתום"],
    },

    /* ─────────── P-13 · /catering/fun-day ─────────── */
    {
      id: "P-13",
      path: "/catering/fun-day",
      titleHe: "קייטרינג ליום גיבוש ולימי כיף | מאמא מיה — מטבח מסעדה איטלקית",
      descriptionHe:
        "קייטרינג ליום גיבוש ולימי כיף, מהמטבחים של המסעדה האיטלקית שלנו בהרצליה פיתוח, ברעננה ובפתח תקווה.",
      robots: "index,follow",
      ogImage: "auto",
      breadcrumb: [HOME, CATERING, { labelHe: "ימי גיבוש", path: "/catering/fun-day" }],
      gate: ["מגבלות תפעוליות של עמדה"],
    },

    /* ─────────── P-14 · /catering/dairy ─────────── */
    {
      id: "P-14",
      path: "/catering/dairy",
      titleHe: "קייטרינג חלבי איטלקי | מאמא מיה — מהמטבח של המסעדה",
      descriptionHe:
        "קייטרינג חלבי איטלקי מהמטבח של המסעדה שלנו בהרצליה פיתוח, ברעננה ובפתח תקווה.",
      robots: "index,follow",
      ogImage: "auto",
      breadcrumb: [HOME, CATERING, { labelHe: "קייטרינג חלבי", path: "/catering/dairy" }],
      gate: ["לפחות מנה חלבית אחת שזמינה לקייטרינג"],
    },

    /* ─────────── P-15 · /urgent ───────────
     * הכותרת נוקבת בנושא הדף בלבד. הבטחת מהירות אינה נאמרת כאן ולא
     * בשום מקום אחר בשכבת ה־head; שעת החיתום היא Slot, ובלעדיה הדף
     * אינו נבנה והקבוצה בקמפיין אינה רצה (`01` P-15). */
    {
      id: "P-15",
      path: "/urgent",
      titleHe: "קייטרינג להיום | קייטרינג מאמאמיה",
      descriptionHe:
        "פנייה דחופה לקייטרינג, מהמטבחים של המסעדה האיטלקית שלנו — הרצליה פיתוח, רעננה ופתח תקווה.",
      robots: "index,follow",
      ogImage: "auto",
      breadcrumb: [HOME, { labelHe: "קייטרינג להיום", path: "/urgent" }],
      gate: ["שעת חיתום לאותו יום, לכל סניף"],
    },

    /* ─────────── P-16 · /pasta-bar ───────────
     * התיאור אינו מצהיר שעמדה חיה מוצעת כשירות: `liveStations` הוא
     * `null`, וזו אחת מחמש הטענות שהוסרו. הוא מדבר על הפסטה ועל
     * המטבחים, שהם עובדות שיש לנו. */
    {
      id: "P-16",
      path: "/pasta-bar",
      titleHe: "עמדת פסטה לאירועים | קו העבודה של המטבח שלנו — מאמא מיה",
      descriptionHe:
        "פסטה לאירועים, מהמטבחים של המסעדה האיטלקית שלנו — הרצליה פיתוח, רעננה ופתח תקווה.",
      robots: "index,follow",
      ogImage: "auto",
      breadcrumb: [HOME, { labelHe: "עמדת פסטה", path: "/pasta-bar" }],
      gate: [
        "טווח סועדים לעמדה",
        "דרישות חשמל, מים ומקום",
        "האם טבח מגיע לאירוע",
      ],
    },

    /* ─────────── P-19 · /summary ───────────
     * ‏00-spec-review §E4: כרטיס ה־og גנרי ומשותף, לעולם לא פרטי האירוע
     * של הקונה — הדף נשלח הלאה בוואטסאפ, והתצוגה המקדימה נפתחת בקבוצה. */
    {
      id: "P-19",
      path: "/summary",
      titleHe: "סיכום אירוע | מאמא מיה",
      descriptionHe: "סיכום הפרטים שנשלחו לקייטרינג מאמאמיה.",
      robots: "noindex,nofollow",
      ogImage: SITE_DEFAULT_OG,
      breadcrumb: [HOME],
      gate: [],
    },

    /* ─────────── P-20 · /unsubscribe ─────────── */
    {
      id: "P-20",
      path: "/unsubscribe",
      titleHe: "הסרה מרשימת הדיוור | מאמא מיה",
      descriptionHe: "הסרה מרשימת הדיוור השיווקי של מאמא מיה.",
      robots: "noindex,nofollow",
      ogImage: SITE_DEFAULT_OG,
      breadcrumb: [HOME],
      gate: [],
    },
  ];
}

/* ═══════════════════ הטבלה ═══════════════════ */

let memo: Readonly<Record<string, PageMetaExtra>> | null = null;

/**
 * הטבלה, לפי נתיב. **נבנית עצלה** — ראו הערת המעגל בראש הקובץ.
 * המפתח הוא ה־`path` עצמו, כדי שהמיזוג לתוך `PAGE_META` יהיה spread אחד.
 */
export function pageMetaExtra(): Readonly<Record<string, PageMetaExtra>> {
  if (memo) return memo;
  const table: Record<string, PageMetaExtra> = {};
  for (const m of [...staticRecords(), ...branchRecords()]) {
    table[m.path] = m;
  }
  memo = Object.freeze(table);
  return memo;
}

/** רשימה שטוחה, לסדר יציב (sitemap, בדיקות). */
export function pageMetaExtraList(): PageMetaExtra[] {
  return Object.values(pageMetaExtra());
}

/**
 * פותר מטא לנתיב מהמודול הזה בלבד. **מחזיר `null` לנתיב לא מוכר** —
 * כמו `resolveMeta()` ב־seo.ts, ומאותה סיבה: כותרת גנרית וקנוני לדף
 * שאינו קיים גרועים מ־404.
 */
export function resolveExtraMeta(pathname: string): PageMetaExtra | null {
  const clean = pathname.split("?")[0].split("#")[0];
  const normalized = clean === "" || clean === "/" ? "/" : clean.replace(/\/+$/, "") || "/";
  return pageMetaExtra()[normalized] ?? null;
}

/** המסלולים שנכנסים ל־sitemap: `index,follow` בלבד. */
export function indexableExtraPaths(): string[] {
  return pageMetaExtraList()
    .filter((m) => m.robots === "index,follow")
    .map((m) => m.path);
}

/* ═══════════════════ ניקוי לפני סריאליזציה ═══════════════════ */

/**
 * מפתחות שנמחקים בכוח מכל צומת (spec 01 §7.3). זהה לרשימה שב־`lib/seo.ts`;
 * מוחזק כאן כדי שהמודול לא יִיבא ערכים מ־seo.ts ויסגור מעגל ייבוא.
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

  // `false` ו־`0` הם ערכים אמיתיים ונשמרים: מחיקתם הייתה הופכת
  // `"isAccessibleForFree": false` מהצהרה להיעדר הצהרה.
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
      // הפניה ב־`@id` היא קשת בגרף — זה כל תוכנה, והיא שורדת.
      const hasRef = Object.prototype.hasOwnProperty.call(out, "@id");
      const declarative = keys.filter((k) => k !== "@type" && k !== "@context");
      const typeOnlyAllowed =
        typeof out["@type"] === "string" && TYPE_ONLY_NODES.has(out["@type"] as string);
      if (!hasRef && declarative.length === 0 && !typeOnlyAllowed) return undefined;
    }
    return out;
  }

  // פונקציה, Symbol, Date, Map, מופע של מחלקה — לא ניתנים לסריאליזציה
  // בטוחה ל־JSON-LD, ולכן מושמטים במקום להיפלט כ־`{}` או כמחרוזת מפתיעה.
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
 * שנבנה מהם ופולט `"streetAddress": null` או `"minValue": ""` **מצהיר
 * על השדה** בעיני צרכני הגרף. גוגל מציג את זה כעובדה על העסק, מנועי
 * תשובות שואבים את זה, וזו התחייבות מסחרית לכל דבר. **היעדר נתון עדיף
 * על נתון ריק שמוצג כנתון.**
 *
 * `false` ו־`0` נשמרים — שניהם ערכים אמיתיים.
 *
 * מוחזר `undefined` כשכל האובייקט התרוקן, כדי שהקורא ישמיט את הצומת
 * כולו במקום לפלוט `{}`.
 *
 * זו הגרסה הכללית: היא לא יודעת דבר על schema.org ומתאימה לכל אובייקט.
 * לצמתי JSON-LD השתמשו ב־`stripEmptyJsonLd()`, שמוסיף את שני הכללים
 * הספציפיים לגרף.
 */
export function stripEmpty<T>(value: T): T | undefined {
  return prune(value, { forbid: false, dropTypeOnly: false }) as T | undefined;
}

/**
 * ‏`stripEmpty` + שני הכללים של הגרף (spec 01 §7.3):
 *
 *  · `priceRange`, `aggregateRating`, `review`, `ratingValue`,
 *    `hasCertification` נמחקים בכוח בכל עומק. אלה ארבעת השדות שהגרסה
 *    הקודמת שידרה בהם שקר — טווח מחיר מומצא, דירוג שלא נאסף, ביקורות
 *    שלא נכתבו, והתעדה שלא הוצגה.
 *  · צומת שנותרו בו `@type` ו־`@context` בלבד מושמט: `{"@type":
 *    "PostalAddress"}` מצהיר שיש כתובת ולא אומר אותה. חריג יחיד —
 *    הפניה ב־`@id`, שהיא קשת בגרף וזה כל תוכנה.
 *
 * מחזיר `null` (ולא `undefined`) כשלא נותר דבר, כדי שיתאים לחתימה של
 * `serializeJsonLd()` וש־`compact()` שב־seo.ts יישאר בר־החלפה.
 */
export function stripEmptyJsonLd<T extends object>(node: T): T | null {
  const result = prune(node, { forbid: true, dropTypeOnly: true });
  return result === undefined ? null : (result as T);
}
