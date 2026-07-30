/**
 * SectionHeader — §7.6.
 *
 * הספרה הסידורית והקו הדק הם מה שמחזיק את הקצב של העמוד. הם שבאים במקום
 * המדליונים המצוירים והצילום שדף קייטרינג רגיל היה שם כאן.
 *
 * אפס אייקונים בתוך כותרות, אפס מדליונים, ואין המרת אותיות לרישיות —
 * היא no-op בעברית ומעוותת כל מילה לטינית משובצת (§4.8).
 *
 * כל חלק נשמט לחוד: בלי eyebrow, בלי מספר או בלי lede הכותרת עדיין נראית
 * מכוונת. בלי כותרת כלל — הקומפוננטה לא מרנדרת דבר, ולכן סקשן שכל השדות
 * שלו ריקים לא מותיר כותרת יתומה.
 *
 * המידה: --measure-max ולא 54ch. §4.5 מודד ש־ch מדווח יתר על עברית ב־24%.
 */

import * as React from "react";
import { cn } from "@/lib/utils";

/* title מוצא מ־HTMLAttributes: שם ה־prop הוא הכותרת, לא tooltip של הדפדפן. */
export interface SectionHeaderProps extends Omit<React.HTMLAttributes<HTMLElement>, "title"> {
  /** מספר הסקשן, למשל "01". מוצג ב־.sec__num עם ספרות טבלאיות. */
  num?: string;
  eyebrow?: React.ReactNode;
  /** בלי כותרת אין כותרת־סקשן. מחזיר null. */
  title?: React.ReactNode;
  lede?: React.ReactNode;
  as?: "h1" | "h2" | "h3";
  /** פרימיטיב התנועה היחיד (§8). כבו אותו רק מעל לקיפול. */
  reveal?: boolean;
}

export const SectionHeader = React.forwardRef<HTMLElement, SectionHeaderProps>(
  function SectionHeader(
    { num, eyebrow, title, lede, as: Heading = "h2", reveal = true, className, ...rest },
    ref,
  ) {
    if (!title) return null;

    const hasMasthead = Boolean(num || eyebrow);

    return (
      <header
        ref={ref as React.Ref<HTMLElement>}
        className={cn("max-w-measure mb-head", reveal && "reveal", className)}
        {...rest}
      >
        {hasMasthead ? (
          <div className="mb-[1.1rem] flex items-center gap-[.9rem]">
            {num ? <span className="sec__num num">{num}</span> : null}
            {eyebrow ? <span className="eyebrow">{eyebrow}</span> : null}
            {/* הקו הדק שהמערכת נשענת עליו במקום צל — §3.4. */}
            <span aria-hidden="true" className="h-px flex-1 bg-rule" />
          </div>
        ) : null}

        <Heading>{title}</Heading>

        {lede ? <p className="lede mt-4">{lede}</p> : null}
      </header>
    );
  },
);
