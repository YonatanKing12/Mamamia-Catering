/**
 * StickyCta — §7.29. סרגל הפעולות התחתון בנייד.
 *
 * שני פקדים בדיוק, ואחד מהם בלבד ממולא. וואטסאפ הוא הממולא; השני הוא ghost.
 * הסרגל הוא כרום ולא תוכן, והוא החריג היחיד המוצהר ל־L-10 — הוא בהכרח חולק
 * מסך עם ה־CTA של הסקשן. החריג תחום בדיוק בכלל הפקד הממולא היחיד; בלעדיו
 * אי אפשר לאכוף את L-10 בכלל.
 *
 * mode='none' מחזיר null. הוא קיים בשביל מסלול של כוונת אבל: כפתור הצעה
 * דביק בעמוד שבעה הוא בדיוק הכשל הטוני שהמסלול נבנה כדי להימנע ממנו.
 *
 * env(safe-area-inset-bottom) הוא חובה, אחרת הסרגל יושב מתחת לפס הבית של iOS.
 *
 * המספר לא נכתב כאן ולא בשום קומפוננטה אחרת: telLink ו־waLink מיובאים
 * מ־content/business.ts, מקור האמת היחיד. waHref מאפשר למכונת הלידים
 * להזריק קישור עם קוד שיוך בלי לגעת בקומפוננטה.
 */

import * as React from "react";
import { cn } from "@/lib/utils";
import { telLink, waLink } from "@/content/business";
import { WhatsAppGlyph } from "./brand-icons";

export type StickyCtaMode = "quote" | "phone" | "none";

export interface StickyCtaProps extends React.HTMLAttributes<HTMLElement> {
  /** נקבע לכל מסלול ב־RouteDef. ברירת מחדל: המסלולים המובלים בתפריט. */
  mode?: StickyCtaMode;
  /** יעד הפקד השני במצב quote. */
  quoteHref?: string;
  /** דורס לגמרי את קישור הוואטסאפ (קוד שיוך, ניתוב לפי סניף). */
  waHref?: string;
  /** ההודעה הממולאת מראש. שום סכום לא נכנס לטקסט הזה לעולם. */
  waMessage?: string;
  labels?: { wa?: string; quote?: string; phone?: string };
  /**
   * מרווח בזרימת העמוד בגובה הסרגל, כדי שהסקשן האחרון לא ייחתך.
   * זו החלופה ל־body{padding-bottom} — היא מקומית, נעלמת בהדפסה ואינה
   * משנה סגנון גלובלי מתוך JavaScript.
   */
  spacer?: boolean;
}

const LINK =
  "flex flex-1 items-center justify-center gap-2 rounded border border-solid " +
  "min-h-[48px] px-[.4rem] py-[.85rem] text-center no-underline " +
  "font-sans text-sm font-semibold leading-tight";

/* לבן על --wa הוא 5.42:1. זהו הפקד הממולא היחיד בסרגל. */
const FILLED = "bg-wa text-white border-wa";
/* מסגרת --rule-control (3.69:1) — היא הדבר היחיד שמזהה את הפקד, ולכן
   1.4.11 חל עליה ו־--rule אסורה כאן. */
const GHOST = "bg-bg text-fg border-rule-control";

export const StickyCta = React.forwardRef<HTMLElement, StickyCtaProps>(function StickyCta(
  {
    mode = "quote",
    quoteHref = "#quote",
    waHref,
    waMessage = "היי, אשמח לקבל הצעה לאירוע.",
    labels,
    spacer = true,
    className,
    ...rest
  },
  ref,
) {
  if (mode === "none") return null;

  const waLabel = labels?.wa ?? "וואטסאפ";
  const secondary =
    mode === "phone"
      ? { href: telLink(), label: labels?.phone ?? "התקשרו" }
      : { href: quoteHref, label: labels?.quote ?? "התפריט שלכם" };

  return (
    <>
      {spacer ? <div aria-hidden="true" className="hidden h-20 max-[760px]:block print:hidden" /> : null}

      <nav
        ref={ref as React.Ref<HTMLElement>}
        aria-label="פעולות מהירות"
        data-print="hide"
        className={cn(
          "fixed inset-x-0 bottom-0 z-[85] hidden gap-2 print:hidden",
          "max-[760px]:flex",
          "bg-bg shadow-sticky",
          "border-t-[length:var(--bw)] border-t-[color:var(--rule)]",
          "px-[.8rem] pt-[.6rem] pb-[calc(.6rem_+_env(safe-area-inset-bottom))]",
          className,
        )}
        {...rest}
      >
        <a href={waHref ?? waLink(waMessage)} className={cn(LINK, FILLED)}>
          <WhatsAppGlyph />
          {waLabel}
        </a>
        <a href={secondary.href} className={cn(LINK, GHOST)}>
          {secondary.label}
        </a>
      </nav>
    </>
  );
});
