/**
 * ═══════════════════════════════════════════════════════════════════════
 *  שכבת ה־SEO — זהות המותג, מערכת הכותרות, בוני JSON-LD, וטבלת המטא.
 * ═══════════════════════════════════════════════════════════════════════
 *
 * spec 01 §5.1 (שכבת ה־head), §7 (מודל schema.org), INV-7, T-3, T-4.
 *
 * ─────────────────────────────────────────────────────────────────────
 *  החוק שמחזיק את הקובץ הזה
 * ─────────────────────────────────────────────────────────────────────
 * `client/src/content/business.ts` הוא מקור האמת. מאומתים: הטלפון,
 * שם הקייטרינג, השם המשפטי, כתובת הדוא״ל, שמות שלוש המסעדות, והתשובה
 * שנמסרה בעל־פה «כשרות בד״ץ». כתובות, שעות, מחירים, מינימום סועדים,
 * זמן תגובה ואזורי חלוקה — כולם `null`, ונשארים `null`.
 *
 * **כותרת, תיאור ונתון מובנה הם הטקסט היחיד שהעסק משדר בלי שאיש קורא
 * אותו קודם.** הם מצוטטים בתוצאת החיפוש, נשאבים למנועי תשובות, ומוצגים
 * כעובדה על העסק. לכן שלוש רשתות ביטחון, וכולן בקובץ הזה:
 *
 *   1. **אין מחרוזת עובדתית קשיחה בטבלת המטא.** כל טענת כשרות, מחיר
 *      וכל שם מותג נגזרים מ־`content/*` דרך פונקציה. הגרסה הקודמת כתבה
 *      «כשר בד״ץ» כטקסט בתוך הכותרת של דף הבית — כלומר טענת הכשרות
 *      הייתה שורדת גם אם המשבצת ב־`business.ts` הייתה מתרוקנת. עכשיו
 *      היא נעלמת מעצמה.
 *   2. **`compact()` רץ על כל אובייקט JSON-LD** ומוחק רקורסיבית כל מפתח
 *      שערכו null / undefined / מחרוזת ריקה / מערך ריק / אובייקט שהתרוקן.
 *      לא נפלט `null`, לא מחרוזת ריקה, ולא תו ממלא־מקום.
 *   3. **`FORBIDDEN_KEYS` נמחקים בכוח** בשלב הסריאליזציה (spec 01 §7.3):
 *      `priceRange`, `aggregateRating`, `review`, `ratingValue`,
 *      `hasCertification`. אלה השדות שהגרסה שנמחקה שידרה בהם שקר.
 *
 * ועל שלושתן — `auditPageMeta()` (בתחתית הקובץ), שקורא את כל הכותרות
 * והתיאורים ומחזיר הפרות. הוא נועד לרוץ בבדיקה, לא בזמן ריצה.
 *
 * ─────────────────────────────────────────────────────────────────────
 *  מערכת הכותרות — והשינוי בעל הערך הגבוה ביותר שממתין ללקוח
 * ─────────────────────────────────────────────────────────────────────
 * המוסכמה בקטגוריה היא תג כותרת שנושא **עוגן מחיר** ו**גוף מכשיר נקוב**:
 * «קייטרינג כשר בד״ץ X · החל מ־00 ₪ לסועד | שם העסק». שניהם מעלים CTR
 * אורגני, ושניהם מסננים תנועה לא רלוונטית לפני הקליק — כלומר הם משפרים
 * גם דירוג וגם איכות ליד.
 *
 * **את שניהם אי אפשר לכתוב היום בכנות:**
 *   · אין מחירון מאושר (`SLOTS.pricePerPerson` הוא `null`).
 *   · «בד״ץ» אינו גוף אחד, והגוף המסוים לא נמסר (`business.ts`).
 *
 * לכן `composeTitle()` בנוי כתבנית עם שתי משבצות שמתמלאות מעצמן:
 * ברגע ש־`TITLE_PRICE_APPROVAL` ו־`SLOTS.pricePerPerson` יימסרו, עוגן
 * המחיר נכנס לכל כותרת שיש לה מקום; ברגע ש־`KASHRUT_AUTHORITY_HE`
 * ו־`CATERING_KASHRUT_STATEMENT` יימסרו, שם הגוף המכשיר מחליף את
 * «כשר בד״ץ» הכללי. **אין לגעת בטבלת המטא כשזה קורה.**
 *
 * ─────────────────────────────────────────────────────────────────────
 *  מה שאין כאן במכוון
 * ─────────────────────────────────────────────────────────────────────
 *  · **אין `LocalBusiness` ואין `Restaurant`.** ישות מקום בלי כתובת אינה
 *    ישות מקום; והמודל שהיה כאן — שלושה `Restaurant` תחת `subOrganization`
 *    בכתובות `/kitchens/{slug}` — הוא בדיוק הטענה «רשת של שלושה מטבחי
 *    קייטרינג» שהמיצוב מוחק, בדלת האחורית של הנתונים המובנים. נמחק
 *    ‏(`buildRestaurant`, `defaultBranchSeo`, `BranchSeo`, `kitchenId`),
 *    ולא יוחזר בלי מטבח נקוב + כתובת.
 *  · **אין `priceRange`** — גם לא ניחוש, גם לא `"{{PRICE_RANGE}}"`.
 *  · **אין `aggregateRating` ואין `Review`**: אין ביקורות שניתן לייחס,
 *    וגוגל אוסר קטעי ביקורת עצמיים.
 *  · **אין `SearchAction`** — ראו `buildWebSite`.
 *  · **אין דומיין קשיח.** ה־origin נפתר מ־`VITE_SITE_ORIGIN`, ואם אינו
 *    מוגדר — מ־`window.location.origin`.
 */

import {
  BRANCHES,
  CATERING_NAME,
  PHONE,
  SLOTS,
  filled,
} from "@/content/business";
import { cateringServiceCities, kashrutStatement } from "@/content/locations";
import { ROUTES, isServedPath, matchRoute } from "@shared/routes";

/* ═══════════════════ טיפוסים ═══════════════════ */

export type JsonLdValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | JsonLdNode
  | JsonLdValue[];

export interface JsonLdNode {
  [key: string]: JsonLdValue;
}

/** ערך שטרם סופק. תואם ל־`Slot<T>` שב־content/business.ts. */
type Maybe<T> = T | null | undefined;

export type RobotsDirective = "index,follow" | "noindex,follow" | "noindex,nofollow";

export type Crumb = { labelHe: string; path: string };

/**
 * מפלס טענת הכשרות שדף רשאי לשאת. ההפרדה היא ההחלטה הכבדה בשכבת ה־head.
 *
 *   · `"written"` — רק `CATERING_KASHRUT_STATEMENT` (`content/locations.ts`),
 *     הנוסח בכתב עם שם הגוף המכשיר. `null` היום ⇒ דפים במפלס הזה **אינם
 *     נושאים טענת כשרות בכלל**, לא בכותרת ולא בתיאור.
 *   · `"general"` — מתקבל גם «כשר בד״ץ» שנמסר בעל־פה.
 *   · `"none"` — הדף אינו עוסק בכשרות (משפטי, ניהול, 404). באלה טענת
 *     כשרות היא רעש ולא אות.
 *
 * למה בכלל שני מפלסים חיוביים: `business.ts` מתעד פער פתוח — «בד״ץ» אינו
 * גוף אחד, ולקוח שומר כשרות לא מזמין על סמך «בד״ץ» סתמי. בשבעה, בבר
 * מצווה ובחגים הכשרות **היא** ההחלטה, ותוצאת החיפוש היא הטקסט הראשון
 * שהקונה רואה; שם רק נוסח בכתב מדבר.
 */
export type KashrutTier = "written" | "general" | "none";

export type PageMeta = {
  /** מזהה הדף בטבלת spec 01 §2. מזין גם את שם קובץ ה־og. */
  id: string;
  path: string;
  titleHe: string;
  descriptionHe: string;
  robots: RobotsDirective;
  /** `"auto"` ⇒ הכרטיס הטיפוגרפי שנוצר בבנייה, spec 01 §5.6. */
  ogImage: string | "auto";
  /** פירורי לחם. פחות משני פריטים ⇒ `BreadcrumbList` לא נפלט. */
  breadcrumb: Crumb[];
  /**
   * שאילתת המטרה בעברית — הטקסט שנמצא בקדמת הכותרת. `titleHe` נבנה ממנו
   * דרך `composeTitle()`, ולא נכתב ידנית. נשמר ברשומה כדי שהבדיקה תוכל
   * לאמת שהכותרת אכן נבנתה מהמערכת ולא הודבקה.
   */
  topicHe?: string;
  /** מפלס טענת הכשרות של הדף. ברירת מחדל `"none"`. */
  kashrutTier?: KashrutTier;
};

/* ═══════════════════ זהות המותג ═══════════════════ */

/**
 * שם המותג בשכבת ה־head — **נגזר, לא נכתב.**
 *
 * הערך הקודם היה `"מאמא מיה"` (שתי מילים), והוא אינו מופיע באף מקור
 * מאומת: `business.ts` מוסר «קייטרינג מאמאמיה» ו«מאמאמיה טעמים של בית
 * בע״מ» — מילה אחת, בשתי הרשומות. איות שני הוא ישות שנייה בעיני מנוע
 * חיפוש ובעיני מנוע תשובות, וזה בדיוק ההפך ממה שנדרש כדי להיות מצוטט.
 *
 * שימו לב ש־`client/index.html` עדיין נושא `og:site_name` בערך שלישי
 * («מאמא מיה קייטרינג») — הקובץ אינו בבעלות הסבב הזה, והתיקון נרשם בדוח.
 */
