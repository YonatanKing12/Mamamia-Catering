/**
 * ═══════════════════════════════════════════════════════════════════════
 *  CategoryStep — קטגוריה אחת, רשת מנות, ומשוב מכסה חי.
 * ═══════════════════════════════════════════════════════════════════════
 *
 * שורת המכסה היא **גם** התצוגה החזותית **וגם** אזור ה־`aria-live`. אלמנט
 * אחד, לא שניים: שכפול של אותו טקסט לתוך `sr-only` נפרד מייצר הכרזה
 * כפולה בקוראי מסך מסוימים, ומתפצל מהתצוגה ברגע שמישהו יערוך רק אחת
 * מהשתיים.
 *
 * ‎`aria-live="polite"` ולא `assertive`: המבקר יזם את השינוי בעצמו, והוא
 * לא צריך שיקטעו לו את ההקראה הנוכחית בשביל לאשר לו את זה.
 *
 * ─── מאיפה מגיעים המספרים ───────────────────────────────────────
 * **לא מכאן.** המכסה, התקרה, מספר הנבחרות והחריגה מגיעים כולם משורת
 * ה־`ResolvedCategory` של `resolveSelection()` ב־`content/packages.ts`.
 * הקומפוננטה מרכיבה מהם משפט עברי דרך `<Num>` ולא מחשבת מחדש כלום —
 * מכסה שמחושבת בשני מקומות תסטה, והמספר הזה הוא התחייבות מסחרית.
 *
 * ─── כלל החריגה, ואיך הוא נראה ─────────────────────────────────
 * חריגה אסורה — הכרטיסים שלא נבחרו מקבלים `aria-disabled`, והשורה החיה
 * מסבירה **למה** ומה לעשות. אין קליק שלא קורה בו כלום.
 * חריגה מותרת — אפשר לבחור עוד; המנות שמעבר למכסה מסומנות, וסכום מוצג
 * רק כששער התמחור נפתח.
 */

import * as React from "react";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Money, Num } from "@/components/primitives";
import type { CategoryId, DishId, ResolvedCategory } from "@/content/packages";
import { COPY, ERRORS, quotaSentence, remainingSentence } from "./copy";
import { DishCard } from "./dish-card";
import { dishesForCategory } from "@/content/packages";

export interface CategoryStepProps {
  /** שורת הקטגוריה מתוך `resolveSelection()`. מקור כל המספרים כאן. */
  line: ResolvedCategory;
  onToggle(categoryId: CategoryId, dishId: DishId): "added" | "removed" | "blocked";
  /** האם ההזמנה עברה את שער התמחור. עובר הלאה לכרטיסים. */
  showPrices?: boolean;
  /** מוצג אחרי ניסיון להתקדם מקטגוריית חובה ריקה. */
  showRequiredError?: boolean;
  headingId: string;
  className?: string;
}

