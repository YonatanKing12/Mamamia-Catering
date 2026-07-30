/**
 * ═══════════════════════════════════════════════════════════════════════
 *  P-10 · `/catering/bar-mitzvah` — בר מצווה ובת מצווה.
 * ═══════════════════════════════════════════════════════════════════════
 *
 * spec 01 §4 P-10 (וכפועל יוצא P-09), §3.1, §3.3, spec 02 §3.9.
 * ‏`00-spec-review.md` גובר על המפרט בכל מקום שבו הם חלוקים.
 *
 * ─────────────────────────────────────────────────────────────────────
 *  הכשרות — כל הדף תלוי בה, וזה הסעיף שאסור לרכך
 * ─────────────────────────────────────────────────────────────────────
 * ‏§4 P-10 קובע: **הטקסט היחיד שמותר לו להופיע כטענת כשרות הוא הנוסח
 * שהבעלים כתב, כלשונו.** לא משפט מורכב, לא תבנית, ולא «נוסח בטוח»
 * מוכן להדבקה — הפאס הראשון שילח אחד כזה, והוא נמחק.
 *
 * המשמעות בקוד: `kashrutClauseHe("written")` הוא השער היחיד, והוא נשען
 * על `CATERING_KASHRUT_STATEMENT` (`content/locations.ts`) — הנוסח בכתב
 * עם שם הגוף המכשיר המלא. הוא `null` היום, ולכן **המילה «כשר» אינה
 * מרונדרת בעמוד הזה בשום הטיה**: לא בהירו, לא בשאלות ולא ב־JSON-LD.
 * פריט השאלות שנוגע בה נגזם יחד עם התשובה שלו (`FaqBand`), וזו בדיוק
 * הסיבה שהוא נכתב כפריט שמותנה במשבצת ולא כפסקה.
 *
 * ‏`SLOTS.kashrutByBranch` **אינו** פותח את השער. שם יושבת תשובה כללית
 * שנמסרה בעל־פה («כשר בד״ץ»), ו־`business.ts` מתעד בה פער פתוח: «בד״ץ»
 * אינו גוף אחד, ולקוח שומר כשרות לא יזמין על סמך «בד״ץ» סתמי. בקלאסטר
 * הזה הכשרות **היא** ההחלטה, ולכן רק נוסח בכתב מדבר. השוו ל־P-08 ול־P-09,
 * שבהם אותה פסוקית כן מוצגת במפלס `"general"` כהקשר מותג.
 *
 * ‏§4 P-10 ממשיך: כל עוד אין נוסח, `ברית` / `שבת חתן` / `חינה` מנוטרלים
 * כמילות שלילה בחשבון המודעות — החלטת קמפיין, לא קוד, ולכן היא מדווחת
 * ואינה מיושמת כאן.
 *
 * ─────────────────────────────────────────────────────────────────────
 *  הבקרה החשובה בעמוד: תאריך שעוד לא נקבע
 * ─────────────────────────────────────────────────────────────────────
 * ‏§4 P-10: המחזור כאן הוא שלושה עד תשעה חודשים, והמבקר לרוב **עוד לא
 * קבע תאריך**. טופס שדורש תאריך מאבד בדיוק את הליד הזה. הבנאי כבר מחזיק
 * את המוצא (`COPY.dateUnknown`), והסקשן `#date` מספר עליו לפני שנתקלים בו
 * — הוא לא מוסיף יכולת, הוא מסיר חשש.
 *
 * ─────────────────────────────────────────────────────────────────────
 *  מה נשמט היום, וזו התנהגות תקינה (INV-2)
 * ─────────────────────────────────────────────────────────────────────
 *   ServiceFormats         ‏§4 P-10 מחזיר אותו למקום 02. `offered === true`
 *                          הוא אישור בעלים, ו־`config/service-formats.ts`
 *                          טרם קיים ⇒ אף פורמט אינו מאושר, והעמוד אינו
 *                          אומר «משלוח», «בופה» או «מלצרים» בשום מקום.
 *   MenuSheet              ‏`menus.ts` / `dishes.ts` ריקים ⇒ 0 מנות (§3.3).
 *   InclusionsExclusions · LimitsBlock · TermsStrip · PastEvents · TastingBand
 *                          אין ולו שורה שנמסרה לאף אחד מהם.
 *   מחיר                   `מחיר מנה בר מצווה` הוא ראש הקלאסטר, ואין באתר
 *                          מספר — `pricePerPerson` ריק. אין «החל מ־», אין
 *                          טווח, ואין «בהתאם לתפריט» כתחליף מרוכך.
 *
 * ─────────────────────────────────────────────────────────────────────
 *  מספור
 * ─────────────────────────────────────────────────────────────────────
 * ‏§3.1: הספרות נקבעות בזמן רינדור **לפי מיקום**. `order` למטה הוא המקור
 * היחיד להן, וסקשן שנשמט אינו משאיר חור ברצף.
 */

import * as React from "react";
import { Head } from "@/components/seo/head";
import { Num, Prose, SectionHeader } from "@/components/primitives";
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
import { COPY, GUEST_BAND_DISPLAY, guestBandOptions } from "@/components/quote/quote-config";
import { CATERING_NAME, SLOTS, filled } from "@/content/business";
import { anyPrivateEventCapacity, cateringServiceCities } from "@/content/locations";
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

