/**
 * ═══════════════════════════════════════════════════════════════════════
 *  ‏/sitemap.xml ו־/robots.txt — נגזרים מ־`shared/routes.ts`, לא נכתבים ביד.
 * ═══════════════════════════════════════════════════════════════════════
 *
 * spec 01 §5.1, INV-8. `shared/routes.ts` הוא מקור האמת היחיד לשני
 * הקבצים: `sitemapPaths()` פולט את הכתובות שמוגשות **וגם** אינדקסביליות
 * ‏**וגם** מסומנות `inSitemap`, ו־`robotsDisallow()` פולט את התחיליות של
 * המסלולים ש־`indexable: false`. אין כאן ולו נתיב אחד כתוב ידנית.
 *
 * המשמעות: מסלול חדש שנפתח נכנס ל־sitemap באותו שינוי שבו `enabled`
 * מתהפך, ומסלול `noindex` חדש נחסם ב־robots בלי שאיש יזכור לעדכן קובץ שני.
 *
 * ─────────────────────────────────────────────────────────────────────
 *  למה robots.txt מוגש מכאן ולא רק מ־`client/public`
 * ─────────────────────────────────────────────────────────────────────
 * שורת `Sitemap:` חייבת להיות **כתובת מוחלטת** כדי שזחלן יקרא אותה, ואת
 * הדומיין אין לנו בזמן הבנייה — הוא תלוי איפה האתר מוגש. קובץ סטטי אינו
 * יכול לייצר אותה, וכתובת מומצאת היא בדיוק סוג ההמצאה שחוק 1 אוסר.
 * לכן: `client/public/robots.txt` נשאר כגיבוי לאירוח סטטי בלבד, וכשהשרת
 * רץ הנתיב הזה גובר עליו ונושא את הכתובת המלאה.
 *
 * שני הנתיבים נרשמים לפני `setupVite`/`serveStatic` (הם נקראים אחרי
 * `registerRoutes` ב־`server/index.ts`), ולכן הם קודמים לקובץ הסטטי ואין
 * צורך לגעת בסדר.
 *
 * ─────────────────────────────────────────────────────────────────────
 *  ה־origin
 * ─────────────────────────────────────────────────────────────────────
 * ‏`SITE_ORIGIN` אם הוגדר; אחרת הוא נגזר מכותרות הבקשה (`x-forwarded-proto`
 * ו־`host` — האפליקציה כבר עם `trust proxy`). זו **אינה עובדה עסקית** אלא
 * היכן שהדף יושב, בדיוק כמו `siteOrigin()` בצד הלקוח, ולכן מותר לגזור
 * אותה מהסביבה. אין דומיין קשיח בקובץ הזה.
 *
 * בלי `Host` ובלי משתנה סביבה אי אפשר לפלוט `<loc>` חוקי — sitemap דורש
 * כתובות מוחלטות — ולכן מוחזר 503 ולא XML פגום.
 *
 * ─────────────────────────────────────────────────────────────────────
 *  מה **אין** ב־sitemap, במכוון
 * ─────────────────────────────────────────────────────────────────────
 *  · ‎`lastmod` — אין לנו תאריך שינוי אמיתי לאף עמוד. חותמת של זמן עליית
 *    השרת היא שקר שמלמד את הזחלן להתעלם מהשדה.
 *  · ‎`changefreq` ו־`priority` — גוגל מתעלם משניהם מאז 2023.
 */

import type { Express, Request, Response } from "express";
import { sitemapPaths, robotsDisallow } from "@shared/routes";
import { aiCrawlerPolicy } from "./geo";

/* ═════════════════ origin ═════════════════ */

const trimOrigin = (value: string): string => value.trim().replace(/\/+$/, "");

const firstHeader = (raw: string | string[] | undefined): string => {
  const value = Array.isArray(raw) ? raw[0] : raw;
  return typeof value === "string" ? value.split(",")[0].trim() : "";
};

/** מחזיר `https://host` או מחרוזת ריקה אם אי אפשר לדעת. */
export function originFor(req: Request): string {
  const fromEnv = process.env.SITE_ORIGIN ?? process.env.VITE_SITE_ORIGIN;
  if (typeof fromEnv === "string" && fromEnv.trim() !== "") return trimOrigin(fromEnv);

  const host = firstHeader(req.headers["x-forwarded-host"]) || firstHeader(req.headers.host);
  if (!host) return "";

  const proto = firstHeader(req.headers["x-forwarded-proto"]) || req.protocol || "https";
  return trimOrigin(`${proto}://${host}`);
}

/* ═════════════════ sitemap.xml ═════════════════ */

