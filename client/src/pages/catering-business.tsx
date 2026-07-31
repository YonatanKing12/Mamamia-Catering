/**
 * ═══════════════════════════════════════════════════════════════════════
 *  P-08 · `/catering/business` — קייטרינג לחברות. **רג׳יסטר תפעולי.**
 * ═══════════════════════════════════════════════════════════════════════
 *
 * spec 01 §4 P-08, §3.1 (G12 — סדר הפוך), §3.3, spec 02 §3.9.
 * המערכת החזותית היא `docs/spec/04-visual-reference.md`, שגובר על 03 §2–§6.
 *
 * ─────────────────────────────────────────────────────────────────────
 *  היררכיית ההמרה — זהה בחמשת הדפים שבבעלותי
 * ─────────────────────────────────────────────────────────────────────
 * שלושה ערוצים, ולכל אחד מקום אחד ומשקל אחד. ערוץ שמופיע פעמיים באותו
 * משקל אינו מכפיל המרה, הוא מפצל אותה.
 *
 *   1. **הבנאי, ב־`#quote`.** משבצת אחת בעמוד, וכל פקד ענבר מצביע אליה.
 *      כשיש מנות וחבילות היא `MenuConfigurator`; עד אז היא `QuoteCta` —
 *      בנאי ארבע השאלות, **עם הזרעת סוג האירוע**. השער נגזר מ־
 *      ‎`hasConfigurator() && hasPackages()` ולא נכתב ידנית, ולכן העמוד
 *      עובר למגדיר ביום שהמנות יגיעו בלי לגעת בקובץ הזה.
 *   2. **וואטסאפ.** פקד מתאר־קו בהירו לצד הענבר, ופקד ירוק ממולא **פעם
 *      אחת** בעמוד — ברצועה שמיד מתחת לבנאי, שכל תפקידה הוא מי שגלל עד
 *      הטופס ובחר לא למלא אותו.
 *   3. **הטלפון.** לעולם לא כפתור. מספר קריא בשורת טקסט, בהירו וברצועות.
 *      בקטגוריה הזאת חלק מהקונים מחייגים במקום ללחוץ.
 *
 * ─────────────────────────────────────────────────────────────────────
 *  המיצוב — לא לגעת
 * ─────────────────────────────────────────────────────────────────────
 * הקייטרינג מבושל במטבח של **אחת** מהמסעדות. אין «שלושה מטבחים», אין עיר
 * כמוצא האוכל, אין אזור שירות שנגזר ממיקומי הסניפים, ואין «בואו לטעום
 * הערב במסעדה». שמות המסעדות הם הקשר מותג בלבד.
 *
 * ─────────────────────────────────────────────────────────────────────
 *  מה נשמט היום, וזו התנהגות תקינה (INV-2)
 * ─────────────────────────────────────────────────────────────────────
 *   ReviewsBlock · Gallery   `content/proof.ts` ריק ⇒ שתיהן מחזירות null,
 *                            והסקשן שעוטף אותן אינו מרונדר כלל.
 *   OpsFacts                 חמש מתוך שש שורות ריקות; כל אחת נגזמת לחוד.
 *   MenuSheet · ServiceFormats · InclusionsExclusions · LimitsBlock ·
 *   TermsStrip · PastEvents · TastingBand
 *                            אין ולו שורה שנמסרה לאף אחד מהם.
 *
 * ‏`#gibush` הוא **עוגן בעמוד ולא קישור החוצה**: `/catering/fun-day` חסום
 * על `SLOTS.liveStations`, וקישור אליו היה 404 בקמפיין משלם. ואין באותו
 * סקשן שם עמדה, שם תחנה או טענה על בישול במקום.
 *
 * ‏§3.1: הספרות נקבעות בזמן רינדור **לפי מיקום**. `order` למטה הוא המקור
 * היחיד להן. רצועות ההמרה והאמון אינן ממוספרות — הן אינן פרקים.
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
  OpsFacts,
  QuoteCta,
  type FaqItem,
  type OpsFactRow,
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
import { cateringServiceCities } from "@/content/locations";
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
const META = resolveExtraMeta("/catering/business") as PageMetaExtra;

const SOURCE_PAGE = "/catering/business";

/** מודול העובדות הוא המקור לשם האירוע ולזריעה — לא מחרוזת שנכתבת כאן. */
const OCCASION = occasionById("business");

