import express, { type Express, type Request, type Response, type NextFunction } from "express";
import fs from "fs";
import path from "path";
import { createServer as createViteServer, createLogger } from "vite";
import { type Server } from "http";
import viteConfig from "../vite.config";
import { nanoid } from "nanoid";
import { httpStatusFor, redirectTarget } from "@shared/routes";

const viteLogger = createLogger();

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

/**
 * ═══════════════════════════════════════════════════════════════════════
 *  מעטפת ה־SPA — סטטוס אמיתי, לא 200 על הכול.
 * ═══════════════════════════════════════════════════════════════════════
 *
 * הגרסה הקודמת סיימה ב־`app.use("*")` שהחזיר את `index.html` עם 200 בשני
 * הענפים. כלומר `/no-such-page` ענה 200, וזחלן אינדקס אותו כדף אמיתי —
 * ‏soft 404. `shared/routes.ts` הוא מקור האמת היחיד לשאלה אילו כתובות
 * מוגשות, ולכן אין כאן רשימת מסלולים שנייה ואין מה שיסטה ממנה.
 *
 * שני מטפלים, בסדר הזה:
 *   1. ‎`redirectTarget` — 301 לצורה הקנונית (`/Menus/` → `/menus`), אך ורק
 *      כשהיעד מוגש היום. ה־query נשמר: פרמטרי ייחוס חייבים לשרוד.
 *   2. ‎`httpStatusFor` — 200 למסלול מוגש, 404 לכל השאר, כולל `/404` עצמה
 *      וכולל מסלול קיים ששערו סגור. גוף התשובה זהה בשני המקרים: אותה
 *      מעטפת SPA, שהראוטר בצד הלקוח כבר מפיל ל־`NotFound`.
 *
 * נכסים (`/assets/…`, פונטים, `favicon`) אינם עוברים כאן — `express.static`
 * קודם להם, ו־vite middlewares קודמות בפיתוח.
 */
function canonicalRedirect(req: Request, res: Response, next: NextFunction) {
  if (req.method !== "GET" && req.method !== "HEAD") return next();
  const target = redirectTarget(req.originalUrl);
  if (target && target !== req.originalUrl) {
    res.redirect(301, target);
    return;
  }
  next();
}

/**
 * הסטטוס שהמעטפת נשלחת איתו.
 *
 * ‏`originalUrl` ולא `path`: המטפל רשום כ־`app.use("*")`, ואקספרס מקצץ את
 * החלק שהותאם מ־`req.url` — כלומר `req.path` הוא `/` בכל בקשה שמגיעה לכאן.
 * ‏`httpStatusFor` מנרמל בעצמו ומסיר query ו־hash.
 */
export const shellStatus = (req: Request): 200 | 404 => httpStatusFor(req.originalUrl);

export async function setupVite(app: Express, server: Server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true as const,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      },
    },
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use(canonicalRedirect);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const clientTemplate = path.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html",
      );

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`,
      );
      const page = await vite.transformIndexHtml(url, template);
      res
        .status(shellStatus(req))
        .set({ "Content-Type": "text/html; charset=utf-8" })
        .end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  const distPath = path.resolve(import.meta.dirname, "public");

  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  /* נכסים עם hash בשם — קאש ארוך; index.html — לעולם לא. */
  app.use(
    express.static(distPath, {
      index: false,
      setHeaders: (res, filePath) => {
        if (filePath.endsWith(".html")) res.setHeader("Cache-Control", "no-cache");
      },
    }),
  );

  app.use(canonicalRedirect);

  /* מעטפת ה־SPA לכל השאר — עם הסטטוס האמיתי, לא 200 על הכול. */
  const shell = fs.readFileSync(path.resolve(distPath, "index.html"), "utf-8");

  app.use("*", (req, res) => {
    res
      .status(shellStatus(req))
      .set({ "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-cache" })
      .end(shell);
  });
}
