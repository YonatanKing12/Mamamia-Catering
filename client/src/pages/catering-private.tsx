/**
 * ═══════════════════════════════════════════════════════════════════════
 *  P-09 · `/catering/private-events` — שמחות פרטיות ואירוח בבית.
 * ═══════════════════════════════════════════════════════════════════════
 *
 * spec 01 §4 P-09, §3.1, §3.3, spec 02 §3.4, §3.9, spec 03 §7.8.
 * ‏`00-spec-review.md` גובר על המפרט בכל מקום שבו הם חלוקים.
 *
 * ─────────────────────────────────────────────────────────────────────
 *  הרג׳יסטר: מארח, לא מנהלת רכש
 * ─────────────────────────────────────────────────────────────────────
 * ‏P-08 מדבר בלשון תהליך; כאן הקונה מארח אנשים שהוא אוהב בבית שלו, והוא
 * מודד אותנו בשאלה אחרת לגמרי — האם אפשר לסמוך על זה. לכן אין בעמוד הזה
 * רצועת עובדות תפעולית מעל הקיפול, והסקשן הראשון הוא מה שבאמת עוברים
 * יחד לפני אירוח בבית.
 *
 * ─────────────────────────────────────────────────────────────────────
 *  שלוש סטיות מנוסח המפרט
 * ─────────────────────────────────────────────────────────────────────
 *  1. **«עם הצוות שלנו בשטח».** ‏00-spec-review §A1 מוחק את הפסוקית משתי
 *     כותרות H1: `plated_staffed` טוען שיש מלצרים, ציוד הגשה וכלי פורצלן,
 *     וזו שאלה פתוחה לבעלים (02 §3.4). ה־H1 כאן הוא הנוסח המתוקן —
 *     ‏`— מהמטבח של המסעדה, אצלכם.` — ואין בעמוד כולו מילה על צוות הגשה.
 *
 *  2. **«אירוע פרטי במסעדה».** אירוח בתוך המסעדה הוא **מצג** שהמסעדות
 *     מארחות אירועים פרטיים — קיבולת ישיבה, אפשרות סגירת החלל, חניה
 *     ונגישות. ‏`privateEventCapacityFor()` מחזיר `null` לשלושתן, ולכן
 *     הסקשן, הפורמט והצ׳יפ המקביל בבנאי **אינם קיימים** (`offerAtRestaurant`
 *     נגזר מ־`anyPrivateEventCapacity()` ולא נכתב ידנית). שום דבר בעמוד
 *     אינו רומז על השכרת מקום. הכותרת ב־`page-meta-extra.ts` כבר תוקנה
 *     מאותה סיבה.
 *
 *  3. **`בר מצווה` הוסר מה־H1.** ‏§4 P-09 פותח בו, אבל ל־P-10 יש H1 כמעט
 *     זהה (`בר מצווה ובת מצווה — מהמטבח של המסעדה, אצלכם.`) והוא הדף
 *     שנבנה לקלאסטר הזה. שתי כותרות שמתחרות על אותה שאילתה מפצלות את
 *     האות ומכריחות את גוגל לבחור; הקישור לדף ההוא יושב ב־`NextSteps`.
 *
 * ─────────────────────────────────────────────────────────────────────
 *  מה נשמט היום, וזו התנהגות תקינה (INV-2)
 * ─────────────────────────────────────────────────────────────────────
 *   ServiceFormats         ‏§4 P-09 מקדם אותו למקום 01 — «הפורמט הוא
 *                          ההחלטה כאן». אבל `offered === true` הוא אישור
 *                          בעלים, ו־`config/service-formats.ts` טרם קיים:
 *                          אף פורמט אינו מאושר, ולכן הבאנד היה מרנדר
 *                          כותרת מעל כלום. הוא אינו משובץ, והעמוד אינו
 *                          אומר «משלוח», «בופה» או «מלצרים» בשום מקום.
 *   MenuSheet              ‏`menus.ts` / `dishes.ts` ריקים ⇒ 0 מנות (§3.3).
 *   InclusionsExclusions · LimitsBlock · TermsStrip · PastEvents · TastingBand
 *                          אין ולו שורה שנמסרה לאף אחד מהם.
 *
 * ─────────────────────────────────────────────────────────────────────
 *  מספור
 * ─────────────────────────────────────────────────────────────────────
 * ‏§3.1: הספרות נקבעות בזמן רינדור **לפי מיקום**. `order` למטה הוא המקור
 * היחיד להן, וסקשן שנשמט אינו משאיר חור ברצף — חור כזה הוא האות הרועשת
 * ביותר ל«תבנית עם חלקים חסרים».
 */