export const SITE_NAME_HE = CATERING_NAME;
export const LOCALE = "he_IL";
export const LANG = "he";
/** hreflang מלא. `he` לבדו אינו מבחין בין ישראל לשאר העולם. */
export const HREFLANG = "he-IL";

/**
 * ממדי הכרטיס שנוצר בבנייה, spec 01 §5.6. מוצהרים **רק** ל־`ogImage: "auto"`;
 * לתצלום אמיתי הממדים אינם ידועים בזמן רינדור ולכן אינם מוצהרים.
 */
export const OG_AUTO_WIDTH = 1200;
export const OG_AUTO_HEIGHT = 630;

/**
 * פרופילים ציבוריים של העסק — `sameAs` בגרף.
 *
 * **זה השדה בעל הערך הגבוה ביותר שריק היום.** `sameAs` הוא האופן שבו
 * גוגל וגם מנועי תשובות מקשרים בין הישות שבאתר לבין פרופיל Google
 * Business, פייסבוק ואינסטגרם — כלומר בין הדף לבין הביקורות והתמונות
 * שכבר קיימות מחוץ לאתר. בלעדיו האתר הוא ישות מנותקת.
 *
 * לא לנחש כתובת פרופיל ולא לחפש «כזאת שנראית נכונה»: פרופיל שגוי מקשר
 * את העסק לישות של מישהו אחר.
 *
 * TODO(owner): כתובות מלאות — פרופיל Google Business של הקייטרינג,
 * פייסבוק, אינסטגרם, וכל פרופיל ציבורי נוסף.
 */
export const SOCIAL_PROFILES: readonly string[] = [];

/* ═══════════════════ המשבצות של תג הכותרת ═══════════════════ */

/**
 * שם הגוף המכשיר המלא, כפי שהוא נכתב על התעודה — «בד״ץ בית יוסף»,
 * «בד״ץ העדה החרדית», וכיוצא באלה.
 *
 * זו המשבצת שהקטגוריה שמה בתג הכותרת, ואצלנו היא `null`. היא **אינה
 * מספיקה לבדה**: `kashrutBadgeHe()` דורש גם את הנוסח בכתב
 * (`CATERING_KASHRUT_STATEMENT`), כי שם גוף בלי תעודה בתוקף הוא בדיוק
 * ההצהרה שאין דרך חזרה ממנה.
 *
 * TODO(owner): שם הגוף המכשיר המלא + העתק תעודה בתוקף.
 */
export const KASHRUT_AUTHORITY_HE: string | null = null;

/**
 * אישור פרסום מחיר בתג הכותרת.
 *
 * **המספר עצמו אינו כאן.** הוא נלקח מ־`SLOTS.pricePerPerson` — המחירון
 * היחיד — ומה שיושב כאן הוא רק רשומת האישור: מתי אושר, והאם הוא כולל
 * מע״מ. כך אי אפשר שיתפרסם בכותרת מחיר שאינו במחירון, ואי אפשר
 * שהמחירון והכותרת יגידו שני מספרים.
 *
 * שלושה תנאים מצטברים, ובלי כולם אין עוגן מחיר בשום כותרת:
 *   1. `SLOTS.pricePerPerson` מלא, עם `from` חיובי לפחות לפורמט אחד.
 *   2. `approvedAt` בתבנית `YYYY-MM-DD` — אותו מנעול בדיוק שב־
 *      `components/quote/estimate.tsx`. מחיר בלי תאריך אישור הוא מחיר
 *      שאיש אינו יודע מתי הפסיק להיות נכון.
 *   3. `vatIncluded === true`. מחיר שמוצג לצרכן חייב לכלול מע״מ, ובכותרת
 *      אין מקום לסייג. מחירון לפני מע״מ **אינו** מתפרסם בכותרת, ואין
 *      לחשב ממנו מחיר כולל — שיעור המע״מ משתנה, וחישוב כזה הוא המצאת
 *      מספר.
 *
 * TODO(owner): מחיר פתיחה לסועד כולל מע״מ, ותאריך אישור המחירון.
 */
export type TitlePriceApproval = {
  /** `YYYY-MM-DD`. */
  approvedAt: string;
  vatIncluded: boolean;
};

export const TITLE_PRICE_APPROVAL: TitlePriceApproval | null = null;

/* ═══════════════════ מפתחות אסורים ═══════════════════ */

/**
 * מפתחות שנמחקים בכוח מכל צומת לפני פליטה, spec 01 §7.3.
 * זו רשת ביטחון, לא תחליף לכך שאיש לא יכתוב אותם.
 */
const FORBIDDEN_KEYS = new Set([
  "priceRange",
  "aggregateRating",
  "review",
  "reviews",
  "ratingValue",
  "hasCertification",
]);

/* ═══════════════════ origin ו־URL ═══════════════════ */

/**
 * ה־origin שממנו האתר מוגש. **אינו עובדה עסקית** — הוא היכן שהדף יושב,
 * ולכן מותר לגזור אותו מהסביבה. אם אינו ידוע (SSR בלי משתנה סביבה),
 * מוחזרת מחרוזת ריקה ו־`absoluteUrl` מחזיר נתיב יחסי: `<link rel="canonical">`
 * יחסי נפתר תקין מול הדף עצמו, ועדיף על דומיין מומצא.
 */
export function siteOrigin(): string {
  const fromEnv = (import.meta as unknown as { env?: Record<string, string | undefined> })
    .env?.VITE_SITE_ORIGIN;
  if (typeof fromEnv === "string" && fromEnv.trim() !== "") {
    return fromEnv.trim().replace(/\/+$/, "");
  }
  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin.replace(/\/+$/, "");
  }
  return "";
}

