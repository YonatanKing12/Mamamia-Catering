/**
 * DateFields — spec 02 §3.6.
 *
 * **אין `<input type="date">`.** הפקד הילידי מרונדר LTR עם לוקאל תלוי־מכשיר
 * בתוך עמוד RTL, סדר השדות בו אינו נשלט, וב־iOS הוא פותח גלגלת שסדר
 * העמודות שלה מתהפך. שלושה שדות מספריים קצרים הם הפתרון היציב: המקלדת
 * נכונה, הסדר יום·חודש·שנה נקרא כמו בישראל, והערך נשמר כ־ISO.
 *
 * השדה **אינו חובה**. תאריך הוא המסנן החזק ביותר ועולה הקשה אחת, אבל
 * כפייה שלו על קונה שמשווה מחירים חצי שנה מראש מאבדת את הליד.
 */

import * as React from "react";
import { cn } from "@/lib/utils";
import { fieldControlClass } from "@/components/primitives";
import { COPY } from "./quote-config";
import { fromIsoDate, toIsoDate } from "./use-quote-builder";

export interface DateFieldsProps {
  /** ISO YYYY-MM-DD או "" */
  value: string;
  onChange: (iso: string) => void;
  /** נדלק כשהוקלד תאריך חלקי או בלתי קיים. */
  error?: string | null;
  onPartial?: (partial: boolean) => void;
  disabled?: boolean;
  id?: string;
}

const PART_CLASS =
"num text-center px-2 [appearance:textfield] " +
"[&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none";

export function DateFields({
  value,
  onChange,
  error,
  onPartial,
  disabled,
  id = "quote-date",
}: DateFieldsProps) {
  const initial = React.useMemo(() => fromIsoDate(value), [value]);
  const [day, setDay] = React.useState(initial.day);
  const [month, setMonth] = React.useState(initial.month);
  const [year, setYear] = React.useState(initial.year);

  /* סנכרון חוזר כשהערך שונה מבחוץ (שחזור טיוטה, «להתחיל מחדש»). */
  React.useEffect(() => {
    const next = fromIsoDate(value);
    setDay(next.day);
    setMonth(next.month);
    setYear(next.year);
  }, [value]);

  const push = (d: string, m: string, y: string) => {
    const iso = toIsoDate(d, m, y);
    const anyFilled = Boolean(d || m || y);
    onPartial?.(anyFilled && iso === null);
    onChange(iso ?? "");
  };

  const digits = (raw: string, max: number) => raw.replace(/\D/g, "").slice(0, max);

  const errId = `${id}-err`;

  return (
    <div>
      <div
        role="group"
        aria-labelledby={`${id}-label`}
        aria-describedby={error ? errId : undefined}
        className="grid max-w-[22rem] grid-cols-[4.5rem_4.5rem_1fr] gap-[.6rem]"
      >
        <span id={`${id}-label`} className="sr-only">
          {COPY.dateLabel}
        </span>

        <div className="grid gap-[.35rem]">
          <label htmlFor={`${id}-day`} className="font-sans text-xs font-semibold text-fg-muted">
            יום
          </label>
          <input
            id={`${id}-day`}
            name="event_day"
            inputMode="numeric"
            autoComplete="off"
            dir="ltr"
            maxLength={2}
            placeholder="—"
            value={day}
            disabled={disabled}
            aria-invalid={error ? true : undefined}
            onChange={(e) => {
              const v = digits(e.currentTarget.value, 2);
              setDay(v);
              push(v, month, year);
            }}
            className={cn(fieldControlClass, PART_CLASS)}
          />
        </div>

        <div className="grid gap-[.35rem]">
          <label htmlFor={`${id}-month`} className="font-sans text-xs font-semibold text-fg-muted">
            חודש
          </label>
          <input
            id={`${id}-month`}
            name="event_month"
            inputMode="numeric"
            autoComplete="off"
            dir="ltr"
            maxLength={2}
            placeholder="—"
            value={month}
            disabled={disabled}
            aria-invalid={error ? true : undefined}
            onChange={(e) => {
              const v = digits(e.currentTarget.value, 2);
              setMonth(v);
              push(day, v, year);
            }}
            className={cn(fieldControlClass, PART_CLASS)}
          />
        </div>

        <div className="grid gap-[.35rem]">
          <label htmlFor={`${id}-year`} className="font-sans text-xs font-semibold text-fg-muted">
            שנה
          </label>
          <input
            id={`${id}-year`}
            name="event_year"
            inputMode="numeric"
            autoComplete="off"
            dir="ltr"
            maxLength={4}
            placeholder="————"
            value={year}
            disabled={disabled}
            aria-invalid={error ? true : undefined}
            onChange={(e) => {
              const v = digits(e.currentTarget.value, 4);
              setYear(v);
              push(day, month, v);
            }}
            className={cn(fieldControlClass, PART_CLASS)}
          />
        </div>
      </div>

      {error ? (
        <p id={errId} role="alert" className="mt-[.6rem] max-w-body text-xs text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}
