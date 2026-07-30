/**
 * ═══════════════════════════════════════════════════════════════════════
 *  שורת המנה ורשימת המנות — הספַּיין של הכיוון.
 * ═══════════════════════════════════════════════════════════════════════
 *
 * spec 03 §7.7, spec 01 §3.2. זהו הרכיב החוזר ביותר באתר, והדבר שהכיוון
 * («תפריט») קרוי על שמו. הוא יושב ב־MenuSheet, בתוך כרטיס פורמט שירות,
 * בגיליון ההדפסה, ובכל מקום שבו יש שמות מנות.
 *
 * ─── למה רשת ולא שורת טקסט ─────────────────────────────────────
 * שם עברי ומחיר לטיני על אותו קו בסיס הם משטח הדו־כיווניות המסוכן ביותר
 * באתר. השם והמחיר הם **תאים נפרדים ברשת**, ולכן שום אלגוריתם bidi לא
 * רואה אותם כפסקה אחת ואין ביניהם סידור מחדש (§4.9). זו לא נוחות פריסה,
 * זה התיקון.
 *
 * ─── למה קו תחתון מקווקו ולא נקודות ────────────────────────────
 * רצף של תווי `.` נשבר תחת סידור מחדש RTL, מוכרז כרעש בקורא מסך, ולא
 * ניתן למרכוז מול קו בסיס עברי. `border-bottom: 1px dotted` נותן בדיוק
 * את אותו אפקט של תפריט מודפס, אדיש לכיוון, ומוכרז כלא כלום.
 *
 * ─── התנוונות (L-6), לפי הסדר ──────────────────────────────────
 *   אין מחיר    → תא המחיר לא מרונדר; הרשת מתכווצת ל־1fr, והשורה נקראת
 *                 כשורת תפריט שף. זו מוסכמה לגיטימית של מסעדה.
 *   אין תיאור   → השם והמחיר לבד על הקו — הצורה הצפופה והטובה ביותר.
 *   אין תג מקור → מושמט בשקט. לעולם לא «זמין ברוב הסניפים».
 *   אין מנות    → הרשימה מחזירה null, והסקשן שמכיל אותה נעלם איתה.
 *
 * ─── מה הרכיב הזה לא עושה ───────────────────────────────────────
 * הוא לא ממציא מנה, לא ממציא מחיר, ולא מחשב תג מקור. `price` ו־`mark`
 * מגיעים כ־props מהעמוד, שהוא היחיד שיודע אם `dish.branches` ו־
 * `liveMenuUrl` מצדיקים תג (01 §3.2). בלי הנתון — אין תג, ולא ניסוח מרוכך.
 */

import * as React from "react";
import { cn } from "@/lib/utils";
import { Money } from "@/components/primitives";

/* ═══════════════════ טיפוסים ═══════════════════ */

/**
 * תג המקור. הניסוח נקבע בעמוד לפי 01 §3.2:
 *   יש `liveMenuUrl` לסניף  → «מוגש היום ב{סניף}», קישור לתפריט החי.
 *   יש סניף בלי קישור       → «מהמטבח ב{סניף}», קישור לעמוד הסניף.
 *   אין סניף                → אין תג בכלל.
 * המילה «היום» לא נכתבת בלי קישור חי שמגבה אותה.
 */
export interface DishMark {
  labelHe: string;
  href?: string | null;
}

/**
 * שורת מנה. תואם מבנית ל־`Dish` מ־`content/dishes.ts` — עמוד יכול
 * להעביר מנה עם `mark` ו־`price` שנוספו, בלי מיפוי שדות.
 */
export interface DishLine {
  id: string;
  nameHe: string;
  descriptionHe?: string | null;
  /** מזהה מנה. משמש לקיבוץ ב־MenuSheet. */
  course?: string | null;
  /** מחיר לסועד. `null` הוא המצב התקין — תא המחיר פשוט לא קיים. */
  price?: number | null;
  mark?: DishMark | null;
}

export interface DishListProps extends React.HTMLAttributes<HTMLUListElement> {
  dishes: readonly DishLine[];
  /**
   * «הוסיפו לתפריט שלי» — המחויבות הזעירה נטולת המידע האישי (01 §3.2).
   * בלי handler הפקד לא קיים; זו לא תכונה שנופלת בשקט, זה עמוד אחר.
   */
  onAdd?: (dish: DishLine) => void;
  addedIds?: readonly string[];
  addLabel?: string;
  addedLabel?: string;
}