export function absoluteUrl(path: string, origin: string = siteOrigin()): string {
  if (/^https?:\/\//i.test(path)) return path;
  const clean = path.startsWith("/") ? path : `/${path}`;
  return origin ? `${origin}${clean}` : clean;
}

/** נתיב תמונת ה־og לדף. `"auto"` ⇒ הכרטיס שנוצר בבנייה לפי מזהה הדף. */
export function ogImagePath(meta: PageMeta): string {
  return meta.ogImage === "auto" ? `/og/${meta.id}.jpg` : meta.ogImage;
}

/**
 * הקנוני של הדף. **תמיד נגזר מ־`meta.path`** ולעולם לא מ־`window.location`
 * ‏(T-4): פרמטרי קמפיין, `?ref=` ו־`utm_*` אינם נכנסים לקנוני, אחרת כל
 * כניסה ממומנת מייצרת כתובת קנונית נוספת לאותו דף.
 */
export const canonicalUrl = (meta: PageMeta, origin = siteOrigin()): string =>
  absoluteUrl(meta.path, origin);

/**
 * ‏`<link rel="alternate">` לדף.
 *
 * האתר חד־לשוני. `hreflang` בגרסה יחידה עדיין נכון ועדיין שימושי: הוא
 * מצהיר במפורש שהדף מיועד לדובר עברית בישראל, וה־`x-default` אומר שאין
 * גרסה אחרת שאליה יש להפנות קורא אחר. שתי השורות מצביעות על אותה כתובת,
 * וזו הצורה התקנית לאתר שאין לו תרגום.
 *
 * ‏**`components/seo/head.tsx` אינו פולט את אלה היום** — הקובץ אינו
 * בבעלות הסבב הזה, והשינוי הנדרש רשום בדוח.
 */
export type AlternateLink = { hreflang: string; href: string };

export function alternateLinks(meta: PageMeta, origin = siteOrigin()): AlternateLink[] {
  const href = canonicalUrl(meta, origin);
  return [
    { hreflang: HREFLANG, href },
    { hreflang: "x-default", href },
  ];
}

/**
 * ─────────────────────────────────────────────────────────────────────
 *  ‏`headTagsFor` — כל תגי הראש של דף, כנתונים
 * ─────────────────────────────────────────────────────────────────────
 * מחזירה תיאור **נתוני** של תגי ה־head, בלי לגעת ב־DOM ובלי React.
 *
 * למה זה כאן: אותם ערכים בדיוק חייבים להיפלט בשני מקומות — `components/seo/head.tsx`
 * בדפדפן, ו**הזרקה מהשרת** (spec 01 task 0.5), כי זחלני התצוגה המקדימה של
 * וואטסאפ ופייסבוק אינם מריצים JavaScript וקישור שנשלח בשיחה יופיע כ־URL
 * אפור בלעדיה. שני מימושים שכותבים את אותה רשימה הם שתי רשימות שייפרדו,
 * ואז הכרטיס בוואטסאפ יגיד דבר אחד והדף דבר אחר.
 *
 * ‏`head.tsx` אינו צורך את זה היום (הוא בונה רשימה משלו, ובלי `hreflang`).
 * המעבר הוא לולאה אחת, והוא רשום בדוח.
 */
export type HeadTag =
  | { kind: "title"; content: string }
  | { kind: "meta"; attr: "name" | "property"; key: string; content: string }
  | { kind: "link"; rel: string; href: string; hreflang?: string };

export function headTagsFor(
  meta: PageMeta,
  opts: { robots?: RobotsDirective; ogImage?: string; origin?: string } = {},
): HeadTag[] {
  const origin = opts.origin ?? siteOrigin();
  const canonical = canonicalUrl(meta, origin);
  const image = absoluteUrl(opts.ogImage ?? ogImagePath(meta), origin);
  const isAutoCard = !opts.ogImage && meta.ogImage === "auto";
  const robots = opts.robots ?? meta.robots;

  const tags: HeadTag[] = [
    { kind: "title", content: meta.titleHe },
    { kind: "meta", attr: "name", key: "description", content: meta.descriptionHe },
    { kind: "meta", attr: "name", key: "robots", content: robots },
    { kind: "link", rel: "canonical", href: canonical },
    ...alternateLinks(meta, origin).map(
      (a): HeadTag => ({ kind: "link", rel: "alternate", href: a.href, hreflang: a.hreflang }),
    ),
    { kind: "meta", attr: "property", key: "og:type", content: "website" },
    { kind: "meta", attr: "property", key: "og:locale", content: LOCALE },
    { kind: "meta", attr: "property", key: "og:site_name", content: SITE_NAME_HE },
    { kind: "meta", attr: "property", key: "og:title", content: meta.titleHe },
    { kind: "meta", attr: "property", key: "og:description", content: meta.descriptionHe },
    { kind: "meta", attr: "property", key: "og:url", content: canonical },
    { kind: "meta", attr: "property", key: "og:image", content: image },
    { kind: "meta", attr: "property", key: "og:image:alt", content: meta.titleHe },
    { kind: "meta", attr: "name", key: "twitter:card", content: "summary_large_image" },
    { kind: "meta", attr: "name", key: "twitter:title", content: meta.titleHe },
    { kind: "meta", attr: "name", key: "twitter:description", content: meta.descriptionHe },
    { kind: "meta", attr: "name", key: "twitter:image", content: image },
  ];

  /* ממדים מוצהרים רק לכרטיס שנוצר בבנייה, שממדיו ידועים (spec 01 §5.6).
     לתצלום אמיתי הם אינם ידועים כאן, ולכן אינם מוצהרים. */
  if (isAutoCard) {
    tags.push(
      { kind: "meta", attr: "property", key: "og:image:width", content: String(OG_AUTO_WIDTH) },
      { kind: "meta", attr: "property", key: "og:image:height", content: String(OG_AUTO_HEIGHT) },
    );
  }

  return tags;
}

/* ═══════════════════ compact — הכלל שמחזיק את כל השאר ═══════════════════ */

/** טיפוסים שכל תוכנם הוא הטיפוס עצמו, ולכן שורדים גם בלי שדות. */
const TYPE_ONLY_NODES = new Set(["BusinessAudience"]);

const isPlainObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

/**
 * מוחק רקורסיבית כל מפתח שערכו null / undefined / מחרוזת ריקה (או רווחים
 * בלבד) / מערך ריק / אובייקט שהתרוקן, וכן כל מפתח מ־`FORBIDDEN_KEYS`.
 *
 * `false` ו־`0` נשמרים: שניהם ערכים אמיתיים, ומחיקתם הייתה הופכת
 * `"isAccessibleForFree": false` להיעדר טענה.
 *
 * מוחזר `null` כשכל האובייקט התרוקן — כדי שהקורא יוכל להשמיט את הצומת
 * כולו במקום לפלוט `{}`.
 */
export function compact<T extends JsonLdNode>(node: T): T | null {
  const walk = (value: unknown): unknown => {
    if (value === null || value === undefined) return undefined;
    if (typeof value === "string") {
      const trimmed = value.trim();
      return trimmed === "" ? undefined : trimmed;
    }
    if (typeof value === "number") return Number.isFinite(value) ? value : undefined;
    if (typeof value === "boolean") return value;
    if (Array.isArray(value)) {
      const items = value.map(walk).filter((v) => v !== undefined);
      return items.length > 0 ? items : undefined;
    }
    if (isPlainObject(value)) {
      const out: Record<string, unknown> = {};
      for (const [key, raw] of Object.entries(value)) {
        if (FORBIDDEN_KEYS.has(key)) continue;
        const cleaned = walk(raw);
        if (cleaned !== undefined) out[key] = cleaned;
      }
      const keys = Object.keys(out);
      if (keys.length === 0) return undefined;
      // צומת שנותר בו `@type` בלבד הוא הצהרה ריקה — `{"@type":"PostalAddress"}`
      // בלי אף שדה מצהיר שיש כתובת ולא אומר אותה. משמיטים.
      // שני חריגים: הפניה ב־`@id` (קשת בגרף, זה כל תוכנה), וטיפוסים
      // שכל משמעותם היא הטיפוס עצמו.
      const hasRef = Object.prototype.hasOwnProperty.call(out, "@id");
      const declarative = keys.filter((k) => k !== "@type" && k !== "@context");
      const typeOnlyAllowed =
        typeof out["@type"] === "string" && TYPE_ONLY_NODES.has(out["@type"] as string);
      if (!hasRef && declarative.length === 0 && !typeOnlyAllowed) return undefined;
      return out;
    }
    return undefined;
  };

  const result = walk(node);
  return result === undefined ? null : (result as T);
}

/**
 * בונה `@graph` מצמתים, אחרי `compact`. מחזיר `null` כשלא נותר צומת.
 *
 * ─────────────────────────────────────────────────────────────────────
 *  צמתי הזהות נזרעים כאן, ולא בדף
 * ─────────────────────────────────────────────────────────────────────
 * ‏`buildWebPage` פולט `isPartOf: {"@id": "…/#website"}` ו־`about: {"@id":
 * ‎"…/#org"}`, ו־`buildService` פולט `provider: {"@id": "…/#org"}`. הפניית
 * ‎`@id` נפתרת **רק בתוך הגרף של אותו דף** — צרכן הגרף אינו מצרף דפים.
 * עד לתיקון הזה `Organization` ו־`WebSite` נבנו ב־`pages/home.tsx` בלבד,
 * ולכן בשנים־עשר הדפים האינדקסביליים האחרים כל ההפניות האלה היו תלויות
 * באוויר: דף עם `about` שאינו נפתר הוא דף בלי ישות, וזה בדיוק מה שקושר
 * דף לעסק אצל מנוע חיפוש ואצל מנוע תשובות.
 *
 * הזריעה יושבת כאן ולא ב־`Head` ולא בדף, משום שזו נקודת ההרכבה היחידה של
 * הגרף — כלומר המקום היחיד שבו דף **אינו יכול לשכוח**. דף שבונה את הצמתים
 * בעצמו (‏`home.tsx`) גובר: הזריעה מוסיפה רק `@id` שאינו כבר בגרף.
 *
 * גרף ריק נשאר ריק. דף שלא ביקש JSON-LD אינו מקבל ישות בדלת האחורית —
 * ‏`Head` מסתמך על כך כדי לא לגעת בתסריט שכבר בדף.
 */
export function buildGraph(nodes: Array<JsonLdNode | null | undefined>): JsonLdNode | null {
  const clean = nodes
    .filter((n): n is JsonLdNode => !!n)
    .map((n) => compact(n))
    .filter((n): n is JsonLdNode => !!n);
  if (clean.length === 0) return null;

  const seen = new Set<string>();
  const deduped: JsonLdNode[] = [];
  for (const node of clean) {
    const id = typeof node["@id"] === "string" ? (node["@id"] as string) : null;
    if (id !== null) {
      if (seen.has(id)) continue;
      seen.add(id);
    }
    deduped.push(node);
  }

  const identity = [buildOrganization(), buildWebSite({})]
    .map((n) => compact(n))
    .filter((n): n is JsonLdNode => !!n)
    .filter((n) => !seen.has(n["@id"] as string));

  return { "@context": "https://schema.org", "@graph": [...identity, ...deduped] };
}

/**
 * סריאליזציה בטוחה להזרקה בתוך `<script type="application/ld+json">`.
 * `<` בורח ל־`<` כדי ש־`</script>` בתוך מחרוזת לא יסגור את התגית.
 */
export function serializeJsonLd(node: JsonLdNode | null): string | null {
  if (!node) return null;
  return JSON.stringify(node).replace(/</g, "\\u003c");
}

/* ═══════════════════ אוצר המילים של הטענות ═══════════════════ */

/**
 * הטענה היחידה על מוצא האוכל שמותר לכתוב, בלשון יחיד.
 * מקור: הלקוח, 30 ביולי 2026 (`business.ts`,
 * `COOKED_IN_ACTIVE_RESTAURANT_KITCHEN`). לא «שלושה מטבחים», לא עיר.
 */
export const ORIGIN_HE = "מבושל במטבח של מסעדה איטלקית פעילה";

/** אותה טענה בנטייה שמשתלבת אחרי שם עצם. */
export const FROM_ORIGIN_HE = "מהמטבח של מסעדה איטלקית פעילה";

/**
 * «כשר X» כפי שנמסר בעל־פה, מ־`SLOTS.kashrutByBranch`. מוחזר **רק** אם
 * כל הערכים זהים: ערכים חלוקים אינם משפט אחד, והאתר לא ינחש איזה מהם.
 * לעולם לא נכתב כמחרוזת קשיחה — LAW 1.
 */
function generalKashrutHe(): string | null {
  const byBranch = SLOTS.kashrutByBranch;
  if (!filled(byBranch)) return null;
  const values = BRANCHES.map((b) => byBranch[b.id]).filter((v): v is string => filled(v));
  if (values.length !== BRANCHES.length) return null;
  return values.every((v) => v === values[0]) ? values[0] : null;
}

/**
 * טענת הכשרות **המלאה**, לתיאור ולגוף הדף. `null` ⇒ הדף אינו נושא טענת
 * כשרות בכלל, בשום ניסוח.
 *
 * כשהנוסח בכתב יימסר — כל התיאורים מקבלים אותו אוטומטית.
 */
export function kashrutClauseHe(tier: KashrutTier): string | null {
  if (tier === "none") return null;
  const written = kashrutStatement();
  if (filled(written)) return written;
  return tier === "general" ? generalKashrutHe() : null;
}

/** מחבר משפט תיאור לסיומת הכשרות, אם יש כזאת. */
export function withKashrut(sentenceHe: string, tier: KashrutTier): string {
  const clause = kashrutClauseHe(tier);
  return clause ? `${sentenceHe} ${clause}.` : sentenceHe;
}

/* ═══════════════════ מערכת הכותרות ═══════════════════ */

/**
 * תקציב תווים לתג כותרת. גוגל חותך לפי רוחב בפיקסלים ולא לפי תווים,
 * ובעברית ‎60 תווים הם הסף הבטוח. חריגה אינה שגיאה חוסמת — היא ממצא
 * ב־`auditPageMeta()`, כי כותרת חתוכה מאבדת בדיוק את הזנב שבו יושב שם
 * המותג.
 */
export const TITLE_MAX = 60;

/** תיאור: הטווח שגוגל מציג בלי לחתוך ובלי לכתוב אחד משלו. */
export const DESCRIPTION_MIN = 70;
export const DESCRIPTION_MAX = 155;

/** תג כותרת ארוך מזה נחתך; באדג׳ ארוך מזה גונב את כל הקדמה. */
const KASHRUT_BADGE_MAX = 20;

/**
 * הבאדג׳ הקצר של הכשרות, לתג הכותרת בלבד.
 *
 * סדר העדיפות, וכל שלב מותנה בקודמו:
 *   1. `כשר {גוף מכשיר נקוב}` — רק כשגם השם וגם הנוסח בכתב נמסרו. זו
 *      הצורה שהקטגוריה משתמשת בה, וזו הצורה שמסננת קונה שומר כשרות
 *      לפני הקליק.
 *   2. הנוסח בכתב עצמו, אם הוא קצר דיו לכותרת.
 *   3. «כשר בד״ץ» הכללי — רק במפלס `general`.
 *
 * שימו לב לשלב 3 מול שלב 1: **הכללי אינו תחליף לנקוב.** הוא מה שיש
 * היום, והוא נכון; הנקוב הוא מה שממיר.
 */
export function kashrutBadgeHe(tier: KashrutTier): string | null {
  if (tier === "none") return null;
  const written = kashrutStatement();

  if (filled(written)) {
    if (filled(KASHRUT_AUTHORITY_HE)) {
      const named = `כשר ${KASHRUT_AUTHORITY_HE}`;
      if (named.length <= KASHRUT_BADGE_MAX) return named;
    }
    if (written.length <= KASHRUT_BADGE_MAX) return written;
  }

  const general = tier === "general" || filled(written) ? generalKashrutHe() : null;
  return general && general.length <= KASHRUT_BADGE_MAX ? general : null;
}

/**
 * המחיר הנמוך ביותר במחירון המאושר, או `null`.
 * ראו `TITLE_PRICE_APPROVAL` לשלושת התנאים.
 */
function approvedOpeningPrice(): number | null {
  const approval: TitlePriceApproval | null = TITLE_PRICE_APPROVAL;
  if (approval === null) return null;
  if (approval.vatIncluded !== true) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(approval.approvedAt)) return null;

  const table = SLOTS.pricePerPerson;
  if (!filled(table)) return null;

  const lows = Object.values(table)
    .map((range) => range?.from)
    .filter((n): n is number => typeof n === "number" && Number.isFinite(n) && n > 0);
  if (lows.length === 0) return null;

  return Math.min(...lows);
}

