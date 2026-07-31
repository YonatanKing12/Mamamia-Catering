/**
 * ═══════════════════════════════════════════════════════════════════════
 *  P-02 · `/menus` — התפריטים. spec 01 §4 P-02, §3.1, §3.3.
 * ═══════════════════════════════════════════════════════════════════════
 *
 * תחת TAFRIT זה הדף השני בחשיבותו באתר, והוא הדף שהכיוון קרוי על שמו.
 *
 * ─────────────────────────────────────────────────────────────────────
 *  היררכיית ההמרה — זהה בששת העמודים שבבעלות הקובץ הזה
 * ─────────────────────────────────────────────────────────────────────
 *   1. **הבנייה — משטח אחד בעמוד.** `MenuConfigurator` כשיש מנות וחבילות,
 *      בנאי ארבע השאלות כשאין. פקד **ענבר ממולא אחד** מוביל אליו.
 *   2. **וואטסאפ — ערוץ שני, אחד בכרום של העמוד.** ירוק־ghost בהירו.
 *   3. **טלפון — קישור טקסט.** לעולם לא כפתור.
 *
 * ─────────────────────────────────────────────────────────────────────
 *  הדף במצב «אפס מנות», וזו התנהגות תקינה
 * ─────────────────────────────────────────────────────────────────────
 * ‎`content/dishes.ts` ריק. ‎§3.3 שורת "0" קובעת ש־`MenuSheet` **אינו
 * מרונדר** ושהדף עובר לרג׳יסטר התפעולי. מכאן שכל מה שהמפרט מונה בסדר
 * הסקשנים ונשען על מנות או על משבצת ריקה — נשמט:
 *
 *   MenuSheet            ‎0 מנות זמינות לקייטרינג.
 *   ServiceMenus         אין רשימת «מה כלול» לאף צורת הגשה, ואף פורמט
 *                        לא אושר כמוצע — `ServiceFormats` היה מחזיר null.
 *   InclusionsExclusions ‎`priceIncludes` / `priceExcludes` ריקים.
 *   PriceFloor           אין מחיר חתום ואין נוסח הסתייגות. §7.24.
 *   TastingBand          ‎`tastingPolicy` ריק ⇒ שער 02 §1.6 נכשל.
 *   LimitsBlock          אין שורת מגבלה שנמסרה.
 *   Faq                  אין ולו תשובה אחת שנמסרה. הפריטים כתובים כאן
 *                        וקשורים למשבצות, ולכן הבאנד נדלק מאליו.
 *   ReviewsBlock/Gallery ‎`content/proof.ts` ריק. השער נבדק **בעמוד**, כדי
 *                        שלא ייווצר `.sec` עם padding סביב `null`.
 *
 * מה שנשאר הוא מה שאנחנו באמת יודעים: איך תפריט לאירוע נבנה, שהוא יוצא
 * ממטבח של מסעדה פעילה, והדרך להתחיל. **המבחן שהעמוד נבנה לעבור הוא
 * להיראות מכוון וגמור כשכל המשבצות ריקות** — כי זה המצב היום.
 *
 * ─────────────────────────────────────────────────────────────────────
 *  הבאנד הקרם — ולמה דווקא כאן
 * ─────────────────────────────────────────────────────────────────────
 * מדיניות ההחלפה ב־`index.css`: כהה לכל משטחי ההמרה, קרם ל**קריאה
 * הארוכה** בלבד, ולעולם לא לסירוגין לשם הקצב. בעמוד הזה הקריאה הארוכה
 * היא בדיוק שני הסקשנים הרצופים «איך נבנה תפריט» ו־`KitchenNote` — ולכן
 * שניהם יושבים בתוך עטיפת `data-band="cream"` אחת, כפרק אחד, ולא כשתי
 * רצועות שמתחלפות. `MenuSheet` נכנס לאותה עטיפה כשיימסרו מנות: עלה
 * תפריט הוא מסמך לקריאה, וזה גם מה שיוצא נכון בהדפסה.
 *
 * ─────────────────────────────────────────────────────────────────────
 *  מה קורה ברגע ש־`DISHES` מתמלא — בלי שינוי קוד
 * ─────────────────────────────────────────────────────────────────────
 * ‎`MenuSheet` נדלק במיקום 01 ודוחף את שאר המספור למטה (המספור נקבע
 * לפי מיקום, §3.1, ולא קשיח). `grouping="auto"` מיישם לבד את ספי §3.3.
 * במקביל, ברגע ש־`dish-categories` ו־`packages` יתמלאו, משטח הבנייה
 * מחליף את עצמו מבנאי ארבע השאלות ל־`MenuConfigurator` — בלי שינוי קוד
 * ובלי שינוי בעוגן `#quote`.
 *
 * ─────────────────────────────────────────────────────────────────────
 *  «הוסיפו לתפריט שלי» — מה עובד ומה עוד לא
 * ─────────────────────────────────────────────────────────────────────
 * יעד ההמרה של הדף הוא `add_to_brief` → `brief_to_builder` (§4 P-02).
 * הבחירה נאספת כאן ונשלחת לבנאי כ־`seed.dishes`. **מגבלה מתועדת:**
 * ‎`applySeed` ב־`use-quote-builder` רץ באתחול ה־state בלבד, ולכן מנה
 * שנוספת אחרי שהבנאי כבר עלה על המסך לא תגיע אליו. התיקון הוא
 * ‎`hooks/use-brief.ts` (01 §5.7) + API להוספת מנות לבנאי חי; שניהם מחוץ
 * לבעלות של הקובץ הזה ומדווחים בדוח החזרה. היום `CATERING_DISHES` ריק,
 * ולכן אין מסלול שבו המגבלה מתבטאת בפועל.
 *
 * ‎`brief_to_builder` אינו קיים באיחוד הסגור של `lib/analytics.ts`, ולכן
 * נורים כאן רק `add_to_brief` ו־`remove_from_brief` שכן קיימים.
 */

