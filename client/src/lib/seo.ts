/**
 * ═══════════════════════════════════════════════════════════════════════
 *  שכבת ה־SEO — טבלת מטא לכל נתיב, ובוני JSON-LD.
 * ═══════════════════════════════════════════════════════════════════════
 *
 * spec 01 §5.1 (שכבת ה־head), §7 (מודל schema.org), INV-7, T-3, T-4.
 *
 * ─────────────────────────────────────────────────────────────────────
 *  החוק שמחזיק את הקובץ הזה
 * ─────────────────────────────────────────────────────────────────────
 * `client/src/content/business.ts` הוא מקור האמת. שני דברים מאומתים:
 * הטלפון ושמות שלושת הסניפים. כתובות, שעות, מחירים, מינימום סועדים,
 * מצב התעדה של המזון ואזורי חלוקה — כולם `null`, ונשארים `null`.
 *
 * **נתונים מובנים שמצהירים כתובת שגויה או טווח מחיר מומצא גרועים
 * מהיעדר נתונים מובנים לחלוטין.** גוגל מציג אותם כעובדה על העסק, הם
 * נשאבים למנועי תשובות, והם התחייבות מסחרית לכל דבר. לכן `compact()`
 * רץ על **כל** אובייקט לפני סריאליזציה ומוחק רקורסיבית כל מפתח שערכו
 * null / undefined / מחרוזת ריקה / מערך ריק / אובייקט שהתרוקן.
 * לא נפלט `null`, לא נפלטת מחרוזת ריקה, ולא נפלט תו ממלא־מקום.
 *
 * בנוסף `FORBIDDEN_KEYS` נמחקים בכוח בשלב הסריאליזציה (spec 01 §7.3):
 * `priceRange`, `aggregateRating`, `review`, `hasCertification`. אלה
 * ארבעת השדות שהגרסה הקודמת שידרה בהם שקר, והשארתם ברשימה עדיפה על
 * הסתמכות על משמעת של מי שיערוך את הקובץ הזה בעוד חצי שנה.
 *
 * ─────────────────────────────────────────────────────────────────────
 *  מה שאין כאן במכוון
 * ─────────────────────────────────────────────────────────────────────
 *  · אין `department`. סניפים באתרים שונים הם `subOrganization`, ומודל
 *    ה־`FoodEstablishment` + `department` שבקובץ העיצוב (design-reference
 *    index.html) שגוי ואינו מיובא. spec 01 §7.1 מפורש בזה.
 *  · אין `priceRange` — גם לא `"{{PRICE_RANGE}}"`, גם לא ניחוש.
 *  · אין `aggregateRating` ואין `Review`: אין ביקורות אמיתיות שניתן לייחס,
 *    וגוגל אוסר קטעי ביקורת עצמיים ל־LocalBusiness.
 *  · אין `hasCertification` ואין שום הצהרת התעדה על המזון, בשום ניסוח.
 *  · אין דומיין קשיח. ה־origin נפתר מ־`VITE_SITE_ORIGIN` ואם אינו מוגדר —
 *    מ־`window.location.origin`. כשייווצר `config/business.ts` עם `DOMAIN`
 *    (spec 01 task 0.3), `siteOrigin()` הוא המקום היחיד שצריך לשנות.
 */

import { BRANCHES, type BranchId } from "@/content/business";

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
};

/* ═══════════════════ קבועים ═══════════════════ */

/** שם המותג. עובדה מאומתת (שם העסק), ותו לא. */
export const SITE_NAME_HE = "מאמא מיה";
export const LOCALE = "he_IL";
export const LANG = "he";

/**
 * ממדי הכרטיס שנוצר בבנייה, spec 01 §5.6. מוצהרים **רק** ל־`ogImage: "auto"`;
 * לתצלום אמיתי הממדים אינם ידועים בזמן רינדור ולכן אינם מוצהרים.
 */
export const OG_AUTO_WIDTH = 1200;
export const OG_AUTO_HEIGHT = 630;

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