/**
 * עוגן המחיר לתג הכותרת. `null` היום ולתמיד, עד שהמחירון והאישור יימסרו.
 *
 * הניסוח: «החל מ־00 ₪ לסועד». בלי מקף בין שני רצפי ספרות (הוא מתהפך
 * ב־RTL), ובלי טווח — טווח בכותרת נקרא כמחיר הגבוה.
 */
export function priceAnchorHe(): string | null {
  const from = approvedOpeningPrice();
  return from === null ? null : `החל מ־${from} ₪ לסועד`;
}

export type TitleParts = {
  /** שאילתת המטרה בעברית. **בקדמה, תמיד.** */
  topicHe: string;
  /** מפלס הכשרות של הדף. ברירת מחדל `"none"`. */
  kashrut?: KashrutTier;
  /** `null` ⇒ בלי זנב מותג (ממשק ניהול בלבד). */
  brandHe?: string | null;
  /** תקציב תווים. חריגה אינה חוסמת — ראו `TITLE_MAX`. */
  maxLength?: number;
};

/**
 * בונה תג כותרת: `נושא · מודיפייר · מודיפייר | מותג`.
 *
 * **הקדמה שייכת לשאילתה.** שם המותג בקדמה עולה רק למי שכבר יודע את השם;
 * אתר שכל תפקידו להביא לידים מקמפיין ומחיפוש אינו יכול להרשות זאת, ולכן
 * המותג יושב בזנב — שם הוא עדיין מזוהה, ואינו גוזל את הרוחב שהמשתמש סורק.
 *
 * המודיפיירים נכנסים לפי ערך: **עוגן מחיר קודם לבאדג׳ הכשרות**, כי הוא
 * זה שמסנן לפי תקציב ומעלה CTR בהפרש הגדול יותר. מודיפייר שאין לו מקום
 * בתקציב פשוט אינו נכנס — הכותרת אינה נחתכת באמצע מילה.
 *
 * שתי המשבצות `null` היום. הפונקציה מחזירה בדיוק «נושא | מותג» + באדג׳
 * הכשרות הכללי, ומתמלאת מעצמה כשהעובדות יימסרו.
 */
export function composeTitle(parts: TitleParts): string {
  const max = parts.maxLength ?? TITLE_MAX;
  const brand = parts.brandHe === null ? null : (parts.brandHe ?? SITE_NAME_HE);
  const tail = brand ? ` | ${brand}` : "";

  const modifiers = [priceAnchorHe(), kashrutBadgeHe(parts.kashrut ?? "none")].filter(
    (m): m is string => filled(m),
  );

  let head = parts.topicHe.trim();
  for (const modifier of modifiers) {
    const candidate = `${head} · ${modifier}`;
    if (candidate.length + tail.length <= max) head = candidate;
  }

  return `${head}${tail}`;
}

/* ═══════════════════ מזהי הצמתים בגרף ═══════════════════ */

export const orgId = (origin = siteOrigin()) => `${absoluteUrl("/", origin)}#org`;
export const websiteId = (origin = siteOrigin()) => `${absoluteUrl("/", origin)}#website`;
export const pageId = (path: string, origin = siteOrigin()) =>
  `${absoluteUrl(path, origin)}#webpage`;
export const serviceId = (path: string, origin = siteOrigin()) =>
  `${absoluteUrl(path, origin)}#service`;
export const faqId = (path: string, origin = siteOrigin()) =>
  `${absoluteUrl(path, origin)}#faq`;
export const breadcrumbId = (path: string, origin = siteOrigin()) =>
  `${absoluteUrl(path, origin)}#breadcrumb`;

const ref = (id: string): JsonLdNode => ({ "@id": id });

/* ═══════════════════ בוני הצמתים ═══════════════════ */

/**
 * Organization — ישות המותג, ושורש הגרף. spec 01 §7.1.
 *
 * כל שדה שיש לו מקור מאומת נשאב מ־`content/business.ts` **כברירת מחדל**,
 * ולא ממתין לכך שהעמוד יעביר אותו. הגרסה הקודמת קיבלה רק `telephone`
 * מדף הבית, ולכן השם המשפטי וכתובת הדוא״ל — שתי עובדות מאומתות — לא
 * נפלטו לגרף באף עמוד באתר.
 *
 * ‏`sameAs` ריק היום. ראו `SOCIAL_PROFILES` — זה הפער בעל הערך הגבוה
 * ביותר בקובץ הזה.
 */
export function buildOrganization(
  opts: {
    telephone?: Maybe<string>;
    legalName?: Maybe<string>;
    taxId?: Maybe<string>;
    email?: Maybe<string>;
    logoPath?: Maybe<string>;
    sameAs?: Maybe<readonly string[]>;
    origin?: string;
  } = {},
): JsonLdNode {
  const origin = opts.origin ?? siteOrigin();
  const telephone = opts.telephone ?? PHONE.tel;
  const email = opts.email ?? SLOTS.privacyEmail;
  const sameAs = opts.sameAs ?? SOCIAL_PROFILES;

  return {
    "@type": "Organization",
    "@id": orgId(origin),
    name: SITE_NAME_HE,
    legalName: opts.legalName ?? SLOTS.legalName,
    taxID: opts.taxId ?? SLOTS.companyId,
    url: absoluteUrl("/", origin),
    logo: opts.logoPath ? absoluteUrl(opts.logoPath, origin) : null,
    telephone,
    email,
    knowsLanguage: LANG,
    /* שנת הקמה נפלטת רק אם תועדה. «בערך» אינו תאריך. */
    foundingDate: filled(SLOTS.foundedYear) ? String(SLOTS.foundedYear) : null,
    sameAs: sameAs.length > 0 ? [...sameAs] : null,
    /* שני ערוצי הפנייה שקיימים בפועל. וואטסאפ נבנה מ־`PHONE.wa` ובלי
       הודעה ממולאת מראש: `waLink()` נועד לקישור שאדם לוחץ עליו, וטקסט
       שיווקי בתוך נתון מובנה הוא רעש. */
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "sales",
        telephone,
        email,
        availableLanguage: LANG,
      },
      {
        "@type": "ContactPoint",
        contactType: "sales",
        name: "וואטסאפ",
        url: `https://wa.me/${PHONE.wa}`,
        availableLanguage: LANG,
      },
    ],
  };
}

/**
 * WebSite. spec 01 §7.1.
 *
 * **`SearchAction` אינו נפלט, ואין זו השמטה בשגגה.** שתי סיבות בלתי
 * תלויות, וכל אחת מספיקה:
 *   1. **אין באתר חיפוש.** `shared/routes.ts` אינו מכיר מסלול `/search`,
 *      ו־`potentialAction` שמצביע על כתובת שמחזירה 404 הוא הצהרת יכולת
 *      שאין מאחוריה כלום — בדיוק אותו סוג טענה שהקובץ הזה מונע בכל
 *      מקום אחר.
 *   2. גוגל הוציא משימוש את תוצאת ה־sitelinks searchbox, כלומר גם אילו
 *      היה חיפוש — התועלת היא זיהוי ישות בלבד.
 *
 * הפרמטר קיים כדי שהיום שבו ייבנה חיפוש פנימי יהיה שינוי של קריאה אחת.
 */