import * as React from "react";
import { useLocation } from "wouter";
import { Head } from "@/components/seo/head";
import { Button, Prose, SectionHeader } from "@/components/primitives";
import {
  FaqBand,
  KitchenNote,
  MenuSheet,
  NextSteps,
  OccasionIntro,
  type DishLine,
  type FaqItem,
} from "@/components/bands";
import { MenuConfigurator } from "@/components/configurator";
import { Gallery, ReviewsBlock } from "@/components/trust";
import { QuoteBuilder } from "@/components/quote/quote-builder";
import type { DishSelection, QuoteAnswers } from "@/components/quote/use-quote-builder";
import { SLOTS, filled } from "@/content/business";
import {
  CATERING_DISHES,
  COURSES,
  COURSE_LABEL,
  dishesByCourse,
  hasDishes,
  provenanceMark,
} from "@/content/dishes";
import { hasConfigurator } from "@/content/dish-categories";
import { hasPackages } from "@/content/packages";
import { hasGallery, hasGoogleReviews, hasTestimonials } from "@/content/proof";
import { kashrutClauseHe, resolveExtraMeta, stripEmptyJsonLd } from "@/lib/page-meta-extra";
import type { PageMetaExtra } from "@/lib/page-meta-extra";
import { buildBreadcrumbList, buildFaqPage, buildMenu, buildWebPage } from "@/lib/seo";
import { buildWaHref, captureWaIntent, newRef } from "@/lib/lead-client";
import { track } from "@/lib/analytics";

/** הרשומה קיימת תמיד ב־`page-meta-extra`; היעדרה הוא באג ולא מצב. */
const META = resolveExtraMeta("/menus") as PageMetaExtra;

const SOURCE_PAGE = "/menus";

/** המשטח שמוגש בפועל. ראו הערת «מה קורה ברגע ש־DISHES מתמלא». */
const CONFIGURATOR_LIVE = hasConfigurator() && hasPackages();

/* ═══════════════════ מסלול הוואטסאפ בהירו ═══════════════════ */

