/**
 * Prose — גוש טקסט עברי במידה ובקצב הנכונים (§4.3–§4.5).
 *
 * המידה נמדדת ב־em ולא ב־ch. 1ch של Assistant הוא 0.472em, אבל אות עברית
 * ממוצעת היא 0.382em — כלומר ch מדווח יתר על עברית ב־24%, ו־65ch מייצר
 * שורה של כ־80 תווים. --measure-body הוא 26em ≈ 68 תווים.
 *
 * עברית צריכה יותר רווח שורה מלטינית ולא פחות: כל אות ממלאת את מלוא רצועת
 * ה־x-height, לגוש אין תעלות של ascender ו־descender, והוא נקרא כאפור צפוף.
 * לכן --lh-body הוא 1.75, ו־leading-none ו־leading-tight אסורים על טקסט רץ.
 *
 * אין כאן נטייה. לשתי המשפחות אין ציר style, כל שיפוע הוא סינתטי של הדפדפן
 * והוא נקרא כתקלת רינדור (§4.8). ההדגשה בעברית היא משקל, גודל, צבע ומרווח.
 */

import * as React from "react";
import { cn } from "@/lib/utils";

export type ProseSize = "body" | "lede" | "note" | "fine";
export type ProseMeasure = "body" | "lede" | "answer" | "confirm" | "max" | "none";

const SIZE: Record<ProseSize, string> = {
  body: "text-base leading-body",
  lede: "text-md leading-[1.6] text-fg-muted",
  note: "text-xs leading-[1.6] text-fg-subtle",
  /* אותיות קטנות משפטיות — --fs-3xs הוא הרצפה, ולמטה מזה אין. */
  fine: "text-3xs leading-[1.55] text-fg-subtle",
};

const MEASURE: Record<ProseMeasure, string> = {
  body: "max-w-body",
  lede: "max-w-lede",
  answer: "max-w-answer",
  confirm: "max-w-confirm",
  max: "max-w-measure",
  none: "",
};

/* העוטף הוא שקובע את המידה, ולכן הפסקאות מוותרות על ה־max-width של כלל
   הבסיס — אחרת מתקבלות שתי תקרות שונות באותו גוש. */
const RHYTHM =
  "[&_p]:max-w-none [&_p]:mb-[1.1em] [&_p:last-child]:mb-0 " +
  "[&_ul]:ps-[1.15em] [&_ol]:ps-[1.15em] [&_ul]:list-disc [&_ol]:list-decimal " +
  "[&_li]:mb-[.35em] [&_li::marker]:text-accent " +
  "[&_a]:underline [&_a]:underline-offset-[.22em] " +
  "[&_h3]:mt-[1.6em] [&_h3]:mb-[.5em] [&_h3:first-child]:mt-0";

export interface ProseProps extends React.HTMLAttributes<HTMLElement> {
  as?: "div" | "section" | "article" | "aside";
  size?: ProseSize;
  measure?: ProseMeasure;
  /** ברירת מחדל: הצבע נורש מההקשר. muted ל־lede, subtle להערות. */
  tone?: "inherit" | "default" | "muted" | "subtle";
}

const TONE: Record<NonNullable<ProseProps["tone"]>, string> = {
  inherit: "",
  default: "text-fg",
  muted: "text-fg-muted",
  subtle: "text-fg-subtle",
};

export const Prose = React.forwardRef<HTMLElement, ProseProps>(function Prose(
  { as: Tag = "div", size = "body", measure = "body", tone = "inherit", className, ...rest },
  ref,
) {
  return (
    <Tag
      ref={ref as React.Ref<HTMLDivElement>}
      className={cn("font-sans font-normal", SIZE[size], MEASURE[measure], TONE[tone], RHYTHM, className)}
      {...rest}
    />
  );
});
