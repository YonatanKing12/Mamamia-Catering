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
 *     ריק — הוא לא קיים (INV-2). כשהמשבצות יימסרו, הבלוק נכנס בין המגדיר
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
 *  היררכיית הפעולה — ראו `pages/catering.tsx`, מוחזקת כאן זהה
 * ─────────────────────────────────────────────────────────────────────
 *   1. המגדיר (`#quote`) — הענבר, מיד אחרי ההירו. `MenuConfigurator`
 *      בולע בעצמו את בנאי ארבע השאלות, ולכן אין בדף שני משטחי המרה.
 *   2. וואטסאפ — ירוק, בהירו ובבאנד הסוגר בלבד.
 *   3. טלפון — שורת טקסט, לא פקד שלישי (L-10).
 *
 * ‎**אזהרת רגרסיה:** המעבר מ־`QuoteCta` ל־`MenuConfigurator` איבד את
 * ‎`seed={{ eventType: OCCASION.eventTypeSeed }}` — ל־`MenuConfiguratorProps`
 * אין `seed`. מנהלת משאבי אנוש עדיין מקלידה את סוג האירוע בשלב הפרטים,
 * ולכן זה תיוג **חסר** ולא תיוג **שגוי** (02 §1.7 מעדיף בדיוק את הכיוון
 * הזה) — אבל זה פער אמיתי בייחוס, והוא מדווח בדוח החזרה.
 *
 * ─────────────────────────────────────────────────────────────────────
 *  מה נשמט היום
 * ─────────────────────────────────────────────────────────────────────
 *   StationsBlock  ראו למעלה. אין מודול ואין משבצת.
 *   OpsFacts       מינימום, זמן התראה, דדליין משתתפים ואזור — כולם `null`.
 *   MenuSheet      ‎`content/dishes.ts` ריק ⇒ 0 מנות בחתך ⇒ אין סקשן.
 *   ServiceFormats אף פורמט אינו מסומן `offered`.
 *   ReviewsBlock · ‎`content/proof.ts` ריק ⇒ אין דירוג בהירו ואין סקשן
 *   Gallery        הוכחה.
 */

import * as React from "react";
import { useLocation } from "wouter";
import { Head } from "@/components/seo/head";
import { Num, Prose, SectionHeader } from "@/components/primitives";
import {
  FaqBand,
  KitchenNote,
  MenuSheet,
  NextSteps,
  OccasionIntro,
  OpsFacts,
  ServiceFormats,
  type DishLine,
  type FaqItem,
  type NextStepLink,
  type OpsFactRow,
  type ServiceFormatSpec,
} from "@/components/bands";
import { MenuConfigurator } from "@/components/configurator";
import { ContactBar, Gallery, ReviewsBlock } from "@/components/trust";
import { SLOTS, filled } from "@/content/business";
import { dishesForCut, provenanceMark } from "@/content/dishes";
import { cateringServiceArea } from "@/content/locations";
import { buildableOccasions, occasionById, serviceFormatsFor } from "@/content/occasions";
import { hasAnyProof } from "@/content/proof";
import { kashrutClauseHe, resolveExtraMeta, stripEmptyJsonLd } from "@/lib/page-meta-extra";
import type { PageMetaExtra } from "@/lib/page-meta-extra";
import { buildBreadcrumbList, buildFaqPage, buildService, buildWebPage } from "@/lib/seo";
import { buildWaHref, captureWaIntent, newRef } from "@/lib/lead-client";
import { track } from "@/lib/analytics";

/** הרשומה קיימת תמיד ב־`page-meta-extra`; היעדרה הוא באג ולא מצב. */
const META = resolveExtraMeta("/catering/fun-day") as PageMetaExtra;

const SOURCE_PAGE = "/catering/fun-day";

const OCCASION = occasionById("fun-day");

/** הטענה היחידה המותרת על מוצא האוכל, בלשון יחיד. נכתבת פעם אחת. */
const KITCHEN_FACT_HE =
  "המטבח של מסעדה איטלקית פעילה — מטבח שמבשל כל יום לסועדים שיושבים בו, ולא מטבח שנפתח כדי לשרת אירועים.";

/* ═══════════════════ מסלול הוואטסאפ בהירו ═══════════════════ */

/**
 * חוזה §6.1–§6.3: קליטה מקדימה ואז ניווט **באותו tick**, בלי `await`.
 * ‎TODO(01 §5.7): עותק נוסף. מקומו ב־`lib/whatsapp.ts openWhatsApp()`.
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

/* ═══════════════════ המגדיר ═══════════════════ */

