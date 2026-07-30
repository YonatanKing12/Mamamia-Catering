/**
 * הזרעת מסד הנתונים.
 *
 * הגרסה שנוצרה ברפליט הזריעה המלצות בשמות אנשים שלא קיימים ("שרה כהן",
 * דירוג 5), פוסטי בלוג ופריטי גלריה — כולם מומצאים. על אתר של עסק אמיתי
 * אלה ביקורות כזב: הטעיית צרכן לפי חוק הגנת הצרכן, וגם הדרך הקצרה ביותר
 * לאבד אמון של לקוח שיגלה. התוכן הומצא הוסר.
 *
 * במקומו: הסקריפט קורא תוכן אמיתי מ־content/seed.json אם הקובץ קיים.
 * אין קובץ — לא מוזרק כלום, וזה המצב התקין.
 *
 *   npx tsx server/seed.ts
 *
 * המלצות מותר להזריק רק אחרי שהלקוח אישר במפורש שימוש בשמו.
 */

import "dotenv/config";
import fs from "fs";
import path from "path";
import { z } from "zod";
import { db, hasDatabase, closeDatabase } from "./db";
import { blogPosts, testimonials, galleryItems } from "@shared/schema";

const SEED_FILE = path.resolve(process.cwd(), "content", "seed.json");

const seedSchema = z.object({
  testimonials: z
    .array(
      z.object({
        name: z.string().min(1),
        eventType: z.string().min(1),
        rating: z.number().int().min(1).max(5),
        content: z.string().min(1),
        imageUrl: z.string().optional(),
        eventDate: z.string().optional(),
        featured: z.boolean().optional(),
        /* חובה מפורשת: בלי אישור הלקוח ההמלצה לא נכנסת */
        consentGiven: z.literal(true, {
          errorMap: () => ({
            message: 'consentGiven חייב להיות true — אישור הלקוח לשימוש בשמו',
          }),
        }),
      }),
    )
    .default([]),
  blogPosts: z
    .array(
      z.object({
        title: z.string().min(1),
        slug: z.string().min(1),
        excerpt: z.string().min(1),
        content: z.string().min(1),
        imageUrl: z.string().optional(),
        category: z.string().min(1),
        tags: z.array(z.string()).optional(),
      }),
    )
    .default([]),
  galleryItems: z
    .array(
      z.object({
        title: z.string().min(1),
        description: z.string().optional(),
        imageUrl: z.string().min(1),
        category: z.string().min(1),
        eventType: z.string().optional(),
        featured: z.boolean().optional(),
      }),
    )
    .default([]),
});

async function seedDatabase() {
  if (!hasDatabase || !db) {
    console.error("✖ אין DATABASE_URL. הגדירו אותו ב־.env לפני הזרעה.");
    process.exit(1);
  }

  if (!fs.existsSync(SEED_FILE)) {
    console.log("ℹ אין content/seed.json — לא הוזרק תוכן. זה המצב התקין.");
    console.log("  צרו את הקובץ עם תוכן אמיתי בלבד. המבנה:");
    console.log(
      JSON.stringify(
        {
          testimonials: [
            {
              name: "שם הלקוח כפי שאישר",
              eventType: "סוג האירוע",
              rating: 5,
              content: "מה הלקוח כתב, כלשונו",
              eventDate: "2026-05",
              featured: true,
              consentGiven: true,
            },
          ],
          blogPosts: [],
          galleryItems: [],
        },
        null,
        2,
      ),
    );
    return;
  }

  const parsed = seedSchema.parse(JSON.parse(fs.readFileSync(SEED_FILE, "utf8")));

  if (parsed.testimonials.length) {
    /* consentGiven אינו עמודה בטבלה — הוא שער כניסה בלבד */
    const rows = parsed.testimonials.map(({ consentGiven, ...t }) => t);
    await db.insert(testimonials).values(rows);
    console.log(`✓ ${rows.length} המלצות`);
  }

  if (parsed.blogPosts.length) {
    await db.insert(blogPosts).values(parsed.blogPosts);
    console.log(`✓ ${parsed.blogPosts.length} פוסטים`);
  }

  if (parsed.galleryItems.length) {
    await db.insert(galleryItems).values(parsed.galleryItems);
    console.log(`✓ ${parsed.galleryItems.length} פריטי גלריה`);
  }

  console.log("✅ ההזרעה הושלמה.");
}

seedDatabase()
  .then(async () => {
    await closeDatabase();
    process.exit(0);
  })
  .catch(async (error) => {
    console.error("✖ ההזרעה נכשלה:", error instanceof z.ZodError ? error.issues : error);
    await closeDatabase();
    process.exit(1);
  });

export { seedDatabase };
