/**
 * ═══════════════════════════════════════════════════════════════════════
 *  KitchenNote — הבידול, במשפט אחד, בלשון יחיד.
 * ═══════════════════════════════════════════════════════════════════════
 *
 * spec 01 §3.1 סקשן 05, 00-spec-review A3, content/business.ts (המיצוב,
 * ‎30 ביולי 2026).
 *
 * ─── מה הבאנד הזה אומר, ומה הוא לא אומר ─────────────────────────
 * הוא אומר דבר אחד: **הקייטרינג מבושל במטבח של מסעדה פעילה** — מטבח
 * שמבשל לסועדים שיושבים בו, ולא מטבח שנפתח כדי לשרת אירועים. זה מה
 * שמפריד ממטבח רפאים ומקייטרינג ביתי, וזו העובדה היחידה שנמסרה.
 *
 * הוא **לא** אומר:
 *   · «שלושה מטבחים פעילים» או כל וריאציה. הגרסה הקודמת של האתר טענה
 *     את זה, זו הייתה הנחה ולא עובדה, והיא נמחקה. הבאנד הזה נכתב בלשון
 *     יחיד ואין בו מקום שאפשר לתלות בו ריבוי.
 *   · **איזו** מסעדה. `SLOTS.cateringKitchenBranch` הוא null, ולכן אין
 *     כאן שם סניף, אין עיר, ואין רשימת סניפים.
 *   · **קישור לעמוד סניף.** ‎`/kitchens` ו־`/kitchens/:slug` חסומים
 *     ב־`shared/routes.ts` (P-03, P-04, `enabled: false`), וקישור אליהם
 *     הוא 404. הקשר המותגי — שמות המסעדות — שייך ל־`BranchStrip`, שהוא
 *     באנד אחר עם שער משלו.
 *   · **דבר על כשרות.** ‎§7.17 קובע שמשפט הכשרות מרונדר במילותיו של
 *     הבעלים, במקום אחד בלבד, ולעולם לא ברוחב האתר. הבאנד הזה מופיע
 *     כמעט בכל מסלול, ולכן הוא בדיוק המקום שבו «ברוחב האתר» היה קורה.
 *   · **דבר על שעות.** אין כאן «כל יום» ואין «הערב»: `SLOTS.openingHours`
 *     ריק, וכל אחת מהמילים האלה היא טענה עליו.
 *
 * ─── השער ───────────────────────────────────────────────────────
 * ‎`COOKED_IN_ACTIVE_RESTAURANT_KITCHEN` מ־business.ts. אם העובדה הזאת
 * תיסוג אי פעם — הבאנד נעלם מכל חמישה־עשר העמודים בשינוי של תו אחד,
 * ואין משפט שנשאר תלוי בקוד של עמוד כלשהו.
 *
 * ─── למה זה נראה כך ─────────────────────────────────────────────
 * באנד דק, קו כותר של 2px בדיו (§3.4 טכניקה 1), כותרת קצרה ומשפט אחד.
 * בלי אייקון, בלי תג, בלי חותמת ובלי צילום — סמל אמון מצויר הוא בדיוק
 * הרג׳יסטר שהתדריך פוסל, והוא גם מה שהופך טענה נכונה לטענה שנראית
 * מומצאת. שורה טיפוגרפית אחת מעל קו נקראת כהצהרה של מסעדה.
 */

import * as React from "react";
import { cn } from "@/lib/utils";
import { Prose } from "@/components/primitives";
import { COOKED_IN_ACTIVE_RESTAURANT_KITCHEN } from "@/content/business";
import { BandSection, type BandTone } from "./section";

/**
 * נוסח הבית. יחיד, בלי עיר, בלי שעה ובלי כשרות — ראו הרשימה למעלה.
 * עמוד רשאי להעביר נוסח משלו, אך לא להרחיב את הטענה.
 */
export const KITCHEN_NOTE_TITLE_HE = "מטבח של מסעדה, לא מטבח ייצור";

export const KITCHEN_NOTE_STATEMENT_HE =
"הקייטרינג מבושל במטבח של מסעדה פעילה — מטבח שמבשל לסועדים שיושבים בו, " +
"ולא מטבח שנפתח כדי לשרת אירועים.";

export interface KitchenNoteProps {
  id?: string;
  /** הספרה הסידורית. נקבעת בעמוד לפי מיקום (§3.1), לא כאן. */
  num?: string;
  eyebrow?: React.ReactNode;
  /** ברירת מחדל: `KITCHEN_NOTE_TITLE_HE`. */
  title?: React.ReactNode;
  /** ברירת מחדל: `KITCHEN_NOTE_STATEMENT_HE`. */
  statementHe?: React.ReactNode;

  /**
   * הרחבה של פסקה אחת — מה שהעמוד רוצה להוסיף בהקשר שלו. תמיד `null`
   * במצב ההשקה, כי אין עובדה נוספת שנמסרה.
   */
  bodyHe?: React.ReactNode | null;

  /**
   * שורות «מה זה אומר בפועל», אם ורק אם הן עובדות שנמסרו. מערך ריק
   * ⇒ אין רשימה. אל תמלאו את זה בניסוחים שנשמעים נכון.
   */
  pointsHe?: readonly string[] | null;

  tone?: BandTone;
  /** ברירת המחדל היא הצורה הדקה. הבאנד אינו סקשן תוכן. */
  tight?: boolean;
  /** קו הכותר בדיו. כבו אותו כשהבאנד יושב מיד אחרי קו אחר. */
  rule?: boolean;
  className?: string;
  /** תוכן נוסף מתחת למשפט — פקד, קישור, מה שהעמוד מוסיף. */
  children?: React.ReactNode;
}

export function KitchenNote({
  id = "kitchen",
  num,
  eyebrow,
  title = KITCHEN_NOTE_TITLE_HE,
  statementHe = KITCHEN_NOTE_STATEMENT_HE,
  bodyHe = null,
  pointsHe = null,
  tone = "alt",
  tight = true,
  rule = true,
  className,
  children,
}: KitchenNoteProps) {
  /* השער היחיד. עובדה שנסוגה מוחקת את הבאנד מכל מסלול בבת אחת. */
  if (!COOKED_IN_ACTIVE_RESTAURANT_KITCHEN) return null;
  if (!statementHe && !title) return null;

  const points = (pointsHe ?? []).filter(Boolean);

  return (
    <BandSection
      id={id}
      num={num}
      eyebrow={eyebrow}
      title={title}
      /* המשפט הוא ה־lede של הסקשן: הוא נשען על SectionHeader ולא על
         פסקה נוספת, כדי שהמידה, הצבע והמרווח יהיו זהים לכל שאר האתר. */
      lede={statementHe}
      tone={tone}
      tight={tight}
      className={cn(rule && "rule-top", className)}
    >
      {bodyHe ? (
        <Prose size="body" measure="body" className="mt-6">
          <p>{bodyHe}</p>
        </Prose>
      ) : null}

      {points.length > 0 ? (
        <ul className="m-0 mt-7 list-none border-t border-solid border-t-[color:var(--rule)] p-0">
          {points.map((point, i) => (
            <li
              key={i}
              className="m-0 max-w-body border-b border-dotted border-b-[color:var(--rule)] py-[.7rem] text-sm text-fg-muted"
            >
              {point}
            </li>
          ))}
        </ul>
      ) : null}

      {children}
    </BandSection>
  );
}
