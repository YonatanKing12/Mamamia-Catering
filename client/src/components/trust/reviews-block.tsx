/**
 * ═══════════════════════════════════════════════════════════════════════
 *  ReviewsBlock — הדירוג, המונה, הקישור לפרופיל, והציטוטים.
 * ═══════════════════════════════════════════════════════════════════════
 *
 * ‎`docs/spec/04-visual-reference.md` §5: בקטגוריה הזאת מונה ביקורות גלוי
 * הוא אות האמון המרכזי, ואצלנו הוא חסר לגמרי. הבלוק הזה הוא המקום שבו
 * הוא ייכנס — **ברגע שיימסר**.
 *
 * ‎`content/proof.ts` ריק היום, ולכן `ReviewsBlock` מחזיר `null` ואינו
 * תופס שום מקום בעמוד. אין דירוג לדוגמה, אין כוכבים אפורים, ואין
 * «עוד לא התקבלו ביקורות» — משפט כזה הוא הפסד המרה שנכתב ביד.
 *
 * ─────────────────────────────────────────────────────────────────────
 *  למה אין כאן וידג'ט של צד שלישי, למרות שאתר האסמכתה מריץ אחד
 * ─────────────────────────────────────────────────────────────────────
 * וידג'ט ביקורות מוטמע (Trustindex, Elfsight וכל השאר) טוען סקריפט
 * מדומיין זר בכל טעינת דף. הדפדפן של כל מבקר שולח לאותו דומיין כתובת IP,
 * User-Agent ו־Referer — כלומר אנחנו מעבירים מידע אישי למעבד נוסף.
 * דף הפרטיות שלנו מונה את המעבדים שלנו, ומעבד שאינו מנוי שם ופועל בכל
 * זאת הוא סתירה בין מה שכתוב לבין מה שרץ. זו גם עוד בקשת רשת חוסמת
 * בעמוד שכל תפקידו להמיר תנועה בתשלום.
 *
 * הצורה הנכונה: המספרים בטקסט שלנו, וקישור יוצא לפרופיל הציבורי כדי
 * שכל אחד יוכל לאמת בעצמו. זה גם מה שמנוע תשובות יכול לצטט — טקסט
 * בעמוד, לא iframe.
 *
 * ─────────────────────────────────────────────────────────────────────
 *  נתונים מובנים
 * ─────────────────────────────────────────────────────────────────────
 * הבלוק הזה **אינו** פולט JSON-LD. `lib/seo.ts` מוחק בכוח
 * ‎`aggregateRating`, `review` ו־`ratingValue` מכל צומת (spec 01 §7.3),
 * וזה נכון כל עוד אין ביקורות אמיתיות. שחרור המפתחות האלה הוא החלטה
 * נפרדת בקובץ ההוא, ובבעלות אחרת.
 */

import * as React from "react";
import { cn } from "@/lib/utils";
import { Num, SectionHeader } from "@/components/primitives";
import {
  googleReviews,
  publishableTestimonials,
  type GoogleReviewProfile,
  type Testimonial,
} from "@/content/proof";

/* ═══════════════════ הכוכבים ═══════════════════ */

const STAR_PATH =
  "M12 2.6l2.72 5.51 6.08.89-4.4 4.29 1.04 6.06L12 16.49l-5.44 2.86 1.04-6.06-4.4-4.29 6.08-.89z";

function StarRow({ className }: { className?: string }) {
  return (
    <span className={cn("flex", className)}>
      {[0, 1, 2, 3, 4].map((i) => (
        <svg
          key={i}
          viewBox="0 0 24 24"
          width="18"
          height="18"
          fill="currentColor"
          className="block shrink-0"
        >
          <path d={STAR_PATH} />
        </svg>
      ))}
    </span>
  );
}

/**
 * הכוכבים הם **גרפיקה**, לא טקסט: `aria-hidden`, והמשמעות נמסרת במספר
 * שלצידם. המכולה נושאת `dir="ltr"` בכוונה — מילוי חלקי מתקדם משמאל
 * לימין בכל תרבות שמכירה את הסימן הזה, וכיוון הדף לא אמור להפוך אותו.
 * המדידה עצמה נעשית ב־`inset-inline-start`, ולכן אין כאן `left`.
 */
function Stars({ value }: { value: number }) {
  const pct = Math.max(0, Math.min(100, (value / 5) * 100));
  return (
    <span dir="ltr" aria-hidden="true" className="relative inline-flex shrink-0">
      <StarRow className="text-fg-decor" />
      <span
        className="absolute inset-y-0 start-0 flex overflow-hidden text-accent"
        style={{ width: `${pct}%` }}
      >
        <StarRow />
      </span>
    </span>
  );
}

/* ═══════════════════ עזרים ═══════════════════ */

/** ISO → DD.MM.YYYY. בלי `new Date` — פירסור UTC משבש תאריכים ישראליים. */
function displayDate(iso: string): string | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim());
  return m ? `${m[3]}.${m[2]}.${m[1]}` : null;
}

/** «4.8» ולא «4.80» ולא «5.0». הדירוג מוצג כפי שגוגל מציג אותו. */
const displayRating = (v: number): string =>
  Number.isInteger(v) ? String(v) : v.toFixed(1);

