/**
 * RadioCard · RadioCardGroup — §7.4.
 *
 * הפקד הראשי של האתר כולו: בלוק ברוחב מלא, הקשה אחת, אפס הקלדה.
 * לעולם לא <select> — הוא עולה הקשה נוספת ונקרא בירוקרטי.
 *
 * ה־input הוא רדיו אמיתי: הוא מוסתר חזותית אך נשאר בתור הפוקוס, ולכן
 * חיצי המקלדת, קבוצות ה־name וההגשה עובדים בלי שורת JavaScript אחת.
 *
 * המצב הנבחר הוא היפוך מלא (16.31:1) ולא צבע: הוא נקרא במבט, שורד גווני
 * אפור ומצב ניגודיות גבוהה, ואינו מסתמך על צבע בלבד (§10.5).
 *
 * התוויות מגיעות מבחוץ. טווח סועדים, אזור או פורמט שירות הם התחייבות
 * מסחרית — הקומפוננטה מציגה את מה שנמסר לה, ואם לא נמסר דבר היא לא
 * מציגה כלום. אין כאן ברירת מחדל, לא לטווח ולא לאזור.
 */

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export type RadioCardVariant = "card" | "chip";

export interface RadioCardProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "size"> {
  label: React.ReactNode;
  /** שורת הסבר קצרה מתחת לתווית. נשמטת לגמרי כשאין. */
  description?: React.ReactNode;
  variant?: RadioCardVariant;
  /** רב־בחירה (אילוצים תזונתיים) הוא checkbox עם אותה חזות בדיוק. */
  control?: "radio" | "checkbox";
}

const FACE_BASE =
  "block rounded border border-solid border-rule-control bg-bg text-fg " +
  "transition-[background-color,color,border-color] duration-state ease-house " +
  "peer-hover:border-fg-subtle " +
  "peer-checked:bg-fg peer-checked:text-bg peer-checked:border-fg peer-checked:font-semibold " +
  "peer-checked:[&_[data-desc]]:text-bg " +
  "peer-focus-visible:outline peer-focus-visible:outline-2 " +
  "peer-focus-visible:outline-offset-2 peer-focus-visible:outline-focus " +
  "peer-disabled:opacity-[.55] peer-disabled:border-ink-4";

const FACE: Record<RadioCardVariant, string> = {
  card: "min-h-[48px] px-[1.2rem] py-4 text-sm",
  chip: "flex min-h-[44px] items-center justify-center rounded-pill px-[.9rem] py-[.55rem] text-2xs",
};

export const RadioCard = React.forwardRef<HTMLInputElement, RadioCardProps>(function RadioCard(
  { label, description, variant = "card", control = "radio", className, disabled, ...rest },
  ref,
) {
  return (
    <label
      className={cn(
        "relative cursor-pointer",
        variant === "chip" ? "inline-flex" : "block",
        disabled && "cursor-not-allowed",
        className,
      )}
    >
      {/* מוסתר חזותית, לא מוסתר מהמקלדת ולא מקורא המסך. */}
      <input
        ref={ref}
        type={control}
        disabled={disabled}
        className="peer absolute h-0 w-0 opacity-0"
        {...rest}
      />
      <span className={cn(FACE_BASE, FACE[variant])}>
        <span className="block">{label}</span>
        {description ? (
          <span data-desc="" className="mt-[.3rem] block text-xs text-fg-muted">
            {description}
          </span>
        ) : null}
      </span>
    </label>
  );
});

/* ─────────────────────── RadioCardGroup ─────────────────────── */

export interface RadioCardGroupProps
  extends Omit<React.FieldsetHTMLAttributes<HTMLFieldSetElement>, "children"> {
  /** שאלת הבנאי. FRL 500 ב־--fs-xl (§4.3). */
  legend: React.ReactNode;
  hint?: React.ReactNode;
  error?: React.ReactNode;
  /** מזהה יציב, כדי שסיכום השגיאות (§10.9) יוכל לקשר לכאן. */
  id?: string;
  variant?: RadioCardVariant;
  children: React.ReactNode;
}

export const RadioCardGroup = React.forwardRef<HTMLFieldSetElement, RadioCardGroupProps>(
  function RadioCardGroup(
    { legend, hint, error, id, variant = "card", className, children, ...rest },
    ref,
  ) {
    /* אין אפשרויות — אין קבוצה. לא כותרת יתומה ולא מסגרת ריקה. */
    if (React.Children.count(children) === 0) return null;

    const hintId = id ? `${id}-hint` : undefined;
    const errorId = id ? `${id}-err` : undefined;
    const describedBy = [error ? errorId : null, hint ? hintId : null]
      .filter(Boolean)
      .join(" ");

    return (
      <fieldset
        ref={ref}
        id={id}
        className={cn("m-0 min-w-0 border-0 p-0", className)}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy || undefined}
        {...rest}
      >
        <legend className="mb-4 font-serif text-xl font-medium leading-sub text-fg">
          {legend}
        </legend>

        {hint ? (
          <p id={hintId} className="mb-4 max-w-body text-xs text-fg-subtle">
            {hint}
          </p>
        ) : null}

        <div
          className={cn(
            variant === "chip" ? "flex flex-wrap gap-[.6rem]" : "grid gap-[.6rem]",
          )}
        >
          {children}
        </div>

        {error ? (
          <p
            id={errorId}
            className="mt-[.6rem] flex max-w-body items-start gap-[.35rem] text-xs text-danger"
          >
            <X
              aria-hidden="true"
              focusable="false"
              className="mt-[.2em] h-[1em] w-[1em] shrink-0"
            />
            <span>{error}</span>
          </p>
        ) : null}
      </fieldset>
    );
  },
);