export function buildWebSite(
  opts: {
    /** תבנית עם `{search_term_string}`, למשל `/search?q={search_term_string}`. */
    searchUrlTemplate?: Maybe<string>;
    origin?: string;
  } = {},
): JsonLdNode {
  const origin = opts.origin ?? siteOrigin();
  const template = filled(opts.searchUrlTemplate) ? opts.searchUrlTemplate : null;

  return {
    "@type": "WebSite",
    "@id": websiteId(origin),
    name: SITE_NAME_HE,
    url: absoluteUrl("/", origin),
    inLanguage: LANG,
    publisher: ref(orgId(origin)),
    potentialAction: template
      ? {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: absoluteUrl(template, origin),
          },
          "query-input": "required name=search_term_string",
        }
      : null,
  };
}

/**
 * WebPage / CollectionPage / ContactPage — טיפוס אחד, שלושה שמות.
 *
 * הקשת אל `BreadcrumbList` נבנית **מעצמה** כשלרשומה יש שרשרת אמיתית
 * שמסתיימת בדף עצמו. כך אין דף שפולט פירור לחם בלי לקשור אותו, ואין
 * עמוד שצריך לזכור להעביר מזהה.
 */
export function buildWebPage(
  meta: PageMeta,
  opts: {
    type?: "WebPage" | "CollectionPage" | "ContactPage";
    /** מזהה הישות המרכזית של הדף, למשל `serviceId(meta.path)`. */
    mainEntityId?: Maybe<string>;
    origin?: string;
  } = {},
): JsonLdNode {
  const origin = opts.origin ?? siteOrigin();
  const trail = meta.breadcrumb ?? [];
  const last = trail[trail.length - 1];
  const hasCrumbs = trail.length >= 2 && !!last && last.path === meta.path;
  const mainEntityId = opts.mainEntityId ?? null;

  return {
    "@type": opts.type ?? "WebPage",
    "@id": pageId(meta.path, origin),
    url: absoluteUrl(meta.path, origin),
    name: meta.titleHe,
    description: meta.descriptionHe,
    inLanguage: LANG,
    isPartOf: ref(websiteId(origin)),
    about: ref(orgId(origin)),
    breadcrumb: hasCrumbs ? ref(breadcrumbId(meta.path, origin)) : null,
    mainEntity: mainEntityId ? ref(mainEntityId) : null,
  };
}

/**
 * Service — הצעת הקייטרינג. spec 01 §7.2.
 * **לצפיות הלקוח, בכנות:** ל־`Service` אין תוצאה עשירה מקבילה בגוגל.
 * הוא נפלט לצורך זיהוי ישות — כלומר בשביל מנועי תשובות, לא בשביל קישוט
 * תוצאה.
 *
 * `areaServed` נשאב מ־`cateringServiceArea()` ב־`content/locations.ts`
 * ‏(ריק היום) ולא נגזר ממיקומי המסעדות. אזור חלוקה שנגזר ממפה הוא בדיוק
 * האופן שבו נכנסו לאתר הקודם ~14 ערי שירות מומצאות.
 *
 * `offers` **אינו כאן בשום צורה.** אין מחיר מאושר ⇒ אין הצעה מובנית.
 */
export function buildService(opts: {
  path: string;
  nameHe: string;
  descriptionHe?: Maybe<string>;
  /** ערים שנמסרו על ידי הלקוח. ברירת מחדל: המשבצת ב־locations.ts. */
  areaServedHe?: Maybe<readonly string[]>;
  /** `"business"` ⇒ `BusinessAudience`. */
  audience?: Maybe<"business" | "consumer">;
  origin?: string;
}): JsonLdNode {
  const origin = opts.origin ?? siteOrigin();
  const cities = opts.areaServedHe ?? cateringServiceCities();

  return {
    "@type": "Service",
    "@id": serviceId(opts.path, origin),
    serviceType: "Catering",
    name: opts.nameHe,
    description: opts.descriptionHe ?? null,
    url: absoluteUrl(opts.path, origin),
    provider: ref(orgId(origin)),
    areaServed: cities.length > 0 ? cities.map((c) => ({ "@type": "City", name: c })) : null,
    audience:
      opts.audience === "business"
        ? { "@type": "BusinessAudience" }
        : opts.audience === "consumer"
          ? { "@type": "Audience", audienceType: "Consumer" }
          : null,
    /* הערוץ שבו מתחילים בפועל: טופס ההצעה, הטלפון והוואטסאפ. שלושתם
       קיימים, ולכן שלושתם מוצהרים. */
    availableChannel: {
      "@type": "ServiceChannel",
      serviceUrl: absoluteUrl("/quote", origin),
      servicePhone: {
        "@type": "ContactPoint",
        contactType: "sales",
        telephone: PHONE.tel,
        availableLanguage: LANG,
      },
    },
    termsOfService: absoluteUrl("/terms", origin),
    inLanguage: LANG,
  };
}

/**
 * BreadcrumbList. פחות משני פריטים ⇒ `null` (שרשרת של פריט אחד אינה
 * פירור לחם, וגוגל מתעלם ממנה ממילא).
 *
 * ה־`@id` נגזר מהפריט האחרון — שהוא הדף עצמו — כדי ש־`buildWebPage`
 * יוכל להצביע עליו בלי שהעמוד יתווך.
 */
export function buildBreadcrumbList(
  trail: Crumb[],
  opts: { origin?: string } = {},
): JsonLdNode | null {
  const origin = opts.origin ?? siteOrigin();
  const items = trail.filter((c) => c.labelHe.trim() !== "" && c.path.trim() !== "");
  if (items.length < 2) return null;
  const self = items[items.length - 1];
  return {
    "@type": "BreadcrumbList",
    "@id": breadcrumbId(self.path, origin),
    itemListElement: items.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.labelHe,
      item: absoluteUrl(c.path, origin),
    })),
  };
}

/**
 * FAQPage — **רק שאלות שיש להן תשובה מלאה**. spec 01 §7.2.
 * שאלה בלי תשובה אינה נפלטת, וכשאין אף תשובה מלאה הצומת כולו `null`.
 * דף שתשובותיו טרם נמסרו פשוט אינו מסמן FAQ. הוא לא ממציא תשובה.
 *
 * כשמועבר `path`, הצומת מקבל `@id` ונקשר ל־`WebPage` של אותה כתובת.
 * בלעדיו נפלט צומת חופשי — תקף, אבל מנותק מהגרף. **להעביר `path` תמיד.**
 */
export function buildFaqPage(
  items: Array<{ questionHe: string; answerHe: Maybe<string> }>,
  opts: { path?: string; origin?: string } = {},
): JsonLdNode | null {
  const origin = opts.origin ?? siteOrigin();
  const answered = items.filter(
    (i) =>
      typeof i.answerHe === "string" &&
      i.answerHe.trim() !== "" &&
      i.questionHe.trim() !== "",
  );
  if (answered.length === 0) return null;

  const path = opts.path;
  return {
    "@type": "FAQPage",
    "@id": path ? faqId(path, origin) : null,
    inLanguage: LANG,
    isPartOf: path ? ref(pageId(path, origin)) : null,
    mainEntity: answered.map((i) => ({
      "@type": "Question",
      name: i.questionHe,
      acceptedAnswer: { "@type": "Answer", text: (i.answerHe as string).trim() },
    })),
  };
}

/**
 * ItemList — מפרק שמונה דפים אחרים.
 *
 * זה הצומת שהופך «דף עם קישורים» ל«מפרק» בעיני מנוע תשובות: הוא אומר
 * במפורש אילו דפים מרכיבים את הקטגוריה ובאיזה סדר. ‏`/catering` הוא
 * המועמד הראשון, ודף הבית אחריו.
 */
export function buildItemList(opts: {
  path: string;
  nameHe: string;
  items: ReadonlyArray<{ path: string; nameHe: string }>;
  origin?: string;
}): JsonLdNode | null {
  const origin = opts.origin ?? siteOrigin();
  const items = opts.items.filter((i) => i.path.trim() !== "" && i.nameHe.trim() !== "");
  if (items.length === 0) return null;
  return {
    "@type": "ItemList",
    "@id": `${absoluteUrl(opts.path, origin)}#list`,
    name: opts.nameHe,
    numberOfItems: items.length,
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.nameHe,
      url: absoluteUrl(item.path, origin),
    })),
  };
}

/**
 * Menu → hasMenuSection → MenuItem. spec 01 P-02.
 * `offers` נפלט **רק** כשיש מחיר חתום על ידי הלקוח. אין מחיר ⇒ אין
 * `offers` — לא `0`, לא טווח, לא "החל מ־".
 */
export type MenuItemSeo = {
  nameHe: string;
  descriptionHe?: Maybe<string>;
  price?: Maybe<{ amount: number; currency?: string }>;
};

export function buildMenu(
  sections: Array<{ nameHe: string; items: MenuItemSeo[] }>,
  opts: { origin?: string } = {},
): JsonLdNode | null {
  const origin = opts.origin ?? siteOrigin();
  const filledSections = sections.filter((s) => s.items.length > 0);
  if (filledSections.length === 0) return null;
  return {
    "@type": "Menu",
    "@id": `${absoluteUrl("/menus", origin)}#menu`,
    url: absoluteUrl("/menus", origin),
    inLanguage: LANG,
    hasMenuSection: filledSections.map((section) => ({
      "@type": "MenuSection",
      name: section.nameHe,
      hasMenuItem: section.items.map((item) => ({
        "@type": "MenuItem",
        name: item.nameHe,
        description: item.descriptionHe ?? null,
        offers: item.price
          ? {
              "@type": "Offer",
              price: item.price.amount,
              priceCurrency: item.price.currency ?? "ILS",
            }
          : null,
      })),
    })),
  };
}

