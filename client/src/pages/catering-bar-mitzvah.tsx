/**
 * ═══════════════════════════════════════════════════════════════════════
 *  P-10 · `/catering/bar-mitzvah` — בר מצווה ובת מצווה.
 * ═══════════════════════════════════════════════════════════════════════
 *
 * spec 01 §4 P-10 (וכפועל יוצא P-09), §3.1, §3.3, spec 02 §3.9.
 * המערכת החזותית היא `docs/spec/04-visual-reference.md`, שגובר על 03 §2–§6.
 *
 * ─────────────────────────────────────────────────────────────────────
 *  הכשרות — כל הדף תלוי בה, וזה הסעיף שאסור לרכך
 * ─────────────────────────────────────────────────────────────────────
 * ‏§4 P-10 קובע: **הטקסט היחיד שמותר לו להופיע כטענת כשרות הוא הנוסח
 * שהבעלים כתב, כלשונו.** לא משפט מורכב, לא תבנית, ולא «נוסח בטוח» מוכן
 * להדבקה.
 *
 * המשמעות בקוד: השער היחיד הוא הנוסח **בכתב** —
 * ‎`hasKashrutWording({ requireWritten: true })` ו־`KashrutBadge
 * requireWritten` — שנשענים על `CATERING_KASHRUT_STATEMENT`
 * ‎(`content/locations.ts`), עם שם הגוף המכשיר המלא. הוא `null` היום,
 * ולכן **המילה «כשר» אינה מגיעה למסך בעמוד הזה בשום הטיה**: לא בהירו,
 * לא בשאלות ולא ב־JSON-LD. פריט השאלות שנוגע בה נגזם יחד עם התשובה שלו,
 * וזו בדיוק הסיבה שהוא נכתב כפריט שמותנה במשבצת ולא כפסקה.
 *
 * ‏`SLOTS.kashrutByBranch` **אינו** פותח את השער. שם יושבת תשובה כללית
 * שנמסרה בעל־פה («כשר בד״ץ»), ו־`business.ts` מתעד בה פער פתוח: «בד״ץ»
 * אינו גוף אחד, ולקוח שומר כשרות לא יזמין על סמך «בד״ץ» סתמי. בקלאסטר
 * הזה הכשרות **היא** ההחלטה, ולכן רק נוסח בכתב מדבר.
 *
 * ‏§4 P-10 ממשיך: כל עוד אין נוסח, `ברית` / `שבת חתן` / `חינה` מנוטרלים
 * כמילות שלילה בחשבון המודעות — החלטת קמפיין, לא קוד, ולכן היא מדווחת
 * ואינה מיושמת כאן.
 *
 * ─────────────────────────────────────────────────────────────────────
 *  היררכיית ההמרה — זהה בחמשת הדפים שבבעלותי
 * ─────────────────────────────────────────────────────────────────────
 *   1. **הבנאי, ב־`#quote`.** משבצת אחת, וכל פקד ענבר מצביע אליה.
 *   2. **וואטסאפ.** מתאר־קו בהירו, וירוק ממולא **פעם אחת** מתחת לבנאי.
 *   3. **הטלפון.** מספר קריא בשורת טקסט, לעולם לא כפתור.
 *
 * הבקרה שהעמוד נבנה סביבה: המחזור כאן הוא שלושה עד תשעה חודשים, והמבקר
 * לרוב **עוד לא קבע תאריך**. טופס שדורש תאריך מאבד בדיוק את הליד הזה.
 * הבנאי מחזיק את המוצא (`COPY.dateUnknown`), והלֶדֶה של משבצת ההמרה
 * אומרת את זה **לפני** שנתקלים בו — לא מוסיפה יכולת, מסירה חשש.
 *
 * ─────────────────────────────────────────────────────────────────────
 *  מה נשמט היום, וזו התנהגות תקינה (INV-2)
 * ─────────────────────────────────────────────────────────────────────
 *   ReviewsBlock · Gallery   `content/proof.ts` ריק ⇒ מחזירות null.
 *   ServiceFormats · MenuSheet · InclusionsExclusions · LimitsBlock ·
 *   TermsStrip · PastEvents · TastingBand
 *                            אין ולו שורה שנמסרה לאף אחד מהם.
 *   מחיר                     `מחיר מנה בר מצווה` הוא ראש הקלאסטר, ואין
 *                            באתר מספר — `pricePerPerson` ריק. אין
 *                            «החל מ־», אין טווח, ואין «בהתאם לתפריט»
 *                            כתחליף מרוכך.
 *
 * ‏§3.1: הספרות נקבעות בזמן רינדור **לפי מיקום**.
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
import { COPY, GUEST_BAND_DISPLAY, guestBandOptions } from "@/components/quote/quote-config";
import { CATERING_NAME, SLOTS, filled } from "@/content/business";
import { anyPrivateEventCapacity, cateringServiceCities } from "@/content/locations";
import { buildableOccasions, occasionById } from "@/content/occasions";
import { hasConfigurator, hasPackages } from "@/content/packages";
import { hasGallery, hasGoogleReviews, hasTestimonials } from "@/content/proof";
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
const META = resolveExtraMeta("/catering/bar-mitzvah") as PageMetaExtra;

const SOURCE_PAGE = "/catering/bar-mitzvah";

/** מודול העובדות הוא המקור לשם האירוע ולזריעה — לא מחרוזת שנכתבת כאן. */
const OCCASION = occasionById("bar-mitzvah");

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

