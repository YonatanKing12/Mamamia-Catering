/**
 * ═══════════════════════════════════════════════════════════════════════
 *  P-13 · `/catering/fun-day` — ימי גיבוש וימי כיף.
 *  spec 01 §4 P-13, §3.1, §3.3, INV-2.
 * ═══════════════════════════════════════════════════════════════════════
 *
 * ─────────────────────────────────────────────────────────────────────
 *  שתי מחיקות שהן כל הדף
 * ─────────────────────────────────────────────────────────────────────
 *
 *  1. **הכותרת שבמפרט מוחקת את עצמה.** ‎§4 P-13 מצטט `יום גיבוש: עמדה
 *     חיה מהמטבח שלנו, לא דוכן שנשכר.` — ובאותה נשימה קובע ששמות תחנות
 *     מגיעים ממשבצות ב־`content/stations.ts` ו«לעולם לא ב־H1». `SLOTS
 *     .liveStations` הוא `null`: **האם בכלל מוצעת עמדה חיה היא שאלה
 *     פתוחה לבעלים.** ולכן אין בעמוד הזה `עמדה חיה`, `בישול במקום`,
 *     `שף בשטח` ולא שם תחנה כלשהו — לא בכותרת, לא בגוף, לא ב־meta
 *     ולא ב־JSON-LD. הכותרת נכתבה מחדש מצד הקונה.
 *
 *  2. **`StationsBlock` אינו מרונדר, ואינו קיים.** ‎§4 P-13 מתנה אותו
 *     ב«לפחות תחנה אחת עם שם ועם טווח סועדים». אין ולו אחת, ואין מודול
 *     ‎`content/stations.ts` שממנו לקרוא. בלוק שאין לו נתון אינו בלוק
 *     ריק — הוא לא קיים (INV-2). כשהמשבצות יימסרו, הבלוק נכנס בין ההירו
 *     ל־`MenuSheet`, וכל המספור מתקדם מאליו (‎§3.1 — מספור לפי מיקום).
 *
 * ─────────────────────────────────────────────────────────────────────
 *  השער, ולמה הקובץ קיים בכל זאת
 * ─────────────────────────────────────────────────────────────────────
 * ‎`content/occasions.ts` מציב כאן שער **קשיח** על `live_stations`,
 * ו־`shared/routes.ts` מסמן `enabled: false` בהתאם. כלומר: המסלול אינו
 * מוגש היום, אינו נרשם בראוטר, ואינו ב־sitemap. בינתיים הכוונה היא
 * עוגן `#gibush` בתוך `/catering/business`.
 *
 * הקובץ נכתב עכשיו כדי שביום שהמשבצת תימסר יהיה צריך להפוך `enabled`
 * ולרשום מסלול — ולא לכתוב דף בחיפזון. **ואיסור מפורש:** אסור לשחרר את
 * הדף הזה כ־`/catering/business` עם מילים מוחלפות. זו תבנית דלת כניסה,
 * וזה בדיוק מה ש־§4 P-13 מזהיר מפניו. הבלוק הייחודי כאן (`WhatWeNeed`)
 * הוא מה שמעביר את מבחן T-1, והוא אינו קיים בשום דף אחר.
 *
 * ─────────────────────────────────────────────────────────────────────
 *  מה נשמט היום
 * ─────────────────────────────────────────────────────────────────────
 *   StationsBlock  ראו למעלה. אין מודול ואין משבצת.
 *   OpsFacts       מינימום, זמן התראה, דדליין משתתפים ואזור — כולם `null`.
 *   MenuSheet      ‎`content/dishes.ts` ריק ⇒ 0 מנות בחתך ⇒ אין סקשן.
 *   ServiceFormats אף פורמט אינו מסומן `offered`.
 *   Faq            חמש השאלות קשורות למשבצות, וכולן ריקות.
 */

