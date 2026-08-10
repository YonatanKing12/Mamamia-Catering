/**
 * ═══════════════════════════════════════════════════════════════════════
 *  ContactBar — שלוש הדרכים ליצור קשר, בסגנון הבולט של הקטגוריה.
 * ═══════════════════════════════════════════════════════════════════════
 *
 * וואטסאפ · טלפון · הצעה. הרצועה הזאת היא נקודת האיסוף שאינה טופס, והיא
 * מחווטת לאותם ארבעה מסלולי קליטה שכבר קיימים (`lib/lead-client.ts`).
 *
 * ─── חוזה הוואטסאפ, ואסור לשנות אותו ────────────────────────────
 *
 *     const ref = captureWaIntent({ ... });                // שגר ושכח
 *     window.location.href = buildWaHref(answers, ref);    // אותו tick
 *
 * בלי `await`, בלי `.then`, בלי בדיקת תשובה. Safari/iOS חוסם פתיחה
 * שקורית אחרי ש־promise נכנע, כי אסימון מחוות המשתמש כבר פג — ותעבורת
 * קייטרינג בישראל היא ברובה אייפון. אותו נימוק, מילה במילה, יושב
 * ב־`components/bands/whatsapp-band.tsx`; שתי הקומפוננטות חייבות
 * להישאר זהות בנקודה הזאת.
 *
 * מזהה הפנייה נוצר **ברינדור** ולא בקליק, ולכן ה־`href` הסטטי נושא את
 * אותו מזהה שנקלט. הקישור תקין גם בלי JavaScript, גם בלשונית חדשה וגם
 * כשמעתיקים את הכתובת.
 *
 * ─── פקד ממולא אחד ─────────────────────────────────────────────
 * ‎L-10: פקד ממולא אחד לרצועה. ברירת המחדל היא וואטסאפ — הוא הערוץ
 * הראשי של האתר (spec 02 §4) והוא גם הזול ביותר להתחיל בו. `primary`
 * מחליף אותו בכפתור ההצעה, ואז הוואטסאפ הופך למתאר קו. אין מצב שבו
 * שניהם ממולאים; שני כפתורים צועקים אינם מכפילים המרה, הם מפצלים אותה.
 *
 * הטלפון אינו כפתור אלא **מספר גלוי**. זה מכוון: בקטגוריה הזאת חלק
 * מהקונים מחייגים במקום ללחוץ, ומספר שאפשר לקרוא בקול ולהקליד ידנית
 * שווה יותר מכפתור שמסתיר אותו. הוא עדיין `tel:` ועדיין נקלט.
 *
 * ─── הודעת סעיף 11 ─────────────────────────────────────────────
 * קליק על הוואטסאפ כותב שורת ליד. INV-6 מחייב הודעת איסוף בכל נקודת
 * איסוף, ולרצועה הזאת אין טופס שיישא אותה — ולכן היא צמודה לכפתורים,
 * עם קישור למדיניות. דריסת הנוסח מותרת; השמטתו אינה.
 *
 * ─── אפס עובדות עסקיות ─────────────────────────────────────────
 * אין כאן זמן תגובה, אין שעות מענה, ואין «נחזור אליכם תוך שעה».
 * ‎`SLOTS.responseTime` ו־`SLOTS.staffedHours` הם `null`, והבטחת מענה
 * שלא נמסרה היא בדיוק סוג ההתחייבות שנשרפת מול הלקוח הראשון שיבדוק.
 * המספר והוואטסאפ מגיעים מ־`content/business.ts` בלבד.
 */

import * as React from "react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { Num, Prose, WhatsAppGlyph } from "@/components/primitives";
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

/* ═══════════════════ הפקדים ═══════════════════ */

const CONTROL =
"inline-flex min-h-[48px] items-center justify-center gap-2 " +
"rounded-pill border border-solid px-[1.5rem] py-[.8rem] " +
"font-sans text-sm font-bold leading-none no-underline text-center " +
"transition-[background-color,color,border-color,transform] duration-state ease-house " +
"hover:-translate-y-px motion-reduce:hover:translate-y-0";

/* לבן על --wa. הירוק של וואטסאפ הוא זיהוי ערוץ, לא צבע מותג שלנו. */
const WA_FILLED = "bg-wa text-white border-wa hover:bg-wa-dk hover:border-wa-dk";
const WA_OUTLINE = "bg-transparent text-fg border-rule-control hover:text-accent hover:border-accent";

/*
 * מילוי ענבר. ‎04 §2: הכתום הוא הצבע שנושא את כל הפעולות.
 * ‎--accent-foreground הוא צבע הטקסט **היחיד** החוקי על מילוי ענבר
 * (לבן על ‎#F39402 הוא ‎2.32:1), ו־--accent-edge נותן לפקד גבול ‎1.4.11
 * כשהוא נוחת על הבאנד הבהיר. שני הטוקנים קיימים בדיוק בשביל זה.
 */
const QUOTE_FILLED =
"bg-accent text-accent-foreground border-accent-edge " +
"hover:bg-accent-hover hover:border-accent-hover";
const QUOTE_OUTLINE =
"bg-transparent text-accent border-accent hover:bg-accent hover:text-accent-foreground";

