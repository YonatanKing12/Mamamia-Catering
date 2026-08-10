/**
 * BackToTop — 03 §13.3 ("drop the gold fill and the pill radius; keep the control").
 *
 * ─────────────────────────────────────────────────────────────────────
 *  מה נמחק מהגרסה הקודמת, ולמה
 * ─────────────────────────────────────────────────────────────────────
 * ‎**שמות המחלקות שנמחקו אינם כתובים כאן כלשונם, במכוון.** ה־extractor של
 * Tailwind סורק את הקובץ כטקסט ואינו יודע מהי הערה: מחלקה שמוזכרת בהערה
 * שמסבירה שהיא נמחקה — נפלטת מחדש לגיליון. ארבע מחלקות מתות (מילוי הזהב,
 * ה־hover שלו, רדיוס הגלולה והצל) ייצרו כך ‎1.3KB של CSS שאיש אינו משתמש
 * בו, כולל תכונה **פיזית** שכל הבית אוסר. לכן: תיאור, לא טוקן.
 *
 *  · מילוי הזהב וה־hover שלו — יחס ניגודיות ‎2.25:1. הטוקן עצמו נמחק (§2.1).
 *  · רדיוס הגלולה — L-11: הרדיוס בבית הזה הוא 3px. הגליל היחיד הוא ה־tag.
 *  · הצל הגדול ו־hover-lift — L-8: אין צללים, ואין הרמה של 10px.
 *  · `<i class="fas fa-chevron-up">` — ה־<link> של Font Awesome נמחק
 *    (§13.3), ולכן האייקון היה נעלם לגמרי. במקומו SVG מוטבע, מוסתר
 *    מעץ הנגישות ועם focusable="false" (§10.8).
 *  · מיקום פיזי משמאל — L-12. במקומו `start-8`, שהוא inset-inline-start,
 *    ולכן הפקד יושב בפינה הנכונה גם אם הכיוון מתהפך אי פעם.
 *  · `useScroll` — ההוק ההוא מחזיק state שמתעדכן בכל פיקסל גלילה ושבעה
 *    צרכנים נרשמים אליו (§13.3). כאן מאזין מקומי, passive, מווסת ב־rAF,
 *    שכותב state רק כשהסף באמת נחצה.
 *
 * ─────────────────────────────────────────────────────────────────────
 *  למה הוא מוסתר בנייד
 * ─────────────────────────────────────────────────────────────────────
 * ‎`StickyCta` (§7.29) תופס את תחתית המסך מתחת ל־760px, כולל את הפינה
 * שהפקד הזה היה יושב בה. שני פקדים צפים באותה פינה הם התנגשות מגע, ולכן
 * הוא נכנס רק מ־761px ומעלה — בדיוק היכן שהפס הדביק לא קיים.
 *
 * ─────────────────────────────────────────────────────────────────────
 *  פוקוס
 * ─────────────────────────────────────────────────────────────────────
 * גלילה בלי הזזת פוקוס משאירה משתמש מקלדת בעומק העמוד. הפקד מחזיר את
 * הפוקוס ל־`#main` (ל־PageShell יש שם `tabIndex={-1}`), כך שה־Tab הבא
 * ממשיך מראש התוכן ולא מהמקום שממנו גללנו.
 *
 * אפס עובדות עסקיות בקובץ הזה, ואין בו מספר טלפון.
 */

import * as React from "react";
import { cn } from "@/lib/utils";

export interface BackToTopProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** כמה גלילה נדרשת לפני שהפקד מופיע. ברירת מחדל: מסך אחד. */
  threshold?: number;
}

/** חץ מעלה. אנכי, ולכן אינו רגיש לכיוון ואינו מתהפך ב־RTL (§9.2). */
const ChevronUp = () => (
  <svg
    viewBox="0 0 24 24"
    width="18"
    height="18"
    aria-hidden="true"
    focusable="false"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="square"
  >
    <path d="M5 15l7-7 7 7" />
  </svg>
);

export const BackToTop = React.forwardRef<HTMLButtonElement, BackToTopProps>(
  function BackToTop({ threshold, className, onClick, ...rest }, ref) {
    const [visible, setVisible] = React.useState(false);

    React.useEffect(() => {
      let frame = 0;

      const read = () => {
        frame = 0;
        const limit = threshold ?? window.innerHeight;
        setVisible(window.scrollY > limit);
      };

      /* rAF: הגלילה יורה עשרות פעמים בפריים, ו־setState בכל אחת מהן היא
         בדיוק הכשל שבגללו ההוק הישן נמחק. */
      const onScroll = () => {
        if (frame === 0) frame = window.requestAnimationFrame(read);
      };

      read();
      window.addEventListener("scroll", onScroll, { passive: true });
      return () => {
        window.removeEventListener("scroll", onScroll);
        if (frame) window.cancelAnimationFrame(frame);
      };
    }, [threshold]);

    /* רינדור מותנה, לא opacity:0 — פקד שקוף שנשאר בתור ה־Tab הוא בדיוק
       התקלה שנמחקה יחד עם סרגל הנגישות (§10.3). */
    if (!visible) return null;

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(e);
      if (e.defaultPrevented) return;

      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });

      const main = document.getElementById("main");
      if (main) (main as HTMLElement).focus({ preventScroll: true });
    };

    return (
      <button
        ref={ref}
        type="button"
        onClick={handleClick}
        aria-label="חזרה לראש העמוד"
        data-print="hide"
        className={cn(
          /* מוצג רק היכן שהפס הדביק אינו — ראו הערת הראש. */
"fixed bottom-8 start-8 z-40 hidden min-[761px]:inline-flex",
"h-12 w-12 items-center justify-center print:hidden",
          /* rounded = 3px (§3.2). המסגרת היא --rule-control (3.69:1): היא
             הדבר היחיד שמזהה את הפקד, ולכן 1.4.11 חל עליה ו---rule אסורה. */
"rounded border border-solid border-rule-control bg-bg text-fg",
"transition-[color,border-color] duration-state ease-house",
"hover:border-accent hover:text-accent",
          className,
        )}
        {...rest}
      >
        <ChevronUp />
      </button>
    );
  },
);

export default BackToTop;
