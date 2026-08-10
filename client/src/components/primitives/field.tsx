/**
 * Field · TextInput · Textarea — §7.3, §10.9.
 *
 * Field עוטף תווית, הסבר, שגיאה וסימון חובה, ומחשב את aria-describedby.
 * הפקד עצמו מגיע כ־render prop, כדי שהקישור בין המזהים לבין ה־input יהיה
 * מפורש ובדוק ב־TypeScript — בלי cloneElement ובלי ניחוש.
 *
 *   <Field id="phone" label="טלפון" error={err} required>
 *     {(control) => <TextInput kind="phone" {...control} />}
 *   </Field>
 *
 * שלוש הקפדות שהמפרט מדגיש:
 *   · המסגרת היא --rule-control (3.69:1) ולא --rule (1.40:1) — WCAG 1.4.11.
 *   · רקע הפקד במנוחה הוא --paper. לבן הוא משטח hover בלבד (§2.1).
 *   · שגיאה אף פעם לא בצבע בלבד: אייקון + טקסט + aria-invalid (§10.5).
 *
 * מחרוזות השגיאה עצמן אינן כאן. הן קופי, הן בבעלות מודול תוכן, והן מגיעות
 * כ־prop. אין כאן שום עובדה עסקית.
 */

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

/* ─────────────────────────── Field ─────────────────────────── */

/** מה ש־Field מוסר לפקד. פזרו את כולו על ה־input או ה־textarea. */
export interface FieldControlProps {
  id: string;
  required?: boolean;
"aria-required"?: true;
"aria-invalid"?: true;
"aria-describedby"?: string;
}

export interface FieldProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  /** חובה: מקשר תווית לפקד, ומשמש כעוגן בסיכום השגיאות (§10.9). */
  id: string;
  label: React.ReactNode;
  /** הסבר קצר מתחת לתווית. נשמט לגמרי כשאין. */
  hint?: React.ReactNode;
  /** טקסט שגיאה בעברית. נשמט לגמרי כשאין. */
  error?: React.ReactNode;
  required?: boolean;
  children: (control: FieldControlProps) => React.ReactNode;
}

export const Field = React.forwardRef<HTMLDivElement, FieldProps>(function Field(
  { id, label, hint, error, required = false, className, children, ...rest },
  ref,
) {
  const hintId = `${id}-hint`;
  const errorId = `${id}-err`;

  /* השגיאה ראשונה ברשימה — סדר describedby הוא סדר ההקראה. */
  const describedBy = [error ? errorId : null, hint ? hintId : null]
.filter(Boolean)
.join(" ");

  const control: FieldControlProps = {
    id,
    required: required || undefined,
"aria-required": required || undefined,
"aria-invalid": error ? true : undefined,
"aria-describedby": describedBy || undefined,
  };

  return (
    <div ref={ref} className={cn("grid gap-[.4rem]", className)} {...rest}>
      <label htmlFor={id} className="font-sans text-xs font-semibold text-fg-muted">
        {label}
        {required ? (
          <>
            <span aria-hidden="true" className="ms-[.2em] text-accent">
              *
            </span>
            <span className="sr-only"> שדה חובה</span>
          </>
        ) : null}
      </label>

      {hint ? (
        <p id={hintId} className="max-w-body text-xs text-fg-subtle">
          {hint}
        </p>
      ) : null}

      {children(control)}

      {error ? (
        <p
          id={errorId}
          className="flex max-w-body items-start gap-[.35rem] text-xs text-danger"
        >
          <X aria-hidden="true" focusable="false" className="mt-[.2em] h-[1em] w-[1em] shrink-0" />
          <span>{error}</span>
        </p>
      ) : null}
    </div>
  );
});

/* ──────────────────── TextInput · Textarea ──────────────────── */

const CONTROL =
"w-full rounded border border-solid border-rule-control bg-bg " +
"font-sans text-sm font-normal text-fg " +
"px-4 py-[.85rem] min-h-[48px] " +
"placeholder:text-fg-subtle " +
"transition-[border-color] duration-state ease-house " +
"focus:border-fg " +
"aria-[invalid=true]:border-2 aria-[invalid=true]:border-danger " +
"disabled:bg-bg-alt disabled:border-ink-4 disabled:text-ink-3 disabled:cursor-not-allowed";

/**
 * סוג השדה קובע מקלדת, השלמה אוטומטית וכיוון — כל ארבעתם חסרים היום
 * ולכל אחד מהם יש מחיר ישיר בהשלמות מהנייד (§7.3).
 * מספר סועדים לעולם לא type="number", ותאריך לעולם לא type="date".
 */
export type FieldKind = "text" | "name" | "phone" | "email";

const KIND: Record<FieldKind, React.InputHTMLAttributes<HTMLInputElement>> = {
  text: { dir: "auto" },
  name: { autoComplete: "name", dir: "auto" },
  phone: { type: "tel", inputMode: "tel", autoComplete: "tel", dir: "ltr" },
  email: { type: "email", inputMode: "email", autoComplete: "email", dir: "ltr" },
};

/* dir="ltr" מתקן את הסמן ואת הבחירה בזמן הקלדת ספרות; כלל הבסיס
   ב־index.css משאיר את ה־placeholder העברי צמוד להתחלה. */
const KIND_CLASS: Record<FieldKind, string> = {
  text: "",
  name: "",
  phone: "num text-end",
  email: "text-end",
};

export interface TextInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  kind?: FieldKind;
  type?: React.HTMLInputTypeAttribute;
}

export const TextInput = React.forwardRef<HTMLInputElement, TextInputProps>(
  function TextInput({ kind = "text", className, ...rest }, ref) {
    return (
      <input
        ref={ref}
        {...KIND[kind]}
        className={cn(CONTROL, KIND_CLASS[kind], className)}
        {...rest}
      />
    );
  },
);

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea({ className, rows = 4, ...rest }, ref) {
    return (
      <textarea
        ref={ref}
        dir="auto"
        rows={rows}
        className={cn(CONTROL, "min-h-[7.5rem] leading-body", className)}
        {...rest}
      />
    );
  },
);

/** מיוצא החוצה כדי שפקד לא־סטנדרטי (select, בורר תאריך) ייראה זהה. */
export const fieldControlClass = CONTROL;