/* ═══════════════════ מסלול הוואטסאפ בהירו ═══════════════════ */

/**
 * חוזה 02 §6.1–§6.3: קליטה מקדימה ואז ניווט **באותו tick**, בלי `await`
 * ובלי בדיקת תשובה — Safari/iOS חוסם פתיחה ברגע שה־promise נכנע. המזהה
 * נוצר ברינדור, ולכן ה־`href` הסטטי נושא אותו גם בלי JS.
 *
 * ‏TODO(01 §5.7): עותק חמישי של אותו קוד. מקומו ב־`lib/whatsapp.ts` —
 * מדווח, לא בבעלותי.
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

/* ═══════════════════ הבנאי — משבצת ההמרה היחידה ═══════════════════ */

type Seed = React.ComponentProps<typeof QuoteCta>["seed"];

/**
 * ‏04 §6: המגדיר **בונה** את האירוע במקום **לבקש** הצעה. מי שהשקיע דקות
 * בבחירת מנות נוטש הרבה פחות, והליד נושא את הבחירות עצמן.
 *
 * ‏04 §6 גם קובע שהמגדיר אינו מתפקד בלי מנות. לכן כל עוד `PACKAGES` או
 * ‎`DISHES` ריקים, המשבצת מחזיקה את בנאי ארבע השאלות — **עם ההזרעה**.
 * ‏`MenuConfigurator` בולע בעצמו את המצב הריק, אבל הוא אינו מקבל `seed`,
 * וליד מדף אירוע בלי `eventType` הוא ליד פחות שווה. שני המסלולים כאן
 * נבדלים בדיוק בנקודה הזאת ובשום נקודה אחרת.
 *
 * ‏TODO(dev): `seed` על `MenuConfiguratorProps`, ואז הענף הזה מיותר.
 * הקומפוננטה אינה בבעלותי — מדווח.
 *
 * ‏`[&_.wrap]` / `[&_.sec]` מנטרלים את המרזב והריפוד הפנימיים של הבנאי:
 * הוא מרנדר `.sec .wrap` משלו, ובתוך העטיפה כאן זה מרזב כפול.
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
          showHeader={false}
          onSubmitted={(ref, answers) =>
            navigate(`/thanks?ref=${encodeURIComponent(ref)}`, { state: { ref, answers } })
          }
        />
      </div>
    </div>
  );
}

/* ═══════════════════ שורת העובדות התפעולית ═══════════════════ */

/**
 * ‏§4 P-08 מונה את השאלות שמנהלת משרד שואלת לפני כל דבר אחר. כל שורה
 * קשורה למשבצת ונגזמת לחוד; אין ולו ברירת מחדל אחת, ואין «בתיאום».
 *
 * שתי הערות על מה שאין כאן:
 *   · **חלון משלוח** — אין לו משבצת ב־`content/business.ts`, ולכן הוא
 *     אינו נכתב כשורה ריקה שאין לה מקור. מדווח.
 *   · **חשבונית** — `companyId` ריק. השורה קיימת ותידלק מאליה; עד אז אין
 *     בדף מילה על חשבונית.
 *
 * השורה היחידה שמלאה היום היא השם המשפטי, והיא כאן בדיוק בגלל הרג׳יסטר:
 * לרכש מוסדי «מי הישות שמולה עובדים» היא שאלה ראשונה ולא הערת שוליים.
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

/* ═══════════════════ מה צריך כדי לקבל הצעה ═══════════════════ */

/**
 * הסקשן הייחודי של העמוד (מבחן T-1: החליפו «חברה» ב«בר מצווה» — הוא
 * נשבר, וזה בדיוק מה שהוא צריך לעשות).
 *
 * הוא מתאר **תהליך**, ולכן הוא תמיד מרונדר: אין בו זמן תגובה, אין מינימום,
 * אין מועד אחרון ואין מחיר. כל אחד מהם היה הופך תיאור להתחייבות.
 */
