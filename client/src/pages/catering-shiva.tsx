/**
 * ═══════════════════════════════════════════════════════════════════════
 *  P-11 · `/catering/shiva` — אוכל לשבעה ולאזכרה.
 *  רג׳יסטר תפעולי · שער קשיח. spec 01 §4 P-11, §3.1, §3.3, INV-2.
 * ═══════════════════════════════════════════════════════════════════════
 *
 * זהו העמוד העדין ביותר באתר, ולכן הוא גם היחיד שכל כלל בו כתוב כאיסור.
 * מי שנוחת כאן מארגן אוכל לבית אבלים היום. הוא לא «מתעניין», הוא לא
 * «משווה ספקים», והוא לא יקרא עמוד. ארבע מסקנות, וכולן מבניות:
 *
 *   1. **הטלפון הוא הפקד הממולא.** `shared/routes.ts` מסמן את המסלול
 *      `ctaMode: "phone"`, וה־CTA הראשי בהירו הוא `tel:` ולא עוגן לטופס.
 *      זו ההיפוך היחיד מהיררכיית ההמרה של ארבעת הדפים האחרים שבבעלותי,
 *      והוא מכוון: שם הענבר מוביל לבנאי, כאן הענבר מוביל לחיוג.
 *   2. **אין בנאי הצעה בעמוד.** §4 P-11 מפורש: «No builder, no estimate,
 *      no tasting band, no PastEvents, no upsell, no cross-sell, no
 *      marketing-consent checkbox». `shared/routes.ts` מצהיר בהתאם
 *      `hasBuilder: false`. טופס בן חמישה שלבים בבית אבלים הוא הכלי הלא
 *      נכון, והוא מה שהופך רגע אנושי לתהליך מכירה. מי שבכל זאת מעדיף
 *      לכתוב פרטים מקבל **קישור טקסט** ל־`/quote` — עמוד נפרד שהוא בוחר
 *      להיכנס אליו, לא טופס שנפרס עליו כאן.
 *   3. **אין רצועת המשך ואין שכבת שיווק.** `OccasionGrid`, `Gallery`,
 *      `ReviewsBlock` ו־`NextSteps` אינם מרונדרים כאן בשום מצב. «מה עוד
 *      יוצא מהמטבח» בעמוד הזה הוא אפסייל, ומונה ביקורות בבית אבלים הוא
 *      פרסום. אלה הרווח הקטן ביותר והנזק הגדול ביותר באתר.
 *   4. **הענבר הוא מבטא, לא חגיגה.** אין כאן פס צבע, אין כרטיסים ממוספרים
 *      ואין תג שנראה כמו מדבקת מבצע. הענבר יושב על פקד החיוג, על נקודת
 *      הכשרות ועל הקישור — ולא במקום נוסף.
 *
 * ─────────────────────────────────────────────────────────────────────
 *  אוצר המילים — נבדק מילה במילה
 * ─────────────────────────────────────────────────────────────────────
 * אין בעמוד הזה `אירוע`, `חוויה`, `לחגוג`, `שמחה`, `חבילה`, `מבצע`,
 * `מחיר` ו־`הזדמנות`. גם לא בתוך תווית של פקד, גם לא ב־aria, וגם לא
 * בטקסט שנשלח לוואטסאפ. `OccasionIntro` נקרא כאן על שם הקומפוננטה ולא
 * על שם מה שהיא מתארת.
 *
 * ואין כאן **טענת מהירות**: לא «אותו יום», לא «תוך שעתיים» ולא «מיידי».
 * `SLOTS.sameDayCutoff` ו־`SLOTS.responseTime` ריקים, והקלאסטר הזה הוא
 * המקום היחיד באתר שבו הבטחה כזאת שלא תעמוד היא כשל מוניטין בלי דרך חזרה.
 *
 * ─────────────────────────────────────────────────────────────────────
 *  הכשרות — למה יש כאן טענה בכלל, ומדוע רק זו
 * ─────────────────────────────────────────────────────────────────────
 * כל תוצאה מתחרה בקלאסטר הזה נפתחת ב־`בד״ץ` / `למהדרין` / `גלאט`, ותנועה
 * שמגיעה לכאן נושאת כוונת כשרות. הלקוח אישר «כשרות בד״ץ, חלה על כולן»
 * (30 ביולי 2026), וזו העובדה שמאפשרת לעמוד להתקיים.
 *
 * מה שנכתב בעמוד הוא **בדיוק מה ש־`business.ts` מחזיק ולא מילה מעבר**:
 * `KashrutBadge` מצטט את המשבצת ואינו מנסח, ו־`kashrutClauseHe("general")`
 * מזין את תשובת השאלה. שם הגוף המכשיר המלא (איזה בד״ץ) טרם נמסר, ולכן
 * אינו נכתב, אינו מנוחש ואינו מרומז. ברגע ש־`CATERING_KASHRUT_STATEMENT`
 * יימסר, הנוסח בכתב גובר מאליו בשתי הקריאות.
 *
 * ─────────────────────────────────────────────────────────────────────
 *  מה נשמט היום, וזו התנהגות תקינה
 * ─────────────────────────────────────────────────────────────────────
 *   OpsFacts    זמן התראה, אזור חלוקה, מינימום ושעות מענה — כולם `null`
 *               ⇒ הרצועה אינה מרונדרת. אין «בתיאום» ואין טבלת מקפים.
 *   MenuSheet   `content/dishes.ts` ריק ⇒ 0 מנות בחתך ⇒ הסקשן אינו מרונדר.
 *   FAQPage     §4 P-11: הצומת נפלט **רק** כשכל תשובה מלאה. היום שתיים
 *               מתוך חמש ⇒ הבאנד מרונדר, הצומת לא.
 *
 * ─────────────────────────────────────────────────────────────────────
 *  פס ה־CTA הדביק
 * ─────────────────────────────────────────────────────────────────────
 * `stickyBar: "none"` (`shared/routes.ts`). הפס מגיע מ־`PageShell` דרך
 * `RouteDef` ולא מכאן. כפתור «הצעה» קבוע בתחתית המסך בעמוד הזה הוא בדיוק
 * הכשל הטונלי שהמסלול נבנה כדי למנוע.
 */

