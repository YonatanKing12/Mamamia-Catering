/**
 * ═══════════════════════════════════════════════════════════════════════
 *  P-11 · `/catering/shiva` — אוכל לשבעה ולאזכרה.
 *  רג׳יסטר תפעולי · שער קשיח. spec 01 §4 P-11, §3.1, §3.3, INV-2.
 * ═══════════════════════════════════════════════════════════════════════
 *
 * זהו העמוד העדין ביותר באתר, ולכן הוא גם היחיד שכל כלל בו כתוב כאיסור.
 * מי שנוחת כאן מארגן אוכל לבית אבלים היום. הוא לא «מתעניין», הוא לא
 * «משווה ספקים», והוא לא יקרא עמוד. שלוש מסקנות, וכולן מבניות:
 *
 *   1. **הטלפון הוא הפקד הממולא.** ‎`shared/routes.ts` מסמן את המסלול
 *      ‎`ctaMode: "phone"`, וה־CTA הראשי בהירו הוא `tel:` ולא עוגן לטופס.
 *   2. **אין בנאי הצעה בעמוד.** ‎§4 P-11 מפורש: «No builder, no estimate,
 *      no tasting band, no PastEvents, no upsell, no cross-sell, no
 *      marketing-consent checkbox». ‎`shared/routes.ts` מצהיר בהתאם
 *      ‎`hasBuilder: false`. טופס בן חמישה שלבים בבית אבלים הוא הכלי הלא
 *      נכון, והוא גם מה שהופך רגע אנושי לתהליך מכירה.
 *   3. **אין רצועת המשך.** ‎`NextSteps` אינו מרונדר כאן בשום מצב —
 *      «מה עוד יוצא מהמטבח» בעמוד הזה הוא אפסייל, וזו בדיוק המילה
 *      שהמפרט אוסר.
 *
 * ─────────────────────────────────────────────────────────────────────
 *  אוצר המילים — נבדק מילה במילה
 * ─────────────────────────────────────────────────────────────────────
 * אין בעמוד הזה `אירוע`, `חוויה`, `לחגוג`, `שמחה`, `חבילה`, `מבצע`,
 * `מחיר` ו־`הזדמנות`. גם לא בתוך תווית של פקד, גם לא ב־aria, וגם לא
 * בטקסט שנשלח לוואטסאפ. `OccasionIntro` נקרא כאן על שם הקומפוננטה
 * ולא על שם מה שהיא מתארת.
 *
 * ואין כאן **טענת מהירות**: לא «אותו יום», לא «תוך שעתיים» ולא «מיידי».
 * ‎`SLOTS.sameDayCutoff` ו־`SLOTS.responseTime` ריקים, והקלאסטר הזה הוא
 * המקום היחיד באתר שבו הבטחה כזאת שלא תעמוד היא כשל מוניטין בלי דרך חזרה.
 *
 * ─────────────────────────────────────────────────────────────────────
 *  הכשרות — למה יש כאן טענה בכלל, ומדוע רק זו
 * ─────────────────────────────────────────────────────────────────────
 * כל תוצאה מתחרה בקלאסטר הזה נפתחת ב־`בד״ץ` / `למהדרין` / `גלאט`, ותנועה
 * שמגיעה לכאן נושאת כוונת כשרות. הלקוח אישר «כשרות בד״ץ, חלה על כולן»
 * ‎(30 ביולי 2026), וזו העובדה שמאפשרת לעמוד להתקיים.
 *
 * מה שנכתב בעמוד הוא **בדיוק מה ש־`business.ts` מחזיק ולא מילה מעבר**,
 * דרך `kashrutClauseHe("general")` — לעולם לא כמחרוזת קשיחה (LAW 1).
 * שם הגוף המכשיר המלא (איזה בד״ץ) טרם נמסר, ולכן הוא אינו נכתב, אינו
 * מנוחש ואינו מרומז. ברגע ש־`CATERING_KASHRUT_STATEMENT` יימסר, הנוסח
 * בכתב גובר מאליו באותה קריאה בדיוק.
 *
 * ─────────────────────────────────────────────────────────────────────
 *  מה נשמט היום, וזו התנהגות תקינה
 * ─────────────────────────────────────────────────────────────────────
 *   OpsFacts    זמן התראה, אזור חלוקה, מינימום ושעות מענה — כולם `null`
 *               ⇒ הרצועה אינה מרונדרת. אין «בתיאום» ואין טבלת מקפים.
 *   MenuSheet   ‎`content/dishes.ts` ריק ⇒ 0 מנות בחתך `platters` +
 *               `antipasti` ⇒ הסקשן אינו מרונדר (‎§3.3 שורת "0").
 *   FAQPage     ‎§4 P-11: הצומת נפלט **רק** כשכל תשובה מלאה. היום שתיים
 *               מתוך שש ⇒ הבאנד מרונדר, הצומת לא.
 *
 * ─────────────────────────────────────────────────────────────────────
 *  פס ה־CTA הדביק
 * ─────────────────────────────────────────────────────────────────────
 * ‎`stickyBar: "none"` (‎`shared/routes.ts`, לפי 00-spec-review B3, שגובר
 * על ‎01 §2). הפס מגיע מ־`PageShell` דרך `RouteDef` ולא מכאן. כפתור
 * «הצעה» קבוע בתחתית המסך בעמוד הזה הוא בדיוק הכשל הטונלי שהמסלול נבנה
 * כדי למנוע.
 */