/**
 * חוזה §6.1–§6.3: קליטה מקדימה ואז ניווט **באותו tick**, בלי `await`.
 * המזהה נוצר ברינדור ולא בקליק, ולכן ה־`href` הסטטי נושא בדיוק את אותו
 * מזהה — הקישור תקין גם בלי JS, גם בלשונית חדשה, וגם כשמעתיקים אותו.
 *
 * ‎TODO(01 §5.7): זהה למה שיושב ב־`WhatsAppBand` וב־`pages/home.tsx`.
 * מקומו ב־`lib/whatsapp.ts openWhatsApp()`; שלושת העותקים מדווחים.
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

/* ═══════════════════ שאלות ותשובות ═══════════════════ */

/**
 * ‎§7.16: שאלה בלי תשובה אינה שאלה. כל תשובה כאן נקראת ממשבצת, ולכן
 * הבאנד נדלק מאליו כשהבעלים ימסור — ואף שאלה אינה נכתבת עם ניסוח
 * «סביר» שאיש לא אישר. כולן `null` היום ⇒ הבאנד אינו מרונדר.
 *
 * הסט הזה הוא סט של דף תפריט (מה כלול, טעימה, זמן הזמנה). ‎`/catering`
 * נושא סט חוצה־אירועים אחר — T-1.
 */
type PageFaq = FaqItem & { answerHe: string | null };

function faqItems(): PageFaq[] {
  return [
    {
      id: "faq-includes",
      questionHe: "מה כלול בהזמנה?",
      answerHe: filled(SLOTS.priceIncludes) ? SLOTS.priceIncludes.join(" · ") : null,
    },
    {
      id: "faq-excludes",
      questionHe: "מה לא כלול?",
      answerHe: filled(SLOTS.priceExcludes) ? SLOTS.priceExcludes.join(" · ") : null,
    },
    {
      id: "faq-tasting",
      questionHe: "אפשר לטעום לפני שמזמינים?",
      answerHe: filled(SLOTS.tastingPolicy) ? SLOTS.tastingPolicy : null,
    },
    {
      id: "faq-lead-time",
      questionHe: "כמה זמן מראש צריך להזמין?",
      answerHe: filled(SLOTS.leadTime) ? SLOTS.leadTime : null,
    },
  ];
}

/* ═══════════════════ הסקשן שהוא הדף ═══════════════════ */

/**
 * שלושת השלבים. הסקשן הייחודי של `/menus` (T-1): הוא מסביר **את התפריט**,
 * ולא את תהליך ההתקשרות הכללי — זה כבר יושב בדף הבית ואסור לו לחזור כאן
 * במילים מוחלפות.
 *
 * הצורה — רשימה ממוספרת בענבר, משפט אחד לשלב — נבחרה גם למנוע תשובות:
 * שלושה שלבים קצרים ומפורשים הם מה שמנוע תשובות מצטט בפועל, ופסקה
 * זורמת אינה.
 *
 * מה שנאמר כאן ומה שאסור היה להיאמר: אין «חבילות», אין «אין מינימום»,
 * אין טווח סועדים, אין זמן הכנה, אין זמן תגובה ואין אזור. כל אלה משבצות
 * ריקות. מה שכן נאמר הוא איך תפריט נבנה — תיאור תהליך, לא התחייבות.
 */
const STEPS: readonly { title: string; body: string }[] = [
  {
    title: "מספרים לנו על האירוע",
    body: "כמה סועדים, מתי, ובאיזו עיר. בטופס, בוואטסאפ או בטלפון.",
  },
  {
    title: "אנחנו מרכיבים תפריט",
    body: "מהמנות שהמטבח של המסעדה מבשל, לפי מספר הסועדים ולפי מה שחשוב לכם שיהיה על השולחן.",
  },
  {
    title: "חוזרים אליכם עם הצעה",
    body: "התפריט והמחיר בכתב, כדי שיהיה מה להראות למי שצריך לאשר.",
  },
];