/** בונה `@graph` מצמתים, אחרי `compact`. מחזיר `null` כשלא נותר צומת. */
export function buildGraph(nodes: Array<JsonLdNode | null | undefined>): JsonLdNode | null {
  const clean = nodes
    .filter((n): n is JsonLdNode => !!n)
    .map((n) => compact(n))
    .filter((n): n is JsonLdNode => !!n);
  if (clean.length === 0) return null;
  return { "@context": "https://schema.org", "@graph": clean };
}

/**
 * סריאליזציה בטוחה להזרקה בתוך `<script type="application/ld+json">`.
 * `<` בורח ל־`<` כדי ש־`</script>` בתוך מחרוזת לא יסגור את התגית.
 */
export function serializeJsonLd(node: JsonLdNode | null): string | null {
  if (!node) return null;
  return JSON.stringify(node).replace(/</g, "\\u003c");
}

/* ═══════════════════ נתוני סניף לצורכי schema ═══════════════════ */

/**
 * מה שבונה ה־`Restaurant` יודע לקבל. **כל שדה מלבד `slug` / `nameHe` /
 * `cityHe` הוא Slot** ומושמט לחלוטין כשאינו מלא. כשייווצר
 * `data/locations.ts` (spec 01 §6.1) הוא יזין את הטיפוס הזה; עד אז
 * `defaultBranchSeo()` מחזיר שם ועיר בלבד, וזה הפלט הנכון.
 */
export type BranchSeo = {
  slug: string;
  /** שם הסניף כפי שהלקוח מסר. מאומת. */
  nameHe: string;
  /** היישוב. זהה לשם הסניף — מאומת מאותו מקור. */
  cityHe: string;
  street?: Maybe<string>;
  postalCode?: Maybe<string>;
  geo?: Maybe<{ lat: number; lng: number }>;
  /** E.164. אין מספר סניפי מאומת — קיים רק המספר המרכזי. */
  phoneE164?: Maybe<string>;
  /**
   * שעות פתיחה בפורמט schema.org. `dayOfWeek` חייב להיות שמות ימים
   * אנגליים ("Monday"). מחרוזת עברית חופשית מ־locations.ts אינה תקפה
   * כאן ולכן הבלוק מושמט — עדיף להשמיט מאשר לפלוט שעות שגויות.
   */
  openingHours?: Maybe<Array<{ dayOfWeek: string[]; opens: string; closes: string }>>;
  /** קישור פרופיל Google — הקשת בעלת הערך הגבוה ביותר בגרף. */
  gbpUrl?: Maybe<string>;
  /** שם השף. נפלט **רק** כש־`consent === true` (spec 01 §6.1). */
  chef?: Maybe<{ nameHe: string; roleHe?: Maybe<string>; consent: boolean }>;
};

/** תעתיק ה־slug נעול ב־spec 01 §1. נגזר מהמזהה כדי שאיש לא ירומן עיר מחדש. */
export const branchSlug = (id: BranchId): string => id.replace(/_/g, "-");

/** שלושת הסניפים עם מה שמאומת בלבד: שם ועיר. */
export function defaultBranchSeo(): BranchSeo[] {
  return BRANCHES.map((b) => ({
    slug: branchSlug(b.id),
    nameHe: b.name,
    cityHe: b.name,
  }));
}

/* ═══════════════════ מזהי הצמתים בגרף ═══════════════════ */

export const orgId = (origin = siteOrigin()) => `${absoluteUrl("/", origin)}#org`;
export const websiteId = (origin = siteOrigin()) => `${absoluteUrl("/", origin)}#website`;
export const kitchenId = (slug: string, origin = siteOrigin()) =>
  `${absoluteUrl(`/kitchens/${slug}`, origin)}#kitchen`;
const pageId = (path: string, origin = siteOrigin()) => `${absoluteUrl(path, origin)}#webpage`;

const ref = (id: string): JsonLdNode => ({ "@id": id });

/* ═══════════════════ בוני הצמתים ═══════════════════ */

