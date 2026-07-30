/**
 * ═══════════════════════════════════════════════════════════════════════
 *  WhatsAppBand — מסלול הוואטסאפ, עם קליטה מקדימה.
 * ═══════════════════════════════════════════════════════════════════════
 *
 * spec 02 §4, §6.1–§6.3, spec 03 §7.2, 00-spec-review C2.
 *
 * וואטסאפ הוא הערוץ הראשי של האתר הזה, והוא גם הנקודה שהכי קל לשבור.
 *
 * ─── חוזה השימוש, ואסור לשנות אותו ──────────────────────────────
 *
 *     const ref = captureWaIntent({ ... });          // שגר ושכח
 *     window.location.href = buildWaHref(answers, ref);   // אותו tick
 *
 * **אין `await`, אין `.then`, ואין בדיקת תשובה.** שני כשלים ידועים:
 *   · `await fetch()` ואז פתיחת חלון — Safari/iOS חוסם, כי אסימון מחוות
 *     המשתמש פג ברגע שה־promise נכנע. וה«שיפור» שגורם לזה (להמתין שהשרת
 *     ייצר מזהה) נראה כמו הנדסה טובה.
 *   · sendBeacon מתוך `pagehide`/`unload` — מתועד כלא אמין, ונכשל
 *     ספציפית ב־iOS. תעבורת קייטרינג בישראל היא בעיקר אייפון.
 *
 * ─── מזהה הפנייה נוצר ברינדור, לא בקליק ─────────────────────────
 * ה־`href` הסטטי מכיל את **אותו** מזהה שנקלט בקליק. כך הקישור תקין גם
 * בלי JavaScript, גם בפתיחה בלשונית חדשה, וגם כשמעתיקים את הכתובת —
 * ובכל המקרים האלה ההודעה שהלקוח שולח נושאת מזהה שאפשר להצליב.
 *
 * ─── הודעה שלמה בלי מספר אחד ────────────────────────────────────
 * הנוסח נבנה ב־`buildWaMessage`, בגוף ראשון כלקוח, ושורה שאין עליה
 * תשובה **מושמטת** — לעולם לא «לא צוין». שום סכום בשקלים לא נוסע
 * לוואטסאפ, גם כשיהיו מחירים: מספר שנשלח בהודעה הופך להצעת מחיר כתובה
 * ומתוארכת ששמורה אצל הלקוח.
 *
 * ─── הודעת סעיף 11 (C2) ─────────────────────────────────────────
 * ‎`POST /api/wa-intent` כותב שורת ליד. INV-6 מחייב הודעת איסוף בכל
 * נקודת איסוף, ובמסלול הזה אין טופס שיישא אותה — ולכן היא יושבת כאן,
 * צמודה לכפתור, עם קישור למדיניות. אין להסיר אותה כדי «לנקות» את הבאנד.
 */

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button, Num, Prose } from "@/components/primitives";
import { PHONE, telLink } from "@/content/business";
import {
  buildWaHref,
  capturePhoneClick,
  captureWaIntent,
  newRef,
  type WaMessageAnswers,
} from "@/lib/lead-client";
import { track } from "@/lib/analytics";
import type { ServiceFormat, WaLocation } from "@shared/lead-constants";
import { BandSection, type BandTone } from "./section";

export interface WhatsAppBandProps {
  /** מאיפה בעמוד — נשמר על הליד ומיוחס באנליטיקס. איחוד סגור. */
  waLocation: WaLocation;
  /**
   * מה שהעמוד כבר יודע על האירוע. נכנס גם להודעה הממולאת מראש וגם
   * לקליטה המקדימה. כל שדה אופציונלי, וכל שדה חסר פשוט לא מופיע.
   */
  answers?: WaMessageAnswers;
  /** מזהי מנות לקליטה (שמות המנות נכנסים דרך `answers.dishNames`). */
  dishIds?: readonly string[];
  serviceFormat?: ServiceFormat | null;

  /** תווית הכפתור. נוסח הבית: «עדיף לי בוואטסאפ», «דברו איתנו בוואטסאפ». */
  labelHe?: string;
  /** קישור הטלפון לצד הכפתור. */
  showPhone?: boolean;
  phoneLeadHe?: string;
  callLocation?: string;

