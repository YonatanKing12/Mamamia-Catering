/**
 * QuoteSuccess — spec 02 §5.2.
 *
 * **לא הודעת תודה. שלב המרה.**
 *
 * המימוש הקודם הציג טוסט וקרא ל־`form.reset()`: המסך של הקונה חזר לטופס
 * ריק והוא נשאר עם כלום ביד. כאן הוא נשאר עם מספר פנייה, עם התפריט שלו
 * כתוב מולו, ועם דרך אחת ברורה להמשיך את השיחה.
 *
 * מצב ההצלחה הזה הוא הנפילה־לאחור כשהעמוד לא סיפק `onSubmitted`. המסלול
 * הרצוי הוא ניווט אמיתי ל־`/thanks?ref=` — בלי שינוי כתובת שום פלטפורמת
 * מדידה לא תרשום המרה ברמת עמוד, וגם קישור שנשלח או רענון לא ישרדו.
 * הניתוב עצמו אינו בבעלות הקומפוננטה הזאת.
 */

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/primitives";
import { PHONE, SLOTS, filled, telLink } from "@/content/business";
import { buildWaHref, captureWaIntent } from "@/lib/lead-client";
import { track } from "@/lib/analytics";
import { BriefCard } from "./brief-card";
import { TermsStrip } from "./legal-blocks";
import { BRANCH_NAME } from "./quote-config";
import type { QuoteAnswers } from "./use-quote-builder";

export interface QuoteSuccessProps {
  leadRef: string;
  answers: QuoteAnswers;
  contactChannel?: "whatsapp" | "phone";
  /** מקור העמוד למדידת הדפסה. */
  sourcePage?: string;
  className?: string;
}

export function QuoteSuccess({
  leadRef,
  answers,
  contactChannel = "whatsapp",
  sourcePage = "quote",
  className,
}: QuoteSuccessProps) {
  const headingRef = React.useRef<HTMLHeadingElement | null>(null);

  React.useEffect(() => {
    headingRef.current?.focus();
  }, []);

  /* שורת הניתוב — עובדה, ורק כשהיא עובדה: סניף שנפתר מצ'יפ ממופה
     ושיש לו כתובת. אין סניף? אין שורה. אף מתחרה לא יכול לומר אותה. */
  const addresses = SLOTS.addresses;
  const routingLine =
    answers.branch && filled(addresses) && filled(addresses[answers.branch])
      ? `הפנייה נשלחה למטבח ב${BRANCH_NAME[answers.branch]}.`
      : null;

  const channelWord = contactChannel === "phone" ? "טלפון" : "וואטסאפ";
  const responseTime = SLOTS.responseTime;
  const responseLine = filled(responseTime)
    ? `נחזור אליכם ב${channelWord} — ${responseTime}.`
    : `נחזור אליכם ב${channelWord}.`;

  /**
   * המשך השיחה עם **אותו** מספר פנייה. מזהה שני לאותו לקוח שובר את
   * ההתאמה הידנית בין הצ'אט לשורה במסד — השרת מכיר את הקוד הזה כבר.
   * גם כאן: אין `await` לפני הניווט.
   */
  const continueOnWhatsApp = () => {
    captureWaIntent({
      ref: leadRef,
      waLocation: "thanks",
      branch: answers.branch,
      ...(answers.eventType ? { eventType: answers.eventType } : {}),
      ...(answers.guestBand ? { guestBand: answers.guestBand } : {}),
      ...(answers.eventDate ? { eventDate: answers.eventDate } : {}),
      ...(answers.area ? { area: answers.area.slice(0, 60) } : {}),
      serviceFormat: answers.serviceFormat,
      ...(answers.dishes.length ? { dishIds: answers.dishes.map((d) => d.id) } : {}),
    });

    track("whatsapp_click", { wa_location: "thanks", has_lead: true });
    track("whatsapp_handoff", {
      lead_ref: leadRef,
      wa_location: "thanks",
      branch: answers.branch ?? null,
    });

    const href = buildWaHref(
      {
        ...(answers.eventType ? { eventType: answers.eventType } : {}),
        ...(answers.guestBand ? { guestBand: answers.guestBand } : {}),
        ...(answers.eventDate ? { eventDate: answers.eventDate } : {}),
        dateFlexible: answers.dateFlexible,
        ...(answers.area ? { area: answers.area } : {}),
        branch: answers.branch,
        dishNames: answers.dishes.map((d) => d.name),
      },
      leadRef,
    );

    const isMobile =
      typeof navigator !== "undefined" && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (isMobile) window.location.href = href;
    else window.open(href, "_blank", "noopener");
  };

  const printMenu = () => {
    track("menu_print", { source_page: sourcePage });
    window.print();
  };

  return (
    <section className={cn("sec", className)} data-quote-success="">
      <div className="wrap">
        <div className="max-w-confirm" role="status" aria-live="polite">
          <h2
            ref={headingRef}
            tabIndex={-1}
            className="font-serif text-3xl font-medium leading-head"
          >
            קיבלנו.
          </h2>

          <p className="mt-4 text-sm text-fg-muted">
            מספר פנייה:{" "}
            <span dir="ltr" className="num select-all text-lg font-medium [unicode-bidi:isolate]">
              {leadRef}
            </span>
          </p>

          <BriefCard answers={answers} title="התפריט שלכם" className="mt-8" />

          {routingLine ? <p className="mt-6 text-sm">{routingLine}</p> : null}
          <p className="mt-2 text-sm text-fg-muted">{responseLine}</p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Button type="button" variant="wa" onClick={continueOnWhatsApp}>
              המשיכו בוואטסאפ
            </Button>
            <button
              type="button"
              onClick={printMenu}
              className="min-h-[44px] text-sm text-fg-subtle underline decoration-rule underline-offset-[.22em] hover:text-fg hover:decoration-accent"
            >
              הדפיסו את התפריט
            </button>
          </div>

          <p className="mt-6 text-xs text-fg-subtle">
            אפשר גם בטלפון{" "}
            <a href={telLink()} className="underline decoration-rule underline-offset-[.22em]">
              <span dir="ltr" className="num [unicode-bidi:isolate]">
                {PHONE.display}
              </span>
            </a>
          </p>

          <TermsStrip className="mt-8" />
        </div>
      </div>
    </section>
  );
}