/* ═══════════════════ זמן — INV-9 ═══════════════════ */

/**
 * השנה הנוכחית ב־Asia/Jerusalem. שעון המכשיר אינו נאמן (INV-9), ותבנית
 * הכותרת של דף החגים דורשת שנה.
 */
export function currentYearInJerusalem(now: Date = new Date()): number {
  const year = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jerusalem",
    year: "numeric",
  }).format(now);
  return Number(year);
}

/* ═══════════════════ טבלת המטא לכל נתיב ═══════════════════ */

/**
 * ‏T-3: אין שתי רשומות שחולקות `titleHe` או `descriptionHe`.
 * ‏T-4: הקנוני של כל נתיב מפנה לעצמו — הוא נגזר מ־`path`, תמיד.
 *
 * **כאן יושבים רק הנתיבים שאין להם רשומה ב־`lib/page-meta-extra.ts`:**
 * דף הבית, `/quote`, וששת דפי השירות. כל נתיב שיווקי אחר יושב שם,
 * ושתי טבלאות לאותו נתיב הן שתי טבלאות שייפרדו.
 *
 * ‏`branchMeta()` — שלוש רשומות לדפי הסניף — נמחקה בסבב קודם: היא הצהירה
 * שהקייטרינג יוצא מכל אחת משלוש הערים, והמיצוב מוחק את הטענה הזאת.
 */

const HOME: Crumb = { labelHe: "ראשי", path: "/" };

const STATIC_META: PageMeta[] = [
  {
    id: "P-01",
    path: "/",
    /*
     * הנושא: «קייטרינג איטלקי לאירועים». הכותרת שהייתה כאן פתחה בשם
     * המותג ונשאה את המחרוזת «כשר בד״ץ» כטקסט קשיח — כלומר בזבזה את
     * הקדמה על מי שכבר מכיר אותנו, וגם הייתה שורדת התרוקנות של המשבצת.
     * שני הפגמים נסגרים באותה שורה.
     */
    topicHe: "קייטרינג איטלקי לאירועים",
    kashrutTier: "general",
    titleHe: composeTitle({ topicHe: "קייטרינג איטלקי לאירועים", kashrut: "general" }),
    descriptionHe: withKashrut(
      `התפריט של ${CATERING_NAME}, אצלכם באירוע. ${ORIGIN_HE}.`,
      "general",
    ),
    robots: "index,follow",
    ogImage: "auto",
    breadcrumb: [HOME],
  },
  {
    id: "P-17",
    path: "/quote",
    /*
     * «הצעת מחיר» הוא המונח שמחפשים, והוא אינו טענת מחיר: הדף מבקש
     * פרטים ואדם חוזר עם הצעה. «ארבע שאלות» מתאר את הבנאי עצמו
     * (`components/quote/quote-builder.tsx`) ולא יכולת תפעולית.
     */
    topicHe: "הצעת מחיר לקייטרינג בארבע שאלות",
    kashrutTier: "general",
    titleHe: composeTitle({
      topicHe: "הצעת מחיר לקייטרינג בארבע שאלות",
      kashrut: "general",
    }),
    descriptionHe:
      "בונים את התפריט שלכם בארבע שאלות, ומדברים עם מטבח. בלי שדה תקציב ובלי טופס ארוך.",
    robots: "index,follow",
    ogImage: "auto",
    breadcrumb: [HOME, { labelHe: "בקשת הצעה", path: "/quote" }],
  },
  {
    id: "P-18",
    path: "/thanks",
    topicHe: "אישור פנייה",
    kashrutTier: "none",
    titleHe: composeTitle({ topicHe: "אישור פנייה" }),
    descriptionHe: "הפנייה נקלטה. כאן הסיכום ומספר הפנייה שלכם.",
    robots: "noindex,follow",
    ogImage: "auto",
    breadcrumb: [HOME],
  },
  {
    id: "P-21",
    path: "/privacy",
    topicHe: "מדיניות פרטיות",
    kashrutTier: "none",
    titleHe: composeTitle({ topicHe: "מדיניות פרטיות" }),
    descriptionHe:
      "אילו פרטים נאספים בטופס הפנייה, מה נאסף טכנית, למה זה משמש, מי רואה את זה, ואיך מבקשים לעיין או למחוק.",
    robots: "index,follow",
    ogImage: "auto",
    breadcrumb: [HOME, { labelHe: "מדיניות פרטיות", path: "/privacy" }],
  },
  {
    id: "P-22",
    path: "/terms",
    topicHe: "תקנון ותנאי שימוש",
    kashrutTier: "none",
    titleHe: composeTitle({ topicHe: "תקנון ותנאי שימוש" }),
    descriptionHe:
      "התנאים שחלים על הזמנת קייטרינג ועל השימוש באתר: מי הצד המתקשר, מה נדרש בפנייה, ומה נחשב הצעה מחייבת.",
    robots: "index,follow",
    ogImage: "auto",
    breadcrumb: [HOME, { labelHe: "תקנון", path: "/terms" }],
  },
  {
    id: "P-23",
    path: "/accessibility",
    topicHe: "הצהרת נגישות",
    kashrutTier: "none",
    titleHe: composeTitle({ topicHe: "הצהרת נגישות" }),
    descriptionHe:
      "מה כבר מיושם באתר, מה עוד לא נבדק, למי פונים כשמשהו לא עובד, ואיך מקבלים את אותו שירות בערוץ אחר.",
    robots: "index,follow",
    ogImage: "auto",
    breadcrumb: [HOME, { labelHe: "נגישות", path: "/accessibility" }],
  },
  {
    id: "P-24",
    path: "/admin/leads",
    /* ממשק פנימי: בלי זנב מותג, בלי כשרות, בלי כלום. */
    topicHe: "לידים",
    kashrutTier: "none",
    titleHe: composeTitle({ topicHe: "לידים — ניהול", brandHe: null }),
    descriptionHe: "ממשק ניהול פנימי.",
    robots: "noindex,nofollow",
    ogImage: "auto",
    breadcrumb: [],
  },
  {
    id: "P-25",
    path: "/404",
    topicHe: "לא מצאנו את הדף הזה",
    kashrutTier: "none",
    titleHe: composeTitle({ topicHe: "לא מצאנו את הדף הזה" }),
    descriptionHe: "הדף שחיפשתם לא קיים. אלה הדפים שכן.",
    robots: "noindex,follow",
    ogImage: "auto",
    breadcrumb: [HOME],
  },
];

/** הטבלה, לפי נתיב. פרמטריים (`/areas/:city`, `/lp/:campaign`) אינם כאן — §5.1. */
export const PAGE_META: Readonly<Record<string, PageMeta>> = Object.freeze(
  STATIC_META.reduce<Record<string, PageMeta>>((acc, m) => {
    acc[m.path] = m;
    return acc;
  }, {}),
);

/** נרמול: מסיר query, hash וסלאש סופי. `/menus/` ו־`/menus?x=1` → `/menus`. */
export function normalizePath(pathname: string): string {
  const withoutQuery = pathname.split("?")[0].split("#")[0];
  if (withoutQuery === "" || withoutQuery === "/") return "/";
  return withoutQuery.replace(/\/+$/, "") || "/";
}

/**
 * פותר מטא לנתיב **מהטבלה הזאת בלבד**. מחזיר `null` לנתיב לא מוכר —
 * `null` ⇒ 404, לא כותרת גנרית ולא קנוני לדף שאינו קיים (spec 01 §5.1,
 * prior-review E1).
 *
 * לפתרון על פני **כל** האתר יש להשתמש ב־`resolveSiteMeta()` שב־
 * `lib/page-meta-extra.ts`; היא מאחדת את שתי הטבלאות.
 */
export function resolveMeta(pathname: string): PageMeta | null {
  return PAGE_META[normalizePath(pathname)] ?? null;
}

/**
 * דף החגים בתוך חלון עונה: הכותרת נושאת את שם החג ואת השנה (§4 P-12).
 *
 * הבסיס מגיע כפרמטר ולא מ־`PAGE_META`: הרשומה של `/catering/holidays`
 * יושבת ב־`lib/page-meta-extra.ts`.
 *
 * מפלס הכשרות נלקח מרשומת הבסיס — ארוחת חג היא קלאסטר בכוונת כשרות,
 * והבסיס מסמן אותו `written`. התיאור **אינו** נוקב בערים.
 */
export function holidayMeta(
  seasonNameHe: string,
  base: PageMeta,
  now: Date = new Date(),
): PageMeta {
  const year = currentYearInJerusalem(now);
  const tier = base.kashrutTier ?? "written";
  const topicHe = `קייטרינג ל${seasonNameHe} ${year}`;
  return {
    ...base,
    topicHe,
    titleHe: composeTitle({ topicHe, kashrut: tier }),
    descriptionHe: withKashrut(`ארוחת ${seasonNameHe} ${FROM_ORIGIN_HE}.`, tier),
    breadcrumb: [
      ...base.breadcrumb.slice(0, -1),
      { labelHe: seasonNameHe, path: "/catering/holidays" },
    ],
  };
}

/**
 * מטא לדף נחיתה ממומן (P-27). תמיד `noindex,nofollow`, תמיד מחוץ ל־sitemap.
 * הקופי הוא של הקמפיין — הפונקציה לא ממציאה אותו, היא רק אוכפת את הרובוטס.
 */