function HowTheMenuWorks({ num, canPrint }: { num?: string; canPrint: boolean }) {
  const onPrint = React.useCallback<React.MouseEventHandler<HTMLButtonElement & HTMLAnchorElement>>(
    () => {
      track("menu_print", { source_page: SOURCE_PAGE });
      if (typeof window !== "undefined") window.print();
    },
    [],
  );

  return (
    <section id="how-menu" className="sec">
      <div className="wrap">
        <SectionHeader
          num={num}
          title="איך נבנה תפריט לאירוע"
          lede="אין כאן עגלת קניות ואין תפריט קבוע להורדה. התפריט מורכב לאירוע, ולכן הוא מתחיל בשיחה."
          reveal={false}
        />

        <ol className="m-0 grid list-none gap-grid p-0 min-[760px]:grid-cols-3">
          {STEPS.map((step, i) => (
            <li
              key={step.title}
              className="m-0 flex flex-col gap-3 rounded-card border border-solid border-[color:var(--rule)] bg-bg-form p-card"
            >
              <span className="sec__num num" aria-hidden="true">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="m-0 text-lg font-bold">{step.title}</h3>
              <p className="m-0 text-xs leading-[1.6] text-fg-muted">{step.body}</p>
            </li>
          ))}
        </ol>

        {/* ‎§4 P-02: קישור טקסט אחד, לא כפתור. אינו קולט דבר ואינו חוסם דבר.
            מוצג רק כשיש מה להדפיס — גיליון A4 ריק אינו תפריט. */}
        {canPrint ? (
          <p className="m-0 mt-8 max-w-none">
            <Button variant="link" onClick={onPrint}>
              הדפיסו את התפריט
            </Button>
          </p>
        ) : null}
      </div>
    </section>
  );
}

/* ═══════════════════ שכבת האמון ═══════════════════ */

const ReviewsSection = ({ num }: { num?: string }) => (
  <section id="reviews" className="sec sec--tight">
    <div className="wrap">
      {/* הכותרת בעמוד ולא ב־`ReviewsBlock`: המספר נקבע לפי מיקום ואין
          לקומפוננטה prop `num`. מבוקש בדוח החזרה. */}
      <SectionHeader
        num={num}
        eyebrow="מה אומרים"
        title="ביקורות בגוגל"
        lede="הדירוג והמונה כפי שהם מופיעים בפרופיל הציבורי, עם קישור לאימות."
      />
      <ReviewsBlock />
    </div>
  </section>
);

const GallerySection = ({ num }: { num?: string }) => (
  <section id="gallery" className="sec sec--tight">
    <div className="wrap">
      <SectionHeader num={num} eyebrow="מהאירועים" title="איך זה נראה על השולחן" />
      <Gallery />
    </div>
  </section>
);

/* ═══════════════════ משטח הבנייה ═══════════════════ */

/**
 * **אחד בעמוד**, והוא היעד של פקד הענבר היחיד בהירו ושל הפס הדביק.
 *
 * ‎`QuoteCta` (ספריית הבאנדים) עוטף `QuoteBuilder` בלבד ואין לו מסלול
 * מגדיר, ולכן העטיפה נכתבת כאן. **אין לזה עותק שני בעמוד** — ברגע
 * ש־`QuoteCta` יקבל תמיכה במגדיר (מבוקש בדוח החזרה) הבלוק הזה נמחק
 * לטובתו.
 *
 * הזריעה: `seed.dishes` נתמכת בבנאי בלבד. למגדיר יש בחירה מתמידה משלו
 * (`use-configurator`), ולכן במסלול המגדיר אין מה לזרוע.
 */
function BuildSection({ num, seedDishes }: { num?: string; seedDishes: DishSelection[] }) {
  const [, navigate] = useLocation();

  const onSubmitted = React.useCallback(
    (ref: string, answers: QuoteAnswers) =>
      navigate(`/thanks?ref=${encodeURIComponent(ref)}`, { state: { ref, answers } }),
    [navigate],
  );

  return (
    <div id="quote" className="border-y border-solid border-y-[color:var(--rule)] bg-bg-form">
      <div className="wrap pt-sec">
        <SectionHeader
          num={num}
          title="התפריט שלכם"
          lede={
            CONFIGURATOR_LIVE
              ? "בוחרים מנות מול המכסה של החבילה, ומשאירים פרטים. אין שדה תקציב."
              : "ארבע שאלות על האירוע, ואז פרטים ליצירת קשר. אין שדה תקציב, ואין מה למלא כדי לראות מחיר."
          }
          reveal={false}
        />
      </div>

      {CONFIGURATOR_LIVE ? (
        <div className="wrap pb-sec">
          <MenuConfigurator
            id="quote-builder"
            sourcePage={SOURCE_PAGE}
            showHeader={false}
            onSubmitted={onSubmitted}
          />
        </div>
      ) : (
        <QuoteBuilder
          id="quote-builder"
          sourcePage={SOURCE_PAGE}
          seed={seedDishes.length > 0 ? { dishes: seedDishes } : undefined}
          showHeader={false}
          className="!pt-0"
          onSubmitted={onSubmitted}
        />
      )}
    </div>
  );
}

