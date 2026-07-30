/**
 * QuoteProgress — spec 02 §3.1, spec 03 §7.24.
 *
 * שני כללים נושאים כאן את כל המשקל:
 *
 *  1. **המילוי גדל מהקצה הפותח.** בעברית זהו הצד הימני. הפס הוא ילד
 *     בזרימה רגילה שרוחבו באחוזים, ולא `transform:scaleX` — סקייל מ־origin
 *     שמאלי מתמלא לאחור ונקרא כנסיגה. אין כאן שום left/right.
 *
 *  2. **צעדים בדידים, לעולם לא אחוזים בטקסט.** «שאלה 2 מתוך 4» הוא מידע;
 *     «40%» הוא רעש. הטקסט הוא `aria-live="polite"` והוא ההכרזה שקורא
 *     המסך שומע בכל מעבר שלב.
 */

import * as React from "react";
import { cn } from "@/lib/utils";
import { QUESTION_COUNT, STEP_COUNT, type StepNumber } from "./quote-config";

export interface QuoteProgressProps {
  step: StepNumber;
  className?: string;
}

export function QuoteProgress({ step, className }: QuoteProgressProps) {
  const pct = Math.round((step / STEP_COUNT) * 100);
  const label =
    step === STEP_COUNT ? "פרטים ליצירת קשר" : `שאלה ${step} מתוך ${QUESTION_COUNT}`;

  return (
    <div className={cn("mb-8", className)}>
      <div
        className="h-[2px] overflow-hidden rounded-pill bg-rule"
        role="progressbar"
        /* בלי שם נגיש קורא־מסך מכריז «progressbar» בלבד — WCAG 4.1.2 */
        aria-label="התקדמות בקבלת הצעה"
        aria-valuemin={1}
        aria-valuemax={STEP_COUNT}
        aria-valuenow={step}
        aria-valuetext={label}
      >
        <i
          aria-hidden="true"
          className="block h-full bg-accent transition-[width] duration-slow ease-house motion-reduce:transition-none"
          style={{ width: `${pct}%` }}
        />
      </div>

      <p
        aria-live="polite"
        className="mt-[.7rem] font-sans text-3xs font-semibold tracking-[.09em] text-fg-subtle"
      >
        {label}
      </p>
    </div>
  );
}
