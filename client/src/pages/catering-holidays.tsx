/**
 * ═══════════════════════════════════════════════════════════════════════
 *  P-12 · `/catering/holidays` — קייטרינג לחגים.
 *  spec 01 §4 P-12, §3.1, §3.3, INV-2, INV-9.
 * ═══════════════════════════════════════════════════════════════════════
 *
 * המערכת החזותית היא `docs/spec/04-visual-reference.md`, שגובר על 03 §2–§6.
 *
 * ─────────────────────────────────────────────────────────────────────
 *  למה זה העמוד הירוק־עד, ולא עמוד חג
 * ─────────────────────────────────────────────────────────────────────
 * ‏§4 P-12 דורש מסלול אחד עם משבצת עונתית מונעת־תאריך, ולא חמישה עמודים
 * דקים: `content/seasons.ts` מחזיק חלון פעיל לכל חג, ומחוצה לו הדף מציג
 * גרסה ירוקת־עד ו**לעולם לא חג שעבר**.
 *
 * ‏`content/seasons.ts` **טרם נוצר**, ולכן אין היום ולו חלון פעיל אחד —
 * ומכאן שהדף הזה הוא, בהגדרה, הגרסה הירוקה־עד. זו אינה גרסה חלקית: היא
 * המצב שאליו הדף חוזר בכל יום בשנה שאינו בתוך חלון חתום.
 *
 * שתי מסקנות שמחזיקות את כל הקופי כאן:
 *
 *   1. **אין שם חג בגוף הדף.** `קייטרינג ראש השנה` / `שבועות` / `סוכות`
 *      הם קלאסטרים יקרים, והפיתוי לפזר אותם בטקסט הוא בדיוק הפיתוי שיוצר
 *      דלת כניסה. יכולת לכל חג בנפרד היא עובדת בעלים שלא נמסרה — לומר
 *      «אנחנו עושים ראש השנה» הוא מצג, לא מילת מפתח.
 *   2. **אין תאריך הזמנה אחרון.** `orderByDate` הוא משבצת ב־`seasons.ts`
 *      ואינו נגזר מלוח עברי בזמן בנייה (§5.10 / INV-9). בלעדיו אין שורת
 *      «להזמין עד», ואין `Offer.availabilityEnds` ב־JSON-LD.
 *
 * ‏`lib/seo.ts` מחזיק `holidayMeta(seasonNameHe)`. הוא **אינו** נקרא כאן:
 * אין עונה פעילה למסור לו, והתיאור שהוא מייצר עדיין נוקב בשלוש ערים
 * כמוצא האוכל — פגם שמדווח, ושמקומו ב־`lib/seo.ts` ולא כאן.
 *
 * ‏§4 P-12 מצטט כותרת עם `ארוזה, מסומנת ומוכנה להגשה`. שלושת התארים
 * הוסרו: אריזה וסימון הם נוהג תפעולי שאיש לא מסר.
 *
 * ─────────────────────────────────────────────────────────────────────
 *  היררכיית ההמרה — זהה בחמשת הדפים שבבעלותי
 * ─────────────────────────────────────────────────────────────────────
 *   1. **הבנאי, ב־`#quote`.** משבצת אחת, וכל פקד ענבר מצביע אליה.
 *   2. **וואטסאפ.** מתאר־קו בהירו, וירוק ממולא **פעם אחת** מתחת לבנאי.
 *   3. **הטלפון.** מספר קריא בשורת טקסט, לעולם לא כפתור.
 *
 * ─────────────────────────────────────────────────────────────────────
 *  מה נשמט היום
 * ─────────────────────────────────────────────────────────────────────
 *   OpsFacts       זמן התראה, מינימום, דדליין סועדים ואזור — כולם `null`.
 *   MenuSheet      `content/dishes.ts` ריק ⇒ 0 מנות בחתך ⇒ אין סקשן.
 *   ServiceFormats אף פורמט אינו מסומן `offered` — `config/service-formats.ts`
 *                  טרם נוצר, ו־`plated_staffed` הוא ממילא הצהרה על צוות
 *                  וכלים שלא נמסרה.
 *   ReviewsBlock · Gallery   `content/proof.ts` ריק ⇒ מחזירות null.
 *
 * המבחן שהדף נבנה לעבור: להיראות מכוון וגמור כשכל המשבצות ריקות.
 */

