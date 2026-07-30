import "dotenv/config";
import { defineConfig } from "drizzle-kit";

/* הודעת שגיאה מפורשת עדיפה על קריסה סתמית בהרצת db:push */
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL חסר. העתיקו .env.example ל־.env והגדירו כתובת Postgres " +
      "לפני הרצת db:push. (השרת עצמו עולה גם בלי מסד — הוא עובר לאחסון בזיכרון.)",
  );
}

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: { url: process.env.DATABASE_URL },
});
