/**
 * PhotoFrame — §7.26 (חוק הכיתוב, L-4) ו־§12 (חוזה אפס־הצילומים).
 *
 * הכיוון הנבחר עומד לגמרי בלי צילומים, ומשתפר כשמגיעים כאלה. שני מצבים:
 *
 *   יש src   — <figure> עם <img>, מידות מפורשות מהמניפסט (לא מוקלדות ביד,
 *              הן זזות ברגע שהלקוח שולח קרופ מחליף), ו־<figcaption> חובה.
 *              המבנה של הכיתוב קבוע: מספר · סניף · רחוב · מה קורה · שעה.
 *              אף דוגמה כאן לא ממלאת אותם, כי אף אחד מהם לא אומת.
 *
 *   אין src  — בפיתוח: מסגרת תדריך מסומנת, כדי שהצוות יראה איזו תמונה
 *              הוזמנה ובאיזה יחס. בייצור: null.
 *
 * ההחלטה השנייה היא ההכרעה בין §7.26, שמתאר מסגרת מסומנת גם בלי src, לבין
 * החוק העליון: קומפוננטה שנתקלת בערך חסר משמיטה, ולא מציגה טקסט ממלא מקום
 * למבקר. «המטבח בבוקר · 900×1200» הוא הערת תדריך פנימית. §12.2 גם אוסר
 * מפורשות על מסגרת ריקה כקישוט, וריבוע אפור בעמוד חי הוא בדיוק כשל־היסוד
 * של הכיוון שנפסל. תא ריק ברשת פשוט נסגר, והפריסה נשארת מכוונת.
 *
 * היחסים קשיחים ב־CSS. תמונה שצולמה ביחס אחר תיחתך ב־object-fit ותאבד את
 * הקומפוזיציה, ולכן מתדרכים את הלקוח לפני הצילום ולא אחריו (§7.27).
 */

import * as React from "react";
import { cn } from "@/lib/utils";

export type PhotoRatio = "4/5" | "4/3" | "3/4" | "3/2" | "9/7" | "1200/630";

/* מחרוזות מלאות, לא מורכבות בזמן ריצה — סורק התוכן של Tailwind קורא קוד
   מקור ולא ערכים מחושבים. */
const RATIO: Record<PhotoRatio, string> = {
"4/5": "aspect-[4/5]",
"4/3": "aspect-[4/3]",
"3/4": "aspect-[3/4]",
"3/2": "aspect-[3/2]",
"9/7": "aspect-[9/7]",
"1200/630": "aspect-[1200/630]",
};

const RATIO_NARROW: Record<PhotoRatio, string> = {
"4/5": "max-[860px]:aspect-[4/5]",
"4/3": "max-[860px]:aspect-[4/3]",
"3/4": "max-[860px]:aspect-[3/4]",
"3/2": "max-[860px]:aspect-[3/2]",
"9/7": "max-[860px]:aspect-[9/7]",
"1200/630": "max-[860px]:aspect-[1200/630]",
};

interface PhotoFrameBase extends Omit<React.HTMLAttributes<HTMLElement>, "children"> {
  ratio: PhotoRatio;
  /** מתחת ל־860px היחס מתקפל. ההירו: 4/5 שנסגר ל־4/3. */
  ratioNarrow?: PhotoRatio;
  /** תדריך הצילום: מה מצלמים ובאיזה מידות. פנימי — לא מוצג למבקר. */
  spec: string;
  /** ערך ל־sizes נכתב לכל משבצת פריסה בנפרד, לעולם לא גלובלית. */
  sizes?: string;
}

/**
 * הטיפוס הוא איחוד מכוון: ברגע ש־src קיים, caption, alt, width ו־height
 * הופכים לחובה. זה מה שמפיל את `tsc --noEmit` על תמונה בלי כיתוב (L-4),
 * וזה מה שחוסם לצמיתות תמונות סטוק ותחליפי SVG.
 */
export type PhotoFrameProps =
  | (PhotoFrameBase & {
      src: string;
      alt: string;
      caption: string;
      width: number;
      height: number;
      /** ה־{n} של תבנית הכיתוב. */
      index?: number;
      /** אחת לכל היותר לכל מסלול, ולעולם לא במסלול שההירו שלו הוא טקסט. */
      priority?: boolean;
    })
  | (PhotoFrameBase & {
      src?: undefined;
      alt?: undefined;
      caption?: undefined;
      width?: undefined;
      height?: undefined;
      index?: undefined;
      priority?: undefined;
    });

export const PhotoFrame = React.forwardRef<HTMLElement, PhotoFrameProps>(function PhotoFrame(
  { ratio, ratioNarrow, spec, sizes, className, ...rest },
  ref,
) {
  const { src, alt, caption, width, height, priority, index, ...figureRest } =
    rest as Partial<Extract<PhotoFrameProps, { src: string }>> &
      React.HTMLAttributes<HTMLElement>;

  const frame = cn(
"relative grid place-items-center overflow-hidden rounded",
    RATIO[ratio],
    ratioNarrow && RATIO_NARROW[ratioNarrow],
  );

  if (!src) {
    /* בייצור אין מה להראות, ואין מה למלא. התא נסגר. */
    if (!import.meta.env.DEV) return null;

    return (
      <figure
        ref={ref as React.Ref<HTMLElement>}
        data-photo-brief=""
        className={cn("m-0", className)}
        {...figureRest}
      >
        <div
          className={cn(
            frame,
"bg-[linear-gradient(135deg,var(--paper-2),var(--paper-3))]",
"shadow-[inset_0_0_0_1px_var(--rule)]",
"[[data-band=ink]_&]:bg-[linear-gradient(135deg,#2c2622,#3a332c)]",
          )}
        >
          <span className="max-w-[22ch] p-[1.2rem] text-center font-sans text-xs font-semibold leading-[1.6] tracking-[.06em] text-fg-subtle">
            {spec}
          </span>
        </div>
      </figure>
    );
  }

  return (
    <figure
      ref={ref as React.Ref<HTMLElement>}
      className={cn("m-0", className)}
      {...figureRest}
    >
      <div className={frame}>
        <img
          src={src}
          alt={alt}
          width={width}
          height={height}
          sizes={sizes}
          loading={priority ? "eager" : "lazy"}
          decoding={priority ? "sync" : "async"}
          /* React 18.3 עדיין לא מכיר את ה־prop בכתיב camelCase ומשמיט אותו
             עם אזהרה; הכתיב הקטן עובר כמו שהוא ל־DOM. */
          {...({ fetchpriority: priority ? "high" : "auto" } as Record<string, string>)}
          className="h-full w-full object-cover"
        />
      </div>
      {caption ? (
        <figcaption
          className={cn(
"mt-[.7rem] max-w-caption pt-[.7rem] text-xs leading-[1.6] text-fg-subtle",
"border-t-[length:var(--bw)] border-t-[color:var(--rule)]",
          )}
        >
          {typeof index === "number" ? (
            <span className="num">{index}</span>
          ) : null}
          {typeof index === "number" ? " · " : null}
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
});
