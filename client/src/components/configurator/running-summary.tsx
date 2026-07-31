/**
 * ═══════════════════════════════════════════════════════════════════════
 *  RunningSummary — הסיכום הרץ. במובייל זו ההכרעה החשובה בזרימה.
 * ═══════════════════════════════════════════════════════════════════════
 *
 * ─── מה נפסל, ולמה ──────────────────────────────────────────────
 * הפתרון המקובל בקטגוריה הוא כפתור «העגלה שלי» שפותח **מודאל**. הוא
 * נכשל בדיוק בנקודה שבה הוא נחוץ:
 *   · מודאל נועל את גלילת הרקע ולוכד פוקוס, ולכן המבקר מאבד את המקום
 *     שבו היה ברשת המנות. הוא סוגר, מגלגל בחזרה, ומחפש.
 *   · במובייל הוא לרוב `position:fixed` מלא־מסך, ומקש «חזרה» של אנדרואיד
 *     סוגר את **הדף** ולא את המודאל אם לא נוהלה היסטוריה.
 *   · הוא מרונדר ב־portal, כלומר מחוץ לעץ, ולכן קל מאוד לאבד בו מצב
 *     בין פתיחה לפתיחה.
 *
 * ─── מה נבנה במקום ──────────────────────────────────────────────
 * **מזח תחתון שנפתח במקום.** אלמנט אחד, בעץ, ללא portal:
 *   · במצב מכווץ — שורה אחת שנשארת גלויה תמיד: כמה מנות, כמה סועדים.
 *   · לחיצה על שורת הכותרת מגדילה את **אותו** אלמנט כלפי מעלה לפאנל
 *     גליל. אין החלפת אלמנט, אין portal, אין אנימציית כניסה שמזיזה
 *     פוקוס. המצב היחיד שקיים כאן הוא «פתוח/סגור».
 *   · **הרקע אינו ננעל ואינו `inert`.** המבקר יכול לגלול את רשת המנות
 *     מאחורי הפאנל בזמן שהוא רואה את הבחירות שלו. זה בדיוק מה שמודאל
 *     מונע, וזה כל ההבדל.
 *   · `aria-expanded` + `aria-controls` על הכפתור, `Escape` סוגר. אין
 *     מלכודת פוקוס — אין מה ללכוד, הפאנל אינו חוסם דבר.
 *
 * במסכים רחבים אותה קומפוננטה מרונדרת כ־`rail`: עמודה דביקה לצד המנות,
 * פתוחה תמיד, בלי כפתור. אותו תוכן, אותו קוד, שתי פריסות.
 *
 * ─── כסף ────────────────────────────────────────────────────────
 * הבלוק היחיד שיכול להציג סכום מקבל `PricedSelection` **מוכן** מלמעלה,
 * מ־`priceSelection()` היחיד ב־`content/packages.ts`. הוא אינו מחשב
 * סכום ואינו קורא מחירון. `null` ⇒ אין שורת סכום, אין «יחושב בהמשך»,
 * אין מסגרת ריקה. הסיכום מציג **בחירות**, וזה שלם בפני עצמו.
 */

import * as React from "react";
import { ChevronUp, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button, Money, Num } from "@/components/primitives";
import type {
  CategoryId,
  DishId,
  PricedSelection,
  ResolvedSelection,
} from "@/content/packages";
import { COPY, guestsSentence, pickedSentence } from "./copy";

export type SummaryVariant = "rail" | "dock";

export interface RunningSummaryProps {
  variant: SummaryVariant;
  /** הבחירה נקייה ומדודה. `null` ⇒ אין מה לסכם והקומפוננטה לא מרונדרת. */
  resolved: ResolvedSelection | null;
  /** תוצאת `priceSelection()`. `null` היום, ולכן אין שורת סכום. */
  price: PricedSelection | null;
  onRemove(categoryId: CategoryId, dishId: DishId): void;
  /** «שינוי» ליד כותרת קטגוריה. */
  onEditCategory(categoryId: CategoryId): void;
  /** הפעולה הראשית של המזח. נשמטת כשלא נמסרה. */
  primaryLabel?: string;
  onPrimary?(): void;
  className?: string;
}