import * as React from "react";
import { Link } from "wouter";
import { Head } from "@/components/seo/head";
import { Num } from "@/components/primitives";
import {
  FaqBand,
  MenuSheet,
  OccasionIntro,
  OpsFacts,
  WhatsAppBand,
  type DishLine,
  type FaqItem,
  type OpsFactRow,
} from "@/components/bands";
import { PHONE, SLOTS, filled, telLink } from "@/content/business";
import { dishesForCut, provenanceMark } from "@/content/dishes";
import { cateringServiceArea } from "@/content/locations";
import { occasionById } from "@/content/occasions";
import { kashrutClauseHe, resolveExtraMeta, stripEmptyJsonLd } from "@/lib/page-meta-extra";
import type { PageMetaExtra } from "@/lib/page-meta-extra";
import { buildBreadcrumbList, buildFaqPage, buildService, buildWebPage } from "@/lib/seo";
import { capturePhoneClick } from "@/lib/lead-client";

/** הרשומה קיימת תמיד ב־`page-meta-extra`; היעדרה הוא באג ולא מצב. */
const META = resolveExtraMeta("/catering/shiva") as PageMetaExtra;

const SOURCE_PAGE = "/catering/shiva";

/** מקור יחיד לשם, לכוונה ולחתך התפריט — לא נכתבים כאן. */
const OCCASION = occasionById("shiva");

/* ═══════════════════ שאלות ותשובות ═══════════════════ */

type PageFaq = FaqItem & { answerHe: string | null };

/**
 * שש שאלות, בסדר שבו הן נשאלות בטלפון בפועל. שאלה בלי תשובה אינה
 * מרונדרת (‎§7.16) — ולכן אין כאן ולו ניסוח «סביר» אחד שאיש לא אישר.
 *
 * ‎«איך מזמינים» היא היחידה שנכתבת כאן במלואה, והיא מותרת כי היא מתארת
 * **תהליך** ואינה מוסרת עובדה: אין בה שעה, אין מספר, אין אזור ואין
 * התחייבות זמן.
 */