export function campaignMeta(args: {
  campaign: string;
  titleHe: string;
  descriptionHe: string;
}): PageMeta {
  return {
    id: `P-27-${args.campaign}`,
    path: `/lp/${args.campaign}`,
    titleHe: args.titleHe,
    descriptionHe: args.descriptionHe,
    robots: "noindex,nofollow",
    ogImage: "auto",
    kashrutTier: "none",
    breadcrumb: [],
  };
}

/* ═══════════════════ קישור פנימי ═══════════════════ */

/**
 * ─────────────────────────────────────────────────────────────────────
 *  מדיניות ה־slug — מאושרת מחדש, עם הנימוק
 * ─────────────────────────────────────────────────────────────────────
 * הכתובות באתר לטיניות, אותיות קטנות ומקפים (`/catering/bar-mitzvah`),
 * ולא עבריות (`/קייטרינג/בר-מצווה`). ההחלטה **מאושרת**, ואלה הנימוקים:
 *
 *  1. כתובת עברית עוברת percent-encoding בכל מקום שאינו שורת הכתובת:
 *     בהודעת וואטסאפ, בטבלת Search Console, בפרמטר `utm_content`,
 *     ובכל דוח פרסום. `/%D7%A7%D7%99%D7%99%D7%98...` אינו קריא לאיש,
 *     והאתר הזה חי על קישור שמודבק בשיחה ועל דוחות קמפיין.
 *  2. כתובת עברית בתוך משפט עברי נשברת חזותית בגלל bidi: הסלאש והמקף
 *     מתהפכים בתצוגה, והקורא רואה כתובת שאינה מה שנשלח.
 *  3. הרווח שנותר בצד השני קטן: מילת מפתח בכתובת היא אות חלש מאוד
 *     בדירוג, ובעברית היא ממילא מוצגת מקודדת בתוצאה.
 *
 * מה **כן** קובע דירוג בשכבה הזאת ומטופל: כתובת יציבה, קנוני שמצביע על
 * עצמו, היעדר כפילויות, ועוגן תיאורי בעברית — האחרון הוא הטבלה שלמטה.
 */

/**
 * העוגן התיאורי לכל נתיב — **מקור אמת יחיד לטקסט קישור פנימי.**
 *
 * הכלל: העוגן אומר לאן מגיעים, בעברית, בלי «לחצו כאן» ובלי «כאן».
 * טקסט עוגן הוא אחד האותות הפנימיים החזקים ביותר, והוא גם מה שקורא
 * מסך מקריא מתוך רשימת קישורים מנותקת מהקשר.
 */
export const ANCHOR_HE: Readonly<Record<string, string>> = Object.freeze({
  "/": "קייטרינג מאמאמיה — דף הבית",
  "/catering": "כל סוגי האירועים",
  "/catering/business": "קייטרינג לחברות ולישיבות",
  "/catering/private-events": "קייטרינג לאירוע פרטי",
  "/catering/bar-mitzvah": "קייטרינג לבר מצווה ולבת מצווה",
  "/catering/shiva": "אוכל לשבעה ולאזכרה",
  "/catering/holidays": "קייטרינג לחגים",
  "/catering/fun-day": "קייטרינג ליום גיבוש",
  "/catering/dairy": "קייטרינג חלבי איטלקי",
  "/menus": "התפריטים של המטבח",
  "/kitchen": "המטבח שמבשל את הקייטרינג",
  "/pasta-bar": "עמדת פסטה לאירועים",
  "/urgent": "קייטרינג להיום",
  "/quote": "בקשת הצעה לאירוע",
  "/privacy": "מדיניות פרטיות",
  "/terms": "תקנון ותנאי שימוש",
  "/accessibility": "הצהרת נגישות",
});

/** עוגן לנתיב, או `null` כשאין לו טקסט מאושר. אין ברירת מחדל גנרית. */
export const anchorFor = (path: string): string | null =>
  ANCHOR_HE[normalizePath(path)] ?? null;

/** טקסטים שאסור שיופיעו כעוגן. `auditInternalLinks()` אוכף. */
export const FORBIDDEN_ANCHORS_HE: readonly string[] = [
  "לחצו כאן",
  "לחץ כאן",
  "כאן",
  "קרא עוד",
  "קראו עוד",
  "עוד",
  "לפרטים",
  "המשך",
];

/**
 * הקישורים שכל דף **חייב** לפלוט, מעבר לניווט הגלובלי.
 *
 * זה החוזה שמחזיק את «כל דף במרחק שתי קליקות»: הוא נכתב כאן, במקום אחד,
 * ולא מתגלה מקריאה של עשרים קבצי עמוד. `NextSteps` ו־`OccasionGrid`
 * בכל דף אמורים לצרוך אותו, ו־`auditInternalLinks()` מוכיח שהוא מספיק.
 *
 * ‏**זהו החוזה, ולא תיאור המצב.** בזמן כתיבת השורות האלה, המצב בפועל
 * נבדל ממנו בשתי נקודות, ושתיהן רשומות בדוח כתיקון בקובץ שאינו בבעלות
 * הסבב הזה:
 *   · ‏`/kitchen` הוא **יתום** — הוא מוגש ואינדקסבילי, ואף דף באתר אינו
 *     מקשר אליו. דף שאין אליו קישור פנימי מקבל את תקציב הסריקה האחרון
 *     ואינו יורש שום סמכות.
 *   · ‏`/catering` — המפרק — אינו מקושר מדף הבית, ומגיעים אליו רק דרך דף
 *     אירוע. כלומר הדף שאמור לרכז את הקטגוריה יושב מתחת לענפים שלו.
 *
 * קישור אל מסלול שהשער שלו סגור (`/menus`, `/catering/shiva`,
 * ‏`/catering/fun-day`, `/pasta-bar`) נשאר בחוזה בכוונה: `NextSteps`
 * מסנן אותו בזמן ריצה מול `isServedPath`, והוא נדלק מעצמו ביום שהשער
 * ייפתח. הביקורת מונה אותם ב־`danglingLinks` — לא כשגיאה, אלא כדי
 * שיהיה גלוי אילו דפים אינם נגישים היום ומאיזו סיבה.
 */
export const REQUIRED_LINKS: Readonly<Record<string, readonly string[]>> = Object.freeze({
  /* דף הבית פורש את כל מפת האירועים, את המפרק, ואת דף המטבח. */
  "/": [
    "/catering",
    "/kitchen",
    "/quote",
    "/menus",
    "/catering/business",
    "/catering/private-events",
    "/catering/bar-mitzvah",
    "/catering/holidays",
    "/catering/dairy",
    "/catering/shiva",
    "/catering/fun-day",
    "/urgent",
    "/pasta-bar",
  ],
  "/catering": [
    "/kitchen",
    "/quote",
    "/menus",
    "/catering/business",
    "/catering/private-events",
    "/catering/bar-mitzvah",
    "/catering/holidays",
    "/catering/dairy",
    "/catering/shiva",
    "/catering/fun-day",
    "/urgent",
    "/pasta-bar",
  ],
  "/catering/business": ["/catering", "/quote"],
  "/catering/private-events": ["/catering", "/quote"],
  "/catering/bar-mitzvah": ["/catering", "/quote"],
  "/catering/holidays": ["/catering", "/quote"],
  "/catering/dairy": ["/catering", "/quote"],
  "/catering/shiva": ["/catering"],
  "/catering/fun-day": ["/catering", "/quote"],
  "/menus": ["/catering", "/quote"],
  "/pasta-bar": ["/catering", "/quote"],
  "/kitchen": ["/catering", "/quote"],
  "/urgent": ["/quote"],
  "/quote": ["/catering"],
});

/**
 * הניווט הגלובלי — קישורים שמופיעים בכל דף.
 * הכותרת: הלוגו ל־`/` וכפתור ל־`/quote`. הפוטר: שלושת הדפים המשפטיים.
 * הרשימה מתארת את מה שקיים, ומזינה את חישוב עומק הקליקים.
 */
export const GLOBAL_NAV_LINKS: readonly string[] = Object.freeze([
  "/",
  "/quote",
  "/privacy",
  "/terms",
  "/accessibility",
]);

/** הנתיבים המוגשים והאינדקסביליים היום, לפי `shared/routes.ts`. */
function indexablePaths(): string[] {
  return ROUTES.filter((r) => r.enabled && r.indexable && !r.param).map((r) => r.path);
}

export type LinkAudit = {
  /** עומק הקליקים מדף הבית לכל נתיב מוגש. */
  depth: Readonly<Record<string, number>>;
  /** נתיבים מוגשים ואינדקסביליים שאיש אינו מקשר אליהם. */
  orphans: string[];
  /** נתיבים שמעבר לשתי קליקות מדף הבית. */
  tooDeep: string[];
  /** קישור נדרש אל נתיב שאינו מוגש היום — יימחק בזמן ריצה, לא יישבר. */
  danglingLinks: { from: string; to: string }[];
  /** נתיב מוגש שאין לו עוגן תיאורי מאושר. */
  missingAnchors: string[];
  /** עוגן שנפל לרשימת האסורים. */
  weakAnchors: { path: string; anchorHe: string }[];
};

/**
 * מחשב את גרף הקישור הפנימי ומחזיר את ההפרות.
 *
 * **פונקציית בדיקה, לא פונקציית זמן ריצה.** אין לקרוא לה בעמוד.
 */
