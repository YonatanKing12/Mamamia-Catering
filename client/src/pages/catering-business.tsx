/**
 * ═══════════════════════════════════════════════════════════════════════
 *  P-08 · `/catering/business` — קייטרינג לחברות. **רג׳יסטר תפעולי.**
 * ═══════════════════════════════════════════════════════════════════════
 *
 * spec 01 §4 P-08, §3.1 (G12 — סדר הפוך), §3.3, spec 02 §3.9, spec 03 §7.12.
 * ‏`00-spec-review.md` גובר על המפרט בכל מקום שבו הם חלוקים.
 *
 * ─────────────────────────────────────────────────────────────────────
 *  הרג׳יסטר: מנהלת משרד, לא מארחת
 * ─────────────────────────────────────────────────────────────────────
 * הקונה כאן שואלת ארבע שאלות לפני כל דבר אחר — מתי, כמה, לאן, ואיך זה
 * עובר אישור — ואינה מחפשת חוויה. לכן העמוד פותח בשורת עובדות תפעולית
 * ‎(`OpsFacts variant="strip"`, G12) לפני כל טקסט מוכר, והקופי כתוב
 * בלשון תהליך ולא בלשון שיווק.
 *
 * ─────────────────────────────────────────────────────────────────────
 *  שלוש סטיות מכוונות מנוסח המפרט, וכולן הסרות
 * ─────────────────────────────────────────────────────────────────────
 *  1. **הכותרת והעיר.** ‎§4 P-08 מצטט `ארוחת צוות מהמטבח של המסעדה,
 *     בהרצליה פיתוח.` — ‏`SLOTS.cateringKitchenBranch` הוא `null`, ולכן
 *     עיר בכותרת של דף קייטרינג היא טענה על מוצא האוכל שאיש לא מסר.
 *     ‏`lib/page-meta-extra.ts` כבר הסיר אותה מה־title; ה־H1 כאן מוסר
 *     אותה מאותה סיבה בדיוק.
 *
 *  2. **«ארוחת צוות שמגיעה בשעה שאמרנו».** ‏00-spec-review §29 פוסל את
 *     הווריאנט הזה: חלון משלוח הוא משבצת ריקה, והבטחת שעה ב־H1 היא
 *     התחייבות תפעולית. הוא אינו נכתב כאן בשום ניסוח.
 *
 *  3. **חשבונית, ח.פ. ותנאי רכש כטקסט.** ‏`SLOTS.companyId` ו־
 *     ‏`SLOTS.paymentTerms` ריקים (`content/occasions.ts`: «אין להבטיח
 *     בדף»). שתי השורות קיימות ב־`OpsFacts` וקשורות למשבצות שלהן, ולכן
 *     הן נדלקות מאליהן ברגע שיימסרו — ועד אז אין בדף אף מילה על חשבונית.
 *     מה שכן נאמר הוא מה שידוע: השם המשפטי.
 *
 * ─────────────────────────────────────────────────────────────────────
 *  מה נשמט היום, וזו התנהגות תקינה (INV-2)
 * ─────────────────────────────────────────────────────────────────────
 *   MenuSheet              ‏`content/menus.ts` ו־`content/dishes.ts` ריקים
 *                          ⇒ 0 מנות זמינות לקייטרינג. ‏§3.3 שורת "0":
 *                          הדף נשאר ברג׳יסטר התפעולי, וגיליון התפריט
 *                          אינו מרונדר.
 *   ServiceFormats         ‏`offered === true` הוא אישור בעלים, ו־
 *                          ‏`config/service-formats.ts` טרם קיים. אף
 *                          פורמט הגשה אינו מאושר, ולכן הדף אינו אומר
 *                          «משלוח», «בופה» או «מלצרים» בשום מקום.
 *   InclusionsExclusions   ‏`priceIncludes` / `priceExcludes` ריקים.
 *   LimitsBlock · TermsStrip · PastEvents · TastingBand
 *                          אין שורה שנמסרה לאף אחד מהם.
 *
 * ─────────────────────────────────────────────────────────────────────
 *  ‏`#gibush` — עוגן בעמוד, לא קישור לעמוד
 * ─────────────────────────────────────────────────────────────────────
 * ‏00-spec-review §E8 מבקש להכריע: `/catering/fun-day` חסום על
 * ‏`SLOTS.liveStations` (`content/occasions.ts`, שער קשיח), ולכן `#gibush`
 * הוא **סקשן בתוך העמוד הזה** ולא קישור החוצה — קישור החוצה היה 404.
 * ‏`useHashScroll` ב־`App.tsx` מטפל בדיוק בצורה הזאת. ואין באותו סקשן
 * שם תחנה, שם עמדה או כל טענה על בישול במקום.
 *
 * ─────────────────────────────────────────────────────────────────────
 *  מספור
 * ─────────────────────────────────────────────────────────────────────
 * ‏§3.1: הספרות נקבעות בזמן רינדור **לפי מיקום**. `order` למטה הוא המקור
 * היחיד להן, וסקשן שנשמט אינו משאיר חור ברצף.
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
  OpsFacts,
  QuoteCta,
  WhatsAppBand,
  type FaqItem,
  type NextStepLink,
  type OpsFactRow,
} from "@/components/bands";
import { CATERING_NAME, SLOTS, filled } from "@/content/business";
import { cateringServiceCities } from "@/content/locations";
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
const META = resolveExtraMeta("/catering/business") as PageMetaExtra;

const SOURCE_PAGE = "/catering/business";

/** מודול העובדות הוא המקור לשם האירוע ולזריעה — לא מחרוזת שנכתבת כאן. */
const OCCASION = occasionById("business");