/**
 * קיבוץ אלפים עם locale מפורש — `toLocaleString()` בלי ארגומנט נפתר
 * ללוקאל של זמן הריצה והפלט הופך ללא־דטרמיניסטי בין סביבות.
 * סימני הכיוון ש־Intl מזריק מוסרים: המכולה (`Num`) כבר נושאת בידוד,
 * ו־RLM בתוכה רק מסבך את סדר הרצף (ראו ההסבר ב־`primitives/ltr.tsx`).
 */
const grouped = new Intl.NumberFormat("he-IL");
const displayCount = (n: number): string => grouped.format(n).replace(/[‎‏]/g, "");

/* ═══════════════════ הדירוג ═══════════════════ */

function RatingSummary({ data }: { data: GoogleReviewProfile }) {
  const captured = displayDate(data.capturedOn);

  return (
    <div className="flex flex-col gap-[.6rem]">
      <div className="flex flex-wrap items-center gap-x-[.7rem] gap-y-[.4rem]">
        <span className="text-xl font-bold leading-none text-fg">
          <Num>{displayRating(data.ratingValue)}</Num>
        </span>
        <Stars value={data.ratingValue} />
        {/* הכוכבים חסומים לקורא מסך, ולכן המשמעות נמסרת כאן במילים. */}
        <span className="sr-only">
          דירוג <Num>{displayRating(data.ratingValue)}</Num> מתוך <Num>5</Num>
        </span>
        <span className="text-sm font-semibold text-fg-muted">
          <Num inline>{displayCount(data.reviewCount)}</Num> ביקורות
        </span>
      </div>

      {/* מה בדיוק דורג — כלשון הבעלים. ראו ההסבר ב־content/proof.ts. */}
      <p className="m-0 text-xs leading-[1.6] text-fg-subtle">{data.subjectHe}</p>

      <p className="m-0 flex flex-wrap items-center gap-x-[.6rem] gap-y-[.25rem] text-xs">
        <a
          href={data.profileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-accent underline underline-offset-[.22em]"
        >
          לקריאת הביקורות בגוגל
        </a>
        {captured ? (
          <span className="text-fg-subtle">
            נבדק ב־<Num inline>{captured}</Num>
          </span>
        ) : null}
      </p>
    </div>
  );
}

/* ═══════════════════ הציטוטים ═══════════════════ */

/**
 * ציטוט מרונדר **כלשונו**, ורק אחרי ש־`publishableTestimonials()` אישר
 * שיש רשומת הסכמה בכתב. הסינון קורה במודול התוכן ולא כאן, כדי שלא
 * תיווצר דרך עוקפת דרך prop.
 */
function Quote({ item }: { item: Testimonial }) {
  const meta = [item.attributionHe, item.eventTypeHe].filter(
    (v): v is string => typeof v === "string" && v.trim().length > 0,
  );

  return (
    <figure
      className={cn(
        "m-0 rounded-card border border-solid border-[color:var(--rule)]",
        "bg-bg-alt p-[1.1rem]",
      )}
    >
      <blockquote className="m-0">
        <p className="m-0 text-base leading-body text-fg">{item.quoteHe}</p>
      </blockquote>
      {meta.length > 0 ? (
        <figcaption className="mt-[.7rem] text-xs text-fg-subtle">
          {meta.join(" · ")}
        </figcaption>
      ) : null}
    </figure>
  );
}

/* ═══════════════════ הבלוק ═══════════════════ */

export interface ReviewsBlockProps extends Omit<React.HTMLAttributes<HTMLElement>, "title"> {
  /** כותרת אופציונלית. בלי כותרת הבלוק הוא רצועה בתוך סקשן קיים. */
  title?: React.ReactNode;
  eyebrow?: React.ReactNode;
  lede?: React.ReactNode;
  headingAs?: "h2" | "h3";
  /** מקסימום ציטוטים. ‎0 או השמטה ⇒ כולם. */
  quoteLimit?: number;
  /** הצגת הדירוג בלבד, בלי ציטוטים — לרצועה צרה בהירו. */
  ratingOnly?: boolean;
}

export function ReviewsBlock({
  title,
  eyebrow,
  lede,
  headingAs = "h2",
  quoteLimit,
  ratingOnly = false,
  className,
  ...rest
}: ReviewsBlockProps) {
  const rating = googleReviews();
  const quotes = ratingOnly ? [] : publishableTestimonials(quoteLimit);

  /* אין דירוג ואין ציטוט ⇒ אין בלוק. לא כותרת, לא מסגרת, לא מרווח.
     זה המצב היום, וזה מה שמשאיר את העמוד גמור. */
  if (!rating && quotes.length === 0) return null;

  return (
    <div className={cn("flex flex-col gap-[1.4rem]", className)} {...rest}>
      {title ? (
        <SectionHeader title={title} eyebrow={eyebrow} lede={lede} as={headingAs} />
      ) : null}

      {rating ? <RatingSummary data={rating} /> : null}

      {quotes.length > 0 ? (
        <ul className="m-0 grid list-none gap-[.9rem] p-0 min-[720px]:grid-cols-2">
          {quotes.map((q) => (
            <li key={q.id}>
              <Quote item={q} />
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