export function CategoryStep({
  line,
  onToggle,
  showPrices = false,
  showRequiredError = false,
  headingId,
  className,
}: CategoryStepProps) {
  const { category, dishes, count, quota, max, extras } = line;
  const pool = dishesForCategory(category);
  const chosenIds = new Set(dishes.map((d) => d.id));

  /* התקרה. `null` ⇒ אין תקרה מוצהרת, כלומר אפשר להמשיך לבחור.
     ההכרעה עצמה יושבת ב־`maxFor()`; כאן רק קוראים את התוצאה. */
  const canAddMore = max === null || count < max;
  const remaining = remainingSentence(Math.max(0, quota - count));

  /**
   * הודעת חסימה חד־פעמית. נכתבת לאותה שורה חיה כדי שקורא מסך ישמע את
   * הסיבה מיד אחרי הניסיון, ונמחקת ברגע שהמבקר משנה משהו — הודעה
   * שנשארת דבוקה הופכת לרעש.
   */
  const [blockedNotice, setBlockedNotice] = React.useState(false);

  const handleToggle = (dishId: DishId) => {
    setBlockedNotice(onToggle(category.id, dishId) === "blocked");
  };

  return (
    <div className={cn("grid gap-4", className)}>
      <div className="grid gap-[.4rem]">
        <h3
          id={headingId}
          data-step-heading=""
          tabIndex={-1}
          className="text-xl font-bold leading-sub outline-none"
        >
          {category.nameHe}
          {category.required ? (
            <>
              <span aria-hidden="true" className="ms-[.3em] text-accent">
                *
              </span>
              <span className="sr-only"> {COPY.quotaRequired}</span>
            </>
          ) : null}
        </h3>

        {category.noteHe ? (
          <p className="max-w-body text-xs text-fg-subtle">{category.noteHe}</p>
        ) : null}
      </div>

      {/*
        שורת המכסה. אלמנט יחיד — תצוגה והכרזה גם יחד.
        אין מקף בין שני רצפי ספרות: «נבחרו 5 מתוך 7» מפריד אותם במילה
        עברית, ולכן אין היפוך ואין צורך במכולת LTR.
      */}
      <p
        aria-live="polite"
        className={cn(
"flex flex-wrap items-center gap-x-[.6rem] gap-y-[.25rem]",
"rounded border border-solid border-rule bg-bg-alt px-[.9rem] py-[.6rem]",
"text-sm font-semibold",
          extras > 0 && "border-accent",
        )}
      >
        <span>
          נבחרו <Num inline>{count}</Num> מתוך <Num inline>{quota}</Num>
        </span>

        {remaining ? <span className="text-xs font-normal text-fg-subtle">{remaining}</span> : null}

        {extras > 0 ? (
          <span className="text-xs font-normal text-accent">
            <Num inline>{extras}</Num> {extras === 1 ? "מנה" : "מנות"} {COPY.quotaOverMark}
            {/* סכום החריגה — רק כשהחריגה מותרת, יש לה מחיר מוצהר, ושער
                התמחור של ההזמנה כולה נפתח. */}
            {showPrices &&
            category.overQuota.allowed &&
            typeof category.overQuota.surchargePerExtra === "number" ? (
              <>
                {" · "}
                <Money value={category.overQuota.surchargePerExtra} /> לסועד
              </>
            ) : null}
          </span>
        ) : null}

        {blockedNotice && !canAddMore ? (
          <span className="flex items-center gap-[.35rem] text-xs font-normal text-danger">
            <AlertCircle aria-hidden="true" className="h-[1em] w-[1em] shrink-0" />
            {COPY.quotaBlockedNote}
          </span>
        ) : null}

        {showRequiredError && category.required && count === 0 ? (
          <span
            role="alert"
            className="flex items-center gap-[.35rem] text-xs font-normal text-danger"
          >
            <AlertCircle aria-hidden="true" className="h-[1em] w-[1em] shrink-0" />
            {ERRORS.requiredCategory}
          </span>
        ) : null}

        {/* לקורא מסך שקורא את השורה מחוץ להקשר ההכרזה. */}
        <span className="sr-only">{quotaSentence(count, quota)}</span>
      </p>

      <div
        role="group"
        aria-labelledby={headingId}
        className="grid grid-cols-2 gap-grid min-[720px]:grid-cols-3 min-[1100px]:grid-cols-4"
      >
        {pool.map((dish) => {
          const checked = chosenIds.has(dish.id);
          const index = dishes.findIndex((d) => d.id === dish.id);
          return (
            <DishCard
              key={dish.id}
              dish={dish}
              name={`cat-${category.id}`}
              checked={checked}
              blocked={!canAddMore}
              /* «מעבר למכסה» נקבע לפי המיקום ברשימה הפתורה מול המכסה,
                 ולא לפי חישוב עצמאי. */
              overQuota={index >= 0 && index >= quota}
              showPrices={showPrices}
              onToggle={() => handleToggle(dish.id)}
            />
          );
        })}
      </div>
    </div>
  );
}