/* ═══════════════════ העמוד ═══════════════════ */

export default function Menus() {
  const wa = useHeroWhatsApp();

  /* הבריף — ראו הערת המגבלה בראש הקובץ. ריק תמיד היום. */
  const [brief, setBrief] = React.useState<DishSelection[]>([]);

  const dishes = React.useMemo<DishLine[]>(
    () =>
      CATERING_DISHES.map((dish) => ({
        id: dish.id,
        nameHe: dish.nameHe,
        descriptionHe: dish.descriptionHe,
        course: dish.course,
        /* תג מקור **שכבה אחת בלבד**: רק כשיש קישור לתפריט המסעדה החי.
           אין קישור ⇒ אין תג, ולא ניסוח מרוכך (`content/dishes.ts`). */
        mark: provenanceMark(dish),
      })),
    [],
  );

  const toggleDish = React.useCallback((dish: DishLine) => {
    setBrief((prev) => {
      const exists = prev.some((d) => d.id === dish.id);
      const next = exists
        ? prev.filter((d) => d.id !== dish.id)
        : [...prev, { id: dish.id, name: dish.nameHe }];

      /* שני אירועים נפרדים ולא קריאה אחת עם שם דינמי: לכל אחד מהם
         חתימת פרמטרים משלו באיחוד הסגור של `lib/analytics.ts`. */
      if (exists) {
        track("remove_from_brief", { dish_id: dish.id, brief_size: next.length });
      } else {
        track("add_to_brief", {
          dish_id: dish.id,
          brief_size: next.length,
          source_page: SOURCE_PAGE,
        });
      }
      return next;
    });
  }, []);

  const briefIds = React.useMemo(() => brief.map((d) => d.id), [brief]);

  const showMenuSheet = dishes.length > 0;
  const showReviews = hasGoogleReviews() || hasTestimonials();
  const showGallery = hasGallery();
  const faqs = faqItems();

  /* ‎§3.1 — מקור המספור היחיד. סקשן שנשמט אינו משאיר חור ברצף, וחור
     במספור הוא האות הרועשת ביותר ל«תבנית עם חלקים חסרים». */
  const order = [
    showMenuSheet ? "menu" : null,
    "how-menu",
    "kitchen",
    showReviews ? "reviews" : null,
    showGallery ? "gallery" : null,
    "quote",
    faqs.some((f) => f.answerHe) ? "faq" : null,
  ].filter((k): k is string => k !== null);

  const num = (key: string) => {
    const i = order.indexOf(key);
    return i < 0 ? undefined : String(i + 1).padStart(2, "0");
  };

  /* שורת העובדות — גיזום ברמת הפסוקית (G5). כל אסימון ריק מוריד את
     הפסוקית שלו בלבד. הכשרות נקראת מהמשבצת דרך `kashrutClauseHe`
     ולעולם אינה נכתבת כמחרוזת קשיחה (LAW 1). */
  const kashrut = kashrutClauseHe("general");
  const facts = ["מטבח של מסעדה איטלקית פעילה", kashrut].filter(
    (c): c is string => Boolean(c),
  );

  return (
    <>
      <Head
        meta={META}
        jsonLd={[
          /* CollectionPage — הדף אוסף את המנות, הוא אינו הישות עצמה.
             `Menu` נפלט **רק** כשיש מנה אחת לפחות; `buildMenu` מחזיר
             null אחרת, ו־`offers` לא נפלט בלי מחיר חתום. */
          stripEmptyJsonLd(buildWebPage(META, { type: "CollectionPage" })),
          buildBreadcrumbList(META.breadcrumb),
          buildMenu(
            dishesByCourse().map((group) => ({
              nameHe: group.label,
              items: group.dishes.map((dish) => ({
                nameHe: dish.nameHe,
                descriptionHe: dish.descriptionHe,
              })),
            })),
          ),
          /* אותו שער בדיוק כמו הבאנד: שאלה בלי תשובה אינה נפלטת. */
          buildFaqPage(faqs),
        ]}
      />

      <OccasionIntro
        eyebrow="קייטרינג מאמאמיה · התפריטים"
        title={
          showMenuSheet ? (
            <>
              התפריטים,
              <br />
              בלי אותיות קטנות.
            </>
          ) : (
            /* ‎§3.3 רג׳יסטר "0": בלי מנות, כותרת שמבטיחה רשימה היא כותרת
               מעל כלום. הכותרת הזאת נכונה בשני המצבים ומתארת את מה שהדף
               באמת עושה. */
            <>
              התפריט נבנה
              <br />
              לאירוע שלכם.
            </>
          )
        }
        lede="קייטרינג מאמאמיה מבושל במטבח של מסעדה איטלקית פעילה. מה שיוצא ממנו לסועדים של המסעדה הוא מה שנכנס לתפריט של האירוע."
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
        {/* INV-6: קליק על וואטסאפ כותב שורת ליד, ולכן הודעת סעיף 11
            נדרשת כאן ולא רק ליד הטופס. אין להסיר אותה כדי «לנקות». */}
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

      {/* ─── הפרק הקרם: הקריאה הארוכה של העמוד, פרק אחד ולא שתי רצועות.
          ראו ההסבר בראש הקובץ ומדיניות ההחלפה ב־index.css. ─── */}
      <div data-band="cream">
        {/* 01 · מהתפריט של המסעדה. מחזיר null בעצמו כשאין מנות — התנאי
            כאן קיים רק כדי שהמספור לא יקצה ספרה לסקשן שלא יופיע. */}
        {showMenuSheet ? (
          <MenuSheet
            id="menu"
            num={num("menu")}
            dishes={dishes}
            grouping="auto"
            courseLabel={COURSE_LABEL}
            courseOrder={COURSES}
            eyebrow="מהתפריט של המסעדה"
            title="המנות"
            onAdd={toggleDish}
            addedIds={briefIds}
          />
        ) : null}

        <HowTheMenuWorks num={num("how-menu")} canPrint={hasDishes()} />

        <KitchenNote num={num("kitchen")} />
      </div>

      {showReviews ? <ReviewsSection num={num("reviews")} /> : null}
      {showGallery ? <GallerySection num={num("gallery")} /> : null}

      <BuildSection num={num("quote")} seedDishes={brief} />

      <FaqBand num={num("faq")} items={faqs} title="שאלות שנשאלות בטלפון" />

      {/* יעד חסום ב־`shared/routes.ts` פשוט אינו מרונדר — הבאנד מסנן
          בעצמו, ולכן אין כאן ‎404 ואין רשימה שנכתבת ביד. */}
      <NextSteps
        sourcePage={SOURCE_PAGE}
        title="לפי סוג האירוע"
        links={[
          {
            href: "/catering",
            titleHe: "כל סוגי האירועים",
            descriptionHe: "לאיזה אירועים אנחנו נכנסים, במקום אחד.",
          },
          {
            href: "/catering/business",
            titleHe: "קייטרינג לחברות",
            descriptionHe: "ארוחת צוות, כיבוד לישיבה ואירוע חברה.",
          },
          {
            href: "/catering/private-events",
            titleHe: "שמחות פרטיות",
            descriptionHe: "אירוע משפחתי בבית או במקום שנבחר.",
          },
          {
            href: "/catering/dairy",
            titleHe: "קייטרינג חלבי",
            descriptionHe: "תפריט חלבי איטלקי לאירוע.",
          },
        ]}
      />
    </>
  );
}