import * as React from "react";
import { Head } from "@/components/seo/head";
import { Num, Prose, SectionHeader } from "@/components/primitives";
import {
  FaqBand,
  KitchenNote,
  MenuSheet,
  NextSteps,
  OccasionIntro,
  OpsFacts,
  QuoteCta,
  ServiceFormats,
  type DishLine,
  type FaqItem,
  type NextStepLink,
  type OpsFactRow,
  type ServiceFormatSpec,
} from "@/components/bands";
import { SLOTS, filled } from "@/content/business";
import { dishesForCut, provenanceMark } from "@/content/dishes";
import { cateringServiceArea } from "@/content/locations";
import { buildableOccasions, occasionById, serviceFormatsFor } from "@/content/occasions";
import { kashrutClauseHe, resolveExtraMeta, stripEmptyJsonLd } from "@/lib/page-meta-extra";
import type { PageMetaExtra } from "@/lib/page-meta-extra";
import { buildBreadcrumbList, buildFaqPage, buildService, buildWebPage } from "@/lib/seo";
import { buildWaHref, captureWaIntent, newRef } from "@/lib/lead-client";
import { track } from "@/lib/analytics";

/** הרשומה קיימת תמיד ב־`page-meta-extra`; היעדרה הוא באג ולא מצב. */
const META = resolveExtraMeta("/catering/fun-day") as PageMetaExtra;

const SOURCE_PAGE = "/catering/fun-day";

const OCCASION = occasionById("fun-day");

/* ═══════════════════ מסלול הוואטסאפ בהירו ═══════════════════ */

/**
 * חוזה §6.1–§6.3: קליטה מקדימה ואז ניווט **באותו tick**, בלי `await`.
 * ‎TODO(01 §5.7): עותק חמישי. מקומו ב־`lib/whatsapp.ts openWhatsApp()`.
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

/* ═══════════════════ הרצועה התפעולית ═══════════════════ */

/**
 * ארבע השאלות שמנהלת משאבי אנוש שואלת לפני כל דבר אחר. כל שורה נגזמת
 * לחוד, וכולן ריקות ⇒ אין רצועה (§7.12).
 *
 * אין כאן שורת «עמדה» ואין שורת «טבח נוסע»: שתיהן תלויות ב־`liveStations`,
 * וזו המשבצת שהמסלול כולו חסום עליה.
 */
function opsRows(): OpsFactRow[] {
  const area = cateringServiceArea();

  return [
    {
      id: "ops-min",
      labelHe: "מינימום משתתפים",
      value: filled(SLOTS.minGuests) ? <Num inline>{SLOTS.minGuests}</Num> : null,
    },
    {
      id: "ops-lead-time",
      labelHe: "כמה מראש מזמינים",
      value: filled(SLOTS.leadTime) ? SLOTS.leadTime : null,
    },
    {
      id: "ops-headcount",
      labelHe: "עד מתי מעדכנים מספר משתתפים",
      value: filled(SLOTS.headcountDeadline) ? SLOTS.headcountDeadline : null,
    },
    {
      id: "ops-area",
      labelHe: "לאן מגיעים",
      value: area
        ? area.citiesHe.length > 0
          ? area.citiesHe.join(" · ")
          : area.descriptionHe
        : null,
    },
  ];
}

/* ═══════════════════ שאלות ותשובות ═══════════════════ */

type PageFaq = FaqItem & { answerHe: string | null };

/**
 * סט של קונה משאבי אנוש (T-1): מספר משתתפים שזז, לוח זמנים של יום שלם,
 * ורכש. שונה במפורש מסט הרכש של `/catering/business` ומסט החג של
 * ‎`/catering/holidays`. כל תשובה קשורה למשבצת ולכן נדלקת מאליה.
 */
function faqItems(): PageFaq[] {
  return [
    {
      id: "faq-min",
      questionHe: "כמה משתתפים צריך בשביל להזמין?",
      answerHe: filled(SLOTS.minGuests) ? `מ־${SLOTS.minGuests} משתתפים.` : null,
    },
    {
      id: "faq-headcount",
      questionHe: "מספר המשתתפים עוד זז — עד מתי אפשר לעדכן?",
      answerHe: filled(SLOTS.headcountDeadline) ? SLOTS.headcountDeadline : null,
    },
    {
      id: "faq-lead-time",
      questionHe: "כמה זמן מראש צריך להזמין?",
      answerHe: filled(SLOTS.leadTime) ? SLOTS.leadTime : null,
    },
    {
      id: "faq-includes",
      questionHe: "מה כלול בהזמנה?",
      answerHe: filled(SLOTS.priceIncludes) ? SLOTS.priceIncludes.join(" · ") : null,
    },
    {
      id: "faq-payment",
      questionHe: "מה תנאי התשלום והביטול?",
      answerHe: filled(SLOTS.paymentTerms) ? SLOTS.paymentTerms : null,
    },
  ];
}

