/**
 * ═══════════════════════════════════════════════════════════════════════
 *  DishCard — כרטיס מנה נבחרת.
 * ═══════════════════════════════════════════════════════════════════════
 *
 * ‎checkbox אמיתי מתחת לפנים חזותיות. אין `div` עם `role="checkbox"`,
 * אין `onKeyDown` ידני: מקש הרווח, `Tab`, מצב הבחירה ותאימות טפסים
 * מגיעים מהדפדפן. אותו דפוס בדיוק כמו `primitives/RadioCard` — הוא נכתב
 * מחדש כאן ולא נעטף, כי כרטיס מנה נושא תמונה, תגיות ותוספת, ו־RadioCard
 * הוא שורת טקסט בכוונה.
 *
 * ─── שלוש הקפדות ────────────────────────────────────────────────
 * 1. **התמונה.** `imageFor()` מ־`content/dish-categories.ts` מחזיר נתיב
 *    מקומי או `null`. `null` ⇒ **אין מסגרת תמונה כלל** — לא ריבוע אפור,
 *    לא placeholder, לא אייקון צלחת. הכרטיס נסגר סביב הטיפוגרפיה
 *    ונראה מכוון וגמור. אין תמונות היום, ולכן זה המצב הפעיל.
 *    ‎`PhotoFrame` בכל זאת מרונדר בענף הריק כדי שבפיתוח תופיע מסגרת
 *    התדריך — בייצור הוא מחזיר `null` בעצמו והתא נסגר.
 *
 * 2. **התוספת.** מוצגת **רק** כששני תנאים מתקיימים: יש סכום מוצהר
 *    (`visibleSurcharge`) **וגם** ההזמנה כולה עברה את שער התמחור
 *    (`showPrices`). מספר בלי הסייג שלו הוא בדיוק הדפוס שנכשל במבחן
 *    הצרכן הסביר, ולכן תג תוספת אינו מוצג לפני שהסייג מוצג בסיכום.
 *    אין «כלול במחיר» כשאין תוספת, אין «₪0», אין מקום ריק שמור.
 *
 * 3. **החסימה.** כרטיס שחסום נשאר בתור הפוקוס (`aria-disabled` ולא
 *    `disabled`), וההסבר יושב בשורה החיה של הקטגוריה. קליק שלא קורה בו
 *    כלום הוא הכשל השקט שהמפרט אוסר.
 */

import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Money, PhotoFrame } from "@/components/primitives";
import { dietaryLabels, provenanceMark } from "@/content/dishes";
import { imageFor, visibleSurcharge, type ConfiguratorDish } from "@/content/packages";
import { COPY } from "./copy";

export interface DishCardProps {
  dish: ConfiguratorDish;
  /** שם ה־group של הקטגוריה, לצורך הגשה ולניווט מקלדת. */
  name: string;
  checked: boolean;
  /** חסום: הגענו לתקרה והמנה הזאת אינה נבחרת. */
  blocked?: boolean;
  /** נבחרה מעבר למכסה הכלולה של הקטגוריה. */
  overQuota?: boolean;
  /**
   * האם ההזמנה כולה עברה את שער התמחור. מגיע מלמעלה, מ־`priceSelection()`
   * היחיד — הכרטיס לא בודק מחירון בעצמו, אחרת היה כאן שער שני שיסטה.
   */
  showPrices?: boolean;
  onToggle(): void;
  className?: string;
}