/* ═══════════════════ מסלול הוואטסאפ בהירו ═══════════════════ */

/**
 * חוזה 02 §6.1–§6.3: קליטה מקדימה ואז ניווט **באותו tick**, בלי `await`
 * ובלי בדיקת תשובה. המזהה נוצר ברינדור, ולכן ה־`href` הסטטי נושא אותו
 * גם בלי JS, גם בלשונית חדשה וגם כשמעתיקים את הכתובת.
 *
 * ‏TODO(01 §5.7): עותק רביעי של אותו קוד (`WhatsAppBand`, `pages/home.tsx`,
 * ‏`pages/catering.tsx`). מקומו ב־`lib/whatsapp.ts openWhatsApp()` — מדווח.
 */
function useHeroWhatsApp(eventType: string | null) {
  const [ref] = React.useState(() => newRef());
  const answers = React.useMemo(
    () => (eventType ? { eventType } : {}),
    [eventType],
  );
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

/* ═══════════════════ שורת העובדות התפעולית ═══════════════════ */

/**
 * ‏§4 P-08 מונה ארבע שורות שמנהלת משרד שואלת לפני כל דבר אחר. כל אחת
 * קשורה למשבצת ונגזמת לחוד; אין ולו ברירת מחדל אחת, ואין «בתיאום».
 *
 * שתי הערות על מה שאין כאן:
 *   · **חלון משלוח** — אין לו משבצת ב־`content/business.ts`. הוא לא
 *     נכתב כשורה ריקה שאין לה מקור; מדווח בדוח החזרה.
 *   · **חשבונית** — `companyId` ריק. השורה קיימת ותידלק מאליה; עד אז
 *     אין בדף מילה על חשבונית.
 *
 * השורה היחידה שמלאה היום היא השם המשפטי, והיא כאן בדיוק בגלל הרג׳יסטר:
 * לרכש מוסדי, «מי הישות שמולה עובדים» היא שאלה ראשונה ולא הערת שוליים.
 */
function opsRows(): OpsFactRow[] {
  return [
    {
      id: "ops-legal",
      labelHe: "הישות המשפטית",
      value: filled(SLOTS.legalName) ? SLOTS.legalName : null,
    },
    {
      id: "ops-company-id",
      labelHe: "ח.פ.",
      value: filled(SLOTS.companyId) ? <Num>{SLOTS.companyId}</Num> : null,
    },
    {
      id: "ops-cutoff",
      labelHe: "הזמנה לאותו יום",
      value: filled(SLOTS.sameDayCutoff) ? SLOTS.sameDayCutoff : null,
    },
    {
      id: "ops-lead-time",
      labelHe: "זמן התראה להזמנה",
      value: filled(SLOTS.leadTime) ? SLOTS.leadTime : null,
    },
    {
      id: "ops-minimum",
      labelHe: "מינימום סועדים",
      value: filled(SLOTS.minGuests) ? <Num>{SLOTS.minGuests}</Num> : null,
    },
    {
      id: "ops-terms",
      labelHe: "תנאי תשלום",
      value: filled(SLOTS.paymentTerms) ? SLOTS.paymentTerms : null,
    },
  ];
}

/* ═══════════════════ 01 · מה צריך כדי לקבל הצעה ═══════════════════ */

/**
 * הסקשן הייחודי של העמוד (מבחן T-1: החליפו «חברה» ב«בר מצווה» — הסקשן
 * הזה נשבר, וזה בדיוק מה שהוא צריך לעשות).
 *
 * הוא מתאר **תהליך**, ולכן הוא תמיד מרונדר: אין בו זמן תגובה, אין מינימום,
 * אין מועד אחרון ואין מחיר — כל אלה משבצות ריקות, וכל אחת מהן הייתה הופכת
 * תיאור להתחייבות.
 */
const CHECKLIST = [
  {
    title: "מה האירוע, וכמה אנשים",
    body: "ישיבת הנהלה, ארוחת צוות, כנס או ערב חברה — כל אחד מהם נראה אחרת על השולחן. מספר משוער מספיק בשלב הזה.",
  },
  {
    title: "תאריך ושעה",
    body: "השעה שבה האוכל צריך להיות על השולחן, ולא השעה שבה מתחילה הישיבה. זה ההבדל שמחזיק לוח זמנים של יום עבודה.",
  },
  {
    title: "לאן זה מגיע",
    body: "כתובת, קומה, ואיך נכנסים — חניה, מעלית, מטבחון. הדברים האלה קובעים איך ההגשה נראית בפועל, ועדיף לדעת אותם מראש.",
  },
  {
    title: "מי מאשר",
    body: "ההצעה נשלחת בכתב, עם פירוט של מה שמגיע — כדי שיהיה מה להעביר הלאה למי שצריך לאשר, בלי לתרגם שיחת טלפון.",
  },
] as const;

const Checklist = ({ num }: { num?: string }) => (
  <section id="checklist" className="sec">
    <div className="wrap">
      <SectionHeader
        num={num}
        eyebrow="לפני שפונים"
        title="ארבעה דברים שנשאל"
        lede="אין כאן שדה תקציב ואין טופס ארוך. אלה הדברים שצריך כדי להרכיב הצעה שאפשר להעביר הלאה."
      />

      <ol className="m-0 list-none p-0">
        {CHECKLIST.map((row, i) => (
          <li key={row.title} className="m-0">
            {i > 0 ? <Rule /> : null}
            <div className="max-w-body py-[1.7rem] pe-6">
              <span className="num block font-serif text-lg font-medium text-fg-subtle">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-3 font-serif text-lg font-bold">{row.title}</h3>
              <p className="mt-2 text-xs leading-[1.6] text-fg-muted">{row.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  </section>
);

/* ═══════════════════ 02 · יום גיבוש (עוגן #gibush) ═══════════════════ */

/**
 * ‏spec 01 P-13 + `content/occasions.ts`: כל עוד `SLOTS.liveStations` ריק,
 * ימי גיבוש חיים כעוגן בתוך העמוד הזה ולא כמסלול משלהם. ולכן, ובמפורש:
 * **אין כאן עמדה, אין תחנה, ואין בישול במקום** — לא בשם ולא ברמז. מה
 * שנאמר הוא מה שנכון בלי אף משבצת: אותו מטבח, אותו תהליך, אירוע אחר.
 */
const GibushBlock = ({ num }: { num?: string }) => (
  <section id="gibush" className="sec sec--alt sec--tight">
    <div className="wrap">
      <SectionHeader
        num={num}
        eyebrow="יום גיבוש"
        title="גם ליום צוות מחוץ למשרד"
        lede="יום כיף, יום גיבוש או סמינר צוות — אותו מטבח ואותו תהליך, רק שהאוכל נוסע רחוק יותר."
      />

      <Prose size="body" measure="body">
        <p>
          ספרו לנו איפה זה מתקיים, לאיזו שעה ולכמה אנשים, ונחזור עם תפריט
          שמתאים למקום ולפורמט של היום.
        </p>
      </Prose>
    </div>
  </section>
);

/* ═══════════════════ שאלות ותשובות ═══════════════════ */

type PageFaq = FaqItem & { answerHe: string | null };

/**
 * סט **בצורת רכש** — זה מה שמפריד אותו מהסטים של `/catering` ושל דפי
 * השמחות (T-1). שאלה בלי תשובה אינה מרונדרת (`FaqBand`), ואותו סינון
 * בדיוק מזין את ה־`FAQPage` — כך אי אפשר לפלוט למנוע חיפוש שאלה שאינה
 * על המסך.
 *
 * הפריטים שקשורים למשבצת נדלקים מאליהם ביום שהיא תימסר. אין כאן ולו
 * תשובה אחת ש«נשמעת נכון».
 */
function faqItems(): PageFaq[] {
  const legal = filled(SLOTS.legalName) ? SLOTS.legalName : null;

  return [
    {
      id: "faq-who-cooks",
      questionHe: "מי מבשל את האוכל?",
      answerHe:
        "המטבח של מסעדה איטלקית פעילה — מטבח שמבשל לסועדים שיושבים בו, ולא מטבח שנפתח כדי לשרת אירועים.",
    },
    {
      id: "faq-entity",
      questionHe: "מול איזו חברה עובדים?",
      answerHe: legal ? `העסק מתנהל תחת ${legal}.` : null,
    },
    {
      id: "faq-how-to-order",
      questionHe: "איך מזמינים?",
      answerHe:
        "ממלאים את הטופס בעמוד או כותבים לנו בוואטסאפ. בשני המסלולים חוזרים אליכם, עוברים על הפרטים, וההצעה נשלחת בכתב.",
    },
    {
      id: "faq-lead-time",
      questionHe: "כמה זמן מראש צריך להזמין?",
      answerHe: filled(SLOTS.leadTime) ? SLOTS.leadTime : null,
    },
    {
      id: "faq-same-day",
      questionHe: "אפשר להזמין לאותו יום?",
      answerHe: filled(SLOTS.sameDayCutoff) ? SLOTS.sameDayCutoff : null,
    },
    {
      id: "faq-minimum",
      questionHe: "יש מינימום סועדים?",
      answerHe: filled(SLOTS.minGuests) ? `${SLOTS.minGuests} סועדים.` : null,
    },
    {
      id: "faq-payment",
      questionHe: "מה תנאי התשלום?",
      answerHe: filled(SLOTS.paymentTerms) ? SLOTS.paymentTerms : null,
    },
    {
      id: "faq-headcount",
      questionHe: "עד מתי אפשר לעדכן מספר סועדים?",
      answerHe: filled(SLOTS.headcountDeadline) ? SLOTS.headcountDeadline : null,
    },
    {
      id: "faq-area",
      questionHe: "לאן מגיעים?",
      answerHe: (() => {
        const area = cateringServiceCities();
        return area.length > 0 ? area.join(" · ") : null;
      })(),
    },
  ];
}

/* ═══════════════════ להמשיך מכאן ═══════════════════ */

/**
 * ‏`NextSteps` מסנן בעצמו מול `shared/routes.ts` ומול המסלול הנוכחי, ולכן
 * הרשימה כאן היא כוונה ולא הבטחה: יעד חסום פשוט אינו קיים בבאנד.
 */
const NEXT: NextStepLink[] = [
  {
    href: "/catering/private-events",
    titleHe: "שמחות פרטיות",
    descriptionHe: "אירוע משפחתי בבית או במקום שנבחר.",
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

export default function CateringBusiness() {
  const seedEventType = OCCASION.eventTypeSeed;
  const wa = useHeroWhatsApp(seedEventType);

  const rows = opsRows();
  const faqs = faqItems();

  /* ‏§3.1 — מקור המספור היחיד. הרצועה התפעולית **אינה** ממוספרת: לפי
     ‏§4 P-08 השדרה הממוספרת מתחילה מתחתיה, והיא עצמה שורת עובדות מעל
     הקיפול ולא סקשן תוכן. */
  const order = [
    "checklist",
    "gibush",
    "kitchen",
    "branches",
    "quote",
    faqs.some((f) => f.answerHe) ? "faq" : null,
  ].filter((k): k is string => k !== null);

  const num = (key: string) => {
    const i = order.indexOf(key);
    return i < 0 ? undefined : String(i + 1).padStart(2, "0");
  };

  /* גיזום ברמת הפסוקית (G5): כל אסימון ריק מוריד את הפסוקית שלו בלבד.
     הכשרות נקראת מהמשבצת דרך `kashrutClauseHe` ולא נכתבת קשיח — היא
     ההצהרה בעלת הסיכון הגבוה ביותר באתר. */
  const facts = ["מטבח של מסעדה איטלקית פעילה", kashrutClauseHe("general")].filter(
    (c): c is string => Boolean(c),
  );

  const cities = cateringServiceCities();

  return (
    <>
      <Head
        meta={META}
        jsonLd={[
          /* ‏`Service` עם `BusinessAudience` — נפלט לזיהוי ישות, לא לקישוט
             תוצאות: אין לו תוצאה עשירה מקבילה בגוגל (01 §7). `areaServed`
             נפלט **רק** מערים שנמסרו; אזור שנגזר ממיקומי המסעדות הוא בדיוק
             האופן שבו נכנסו לאתר הקודם ערי שירות מומצאות. */
          stripEmptyJsonLd(buildWebPage(META)),
          stripEmptyJsonLd(
            buildService({
              path: SOURCE_PAGE,
              nameHe: `${CATERING_NAME} — ${OCCASION.nameHe}`,
              descriptionHe: META.descriptionHe,
              areaServedHe: cities.length > 0 ? [...cities] : null,
              audience: "business",
            }),
          ),
          buildBreadcrumbList(META.breadcrumb),
          buildFaqPage(faqs),
        ]}
      />

      <OccasionIntro
        eyebrow="קייטרינג · לחברות"
        title={
          <>
            ארוחת צוות
            <br />
            מהמטבח של המסעדה.
          </>
        }
        lede="כיבוד לישיבה, ארוחת צוות או אירוע חברה. אומרים לנו מתי, כמה ולאן — ומקבלים הצעה בכתב שאפשר להעביר הלאה לאישור."
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

      {/* G12 — הרצועה התפעולית מיד מתחת להירו, מעל הקיפול בנייד. כל שורה
          נגזמת לחוד, וכשכולן ריקות הרצועה כולה נעלמת. */}
      <OpsFacts id="ops" rows={rows} variant="strip" eyebrow="מה שצריך לדעת" />

      <Checklist num={num("checklist")} />

      <GibushBlock num={num("gibush")} />

      <KitchenNote num={num("kitchen")} />

      {/* המסעדות כהקשר מותג בלבד. ה־lede הוא המקום היחיד בעמוד שנוקב
          במספרן, והוא נזהר בדיוק בנקודה אחת: «במטבח של אחת מהן».
          ‏`flagshipLabelHe={null}` — בדף קייטרינג תג דגל נקרא כתשובה
          לשאלה «איזה מטבח מבשל», וזו משבצת ריקה. */}
      <BranchStrip
        num={num("branches")}
        sourcePage={SOURCE_PAGE}
        eyebrow="ההקשר"
        title="המסעדות שמאחורי הקייטרינג"
        lede="מסעדות איטלקיות שפועלות לקהל הרחב. הקייטרינג הוא עיסוק נפרד שעובד לפי הזמנה, והוא מבושל במטבח של אחת מהן."
        flagshipLabelHe={null}
      />

      {/* ‏`seed` נשאר גלוי וניתן לעריכה (02 §1.7) — קישור שהועבר הלאה לא
          יכתוב ליד עם תווית שגויה. `offerAtRestaurant` נשאר כבוי: אירוח
          במסעדה אינו רלוונטי לאירוע חברה, וממילא אין קיבולת שנמסרה. */}
      <QuoteCta
        num={num("quote")}
        sourcePage={SOURCE_PAGE}
        seed={{ eventType: seedEventType }}
        title="התפריט לאירוע שלכם"
        lede="ארבע שאלות על האירוע, ואז פרטים ליצירת קשר. ההצעה חוזרת בכתב."
      />

      {/* מסלול שני, למי שגלל עד הטופס ובחר לא למלא אותו. */}
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
