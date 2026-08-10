/**
 * ═══════════════════════════════════════════════════════════════════════
 *  KashrutBadge — נוסח הכשרות, כלשונו, ולא מילה מעבר.
 * ═══════════════════════════════════════════════════════════════════════
 *
 * זו ההצהרה בעלת הסיכון הגבוה ביותר באתר. לכן הקומפוננטה הזאת אינה
 * מנסחת דבר — היא **מצטטת** מחרוזת שנמסרה, או שאינה מרונדרת.
 *
 * ─────────────────────────────────────────────────────────────────────
 *  שני דברים שהקומפוננטה הזאת לא תעשה לעולם
 * ─────────────────────────────────────────────────────────────────────
 *
 *  1. **לא תנקוב בגוף מכשיר מסוים.** מה שנמסר הוא «כשר בד״ץ», ו־«בד״ץ»
 *     אינו גוף אחד: העדה החרדית, בית יוסף, מהדרין, חת״ם סופר ואחרים.
 *     ההבדל ביניהם הוא כל ההחלטה עבור לקוח שומר כשרות, והוא גם ההבדל
 *     בין הצהרה נכונה להטעיה. שם הגוף המלא הוא `TODO(owner)` פתוח
 *     ב־`business.ts`; **השלמה שלו כאן, בכל ניסוח, היא המצאת עובדה.**
 *     גם «למהדרין», «בהשגחת» או «מהדרין מן המהדרין» הם המצאה — הם לא
 *     נמסרו.
 *
 *  2. **לא תיצור תעודה חזותית.** אין חותם, אין אייקון תעודה, אין
 *     מסגרת שנראית כמו הכשר סרוק. תג שנראה כמו מסמך רשמי טוען למעמד
 *     שאין לנו הוכחה עליו. מה שיש כאן הוא שורת טקסט מסומנת בצבע
 *     המבטא, ותו לא.
 *
 * ─────────────────────────────────────────────────────────────────────
 *  מאיפה מגיע הנוסח, ולמה בסדר הזה
 * ─────────────────────────────────────────────────────────────────────
 *  א. `kashrutStatement()` מ־`content/locations.ts` — הנוסח **בכתב**,
 *     כולל שם הגוף המלא. `null` היום. כשיגיע, הוא גובר על הכול.
 *  ב. `SLOTS.kashrutByBranch` מ־`content/business.ts` — התשובה שנמסרה
 *     בעל־פה, «כשרות בד״ץ לכולן», שהלקוח אישר שחלה גם על מערך הקייטרינג.
 *
 * ואם השלוש אינן זהות במילה — **אין תג**. הסיבה היא המיצוב, לא הידור:
 * הקייטרינג מבושל במטבח של **אחת** מהמסעדות, ואיזו — לא נמסר
 * (`SLOTS.cateringKitchenBranch === null`). כשכל השלוש נושאות בדיוק
 * אותו נוסח, הנוסח של המטבח המבשל ידוע בלי לדעת מיהו. ברגע שהן נבדלות,
 * הצגת אחת מהן כנוסח הקייטרינג היא ניחוש שנראה כמו נתון — ולכן
 * `kashrutWording()` מחזירה `null` ולא בוחרת.
 *
 * ─────────────────────────────────────────────────────────────────────
 *  השער של דפי האירועים אינו כאן
 * ─────────────────────────────────────────────────────────────────────
 * spec 01 P-10 אוסר את המילה «כשר» בכל הטיה בדף בר המצווה כל עוד אין
 * נוסח **בכתב**, ו־P-11 חוסם את דף השבעה כולו על אותה דרישה. השערים
 * האלה נאכפים בדף (`gateBlockers` ב־`content/occasions.ts`), ולא כאן.
 * דף שנמצא תחת השער פשוט אינו מרנדר את הקומפוננטה; מי שרוצה לאכוף את
 * זה בקוד מעביר `requireWritten` והתג ייעלם עד שהנוסח בכתב יגיע.
 */

import * as React from "react";
import { cn } from "@/lib/utils";
import { BRANCHES, SLOTS, filled } from "@/content/business";
import { kashrutStatement } from "@/content/locations";

/**
 * הנוסח המוצג, או `null`. מיוצא כי גם `lib/seo.ts` וגם דפים צריכים את
 * אותה תשובה בדיוק, ושתי גרסאות של הכלל הזה יתפצלו תוך חודש.
 *
 * `requireWritten` — לדפים שתחת שער P-10 / P-11.
 */
export function kashrutWording({ requireWritten = false } = {}): string | null {
  const written = kashrutStatement();
  if (filled(written)) return written.trim();
  if (requireWritten) return null;

  const byBranch = SLOTS.kashrutByBranch;
  if (!filled(byBranch)) return null;

  const values = BRANCHES.map((b) => byBranch[b.id]).filter(
    (v): v is string => typeof v === "string" && v.trim().length > 0,
  );

  /* חסרה ולו מסעדה אחת ⇒ אין תשובה גורפת, ולכן אין תג. */
  if (values.length !== BRANCHES.length) return null;

  const unique = new Set(values.map((v) => v.trim()));
  if (unique.size !== 1) return null;

  return values[0].trim();
}

export const hasKashrutWording = (opts?: { requireWritten?: boolean }): boolean =>
  kashrutWording(opts) !== null;

export type KashrutBadgeVariant = "pill" | "line";

export interface KashrutBadgeProps extends React.HTMLAttributes<HTMLElement> {
  /**
   * `pill` — גלולה עם מסגרת ענבר. לשימוש בהירו, ליד CTA, בכותרת כרטיס.
   * `line` — שורת טקסט עם נקודת ענבר. לרשימות עובדות ולפוטר.
   */
  variant?: KashrutBadgeVariant;
  /**
   * `true` בדפים שתחת שער הכשרות בכתב (spec 01 P-10, P-11). בהיעדר נוסח
   * בכתב התג נעלם לגמרי, ולא נופל אחורה לנוסח שנמסר בעל־פה.
   */
  requireWritten?: boolean;
  /** גודל הטקסט. הסקאלה מרוסנת (04 §3) — אין כאן וריאנט גדול. */
  size?: "sm" | "xs";
}

export function KashrutBadge({
  variant = "pill",
  requireWritten = false,
  size = "xs",
  className,
...rest
}: KashrutBadgeProps) {
  const wording = kashrutWording({ requireWritten });

  /* המצב הרגיל כשאין נוסח: אין אלמנט, אין מרווח, אין מקום שמור. */
  if (!wording) return null;

  const text = size === "sm" ? "text-sm" : "text-xs";

  if (variant === "line") {
    return (
      <p
        className={cn(
"m-0 flex items-center gap-[.5rem] font-semibold leading-[1.5] text-fg",
          text,
          className,
        )}
        {...rest}
      >
        <span
          aria-hidden="true"
          className="inline-block h-[.42rem] w-[.42rem] shrink-0 rounded-pill bg-accent"
        />
        {wording}
      </p>
    );
  }

  return (
    <span
      className={cn(
        /* גלולה 50px (04 §4). מסגרת ענבר ולא מילוי ענבר: מילוי היה קורא
           כפקד לחיץ, וזו הצהרה ולא פעולה. */
"inline-flex max-w-full items-center gap-[.45rem] rounded-pill",
"border border-solid border-accent px-[.85rem] py-[.35rem]",
"font-semibold leading-[1.45] text-accent",
        text,
        className,
      )}
      {...rest}
    >
      <span
        aria-hidden="true"
        className="inline-block h-[.38rem] w-[.38rem] shrink-0 rounded-pill bg-accent"
      />
      {wording}
    </span>
  );
}
