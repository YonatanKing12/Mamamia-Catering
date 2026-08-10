/**
 * ═══════════════════════════════════════════════════════════════════════
 *  P-09 · `/catering/private-events` — שמחות פרטיות ואירוח בבית.
 * ═══════════════════════════════════════════════════════════════════════
 *
 * spec 01 §4 P-09, §3.1, §3.3, spec 02 §3.4, §3.9.
 * המערכת החזותית היא `docs/spec/04-visual-reference.md`, שגובר על 03 §2–§6.
 *
 * ─────────────────────────────────────────────────────────────────────
 *  היררכיית ההמרה — זהה בחמשת הדפים שבבעלותי
 * ─────────────────────────────────────────────────────────────────────
 *   1. **הבנאי, ב־`#quote`.** משבצת אחת, וכל פקד ענבר מצביע אליה. יש
 *      מנות וחבילות ⇒ `MenuConfigurator`; אין ⇒ `QuoteCta` עם ההזרעה.
 *   2. **וואטסאפ.** מתאר־קו בהירו, וירוק ממולא **פעם אחת** — ברצועה שמיד
 *      מתחת לבנאי, למי שגלל עד הטופס ובחר לא למלא אותו.
 *   3. **הטלפון.** מספר קריא בשורת טקסט, לעולם לא כפתור.
 *
 * ─────────────────────────────────────────────────────────────────────
 *  הרג׳יסטר: מארח, לא מנהלת רכש
 * ─────────────────────────────────────────────────────────────────────
 * ‏P-08 מדבר בלשון תהליך; כאן הקונה מארח בבית שלו אנשים שהוא אוהב, והוא
 * מודד אותנו בשאלה אחרת — האם אפשר לסמוך על זה. לכן אין בעמוד הזה רצועת
 * עובדות תפעולית, והסקשן הייחודי הוא מה שבאמת עוברים לפני אירוח בבית.
 *
 * ─────────────────────────────────────────────────────────────────────
 *  שלוש סטיות מנוסח המפרט, וכולן הסרות
 * ─────────────────────────────────────────────────────────────────────
 *  1. **«עם הצוות שלנו בשטח».** `plated_staffed` טוען מלצרים, ציוד הגשה
 *     וכלי פורצלן — שאלה פתוחה לבעלים (02 §3.4). אין בעמוד כולו מילה על
 *     צוות הגשה.
 *  2. **«אירוע פרטי במסעדה».** אירוח בתוך המסעדה הוא **מצג** על קיבולת,
 *     סגירת חלל, חניה ונגישות. `privateEventCapacityFor()` מחזיר `null`
 *     לשלושתן, ולכן הסקשן, הפורמט והצ׳יפ המקביל בבנאי אינם קיימים —
 *     ‏`offerAtRestaurant` נגזר מ־`anyPrivateEventCapacity()` ולא נכתב ידנית.
 *  3. **`בר מצווה` הוסר מה־H1.** ל־P-10 יש H1 כמעט זהה, והוא הדף שנבנה
 *     לקלאסטר ההוא. שתי כותרות שמתחרות על אותה שאילתה מפצלות את האות.
 *
 * ─────────────────────────────────────────────────────────────────────
 *  מה נשמט היום, וזו התנהגות תקינה (INV-2)
 * ─────────────────────────────────────────────────────────────────────
 *   ReviewsBlock · Gallery   `content/proof.ts` ריק ⇒ מחזירות null,
 *                            והסקשן שעוטף אותן אינו מרונדר כלל.
 *   ServiceFormats · MenuSheet · InclusionsExclusions · LimitsBlock ·
 *   TermsStrip · PastEvents · TastingBand
 *                            אין ולו שורה שנמסרה לאף אחד מהם.
 *
 * ‏§3.1: הספרות נקבעות בזמן רינדור **לפי מיקום**. `order` למטה הוא המקור
 * היחיד להן, וסקשן שנשמט אינו משאיר חור ברצף.
 */

