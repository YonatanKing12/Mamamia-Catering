/**
 * CtaPair — §7.1. הדרך היחידה המאושרת להציג יותר מ־CTA אחד יחד,
 * וזה מה שאוכף את L-10: primary אחד בדיוק, secondary אחד לכל היותר.
 *
 * נושא data-cta-pair כדי שבדיקת L-2 תוכל לקבוע ששום תמונה לא מקדימה אותו,
 * ו־class="cta-pair" כדי שגיליון ההדפסה (§11) יסתיר אותו — תפריט מודפס
 * הוא מסמך, לא משטח המרה.
 */

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button, type ButtonProps, type ButtonSize, type ButtonVariant } from "./button";

export interface CtaSpec
  extends Omit<ButtonProps, "variant" | "size" | "children" | "fullWidth"> {
  label: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export interface CtaPairProps extends React.HTMLAttributes<HTMLDivElement> {
  primary: CtaSpec;
  /** שני לכל היותר. variant="primary" כאן זורק בפיתוח. */
  secondary?: CtaSpec;
}

export const CtaPair = React.forwardRef<HTMLDivElement, CtaPairProps>(function CtaPair(
  { primary, secondary, className, ...rest },
  ref,
) {
  if (import.meta.env.DEV && secondary && (secondary.variant ?? "link") === "primary") {
    throw new Error(
      "CtaPair: שני פקדים ממולאים באותו מקבץ. L-10 מתיר primary אחד בלבד — " +
        "העבירו ל־secondary את variant 'ghost' או 'link'.",
    );
  }

  const { label: primaryLabel, variant: pv, size: ps, ...primaryRest } = primary;

  return (
    <div
      ref={ref}
      data-cta-pair=""
      className={cn("cta-pair flex flex-wrap items-center gap-[.85rem]", className)}
      {...rest}
    >
      <Button variant={pv ?? "primary"} size={ps ?? "md"} {...primaryRest}>
        {primaryLabel}
      </Button>
      {secondary
        ? (() => {
            const { label, variant, size, ...secondaryRest } = secondary;
            return (
              <Button variant={variant ?? "link"} size={size ?? "md"} {...secondaryRest}>
                {label}
              </Button>
            );
          })()
        : null}
    </div>
  );
});
