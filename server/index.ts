/**
 * נקודת הכניסה של השרת — מנותקת מרפליט ומוקשחת לפרודקשן.
 *
 * מה שונה מהגרסה שנוצרה ברפליט:
 *  · `reusePort: true` הוסר — האפשרות הזאת זורקת ENOTSUP על macOS ועל Windows,
 *    כלומר הפרויקט פשוט לא היה עולה מחוץ ללינוקס של רפליט.
 *  · פורט ברירת המחדל הוא 3000 ולא 5000, כי 5000 תפוס ב־macOS על ידי AirPlay.
 *  · `.env` נטען אוטומטית, כך שאין צורך ב־Secrets של רפליט.
 *  · כותרות אבטחה, הגבלת קצב על הטופס, וסגירה מסודרת בקבלת SIGTERM.
 *  · ה־error handler כבר לא זורק מחדש אחרי ששלח תשובה (הפיל את התהליך).
 */

import "dotenv/config";
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { storageKind, assertLeadParity } from "./storage";
import { closeDatabase, hasDatabase } from "./db";

const app = express();
const isProd = process.env.NODE_ENV === "production";

/* מאחורי פרוקסי של ספק אחסון — כדי ש־req.ip יהיה אמיתי ולא של הפרוקסי */
app.set("trust proxy", 1);
app.disable("x-powered-by");

app.use(express.json({ limit: "64kb" }));
app.use(express.urlencoded({ extended: false, limit: "64kb" }));

/* ───────────── כותרות אבטחה ───────────── */
app.use((_req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "geolocation=(), microphone=(), camera=()");
  if (isProd) {
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  }
  next();
});

/* ───────────── לוג בקשות API ───────────── */
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;

  res.on("finish", () => {
    if (!path.startsWith("/api")) return;
    const ms = Date.now() - start;
    /* גוף התשובה לא נרשם ביומן: הוא מכיל שם וטלפון של לקוחות */
    log(`${req.method} ${path} ${res.statusCode} in ${ms}ms`);
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  /* מטפל שגיאות — אחרי כל הנתיבים, ובלי לזרוק מחדש */
  app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    log(`שגיאה ב־${req.method} ${req.path}: ${err?.message ?? err}`, "error");
    if (!isProd && err?.stack) console.error(err.stack);
    if (res.headersSent) return;
    res.status(status).json({
      success: false,
      /* בפרודקשן לא מדליפים פרטי שגיאה פנימיים */
      error: isProd && status === 500 ? "שגיאת שרת" : err.message || "שגיאת שרת",
    });
  });

  const port = parseInt(process.env.PORT || "3000", 10);
  const host = process.env.HOST || "0.0.0.0";

  /* עמודה שנוספה לסכימה בלי שורה מקבילה ב־MemoryStorage תתגלה כאן,
     ולא בעוד חודש כשמסתכלים על נתוני ייחוס חסרים בפרודקשן */
  const missing = await assertLeadParity();
  if (missing.length) {
    log(`אזהרה: MemoryStorage לא כותב ${missing.length} עמודות: ${missing.join(", ")}`, "error");
  }

  server.listen(port, host, () => {
    log(`השרת עלה על פורט ${port}`);
    log(`אחסון: ${storageKind}`);
    if (!hasDatabase) {
      log(
        isProd
          ? "אזהרה: אין DATABASE_URL בפרודקשן — לידים יישמרו בזיכרון ויימחקו בכל restart"
          : "אין DATABASE_URL — עובד בזיכרון. תקין לפיתוח.",
        isProd ? "error" : "express",
      );
    }
  });

  /* ───────────── סגירה מסודרת ───────────── */
  const shutdown = async (signal: string) => {
    log(`התקבל ${signal}, נסגר בצורה מסודרת…`);
    server.close(async () => {
      await closeDatabase();
      process.exit(0);
    });
    /* אם חיבורים פתוחים לא נסגרים — יוצאים בכל מקרה */
    setTimeout(() => process.exit(1), 10_000).unref();
  };

  process.on("SIGTERM", () => void shutdown("SIGTERM"));
  process.on("SIGINT", () => void shutdown("SIGINT"));
  process.on("unhandledRejection", (reason) => {
    log(`Unhandled rejection: ${reason}`, "error");
  });
})();