const CHECKLIST = [
  {
    title: "איזה אירוע, וכמה אנשים",
    body: "ישיבת הנהלה, ארוחת צוות, כנס או ערב חברה. כל אחד נראה אחרת על השולחן. מספר משוער מספיק.",
  },
  {
    title: "תאריך, ושעת ההגשה",
    body: "השעה שבה האוכל על השולחן, לא השעה שבה הישיבה מתחילה. משם בונים אחורה.",
  },
  {
    title: "לאן זה מגיע",
    body: "כתובת, קומה, ואיך נכנסים. חניה, מעלית, מטבחון. הפרטים האלה קובעים איך ההגשה נראית בפועל.",
  },
  {
    title: "מי מאשר",
    body: "ההצעה נשלחת בכתב ומפורטת, כדי שאפשר יהיה להעביר אותה הלאה בלי לתרגם שיחת טלפון.",
  },
] as const;

const Checklist = ({ num }: { num?: string }) => (
  <section id="checklist" className="sec">
    <div className="wrap">
      <SectionHeader
        num={num}
        eyebrow="לפני שפונים"
        title="ארבעה דברים שנשאל"
        lede="אין שדה תקציב ואין טופס ארוך. אלה הפרטים שצריך כדי להרכיב הצעה שאפשר להעביר לאישור."
      />

      <ol className="m-0 grid list-none gap-grid p-0 [grid-template-columns:repeat(auto-fit,minmax(230px,1fr))]">
        {CHECKLIST.map((row, i) => (
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

/* ═══════════════════ יום גיבוש (עוגן #gibush) ═══════════════════ */

/**
 * ‏spec 01 P-13 + `content/occasions.ts`: כל עוד `SLOTS.liveStations` ריק,
 * ימי גיבוש חיים כעוגן בתוך העמוד הזה ולא כמסלול משלהם. ולכן, במפורש:
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
        lede="יום כיף, יום גיבוש או סמינר צוות. אותו מטבח ואותו תהליך, רק שהאוכל נוסע רחוק יותר."
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
 * בדיוק מזין את ה־`FAQPage`: אי אפשר לפלוט למנוע חיפוש שאלה שאינה על המסך.
 *
 * כל תשובה נכתבת כמשפט שלם שעומד בפני עצמו מחוץ להקשר — תשובת FAQ היא
 * היחידה שמנוע תשובות מצטט מילה במילה.
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
      answerHe: legal ? `הקייטרינג מתנהל תחת ${legal}.` : null,
    },
    {
      id: "faq-how-to-order",
      questionHe: "איך מזמינים?",
      answerHe:
        "בונים את התפריט כאן בעמוד ומשאירים פרטים, או כותבים לנו בוואטסאפ. בשני המסלולים חוזרים אליכם, עוברים על הפרטים, וההצעה נשלחת בכתב.",
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

/* ═══════════════════ העמוד ═══════════════════ */

export default function CateringBusiness() {
  const seedEventType = OCCASION.eventTypeSeed;
  const wa = useHeroWhatsApp(seedEventType);

  const rows = opsRows();
  const faqs = faqItems();

  const showProof = hasGoogleReviews() || hasTestimonials();
  const showGallery = hasGallery();

  /* אותו שער בדיוק שהרשת משתמשת בו, מחושב כאן כדי שהעמוד יידע אם
     לרנדר את הרצועה בכלל. */
  const otherOccasions = React.useMemo(
    () => buildableOccasions().filter((o) => o.id !== OCCASION.id),
    [],
  );

  /* ‏§3.1 — מקור המספור היחיד. רצועות ההמרה, האמון והעובדות אינן
     ממוספרות: הן אינן פרקים בגיליון, הן הדרך לפנות ולהאמין. */
  const order = [
    "quote",
    "checklist",
    "gibush",
    "kitchen",
    "branches",
    faqs.some((f) => f.answerHe) ? "faq" : null,
  ].filter((k): k is string => k !== null);

  const num = (key: string) => {
    const i = order.indexOf(key);
    return i < 0 ? undefined : String(i + 1).padStart(2, "0");
  };

  /* גיזום ברמת הפסוקית (G5). הכשרות אינה נכתבת כאן כמחרוזת ואינה חוזרת
     פעמיים: `KashrutBadge` מצטט את המשבצת, וכשאין נוסח אין תג ואין רווח. */
  const facts: React.ReactNode[] = [
    hasKashrutWording() ? <KashrutBadge key="kashrut" variant="pill" /> : null,
    "מטבח של מסעדה איטלקית פעילה",
  ].filter(Boolean);

  const cities = cateringServiceCities();

  return (
    <>
      <Head
        meta={META}
        jsonLd={[
          /* ‏`Service` עם `BusinessAudience` — נפלט לזיהוי ישות, לא לקישוט
             תוצאות. `areaServed` נפלט **רק** מערים שנמסרו; אזור שנגזר
             ממיקומי המסעדות הוא בדיוק האופן שבו נכנסו לאתר הקודם ערי
             שירות מומצאות. */
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
        eyebrow="קייטרינג מאמאמיה · לחברות"
        title={
          <>
            ארוחת צוות
            <br />
            מהמטבח של המסעדה.
          </>
        }
        lede="כיבוד לישיבה, ארוחת צוות או ערב חברה. אומרים לנו מתי, כמה ולאן — וההצעה חוזרת בכתב, מפורטת, מוכנה להעברה לאישור."
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
        {/* ‏04 §5: בקטגוריה הזאת מונה הביקורות הוא אות האמון המרכזי.
            הבלוק בנוי ומחווט ומחזיר `null` עד שהמספר האמיתי יימסר —
            אין דירוג לדוגמה ואין «מאות לקוחות מרוצים». */}
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

      {/* G12 — הרצועה התפעולית מיד מתחת להירו, מעל הקיפול בנייד. כל שורה
          נגזמת לחוד, וכשכולן ריקות הרצועה כולה נעלמת. */}
      <OpsFacts id="ops" rows={rows} variant="strip" eyebrow="מה שצריך לדעת" />

      {/* ═══ 01 · משבצת ההמרה. הדבר השני שהקונה רואה. ═══ */}
      <BuilderSection
        num={num("quote")}
        seed={{ eventType: seedEventType }}
        title="התפריט לאירוע שלכם"
        lede="כמה סועדים, מתי, ולאן. אין שדה תקציב. ההצעה חוזרת בכתב."
      />

      {/* המסלול השני, למי שגלל עד הטופס ובחר לא למלא אותו. זה הפקד הירוק
          הממולא היחיד בעמוד. `showQuote={false}` — הבנאי נמצא ממש מעליו. */}
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

      <Checklist num={num("checklist")} />

      <GibushBlock num={num("gibush")} />

      {/* ‏04 §5 — שכבת האמון. שתי הרצועות ריקות היום ולכן אינן קיימות:
          לא מסגרת אפורה, לא «בקרוב», ולא רשת עם תאים ריקים. */}
      {showProof ? (
        <section id="reviews" className="sec sec--alt">
          <div className="wrap">
            <ReviewsBlock
              eyebrow="מה אומרים"
              title="ביקורות בגוגל"
              headingAs="h2"
            />
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

      {/* הקריאה הארוכה על קרקע קרמית — מדיניות ההחלפה ב־`index.css`.
          הענבר נגזר שם מחדש ל־`--amber-ink` בלי שהקוד כאן יודע על כך. */}
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

      {/* הבאנד הסוגר. מי שגלל עד לכאן קרא הכול ועדיין לא פנה — ולכן
          הענבר חוזר להיות הפקד הממולא, והוואטסאפ חוזר להיות מתאר קו. */}
      <section id="contact" className="sec sec--tight">
        <div className="wrap">
          <SectionHeader
            eyebrow="לסגור את האירוע"
            title="נבנה לכם תפריט"
            lede="ספרו לנו מתי, כמה ולאן, ונחזור עם תפריט והצעה בכתב."
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