import * as React from "react";
import { useLocation } from "wouter";
import { Head } from "@/components/seo/head";
import { Num, Prose, SectionHeader } from "@/components/primitives";
import {
  BranchStrip,
  FaqBand,
  KitchenNote,
  OccasionIntro,
  QuoteCta,
  type FaqItem,
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
import { CATERING_NAME, SLOTS, filled } from "@/content/business";
import {
  anyPrivateEventCapacity,
  cateringServiceCities,
  privateEventCapacityFor,
  restaurantsWithPrivateEvents,
} from "@/content/locations";
import { buildableOccasions, occasionById } from "@/content/occasions";
import { hasConfigurator, hasPackages } from "@/content/packages";
import { hasGallery, hasGoogleReviews, hasTestimonials } from "@/content/proof";
import { buildWaHref, captureWaIntent, newRef } from "@/lib/lead-client";
import { track } from "@/lib/analytics";
import {
  resolveExtraMeta,
  stripEmptyJsonLd,
  type PageMetaExtra,
} from "@/lib/page-meta-extra";
import {
  buildBreadcrumbList,
  buildFaqPage,
  buildService,
  buildWebPage,
} from "@/lib/seo";

/** הרשומה קיימת תמיד ב־`page-meta-extra`; היעדרה הוא באג ולא מצב. */
const META = resolveExtraMeta("/catering/private-events") as PageMetaExtra;

const SOURCE_PAGE = "/catering/private-events";

/** מודול העובדות הוא המקור לשם האירוע ולזריעה — לא מחרוזת שנכתבת כאן. */
const OCCASION = occasionById("private-events");

/* ═══════════════════ מסלול הוואטסאפ בהירו ═══════════════════ */

/**
 * חוזה 02 §6.1–§6.3: קליטה מקדימה ואז ניווט **באותו tick**, בלי `await`.
 * המזהה נוצר ברינדור, ולכן ה־`href` הסטטי נושא אותו גם בלי JS.
 *
 * ‏TODO(01 §5.7): מקומו של הקוד הזה ב־`lib/whatsapp.ts openWhatsApp()`.
 */
function useHeroWhatsApp(eventType: string | null) {
  const [ref] = React.useState(() => newRef());
  const answers = React.useMemo(() => (eventType ? { eventType } : {}), [eventType]);
  const href = React.useMemo(() => buildWaHref(answers, ref), [answers, ref]);

  const onClick = React.useCallback<
    React.MouseEventHandler<HTMLButtonElement & HTMLAnchorElement>
  >(
    (e) => {
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;

      track("whatsapp_click", { wa_location: "hero", has_lead: Boolean(eventType) });
      captureWaIntent({ ref, waLocation: "hero", ...(eventType ? { eventType } : {}) });
      track("whatsapp_handoff", { lead_ref: ref, wa_location: "hero" });

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
 * ‏04 §6: המגדיר **בונה** את האירוע במקום **לבקש** הצעה, ואינו מתפקד בלי
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
  offerAtRestaurant,
}: {
  num?: string;
  seed: Seed;
  title: React.ReactNode;
  lede: React.ReactNode;
  offerAtRestaurant: boolean;
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
        offerAtRestaurant={offerAtRestaurant}
        eyebrow="בונים את האירוע"
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
          eyebrow="בונים את האירוע"
          title={title}
          lede={lede}
          reveal={false}
        />
        <MenuConfigurator
          id="quote-builder"
          sourcePage={SOURCE_PAGE}
          offerAtRestaurant={offerAtRestaurant}
          showHeader={false}
          onSubmitted={(ref, answers) =>
            navigate(`/thanks?ref=${encodeURIComponent(ref)}`, { state: { ref, answers } })
          }
        />
      </div>
    </div>
  );
}

/* ═══════════════════ מה עוברים לפני אירוח בבית ═══════════════════ */

/**
 * הסקשן הייחודי של העמוד (מבחן T-1: החליפו «בבית» ב«במשרד» והוא נשבר).
 *
 * ארבע השורות הן **שאלות שנשאל**, לא שירותים שאנחנו מבטיחים. ההבחנה היא
 * כל ההבדל: «כמה שולחנות יש» נשארת נכונה כשכל המשבצות ריקות, «אנחנו
 * מביאים שולחנות» היא התחייבות שאיש לא מסר.
 */
const HOSTING = [
  {
    title: "כמה אנשים, ובאיזה בית",
    body: "סלון, גינה או מרפסת. המקום קובע איך האוכל מוגש לא פחות מהתפריט. מספר משוער מספיק.",
  },
  {
    title: "מתי האוכל על השולחן",
    body: "לא השעה שבה מגיעים האורחים, אלא השעה שבה מתחילים לאכול. משם בונים אחורה.",
  },
  {
    title: "מה יש לכם בבית",
    body: "תנור פנוי, מקום קר, שולחן להגשה. עוברים על זה מראש ולא ביום האירוע.",
  },
  {
    title: "מה חייב להיות על השולחן",
    body: "מנה שסבתא מצפה לה, ילד שאוכל רק פסטה, אורח שלא אוכל גלוטן. אלה הדברים שמרכיבים תפריט אמיתי.",
  },
] as const;

const HostingSection = ({ num }: { num?: string }) => (
  <section id="hosting" className="sec">
    <div className="wrap">
      <SectionHeader
        num={num}
        eyebrow="אירוח בבית"
        title="מה עוברים איתכם"
        lede="אירוע בבית אינו מסעדה קטנה יותר. הוא אירוע עם מטבח אחד, מקרר אחד ושולחן אחד — ואלה הדברים שמדברים עליהם לפני שמרכיבים תפריט."
      />

      <ol className="m-0 grid list-none gap-grid p-0 [grid-template-columns:repeat(auto-fit,minmax(230px,1fr))]">
        {HOSTING.map((row, i) => (
          <li
            key={row.title}
            className="m-0 rounded-card border border-solid border-[color:var(--rule)] p-card"
          >
            {/* הספרה בענבר — אחת מארבע הנקודות ש־04 §2 שם בהן את המבטא. */}
            <span className="sec__num num">{String(i + 1).padStart(2, "0")}</span>
            <h3 className="mt-3 text-lg font-semibold">{row.title}</h3>
            <p className="mt-2 max-w-none text-xs leading-[1.6] text-fg-muted">{row.body}</p>
          </li>
        ))}
      </ol>
    </div>
  </section>
);

/* ═══════════════════ אירוח אצלנו במסעדה — שער ═══════════════════ */

/**
 * ‏§4 P-09, שער `private_event_capacity`. הסקשן קיים **רק** אם נמסרה
 * קיבולת אירוע פרטי למסעדה כלשהי, והוא נוקב באותן מסעדות בשמן. אין
 * קיבולת ⇒ אין סקשן, ואין בעמוד שום דבר שמרמז על השכרת מקום.
 *
 * כל שורת קיבולת נגזמת לחוד — יושבים, עומדים, סגירה, חניה ונגישות —
 * ולעולם אין כאן תא ריק.
 */
const AtRestaurantSection = ({ num }: { num?: string }) => {
  const hosts = restaurantsWithPrivateEvents();
  if (hosts.length === 0) return null;

  return (
    <section id="at-restaurant" className="sec sec--alt">
      <div className="wrap">
        <SectionHeader
          num={num}
          eyebrow="אצלנו"
          title="אירוע פרטי במסעדה"
          lede="לא כל אירוע צריך להתקיים בבית. אלה המסעדות שמארחות אירועים פרטיים, ומה שידוע עליהן."
        />

        <ul className="m-0 grid list-none gap-grid p-0 [grid-template-columns:repeat(auto-fit,minmax(240px,1fr))]">
          {hosts.map((restaurant) => {
            const capacity = privateEventCapacityFor(restaurant.id);
            if (!capacity) return null;

            const lines: React.ReactNode[] = [];
            if (filled(capacity.seated)) {
              lines.push(
                <>
                  עד <Num inline>{capacity.seated}</Num> יושבים
                </>,
              );
            }
            if (filled(capacity.standing)) {
              lines.push(
                <>
                  עד <Num inline>{capacity.standing}</Num> עומדים
                </>,
              );
            }
            if (capacity.canClose === true) lines.push(<>אפשר לסגור את המקום לאירוע</>);
            if (filled(capacity.parkingHe)) lines.push(<>{capacity.parkingHe}</>);
            if (capacity.accessible === true) lines.push(<>המקום נגיש</>);

            return (
              <li
                key={restaurant.id}
                className="m-0 rounded-card border border-solid border-[color:var(--rule)] bg-bg p-card"
              >
                <h3 className="m-0 text-lg font-semibold">{restaurant.nameHe}</h3>
                {lines.length > 0 ? (
                  <ul className="m-0 mt-3 list-none p-0">
                    {lines.map((line, j) => (
                      <li key={j} className="mb-[.35rem] text-xs text-fg-muted">
                        {line}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
};

/* ═══════════════════ שאלות ותשובות ═══════════════════ */

type PageFaq = FaqItem & { answerHe: string | null };

/**
 * סט בצורת **אירוח**, ולא בצורת רכש — זה מה שמפריד אותו מהסט של P-08
 * (T-1). שאלה בלי תשובה אינה מרונדרת, ואותו סינון בדיוק מזין את
 * ה־`FAQPage`. כל תשובה היא משפט שלם שעומד בפני עצמו מחוץ להקשר.
 */
function faqItems(): PageFaq[] {
  const includes = filled(SLOTS.priceIncludes) ? SLOTS.priceIncludes : null;
  const cities = cateringServiceCities();

  return [
    {
      id: "faq-origin",
      questionHe: "האוכל מגיע מהמסעדה עצמה?",
      answerHe:
"כן. הוא מבושל במטבח של מסעדה פעילה — מטבח שמבשל לסועדים שיושבים בו, ולא מטבח שנפתח כדי לשרת אירועים.",
    },
    {
      id: "faq-how-to-order",
      questionHe: "איך מתחילים?",
      answerHe:
"בונים את התפריט כאן בעמוד ומשאירים פרטים, או כותבים לנו בוואטסאפ. חוזרים אליכם, עוברים על האירוע, ומרכיבים תפריט לפי מה שסיפרתם.",
    },
    {
      id: "faq-staffing",
      questionHe: "יש הגשה עם צוות?",
      /* ‏02 §3.4: `plated_staffed` טוען מלצרים, ציוד הגשה וכלי פורצלן —
         שאלה פתוחה לבעלים. התשובה תיכנס מ־`config/service-formats.ts`
         כשייווצר; עד אז אין שאלה ואין תשובה, ולא ניסוח מרוכך. */
      answerHe: null,
    },
    {
      id: "faq-includes",
      questionHe: "מה כלול בהזמנה?",
      answerHe: includes && includes.length > 0 ? includes.join(" · ") : null,
    },
    {
      id: "faq-tasting",
      questionHe: "אפשר לטעום לפני שסוגרים?",
      answerHe: filled(SLOTS.tastingPolicy) ? SLOTS.tastingPolicy : null,
    },
    {
      id: "faq-minimum",
      questionHe: "יש מינימום סועדים?",
      answerHe: filled(SLOTS.minGuests) ? `${SLOTS.minGuests} סועדים.` : null,
    },
    {
      id: "faq-area",
      questionHe: "לאן מגיעים?",
      answerHe: cities.length > 0 ? cities.join(" · ") : null,
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

export default function CateringPrivate() {
  const seedEventType = OCCASION.eventTypeSeed;
  const wa = useHeroWhatsApp(seedEventType);

  /* השער היחיד של «אירוח אצלנו»: נגזר ממודול העובדות, לא נכתב ידנית —
     כך הסקשן, הפורמט והצ׳יפ בבנאי נדלקים יחד ולא נפרדים זה מזה. */
  const offerAtRestaurant = anyPrivateEventCapacity();

  const faqs = faqItems();

  const showProof = hasGoogleReviews() || hasTestimonials();
  const showGallery = hasGallery();

  /* אותו שער בדיוק שהרשת משתמשת בו, מחושב כאן כדי שהעמוד יידע אם
     לרנדר את הרצועה בכלל. */
  const otherOccasions = React.useMemo(
    () => buildableOccasions().filter((o) => o.id !== OCCASION.id),
    [],
  );

  /* ‏§3.1 — מקור המספור היחיד. */
  const order = [
"quote",
"hosting",
    offerAtRestaurant ? "at-restaurant" : null,
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

  const cities = cateringServiceCities();

  return (
    <>
      <Head
        meta={META}
        jsonLd={[
          /* ‏`Service` לזיהוי ישות בלבד. `areaServed` נפלט רק מערים שנמסרו,
             ולעולם לא נגזר ממיקומי המסעדות. */
          stripEmptyJsonLd(buildWebPage(META)),
          stripEmptyJsonLd(
            buildService({
              path: SOURCE_PAGE,
              nameHe: `${CATERING_NAME} — ${OCCASION.nameHe}`,
              descriptionHe: META.descriptionHe,
              areaServedHe: cities.length > 0 ? [...cities] : null,
              audience: "consumer",
            }),
          ),
          buildBreadcrumbList(META.breadcrumb),
          buildFaqPage(faqs),
        ]}
      />

      <OccasionIntro
        eyebrow="קייטרינג מאמאמיה · שמחות פרטיות"
        title={
          <>
            אירוסין, יום הולדת, ערב משפחתי —
            <br />
            מהמטבח של המסעדה, אצלכם.
          </>
        }
        lede="אתם מארחים, אנחנו מבשלים. התפריט נסגר מראש, האוכל יוצא מהמטבח של המסעדה, ואתם נשארים עם האורחים ולא במטבח."
        facts={facts}
        primary={{ label: "לבנות את התפריט", href: "#quote" }}
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
            בלחיצה על וואטסאפ נשמרת אצלנו פנייה עם פרטי האירוע שמופיעים בהודעה.{" "}
            <a href="/privacy" className="underline underline-offset-[.22em]">
              מדיניות הפרטיות
            </a>
          </p>
        </Prose>
      </OccasionIntro>

      {/* ═══ 01 · משבצת ההמרה. הדבר השני שהקונה רואה. ═══ */}
      <BuilderSection
        num={num("quote")}
        seed={{ eventType: seedEventType }}
        offerAtRestaurant={offerAtRestaurant}
        title="התפריט לאירוע שלכם"
        lede="כמה אנשים, מתי, ואיפה. אין שדה תקציב. ההצעה חוזרת בכתב."
      />

      {/* המסלול השני. הפקד הירוק הממולא היחיד בעמוד.
          `showQuote={false}` — הבנאי נמצא ממש מעליו. */}
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

      <HostingSection num={num("hosting")} />

      <AtRestaurantSection num={num("at-restaurant")} />

      {/* ‏04 §5 — שכבת האמון. שתי הרצועות ריקות היום ולכן אינן קיימות:
          לא מסגרת אפורה, לא «בקרוב», ולא רשת עם תאים ריקים. */}
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
            <Gallery eyebrow="מהאירועים" title="איך זה נראה בפועל" columns={3} />
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
            eyebrow="לסגור את האירוע"
            title="נבנה לכם תפריט"
            lede="ספרו לנו כמה אנשים, מתי ואיפה, ונחזור עם תפריט והצעה בכתב."
          />
          <ContactBar
            waLocation="footer"
            callLocation="footer"
            primary="quote"
            quoteHref="#quote"
            answers={seedEventType ? { eventType: seedEventType } : undefined}
            labels={{ quote: "לבנות את התפריט", wa: "לכתוב לנו בוואטסאפ" }}
          />
        </div>
      </section>
    </>
  );
}
