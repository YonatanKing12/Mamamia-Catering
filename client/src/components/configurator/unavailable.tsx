/**
 * ═══════════════════════════════════════════════════════════════════════
 *  ConfiguratorUnavailable — המצב שבו המגדיר נמצא היום.
 * ═══════════════════════════════════════════════════════════════════════
 *
 * ‎`docs/spec/04 §6`: «המגדיר לא מתפקד בלי מנות. טופס ליד עובד ריק; מגדיר
 * תפריט ריק הוא מסך לבן.» הקומפוננטה הזאת היא התשובה לזה, והיא **המסלול
 * הפעיל** כל עוד `DISHES` ריק ו־`PACKAGES` ריק.
 *
 * מה היא **אינה** עושה:
 *   · אינה מציגה שלד אפור «בקרוב».
 *   · אינה מציגה מנות דמו.
 *   · אינה מציגה מסגרת ריקה עם כותרת יתומה מעליה.
 *   · אינה מתנצלת. «התוכן בהכנה» מספר למבקר על התקלה שלנו במקום לתת לו
 *     דרך להזמין.
 *
 * מה היא כן עושה: מציעה את אותו דבר עצמו בערוץ שכן עובד — בנאי ארבע
 * השאלות, שנבנה לעבוד **ריק לגמרי**, ולידו וואטסאפ. המבקר לא רואה מגדיר
 * חסר; הוא רואה עמוד גמור שמבקש ממנו את מה שצריך ומחזיר לו תשובה.
 */

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button, SectionHeader } from "@/components/primitives";
import { QuoteBuilder, type QuoteAnswers } from "@/components/quote";
import { PHONE, telLink } from "@/content/business";
import { buildWaHref, captureWaIntent } from "@/lib/lead-client";
import { track } from "@/lib/analytics";
import { COPY } from "./copy";

export interface ConfiguratorUnavailableProps {
  sourcePage: string;
  /**
   * ‎`builder` — מרנדר את בנאי ארבע השאלות במקום. ברירת המחדל, ומה
   * שמבטיח שהעמוד לעולם אינו ריק גם אם המסלול לא סידר חלופה.
   * ‎`links`   — כותרת ושתי פעולות בלבד, לעמוד שכבר מארח בנאי משלו
   *              במקום אחר ואסור לו לרנדר שניים.
   */
  fallback?: "builder" | "links";
  onSubmitted?(ref: string, answers: QuoteAnswers): void;
  showHeader?: boolean;
  sectionNum?: string;
  id?: string;
  className?: string;
}

export function ConfiguratorUnavailable({
  sourcePage,
  fallback = "builder",
  onSubmitted,
  showHeader = true,
  sectionNum,
  id,
  className,
}: ConfiguratorUnavailableProps) {
  const handleWhatsApp = React.useCallback(() => {
    /* קליטה לפני ניווט, אותו tick, בלי await — Safari/iOS חוסם פתיחה
       ברגע שה־promise נכנע. */
    const ref = captureWaIntent({ waLocation: "quote_alt" });
    track("whatsapp_click", { wa_location: "quote_alt", has_lead: false });
    track("whatsapp_handoff", { lead_ref: ref, wa_location: "quote_alt", branch: null });

    const href = buildWaHref({}, ref);
    const isMobile =
      typeof navigator !== "undefined" && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (isMobile) window.location.href = href;
    else window.open(href, "_blank", "noopener");
  }, []);

  return (
    <section id={id} className={cn("grid gap-6", className)}>
      {showHeader ? (
        <SectionHeader
          title={COPY.unavailableHeading}
          {...(sectionNum ? { num: sectionNum } : {})}
        />
      ) : null}

      <p className="max-w-body text-md leading-body text-fg-muted">{COPY.unavailableBody}</p>

      {fallback === "builder" ? (
        <QuoteBuilder sourcePage={sourcePage} showHeader={false} onSubmitted={onSubmitted} />
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <Button variant="wa" onClick={handleWhatsApp}>
          {COPY.submitWa}
        </Button>
        <Button variant="link" href={telLink()}>
          {PHONE.display}
        </Button>
      </div>
    </section>
  );
}