function ConfiguratorSection({ num }: { num?: string }) {
  const [, navigate] = useLocation();

  return (
    <div
      id="quote"
      className="border-y border-solid border-y-[color:var(--rule)] bg-bg-form py-sec [&_.sec]:py-0 [&_.wrap]:max-w-none [&_.wrap]:px-0"
    >
      <div className="wrap">
        <SectionHeader
          num={num}
          eyebrow="בונים את היום"
          title="התפריט שלכם ליום גיבוש"
          lede="מספרים לנו כמה משתתפים, לאן ובאיזו שעה. אנחנו חוזרים אליכם עם תפריט והצעה בכתב, כזאת שאפשר להעביר לרכש."
        />

        <MenuConfigurator
          id="quote-builder"
          sourcePage={SOURCE_PAGE}
          showHeader={false}
          onSubmitted={(ref, answers) =>
            navigate(`/thanks?ref=${encodeURIComponent(ref)}`, { state: { ref, answers } })
          }
        />
      </div>
    </div>
  );
}

/* ═══════════════════ שאלות ותשובות ═══════════════════ */

type PageFaq = FaqItem & { answerHe: string | null };

/**
 * סט של קונה משאבי אנוש (T-1): מספר משתתפים שזז, לוח זמנים של יום שלם,
 * ורכש. שונה במפורש מסט הרכש של `/catering/business` ומסט החג של
 * ‎`/catering/holidays`.
 *
 * שלושת הראשונים עונים היום. זה שינוי מכוון: קודם כל חמש השאלות היו
 * קשורות למשבצות ריקות, ולכן `FAQPage` לא נפלט כלל — הדף לא מסר למנוע
 * תשובות ולו עובדה אחת שניתן לצטט. השלושה שנוספו נכונים כשכל משבצת
 * ריקה, וכל אחד מהם משפט שלם שעומד בפני עצמו מחוץ להקשר.
 */