  /** הודעת סעיף 11. דריסה מותרת; השמטה אינה. */
  noticeHe?: React.ReactNode;
  privacyHref?: string;
  privacyLabelHe?: string;

  id?: string;
  num?: string;
  eyebrow?: React.ReactNode;
  title?: React.ReactNode;
  lede?: React.ReactNode;
  tone?: BandTone;
  tight?: boolean;
  className?: string;
}

const DEFAULT_NOTICE = "בלחיצה נשמרת אצלנו פנייה עם פרטי האירוע שמופיעים בהודעה.";

/** נייד: אותה לשונית. לשונית ריקה שנשארת מאחור נקראת כאתר שבור. */
function isMobile(): boolean {
  return (
    typeof navigator !== "undefined" && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
  );
}

export function WhatsAppBand({
  waLocation,
  answers,
  dishIds,
  serviceFormat = null,
  labelHe = "דברו איתנו בוואטסאפ",
  showPhone = true,
  phoneLeadHe = "או בטלפון",
  callLocation,
  noticeHe = DEFAULT_NOTICE,
  privacyHref = "/privacy",
  privacyLabelHe = "מדיניות הפרטיות",
  id,
  num,
  eyebrow,
  title,
  lede,
  tone = "alt",
  tight = true,
  className,
}: WhatsAppBandProps) {
  /* מזהה אחד למחזור החיים של הבאנד: ה־href הסטטי והקליטה נושאים אותו יחד. */
  const [ref] = React.useState(() => newRef());

  const href = React.useMemo(() => buildWaHref(answers ?? {}, ref), [answers, ref]);

  const handleClick = React.useCallback(
    (e: React.MouseEvent<HTMLButtonElement & HTMLAnchorElement>) => {
      /* מודיפיירים ולחצן אמצעי — הדפדפן יודע לבד, ואין לחטוף אותם. */
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;

      track("whatsapp_click", { wa_location: waLocation, has_lead: Boolean(answers?.eventType) });

      captureWaIntent({
        ref,
        waLocation,
        branch: answers?.branch ?? null,
        ...(answers?.eventType ? { eventType: answers.eventType.slice(0, 60) } : {}),
        ...(answers?.guestBand ? { guestBand: answers.guestBand } : {}),
        ...(answers?.eventDate ? { eventDate: answers.eventDate } : {}),
        ...(answers?.area ? { area: answers.area.trim().slice(0, 60) } : {}),
        serviceFormat,
        ...(dishIds?.length ? { dishIds: dishIds.slice(0, 40) } : {}),
      });

      track("whatsapp_handoff", {
        lead_ref: ref,
        wa_location: waLocation,
        branch: answers?.branch ?? null,
      });

      /* דסקטופ: `target="_blank"` של הדפדפן ממשיך כרגיל, וה־href כבר נכון.
         נייד: אותה לשונית, ולכן ורק לכן חוטפים את הניווט. */
      if (isMobile()) {
        e.preventDefault();
        window.location.href = href;
      }
    },
    [answers, dishIds, href, ref, serviceFormat, waLocation],
  );

  return (
    <BandSection
      id={id}
      num={num}
      eyebrow={eyebrow}
      title={title}
      lede={lede}
      tone={tone}
      tight={tight}
      className={className}
    >
      <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
        <Button variant="wa" href={href} target="_blank" onClick={handleClick}>
          {labelHe}
        </Button>

        {showPhone ? (
          <p className="m-0 max-w-none text-xs text-fg-subtle">
            {phoneLeadHe}{" "}
            <a
              href={telLink()}
              data-tel=""
              className="text-fg no-underline hover:text-accent"
              onClick={() => capturePhoneClick({ callLocation: callLocation ?? waLocation })}
            >
              <Num>{PHONE.display}</Num>
            </a>
          </p>
        ) : null}
      </div>

      {/* הודעת האיסוף. `.notice` של §7.5: קו דק בקצה הפנימי, טקסט זעיר. */}
      {noticeHe ? (
        <Prose
          size="fine"
          measure="body"
          className={cn(
            "mt-5 border-s border-solid border-s-[color:var(--rule)] ps-[.9rem]",
          )}
        >
          <p>
            {noticeHe}{" "}
            <a href={privacyHref} className="underline underline-offset-[.22em]">
              {privacyLabelHe}
            </a>
          </p>
        </Prose>
      ) : null}
    </BandSection>
  );
}
