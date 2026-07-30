/**
 * ═══════════════════════════════════════════════════════════════════════
 *  <Head> — תגי הראש לכל מסלול, בלי תלות חיצונית.
 * ═══════════════════════════════════════════════════════════════════════
 *
 * spec 01 §5.1, INV-7, T-4.
 *
 * ─────────────────────────────────────────────────────────────────────
 *  למה כתיבה ישירה ל־DOM ולא react-helmet
 * ─────────────────────────────────────────────────────────────────────
 * helmet-async מוסיף ~6KB gzip, Provider בשורש, ו־API שלם — בשביל
 * עשרה תגים שכולם ידועים מראש. אפקט אחד שעושה adopt-or-create עושה את
 * אותו הדבר, נשאר קריא, ואינו מוסיף תלות שצריך לתחזק.
 *
 * ─────────────────────────────────────────────────────────────────────
 *  מה הקומפוננטה הזאת **אינה** פותרת — ואסור להתבלבל
 * ─────────────────────────────────────────────────────────────────────
 * זחלני התצוגה המקדימה של וואטסאפ ופייסבוק **אינם מריצים JavaScript**.
 * תג `og:` שנכתב כאן אינו קיים עבורם, וקישור שנשלח בוואטסאפ יופיע כ־URL
 * אפור. כל מכניקת ההפניה של הפרויקט תלויה בכרטיס הזה, ולכן אותם ערכים
 * חייבים להיות מוזרקים גם בשרת (`server/seo/head.ts`, spec 01 task 0.5)
 * מתוך אותה טבלה ב־`lib/seo.ts`.
 *
 * הקומפוננטה בנויה לחיות **לצד** ההזרקה מהשרת: היא מאמצת תגית קיימת
 * ומעדכנת אותה במקום, במקום לשכפל אותה. אין כפילות `og:title`, ואין
 * `<title>` כפול.
 *
 * ─────────────────────────────────────────────────────────────────────
 *  כללים
 * ─────────────────────────────────────────────────────────────────────
 *  · מופע אחד למסלול. שני מופעים ידרסו זה את זה — לפי סדר האפקטים.
 *  · הקנוני נגזר תמיד מ־`meta.path`, אף פעם לא מ־`window.location`
 *    (T-4: קנוני שמצביע על עצמו; פרמטרים של קמפיין לא נכנסים לקנוני).
 *  · `jsonLd` עובר `compact()` ואז `serializeJsonLd()`. צומת שהתרוקן
 *    אינו נפלט; מערך ריק ⇒ אין תגית `<script>` בכלל.
 */

import * as React from "react";
import {
  LOCALE,
  OG_AUTO_HEIGHT,
  OG_AUTO_WIDTH,
  SITE_NAME_HE,
  absoluteUrl,
  buildGraph,
  ogImagePath,
  serializeJsonLd,
  siteOrigin,
  type JsonLdNode,
  type PageMeta,
  type RobotsDirective,
} from "@/lib/seo";

export interface HeadProps {
  /** רשומת המטא של הדף. `null` ⇒ הקומפוננטה לא נוגעת בכלום. */
  meta: PageMeta | null;
  /** צמתי JSON-LD. `null` בתוך המערך מותר ומסונן — כך בונה מותנה נשאר קריא. */
  jsonLd?: Array<JsonLdNode | null | undefined>;
  /** דריסת רובוטס נקודתית (למשל `/summary` עם ref לא מוכר). */
  robots?: RobotsDirective;
  /** דריסת תמונת og (למשל תצלום אמיתי במקום הכרטיס שנוצר בבנייה). */
  ogImage?: string;
}

/* ═══════════════════ ניהול התגיות ═══════════════════ */

type Descriptor = {
  /** בורר ייחודי לתגית. הוא גם מפתח האימוץ מול הזרקת השרת. */
  selector: string;
  tag: "meta" | "link" | "script";
  /** תכונות מזהות, נכתבות רק כשהתגית נוצרת. */
  identity: Record<string, string>;
  /** התכונה שנושאת את הערך. `"textContent"` לתסריט JSON-LD. */
  valueAttr: string;
  value: string;
};

type Applied = { el: Element; created: boolean; valueAttr: string; previous: string | null };

function readValue(el: Element, valueAttr: string): string | null {
  return valueAttr === "textContent" ? el.textContent : el.getAttribute(valueAttr);
}

function writeValue(el: Element, valueAttr: string, value: string): void {
  if (valueAttr === "textContent") el.textContent = value;
  else el.setAttribute(valueAttr, value);
}

function applyDescriptor(d: Descriptor): Applied {
  const head = document.head;
  const existing = head.querySelector(d.selector);
  if (existing) {
    const previous = readValue(existing, d.valueAttr);
    writeValue(existing, d.valueAttr, d.value);
    return { el: existing, created: false, valueAttr: d.valueAttr, previous };
  }
  const el = document.createElement(d.tag);
  for (const [k, v] of Object.entries(d.identity)) el.setAttribute(k, v);
  writeValue(el, d.valueAttr, d.value);
  el.setAttribute("data-mm-head", "");
  head.appendChild(el);
  return { el, created: true, valueAttr: d.valueAttr, previous: null };
}

