/**
 * ═══════════════════════════════════════════════════════════════════════
 *  P-12 · `/catering/holidays` — קייטרינג לחגים.
 *  spec 01 §4 P-12, §3.1, §3.3, INV-2, INV-9.
 * ═══════════════════════════════════════════════════════════════════════
 *
 * ─────────────────────────────────────────────────────────────────────
 *  למה זה העמוד הירוק־עד, ולא עמוד חג
 * ─────────────────────────────────────────────────────────────────────
 * ‎§4 P-12 דורש מסלול אחד עם משבצת עונתית מונעת־תאריך, ולא חמישה עמודים
 * דקים: `content/seasons.ts` מחזיק חלון פעיל לכל חג, ומחוצה לו הדף
 * מציג גרסה ירוקת־עד ו**לעולם לא חג שעבר**.
 *
 * ‎`content/seasons.ts` **טרם נוצר**, ולכן אין היום ולו חלון פעיל אחד —
 * ומכאן שהדף הזה הוא, בהגדרה, הגרסה הירוקה־עד. זו אינה גרסה חלקית: היא
 * המצב שאליו הדף חוזר בכל יום בשנה שאינו בתוך חלון חתום.
 *
 * שתי מסקנות שמחזיקות את כל הקופי כאן:
 *
 *   1. **אין שם חג בגוף הדף.** `קייטרינג ראש השנה` / `שבועות` / `סוכות`
 *      הם קלאסטרים יקרים, והפיתוי לפזר אותם בטקסט הוא בדיוק הפיתוי
 *      שיוצר דלת כניסה. יכולת לכל חג בנפרד («per-חג capability», §2)
 *      היא עובדת בעלים שלא נמסרה — לומר `אנחנו עושים ראש השנה` הוא
 *      מצג, לא מילת מפתח. הדף מדבר על **ארוחת חג** בלשון כללית עד
 *      שיימסרו חלונות חתומים.
 *   2. **אין תאריך הזמנה אחרון.** `orderByDate` הוא משבצת ב־`seasons.ts`
 *      ואינו נגזר מלוח עברי בזמן בנייה (‎§5.10 / INV-9). בלעדיו אין
 *      שורת «להזמין עד», ואין `Offer.availabilityEnds` ב־JSON-LD.
 *
 * ‎`lib/seo.ts` מחזיק `holidayMeta(seasonNameHe)` שמייצר כותרת עם שם החג
 * ועם השנה. הוא **אינו** נקרא כאן: אין עונה פעילה למסור לו, והתיאור שהוא
 * מייצר עדיין נוקב בשלוש ערים כמוצא האוכל — פגם שמדווח בדוח החזרה,
 * ושמקומו ב־`lib/seo.ts` ולא כאן.
 *
 * ─────────────────────────────────────────────────────────────────────
 *  הכותרת — שלוש מילים שהוסרו
 * ─────────────────────────────────────────────────────────────────────
 * ‎§4 P-12 מצטט `ארוחת {חג} מהמטבח של המסעדה — ארוזה, מסומנת ומוכנה
 * להגשה.` ‏00-spec-review §A4 מוחק את שלושת התארים: אריזה וסימון הם
 * נוהג תפעולי שאיש לא מסר, והוא אינו מופיע אפילו ברשימת שאלות הבעלים.
 * הביקורת גוברת על המפרט. הכותרת כאן היא המשפט שנשאר אחריהם.
 *
 * ─────────────────────────────────────────────────────────────────────
 *  מה נשמט היום
 * ─────────────────────────────────────────────────────────────────────
 *   OpsFacts       זמן התראה, מינימום, דדליין סועדים ואזור — כולם `null`.
 *   MenuSheet      ‎`content/dishes.ts` ריק ⇒ 0 מנות בחתך ⇒ אין סקשן
 *                  (‎§3.3 שורת "0"), והדף עובר לרג׳יסטר התפעולי.
 *   ServiceFormats אף פורמט אינו מסומן `offered` — `config/service-formats.ts`
 *                  טרם נוצר, ו־`plated_staffed` הוא ממילא הצהרה על צוות
 *                  וכלים שלא נמסרה. הבאנד מחזיר null.
 *   Faq            ארבע השאלות קשורות למשבצות, וכולן ריקות.
 *
 * המבחן שהדף נבנה לעבור: להיראות מכוון וגמור כשכל המשבצות ריקות.
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
const META = resolveExtraMeta("/catering/holidays") as PageMetaExtra;

const SOURCE_PAGE = "/catering/holidays";

const OCCASION = occasionById("holidays");

/* ═══════════════════ מסלול הוואטסאפ בהירו ═══════════════════ */