/** ‏`&` ו־`<` אינם יכולים להופיע ב־slug היום, אבל XML לא נסמך על «היום». */
const xmlEscape = (value: string): string =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

export function sitemapXml(origin: string): string {
  const urls = sitemapPaths()
    .map(({ path }) => `  <url><loc>${xmlEscape(`${origin}${path}`)}</loc></url>`)
    .join("\n");

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    urls,
    "</urlset>",
    "",
  ].join("\n");
}

/* ═════════════════ robots.txt ═════════════════ */

/**
 * תחיליות חסומות. `robotsDisallow()` פולט `/admin/leads`; כאן מוסיפים
 * ‎`/admin` (כל נתיב ניהול עתידי, ולא רק זה שקיים) ו־`/api/` (נקודות קצה,
 * לא עמודים), ואז מסירים תחילית שכבר מכוסה בידי תחילית קצרה ממנה —
 * ‎`Disallow: /admin` הופך את `/admin/leads` למיותר ורועש.
 */
function disallowPrefixes(): string[] {
  const all = new Set<string>([...robotsDisallow(), "/admin", "/api/"]);
  const kept = [...all].filter(
    (prefix) =>
      ![...all].some((other) => other !== prefix && prefix.startsWith(other)),
  );
  return kept.sort();
}

export function robotsTxt(origin: string): string {
  /*
   * מתג חסימה גורף לפריסות תצוגה מקדימה.
   *
   * האתר מייצג עסק אמיתי, ובמצב הנוכחי חסרים בו מנות, מחירים ונוסח כשרות
   * מדויק. אינדוקס של גרסה חלקית יוצר תוצאות שנשארות בגוגל חודשים אחרי
   * שהתוכן הושלם, ומחיקתן איטית בהרבה מיצירתן.
   *
   * ‏`SITE_NOINDEX=1` חוסם הכול. להסיר את המשתנה ביום שהתוכן שלם —
   * ולא לפני. שורת ה־Sitemap מושמטת גם היא: להצביע על מפת אתר ולחסום
   * את מה שבתוכה זו סתירה שזחלנים מפרשים לרעה.
   */
  if (process.env.SITE_NOINDEX === "1") {
    return [
      "# תצוגה מקדימה — SITE_NOINDEX=1. אין לאנדקס.",
      "",
      "User-agent: *",
      "Disallow: /",
      "",
    ].join("\n");
  }

  const lines = [
    "# נגזר מ־shared/routes.ts. אין לערוך ביד.",
    "",
    "User-agent: *",
    "Allow: /",
    ...disallowPrefixes().map((prefix) => `Disallow: ${prefix}`),
  ];

  /* ‏קבוצות זחלני מנועי התשובות. `robots.txt` אינו מצטבר — זחלן ששמו נקוב
     מתעלם לגמרי מקבוצת `*` — ולכן `aiCrawlerPolicy` חוזרת על מלוא ה־
     Disallow בכל קבוצה, ומקבלת את הרשימה מכאן ולא מחשבת אותה שוב. */
  lines.push(...aiCrawlerPolicy({ disallow: disallowPrefixes(), origin }));

  /* בלי origin אין שורת Sitemap: שורה יחסית אינה נקראת בידי אף זחלן,
     והשמטתה עדיפה — /sitemap.xml נבדק ממילא בכתובת המוסכמת. */
  if (origin) lines.push("", `Sitemap: ${origin}/sitemap.xml`);

  return `${lines.join("\n")}\n`;
}

/* ═════════════════ הרכבה ═════════════════ */

/**
 * מרכיב את שני הנתיבים. שורת ההרכבה ב־`server/routes.ts`, בתוך
 * `registerRoutes` ולפני ההחזרה:
 *
 * ```ts
 * import { registerSeoRoutes } from "./sitemap";
 * registerSeoRoutes(app);
 * ```
 */
export function registerSeoRoutes(app: Express): void {
  app.get("/sitemap.xml", (req: Request, res: Response) => {
    const origin = originFor(req);
    if (!origin) {
      res.status(503).type("text/plain; charset=utf-8").send("sitemap unavailable: unknown origin\n");
      return;
    }
    res
      .status(200)
      .type("application/xml; charset=utf-8")
      .set("Cache-Control", "public, max-age=3600")
      .send(sitemapXml(origin));
  });

  app.get("/robots.txt", (req: Request, res: Response) => {
    res
      .status(200)
      .type("text/plain; charset=utf-8")
      .set("Cache-Control", "public, max-age=3600")
      .send(robotsTxt(originFor(req)));
  });
}
