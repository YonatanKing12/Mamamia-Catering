/**
 * חיבור למסד הנתונים — אגנוסטי לספק.
 *
 * הגרסה הקודמת הייתה קשורה ל־@neondatabase/serverless (דרישה של רפליט)
 * וגם זרקה שגיאה בעליית התהליך אם DATABASE_URL חסר. שני הדברים תוקנו:
 *
 *  1. עובד מול כל Postgres — Neon, Supabase, Railway, RDS, או מקומי.
 *  2. בלי DATABASE_URL התהליך עולה בשקט ועובר לאחסון בזיכרון,
 *     כך ש־`npm run dev` עובד מיד אחרי clone בלי שום הגדרה.
 */

import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "@shared/schema";

const url = process.env.DATABASE_URL;

/** האם יש מסד נתונים מוגדר. משמש לבחירת מימוש האחסון. */
export const hasDatabase = Boolean(url);

/** ספקים מנוהלים דורשים TLS; מקומי לרוב לא. */
const needsSsl = Boolean(
  url && !/localhost|127\.0\.0\.1|(\?|&)sslmode=disable/.test(url),
);

export const pool = url
  ? new Pool({
      connectionString: url,
      ssl: needsSsl ? { rejectUnauthorized: false } : undefined,
      max: 10,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 10_000,
    })
  : null;

pool?.on("error", (err) => {
  console.error("[db] שגיאה בחיבור מהמאגר:", err.message);
});

export const db = pool ? drizzle(pool, { schema }) : null;

/** בדיקת חיים למסד — מוחזרת גם ב־/api/health. */
export async function pingDatabase(): Promise<boolean> {
  if (!pool) return false;
  try {
    await pool.query("select 1");
    return true;
  } catch {
    return false;
  }
}

export async function closeDatabase(): Promise<void> {
  await pool?.end();
}
