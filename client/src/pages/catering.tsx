/**
 * ═══════════════════════════════════════════════════════════════════════
 *  P-07 · `/catering` — מרכז השירות. spec 01 §4 P-07, §3.1, INV-8.
 * ═══════════════════════════════════════════════════════════════════════
 *
 * הדף הזה אינו נושא ולו עובדה עסקית אחת משלו, וזה בכוונה: `shared/routes.ts`
 * מסמן אותו `blockedBy: []` כי אין לו שער — הוא **מפרק ניווט**. תפקידו
 * לקחת מבקר שיודע שהוא צריך קייטרינג ולהעביר אותו לדף האירוע הנכון, ולכן
 * יעד ההמרה שלו הוא `event_page_click` לפני `generate_lead`.
 *
 * ─────────────────────────────────────────────────────────────────────
 *  שתי סטיות מכוונות מנוסח המפרט
 * ─────────────────────────────────────────────────────────────────────
 *  1. **הכותרת.** ‎§4 P-07 מצטט `קייטרינג לאירועים | מאמא מיה — שלושה
 *     מטבחי מסעדה`, ו־`PAGE_META` ב־`lib/seo.ts` עדיין מחזיק אותה כלשונה.
 *     «שלושה מטבחי מסעדה» היא בדיוק הטענה שנמחקה — הקייטרינג יוצא ממטבח
 *     **אחד** שזהותו לא נמסרה. הדף קורא לכן את הרשומה מ־
 *     ‎`lib/page-meta-extra.ts`, שהיא הרשומה המתוקנת. הפגם ב־`lib/seo.ts`
 *     מדווח בדוח החזרה; הקובץ ההוא אינו בבעלות הסבב הזה.
 *
 *  2. **הבנאי.** ‎§4 P-07 כותב «No builder; one text CTA to /quote».
 *     ‎`shared/routes.ts` — שהוא הסמכות על `RouteDef` לפי 00-spec-review
 *     ‎§66 — מצהיר `hasBuilder: true`, `ctaMode: "quote"`, `stickyBar:
 *     "quote"`. הבנאי מרונדר בהתאם, אחרי שורות האירועים ולא לפניהן: מי
 *     שהגיע לכאן כדי לבחור אירוע בוחר קודם, ומי שכבר יודע יורד לטופס.
 *
 * ─────────────────────────────────────────────────────────────────────
 *  מה נשמט היום
 * ─────────────────────────────────────────────────────────────────────
 *   InclusionsExclusions  ‎`priceIncludes` / `priceExcludes` ריקים.
 *   LimitsBlock           אין שורת מגבלה שנמסרה.
 *   Faq                   ארבעת הפריטים חוצי־האירועים כתובים כאן וקשורים
 *                         למשבצות; כולן `null` ⇒ הבאנד אינו מרונדר.
 *
 * ─────────────────────────────────────────────────────────────────────
 *  שורות האירועים — למה הן נגזרות ולא נכתבות
 * ─────────────────────────────────────────────────────────────────────
 * הרשימה נבנית מ־`buildableOccasions()` (`content/occasions.ts`), ועוברת
 * בנוסף דרך השער של `NextSteps` שבודק `isServedPath` מול `shared/routes.ts`.
 * שני שערים, שניהם במקור אחד:
 *
 *   · אירוע שהשער הקשיח שלו סגור — שבעה (נוסח כשרות בכתב), ימי גיבוש
 *     ועמדת פסטה (עמדה חיה) — **אינו קיים ברשימה**, לא כשורה מעומעמת
 *     ולא כ«בקרוב».
 *   · מסלול שאינו מוגש היום מסונן שוב בבאנד, ולכן אין כאן ‎404.
 *
 * שורת התיאור לכל אירוע היא `intentHe` כלשונה מ־`occasions.ts` — מה
 * הקונה בא לפתור, מנוסח מצידו. אין לכתוב כאן שורה משלנו: שורה שנכתבת
 * בדף היא שורה שתיפרד מהמקור בסבב הבא.
 */