/** נייד: אותה לשונית. לשונית ריקה שנשארת מאחור נקראת כאתר שבור. */
function isMobile(): boolean {
  return typeof navigator !== "undefined" && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

const DEFAULT_NOTICE = "בלחיצה על וואטסאפ נשמרת אצלנו פנייה עם הפרטים שמופיעים בהודעה.";

export interface ContactBarProps extends React.HTMLAttributes<HTMLElement> {
  /** מאיפה בעמוד. נשמר על הליד ומיוחס באנליטיקס. איחוד סגור. */
  waLocation: WaLocation;

  /** איזה משני הפקדים ממולא. אחד בלבד, לעולם. */
  primary?: "whatsapp" | "quote";

  /** מה שהעמוד כבר יודע. נכנס גם להודעה הממולאת מראש וגם לקליטה. */
  answers?: WaMessageAnswers;
  dishIds?: readonly string[];
  serviceFormat?: ServiceFormat | null;

  /** יעד כפתור ההצעה. `#quote` לעוגן בעמוד, `/quote` לדף הבנאי. */
  quoteHref?: string;
  /** השמטת כפתור ההצעה — לדפים שאין בהם בנאי (למשל `/urgent`). */
  showQuote?: boolean;
  /** השמטת המספר. ברירת המחדל היא להציג — מספר גלוי ממיר. */
  showPhone?: boolean;

  labels?: { wa?: string; quote?: string; phoneLead?: string };

  /** ‎`call_location` לאנליטיקס. ברירת מחדל: `waLocation`. */
  callLocation?: string;

  /** הודעת סעיף 11. דריסה מותרת; השמטה אינה. */
  noticeHe?: React.ReactNode;
  privacyHref?: string;
  privacyLabelHe?: string;

  /** מסגרת כרטיס. כבו כשהרצועה יושבת בתוך כרטיס קיים. */
  framed?: boolean;
}

export function ContactBar({
  waLocation,
  primary = "whatsapp",
  answers,
  dishIds,
  serviceFormat = null,
  quoteHref = "/quote",
  showQuote = true,
  showPhone = true,
  labels,
  callLocation,
  noticeHe = DEFAULT_NOTICE,
  privacyHref = "/privacy",
  privacyLabelHe = "מדיניות הפרטיות",
  framed = true,
  className,
...rest
}: ContactBarProps) {
  /* מזהה אחד למחזור החיים של הרצועה: ה־href הסטטי והקליטה נושאים אותו יחד. */
  const [ref] = React.useState(() => newRef());
  const href = React.useMemo(() => buildWaHref(answers ?? {}, ref), [answers, ref]);

  const handleWaClick = React.useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
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

      /* דסקטופ: target="_blank" של הדפדפן ממשיך כרגיל. נייד: אותה לשונית,
         ולכן ורק לכן חוטפים את הניווט. */
      if (isMobile()) {
        e.preventDefault();
        window.location.href = href;
      }
    },
    [answers, dishIds, href, ref, serviceFormat, waLocation],
  );

  const handlePhoneClick = React.useCallback(() => {
    capturePhoneClick({ callLocation: callLocation ?? waLocation });
  }, [callLocation, waLocation]);

  const waFilled = primary === "whatsapp";
  const quoteLabel = labels?.quote ?? "לקבלת הצעה";
  const waLabel = labels?.wa ?? "דברו איתנו בוואטסאפ";
  const phoneLead = labels?.phoneLead ?? "או פשוט חייגו";

  /* עוגן בתוך העמוד אינו ניווט של הראוטר — `Link` היה בולע אותו. */
  const quoteIsAnchor = quoteHref.startsWith("#");
  const quoteClass = cn(CONTROL, waFilled ? QUOTE_OUTLINE : QUOTE_FILLED);

  return (
    /* `div` ולא `aside`: `aside` הוא ציון דרך (landmark), ורצועת הקשר
       עשויה להופיע יותר מפעם אחת בעמוד. שני ציוני דרך בלי שם הם רעש
       בקורא מסך, ולא מבנה. */
    <div
      className={cn(
"flex flex-col gap-[.9rem]",
        framed &&
"rounded-xl border border-solid border-[color:var(--rule)] bg-bg-alt p-[1.2rem]",
        className,
      )}
      {...rest}
    >
      <div className="flex flex-wrap items-center gap-[.6rem]">
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleWaClick}
          className={cn(CONTROL, waFilled ? WA_FILLED : WA_OUTLINE)}
        >
          <WhatsAppGlyph />
          {waLabel}
        </a>

        {showQuote ? (
          quoteIsAnchor ? (
            <a href={quoteHref} className={quoteClass}>
              {quoteLabel}
            </a>
          ) : (
            <Link href={quoteHref} className={quoteClass}>
              {quoteLabel}
            </Link>
          )
        ) : null}
      </div>

      {showPhone ? (
        <p className="m-0 text-xs leading-[1.6] text-fg-subtle">
          {phoneLead}{" "}
          <a
            href={telLink()}
            data-tel=""
            onClick={handlePhoneClick}
            className="font-bold text-fg no-underline hover:text-accent"
          >
            <Num>{PHONE.display}</Num>
          </a>
        </p>
      ) : null}

      {noticeHe ? (
        <Prose
          size="fine"
          measure="body"
          className="border-s border-solid border-s-[color:var(--rule)] ps-[.9rem]"
        >
          <p>
            {noticeHe}{" "}
            <a href={privacyHref} className="underline underline-offset-[.22em]">
              {privacyLabelHe}
            </a>
          </p>
        </Prose>
      ) : null}
    </div>
  );
}