/* ═══════════════════ הסקשן הייחודי של הדף ═══════════════════ */

/**
 * ‎T-1. הבלוק הזה מתאר את **השיחה**, לא את היכולת — וזו ההבחנה שמחזיקה
 * אותו כשכל המשבצות ריקות. ארבע שאלות שאנחנו שואלים, ואף אחת מהן אינה
 * הבטחה: שאלה על מיקום אינה טענת אזור חלוקה, ושאלה על צורת ההגשה אינה
 * הצהרה שכל צורה זמינה.
 *
 * זה גם מה שהופך את הדף לשימושי לקונה: מנהלת משאבי אנוש שקוראת את
 * ארבע השורות האלה יודעת מה להביא לשיחה, וזו בדיוק ההכנה שחוסכת סבב.
 */
const WHAT_WE_NEED = [
  {
    qHe: "לאן",
    bodyHe:
      "כתובת או שם המקום. יום גיבוש קורה במקומות שאין בהם מטבח, ולפעמים אין בהם גם שולחן — וזה משנה את התפריט.",
  },
  {
    qHe: "כמה",
    bodyHe:
      "מספר משתתפים משוער מספיק בשלב הזה. מספר סופי נסגר מאוחר יותר, וגם אצלכם הוא עדיין זז.",
  },
  {
    qHe: "מתי בתוך היום",
    bodyHe:
      "ארוחה שנופלת אחרי פעילות היא לא אותה ארוחה כמו כזאת שפותחת את היום. השעה קובעת מה נכון להגיש.",
  },
  {
    qHe: "איך מגישים",
    bodyHe:
      "שולחן אחד שכולם ניגשים אליו, או כמה נקודות לאורך היום. גם זה שינוי בתפריט ולא רק בלוגיסטיקה.",
  },
] as const;