import * as React from "react";
import { Head } from "@/components/seo/head";
import { Prose } from "@/components/primitives";
import {
  FaqBand,
  KitchenNote,
  NextSteps,
  OccasionIntro,
  QuoteCta,
  type FaqItem,
  type NextStepLink,
} from "@/components/bands";
import { CATERING_NAME, SLOTS, filled } from "@/content/business";
import { buildableOccasions } from "@/content/occasions";
import { kashrutClauseHe, resolveExtraMeta, stripEmptyJsonLd } from "@/lib/page-meta-extra";
import type { PageMetaExtra } from "@/lib/page-meta-extra";
import {
  buildBreadcrumbList,
  buildFaqPage,
  buildService,
  buildWebPage,
} from "@/lib/seo";
import { buildWaHref, captureWaIntent, newRef } from "@/lib/lead-client";
import { track } from "@/lib/analytics";

/** הרשומה קיימת תמיד ב־`page-meta-extra`; היעדרה הוא באג ולא מצב. */
const META = resolveExtraMeta("/catering") as PageMetaExtra;

const SOURCE_PAGE = "/catering";

/* ═══════════════════ מסלול הוואטסאפ בהירו ═══════════════════ */

/**
 * חוזה §6.1–§6.3: קליטה מקדימה ואז ניווט **באותו tick**, בלי `await`.
 * המזהה נוצר ברינדור, ולכן ה־`href` הסטטי נושא אותו גם בלי JS.
 *
 * ‎TODO(01 §5.7): עותק שלישי של אותו קוד (`WhatsAppBand`, `pages/home.tsx`,
 * ‎`pages/menus.tsx`). מקומו ב־`lib/whatsapp.ts openWhatsApp()` — מדווח.
 */
function useHeroWhatsApp() {
  const [ref] = React.useState(() => newRef());
  const href = React.useMemo(() => buildWaHref({}, ref), [ref]);

  const onClick = React.useCallback<React.MouseEventHandler<HTMLButtonElement & HTMLAnchorElement>>(
    (e) => {
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;

      track("whatsapp_click", { wa_location: "hero", has_lead: false });
      captureWaIntent({ ref, waLocation: "hero" });
      track("whatsapp_handoff", { lead_ref: ref, wa_location: "hero" });

      const mobile =
        typeof navigator !== "undefined" && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
      if (mobile) {
        e.preventDefault();
        window.location.href = href;
      }
    },
    [href, ref],
  );

  return { href, onClick };
}

/* ═══════════════════ שאלות ותשובות ═══════════════════ */

type PageFaq = FaqItem & { answerHe: string | null };

/**
 * ארבעה פריטים **חוצי־אירועים** — זה מה שהופך אותם לשייכים למפרק ולא
 * לדף אירוע מסוים. סט אחר לגמרי מזה שב־`/menus` (T-1).
 *
 * כל תשובה נקראת ממשבצת, ולכן הבאנד נדלק מאליו כשהבעלים ימסור. אין כאן
 * ולו ניסוח «סביר» אחד שנכתב מראש.
 */
function faqItems(): PageFaq[] {
  return [
    {
      id: "faq-lead-time",
      questionHe: "כמה זמן מראש צריך להזמין?",
      answerHe: filled(SLOTS.leadTime) ? SLOTS.leadTime : null,
    },
    {
      id: "faq-response",
      questionHe: "תוך כמה זמן חוזרים אליי?",
      answerHe: filled(SLOTS.responseTime) ? SLOTS.responseTime : null,
    },
    {
      id: "faq-headcount",
      questionHe: "עד מתי אפשר לעדכן מספר סועדים?",
      answerHe: filled(SLOTS.headcountDeadline) ? SLOTS.headcountDeadline : null,
    },
    {
      id: "faq-payment",
      questionHe: "מה תנאי התשלום והביטול?",
      answerHe: filled(SLOTS.paymentTerms) ? SLOTS.paymentTerms : null,
    },
  ];
}

/* ═══════════════════ העמוד ═══════════════════ */