import * as React from "react";
import { Link } from "wouter";
import { Head } from "@/components/seo/head";
import { Num, SectionHeader } from "@/components/primitives";
import {
  FaqBand,
  MenuSheet,
  OccasionIntro,
  OpsFacts,
  type DishLine,
  type FaqItem,
  type OpsFactRow,
} from "@/components/bands";
import { ContactBar, KashrutBadge, hasKashrutWording } from "@/components/trust";
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
 * חמש שאלות, בסדר שבו הן נשאלות בטלפון בפועל. שאלה בלי תשובה אינה
 * מרונדרת — ולכן אין כאן ולו ניסוח «סביר» אחד שאיש לא אישר.
 *
 * «איך מזמינים» היא היחידה שנכתבת כאן במלואה, והיא מותרת כי היא מתארת
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
     * TODO(owner): «מגיעים גם כלים חד־פעמיים?» היא השאלה שנשאלת כאן
     * בטלפון ואין לה משבצת ב־`business.ts`. היא **לא** נרשמת כאן עם תשובה
     * `null` קבועה: פריט שלעולם לא יתמלא היה מונע לצמיתות מ־`FAQPage`
     * להיפלט (§4 P-11 דורש שכל תשובה תהיה מלאה). כשתיווצר המשבצת —
     * מוסיפים כאן פריט שקורא ממנה, בדיוק כמו השאר.
     */
  ];
}

/* ═══════════════════ הרצועה התפעולית ═══════════════════ */