/* ═══════════════════ טווחי הסועדים ═══════════════════ */

/**
 * ‏§4 P-10: «`GuestBands` explainer». הסקשן אינו מצהיר על קיבולת — הוא
 * מסביר **את אוצר המילים של הטופס**, שהוא מה שהמבקר כבר פגש למעלה.
 *
 * הטווחים מיובאים מ־`quote-config.ts` ואינם נכתבים כאן: שני מקומות שבהם
 * כתוב «בין 50 ל־100» הם שני מקומות שיכולים להיפרד. הם גם כתובים במחבר
 * עברי ולא בקו מפריד בין שני רצפי ספרות (L-14) — קו מפריד היה מתהפך.
 *
 * ומה שאין כאן: מינימום, מקסימום, ומה מתאים לאיזה טווח. `minGuests`
 * ו־`maxGuests` ריקים, ו«מתאים ל־» היה הופך רשימה לתפריט הצעות.
 */
const GuestBandsSection = ({ num }: { num?: string }) => (
  <section id="guests" className="sec">
    <div className="wrap">
      <SectionHeader
        num={num}
        eyebrow="כמה אנשים"
        title="בטווחים, לא במספר מדויק"
        lede="ברוב האירועים האלה הרשימה עוד זזה — מגיעים בני דודים, נופלים חברים מהכיתה. לכן הטופס שואל על טווח, והמספר המדויק לא נדרש עכשיו."
      />

      {/* גלולות 50px (04 §4). מסגרת ולא מילוי: אלה תוויות ולא פקדים. */}
      <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
        {guestBandOptions().map((band) => (
          <li
            key={band}
            className="m-0 rounded-pill border border-solid border-rule-control px-[.95rem] py-[.45rem] text-sm font-semibold text-fg-muted"
          >
            <Num>{GUEST_BAND_DISPLAY[band]}</Num> סועדים
          </li>
        ))}
      </ul>
    </div>
  </section>
);

/* ═══════════════════ התאריך ═══════════════════ */

/**
 * הנוסח של תיבת הסימון מיובא מ־`quote-config.ts` (`COPY.dateUnknown`)
 * ואינו משוכפל: אם הנוסח בטופס ישתנה, הפסקה הזאת תשתנה איתו ולא תבטיח
 * משהו שאינו שם.
 *
 * ואין כאן «כדאי להזמין X חודשים מראש» — `SLOTS.leadTime` ריק, וזו בדיוק
 * הצורה שבה עצה הופכת להתחייבות.
 */
const DateSection = ({ num }: { num?: string }) => (
  <section id="date" className="sec sec--alt sec--tight">
    <div className="wrap">
      <SectionHeader
        num={num}
        eyebrow="התאריך"
        title="גם אם עוד לא נקבע"
        lede="אירוע כזה נסגר חודשים מראש, ולפעמים התאריך הוא הדבר האחרון שמסתדר."
      />

      <Prose size="body" measure="body">
        <p>
          בטופס יש סימון «{COPY.dateUnknown}». מסמנים אותו, ממשיכים, ומדברים
          איתנו על התפריט לפני שהתאריך סגור.
        </p>
      </Prose>
    </div>
  </section>
);

/* ═══════════════════ שאלות ותשובות ═══════════════════ */

type PageFaq = FaqItem & { answerHe: string | null };

/**
 * הסט של הקלאסטר הזה — תאריך ארוך טווח וטווחי סועדים — ולא הסט של P-08
 * (רכש) או של P-09 (אירוח בבית). ‏T-1.
 *
 * הפריט הראשון הוא **כל הכשרות של העמוד**, והוא נכתב כך בכוונה: שאלה בלי
 * תשובה אינה מרונדרת (`FaqBand`), ואותו סינון בדיוק מזין את ה־`FAQPage` —
 * ולכן כל עוד `CATERING_KASHRUT_STATEMENT` הוא `null`, המילה «כשר» אינה
 * מגיעה למסך ואינה נפלטת לגרף. ביום שהנוסח יימסר הוא מופיע כאן **כלשונו**,
 * בלי משפט עוטף ובלי סייג שנוסף בקוד.
 */