export function DishCard({
  dish,
  name,
  checked,
  blocked = false,
  overQuota = false,
  showPrices = false,
  onToggle,
  className,
}: DishCardProps) {
  const image = imageFor(dish);
  const surcharge = showPrices ? visibleSurcharge(dish) : null;
  const dietary = dietaryLabels(dish);
  const mark = provenanceMark(dish);
  const inert = blocked && !checked;

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (inert) {
      event.preventDefault();
      return;
    }
    onToggle();
  };

  return (
    <label
      className={cn("relative block", inert ? "cursor-not-allowed" : "cursor-pointer", className)}
      data-dish={dish.id}
    >
      {/* מוסתר חזותית, לא מהמקלדת ולא מקורא המסך. */}
      <input
        type="checkbox"
        name={name}
        value={dish.id}
        checked={checked}
        onChange={handleChange}
        aria-disabled={inert || undefined}
        className="peer absolute h-0 w-0 opacity-0"
      />

      <span
        className={cn(
          "flex h-full min-h-[44px] flex-col overflow-hidden rounded-lg border border-solid",
          "border-rule-control bg-bg-form text-fg",
          "transition-[background-color,border-color,color] duration-state ease-house",
          "peer-hover:border-fg-subtle",
          /* מצב נבחר: מילוי ענבר מלא. הניגודיות היחידה החוקית עליו היא
             ‎--accent-fg; לבן על ‎#F39402 הוא 2.32:1. */
          "peer-checked:border-accent peer-checked:bg-accent peer-checked:text-accent-foreground",
          "peer-focus-visible:outline peer-focus-visible:outline-2",
          "peer-focus-visible:outline-offset-2 peer-focus-visible:outline-focus",
          inert && "opacity-[.55]",
        )}
      >
        {/*
          שני ענפים ולא spread: הטיפוס של PhotoFrame הוא איחוד שבו src
          גורר alt, caption, width ו־height — וזה בדיוק מה שמפיל
          `tsc --noEmit` על תמונה בלי כיתוב.

          המידות והכיתוב אינם ידועים ממודול התוכן (הוא מחזיק נתיב בלבד),
          ולכן הענף עם התמונה יחווט כשמניפסט הצילומים ינחת. עד אז הענף
          הפעיל הוא הריק, וזה נכון: אין צילומים.
        */}
        {image ? null : (
          <PhotoFrame ratio="4/3" spec={`מנה · ${dish.nameHe} · 800×600`} className="shrink-0" />
        )}

        <span className="flex flex-1 flex-col gap-[.35rem] p-[.9rem]">
          <span className="flex items-start gap-2">
            <span
              aria-hidden="true"
              className={cn(
                /* `peer-checked:` דורש אח, לא צאצא — התיבה הזאת יושבת
                   בתוך הפָּנים ולכן היא נצבעת ממצב React ולא מהסלקטור. */
                "mt-[.15em] grid h-[1.15rem] w-[1.15rem] shrink-0 place-items-center",
                "rounded-sm border border-solid border-rule-control",
                checked && "border-current",
              )}
            >
              {checked ? <Check className="h-[.85rem] w-[.85rem]" strokeWidth={3} /> : null}
            </span>
            <span className="max-w-dish text-sm font-semibold leading-dish">{dish.nameHe}</span>
          </span>

          {dish.descriptionHe ? (
            <span
              className={cn(
                "block max-w-dish text-xs leading-tight",
                checked ? "text-current opacity-90" : "text-fg-subtle",
              )}
            >
              {dish.descriptionHe}
            </span>
          ) : null}

          {dietary.length > 0 ? (
            <span
              className={cn(
                "mt-auto flex flex-wrap gap-[.3rem] pt-[.2rem] text-3xs",
                checked ? "text-current opacity-90" : "text-fg-subtle",
              )}
            >
              {dietary.map((label) => (
                <span
                  key={label}
                  className="rounded-pill border border-solid border-current px-[.5rem] py-[.1rem] opacity-80"
                >
                  {label}
                </span>
              ))}
            </span>
          ) : null}

          {/* תוספת — רק כשיש סכום מוצהר וגם שער התמחור נפתח. */}
          {surcharge !== null ? (
            <span className="text-xs font-semibold">
              בתוספת <Money value={surcharge} />
            </span>
          ) : null}

          {/* «מעבר למכסה» היא עובדה על הבחירה ולא הצהרת מחיר, ולכן היא
              מוצגת גם בלי מחירון. */}
          {checked && overQuota ? (
            <span className="text-3xs font-semibold uppercase tracking-[.06em]">
              {COPY.quotaOverMark}
            </span>
          ) : null}

          {/* תג המקור — רק כשיש קישור לתפריט המסעדה החי. הוא אינו קישור
              כאן: עוגן בתוך label גונב את הקליק מה־checkbox. */}
          {mark ? (
            <span
              className={cn(
                "text-3xs leading-tight",
                checked ? "text-current opacity-90" : "text-fg-subtle",
              )}
            >
              {mark.labelHe}
            </span>
          ) : null}
        </span>
      </span>
    </label>
  );
}
