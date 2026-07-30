/**
 * ═══════════════════════════════════════════════════════════════════════
 *  OccasionIntro — הבאנד הפותח של עמוד אירוע.
 * ═══════════════════════════════════════════════════════════════════════
 *
 * spec 03 §7.8, spec 01 §4 (P-08…P-16), spec 02 §1.3.
 *
 * כותרת, שורת כוונה, שורת עובדות שנגזמת ברמת הפסוקית, ומקבץ CTA. זהו
 * הפתיח של כל עמוד אירוע — וזה מה שמונע מחמישה־עשר עמודים לכתוב חמישה־
 * עשר הירואים שונים במקצת.
 *
 * ─── חמישה כללים שאסור לרכך ─────────────────────────────────────
 *
 *  L-2  **אפס צילום מעל הקיפול.** אין כאן prop לתמונה, בשום ברייקפוינט.
 *       זה לא פיקוח שנשכח — זו כל הסיבה שהכיוון הזה שורד מלאי צילומים ריק.
 *
 *  L-10 **פקד ממולא אחד.** נאכף ב־CtaPair, שזורק בפיתוח על שני primary.
 *       הטלפון הוא קישור טקסט מתחת למקבץ, ולא פקד שלישי בתוכו — למעט
 *       ‎/urgent ו־/catering/shiva, שבהם העמוד מעביר את הטלפון כ־primary
 *       ‎(01: ctaMode "phone") ומכבה את שורת הטלפון.
 *
 *  L-13 **בלי רוטציית כותרות ובלי קרוסלה.** הכותרת קבועה. שבירת השורות
 *       שייכת לעמוד — הוא זה שיודע היכן המשפט שלו נשבר יפה.
 *
 *  G5   **שורת העובדות נגזמת ברמת הפסוקית.** כל אסימון ריק מוריד את
 *       הפסוקית שלו בלבד, לעולם לא את השורה. כל הפסוקיות ריקות ⇒ אין שורה.
 *
 *  ‎§1  **אין כאן עובדה עסקית.** לא זמן תגובה, לא מינימום, לא שעה ולא
 *       מחיר. הפסוקיות מגיעות ב־props מהעמוד, שקורא אותן מ־business.ts.
 */

import * as React from "react";
import { cn } from "@/lib/utils";
import { CtaPair, Num, Prose, type CtaSpec } from "@/components/primitives";
import { PHONE, telLink } from "@/content/business";
import { capturePhoneClick } from "@/lib/lead-client";

export interface OccasionIntroProps {
  /** מותג · קטגוריה · סניפים. §7.8 סעיף 1. */
  eyebrow?: React.ReactNode;
  /** בלי כותרת אין באנד. העבירו JSX עם <br/> לשבירה טיפוגרפית. */
  title: React.ReactNode;
  /** שורת הכוונה — פסקה אחת, --measure-lede. */
  lede?: React.ReactNode;
  /**
   * פסוקיות שורת העובדות. העמוד מרכיב אותן מ־Slots ומעביר רק את המלאות.
   * מערך ריק ⇒ השורה לא מרונדרת.
   */
  facts?: readonly React.ReactNode[];

  primary?: CtaSpec;
  secondary?: CtaSpec;

  /** קישור הטלפון מתחת למקבץ. כבו אותו כשהטלפון הוא ה־primary. */
  showPhone?: boolean;
  /** הקדמת המשפט. ברירת מחדל: «או בטלפון». */
  phoneLeadHe?: string;
  /** לאן הקליק מיוחס באנליטיקס. */
  callLocation?: string;

  headingAs?: "h1" | "h2";
  id?: string;
  className?: string;
  /** מתחת ל־CTA בלבד: שורות מנה, פתק, מה שהעמוד מוסיף. */
  children?: React.ReactNode;
}

export function OccasionIntro({
  eyebrow,
  title,
  lede,
  facts,
  primary,
  secondary,
  showPhone = true,
  phoneLeadHe = "או בטלפון",
  callLocation = "hero",
  headingAs: Heading = "h1",
  id,
  className,
  children,
}: OccasionIntroProps) {
  /* INV-2: בלי כותרת אין מה לפתוח בו. */
  if (!title) return null;

  const clauses = (facts ?? []).filter(Boolean);

  return (
    <section id={id} className={cn("pb-sec pt-[clamp(2.5rem,7vw,5rem)]", className)}>
      <div className="wrap">
        {eyebrow ? <p className="eyebrow m-0 max-w-none">{eyebrow}</p> : null}

        <Heading className={cn("max-w-measure", eyebrow && "mt-5")}>{title}</Heading>

        {lede ? (
          <Prose size="lede" measure="lede" className="mt-7">
            <p>{lede}</p>
          </Prose>
        ) : null}

        {clauses.length > 0 ? (
          <p className="mt-6 flex max-w-none flex-wrap items-center gap-x-3 gap-y-1 text-xs text-fg-subtle">
            {clauses.map((clause, i) => (
              <React.Fragment key={i}>
                {i > 0 ? (
                  <span aria-hidden="true" className="text-fg-decor">
                    ·
                  </span>
                ) : null}
                <span>{clause}</span>
              </React.Fragment>
            ))}
          </p>
        ) : null}

        {primary ? <CtaPair className="mt-9" primary={primary} secondary={secondary} /> : null}

        {showPhone ? (
          <p className="mt-5 max-w-none text-xs text-fg-subtle">
            {phoneLeadHe}{" "}
            <a
              href={telLink()}
              data-tel=""
              className="text-fg no-underline hover:text-accent"
              onClick={() => capturePhoneClick({ callLocation })}
            >
              <Num>{PHONE.display}</Num>
            </a>
          </p>
        ) : null}

        {children}
      </div>
    </section>
  );
}
