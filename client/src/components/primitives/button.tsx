/**
 * Button — §7.1.
 *
 * גבוה ושטוח יותר מברירת המחדל של shadcn, כדי שייקרא כדפוס מודפס ולא כרכיב
 * ממשק. radius 3px (L-11), בלי צל (L-8), בלי scale (§8), הרמה של 1px לכל היותר.
 *
 * כל הווריאנטים כתובים מול הטוקנים הסמנטיים (§2.2), ולכן אותו כפתור בדיוק
 * מתהפך לבד בתוך [data-band="ink"]: --btn-bg הופך לנייר, --btn-fg לדיו,
 * ו־--focus הופך ל־#e0a79c (8.37:1) בלי שום prop של band.
 *
 * מצב מושבת: aria-disabled ולא התכונה disabled — הפקד נשאר בתור הפוקוס
 * וניתן לגילוי בקורא מסך (§7.1). הקליק נחסם בקוד, לא רק ב־CSS.
 *
 * מצב טעינה: התווית מתחלפת, הרוחב ננעל על המקסימום של שתי התוויות כך
 * ששום דבר לא זז, ו־aria-busy מוצהר.
 */

import * as React from "react";
import { cn } from "@/lib/utils";
import { WhatsAppGlyph } from "./brand-icons";

export type ButtonVariant = "primary" | "ghost" | "wa" | "whatsapp" | "link";
export type ButtonSize = "md" | "sm";

const BASE =
  "inline-flex items-center justify-center gap-2 rounded border border-solid " +
  "font-sans text-sm font-semibold leading-none no-underline text-center " +
  "transition-[background-color,color,border-color,transform] duration-state ease-house " +
  "aria-disabled:cursor-not-allowed aria-disabled:opacity-[.55] aria-disabled:pointer-events-none";

const VARIANT: Record<Exclude<ButtonVariant, "whatsapp">, string> = {
  /* 16.31:1 במנוחה · 5.72:1 ב־hover. על הבאנד הכהה: 16.31 ו־8.37. */
  primary:
    "bg-btn-bg text-btn-fg border-btn-bg " +
    "hover:bg-accent hover:border-accent hover:-translate-y-px " +
    "motion-reduce:hover:translate-y-0",
  /* מסגרת --rule-control (3.69:1) — 1.4.11. לעולם לא --rule. */
  ghost:
    "bg-transparent text-fg border-rule-control " +
    "hover:text-accent hover:border-accent",
  /* לבן על --wa 5.42:1 · על --wa-dk 6.27:1. לא הירוק של המותג — §2.1. */
  wa: "bg-wa text-white border-wa hover:bg-wa-dk hover:border-wa-dk",
  /* הטלפון הוא link, לא primary — L-10. */
  link:
    "bg-transparent border-transparent text-fg-subtle underline " +
    "decoration-rule underline-offset-[.22em] " +
    "hover:text-fg hover:decoration-accent",
};

const SIZE: Record<ButtonSize, string> = {
  md: "min-h-[48px] px-[1.9rem] py-[1.05rem]",
  sm: "min-h-[44px] px-[1.3rem] py-[.7rem]",
};

/** ל־link אין מילוי ולכן גם לא ריפוד אופקי — רק יעד מגע של 44px (§10.6). */
const LINK_SIZE = "min-h-[44px] px-0 py-2";

export interface ButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "type" | "disabled"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** נותן <a> במקום <button>. כל CTA שמנווט הוא קישור. */
  href?: string;
  target?: string;
  rel?: string;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  loading?: boolean;
  /** התווית בזמן שליחה. ננעלת ברוחב מול התווית הרגילה. */
  loadingLabel?: React.ReactNode;
  /** גליף פותח. ל־wa הוא נכנס לבד; העבירו null כדי לבטל. */
  icon?: React.ReactNode | null;
  fullWidth?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(
  function Button(
    {
      variant = "primary",
      size = "md",
      href,
      target,
      rel,
      type = "button",
      disabled = false,
      loading = false,
      loadingLabel = "שולחים…",
      icon,
      fullWidth = false,
      className,
      children,
      onClick,
      ...rest
    },
    ref,
  ) {
    const v: Exclude<ButtonVariant, "whatsapp"> = variant === "whatsapp" ? "wa" : variant;
    const inert = disabled || loading;

    const glyph =
      icon === null ? null : icon !== undefined ? icon : v === "wa" ? <WhatsAppGlyph /> : null;

    const classes = cn(
      BASE,
      VARIANT[v],
      v === "link" ? LINK_SIZE : SIZE[size],
      fullWidth && "w-full",
      className,
    );

    /* pointer-events מנוטרל ב־CSS, אבל Enter על קישור ממוקד עדיין יורה
       click — ולכן החסימה חייבת להיות גם כאן. */
    const handleClick = (e: React.MouseEvent<HTMLButtonElement & HTMLAnchorElement>) => {
      if (inert) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      onClick?.(e);
    };

    /* שתי התוויות יושבות באותה תא רשת: הרוחב הוא המקסימום שלהן תמיד,
       ולכן המעבר לטעינה לא מזיז שום דבר בעמוד. */
    const label = (
      <span className="grid">
        <span
          className={cn(
            "col-start-1 row-start-1 flex items-center justify-center gap-2",
            loading && "invisible",
          )}
          aria-hidden={loading || undefined}
        >
          {glyph}
          {children}
        </span>
        <span
          className={cn(
            "col-start-1 row-start-1 flex items-center justify-center",
            !loading && "invisible",
          )}
          aria-hidden={!loading || undefined}
        >
          {loadingLabel}
        </span>
      </span>
    );

    const shared = {
      className: classes,
      onClick: handleClick,
      "aria-disabled": inert || undefined,
      "aria-busy": loading || undefined,
      "data-loading": loading ? "" : undefined,
    } as const;

    if (href !== undefined) {
      return (
        <a
          ref={ref as React.Ref<HTMLAnchorElement>}
          href={href}
          target={target}
          rel={target === "_blank" ? rel ?? "noopener noreferrer" : rel}
          {...shared}
          {...(rest as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
        >
          {label}
        </a>
      );
    }

    return (
      <button ref={ref as React.Ref<HTMLButtonElement>} type={type} {...shared} {...rest}>
        {label}
      </button>
    );
  },
);