import * as React from "react";
import { useLocation } from "wouter";
import { Head } from "@/components/seo/head";
import { Num, Prose, SectionHeader } from "@/components/primitives";
import {
  BranchStrip,
  FaqBand,
  KitchenNote,
  MenuSheet,
  OccasionIntro,
  OpsFacts,
  QuoteCta,
  ServiceFormats,
  type DishLine,
  type FaqItem,
  type OpsFactRow,
  type ServiceFormatSpec,
} from "@/components/bands";
import { MenuConfigurator } from "@/components/configurator";
import {
  ContactBar,
  Gallery,
  KashrutBadge,
  OccasionGrid,
  ReviewsBlock,
  hasKashrutWording,
} from "@/components/trust";
import { SLOTS, filled } from "@/content/business";
import { dishesForCut, provenanceMark } from "@/content/dishes";
import { cateringServiceArea } from "@/content/locations";
import { buildableOccasions, occasionById, serviceFormatsFor } from "@/content/occasions";
import { hasConfigurator, hasPackages } from "@/content/packages";
import { hasGallery, hasGoogleReviews, hasTestimonials } from "@/content/proof";
import { resolveExtraMeta, stripEmptyJsonLd } from "@/lib/page-meta-extra";
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
 * ‏TODO(01 §5.7): מקומו של הקוד הזה ב־`lib/whatsapp.ts openWhatsApp()`.
 */
function useHeroWhatsApp(eventType: string | null) {
  const [ref] = React.useState(() => newRef());
  const answers = React.useMemo(() => (eventType ? { eventType } : {}), [eventType]);
  const href = React.useMemo(() => buildWaHref(answers, ref), [answers, ref]);

  const onClick = React.useCallback<React.MouseEventHandler<HTMLButtonElement & HTMLAnchorElement>>(
    (e) => {
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;

      track("whatsapp_click", { wa_location: "hero", has_lead: Boolean(eventType) });
      captureWaIntent({ ref, waLocation: "hero", ...(eventType ? { eventType } : {}) });
      track("whatsapp_handoff", { lead_ref: ref, wa_location: "hero" });

      /* נייד: אותה לשונית. לשונית ריקה שנשארת מאחור נקראת כאתר שבור. */
      const mobile =
        typeof navigator !== "undefined" && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
      if (mobile) {
        e.preventDefault();
        window.location.href = href;
      }
    },
    [eventType, href, ref],
  );

  return { href, onClick };
}

/* ═══════════════════ הבנאי — משבצת ההמרה היחידה ═══════════════════ */

type Seed = React.ComponentProps<typeof QuoteCta>["seed"];

/**
 * ‏04 §6: המגדיר **בונה** את הארוחה במקום **לבקש** הצעה, ואינו מתפקד בלי
 * מנות. כל עוד `PACKAGES` או `DISHES` ריקים המשבצת מחזיקה את בנאי ארבע
 * השאלות — **עם ההזרעה**, ש־`MenuConfigurator` אינו מקבל.
 *
 * ‏TODO(dev): `seed` על `MenuConfiguratorProps`, ואז הענף הזה מיותר.
 * הקומפוננטה אינה בבעלותי — מדווח.
 */