/**
 * §4 P-11: זמן התראה · אזור חלוקה · מינימום · שעות מענה. כל שורה נגזמת
 * לחוד, וכולן ריקות ⇒ אין רצועה (G12).
 *
 * «חלון משלוח» ו«שעת חיתום» אינם ברשימה: אין להם משבצת, ושורה שנכתבת
 * בלי משבצת היא הבטחת מהירות. `staffedHours` נכנס במקומם — הוא השאלה
 * התפעולית הנוספת היחידה שנשאלת כאן בפועל («עד מתי אפשר להתקשר»).
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
      value: area
        ? area.citiesHe.length > 0
          ? area.citiesHe.join(" · ")
          : area.descriptionHe
        : null,
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
  /* §4 P-11: `FAQPage` נפלט **רק** כשכל תשובה מלאה. חלקית ⇒ אין צומת. */
  const faqComplete = answered.length === faqs.length;

  const showMenuSheet = dishes.length > 0;

  /* §3.1 — המספור נקבע לפי מיקום. הרצועה התפעולית ובלוק יצירת הקשר אינם
     ממוספרים: הם אינם פרקים בגיליון, הם הדרך לפנות. */
  const order = [
    showMenuSheet ? "menu" : null,
    answered.length > 0 ? "faq" : null,
  ].filter((k): k is string => k !== null);

  const num = (key: string) => {
    const i = order.indexOf(key);
    return i < 0 ? undefined : String(i + 1).padStart(2, "0");
  };

  /* שתי פסוקיות בלבד, וכל אחת נגזמת לחוד (G5). זה מה שקונה כאן אמון:
     מטבח אמיתי, וכשרות. שום דבר נוסף לא שייך לשורה הזאת. `KashrutBadge`
     מצטט את המשבצת — הגלולה היא מסגרת ולא מילוי, ולכן היא קריאה כהצהרה
     ולא כתג מבצע. */
  const facts: React.ReactNode[] = [
    hasKashrutWording() ? <KashrutBadge key="kashrut" variant="pill" /> : null,
    "מטבח של מסעדה איטלקית פעילה",
  ].filter(Boolean);

  return (
    <>
      <Head
        meta={META}
        jsonLd={[
          stripEmptyJsonLd(buildWebPage(META)),
          /* Service בלי `areaServed`: אזור החלוקה הוא משבצת ריקה, ואין
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
        /* `ctaMode: "phone"` — הפקד הממולא הוא המספר עצמו, ולא עוגן לטופס.
           `showPhone={false}` מכבה את שורת הטלפון שמתחת: הטלפון כבר כאן,
           ושכפול שלו הוא רעש (L-10). */
        primary={{
          label: (
            <>
              התקשרו <Num>{PHONE.display}</Num>
            </>
          ),
          href: telLink(),
          /* בלי `data-tel`: `CtaSpec` הוא אובייקט מוטפס ולא תגית JSX,
             ובדיקת המאפיינים העודפים פוסלת מאפיין שאינו בטיפוס. הבקשה
             להוסיף אותו ל־`ButtonProps` מדווחת; הקליק מקוטלג בלעדיו. */
          onClick: () => capturePhoneClick({ callLocation: "hero" }),
        }}
        showPhone={false}
        callLocation="hero"
      />

      <OpsFacts id="ops" rows={rows} variant="strip" />

      {/* המסלול השני, ומיד מתחת להירו: הדרך לפנות חייבת להישאר קצרה.
          `ContactBar` נושא בעצמו את הודעת סעיף 11 (INV-6), ואת המספר
          כטקסט קריא ולא ככפתור. `showQuote={false}` — אין בנאי בעמוד הזה,
          וכפתור «הצעה» כאן הוא בדיוק מה ש־§4 P-11 אוסר. */}
      <section id="contact" className="sec sec--tight">
        <div className="wrap">
          <SectionHeader
            title="לדבר איתנו"
            lede="אם קל יותר לכתוב מאשר לדבר, אפשר בוואטסאפ ואנחנו נחזור אליכם."
          />
          <ContactBar
            waLocation="shiva"
            callLocation="contact"
            showQuote={false}
            labels={{ wa: "כתבו לנו בוואטסאפ", phoneLead: "או בטלפון" }}
          />
        </div>
      </section>

      {/* המסלול השלישי, כקישור טקסט ולא כטופס. §4 P-11 אוסר בנאי **בעמוד
          הזה**; `/quote` הוא עמוד נפרד שהמבקר בוחר להיכנס אליו, וזו הבחירה
          שלו. אין כאן כפתור, אין תיבת הסכמה שיווקית, ואין הערכת מחיר. */}
      <section className="sec sec--tight">
        <div className="wrap">
          <p className="m-0 max-w-body text-xs text-fg-subtle">
            מעדיפים לכתוב את הפרטים ולא לדבר עכשיו?{" "}
            <Link
              href="/quote"
              className="text-fg underline decoration-rule underline-offset-[.22em] hover:text-accent hover:decoration-accent"
            >
              אפשר להשאיר אותם כאן
            </Link>
            , ואנחנו נחזור אליכם.
          </p>
        </div>
      </section>

      {/* 01 · רשימה אחת וקצרה. בלי מחירים ובלי «הוסיפו לתפריט שלי»:
          §4 P-11 מסיר את שניהם, ו־`onAdd` פשוט אינו מועבר. */}
      <MenuSheet
        id="menu"
        num={num("menu")}
        dishes={dishes}
        grouping="flat"
        title="מה יוצא מהמטבח"
      />

      {/* 02 · שאלות שנשאלות בטלפון, על קרקע קרמית — הקריאה הארוכה של
          העמוד, ובקלאסטר הזה גם הקרקע הרכה מבין השתיים. הענבר נגזר שם
          מחדש ל־`--amber-ink` בלי שהקוד כאן יודע על כך דבר. */}
      {answered.length > 0 ? (
        <div data-band="cream">
          <FaqBand id="faq" num={num("faq")} items={faqs} title="שאלות שנשאלות בטלפון" />
        </div>
      ) : null}
    </>
  );
}