function faqItems(): PageFaq[] {
  const area = cateringServiceArea();

  return [
    {
      id: "faq-kashrut",
      questionHe: "האם האוכל כשר?",
      /* כלשון הבעלים, דרך המשבצת. שם הגוף המכשיר המלא טרם נמסר ואינו
         מושלם כאן בניחוש — ראו את הבלוק בראש הקובץ. */
      answerHe: kashrutClauseHe("general"),
    },
    {
      id: "faq-how",
      questionHe: "איך מזמינים?",
      answerHe:
        "בטלפון. אומרים לכמה אנשים, לאיזו כתובת ולאיזה יום, ואנחנו חוזרים עם מה שהמטבח יכול להוציא. אין טופס למלא.",
    },
    {
      id: "faq-lead-time",
      questionHe: "כמה זמן מראש צריך להודיע?",
      answerHe: filled(SLOTS.leadTime) ? SLOTS.leadTime : null,
    },
    {
      id: "faq-area",
      questionHe: "לאן מגיעים?",
      answerHe: area
        ? area.citiesHe.length > 0
          ? area.citiesHe.join(" · ")
          : area.descriptionHe
        : null,
    },
    {
      id: "faq-includes",
      questionHe: "מה כלול במשלוח?",
      answerHe: filled(SLOTS.priceIncludes) ? SLOTS.priceIncludes.join(" · ") : null,
    },
    /*
     * TODO(owner): «מגיעים גם כלים חד־פעמיים?» היא השאלה החמישית שנשאלת
     * כאן בטלפון, ואין לה משבצת ב־`business.ts`. היא **לא** נרשמת כאן עם
     * תשובה `null` קבועה: פריט שלעולם לא יתמלא היה מונע לצמיתות מ־`FAQPage`
     * להיפלט (‎§4 P-11 דורש שכל תשובה תהיה מלאה). כשתיווצר המשבצת —
     * מוסיפים כאן פריט שקורא ממנה, בדיוק כמו השאר.
     */
  ];
}

/* ═══════════════════ הרצועה התפעולית ═══════════════════ */

/**
 * ‎§4 P-11: זמן התראה · חלון משלוח · אזור חלוקה · מינימום. כל שורה
 * נגזמת לחוד, וכולן ריקות ⇒ אין רצועה (G12 / §7.12).
 *
 * ‎«חלון משלוח» ו«שעת חיתום» אינם ברשימה: אין להם משבצת, ושורה שנכתבת
 * בלי משבצת היא הבטחת מהירות. `staffedHours` נכנס במקומם — הוא השאלה
 * התפעולית היחידה הנוספת שנשאלת כאן בפועל («עד מתי אפשר להתקשר»).
 */
function opsRows(): OpsFactRow[] {
  const area = cateringServiceArea();

  return [
    {
      id: "ops-lead-time",
      labelHe: "כמה מראש",
      value: filled(SLOTS.leadTime) ? SLOTS.leadTime : null,
    },
    {
      id: "ops-area",
      labelHe: "לאן מגיעים",
      value: area ? (area.citiesHe.length > 0 ? area.citiesHe.join(" · ") : area.descriptionHe) : null,
    },
    {
      id: "ops-min",
      labelHe: "מינימום",
      value: filled(SLOTS.minGuests) ? (
        <>
          מ־<Num inline>{SLOTS.minGuests}</Num> מנות
        </>
      ) : null,
    },
    {
      id: "ops-hours",
      labelHe: "שעות מענה",
      value: filled(SLOTS.staffedHours) ? SLOTS.staffedHours : null,
    },
  ];
}

/* ═══════════════════ העמוד ═══════════════════ */