export default function Catering() {
  const wa = useHeroWhatsApp();

  /* שורת אירוע = שם + שורת כוונה + קישור עמוק. שלושתם מ־`occasions.ts`,
     ואף אחד מהם אינו נכתב כאן. */
  const eventLinks = React.useMemo<NextStepLink[]>(
    () =>
      buildableOccasions().map((occasion) => ({
        href: occasion.route,
        titleHe: occasion.nameHe,
        descriptionHe: occasion.intentHe,
      })),
    [],
  );

  const faqs = faqItems();

  /* ‎§3.1 — המספור נקבע לפי מיקום. סקשן שנשמט אינו משאיר חור ברצף. */
  const order = [
    eventLinks.length > 0 ? "events" : null,
    "kitchen",
    "quote",
    faqs.some((f) => f.answerHe) ? "faq" : null,
  ].filter((k): k is string => k !== null);

  const num = (key: string) => {
    const i = order.indexOf(key);
    return i < 0 ? undefined : String(i + 1).padStart(2, "0");
  };

  /* גיזום ברמת הפסוקית (G5). הכשרות נקראת מהמשבצת ולא נכתבת קשיח. */
  const kashrut = kashrutClauseHe("general");
  const facts = ["מטבח של מסעדה איטלקית פעילה", kashrut].filter((c): c is string => Boolean(c));

  return (
    <>
      <Head
        meta={META}
        jsonLd={[
          /* CollectionPage — הדף אוסף את דפי האירועים.
             `Service` נפלט לזיהוי ישות ולא לקישוט תוצאות: אין לו תוצאה
             עשירה מקבילה בגוגל. **בלי `areaServed`** — אזור השירות הוא
             משבצת ריקה, ואין לגזור אותו ממיקומי המסעדות. */
          stripEmptyJsonLd(buildWebPage(META, { type: "CollectionPage" })),
          stripEmptyJsonLd(
            buildService({
              path: "/catering",
              nameHe: CATERING_NAME,
              descriptionHe: META.descriptionHe,
            }),
          ),
          buildBreadcrumbList(META.breadcrumb),
          buildFaqPage(faqs),
        ]}
      />

      <OccasionIntro
        eyebrow="קייטרינג מאמאמיה"
        title={
          <>
            לאיזה אירועים
            <br />
            אנחנו נכנסים.
          </>
        }
        lede="ארוחת צוות, שמחה פרטית, ארוחת חג או שולחן חלבי — אותו מטבח, תפריט אחר לכל אירוע. בוחרים את סוג האירוע, ומגיעים לדף שמדבר עליו."
        facts={facts}
        primary={{ label: "בנו תפריט לאירוע", href: "#quote" }}
        secondary={{
          label: "דברו איתנו בוואטסאפ",
          variant: "ghost",
          href: wa.href,
          target: "_blank",
          rel: "noopener noreferrer",
          onClick: wa.onClick,
        }}
        callLocation="hero"
      >
        {/* INV-6: קליק על וואטסאפ כותב שורת ליד, ולכן הודעת סעיף 11
            צמודה לפקד. אין להסיר אותה כדי «לנקות» את ההירו. */}
        <Prose
          size="fine"
          measure="body"
          className="mt-5 border-s border-solid border-s-[color:var(--rule)] ps-[.9rem]"
        >
          <p>
            בלחיצה על וואטסאפ נשמרת אצלנו פנייה עם פרטי האירוע שמופיעים בהודעה.{" "}
            <a href="/privacy" className="underline underline-offset-[.22em]">
              מדיניות הפרטיות
            </a>
          </p>
        </Prose>
      </OccasionIntro>

      {/* 01 · שורות האירועים — עמוד השדרה של הקישור הפנימי (INV-8).
          ‎`limit={0}` מבטל את התקרה הרכה של ארבעה: כאן זו הרשימה המלאה
          ולא רצועת «עוד», והשמטת אירוע מהמפרק היא בור בניווט. */}
      <NextSteps
        id="events"
        num={num("events")}
        sourcePage={SOURCE_PAGE}
        links={eventLinks}
        limit={0}
        title="סוגי האירועים"
        lede="כל שורה היא דף עם התפריט, המגבלות והתשובות של אותו אירוע."
      />

      <KitchenNote num={num("kitchen")} />

      <QuoteCta
        num={num("quote")}
        sourcePage={SOURCE_PAGE}
        /* אין זריעת `eventType` במפרק. סוג אירוע נזרע מדף האירוע
           (`occasions.eventTypeSeed`); זריעה מכאן הייתה מתייגת ליד לא
           נכון, וזה כשל גרוע יותר מתיוג חסר (02 §1.7). */
        title="לא בטוחים לאיזה סוג זה שייך?"
        lede="ארבע שאלות על האירוע, ואז פרטים ליצירת קשר. אנחנו נשייך אותו."
      />

      <FaqBand num={num("faq")} items={faqs} title="שאלות שנשאלות בטלפון" />
    </>
  );
}
