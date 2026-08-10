/**
 * BriefCard — spec 02 §3.1, spec 03 §7.25.
 *
 * כרטיס התפריט. הוא **לא** טבלת מפרט ולא חשבונית: מסמך שנראה כמו הצעת
 * מחיר מזמין משא ומתן על מחיר, ומסמך שנראה כמו תפריט מזמין אישור.
 *
 * הכרטיס גדל ככל שעונים — זו ההשקעה שהקונה רואה מצטברת מולו, וזה גם
 * המנגנון שתופס סוג אירוע שנזרע בטעות מקישור שהועבר הלאה: כל שורה
 * לחיצה וחוזרת למסך שלה.
 *
 * שורה בלי ערך פשוט אינה קיימת. כרטיס בלי אף ערך אינו מרונדר בכלל —
 * לא כמסגרת ריקה ולא כשלד עם קווים מקווקווים.
 */

import * as React from "react";
import { cn } from "@/lib/utils";
import { Num } from "@/components/primitives";
import {
  BRANCH_NAME,
  GUEST_BAND_DISPLAY,
  SERVICE_FORMAT_LABEL,
  type StepNumber,
} from "./quote-config";
import { displayDate, type QuoteAnswers } from "./use-quote-builder";

export interface BriefCardProps {
  answers: QuoteAnswers;
  /** כשנמסר — כל שורה לחיצה וחוזרת למסך שלה. בלעדיו הכרטיס הוא מסמך. */
  onEdit?: (step: StepNumber) => void;
  onRemoveDish?: (id: string) => void;
  title?: React.ReactNode;
  className?: string;
}

interface Row {
  key: string;
  term: string;
  value: React.ReactNode;
  step?: StepNumber;
}

export function BriefCard({
  answers,
  onEdit,
  onRemoveDish,
  title = "מה שסיפרתם לנו",
  className,
}: BriefCardProps) {
  const rows: Row[] = [];

  if (answers.eventType) {
    rows.push({ key: "event", term: "סוג האירוע", value: answers.eventType, step: 1 });
  }

  if (answers.guestBand) {
    rows.push({
      key: "guests",
      term: "מספר סועדים",
      /* ספרות טבלאיות, ומחבר עברי — לעולם לא קו מפריד בין ספרות. */
      value: <Num>{GUEST_BAND_DISPLAY[answers.guestBand]}</Num>,
      step: 2,
    });
  }

  const date = answers.eventDate ? displayDate(answers.eventDate) : null;
  if (date) {
    rows.push({ key: "date", term: "תאריך", value: <Num>{date}</Num>, step: 3 });
  } else if (answers.dateFlexible) {
    rows.push({ key: "date", term: "תאריך", value: "עוד לא נקבע", step: 3 });
  }

  if (answers.area) {
    rows.push({
      key: "area",
      term: "אזור",
      value: answers.branch ? `${answers.area} · ${BRANCH_NAME[answers.branch]}` : answers.area,
      step: 4,
    });
  }

  if (answers.serviceFormat) {
    rows.push({
      key: "format",
      term: "הגשה",
      value: SERVICE_FORMAT_LABEL[answers.serviceFormat],
    });
  }

  const hasDishes = answers.dishes.length > 0;
  if (!rows.length && !hasDishes) return null;

  return (
    <div
      className={cn(
"rule-top max-w-confirm bg-bg-alt p-card",
        className,
      )}
    >
      {title ? (
        <p className="eyebrow mb-4">{title}</p>
      ) : null}

      {rows.length ? (
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2">
          {rows.map((row) => (
            <React.Fragment key={row.key}>
              <dt className="font-sans text-2xs font-semibold tracking-[.09em] text-fg-subtle">
                {row.term}
              </dt>
              <dd className="m-0 text-sm">
                {onEdit && row.step ? (
                  <button
                    type="button"
                    onClick={() => onEdit(row.step as StepNumber)}
                    className="min-h-[24px] text-start underline decoration-rule underline-offset-[.22em] hover:decoration-accent"
                  >
                    {row.value}
                    <span className="sr-only"> — לשינוי</span>
                  </button>
                ) : (
                  row.value
                )}
              </dd>
            </React.Fragment>
          ))}
        </dl>
      ) : null}

      {hasDishes ? (
        <div className={cn(rows.length && "mt-5 border-t border-rule pt-4")}>
          <p className="eyebrow mb-2">מהתפריט</p>
          <ul className="grid gap-1">
            {answers.dishes.map((dish) => (
              <li
                key={dish.id}
                className="flex items-baseline justify-between gap-3 border-b border-rule pb-1 last:border-b-0"
              >
                <span className="font-serif text-sm font-medium leading-dish">{dish.name}</span>
                {onRemoveDish ? (
                  <button
                    type="button"
                    onClick={() => onRemoveDish(dish.id)}
                    className="min-h-[24px] shrink-0 text-2xs text-fg-subtle underline decoration-rule underline-offset-[.22em] hover:text-fg hover:decoration-accent"
                  >
                    הסרה
                    <span className="sr-only"> של {dish.name} מהתפריט</span>
                  </button>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