/**
 * Organization — ישות המותג. spec 01 §7.1.
 * `legalName` ו־`taxID` הם Slots (שם משפטי ומספר ח.פ. טרם נמסרו) ולכן
 * מושמטים; `sameAs` נפלט רק כשיש כתובות רשתות חברתיות אמיתיות.
 */
export function buildOrganization(opts: {
  telephone?: Maybe<string>;
  legalName?: Maybe<string>;
  taxId?: Maybe<string>;
  email?: Maybe<string>;
  logoPath?: Maybe<string>;
  sameAs?: Maybe<string[]>;
  branches?: BranchSeo[];
  origin?: string;
}): JsonLdNode {
  const origin = opts.origin ?? siteOrigin();
  const branches = opts.branches ?? defaultBranchSeo();
  return {
    "@type": "Organization",
    "@id": orgId(origin),
    name: SITE_NAME_HE,
    legalName: opts.legalName ?? null,
    taxID: opts.taxId ?? null,
    url: absoluteUrl("/", origin),
    logo: opts.logoPath ? absoluteUrl(opts.logoPath, origin) : null,
    telephone: opts.telephone ?? null,
    email: opts.email ?? null,
    sameAs: opts.sameAs ?? null,
    subOrganization: branches.map((b) => ref(kitchenId(b.slug, origin))),
  };
}

export function buildWebSite(opts: { origin?: string } = {}): JsonLdNode {
  const origin = opts.origin ?? siteOrigin();
  return {
    "@type": "WebSite",
    "@id": websiteId(origin),
    name: SITE_NAME_HE,
    url: absoluteUrl("/", origin),
    inLanguage: LANG,
    publisher: ref(orgId(origin)),
  };
}

/**
 * Restaurant — מטבח אחד. הישות קנונית בדף הסניף שלה בלבד (spec 01 P-03):
 * במקומות אחרים מפנים אליה ב־`@id` ולא חוזרים עליה.
 *
 * **לא `FoodEstablishment` + `department`.** סניפים בערים שונות אינם
 * מחלקות בתוך מקום אחד.
 */
export function buildRestaurant(branch: BranchSeo, opts: { origin?: string } = {}): JsonLdNode {
  const origin = opts.origin ?? siteOrigin();
  const chefNamed = branch.chef && branch.chef.consent === true ? branch.chef : null;

  return {
    "@type": "Restaurant",
    "@id": kitchenId(branch.slug, origin),
    name: `${SITE_NAME_HE} ${branch.nameHe}`,
    url: absoluteUrl(`/kitchens/${branch.slug}`, origin),
    parentOrganization: ref(orgId(origin)),
    servesCuisine: "Italian",
    hasMenu: absoluteUrl("/menus", origin),
    telephone: branch.phoneE164 ?? null,
    address: {
      "@type": "PostalAddress",
      streetAddress: branch.street ?? null,
      addressLocality: branch.cityHe,
      postalCode: branch.postalCode ?? null,
      addressCountry: "IL",
    },
    geo:
      branch.geo && Number.isFinite(branch.geo.lat) && Number.isFinite(branch.geo.lng)
        ? { "@type": "GeoCoordinates", latitude: branch.geo.lat, longitude: branch.geo.lng }
        : null,
    openingHoursSpecification:
      branch.openingHours?.map((h) => ({
        "@type": "OpeningHoursSpecification",
        dayOfWeek: h.dayOfWeek,
        opens: h.opens,
        closes: h.closes,
      })) ?? null,
    sameAs: branch.gbpUrl ? [branch.gbpUrl] : null,
    employee: chefNamed
      ? { "@type": "Person", name: chefNamed.nameHe, jobTitle: chefNamed.roleHe ?? null }
      : null,
  };
}

/**
 * Service — הצעת הקייטרינג. spec 01 §7.2.
 * **לצפיות הלקוח, בכנות:** ל־`Service` אין תוצאה עשירה מקבילה בגוגל.
 * הוא נפלט לצורך זיהוי ישות, לא לקישוט תוצאות.
 *
 * `areaServed` נפלט **רק** כשנמסרו ערים בפועל. אזור חלוקה שנגזר ממפה
 * הוא בדיוק האופן שבו נכנסו לאתר הקודם ~14 ערי שירות מומצאות.
 */
