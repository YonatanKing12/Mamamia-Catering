/**
 * ═══════════════════════════════════════════════════════════════════════
 *  FaqBand — «שאלות שנשאלות בטלפון».
 * ═══════════════════════════════════════════════════════════════════════
 *
 * spec 03 §7.16, spec 01 §3.1 סקשן 07.
 *
 * ─── הכלל שקובע מה נכנס ─────────────────────────────────────────
 * **שאלה שאין לה תשובה אינה שאלה — היא הודאה שאין לנו תשובה.**
 * פריט בלי `answer` מלא לא מרונדר. אקורדיון של שאלות שאי אפשר לענות
 * עליהן גרוע מ־FAQ קצר: הוא מפרסם בדיוק את העובדות שהעסק טרם סגר.
 * אין ולו פריט אחד עם תשובה ⇒ אין סקשן, כותרת כלולה.
 *
 * ─── למה <details> ולא אקורדיון ב־JS ────────────────────────────
 * ‎§7.16 ממליץ על Radix. כאן נבחר `<details>/<summary>` המקורי, משלוש
 * סיבות שכולן נמדדות:
 *
 *   · הוא עובד **בלי JavaScript**. ב־HEAD אין `useReveal`, המסלולים
 *     נטענים ב־React.lazy בלי גבול שגיאה (00-spec-review D2, E1), וכשל
 *     טעינת chunk באתר לידים משאיר עמוד לבן. FAQ שנפתח בלי JS הוא
 *     התוכן היחיד שנשאר במצב הזה.
 *   · הוא מגיע עם `aria-expanded`, ניהול מקלדת ו־Ctrl+F שמוצא טקסט
 *     בתוך פאנל סגור — האחרון הוא התנהגות שאקורדיון ב־JS מאבד.
 *   · אין `max-height` קסום. `index.css:225` הישן חתך פאנלים ב־500px
 *     בשקט; לגובה מקורי אין תקרה.
 *
 * ─── הצ'בון ─────────────────────────────────────────────────────
 * שני גבולות מסובבים ב־1.6px (§7.16), לא אייקון־פונט ולא SVG מספרייה.
 * ‎`aria-hidden`, ומסתובב ב־open. מרכיב הגבול הוא inline-end — כלומר הוא
 * מתהפך לבד ב־RTL בלי שום קוד.
 *
 * ─── JSON-LD ────────────────────────────────────────────────────
 * ‎`FAQPage` נבנה בעמוד, מ־`answeredFaqs(items)` — אותה סינון בדיוק.
 * כך אי אפשר לפלוט שאלה למנוע חיפוש ולא להציג אותה למבקר, או להפך.
 */

import * as React from "react";
import { cn } from "@/lib/utils";
import { BandSection, type BandTone } from "./section";

export interface FaqItem {
  /** מפתח יציב לעוגן ול־JSON-LD. */
  id?: string;
  questionHe: string;
  /** `null` ⇒ הפריט לא מרונדר. */
  answerHe?: React.ReactNode | null;
}

/**
 * הפריטים שיש להם גם שאלה וגם תשובה. מיוצא כדי שבניית ה־JSON-LD בעמוד
 * תעבור דרך אותו שער בדיוק.
 */
export function answeredFaqs(items: readonly FaqItem[]): FaqItem[] {
  return items.filter(
    (item) =>
      Boolean(item.questionHe) &&
      item.answerHe !== null &&
      item.answerHe !== undefined &&
      item.answerHe !== "",
  );
}

export interface FaqBandProps {
  items: readonly FaqItem[];
  /** תקרה רכה — P-01 מגביל לשישה פריטים, P-03 לשלושה. */
  limit?: number;
  /** פותח את הראשון. כבוי כברירת מחדל: אקורדיון פתוח הוא רעש. */
  defaultOpenFirst?: boolean;

  id?: string;
  num?: string;
  eyebrow?: React.ReactNode;
  title?: React.ReactNode;
  lede?: React.ReactNode;
  tone?: BandTone;
  className?: string;
}

export function FaqBand({
  items,
  limit,
  defaultOpenFirst = false,
  id = "faq",
  num,
  eyebrow,
  title,
  lede,
  tone = "paper",
  className,
}: FaqBandProps) {
  const answered = answeredFaqs(items);
  const visible = limit && limit > 0 ? answered.slice(0, limit) : answered;

  if (visible.length === 0) return null;

  return (
    <BandSection
      id={id}
      num={num}
      eyebrow={eyebrow}
      title={title}
      lede={lede}
      tone={tone}
      className={className}
    >
      <div className="border-t border-solid border-t-[color:var(--rule)]">
        {visible.map((item, i) => (
          <details
            key={item.id ?? `${item.questionHe}-${i}`}
            id={item.id}
            open={defaultOpenFirst && i === 0}
            className="qa group border-b border-solid border-b-[color:var(--rule)]"
          >
            <summary
              className={cn(
"flex cursor-pointer list-none items-baseline justify-between gap-4",
"min-h-[56px] py-[1.3rem] text-start font-serif text-lg font-medium",
"hover:text-accent [&::-webkit-details-marker]:hidden",
              )}
            >
              <span>{item.questionHe}</span>
              {/* שני גבולות מסובבים — §7.16. inline-end מתהפך לבד ב־RTL. */}
              <span
                aria-hidden="true"
                className={cn(
"mt-[.45em] h-[9px] w-[9px] shrink-0 rotate-45",
"border-b-chev border-e-chev border-solid border-b-[color:var(--accent)] border-e-[color:var(--accent)]",
"transition-transform duration-slow ease-house",
"group-open:rotate-[-135deg]",
                )}
              />
            </summary>

            <div className="max-w-answer pb-[1.4rem] text-sm text-fg-muted">
              {typeof item.answerHe === "string" ? <p className="m-0">{item.answerHe}</p> : item.answerHe}
            </div>
          </details>
        ))}
      </div>
    </BandSection>
  );
}