function faqItems(): PageFaq[] {
  const cities = cateringServiceCities();

  return [
    {
      id: "faq-kashrut",
      questionHe: "האם הקייטרינג כשר?",
      answerHe: kashrutClauseHe("written"),
    },
    {
      id: "faq-date",
      questionHe: "התאריך עוד לא נקבע — אפשר בכל זאת לפנות?",
      answerHe: `כן. בטופס יש סימון «${COPY.dateUnknown}», וממשיכים ממנו כרגיל.`,
    },
    {
      id: "faq-guests",
      questionHe: "צריך לדעת בדיוק כמה אנשים יגיעו?",
      answerHe: "לא בשלב הזה. בוחרים טווח בטופס, ואת המספר המדויק סוגרים בשיחה.",
    },
    {
      id: "faq-who-cooks",
      questionHe: "מי מבשל את האוכל?",
      answerHe:
"המטבח של מסעדה פעילה — מטבח שמבשל לסועדים שיושבים בו, ולא מטבח שנפתח כדי לשרת אירועים.",
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

export default function CateringBarMitzvah() {
  const seedEventType = OCCASION.eventTypeSeed;
  const wa = useHeroWhatsApp(seedEventType);

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
"guests",
"date",
"kitchen",
"branches",
    faqs.some((f) => f.answerHe) ? "faq" : null,
  ].filter((k): k is string => k !== null);

  const num = (key: string) => {
    const i = order.indexOf(key);
    return i < 0 ? undefined : String(i + 1).padStart(2, "0");
  };

  /* גיזום ברמת הפסוקית (G5). **שער הנוסח בכתב** ולא הנוסח הכללי — ראו
     מקטע הכשרות בראש הקובץ. היום התג אינו קיים, ונשארת פסוקית אחת. */
  const facts: React.ReactNode[] = [
    hasKashrutWording({ requireWritten: true }) ? (
      <KashrutBadge key="kashrut" variant="pill" requireWritten />
    ) : null,
"מטבח של מסעדה פעילה",
  ].filter(Boolean);

  const cities = cateringServiceCities();

  return (
    <>
      <Head
        meta={META}
        jsonLd={[
          /* ‏`Service` לזיהוי ישות בלבד. `areaServed` נפלט רק מערים שנמסרו,
             ולעולם לא נגזר ממיקומי המסעדות. `FAQPage` נבנה מאותו סינון
             של הבאנד, ולכן אי אפשר לפלוט למנוע חיפוש תשובת כשרות שאינה
             על המסך. */
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
        eyebrow="קייטרינג מאמאמיה · בר מצווה ובת מצווה"
        title={
          <>
            בר מצווה ובת מצווה —
            <br />
            מהמטבח של המסעדה, אצלכם.
          </>
        }
        lede="אירוע שמתכננים חודשים מראש ובודקים מול כמה ספקים. האוכל יוצא מהמטבח של מסעדה פעילה, והתפריט נסגר איתכם מנה־מנה."
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

      {/* ═══ 01 · משבצת ההמרה. הלֶדֶה מסירה את החשש מהתאריך לפני שנתקלים בו. ═══ */}
      <BuilderSection
        num={num("quote")}
        seed={{ eventType: seedEventType }}
        /* השער נגזר ממודול העובדות ולא נכתב ידנית: אין קיבולת אירוע פרטי
           שנמסרה ⇒ הצ׳יפ «אירוח אצלנו במסעדה» אינו קיים. */
        offerAtRestaurant={anyPrivateEventCapacity()}
        title="התפריט לאירוע שלכם"
        lede={`בוחרים טווח סועדים ולא מספר מדויק, ואם התאריך עוד לא נקבע יש סימון «${COPY.dateUnknown}».`}
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

      <GuestBandsSection num={num("guests")} />

      <DateSection num={num("date")} />

      {/* ‏04 §5 — שכבת האמון. ריקה היום ולכן אינה קיימת: לא מסגרת אפורה,
          לא «בקרוב», ולא רשת עם תאים ריקים. */}
      {showProof ? (
        <section id="reviews" className="sec">
          <div className="wrap">
            <ReviewsBlock eyebrow="מה אומרים" title="ביקורות בגוגל" headingAs="h2" />
          </div>
        </section>
      ) : null}

      {showGallery ? (
        <section id="gallery" className="sec sec--alt">
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
            lede="ספרו לנו כמה אנשים ומתי, ונחזור עם תפריט והצעה בכתב."
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