/**
 * חוזה §6.1–§6.3: קליטה מקדימה ואז ניווט **באותו tick**, בלי `await`.
 * המזהה נוצר ברינדור, ולכן ה־href הסטטי נושא אותו גם בלי JS.
 *
 * ‎TODO(01 §5.7): עותק רביעי של אותו קוד (`WhatsAppBand`, `pages/home.tsx`,
 * ‎`pages/menus.tsx`, `pages/catering.tsx`). מקומו ב־`lib/whatsapp.ts`.
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

      /* נייד: אותה לשונית. לשונית ריקה שנשארת מאחור נקראת כאתר שבור. */
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
 * ‎§4 P-12 מבקש: תאריך הזמנה אחרון · איסוף מול משלוח · שעות איסוף.
 * לשלושתם אין משבצת: הראשון יושב ב־`seasons.ts` שטרם נוצר, והשניים
 * האחרים הם יכולות תפעוליות שלא נמסרו. במקומם נשאלות כאן ארבע השאלות
 * שכן יש להן משבצת — וכולן `null`, ולכן הרצועה אינה מרונדרת.
 */
function opsRows(): OpsFactRow[] {
  const area = cateringServiceArea();

  return [
    {
      id: "ops-lead-time",
      labelHe: "כמה מראש מזמינים",
      value: filled(SLOTS.leadTime) ? SLOTS.leadTime : null,
    },
    {
      id: "ops-headcount",
      labelHe: "עד מתי מעדכנים מספר סועדים",
      value: filled(SLOTS.headcountDeadline) ? SLOTS.headcountDeadline : null,
    },
    {
      id: "ops-min",
      labelHe: "מינימום סועדים",
      value: filled(SLOTS.minGuests) ? <Num inline>{SLOTS.minGuests}</Num> : null,
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
 * סט ייחודי לדף החגים (T-1): שולחן אחד, כולם יושבים יחד, והמארח רוצה
 * לשבת גם. אלה השאלות שנשאלות כאן ולא ב־`/catering/business`.
 * כל תשובה נקראת ממשבצת — הבאנד נדלק מאליו.
 */
function faqItems(): PageFaq[] {
  return [
    {
      id: "faq-lead-time",
      questionHe: "כמה זמן לפני החג צריך לסגור?",
      answerHe: filled(SLOTS.leadTime) ? SLOTS.leadTime : null,
    },
    {
      id: "faq-headcount",
      questionHe: "מגיעים עוד אורחים ברגע האחרון — עד מתי אפשר לעדכן?",
      answerHe: filled(SLOTS.headcountDeadline) ? SLOTS.headcountDeadline : null,
    },
    {
      id: "faq-includes",
      questionHe: "מה כלול בהזמנה, ומה לא?",
      answerHe: filled(SLOTS.priceIncludes)
        ? [
            SLOTS.priceIncludes.join(" · "),
            filled(SLOTS.priceExcludes) ? `לא כלול: ${SLOTS.priceExcludes.join(" · ")}` : null,
          ]
            .filter(Boolean)
            .join(". ")
        : null,
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
 * ‎T-1: לכל דף אירוע חייב להיות בלוק שאינו קיים בשום דף אחר. הבלוק הזה
 * מתאר את **האילוץ של ארוחת חג**, מצד המארח — ולא יכולת שלנו.
 *
 * כל שורה כאן היא תיאור של מה שהקונה מכיר מהבית שלו. אין בה מספר, אין
 * שעה, אין הבטחה ואין שם חג. זו הסיבה שהיא נשארת נכונה גם כשכל המשבצות
 * ריקות, וגם ביום שבו `seasons.ts` יתמלא.
 */
const HOLIDAY_POINTS = [
  {
    titleHe: "כולם יושבים יחד, בבת אחת",
    bodyHe:
      "ארוחת חג אינה בופה שנפתח לאורך ערב. יש שעה אחת שבה כולם מסובים, וממנה נגזר איך התפריט נבנה ומה מגיע מוכן לגמרי.",
  },
  {
    titleHe: "המארח רוצה גם לשבת",
    bodyHe:
      "מי שמארח חג בבית מבשל בדרך כלל יומיים. החלק שאפשר להוציא החוצה הוא בדיוק החלק שגוזל את היומיים האלה.",
  },
  {
    titleHe: "בשולחן יושבים גם מי שלא אוכל הכול",
    bodyHe:
      "ילדים, צמחונים, רגישות לגלוטן. אנחנו עוברים על זה איתכם מראש, ולא ביום האירוח.",
  },
] as const;

function HolidayTable({ num }: { num?: string }) {
  return (
    <section id="holiday-table" className="sec">
      <div className="wrap">
        <SectionHeader
          num={num}
          title="מה שונה בארוחת חג"
          lede="ארוחת חג היא לא ארוחה גדולה יותר — היא ארוחה עם אילוצים אחרים. אלה השלושה שחוזרים בכל שיחה."
          reveal={false}
        />

        <ul className="m-0 list-none border-t border-solid border-t-[color:var(--rule)] p-0">
          {HOLIDAY_POINTS.map((point) => (
            <li
              key={point.titleHe}
              className="m-0 border-b border-solid border-b-[color:var(--rule)] py-7"
            >
              <div className="max-w-body pe-6">
                <h3 className="m-0 font-serif text-lg font-bold">{point.titleHe}</h3>
                <p className="mt-2 text-xs leading-[1.6] text-fg-muted">{point.bodyHe}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ═══════════════════ העמוד ═══════════════════ */

export default function CateringHolidays() {
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

  /**
   * פורמטי ההגשה הרלוונטיים מגיעים מ־`occasions.ts`, אבל `offered` הוא
   * שער נפרד: הוא נמסר רק ב־`config/service-formats.ts`, שטרם נוצר.
   * עד אז `offered: false` לכולם, והבאנד מחזיר null. **אין להחליף את
   * זה ב־`true` «כי זה הגיוני»** — כל פורמט הוא הצהרה מסחרית.
   */
  const formats = React.useMemo<ServiceFormatSpec[]>(
    () => serviceFormatsFor(OCCASION).map((id) => ({ id, offered: false })),
    [],
  );

  const faqs = faqItems();
  const rows = opsRows();
  const showMenuSheet = dishes.length > 0;

  /* קישורי המשך — נגזרים מ־`occasions.ts` ומסוננים שוב ב־`NextSteps`
     מול `shared/routes.ts`. אירוע חסום פשוט אינו קיים ברשימה. */
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

  /* ‎§3.1 — מקור המספור היחיד. סקשן שנשמט אינו משאיר חור ברצף. */
  const order = [
    showMenuSheet ? "menu" : null,
    formats.some((f) => f.offered) ? "formats" : null,
    "holiday-table",
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
  const facts = ["מטבח של מסעדה איטלקית פעילה", kashrut].filter(
    (c): c is string => Boolean(c),
  );

  return (
    <>
      <Head
        meta={META}
        jsonLd={[
          stripEmptyJsonLd(buildWebPage(META)),
          /* ‎Service בלי `areaServed` ובלי `Offer`: אזור החלוקה ריק,
             ותאריך הזמנה אחרון יושב ב־`seasons.ts` שטרם נוצר —
             ‎`availabilityEnds` נפלט רק מתאריך חתום (‎§4 P-12). */
          stripEmptyJsonLd(
            buildService({
              path: SOURCE_PAGE,
              nameHe: OCCASION.nameHe,
              descriptionHe: META.descriptionHe,
              audience: "consumer",
            }),
          ),
          buildBreadcrumbList(META.breadcrumb),
          buildFaqPage(faqs),
        ]}
      />

      <OccasionIntro
        eyebrow="קייטרינג מאמאמיה · חגים"
        title={
          <>
            ארוחת חג
            <br />
            מהמטבח
            <br />
            של המסעדה.
          </>
        }
        lede="חג הוא הערב שבו הבית מארח, והמארח עומד במטבח יומיים. את החלק שאפשר להוציא החוצה אנחנו מבשלים אצלנו ומביאים אליכם."
        facts={facts}
        primary={{ label: "בנו תפריט לחג", href: "#quote" }}
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
            בלחיצה על וואטסאפ נשמרת אצלנו פנייה עם פרטי האירוח שמופיעים בהודעה.{" "}
            <a href="/privacy" className="underline underline-offset-[.22em]">
              מדיניות הפרטיות
            </a>
          </p>
        </Prose>
      </OccasionIntro>

      <OpsFacts rows={rows} variant="strip" />

      <MenuSheet
        id="menu"
        num={num("menu")}
        dishes={dishes}
        title="מהתפריט לשולחן החג"
        lede="המנות הן המנות של המסעדה. התפריט לחג נבנה מהן, לפי מספר הסועדים ולפי מה שכבר יש לכם על השולחן."
      />

      <ServiceFormats
        id="formats"
        num={num("formats")}
        formats={formats}
        sourcePage={SOURCE_PAGE}
        title="איך זה מגיע"
      />

      <HolidayTable num={num("holiday-table")} />

      <KitchenNote num={num("kitchen")} />

      <QuoteCta
        num={num("quote")}
        sourcePage={SOURCE_PAGE}
        /* הזרעה גלויה וניתנת לעריכה (02 §1.7). הערך מגיע מ־`occasions.ts`
           ולא נכתב כאן, כדי שלא ייפרד מרשימת האפשרויות של הבנאי. */
        seed={{ eventType: OCCASION.eventTypeSeed }}
        title="התפריט שלכם לחג"
        lede="ארבע שאלות על הארוחה, ואז פרטים ליצירת קשר. אפשר גם פשוט לכתוב בוואטסאפ."
      />

      <FaqBand id="faq" num={num("faq")} items={faqs} title="שאלות שנשאלות בטלפון" />

      <NextSteps sourcePage={SOURCE_PAGE} links={nextLinks} />
    </>
  );
}
