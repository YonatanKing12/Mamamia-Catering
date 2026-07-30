/**
 * ═══════════════════════════════════════════════════════════════════════
 *  P-02 · `/menus` — התפריטים. spec 01 §4 P-02, §3.1, §3.3.
 * ═══════════════════════════════════════════════════════════════════════
 *
 * תחת TAFRIT זה הדף השני בחשיבותו באתר, והוא הדף שהכיוון קרוי על שמו.
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
 *
 * מה שנשאר הוא מה שאנחנו באמת יודעים: איך תפריט לאירוע נבנה, שהוא יוצא
 * ממטבח של מסעדה פעילה, והדרך להתחיל. **המבחן שהעמוד נבנה לעבור הוא
 * להיראות מכוון וגמור כשכל המשבצות ריקות** — כי זה המצב היום.
 *
 * ─────────────────────────────────────────────────────────────────────
 *  מה קורה ברגע ש־`DISHES` מתמלא — בלי שינוי קוד
 * ─────────────────────────────────────────────────────────────────────
 * ‎`MenuSheet` נדלק במיקום 01 ודוחף את שאר המספור למטה (המספור נקבע
 * לפי מיקום, §3.1, ולא קשיח). `grouping="auto"` מיישם לבד את ספי §3.3:
 * קיבוץ לכותרות מנה מ־8 מנות ומעלה, רשימה אחת מתחת לזה. כותרת ההירו
 * עוברת לנוסח המפרט, `Menu` נכנס ל־JSON-LD, וקישור ההדפסה מופיע.
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
import { Head } from "@/components/seo/head";
import { Button, Prose, SectionHeader } from "@/components/primitives";
import {
  FaqBand,
  KitchenNote,
  MenuSheet,
  NextSteps,
  OccasionIntro,
  QuoteCta,
  type DishLine,
  type FaqItem,
} from "@/components/bands";
import type { DishSelection } from "@/components/quote/use-quote-builder";
import { SLOTS, filled } from "@/content/business";
import {
  CATERING_DISHES,
  COURSES,
  COURSE_LABEL,
  dishesByCourse,
  hasDishes,
  provenanceMark,
} from "@/content/dishes";
import { kashrutClauseHe, resolveExtraMeta, stripEmptyJsonLd } from "@/lib/page-meta-extra";
import type { PageMetaExtra } from "@/lib/page-meta-extra";
import { buildBreadcrumbList, buildFaqPage, buildMenu, buildWebPage } from "@/lib/seo";
import { buildWaHref, captureWaIntent, newRef } from "@/lib/lead-client";
import { track } from "@/lib/analytics";

/** הרשומה קיימת תמיד ב־`page-meta-extra`; היעדרה הוא באג ולא מצב. */
const META = resolveExtraMeta("/menus") as PageMetaExtra;

const SOURCE_PAGE = "/menus";

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
 * הסקשן הייחודי של `/menus` (T-1). הוא מסביר **את התפריט**, ולא את
 * תהליך ההתקשרות — זה כבר יושב בדף הבית ואסור לו לחזור כאן במילים
 * מוחלפות.
 *
 * מה שנאמר כאן ומה שאסור היה להיאמר: אין «חבילות», אין «אין מינימום»,
 * אין טווח סועדים, אין זמן הכנה ואין אזור. כל אלה משבצות ריקות. מה
 * שכן נאמר הוא איך תפריט נבנה — תיאור תהליך, לא התחייבות מסחרית.
 */
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
          lede="המנות הן המנות של המסעדה. התפריט לאירוע מורכב מהן — לפי מספר הסועדים, לפי צורת ההגשה, ולפי מה שחשוב לכם שיהיה על השולחן."
          reveal={false}
        />

        <Prose size="body" measure="body">
          <p>
            לכן אין כאן עגלת קניות ואין תפריט קבוע להורדה. מספרים לנו על האירוע — כמה
            סועדים, מתי ובאיזה אזור — ואנחנו חוזרים עם תפריט שמתאים לו.
          </p>
        </Prose>

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
  const faqs = faqItems();

  /* ‎§3.1 — מקור המספור היחיד. סקשן שנשמט אינו משאיר חור ברצף, וחור
     במספור הוא האות הרועשת ביותר ל«תבנית עם חלקים חסרים». */
  const order = [
    showMenuSheet ? "menu" : null,
    "how-menu",
    "kitchen",
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
        lede="קייטרינג מאמאמיה מבושל במטבח של מסעדה איטלקית פעילה — מטבח שמבשל לסועדים שיושבים בו, ולא מטבח שנפתח כדי לשרת אירועים. מה שיוצא ממנו הוא מה שנכנס לתפריט של האירוע."
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

      <QuoteCta
        num={num("quote")}
        sourcePage={SOURCE_PAGE}
        seed={brief.length > 0 ? { dishes: brief } : undefined}
        lede="ארבע שאלות על האירוע, ואז פרטים ליצירת קשר. אפשר גם פשוט לכתוב בוואטסאפ."
      />

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