export function RunningSummary({
  variant,
  resolved,
  price,
  onRemove,
  onEditCategory,
  primaryLabel,
  onPrimary,
  className,
}: RunningSummaryProps) {
  const [open, setOpen] = React.useState(false);
  const panelId = React.useId();

  /* Escape סוגר — הפאנל אינו חוסם דבר, אבל המבקר מצפה לזה. */
  React.useEffect(() => {
    if (variant !== "dock" || !open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, variant]);

  if (!resolved) return null;

  /* קטגוריה שטרם נבחר בה דבר אינה מוצגת בסיכום — כותרת מעל רשימה ריקה
     היא בדיוק הבלוק היתום שהחוק העליון אוסר. */
  const lines = resolved.categories.filter((line) => line.count > 0);
  const count = resolved.totalDishes;

  const body = (
    <div className="grid gap-4">
      {lines.length === 0 ? (
        <p className="text-xs text-fg-subtle">{COPY.summaryEmpty}</p>
      ) : (
        lines.map((line) => (
          <div key={line.category.id} className="grid gap-[.4rem]">
            <div className="flex items-baseline justify-between gap-2">
              <h4 className="text-xs font-bold">{line.category.nameHe}</h4>
              <span className="flex items-center gap-[.6rem] text-3xs text-fg-subtle">
                <span>
                  <Num inline>{line.count}</Num> מתוך <Num inline>{line.quota}</Num>
                </span>
                <button
                  type="button"
                  onClick={() => onEditCategory(line.category.id)}
                  className={cn(
                    "min-h-[44px] px-1 text-3xs text-accent underline",
                    "decoration-rule underline-offset-[.22em] hover:decoration-accent",
                  )}
                >
                  {COPY.edit}
                  <span className="sr-only"> · {line.category.nameHe}</span>
                </button>
              </span>
            </div>

            <ul className="m-0 grid list-none gap-[.15rem] p-0">
              {line.dishes.map((dish) => (
                <li
                  key={dish.id}
                  className="flex items-center justify-between gap-2 text-xs leading-tight"
                >
                  <span className="min-w-0 flex-1">{dish.nameHe}</span>
                  <button
                    type="button"
                    onClick={() => onRemove(line.category.id, dish.id)}
                    className={cn(
                      "grid h-[44px] w-[44px] shrink-0 place-items-center rounded",
                      "text-fg-subtle transition-colors duration-state ease-house",
                      "hover:text-danger",
                    )}
                  >
                    <X aria-hidden="true" className="h-[1rem] w-[1rem]" />
                    <span className="sr-only">
                      {COPY.summaryRemove} {dish.nameHe}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))
      )}

      {/*
        הבלוק היחיד שיכול להציג סכום. `price` הוא `null` היום ולכן הוא
        אינו קיים — לא כשורה ריקה ולא כ«יחושב בהמשך».
        הסייג יושב **מעל** המספר ובאותו משקל, בדיוק כמו ב־estimate.tsx.
      */}
      {price ? (
        <div className="grid gap-[.4rem] border-t border-solid border-rule pt-3">
          <p className="max-w-body text-xs font-medium">{price.qualifier}</p>
          <p className="text-lg font-bold">
            <Money value={price.total} />
          </p>
          <p className="max-w-body text-3xs text-fg-subtle">{price.vatLine}</p>
        </div>
      ) : null}
    </div>
  );

  const headline = (
    <>
      {resolved.pkg.nameHe}
      {" · "}
      {pickedSentence(count)}
      {resolved.guestCount !== null ? ` · ${guestsSentence(resolved.guestCount)}` : ""}
    </>
  );

  /* ── עמודה דביקה, מסכים רחבים ─────────────────────────────── */

  if (variant === "rail") {
    return (
      <aside
        aria-label={COPY.summaryTitle}
        className={cn(
          "sticky top-[96px] hidden self-start rounded-lg border border-solid border-rule",
          "bg-bg-form p-card min-[980px]:block",
          className,
        )}
      >
        <div className="grid gap-[.2rem]">
          <h3 className="text-sm font-bold">{COPY.summaryTitle}</h3>
          <p className="text-2xs text-fg-subtle">{headline}</p>
        </div>
        <div className="mt-4">{body}</div>
        {primaryLabel && onPrimary ? (
          <Button className="mt-5" fullWidth size="sm" onClick={onPrimary}>
            {primaryLabel}
          </Button>
        ) : null}
      </aside>
    );
  }

  /* ── מזח תחתון, מובייל ────────────────────────────────────── */

  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 min-[980px]:hidden",
        "border-t border-solid border-rule-control bg-bg-form shadow-sticky",
        "pb-[env(safe-area-inset-bottom)]",
        className,
      )}
      data-configurator-dock=""
    >
      {/*
        הפאנל יושב **מעל** שורת הכותרת ומוסתר ב־hidden ולא ב־height:0.
        אלמנט מוסתר ב־height:0 עם overflow:hidden נשאר בתור הפוקוס, וכל
        כפתור «הסרה» שבתוכו נגיש ב־Tab בזמן שהוא בלתי נראה.
      */}
      <div
        id={panelId}
        hidden={!open}
        className="max-h-[52svh] overflow-y-auto overscroll-contain px-gutter pt-4"
      >
        {body}
      </div>

      <div className="flex items-center gap-2 px-gutter py-[.6rem]">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls={panelId}
          className="flex min-h-[44px] flex-1 items-center gap-2 rounded px-1 text-start text-sm font-semibold"
        >
          <ChevronUp
            aria-hidden="true"
            className={cn(
              "h-[1.1rem] w-[1.1rem] shrink-0 text-accent transition-transform duration-state ease-house",
              open && "rotate-180",
            )}
          />
          <span className="min-w-0 flex-1">
            <span className="block truncate">{COPY.summaryTitle}</span>
            <span className="block truncate text-2xs font-normal text-fg-subtle">{headline}</span>
          </span>
          <span className="sr-only">{open ? COPY.summaryClose : COPY.summaryOpen}</span>
        </button>

        {primaryLabel && onPrimary ? (
          <Button size="sm" onClick={onPrimary}>
            {primaryLabel}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