function revert(applied: Applied): void {
  if (applied.created) {
    applied.el.remove();
    return;
  }
  if (applied.previous === null) {
    if (applied.valueAttr === "textContent") applied.el.textContent = "";
    else applied.el.removeAttribute(applied.valueAttr);
  } else {
    writeValue(applied.el, applied.valueAttr, applied.previous);
  }
}

const metaName = (name: string, content: string): Descriptor => ({
  selector: `meta[name="${name}"]`,
  tag: "meta",
  identity: { name },
  valueAttr: "content",
  value: content,
});

const metaProperty = (property: string, content: string): Descriptor => ({
  selector: `meta[property="${property}"]`,
  tag: "meta",
  identity: { property },
  valueAttr: "content",
  value: content,
});

/* ═══════════════════ הקומפוננטה ═══════════════════ */

export function Head({ meta, jsonLd, robots, ogImage }: HeadProps): null {
  const origin = siteOrigin();

  // הסריאליזציה מתבצעת ברינדור (פונקציה טהורה) כדי שתלויות האפקט יהיו
  // מחרוזות בלבד — בלי השוואה עמוקה ובלי אפקט שרץ בכל רינדור.
  const canonical = meta ? absoluteUrl(meta.path, origin) : "";
  const image = meta ? absoluteUrl(ogImage ?? ogImagePath(meta), origin) : "";
  const isAutoCard = !!meta && !ogImage && meta.ogImage === "auto";
  const robotsValue: RobotsDirective = robots ?? meta?.robots ?? "index,follow";

  // הסריאליזציה טהורה וזולה, והתוצאה היא מחרוזת — תלות אפקט שמושווית
  // בערך. אין צורך ב־useMemo, ואין השוואה עמוקה על אובייקט `meta`
  // שנבנה מחדש בכל רינדור (holidayMeta / campaignMeta עושים בדיוק את זה).
  const ldString = serializeJsonLd(buildGraph(jsonLd ?? []));

  const hasMeta = meta !== null && meta !== undefined;
  const title = meta?.titleHe ?? "";
  const description = meta?.descriptionHe ?? "";

  React.useEffect(() => {
    if (typeof document === "undefined" || !hasMeta) return;

    const previousTitle = document.title;
    document.title = title;

    const descriptors: Descriptor[] = [
      metaName("description", description),
      metaName("robots", robotsValue),
      {
        selector: 'link[rel="canonical"]',
        tag: "link",
        identity: { rel: "canonical" },
        valueAttr: "href",
        value: canonical,
      },
      metaProperty("og:type", "website"),
      metaProperty("og:locale", LOCALE),
      metaProperty("og:site_name", SITE_NAME_HE),
      metaProperty("og:title", title),
      metaProperty("og:description", description),
      metaProperty("og:url", canonical),
      metaProperty("og:image", image),
      metaProperty("og:image:alt", title),
      metaName("twitter:card", "summary_large_image"),
      metaName("twitter:title", title),
      metaName("twitter:description", description),
      metaName("twitter:image", image),
    ];

    // ממדים נפלטים רק לכרטיס שנוצר בבנייה, שממדיו ידועים (spec 01 §5.6).
    // לתצלום אמיתי הממדים אינם ידועים כאן, ולכן אינם מוצהרים.
    if (isAutoCard) {
      descriptors.push(
        metaProperty("og:image:width", String(OG_AUTO_WIDTH)),
        metaProperty("og:image:height", String(OG_AUTO_HEIGHT)),
      );
    }

    // אין `jsonLd` ⇒ **לא נוגעים** בתסריט שהשרת הזריק. הוא הגרף הנכון
    // של אותו מסלול בדיוק, והוא זה שהזחלנים רואים. מסלול קודם מנוקה
    // ממילא ב־cleanup של האפקט שהזריק אותו.
    if (ldString) {
      descriptors.push({
        selector: 'script[type="application/ld+json"][data-mm-jsonld]',
        tag: "script",
        identity: { type: "application/ld+json", "data-mm-jsonld": "" },
        valueAttr: "textContent",
        value: ldString,
      });
    }

    const applied = descriptors.map(applyDescriptor);

    return () => {
      document.title = previousTitle;
      // בסדר הפוך, כדי שאימוץ מקונן ישוחזר נכון.
      for (let i = applied.length - 1; i >= 0; i -= 1) revert(applied[i]);
    };
  }, [
    hasMeta,
    title,
    description,
    canonical,
    image,
    isAutoCard,
    robotsValue,
    ldString,
  ]);

  return null;
}

export default Head;