/* ═══════════════════ 01 · טווחי הסועדים ═══════════════════ */

/**
 * ‏§4 P-10: «`GuestBands` explainer» במקום 01. הסקשן הזה אינו מצהיר על
 * קיבולת — הוא מסביר **את אוצר המילים של הטופס**, שהוא הדבר שהמבקר עומד
 * לפגוש שני מסכים משם.
 *
 * הטווחים מיובאים מ־`quote-config.ts` ואינם נכתבים כאן: שני מקומות שבהם
 * כתוב «בין 50 ל־100» הם שני מקומות שיכולים להיפרד. הם גם כבר כתובים
 * במחבר עברי ולא בקו מפריד בין שני רצפי ספרות (L-14) — קו מפריד היה
 * מתהפך ומציג `100–50`.
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

      <ul className="m-0 list-none border-t border-solid border-t-[color:var(--rule)] p-0">
        {guestBandOptions().map((band) => (
          <li
            key={band}
            className="m-0 border-b border-dotted border-b-[color:var(--rule)] py-[.7rem]"
          >
            <span className="font-serif text-lg font-medium leading-dish">
              <Num>{GUEST_BAND_DISPLAY[band]}</Num> סועדים
            </span>
          </li>
        ))}
      </ul>
    </div>
  </section>
);

/* ═══════════════════ 02 · התאריך ═══════════════════ */

/**
 * הבקרה שהעמוד הזה נבנה סביבה. הנוסח של תיבת הסימון מיובא מ־
 * ‏`quote-config.ts` (`COPY.dateUnknown`) ולא משוכפל: אם הנוסח בטופס
 * ישתנה, הפסקה הזאת תשתנה איתו, ולא תבטיח משהו שאינו שם.
 *
 * ואין כאן: «כדאי להזמין X חודשים מראש» — `SLOTS.leadTime` ריק, וזו
 * בדיוק הצורה שבה עצה הופכת להתחייבות.
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
 * הפריט הראשון הוא **כל הכשרות של העמוד**, והוא נכתב ככה בכוונה: שאלה
 * בלי תשובה אינה מרונדרת (`FaqBand`), ואותו סינון בדיוק מזין את
 * ה־`FAQPage` — ולכן כל עוד `CATERING_KASHRUT_STATEMENT` הוא `null`,
 * המילה «כשר» אינה מגיעה למסך ואינה נפלטת לגרף. ביום שהנוסח יימסר הוא
 * מופיע כאן **כלשונו**, בלי משפט עוטף ובלי סייג שנוסף בקוד.
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
      answerHe: "לא בשלב הזה. בוחרים טווח בטופס, ואת המספר סוגרים בשיחה.",
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
    href: "/catering/private-events",
    titleHe: "שמחות פרטיות",
    descriptionHe: "אירוסין, יום הולדת, ערב משפחתי.",
  },
  {
    href: "/catering/holidays",
    titleHe: "ארוחת חג",
    descriptionHe: "שולחן חג לבית שמארח.",
  },
  {
    href: "/catering/business",
    titleHe: "קייטרינג לחברות",
    descriptionHe: "ארוחת צוות, ישיבה או כנס.",
  },
  { href: "/catering", titleHe: "כל סוגי האירועים", descriptionHe: "המפרק המלא." },
];

/* ═══════════════════ העמוד ═══════════════════ */

export default function CateringBarMitzvah() {
  const seedEventType = OCCASION.eventTypeSeed;
  const wa = useHeroWhatsApp(seedEventType);

  const faqs = faqItems();

  /* ‏§3.1 — מקור המספור היחיד. */
  const order = [
    "guests",
    "date",
    "kitchen",
    "branches",
    "quote",
    faqs.some((f) => f.answerHe) ? "faq" : null,
  ].filter((k): k is string => k !== null);

  const num = (key: string) => {
    const i = order.indexOf(key);
    return i < 0 ? undefined : String(i + 1).padStart(2, "0");
  };

  /* גיזום ברמת הפסוקית (G5). **מפלס `written` ולא `general`** — ראו
     מקטע הכשרות בראש הקובץ. היום הפסוקית השנייה ריקה, ונשארת אחת. */
  const facts = ["מטבח של מסעדה איטלקית פעילה", kashrutClauseHe("written")].filter(
    (c): c is string => Boolean(c),
  );

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
        eyebrow="קייטרינג · בר מצווה ובת מצווה"
        title={
          <>
            בר מצווה ובת מצווה —
            <br />
            מהמטבח של המסעדה,
            <br />
            אצלכם.
          </>
        }
        lede="אירוע שמתכננים חודשים מראש, ובודקים מול כמה ספקים. אצלנו האוכל יוצא מהמטבח של מסעדה איטלקית פעילה, והתפריט נסגר איתכם מנה־מנה."
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

      <GuestBandsSection num={num("guests")} />

      <DateSection num={num("date")} />

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
        /* השער נגזר ממודול העובדות ולא נכתב ידנית: אין קיבולת אירוע פרטי
           שנמסרה ⇒ הצ׳יפ «אירוח אצלנו במסעדה» אינו קיים. */
        offerAtRestaurant={anyPrivateEventCapacity()}
        title="התפריט לאירוע שלכם"
        lede="ארבע שאלות על האירוע, ואז פרטים ליצירת קשר. אם התאריך עוד לא נקבע — יש סימון לזה."
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