export function buildService(opts: {
  path: string;
  nameHe: string;
  descriptionHe?: Maybe<string>;
  /** ערים שנמסרו על ידי הלקוח. ריק/null ⇒ המפתח מושמט. */
  areaServedHe?: Maybe<string[]>;
  /** `"business"` ⇒ `BusinessAudience`. */
  audience?: Maybe<"business" | "consumer">;
  origin?: string;
}): JsonLdNode {
  const origin = opts.origin ?? siteOrigin();
  return {
    "@type": "Service",
    "@id": `${absoluteUrl(opts.path, origin)}#service`,
    serviceType: "Catering",
    name: opts.nameHe,
    description: opts.descriptionHe ?? null,
    url: absoluteUrl(opts.path, origin),
    provider: ref(orgId(origin)),
    areaServed:
      opts.areaServedHe?.map((city) => ({ "@type": "City", name: city })) ?? null,
    audience:
      opts.audience === "business"
        ? { "@type": "BusinessAudience" }
        : opts.audience === "consumer"
          ? { "@type": "Audience", audienceType: "Consumer" }
          : null,
    inLanguage: LANG,
  };
}

/** WebPage / CollectionPage / ContactPage — טיפוס אחד, שלושה שמות. */
export function buildWebPage(
  meta: PageMeta,
  opts: { type?: "WebPage" | "CollectionPage" | "ContactPage"; origin?: string } = {},
): JsonLdNode {
  const origin = opts.origin ?? siteOrigin();
  return {
    "@type": opts.type ?? "WebPage",
    "@id": pageId(meta.path, origin),
    url: absoluteUrl(meta.path, origin),
    name: meta.titleHe,
    description: meta.descriptionHe,
    inLanguage: LANG,
    isPartOf: ref(websiteId(origin)),
    about: ref(orgId(origin)),
  };
}

/**
 * BreadcrumbList. פחות משני פריטים ⇒ `null` (שרשרת של פריט אחד אינה
 * פירור לחם, וגוגל מתעלם ממנה ממילא).
 */