import * as React from "react";
import { Head } from "@/components/seo/head";
import { Num, Prose, Rule, SectionHeader } from "@/components/primitives";
import {
  BranchStrip,
  FaqBand,
  KitchenNote,
  NextSteps,
  OccasionIntro,
  QuoteCta,
  WhatsAppBand,
  type FaqItem,
  type NextStepLink,
} from "@/components/bands";
import { CATERING_NAME, SLOTS, filled } from "@/content/business";
import {
  anyPrivateEventCapacity,
  cateringServiceCities,
  privateEventCapacityFor,
  restaurantsWithPrivateEvents,
} from "@/content/locations";
import { occasionById } from "@/content/occasions";
import { buildWaHref, captureWaIntent, newRef } from "@/lib/lead-client";
import { track } from "@/lib/analytics";
import {
  kashrutClauseHe,
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

/* ═══════════════════ 01 · מה עוברים לפני אירוח בבית ═══════════════════ */

/**
 * הסקשן הייחודי של העמוד (מבחן T-1: החליפו «בבית» ב«במשרד» והוא נשבר).
 *
 * ארבע השורות הן **שאלות שנשאל**, לא שירותים שאנחנו מבטיחים. ההבחנה היא
 * כל ההבדל: «כמה שולחנות יש» היא שאלה שנשארת נכונה כשכל המשבצות ריקות,
 * ואילו «אנחנו מביאים שולחנות» היא התחייבות שאיש לא מסר.
 */
const HOSTING = [
  {
    title: "כמה אנשים, ובאיזה בית",
    body: "סלון, גינה או מרפסת — המקום קובע איך האוכל מוגש לא פחות מהתפריט עצמו. מספר משוער מספיק בשלב הזה.",
  },
  {
    title: "מתי האוכל צריך להיות על השולחן",
    body: "לא השעה שבה מגיעים האורחים, אלא השעה שבה אתם רוצים שיתחילו לאכול. משם בונים אחורה.",
  },
  {
    title: "מה יש לכם בבית",
    body: "תנור פנוי, מקום קר, שולחן להגשה. עוברים על זה מראש כדי שביום האירוע לא תגלו את זה תוך כדי.",
  },
  {
    title: "מה חייב להיות על השולחן",
    body: "מנה שסבתא מצפה לה, ילד שאוכל רק פסטה, אורח שלא אוכל גלוטן. אלה הדברים שמרכיבים תפריט אמיתי, ולכן שואלים עליהם בהתחלה.",
  },
] as const;

const HostingSection = ({ num }: { num?: string }) => (
  <section id="hosting" className="sec">
    <div className="wrap">
      <SectionHeader
        num={num}
        eyebrow="אירוח בבית"
        title="מה עוברים איתכם"
        lede="אירוע בבית אינו מסעדה קטנה יותר — הוא אירוע עם מטבח אחד, מקרר אחד ושולחן אחד. אלה הדברים שמדברים עליהם לפני שמרכיבים תפריט."
      />

      <ul className="m-0 list-none p-0">
        {HOSTING.map((row, i) => (
          <li key={row.title} className="m-0">
            {i > 0 ? <Rule /> : null}
            <div className="max-w-body py-[1.7rem] pe-6">
              <h3 className="m-0 font-serif text-lg font-bold">{row.title}</h3>
              <p className="mt-2 text-xs leading-[1.6] text-fg-muted">{row.body}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  </section>
);

/* ═══════════════════ אירוח אצלנו במסעדה — שער ═══════════════════ */

/**
 * ‏§4 P-09, שער `private_event_capacity`. הסקשן קיים **רק** אם נמסרה
 * קיבולת אירוע פרטי למסעדה כלשהי, והוא נוקב באותן מסעדות בשמן — לא
 * מדבר בכללי ולא רומז. אין קיבולת ⇒ אין סקשן, ואין בעמוד שום דבר
 * שמרמז על השכרת מקום.
 *
 * כל שורת קיבולת נגזמת לחוד: מספר יושבים, מספר עומדים, אפשרות סגירה
 * וחניה — כל אחד נעלם לבד, ולעולם אין כאן תא ריק.
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

        <ul className="m-0 list-none p-0">
          {hosts.map((restaurant, i) => {
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
              <li key={restaurant.id} className="m-0">
                {i > 0 ? <Rule /> : null}
                <div className="py-[1.6rem]">
                  <h3 className="m-0 font-serif text-2xl font-medium">{restaurant.nameHe}</h3>
                  {lines.length > 0 ? (
                    <ul className="m-0 mt-3 list-none p-0">
                      {lines.map((line, j) => (
                        <li key={j} className="mb-[.35rem] text-xs text-fg-muted">
                          {line}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
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
 * ה־`FAQPage`.
 */
function faqItems(): PageFaq[] {
  const includes = filled(SLOTS.priceIncludes) ? SLOTS.priceIncludes : null;
  const cities = cateringServiceCities();

  return [
    {
      id: "faq-origin",
      questionHe: "האוכל מגיע מהמסעדה עצמה?",
      answerHe:
        "כן. הוא מבושל במטבח של מסעדה איטלקית פעילה — מטבח שמבשל לסועדים שיושבים בו, ולא מטבח שנפתח כדי לשרת אירועים.",
    },
    {
      id: "faq-how-to-order",
      questionHe: "איך מתחילים?",
      answerHe:
        "ממלאים את הטופס בעמוד או כותבים לנו בוואטסאפ. חוזרים אליכם, עוברים על האירוע, ומרכיבים תפריט לפי מה שסיפרתם.",
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

/* ═══════════════════ להמשיך מכאן ═══════════════════ */

const NEXT: NextStepLink[] = [
  {
    href: "/catering/bar-mitzvah",
    titleHe: "בר מצווה ובת מצווה",
    descriptionHe: "אירוע שמתוכנן חודשים מראש.",
  },
  {
    href: "/catering/holidays",
    titleHe: "ארוחת חג",
    descriptionHe: "שולחן חג לבית שמארח.",
  },
  {
    href: "/catering/dairy",
    titleHe: "תפריט חלבי",
    descriptionHe: "חיתוך חלבי של אותו מטבח.",
  },
  { href: "/catering", titleHe: "כל סוגי האירועים", descriptionHe: "המפרק המלא." },
];

/* ═══════════════════ העמוד ═══════════════════ */

export default function CateringPrivate() {
  const seedEventType = OCCASION.eventTypeSeed;
  const wa = useHeroWhatsApp(seedEventType);

  /* השער היחיד של «אירוח אצלנו»: נגזר ממודול העובדות, לא נכתב ידנית —
     כך הסקשן, הפורמט והצ׳יפ בבנאי נדלקים יחד ולא נפרדים זה מזה. */
  const offerAtRestaurant = anyPrivateEventCapacity();

  const faqs = faqItems();

  /* ‏§3.1 — מקור המספור היחיד. */
  const order = [
    "hosting",
    offerAtRestaurant ? "at-restaurant" : null,
    "kitchen",
    "branches",
    "quote",
    faqs.some((f) => f.answerHe) ? "faq" : null,
  ].filter((k): k is string => k !== null);

  const num = (key: string) => {
    const i = order.indexOf(key);
    return i < 0 ? undefined : String(i + 1).padStart(2, "0");
  };

  /* גיזום ברמת הפסוקית (G5). הכשרות נקראת מהמשבצת ולא נכתבת קשיח. */
  const facts = ["מטבח של מסעדה איטלקית פעילה", kashrutClauseHe("general")].filter(
    (c): c is string => Boolean(c),
  );

  const cities = cateringServiceCities();

  return (
    <>
      <Head
        meta={META}
        jsonLd={[
          /* ‏`Service` לזיהוי ישות בלבד — אין לו תוצאה עשירה מקבילה בגוגל.
             ‏`areaServed` נפלט רק מערים שנמסרו, ולעולם לא נגזר ממיקומי
             המסעדות. */
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
        eyebrow="קייטרינג · שמחות פרטיות"
        title={
          <>
            אירוסין, יום הולדת, ערב משפחתי —
            <br />
            מהמטבח של המסעדה,
            <br />
            אצלכם.
          </>
        }
        lede="אתם מארחים, אנחנו מבשלים. התפריט נסגר מראש, האוכל יוצא מהמטבח של המסעדה, ואתם נשארים עם האורחים ולא במטבח."
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
        {/* INV-6: קליק על וואטסאפ כותב שורת ליד, ולכן הודעת סעיף 11 צמודה
            לפקד. אין להסיר אותה כדי «לנקות» את ההירו. */}
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

      <HostingSection num={num("hosting")} />

      <AtRestaurantSection num={num("at-restaurant")} />

      <KitchenNote num={num("kitchen")} />

      {/* המסעדות כהקשר מותג בלבד — ולא כטענה על אזור שירות. */}
      <BranchStrip
        num={num("branches")}
        sourcePage={SOURCE_PAGE}
        eyebrow="ההקשר"
        title="המסעדות שמאחורי הקייטרינג"
        lede="מסעדות איטלקיות שפועלות לקהל הרחב. הקייטרינג הוא עיסוק נפרד שעובד לפי הזמנה, והוא מבושל במטבח של אחת מהן."
        flagshipLabelHe={null}
      />

      <QuoteCta
        num={num("quote")}
        sourcePage={SOURCE_PAGE}
        seed={{ eventType: seedEventType }}
        offerAtRestaurant={offerAtRestaurant}
        title="התפריט לאירוע שלכם"
        lede="ארבע שאלות על האירוע, ואז פרטים ליצירת קשר. אין שדה תקציב."
      />

      <WhatsAppBand
        waLocation="quote_alt"
        answers={seedEventType ? { eventType: seedEventType } : undefined}
        title="מעדיפים לכתוב?"
        lede="אפשר לשלוח את פרטי האירוע בהודעה, ולהמשיך משם."
        labelHe="עדיף לי בוואטסאפ"
        callLocation="quote_alt"
      />

      <FaqBand
        num={num("faq")}
        items={faqs}
        title="שאלות שנשאלות בטלפון"
        lede="ומה שאין עליו תשובה כאן — שאלו אותנו ישירות."
      />

      <NextSteps sourcePage={SOURCE_PAGE} links={NEXT} />
    </>
  );
}