function BuilderSection({
  num,
  seed,
  title,
  lede,
}: {
  num?: string;
  seed: Seed;
  title: React.ReactNode;
  lede: React.ReactNode;
}) {
  const [, navigate] = useLocation();
  const live = hasConfigurator() && hasPackages();

  if (!live) {
    return (
      <QuoteCta
        id="quote"
        num={num}
        sourcePage={SOURCE_PAGE}
        seed={seed}
        eyebrow="בונים את הארוחה"
        title={title}
        lede={lede}
      />
    );
  }

  return (
    <div
      id="quote"
      className="border-y border-solid border-y-[color:var(--rule)] bg-bg-form py-sec [&_.sec]:py-0 [&_.wrap]:max-w-none [&_.wrap]:px-0"
    >
      <div className="wrap">
        <SectionHeader
          num={num}
          eyebrow="בונים את הארוחה"
          title={title}
          lede={lede}
          reveal={false}
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

/* ═══════════════════ הרצועה התפעולית ═══════════════════ */

/**
 * ‏§4 P-12 מבקש: תאריך הזמנה אחרון · איסוף מול משלוח · שעות איסוף.
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
 * לשבת גם. אלה השאלות שנשאלות כאן ולא ב־`/catering/business`. כל תשובה
 * שנשענת על עובדה נקראת ממשבצת, והבאנד נדלק מאליו.
 */
function faqItems(): PageFaq[] {
  return [
    {
      id: "faq-who-cooks",
      questionHe: "מי מבשל את האוכל?",
      answerHe:
"המטבח של מסעדה פעילה — מטבח שמבשל לסועדים שיושבים בו, ולא מטבח שנפתח כדי לשרת אירועים.",
    },
    {
      id: "faq-how-to-order",
      questionHe: "איך מזמינים ארוחת חג?",
      answerHe:
"בונים את התפריט כאן בעמוד ומשאירים פרטים, או כותבים לנו בוואטסאפ. חוזרים אליכם, עוברים על מספר הסועדים ועל מה שכבר יש לכם על השולחן, וההצעה נשלחת בכתב.",
    },
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
 * ‏T-1: לכל דף אירוע חייב להיות בלוק שאינו קיים בשום דף אחר. הבלוק הזה
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
    bodyHe: "ילדים, צמחונים, רגישות לגלוטן. עוברים על זה איתכם מראש, ולא ביום האירוח.",
  },
] as const;

function HolidayTable({ num }: { num?: string }) {
  return (
    <section id="holiday-table" className="sec">
      <div className="wrap">
        <SectionHeader
          num={num}
          eyebrow="האילוץ"
          title="מה שונה בארוחת חג"
          lede="ארוחת חג היא לא ארוחה גדולה יותר — היא ארוחה עם אילוצים אחרים. אלה השלושה שחוזרים בכל שיחה."
          reveal={false}
        />

        <ul className="m-0 grid list-none gap-grid p-0 [grid-template-columns:repeat(auto-fit,minmax(240px,1fr))]">
          {HOLIDAY_POINTS.map((point, i) => (
            <li
              key={point.titleHe}
              className="m-0 rounded-card border border-solid border-[color:var(--rule)] p-card"
            >
              {/* הספרה בענבר — אחת מארבע הנקודות ש־04 §2 שם בהן את המבטא. */}
              <span className="sec__num num">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="mt-3 text-lg font-semibold">{point.titleHe}</h3>
              <p className="mt-2 max-w-none text-xs leading-[1.6] text-fg-muted">{point.bodyHe}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ═══════════════════ העמוד ═══════════════════ */

export default function CateringHolidays() {
  const seedEventType = OCCASION.eventTypeSeed;
  const wa = useHeroWhatsApp(seedEventType);

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
   * עד אז `offered: false` לכולם, והבאנד מחזיר null. **אין להחליף את זה
   * ב־`true` «כי זה הגיוני»** — כל פורמט הוא הצהרה מסחרית.
   */
  const formats = React.useMemo<ServiceFormatSpec[]>(
    () => serviceFormatsFor(OCCASION).map((id) => ({ id, offered: false })),
    [],
  );

  const faqs = faqItems();
  const rows = opsRows();
  const showMenuSheet = dishes.length > 0;
  const showFormats = formats.some((f) => f.offered);

  const showProof = hasGoogleReviews() || hasTestimonials();
  const showGallery = hasGallery();

  /* אותו שער בדיוק שהרשת משתמשת בו, מחושב כאן כדי שהעמוד יידע אם
     לרנדר את הרצועה בכלל. */
  const otherOccasions = React.useMemo(
    () => buildableOccasions().filter((o) => o.id !== OCCASION.id),
    [],
  );

  /* ‏§3.1 — מקור המספור היחיד. סקשן שנשמט אינו משאיר חור ברצף. */
  const order = [
"quote",
"holiday-table",
    showMenuSheet ? "menu" : null,
    showFormats ? "formats" : null,
"kitchen",
"branches",
    faqs.some((f) => f.answerHe) ? "faq" : null,
  ].filter((k): k is string => k !== null);

  const num = (key: string) => {
    const i = order.indexOf(key);
    return i < 0 ? undefined : String(i + 1).padStart(2, "0");
  };

  /* גיזום ברמת הפסוקית (G5). הכשרות אינה נכתבת כאן כמחרוזת: `KashrutBadge`
     מצטט את המשבצת, וכשאין נוסח אין תג ואין רווח שמור. */
  const facts: React.ReactNode[] = [
    hasKashrutWording() ? <KashrutBadge key="kashrut" variant="pill" /> : null,
"מטבח של מסעדה פעילה",
  ].filter(Boolean);

  return (
    <>
      <Head
        meta={META}
        jsonLd={[
          stripEmptyJsonLd(buildWebPage(META)),
          /* ‏Service בלי `areaServed` ובלי `Offer`: אזור החלוקה ריק,
             ותאריך הזמנה אחרון יושב ב־`seasons.ts` שטרם נוצר —
             ‏`availabilityEnds` נפלט רק מתאריך חתום (§4 P-12). */
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
            מהמטבח של המסעדה.
          </>
        }
        lede="חג הוא הערב שבו הבית מארח, והמארח עומד במטבח יומיים. את החלק שאפשר להוציא החוצה אנחנו מבשלים אצלנו ומביאים אליכם."
        facts={facts}
        primary={{ label: "לבנות את התפריט לחג", href: "#quote" }}
        secondary={{
          label: "לכתוב לנו בוואטסאפ",
          variant: "ghost",
          href: wa.href,
          target: "_blank",
          rel: "noopener noreferrer",
          onClick: wa.onClick,
        }}
        callLocation="hero"
      >
        {/* ‏04 §5: מונה הביקורות הוא אות האמון המרכזי בקטגוריה. הבלוק
            מחווט ומחזיר `null` עד שהמספר האמיתי יימסר. */}
        <ReviewsBlock ratingOnly className="mt-8" />

        {/* INV-6: קליק על וואטסאפ כותב שורת ליד, ולכן הודעת סעיף 11 צמודה
            לפקד. אין להסיר אותה כדי «לנקות» את ההירו. */}
        <Prose
          size="fine"
          measure="body"
          className="mt-6 border-s border-solid border-s-[color:var(--rule)] ps-[.9rem]"
        >
          <p>
            בלחיצה על וואטסאפ נשמרת אצלנו פנייה עם פרטי האירוח שמופיעים בהודעה.{" "}
            <a href="/privacy" className="underline underline-offset-[.22em]">
              מדיניות הפרטיות
            </a>
          </p>
        </Prose>
      </OccasionIntro>

      <OpsFacts id="ops" rows={rows} variant="strip" eyebrow="מה שצריך לדעת" />

      {/* ═══ 01 · משבצת ההמרה. הדבר השני שהמארח רואה. ═══ */}
      <BuilderSection
        num={num("quote")}
        seed={{ eventType: seedEventType }}
        title="התפריט שלכם לחג"
        lede="כמה סועדים, לאיזה יום, ומה כבר יש לכם על השולחן. ההצעה חוזרת בכתב."
      />

      {/* המסלול השני. הפקד הירוק הממולא היחיד בעמוד. */}
      <section className="sec sec--tight">
        <div className="wrap">
          <ContactBar
            waLocation="quote_alt"
            callLocation="quote_alt"
            answers={seedEventType ? { eventType: seedEventType } : undefined}
            showQuote={false}
            labels={{ wa: "עדיף לי בוואטסאפ", phoneLead: "או פשוט חייגו" }}
          />
        </div>
      </section>

      <HolidayTable num={num("holiday-table")} />

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

      {/* ‏04 §5 — שכבת האמון. ריקה היום ולכן אינה קיימת. */}
      {showProof ? (
        <section id="reviews" className="sec sec--alt">
          <div className="wrap">
            <ReviewsBlock eyebrow="מה אומרים" title="ביקורות בגוגל" headingAs="h2" />
          </div>
        </section>
      ) : null}

      {showGallery ? (
        <section id="gallery" className="sec">
          <div className="wrap">
            <Gallery eyebrow="משולחנות החג" title="איך זה נראה בפועל" columns={3} />
          </div>
        </section>
      ) : null}

      <KitchenNote num={num("kitchen")} />

      {/* המסעדות כהקשר מותג בלבד — ולא כטענה על אזור שירות. */}
      <BranchStrip
        num={num("branches")}
        sourcePage={SOURCE_PAGE}
        eyebrow="ההקשר"
        title="המסעדות שמאחורי הקייטרינג"
        lede="מסעדות שפועלות לקהל הרחב. הקייטרינג הוא עיסוק נפרד שעובד לפי הזמנה, והוא מבושל במטבח של אחת מהן."
        flagshipLabelHe={null}
      />

      {/* הקריאה הארוכה על קרקע קרמית — מדיניות ההחלפה ב־`index.css`. */}
      {faqs.some((f) => f.answerHe) ? (
        <div data-band="cream">
          <FaqBand
            id="faq"
            num={num("faq")}
            items={faqs}
            eyebrow="לפני שמזמינים"
            title="שאלות שנשאלות בטלפון"
            lede="ומה שאין עליו תשובה כאן — שאלו אותנו ישירות."
          />
        </div>
      ) : null}

      {/* קישור פנימי + המרה: קונה מקמפיין רחב אינו יודע שיש דף שמדבר
          בדיוק על האירוע שלו. הרשת נגזרת מ־`buildableOccasions()`, ולכן
          מסלול חסום פשוט אינו קיים בה ואין כאן 404 בקמפיין משלם. השער
          חוזר גם כאן, כדי שלא תיוותר רצועה ריקה אם כולם ייחסמו. */}
      {otherOccasions.length > 0 ? (
        <section id="occasions" className="sec sec--alt">
          <div className="wrap">
            <OccasionGrid
              eyebrow="לאיזה אירוע"
              title="מה עוד יוצא מהמטבח"
              exclude={[OCCASION.id]}
            />
          </div>
        </section>
      ) : null}

      {/* הבאנד הסוגר. הענבר חוזר להיות הפקד הממולא. */}
      <section id="contact" className="sec sec--tight">
        <div className="wrap">
          <SectionHeader
            eyebrow="לסגור את הארוחה"
            title="נבנה לכם תפריט לחג"
            lede="ספרו לנו כמה סועדים ולאיזה יום, ונחזור עם תפריט והצעה בכתב."
          />
          <ContactBar
            waLocation="footer"
            callLocation="footer"
            primary="quote"
            quoteHref="#quote"
            answers={seedEventType ? { eventType: seedEventType } : undefined}
            labels={{ quote: "לבנות את התפריט לחג", wa: "לכתוב לנו בוואטסאפ" }}
          />
        </div>
      </section>
    </>
  );
}