export function buildBreadcrumbList(
  trail: Crumb[],
  opts: { origin?: string } = {},
): JsonLdNode | null {
  const origin = opts.origin ?? siteOrigin();
  const items = trail.filter((c) => c.labelHe.trim() !== "" && c.path.trim() !== "");
  if (items.length < 2) return null;
  return {
    "@type": "BreadcrumbList",
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
 */
export function buildFaqPage(
  items: Array<{ questionHe: string; answerHe: Maybe<string> }>,
): JsonLdNode | null {
  const answered = items.filter(
    (i) =>
      typeof i.answerHe === "string" &&
      i.answerHe.trim() !== "" &&
      i.questionHe.trim() !== "",
  );
  if (answered.length === 0) return null;
  return {
    "@type": "FAQPage",
    mainEntity: answered.map((i) => ({
      "@type": "Question",
      name: i.questionHe,
      acceptedAnswer: { "@type": "Answer", text: (i.answerHe as string).trim() },
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
  const filled = sections.filter((s) => s.items.length > 0);
  if (filled.length === 0) return null;
  return {
    "@type": "Menu",
    "@id": `${absoluteUrl("/menus", origin)}#menu`,
    url: absoluteUrl("/menus", origin),
    inLanguage: LANG,
    hasMenuSection: filled.map((section) => ({
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
 * הכותרות והתיאורים המצוטטים ב־spec 01 §4 מועתקים כאן **מילה במילה**.
 * היכן שהמפרט לא סיפק תיאור, נכתב כאן תיאור שאינו מכיל שום מספר, שום
 * התחייבות מסחרית ושום הצהרת התעדה — רק את שלוש עובדות הזהות: מסעדה
 * איטלקית, ומטבח של מסעדה פעילה. לא «שלושה מטבחים» — הקייטרינג יוצא מאחד.
 *
 * T-3: אין שתי רשומות שחולקות `titleHe` או `descriptionHe`.
 * T-4: הקנוני של כל נתיב מפנה לעצמו — הוא נגזר מ־`path`, תמיד.
 */

const HOME: Crumb = { labelHe: "ראשי", path: "/" };
const CATERING: Crumb = { labelHe: "קייטרינג לאירועים", path: "/catering" };
const KITCHENS: Crumb = { labelHe: "המטבחים שלנו", path: "/kitchens" };

const branchMeta = (): PageMeta[] =>
  BRANCHES.map((b, i) => ({
    id: `P-0${4 + i}`,
    path: `/kitchens/${branchSlug(b.id)}`,
    titleHe: `קייטרינג איטלקי ב${b.name} | מהמטבח של המסעדה שלנו ב${b.name} — ${SITE_NAME_HE}`,
    descriptionHe: `המטבח שלנו ב${b.name} מבשל לסועדים במסעדה. אותו מטבח מבשל גם לאירוע שלכם.`,
    robots: "index,follow" as const,
    ogImage: "auto" as const,
    breadcrumb: [HOME, KITCHENS, { labelHe: b.name, path: `/kitchens/${branchSlug(b.id)}` }],
  }));

const STATIC_META: PageMeta[] = [
  {
    id: "P-01",
    path: "/",
    titleHe:
      "קייטרינג מאמאמיה | מהמטבח של מסעדה איטלקית פעילה, כשר בד״ץ",
    descriptionHe:
      "התפריט של מאמאמיה, אצלכם באירוע. מבושל במטבח של מסעדה פעילה, כשר בד״ץ.",
    robots: "index,follow",
    ogImage: "auto",
    breadcrumb: [HOME],
  },
  {
    id: "P-02",
    path: "/menus",
    titleHe: "התפריטים | קייטרינג מאמא מיה — מהמטבח של המסעדה",
    descriptionHe: "מה שהמטבחים שלנו מבשלים, ומה מתוכו אפשר להזמין לאירוע.",
    robots: "index,follow",
    ogImage: "auto",
    breadcrumb: [HOME, { labelHe: "התפריטים", path: "/menus" }],
  },
  {
    id: "P-03",
    path: "/kitchens",
    titleHe: "המטבחים שלנו | שלוש מסעדות איטלקיות פעילות — מאמא מיה",
    descriptionHe:
      "מי מבשל את הקייטרינג, ואיפה.",
    robots: "index,follow",
    ogImage: "auto",
    breadcrumb: [HOME, KITCHENS],
  },
  {
    id: "P-07",
    path: "/catering",
    titleHe: "קייטרינג לאירועים | מאמא מיה — שלושה מטבחי מסעדה",
    descriptionHe: "לאיזה אירועים אנחנו נכנסים, ומה אנחנו לא עושים.",
    robots: "index,follow",
    ogImage: "auto",
    breadcrumb: [HOME, CATERING],
  },
  {
    id: "P-08",
    path: "/catering/business",
    titleHe: "מגשי אירוח וקייטרינג לחברות בהרצליה פיתוח | מאמא מיה — מטבח מסעדה",
    descriptionHe:
      "ארוחת צוות, כיבוד לישיבות והשקות — מהמטבח של המסעדה בהרצליה פיתוח.",
    robots: "index,follow",
    ogImage: "auto",
    breadcrumb: [HOME, CATERING, { labelHe: "קייטרינג לחברות", path: "/catering/business" }],
  },
  {
    id: "P-09",
    path: "/catering/private-events",
    titleHe:
      "אירוע פרטי במסעדה או קייטרינג בבית | מאמא מיה — הרצליה פיתוח, רעננה, פתח תקווה",
    descriptionHe: "אירוסין, יום הולדת ואירוח בבית — מהמטבח של המסעדה, אצלכם.",
    robots: "index,follow",
    ogImage: "auto",
    breadcrumb: [
      HOME,
      CATERING,
      { labelHe: "שמחות פרטיות", path: "/catering/private-events" },
    ],
  },
  {
    id: "P-10",
    path: "/catering/bar-mitzvah",
    titleHe: "קייטרינג לבר מצווה ולבת מצווה | מאמא מיה — מטבח מסעדה איטלקית",
    descriptionHe: "בר מצווה ובת מצווה מהמטבח של המסעדה. אתם מארחים, אנחנו מבשלים.",
    robots: "index,follow",
    ogImage: "auto",
    breadcrumb: [
      HOME,
      CATERING,
      { labelHe: "בר מצווה ובת מצווה", path: "/catering/bar-mitzvah" },
    ],
  },
  {
    id: "P-11",
    path: "/catering/shiva",
    titleHe: "אוכל לשבעה — משלוח מהמטבח שלנו | מאמא מיה",
    descriptionHe: "אוכל לשבעה ולאזכרה, מהמטבח של המסעדה. מתקשרים, ואנחנו מסתדרים.",
    robots: "index,follow",
    ogImage: "auto",
    breadcrumb: [HOME, CATERING, { labelHe: "אירוח שבעה", path: "/catering/shiva" }],
  },
  {
    id: "P-12",
    path: "/catering/holidays",
    titleHe: "קייטרינג לחגים | מאמא מיה — מטבח מסעדה איטלקית",
    descriptionHe: "ארוחת חג מהמטבח של המסעדה, בהרצליה פיתוח, ברעננה ובפתח תקווה.",
    robots: "index,follow",
    ogImage: "auto",
    breadcrumb: [HOME, CATERING, { labelHe: "חגים", path: "/catering/holidays" }],
  },
  {
    id: "P-13",
    path: "/catering/fun-day",
    titleHe: "קייטרינג ליום גיבוש ולימי כיף | מאמא מיה — מטבח מסעדה איטלקית",
    descriptionHe: "יום גיבוש לצוות, מהמטבח של המסעדה האיטלקית שלנו.",
    robots: "index,follow",
    ogImage: "auto",
    breadcrumb: [HOME, CATERING, { labelHe: "ימי גיבוש", path: "/catering/fun-day" }],
  },
  {
    id: "P-14",
    path: "/catering/dairy",
    titleHe: "קייטרינג חלבי איטלקי | מאמא מיה — מהמטבח של המסעדה",
    descriptionHe: "תפריט חלבי איטלקי מהמטבח של המסעדה — פסטות, גבינות ואנטיפסטי.",
    robots: "index,follow",
    ogImage: "auto",
    breadcrumb: [HOME, CATERING, { labelHe: "קייטרינג חלבי", path: "/catering/dairy" }],
  },
  {
    id: "P-15",
    path: "/urgent",
    titleHe: "קייטרינג להיום | קייטרינג מאמאמיה",
    descriptionHe: "צריכים אוכל להיום? שיחת טלפון אחת.",
    robots: "index,follow",
    ogImage: "auto",
    breadcrumb: [HOME, { labelHe: "קייטרינג להיום", path: "/urgent" }],
  },
  {
    id: "P-16",
    path: "/pasta-bar",
    titleHe: "עמדת פסטה לאירועים | קו העבודה של המטבח שלנו — מאמא מיה",
    descriptionHe: "עמדת פסטה לאירועים, מהמטבח של המסעדה האיטלקית שלנו.",
    robots: "index,follow",
    ogImage: "auto",
    breadcrumb: [HOME, { labelHe: "עמדת פסטה", path: "/pasta-bar" }],
  },
  {
    id: "P-17",
    path: "/quote",
    titleHe: "בקשת הצעה לקייטרינג | 4 שאלות — מאמא מיה",
    descriptionHe: "בונים את התפריט שלכם בארבע שאלות, ומדברים עם מטבח.",
    robots: "index,follow",
    ogImage: "auto",
    breadcrumb: [HOME, { labelHe: "התפריט שלכם", path: "/quote" }],
  },
  {
    id: "P-18",
    path: "/thanks",
    titleHe: "אישור פנייה | מאמא מיה",
    descriptionHe: "הפנייה נקלטה. כאן הסיכום ומספר הפנייה שלכם.",
    robots: "noindex,follow",
    ogImage: "auto",
    breadcrumb: [HOME],
  },
  {
    id: "P-19",
    path: "/summary",
    titleHe: "סיכום אירוע | מאמא מיה",
    descriptionHe: "הפרטים ששלחתם, כתפריט אחד שאפשר להעביר הלאה.",
    robots: "noindex,nofollow",
    ogImage: "auto",
    breadcrumb: [HOME],
  },
  {
    id: "P-20",
    path: "/unsubscribe",
    titleHe: "הסרה מרשימת הדיוור | מאמא מיה",
    descriptionHe: "הסרה מרשימת הדיוור השיווקי, בלחיצה אחת.",
    robots: "noindex,nofollow",
    ogImage: "auto",
    breadcrumb: [HOME],
  },
  {
    id: "P-21",
    path: "/privacy",
    titleHe: "מדיניות פרטיות | מאמא מיה",
    descriptionHe: "אילו פרטים נאספים בטופס, למה, לכמה זמן, ואיך מבקשים למחוק אותם.",
    robots: "index,follow",
    ogImage: "auto",
    breadcrumb: [HOME, { labelHe: "מדיניות פרטיות", path: "/privacy" }],
  },
  {
    id: "P-22",
    path: "/terms",
    titleHe: "תקנון ותנאי שימוש | מאמא מיה",
    descriptionHe: "התנאים שחלים על הזמנת קייטרינג ועל השימוש באתר.",
    robots: "index,follow",
    ogImage: "auto",
    breadcrumb: [HOME, { labelHe: "תקנון", path: "/terms" }],
  },
  {
    id: "P-23",
    path: "/accessibility",
    titleHe: "הצהרת נגישות | מאמא מיה",
    descriptionHe: "מה נגיש באתר היום, מה עדיין לא, ואיך מקבלים שירות בערוץ אחר.",
    robots: "index,follow",
    ogImage: "auto",
    breadcrumb: [HOME, { labelHe: "נגישות", path: "/accessibility" }],
  },
  {
    id: "P-24",
    path: "/admin/leads",
    titleHe: "לידים | ניהול",
    descriptionHe: "ממשק ניהול פנימי.",
    robots: "noindex,nofollow",
    ogImage: "auto",
    breadcrumb: [],
  },
  {
    id: "P-25",
    path: "/404",
    titleHe: "לא מצאנו את הדף הזה | מאמא מיה",
    descriptionHe: "הדף שחיפשתם לא קיים. אלה הדפים שכן.",
    robots: "noindex,follow",
    ogImage: "auto",
    breadcrumb: [HOME],
  },
];

/** הטבלה, לפי נתיב. פרמטריים (`/areas/:city`, `/lp/:campaign`) אינם כאן — §5.1. */
export const PAGE_META: Readonly<Record<string, PageMeta>> = Object.freeze(
  [...STATIC_META, ...branchMeta()].reduce<Record<string, PageMeta>>((acc, m) => {
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
 * פותר מטא לנתיב. **מחזיר `null` לנתיב לא מוכר** — כולל `/kitchens/{משהו}`
 * שאינו אחד משלושת הסניפים. `null` ⇒ 404, לא כותרת גנרית ולא קנוני
 * לדף שאינו קיים (spec 01 §5.1, prior-review E1).
 */
export function resolveMeta(pathname: string): PageMeta | null {
  return PAGE_META[normalizePath(pathname)] ?? null;
}

/** דף החגים בתוך חלון עונה: הכותרת נושאת את שם החג ואת השנה (§4 P-12). */
export function holidayMeta(seasonNameHe: string, now: Date = new Date()): PageMeta {
  const base = PAGE_META["/catering/holidays"];
  const year = currentYearInJerusalem(now);
  return {
    ...base,
    titleHe: `קייטרינג ל${seasonNameHe} ${year} | ${SITE_NAME_HE} — מטבח מסעדה איטלקית`,
    descriptionHe: `ארוחת ${seasonNameHe} מהמטבח של המסעדה, בהרצליה פיתוח, ברעננה ובפתח תקווה.`,
    breadcrumb: [
      HOME,
      CATERING,
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
    breadcrumb: [],
  };
}
