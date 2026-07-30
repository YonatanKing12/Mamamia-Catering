/**
 * ═══════════════════════════════════════════════════════════════════════
 *  MenuSheet — «מהתפריט של המסעדה». סקשן התפריט הטיפוגרפי.
 * ═══════════════════════════════════════════════════════════════════════
 *
 * spec 03 §7.7, spec 01 §3.1 סקשן 01, §3.3.
 *
 * הקומפוננטה החתומה של הכיוון. מנות כטיפוגרפיה, לא ככרטיסים, לא כרשת
 * תמונות ולא כטבלת מחירים. זה גם מה שמאפשר לאתר להיות משכנע לחלוטין
 * בלי ולו צילום אחד — ואין היום אף אחד (§12).
 *
 * ─── מדיניות הקיבוץ, מ־01 §3.3 ─────────────────────────────────
 * מספר המנות הזמינות לקייטרינג הוא שקובע איך העמוד נראה, ולא שיקול עיצובי:
 *
 *   ‎≥ 8   קיבוץ למנות (אנטיפסטי · פסטות · …), כותרת מנה לכל קבוצה.
 *   ‎4–7   רשימה אחת **בלי כותרות מנה**. תפריט קצר הוא תפריט; רשת של
 *          ארבע שורות עם שלוש כותרות ריקות היא לא.
 *   ‎1–3   אותה רשימה קצרה, בלי שורות מנה בהירו.
 *   ‎0     הסקשן **אינו מרונדר**, כותרת כלולה — והעמוד עובר לרג׳יסטר
 *          התפעולי. זה המצב היום: `content/dishes.ts` ריק.
 *
 * ‎`grouping="auto"` מיישם את זה לבד. עמוד שרוצה לכפות התנהגות מעביר
 * ‎"grouped" או "flat" במפורש.
 *
 * ─── מה אין כאן ─────────────────────────────────────────────────
 * אין מנת ברירת מחדל, אין שם מנה בקוד, אין מחיר ואין תג מקור שנוצר כאן.
 * הכול מגיע ב־props מהעמוד. `content/dishes.ts` הוא המקור, והוא ריק —
 * ולכן היום הבאנד הזה מחזיר null בכל מסלול, וזו התנהגות תקינה.
 */

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/primitives";
import { BandSection, type BandTone } from "./section";
import { DishList, type DishLine } from "./dish-list";

export type MenuSheetGrouping = "auto" | "grouped" | "flat";

export interface MenuSheetProps {
  /** ריק ⇒ הבאנד לא מרונדר, כותרת כלולה. */
  dishes: readonly DishLine[];

  id?: string;
  /** הספרה נקבעת בעמוד לפי מיקום (§3.1). */
  num?: string;
  eyebrow?: React.ReactNode;
  title?: React.ReactNode;
  lede?: React.ReactNode;
  tone?: BandTone;

  grouping?: MenuSheetGrouping;
  /** תווית לכל מזהה מנה. בלי מיפוי — אין כותרות מנה, גם ב־"grouped". */
  courseLabel?: Readonly<Record<string, string>>;
  /** סדר הקבוצות. בלי סדר — לפי סדר ההופעה, כפי שמודול התוכן סיפק. */
  courseOrder?: readonly string[];
  /** גרסה מקוצרת: עד N מנות לכל קבוצה (הבית מציג שלוש). */
  perCourseLimit?: number;

  /** «כל התפריטים» → /menus. מרונדר רק כששניהם קיימים. */
  moreHref?: string;
  moreLabel?: string;

  onAdd?: (dish: DishLine) => void;
  addedIds?: readonly string[];
  addLabel?: string;
  addedLabel?: string;

  className?: string;
}

/* ═══════════════════ קיבוץ ═══════════════════ */

interface CourseGroup {
  key: string;
  label: string | null;
  dishes: DishLine[];
}

function group(
  dishes: readonly DishLine[],
  courseLabel: Readonly<Record<string, string>> | undefined,
  courseOrder: readonly string[] | undefined,
  perCourseLimit: number | undefined,
): CourseGroup[] {
  const byKey = new Map<string, DishLine[]>();
  const seen: string[] = [];

  for (const dish of dishes) {
    const key = dish.course ?? "";
    if (!byKey.has(key)) {
      byKey.set(key, []);
      seen.push(key);
    }
    byKey.get(key)!.push(dish);
  }

  const order = courseOrder
    ? [...courseOrder.filter((k) => byKey.has(k)), ...seen.filter((k) => !courseOrder.includes(k))]
    : seen;

  return order.map((key) => {
    const list = byKey.get(key)!;
    return {
      key,
      label: key && courseLabel ? courseLabel[key] ?? null : null,
      dishes: perCourseLimit && perCourseLimit > 0 ? list.slice(0, perCourseLimit) : list,
    };
  });
}

/* ═══════════════════ הבאנד ═══════════════════ */

export function MenuSheet({
  dishes,
  id,
  num,
  eyebrow,
  title,
  lede,
  tone = "paper",
  grouping = "auto",
  courseLabel,
  courseOrder,
  perCourseLimit,
  moreHref,
  moreLabel,
  onAdd,
  addedIds,
  addLabel,
  addedLabel,
  className,
}: MenuSheetProps) {
  /* INV-2 / L-5: בלי מנות אין סקשן, ואין כותרת יתומה מעל כלום. */
  if (dishes.length === 0) return null;

  const everyDishHasCourse = dishes.every((d) => Boolean(d.course));
  const canGroup = Boolean(courseLabel) && everyDishHasCourse;

  /* ‎01 §3.3: הסף הוא שמונה. מתחתיו רשימה אחת בלי כותרות מנה. */
  const grouped =
    grouping === "grouped"
      ? canGroup
      : grouping === "flat"
        ? false
        : canGroup && dishes.length >= 8;

  const flat: CourseGroup = {
    key: "",
    label: null,
    dishes: perCourseLimit && perCourseLimit > 0 ? dishes.slice(0, perCourseLimit) : [...dishes],
  };

  const groups = grouped ? group(dishes, courseLabel, courseOrder, perCourseLimit) : [flat];

  const visible = groups.filter((g) => g.dishes.length > 0);
  if (visible.length === 0) return null;

  return (
    <BandSection
      id={id}
      num={num}
      eyebrow={eyebrow}
      title={title}
      lede={lede}
      tone={tone}
      className={className}
    >
      <div className="menu-leaf grid gap-course">
        {visible.map((g) => (
          <div key={g.key || "all"} className="course">
            {g.label ? (
              /* כותרת המנה: FRL 700 ב־--fs-xl מעל קו דיו — §7.7. */
              <h3 className="m-0 mb-[.9rem] border-b border-solid border-b-[color:var(--fg)] pb-[.5rem] font-serif text-xl font-bold">
                {g.label}
              </h3>
            ) : null}

            <DishList
              dishes={g.dishes}
              onAdd={onAdd}
              addedIds={addedIds}
              addLabel={addLabel}
              addedLabel={addedLabel}
            />
          </div>
        ))}
      </div>

      {moreHref && moreLabel ? (
        <p className="mt-8 max-w-none">
          <Button variant="link" href={moreHref}>
            {moreLabel}
          </Button>
        </p>
      ) : null}
    </BandSection>
  );
}

export type { DishLine, DishMark } from "./dish-list";