export default function CateringShiva() {
  /* החתך מ־`occasions.ts` ולא רשימה שנכתבת כאן. ריק היום. */
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

  const faqs = faqItems();
  const rows = opsRows();

  const answered = faqs.filter((f) => f.answerHe);
  /* ‎§4 P-11: `FAQPage` נפלט **רק** כשכל תשובה מלאה. חלקית ⇒ אין צומת. */
  const faqComplete = answered.length === faqs.length;

  const showMenuSheet = dishes.length > 0;

  /* ‎§3.1 — המספור נקבע לפי מיקום. הרצועה התפעולית ובלוק יצירת הקשר
     אינם ממוספרים: הם אינם פרקים בגיליון, הם הדרך לפנות. */
  const order = [
    showMenuSheet ? "menu" : null,
    answered.length > 0 ? "faq" : null,
  ].filter((k): k is string => k !== null);

  const num = (key: string) => {
    const i = order.indexOf(key);
    return i < 0 ? undefined : String(i + 1).padStart(2, "0");
  };

  /* שתי פסוקיות בלבד, וכל אחת נגזמת לחוד (G5). זה מה שקונה כאן אמון:
     מטבח אמיתי, וכשרות. שום דבר נוסף לא שייך לשורה הזאת. */
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
          /* ‎Service בלי `areaServed`: אזור החלוקה הוא משבצת ריקה, ואין
             לגזור אותו ממיקומי המסעדות. בלי `audience` — קהל היעד כאן
             אינו קטגוריה מסחרית. */
          stripEmptyJsonLd(
            buildService({
              path: SOURCE_PAGE,
              nameHe: OCCASION.nameHe,
              descriptionHe: META.descriptionHe,
            }),
          ),
          buildBreadcrumbList(META.breadcrumb),
          faqComplete ? buildFaqPage(faqs) : null,
        ]}
      />

      <OccasionIntro
        eyebrow="קייטרינג מאמאמיה · שבעה ואזכרה"
        title={
          <>
            אוכל לשבעה.
            <br />
            אנחנו מסתדרים,
            <br />
            אתם לא צריכים.
          </>
        }
        lede="מתקשרים, אומרים כמה אנשים ולאיזו כתובת, ואנחנו מסדרים את השאר. האוכל מבושל במטבח של המסעדה."
        facts={facts}
        /* ‎ctaMode "phone": הפקד הממולא הוא המספר עצמו, ולא עוגן לטופס.
           ‎`showPhone={false}` מכבה את שורת הטלפון שמתחת — הטלפון כבר כאן,
           ושכפול שלו הוא רעש (‎§7.8 L-10). */
        primary={{
          label: (
            <>
              התקשרו <Num>{PHONE.display}</Num>
            </>
          ),
          href: telLink(),
          /* בלי `data-tel`: `CtaSpec` הוא אובייקט מוטפס ולא תגית JSX,
             ובדיקת המאפיינים העודפים פוסלת מאפיין שאינו בטיפוס. הסימון
             הזה חוזר בכל האתר כווו של סריקה — מדווח בדוח החזרה כבקשה
             להוסיף אותו ל־`ButtonProps`. הקליק מקוטלג בלעדיו. */
          onClick: () => capturePhoneClick({ callLocation: "hero" }),
        }}
        showPhone={false}
        callLocation="hero"
      />

      <OpsFacts rows={rows} variant="strip" />

      {/* מסלול הוואטסאפ — הבאנד היחיד בעמוד שקולט ליד, ולכן הודעת סעיף 11
          יושבת בו פעם אחת ולא פעמיים. `WhatsAppBand` נושא אותה בעצמו.
          יושב מיד אחרי ההירו: כשיימסרו מנות, `MenuSheet` ידחוף אותו למטה
          אם הוא יעבור אחריו, והדרך לפנות חייבת להישאר קצרה. */}
      <WhatsAppBand
        id="contact"
        waLocation="shiva"
        callLocation="contact"
        title="לדבר איתנו"
        lede="אם קל יותר לכתוב מאשר לדבר — אפשר בוואטסאפ, ואנחנו נחזור אליכם."
        labelHe="כתבו לנו בוואטסאפ"
        phoneLeadHe="או בטלפון"
      />

      {/* המסלול השלישי, כקישור טקסט ולא כטופס. ‎§4 P-11 אוסר בנאי **בעמוד
          הזה**; `/quote` הוא עמוד נפרד שהמבקר בוחר להיכנס אליו, וזו הבחירה
          שלו. אין כאן כפתור, אין תיבת הסכמה שיווקית, ואין הערכת מחיר. */}
      <section className="sec sec--tight">
        <div className="wrap">
          <p className="m-0 max-w-body text-xs text-fg-subtle">
            מעדיפים לכתוב את הפרטים ולא לדבר עכשיו?{" "}
            <Link
              href="/quote"
              className="text-fg underline underline-offset-[.22em] hover:text-accent"
            >
              אפשר להשאיר אותם כאן
            </Link>
            , ואנחנו נחזור אליכם.
          </p>
        </div>
      </section>

      {/* 01 · רשימה אחת וקצרה. בלי מחירים ובלי «הוסיפו לתפריט שלי»:
          ‎§4 P-11 מסיר את שניהם, ו־`onAdd` פשוט אינו מועבר. */}
      <MenuSheet
        id="menu"
        num={num("menu")}
        dishes={dishes}
        grouping="flat"
        title="מה יוצא מהמטבח"
      />

      {/* 02 · שאלות שנשאלות בטלפון. שתי תשובות היום; השאר נדלקות מאליהן. */}
      <FaqBand id="faq" num={num("faq")} items={faqs} title="שאלות שנשאלות בטלפון" />
    </>
  );
}