function WhatWeNeed({ num }: { num?: string }) {
  return (
    <section id="what-we-need" className="sec">
      <div className="wrap">
        <SectionHeader
          num={num}
          title="מה אנחנו צריכים לדעת על היום שלכם"
          lede="ארבע שאלות, והן כל השיחה הראשונה. אפשר להביא את התשובות מוכנות, ואפשר גם לא."
          reveal={false}
        />

        <ol className="m-0 grid list-none grid-cols-1 gap-px border-t border-solid border-[color:var(--rule)] p-0 sm:grid-cols-2">
          {WHAT_WE_NEED.map((item, i) => (
            <li
              key={item.qHe}
              className="m-0 border-b border-solid border-[color:var(--rule)] py-7"
            >
              <div className="max-w-body pe-6">
                <span className="block font-serif text-xl font-medium text-fg-subtle num">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-3 font-serif text-lg font-bold">{item.qHe}</h3>
                <p className="mt-2 text-xs leading-[1.6] text-fg-muted">{item.bodyHe}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ═══════════════════ העמוד ═══════════════════ */

export default function CateringFunDay() {
  const wa = useHeroWhatsApp();

  const dishes = React.useMemo<DishLine[]>(
    () =>
      dishesForCut(OCCASION.menu).map((dish) => ({
        id: dish.id,
        nameHe: dish.nameHe,
        descriptionHe: dish.descriptionHe,
        course: dish.course,
        mark: provenanceMark(dish),
      })),
    [],
  );

  /* `offered` מגיע מ־`config/service-formats.ts`, שטרם נוצר. עד אז
     `false` לכולם והבאנד מחזיר null. אין להחליף ל־`true` «כי זה הגיוני». */
  const formats = React.useMemo<ServiceFormatSpec[]>(
    () => serviceFormatsFor(OCCASION).map((id) => ({ id, offered: false })),
    [],
  );

  const faqs = faqItems();
  const rows = opsRows();
  const showMenuSheet = dishes.length > 0;

  const nextLinks = React.useMemo<NextStepLink[]>(
    () =>
      buildableOccasions()
        .filter((o) => o.id !== OCCASION.id)
        .map((o) => ({
          href: o.route,
          titleHe: o.nameHe,
          descriptionHe: o.intentHe,
        })),
    [],
  );

  /* ‎§3.1 — מספור לפי מיקום. כש־`StationsBlock` ייכנס, הוא ייכנס לרשימה
     הזאת לפני `menu` וכל השאר יתקדם מאליו. */
  const order = [
    showMenuSheet ? "menu" : null,
    formats.some((f) => f.offered) ? "formats" : null,
    "what-we-need",
    "kitchen",
    "quote",
    faqs.some((f) => f.answerHe) ? "faq" : null,
  ].filter((k): k is string => k !== null);

  const num = (key: string) => {
    const i = order.indexOf(key);
    return i < 0 ? undefined : String(i + 1).padStart(2, "0");
  };

  const kashrut = kashrutClauseHe("general");
  const facts = ["מטבח של מסעדה איטלקית פעילה", kashrut].filter(
    (c): c is string => Boolean(c),
  );

  return (
    <>
      <Head
        meta={META}
        jsonLd={[
          stripEmptyJsonLd(buildWebPage(META)),
          /* ‎`audience: BusinessAudience` — הקונה כאן הוא ארגון, וזו
             העובדה היחידה שהצומת מוסיף. בלי `areaServed`: אזור החלוקה
             ריק, ואין לגזור אותו ממיקומי המסעדות. */
          stripEmptyJsonLd(
            buildService({
              path: SOURCE_PAGE,
              nameHe: OCCASION.nameHe,
              descriptionHe: META.descriptionHe,
              audience: "business",
            }),
          ),
          buildBreadcrumbList(META.breadcrumb),
          buildFaqPage(faqs),
        ]}
      />

      <OccasionIntro
        eyebrow="קייטרינג מאמאמיה · ימי גיבוש"
        title={
          <>
            יום גיבוש,
            <br />
            והאוכל הוא
            <br />
            חלק מהיום.
          </>
        }
        lede="יום צוות מחוץ למשרד הוא קודם כול לוח זמנים, ורק אחר כך ארוחה. מספרים לנו לאן, לכמה אנשים ובאיזו שעה, והתפריט נבנה סביב זה."
        facts={facts}
        primary={{ label: "בנו תפריט ליום גיבוש", href: "#quote" }}
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
            צמודה לפקד. */}
        <Prose
          size="fine"
          measure="body"
          className="mt-5 border-s border-solid border-s-[color:var(--rule)] ps-[.9rem]"
        >
          <p>
            בלחיצה על וואטסאפ נשמרת אצלנו פנייה עם הפרטים שמופיעים בהודעה.{" "}
            <a href="/privacy" className="underline underline-offset-[.22em]">
              מדיניות הפרטיות
            </a>
          </p>
        </Prose>
      </OccasionIntro>

      <OpsFacts rows={rows} variant="strip" />

      {/* כאן ייכנס `StationsBlock` ביום שבו `SLOTS.liveStations` יימסר.
          עד אז אין בלוק, ואין שם תחנה בשום מקום בעמוד. */}

      <MenuSheet
        id="menu"
        num={num("menu")}
        dishes={dishes}
        title="מהתפריט ליום גיבוש"
        lede="המנות הן המנות של המסעדה. התפריט ליום שלכם נבנה מהן, לפי מספר המשתתפים ולפי איפה הארוחה נופלת בלוח."
      />

      <ServiceFormats
        id="formats"
        num={num("formats")}
        formats={formats}
        sourcePage={SOURCE_PAGE}
        title="איך זה מגיע"
      />

      <WhatWeNeed num={num("what-we-need")} />

      <KitchenNote num={num("kitchen")} />

      <QuoteCta
        num={num("quote")}
        sourcePage={SOURCE_PAGE}
        seed={{ eventType: OCCASION.eventTypeSeed }}
        title="התפריט שלכם ליום גיבוש"
        lede="ארבע שאלות על היום, ואז פרטים ליצירת קשר. אפשר גם פשוט לכתוב בוואטסאפ."
      />

      <FaqBand id="faq" num={num("faq")} items={faqs} title="שאלות שנשאלות בטלפון" />

      <NextSteps sourcePage={SOURCE_PAGE} links={nextLinks} />
    </>
  );
}