function faqItems(): PageFaq[] {
  return [
    {
      id: "faq-how",
      questionHe: "איך מזמינים קייטרינג ליום גיבוש?",
      answerHe:
        "בונים את התפריט כאן בדף ומשאירים פרטים, או שולחים את פרטי היום בוואטסאפ. אנחנו חוזרים אליכם, עוברים על מספר המשתתפים, על השעה ועל המקום, ושולחים הצעה בכתב.",
    },
    {
      id: "faq-who-cooks",
      questionHe: "מי מבשל את האוכל?",
      answerHe: KITCHEN_FACT_HE,
    },
    {
      id: "faq-kashrut",
      questionHe: "האם האוכל כשר?",
      /* דרך הבורר, כלשון הבעלים. לעולם לא כמחרוזת קשיחה (LAW 1). */
      answerHe: (() => {
        const k = kashrutClauseHe("general");
        return k ? `הקייטרינג ${k}.` : null;
      })(),
    },
    {
      id: "faq-no-kitchen",
      questionHe: "המקום שבחרנו בלי מטבח ובלי חשמל. זה בעיה?",
      /* תיאור של השיחה, לא הבטחת יכולת. אין כאן «אנחנו מסתדרים בכל מקום»
         ואין טענה על ציוד — שתיהן משבצות ריקות. */
      answerHe:
        "זה בדיוק מה שצריך להגיד לנו מראש. מקום בלי מטבח משנה את התפריט עצמו, ולא רק את הלוגיסטיקה, ולכן אנחנו שואלים על זה בשיחה הראשונה.",
    },
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
          eyebrow="השיחה הראשונה"
          title="מה אנחנו צריכים לדעת על היום שלכם"
          lede="ארבע שאלות, והן כל השיחה הראשונה. אפשר להביא את התשובות מוכנות, ואפשר גם לא."
        />

        {/* כרטיסים ברדיוס 12px, ספרה בענבר, גבול שנדלק ב־hover — אותה שפה
            של כרטיסי האירועים ושל בלוקי הטיעון בשאר דפי הסבב. */}
        <ol className="m-0 grid list-none gap-grid p-0 [grid-template-columns:repeat(auto-fit,minmax(230px,1fr))]">
          {WHAT_WE_NEED.map((item, i) => (
            <li
              key={item.qHe}
              className="m-0 rounded-card border border-solid border-[color:var(--rule)] bg-bg-alt p-card transition-colors duration-state ease-house hover:border-accent"
            >
              <span className="sec__num num">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="mt-3 text-lg font-semibold">{item.qHe}</h3>
              <p className="mt-2 max-w-none text-xs leading-[1.6] text-fg-muted">{item.bodyHe}</p>
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
  const answered = faqs.filter(
    (f): f is FaqItem & { answerHe: string } => f.answerHe !== null,
  );
  const rows = opsRows();
  const showMenuSheet = dishes.length > 0;
  const proof = hasAnyProof();

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
     הזאת אחרי `quote` וכל השאר יתקדם מאליו. */
  const order = [
    "quote",
    showMenuSheet ? "menu" : null,
    formats.some((f) => f.offered) ? "formats" : null,
    "what-we-need",
    proof ? "proof" : null,
    "kitchen",
    answered.length > 0 ? "faq" : null,
  ].filter((k): k is string => k !== null);

  const num = (key: string) => {
    const i = order.indexOf(key);
    return i < 0 ? undefined : String(i + 1).padStart(2, "0");
  };

  const facts = ["מטבח של מסעדה איטלקית פעילה", kashrutClauseHe("general")].filter(
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
          buildFaqPage(answered),
        ]}
      />

      <OccasionIntro
        eyebrow="קייטרינג מאמאמיה · ימי גיבוש"
        title={
          <>
            יום גיבוש,
            <br />
            והאוכל הוא חלק מהיום.
          </>
        }
        lede="יום צוות מחוץ למשרד הוא קודם כול לוח זמנים, ורק אחר כך ארוחה. אומרים לנו לאן, לכמה אנשים ובאיזו שעה, והתפריט נבנה סביב זה."
        facts={facts}
        primary={{ label: "לבנות את התפריט ליום גיבוש", href: "#quote" }}
        secondary={{
          label: "לכתוב לנו בוואטסאפ",
          variant: "wa",
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
          className="mt-3 border-s border-solid border-s-[color:var(--rule)] ps-[.9rem]"
        >
          <p>
            בלחיצה על וואטסאפ נשמרת אצלנו פנייה עם הפרטים שמופיעים בהודעה.{" "}
            <a href="/privacy" className="underline underline-offset-[.22em]">
              מדיניות הפרטיות
            </a>
          </p>
        </Prose>

        <ReviewsBlock ratingOnly className="mt-6" />
      </OccasionIntro>

      <OpsFacts rows={rows} variant="strip" />

      {/* 01 · המגדיר, מיד אחרי ההירו.
          כאן ייכנס `StationsBlock` ביום שבו `SLOTS.liveStations` יימסר.
          עד אז אין בלוק, ואין שם תחנה בשום מקום בעמוד. */}
      <ConfiguratorSection num={num("quote")} />

      {showMenuSheet ? (
        <div data-band="cream">
          <MenuSheet
            id="menu"
            num={num("menu")}
            dishes={dishes}
            title="מהתפריט ליום גיבוש"
            lede="המנות הן המנות של המסעדה. התפריט ליום שלכם נבנה מהן, לפי מספר המשתתפים ולפי איפה הארוחה נופלת בלוח."
          />
        </div>
      ) : null}

      <ServiceFormats
        id="formats"
        num={num("formats")}
        formats={formats}
        sourcePage={SOURCE_PAGE}
        title="איך זה מגיע"
      />

      <WhatWeNeed num={num("what-we-need")} />

      {proof ? (
        <section id="proof" className="sec sec--alt">
          <div className="wrap">
            <SectionHeader num={num("proof")} eyebrow="מה אומרים" title="ארגונים שכבר הזמינו" />
            <ReviewsBlock className="mt-2" />
            <Gallery className="mt-10" columns={3} />
          </div>
        </section>
      ) : null}

      <KitchenNote num={num("kitchen")} />

      {answered.length > 0 ? (
        <div data-band="cream">
          <FaqBand
            id="faq"
            num={num("faq")}
            items={faqs}
            eyebrow="לפני שמזמינים"
            title="שאלות שנשאלות בטלפון"
          />
        </div>
      ) : null}

      {/* ═══ הבאנד הסוגר ═══ */}
      <section id="contact" className="sec sec--alt">
        <div className="wrap">
          <SectionHeader
            eyebrow="לסגור את היום"
            title="נבנה לכם תפריט"
            lede="ספרו לנו לאן, לכמה אנשים ובאיזו שעה, ונחזור אליכם עם הצעה בכתב."
          />

          <ContactBar
            waLocation="footer"
            primary="whatsapp"
            quoteHref="#quote"
            labels={{ quote: "לבנות את התפריט" }}
            callLocation="footer"
            framed={false}
          />
        </div>
      </section>

      <NextSteps sourcePage={SOURCE_PAGE} links={nextLinks} />
    </>
  );
}