export function auditInternalLinks(): LinkAudit {
  const served = indexablePaths();
  const servedSet = new Set(served);

  const edges = new Map<string, Set<string>>();
  const addEdge = (from: string, to: string) => {
    if (!servedSet.has(from) || !servedSet.has(to) || from === to) return;
    const set = edges.get(from) ?? new Set<string>();
    set.add(to);
    edges.set(from, set);
  };

  const danglingLinks: { from: string; to: string }[] = [];

  for (const from of served) {
    for (const to of GLOBAL_NAV_LINKS) addEdge(from, to);
    for (const to of REQUIRED_LINKS[from] ?? []) {
      if (!isServedPath(to)) danglingLinks.push({ from, to });
      addEdge(from, to);
    }
  }

  /* BFS מדף הבית. */
  const depth: Record<string, number> = { "/": 0 };
  let frontier = ["/"];
  while (frontier.length > 0) {
    const next: string[] = [];
    for (const node of frontier) {
      for (const to of edges.get(node) ?? []) {
        if (depth[to] === undefined) {
          depth[to] = depth[node] + 1;
          next.push(to);
        }
      }
    }
    frontier = next;
  }

  const inbound = new Set<string>();
  for (const [, targets] of edges) for (const t of targets) inbound.add(t);

  return {
    depth: Object.freeze({ ...depth }),
    orphans: served.filter((p) => p !== "/" && !inbound.has(p)),
    tooDeep: served.filter((p) => depth[p] === undefined || depth[p] > 2),
    danglingLinks,
    missingAnchors: served.filter((p) => anchorFor(p) === null),
    weakAnchors: served
      .map((p) => ({ path: p, anchorHe: anchorFor(p) ?? "" }))
      .filter((r) => FORBIDDEN_ANCHORS_HE.includes(r.anchorHe.trim())),
  };
}

/* ═══════════════════ ביקורת הכנות של שכבת ה־head ═══════════════════ */

/**
 * ─────────────────────────────────────────────────────────────────────
 *  ‏`auditPageMeta` — הסבב הקודם מצא חמישה תיאורים שהצהירו על עובדות
 *  שאיש לא מסר. הפונקציה הזאת קיימת כדי שהסבב הבא לא ימצא אף אחד.
 * ─────────────────────────────────────────────────────────────────────
 * הביטויים למטה אינם רשימת מילים אסורות סתם: כל אחד מהם הוא **טענה
 * שהמשבצת המתאימה לה ב־`content/` היא `null`**. אם מישהו ממלא את
 * המשבצת, הטענה נעשית נכונה — ואז מוציאים אותה מכאן, באותו שינוי.
 */
type ClaimRule = {
  id: string;
  re: RegExp;
  /** מה חסר, ובאיזו משבצת. */
  whyHe: string;
};

const CLAIM_RULES: readonly ClaimRule[] = [
  {
    id: "multi-kitchen",
    re: /מטבחים|שלושה\s+מטבח|רשת\s+של/,
    whyHe: "הקייטרינג יוצא ממטבח אחד. `COOKED_IN_ACTIVE_RESTAURANT_KITCHEN`, לשון יחיד.",
  },
  {
    id: "city-as-origin",
    re: /הרצליה|רעננה|פתח\s?תקווה|תל[\s־-]?אביב|כפר\s?סבא|הוד\s?השרון|רמת\s?השרון|גוש\s?דן|השרון/,
    whyHe: "`SLOTS.cateringKitchenBranch` ו־`CATERING_SERVICE_AREA` הם null — אין עיר ואין אזור.",
  },
  {
    id: "speed",
    re: /משלוח\s+מהיר|תוך\s+\d|עד\s+\d+\s+(שעות|דקות)|זמן\s+תגובה|מענה\s+מיידי|חוזרים\s+תוך/,
    whyHe: "`SLOTS.responseTime`, `SLOTS.leadTime` ו־`SLOTS.sameDayCutoff` הם null.",
  },
  {
    id: "live-station",
    re: /עמד(ה|ות)\s+חי(ה|ות)|שף\s+במקום|מבשלים\s+במקום/,
    whyHe: "`SLOTS.liveStations` הוא null.",
  },
  {
    id: "always-open",
    re: /מדי\s+יום|כל\s+יום|כל\s+השבוע|7\s+ימים|24\/7/,
    whyHe: "`SLOTS.openingHours` ו־`SLOTS.staffedHours` הם null.",
  },
  {
    id: "price",
    re: /₪|שקל|החל\s+מ־?\s*\d|מחירון|מבצע|הנחה|ללא\s+עלות|חינם/,
    whyHe: "`SLOTS.pricePerPerson` הוא null. עוגן מחיר נכנס רק דרך `composeTitle`.",
  },
  {
    id: "headcount",
    re: /מינימום\s+\d|מ־?\s*\d+\s+סועדים|עד\s+\d+\s+איש/,
    whyHe: "`SLOTS.minGuests` ו־`SLOTS.maxGuests` הם null.",
  },
  {
    id: "staff",
    re: /מלצר|צוות\s+הגשה|טעימ(ה|ות)\s+חינם|טעימות\s+במסעדה/,
    whyHe: "`SLOTS.tastingPolicy` הוא null, ואין משבצת צוות הגשה.",
  },
  {
    id: "social-proof",
    re: /לקוחות\s+מרוצים|ביקורות|דירוג|כוכבים|מומלץ\s+על\s+ידי/,
    whyHe: "`content/proof.ts` ריק — אין מונה ביקורות ואין דירוג.",
  },
  {
    id: "seniority",
    re: /מאז\s+\d{4}|\d+\s+שנות\s+ניסיון|ותיק/,
    whyHe: "`SLOTS.foundedYear` הוא null.",
  },
];

export type MetaFinding = {
  path: string;
  rule: string;
  detailHe: string;
};

/**
 * בודק טבלת מטא שלמה. מקבל את הטבלה כפרמטר כדי שהקורא יעביר את האיחוד
 * של שתי הטבלאות (`resolveSiteMeta`/`mergePageMeta` ב־page-meta-extra)
 * ולא רק את זו שכאן.
 */
export function auditPageMeta(
  table: Readonly<Record<string, PageMeta>>,
): MetaFinding[] {
  const findings: MetaFinding[] = [];
  const seenTitles = new Map<string, string>();
  const seenDescriptions = new Map<string, string>();

  for (const [path, meta] of Object.entries(table)) {
    const push = (rule: string, detailHe: string) => findings.push({ path, rule, detailHe });
    const text = `${meta.titleHe} ${meta.descriptionHe}`;

    /* 1 · טענות שאין להן משבצת מלאה.
     *
     * חריג אחד, ומכוון: כשעוגן המחיר **מאושר**, `composeTitle` מזריק
     * אותו לכותרת בעצמו — ואז «₪» בכותרת הוא בדיוק ההתנהגות הנכונה ולא
     * ממצא. הכלל נבדק מול המצב בפועל, לא מול רשימת מילים קפואה. */
    const priceApproved = priceAnchorHe() !== null;
    for (const rule of CLAIM_RULES) {
      if (rule.id === "price" && priceApproved) continue;
      if (rule.re.test(text)) push(rule.id, rule.whyHe);
    }

    /* 2 · «כשר» רק כשהמפלס של הדף מאשר אותו, ובנוסח שהמערכת מחזירה. */
    if (/כשר|בד״ץ|בד"ץ|כשרות/.test(text)) {
      const tier = meta.kashrutTier ?? "none";
      const clause = kashrutClauseHe(tier);
      const badge = kashrutBadgeHe(tier);
      if (!clause && !badge) {
        push(
          "kashrut-tier",
          `טענת כשרות במפלס "${tier}" שאין לו נוסח מאושר. ראו CATERING_KASHRUT_STATEMENT.`,
        );
      }
    }

    /* 3 · ייחודיות (T-3). */
    const titleOwner = seenTitles.get(meta.titleHe);
    if (titleOwner) push("duplicate-title", `כותרת זהה ל־${titleOwner}`);
    else seenTitles.set(meta.titleHe, path);

    const descOwner = seenDescriptions.get(meta.descriptionHe);
    if (descOwner) push("duplicate-description", `תיאור זהה ל־${descOwner}`);
    else seenDescriptions.set(meta.descriptionHe, path);

    /* 4 · אורכים. */
    if (meta.titleHe.length > TITLE_MAX) {
      push("title-length", `${meta.titleHe.length} תווים, התקציב ${TITLE_MAX}.`);
    }
    if (meta.descriptionHe.length > DESCRIPTION_MAX) {
      push("description-length", `${meta.descriptionHe.length} תווים, התקציב ${DESCRIPTION_MAX}.`);
    }
    if (meta.robots === "index,follow" && meta.descriptionHe.length < DESCRIPTION_MIN) {
      push(
        "description-short",
        `${meta.descriptionHe.length} תווים; מתחת ל־${DESCRIPTION_MIN} גוגל כותב תיאור משלו.`,
      );
    }

    /* 5 · הכותרת נבנתה מהמערכת ולא הודבקה. */
    const topic = meta.topicHe ?? "";
    if (topic !== "" && !meta.titleHe.startsWith(topic)) {
      push("title-not-composed", "הכותרת אינה פותחת ב־topicHe — היא נכתבה ידנית.");
    }

    /* 6 · פירור הלחם מסתיים בדף עצמו (אחרת ה־@id של הקשת שגוי). */
    const trail = meta.breadcrumb ?? [];
    if (trail.length >= 2 && trail[trail.length - 1].path !== meta.path) {
      push("breadcrumb-tail", "הפריט האחרון בפירור הלחם אינו הדף עצמו.");
    }

    /* 7 · הרובוטס מסכים עם `shared/routes.ts`. */
    const match = matchRoute(path);
    if (match?.route.enabled) {
      const shouldIndex = match.route.indexable;
      const doesIndex = meta.robots === "index,follow";
      if (shouldIndex !== doesIndex) {
        push(
          "robots-mismatch",
          `shared/routes.ts קובע indexable=${shouldIndex}, והמטא אומרת "${meta.robots}".`,
        );
      }
    }
  }

  return findings;
}