/* ═══════════════════ הפקד «הוסיפו לתפריט שלי» ═══════════════════ */

/**
 * גלוי תמיד במגע, ומופיע ב־hover/focus במכשירי הצבעה (§7.7).
 * אפשרות שמתגלה רק ב־hover אינה נגישה במכשיר שבו נוחת רוב התנועה כאן.
 * המצב הנבחר הוא `aria-pressed` + שינוי טקסט + סימן וי — לעולם לא צבע לבד.
 */
function AddToBrief({
  dish,
  added,
  onAdd,
  addLabel,
  addedLabel,
}: {
  dish: DishLine;
  added: boolean;
  onAdd: (dish: DishLine) => void;
  addLabel: string;
  addedLabel: string;
}) {
  return (
    <div className="col-start-1 mt-[.4rem]">
      <button
        type="button"
        aria-pressed={added}
        onClick={() => onAdd(dish)}
        className={cn(
          "inline-flex min-h-[44px] items-center gap-[.4rem] text-2xs font-semibold",
          "underline decoration-rule underline-offset-[.22em] hover:decoration-accent",
          "transition-opacity duration-state ease-house",
          /* במכשיר הצבעה: מופיע על ריחוף, על מיקוד בתוך השורה, ועל מיקוד
             של הפקד עצמו. במגע — תמיד גלוי, כי אין hover. */
          !added &&
            "[@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100 " +
              "[@media(hover:hover)]:group-focus-within:opacity-100 " +
              "[@media(hover:hover)]:focus-visible:opacity-100",
          added ? "text-fg" : "text-fg-subtle",
        )}
      >
        {added ? (
          <svg
            viewBox="0 0 16 16"
            aria-hidden="true"
            focusable="false"
            className="h-[11px] w-[11px]"
          >
            <path
              d="M2.5 8.5l3.5 3.5 7.5-8"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="square"
            />
          </svg>
        ) : null}
        {added ? addedLabel : addLabel}
        <span className="sr-only"> — {dish.nameHe}</span>
      </button>
    </div>
  );
}

/* ═══════════════════ הרשימה ═══════════════════ */

export function DishList({
  dishes,
  onAdd,
  addedIds,
  addLabel = "הוסיפו לתפריט שלי",
  addedLabel = "בתפריט שלכם",
  className,
  ...rest
}: DishListProps) {
  if (dishes.length === 0) return null;

  const added = new Set(addedIds ?? []);

  return (
    <ul className={cn("m-0 list-none p-0", className)} {...rest}>
      {dishes.map((dish) => {
        const hasPrice = typeof dish.price === "number" && Number.isFinite(dish.price);
        const mark = dish.mark;

        return (
          <li
            key={dish.id}
            className={cn(
              "dish group m-0 grid items-baseline gap-x-[.9rem] py-[.7rem]",
              "border-b border-dotted border-b-[color:var(--rule)] last:border-b-0",
              hasPrice ? "grid-cols-[1fr_auto]" : "grid-cols-[1fr]",
            )}
          >
            <p className="dish__name col-start-1 m-0 max-w-none font-serif text-lg font-medium leading-dish">
              {dish.nameHe}
            </p>

            {hasPrice ? (
              <p className="dish__price col-start-2 row-start-1 m-0 max-w-none font-serif text-lg font-medium">
                <Money value={dish.price as number} />
              </p>
            ) : null}

            {dish.descriptionHe ? (
              <p className="dish__desc col-start-1 m-0 mt-[.15rem] max-w-dish text-xs leading-[1.5] text-fg-muted">
                {dish.descriptionHe}
              </p>
            ) : null}

            {mark ? (
              <p className="dish__mark col-start-1 m-0 mt-[.35rem] max-w-none text-2xs font-semibold tracking-[.09em] text-accent">
                {mark.href ? (
                  <a
                    href={mark.href}
                    className="text-accent decoration-[color:var(--accent)] underline-offset-[.22em]"
                  >
                    {mark.labelHe}
                  </a>
                ) : (
                  mark.labelHe
                )}
              </p>
            ) : null}

            {onAdd ? (
              <AddToBrief
                dish={dish}
                added={added.has(dish.id)}
                onAdd={onAdd}
                addLabel={addLabel}
                addedLabel={addedLabel}
              />
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
