/**
 * ═══════════════════════════════════════════════════════════════════════
 *  P-14 · `/catering/dairy` — קייטרינג חלבי.
 *  spec 01 §4 P-14, §3.1, §3.3, INV-2. `00-spec-review.md` §A2 גובר.
 * ═══════════════════════════════════════════════════════════════════════
 *
 * ─────────────────────────────────────────────────────────────────────
 *  הכותרת — הטענה שנמחקה, ולמה
 * ─────────────────────────────────────────────────────────────────────
 * ‎§4 P-14 מצטט `קייטרינג חלבי — אותו תקציב, שולחן עשיר יותר.`
 * ‎00-spec-review §A2 פוסל את זה: «אותו תקציב, שולחן עשיר יותר» היא טענה
 * **השוואתית על יחס מחיר־לערך**, באתר שאין בו ולו מחיר אחד ושבו
 * ‎`SLOTS.pricePerPerson` ריק מעצם הבנייה. הביקורת גוברת על המפרט.
 *
 * הטיעון החלבי עצמו **לא נמחק** — הוא ירד מהכותרת לגוף הדף, ושם הוא
 * מנוסח כעובדת קטגוריה («מטבח בנוי סביב חלב מלכתחילה») ולא
 * כטענה על התמחור שלנו. עובדת קטגוריה נכונה בלי אף משבצת מלאה; טענת
 * תמחור דורשת מחיר.
 *
 * ─────────────────────────────────────────────────────────────────────
 *  «חלבי» כאן הוא סימון תזונתי, ולא הצהרת כשרות
 * ─────────────────────────────────────────────────────────────────────
 * ‎`content/dishes.ts` מחזיק `dietary: DietaryFlag[]`, ו־`occasions.ts`
 * מגדיר את החתך של הדף כ־`requiresDietary: "dairy"`. זהו תיאור של המנה
 * ותו לא. הוא **אינו** אומר דבר על הפרדת בשרי־חלבי במטבח, על כלים, על
 * תהליך העבודה או על תעודת הכשרות — כל אלה עובדות תפעוליות שאיש לא מסר.
 *
 * ולכן, בכל הדף:
 *   · אין «מטבח חלבי», אין «הפרדה», ואין «כלים נפרדים».
 *   · טענת הכשרות היחידה עוברת דרך `kashrutClauseHe("general")`, כלומר
 *     כלשון הבעלים ב־`business.ts` ולא מילה מעבר. שם הגוף המכשיר המלא
 *     טרם נמסר ואינו מנוחש.
 *   · שאלת השאלות־ותשובות על הסימון מסבירה בדיוק את הגבול הזה, כי זו
 *     השאלה שקונה שומר כשרות באמת שואל.
 *
 * ─────────────────────────────────────────────────────────────────────
 *  היררכיית הפעולה — ראו `pages/catering.tsx`, מוחזקת כאן זהה
 * ─────────────────────────────────────────────────────────────────────
 *   1. המגדיר (`#quote`) — הענבר. מיד אחרי ההירו: הקונה מגיע מקמפיין עם
 *      כוונה קיימת, והדבר השני שהוא רואה חייב להיות המקום שבו הוא בונה
 *      את האירוע, לא טיעון על חלב. הטיעון יושב מתחת ומשרת את מי שגלל.
 *      ‎`MenuConfigurator` בולע בעצמו את בנאי ארבע השאלות, ולכן אין בדף
 *      גם מגדיר וגם `QuoteCta` — משטח אחד.
 *   2. וואטסאפ — ירוק, בהירו ובבאנד הסוגר בלבד. אין באנד וואטסאפ באמצע.
 *   3. טלפון — שורת טקסט, לא פקד שלישי (L-10).
 *
 * ─────────────────────────────────────────────────────────────────────
 *  מה נשמט היום, וזו התנהגות תקינה (INV-2)
 * ─────────────────────────────────────────────────────────────────────
 *   MenuSheet       ‎`content/dishes.ts` ריק ⇒ 0 מנות בחתך החלבי ⇒ הסקשן
 *                   אינו מרונדר. זה גם המקום שבו הדף הזה יהפוך לחזק ביותר
 *                   באתר ברגע שהמנות יימסרו: שמות מנות אמיתיים כטיפוגרפיה.
 *   ServiceFormats  ‎`offered === true` הוא אישור בעלים ואינו קיים.
 *   OpsFacts        מינימום, זמן התראה, אזור ותנאי תשלום — כולם `null`.
 *   ReviewsBlock ·  ‎`content/proof.ts` ריק ⇒ אין דירוג בהירו ואין סקשן
 *   Gallery         הוכחה. 04 §5 מזהה את מונה הביקורות כאות האמון המרכזי
 *                   בקטגוריה, ובדיוק לכן אסור להמציא אותו.
 *
 * המבחן שהדף נבנה לעבור: להיראות מכוון וגמור כשכל המשבצות ריקות.
 */

import * as React from "react";
import { useLocation } from "wouter";
import { Head } from "@/components/seo/head";
import { Num, Prose, SectionHeader } from "@/components/primitives";
import {
  FaqBand,
  KitchenNote,
  MenuSheet,
  NextSteps,
  OccasionIntro,
  OpsFacts,
  ServiceFormats,
  type DishLine,
  type FaqItem,
  type NextStepLink,
  type OpsFactRow,
  type ServiceFormatSpec,
} from "@/components/bands";
import { MenuConfigurator } from "@/components/configurator";
import { ContactBar, Gallery, ReviewsBlock } from "@/components/trust";
import { SLOTS, filled } from "@/content/business";
import { dishesForCut, provenanceMark } from "@/content/dishes";
import { cateringServiceArea } from "@/content/locations";
import { occasionById, serviceFormatsFor } from "@/content/occasions";
import { hasAnyProof } from "@/content/proof";
import { buildWaHref, captureWaIntent, newRef } from "@/lib/lead-client";
import { track } from "@/lib/analytics";
import { kashrutClauseHe, resolveExtraMeta, stripEmptyJsonLd } from "@/lib/page-meta-extra";
import type { PageMetaExtra } from "@/lib/page-meta-extra";
import { buildBreadcrumbList, buildFaqPage, buildService, buildWebPage } from "@/lib/seo";

/** הרשומה קיימת תמיד ב־`page-meta-extra`; היעדרה הוא באג ולא מצב. */
const META = resolveExtraMeta("/catering/dairy") as PageMetaExtra;

const SOURCE_PAGE = "/catering/dairy";

/** מקור יחיד לשם, לכוונה ולחתך התפריט — לא נכתבים כאן. */
const OCCASION = occasionById("dairy");

/** הטענה היחידה המותרת על מוצא האוכל, בלשון יחיד. נכתבת פעם אחת. */
const KITCHEN_FACT_HE =
"המטבח של מסעדה פעילה — מטבח שמבשל כל יום לסועדים שיושבים בו, ולא מטבח שנפתח כדי לשרת אירועים.";

/* ═══════════════════ מסלול הוואטסאפ בהירו ═══════════════════ */

/**
 * חוזה 02 §6.1–§6.3: קליטה מקדימה ואז ניווט **באותו tick**, בלי `await`
 * ובלי בדיקת תשובה. המזהה נוצר ברינדור, ולכן ה־href הסטטי נושא אותו גם
 * בלי JS, גם בלשונית חדשה וגם כשמעתיקים את הכתובת.
 *
 * ‎TODO(01 §5.7): עותק נוסף של אותו קוד. מקומו ב־`lib/whatsapp.ts
 * openWhatsApp()` — מדווח בדוח החזרה.
 */
function useHeroWhatsApp() {
  const [ref] = React.useState(() => newRef());
  const href = React.useMemo(() => buildWaHref({}, ref), [ref]);

  const onClick = React.useCallback<
    React.MouseEventHandler<HTMLButtonElement & HTMLAnchorElement>
  >(
    (e) => {
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;

      track("whatsapp_click", { wa_location: "hero", has_lead: false });
      captureWaIntent({ ref, waLocation: "hero" });
      track("whatsapp_handoff", { lead_ref: ref, wa_location: "hero" });

      /* נייד: אותה לשונית. לשונית ריקה שנשארת מאחור נקראת כאתר שבור. */
      const mobile =
        typeof navigator !== "undefined" &&
        /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
      if (mobile) {
        e.preventDefault();
        window.location.href = href;
      }
    },
    [href, ref],
  );

  return { href, onClick };
}

/* ═══════════════════ הרצועה התפעולית ═══════════════════ */

/**
 * ארבע שאלות שיש להן משבצת. כולן `null` היום ⇒ הרצועה אינה מרונדרת,
 * ואין כאן טבלת מקפים ולא «בתיאום».
 */
function opsRows(): OpsFactRow[] {
  const area = cateringServiceArea();

  return [
    {
      id: "ops-min",
      labelHe: "מינימום סועדים",
      value: filled(SLOTS.minGuests) ? <Num inline>{SLOTS.minGuests}</Num> : null,
    },
    {
      id: "ops-lead-time",
      labelHe: "כמה מראש מזמינים",
      value: filled(SLOTS.leadTime) ? SLOTS.leadTime : null,
    },
    {
      id: "ops-headcount",
      labelHe: "עד מתי מעדכנים מספר סועדים",
      value: filled(SLOTS.headcountDeadline) ? SLOTS.headcountDeadline : null,
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
  ];
}

/* ═══════════════════ המגדיר ═══════════════════ */

/**
 * ‎04 §6: המגדיר **בונה** את האירוע במקום **לבקש** הצעה בארבע שאלות. מי
 * שהשקיע דקות בבחירת מנות נוטש הרבה פחות, והליד נושא את הבחירות עצמן.
 *
 * ‎`MenuConfigurator` בולע בעצמו את המצב שאין בו מנות ומגיש במקומו את בנאי
 * ארבע השאלות — הסקשן הזה **לעולם אינו ריק**, ואין כאן שער.
 *
 * אין זריעת `eventType`: `occasions.ts` קובע `eventTypeSeed: null` לדף
 * הזה, כי חלבי הוא חתך תפריט ולא סוג אירוע — אותו קונה יכול להיות חברה,
 * שמחה או חג. תיוג שגוי גרוע מתיוג חסר (02 §1.7).
 */
function ConfiguratorSection({ num }: { num?: string }) {
  const [, navigate] = useLocation();

  return (
    <div
      id="quote"
      className="border-y border-solid border-y-[color:var(--rule)] bg-bg-form py-sec [&_.sec]:py-0 [&_.wrap]:max-w-none [&_.wrap]:px-0"
    >
      <div className="wrap">
        <SectionHeader
          num={num}
          eyebrow="בונים את האירוע"
          title="התפריט החלבי שלכם"
          lede="מספרים לנו כמה סועדים, מתי ואיפה. אנחנו חוזרים אליכם עם תפריט והצעה בכתב."
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

/* ═══════════════════ הסקשן הייחודי של הדף ═══════════════════ */

/**
 * ‎T-1: לכל דף חייב להיות בלוק שאינו קיים בשום דף אחר. הבלוק הזה נושא
 * את הטיעון שירד מה־H1 (‎§A2) — ובנוסח שהביקורת מתירה: **עובדת קטגוריה
 * על המטבח ה**, לא טענה על התמחור שלנו.
 *
 * שלוש השורות נבדקו אחת־אחת מול שאלה אחת: האם היא נכונה גם כשכל משבצת
 * באתר ריקה. אין בהן מחיר, אין השוואה, אין מספר, אין שם מנה, ואין טענה
 * על ההפרדה במטבח.
 */
const DAIRY_POINTS = [
  {
    titleHe: "מטבח בנוי סביב חלב מלכתחילה",
    bodyHe:
"בקטגוריות אחרות תפריט חלבי הוא מה שנשאר אחרי שמורידים ממנו את הבשר. במטבח זה הפוך: הגבינות, החמאה והשמנת הן העמוד שהמטבח עומד עליו, ולא תחליף למשהו.",
  },
  {
    titleHe: "שולחן חלבי מקל על שולחן מעורב",
    bodyHe:
"כשכל השולחן חלבי, נשאלת שאלה אחת פחות מול כל אורח. מי שלא אוכל בשר, מי שמקפיד על הפרדה בבית ומי שפשוט לא רעב לבשר — כולם יושבים לאותו תפריט.",
  },
  {
    titleHe: "«חלבי» כאן הוא תיאור של המנה",
    bodyHe:
"הסימון נלווה למנה עצמה, לצד השם שלה. הוא מתאר את מה שיש בצלחת, ואינו אומר דבר על סדרי העבודה במטבח או על תעודת הכשרות — לאלה יש תשובה נפרדת, ואנחנו מוסרים אותה בשיחה.",
  },
] as const;

function DairyArgument({ num }: { num?: string }) {
  return (
    <section id="dairy-argument" className="sec">
      <div className="wrap">
        <SectionHeader
          num={num}
          eyebrow="למה דווקא "
          title="חלבי הוא לא מה שנשאר"
          lede="זה הטיעון שהשוק הישראלי כבר מכיר, והוא הסיבה שהמטבח הזה נכנס לקטגוריה הזאת בצורה טבעית."
        />

        {/* כרטיסים, לא שורות ברשימה: 04 §4 קובע רדיוס 12px לכרטיס, והגבול
            הופך לענבר ב־hover — אותה שפה בדיוק של כרטיסי האירועים. */}
        <ul className="m-0 grid list-none gap-grid p-0 [grid-template-columns:repeat(auto-fit,minmax(250px,1fr))]">
          {DAIRY_POINTS.map((point, i) => (
            <li
              key={point.titleHe}
              className="m-0 rounded-card border border-solid border-[color:var(--rule)] bg-bg-alt p-card transition-colors duration-state ease-house hover:border-accent"
            >
              <span className="sec__num num">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="mt-3 text-lg font-semibold">{point.titleHe}</h3>
              <p className="mt-2 max-w-none text-xs leading-[1.6] text-fg-muted">
                {point.bodyHe}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ═══════════════════ שאלות ותשובות ═══════════════════ */

type PageFaq = FaqItem & { answerHe: string | null };

/**
 * סט ייחודי לדף (T-1): אלה השאלות שנשאלות על תפריט חלבי ולא על אירוע
 * חברה או על חג. שאלה בלי תשובה אינה מרונדרת, ואותו סינון בדיוק מזין
 * את ה־`FAQPage` — כך אי אפשר לפלוט למנוע חיפוש שאלה שאינה על המסך.
 *
 * כל תשובה כתובה כמשפט שלם שעומד בפני עצמו מחוץ להקשר. זו היחידה שמנוע
 * תשובות מצטט מילה במילה, ולכן היא נכתבת כמו ציטוט ולא כמו פסקה בדף.
 */
function faqItems(): PageFaq[] {
  return [
    {
      id: "faq-marking",
      questionHe: "מה בדיוק אומר הסימון «חלבי» כאן?",
      /* תיאור של המנגנון באתר, לא מסירת עובדה תפעולית. זה מותר, וזו
         גם השאלה שקונה שומר כשרות באמת שואל — ולכן הגבול נאמר במפורש
         במקום להישאר מרומז. */
      answerHe:
"הוא מתאר את המנה עצמה: מה שיש בה. הוא אינו הצהרה על סדרי העבודה במטבח ואינו תחליף לתעודת הכשרות — על אלה אנחנו עונים ישירות בשיחה.",
    },
    {
      id: "faq-kashrut",
      questionHe: "האם הקייטרינג החלבי כשר?",
      /* כלשון הבעלים, דרך המשבצת. לעולם לא כמחרוזת קשיחה (LAW 1). */
      answerHe: (() => {
        const k = kashrutClauseHe("general");
        return k ? `הקייטרינג ${k}.` : null;
      })(),
    },
    {
      id: "faq-who-cooks",
      questionHe: "מי מבשל את התפריט החלבי?",
      answerHe: KITCHEN_FACT_HE,
    },
    {
      id: "faq-how",
      questionHe: "איך מקבלים הצעה לתפריט חלבי?",
      answerHe:
"בונים את התפריט כאן בדף ומשאירים פרטים, או שולחים את פרטי האירוע בוואטסאפ. אנחנו חוזרים אליכם, עוברים על מספר הסועדים ועל התאריך, ושולחים הצעה בכתב.",
    },
    {
      id: "faq-mixed-table",
      questionHe: "יש אצלנו גם צמחונים וגם רגישות לגלוטן. זה בעייתי?",
      answerHe:
"לא. עוברים על זה איתכם כשבונים את התפריט, ולא ביום האירוע. ספרו לנו מראש מי לא אוכל מה.",
    },
    {
      id: "faq-lead-time",
      questionHe: "כמה זמן מראש צריך להזמין?",
      answerHe: filled(SLOTS.leadTime) ? SLOTS.leadTime : null,
    },
    {
      id: "faq-minimum",
      questionHe: "יש מינימום סועדים?",
      answerHe: filled(SLOTS.minGuests) ? `${SLOTS.minGuests} סועדים.` : null,
    },
    {
      id: "faq-includes",
      questionHe: "מה כלול בהזמנה, ומה לא?",
      answerHe: filled(SLOTS.priceIncludes)
        ? [
            SLOTS.priceIncludes.join(" · "),
            filled(SLOTS.priceExcludes) ? `לא כלול: ${SLOTS.priceExcludes.join(" · ")}` : null,
          ]
.filter(Boolean)
.join(". ")
        : null,
    },
  ];
}

/* ═══════════════════ להמשיך מכאן ═══════════════════ */

/**
 * ‎§4 P-14 מונה `/catering/holidays` (שבועות), `/menus` ו־`/quote`.
 * ‎`NextSteps` מסנן בעצמו מול `shared/routes.ts` ומול המסלול הנוכחי,
 * ולכן הרשימה כאן היא כוונה ולא הבטחה: יעד חסום אינו קיים בבאנד.
 *
 * שם החג אינו נכתב בתווית — `content/seasons.ts` טרם קיים, ואיזכור חג
 * ספציפי כאן הוא בדיוק אותה טענת יכולת פר־חג שדף החגים נמנע ממנה.
 */
const NEXT: NextStepLink[] = [
  {
    href: "/catering/holidays",
    titleHe: "ארוחת חג",
    descriptionHe: "שולחן חג לבית שמארח.",
  },
  {
    href: "/catering/private-events",
    titleHe: "שמחות פרטיות",
    descriptionHe: "אירוע משפחתי בבית או במקום שנבחר.",
  },
  { href: "/menus", titleHe: "התפריטים", descriptionHe: "מה שהמטבח מבשל, במקום אחד." },
];

/* ═══════════════════ העמוד ═══════════════════ */

export default function CateringDairy() {
  const wa = useHeroWhatsApp();

  /* החתך מ־`occasions.ts` (`requiresDietary: "dairy"`) ולא רשימה שנכתבת
     כאן. ריק היום, ולכן `MenuSheet` אינו מרונדר. */
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

  /**
   * ‎`offered` הוא אישור בעלים ומגיע מ־`config/service-formats.ts`,
   * שטרם נוצר. **אין להחליף את זה ב־`true` «כי זה הגיוני»** — כל פורמט
   * הוא הצהרה מסחרית, ו־`plated_staffed` בפרט טוען שיש מלצרים וכלי הגשה.
   */
  const formats = React.useMemo<ServiceFormatSpec[]>(
    () => serviceFormatsFor(OCCASION).map((id) => ({ id, offered: false })),
    [],
  );

  const rows = opsRows();
  const faqs = faqItems();
  const answered = faqs.filter(
    (f): f is FaqItem & { answerHe: string } => f.answerHe !== null,
  );
  const showMenuSheet = dishes.length > 0;
  const proof = hasAnyProof();

  /* ‎§3.1 — מקור המספור היחיד. סקשן שנשמט אינו משאיר חור ברצף.
     הבאנד הסוגר אינו ממוספר: הוא אינו פרק, הוא הדרך לפנות. */
  const order = [
"quote",
    showMenuSheet ? "menu" : null,
    formats.some((f) => f.offered) ? "formats" : null,
"dairy-argument",
    proof ? "proof" : null,
"kitchen",
    answered.length > 0 ? "faq" : null,
  ].filter((k): k is string => k !== null);

  const num = (key: string) => {
    const i = order.indexOf(key);
    return i < 0 ? undefined : String(i + 1).padStart(2, "0");
  };

  /* גיזום ברמת הפסוקית (G5): כל אסימון ריק מוריד את הפסוקית שלו בלבד.
     הכשרות נקראת מהמשבצת ולא נכתבת קשיח — היא ההצהרה בעלת הסיכון
     הגבוה ביותר באתר. */
  const facts = ["מטבח של מסעדה פעילה", kashrutClauseHe("general")].filter(
    (c): c is string => Boolean(c),
  );

  return (
    <>
      <Head
        meta={META}
        jsonLd={[
          stripEmptyJsonLd(buildWebPage(META)),
          /* ‎Service בלי `areaServed`: אזור החלוקה הוא משבצת ריקה, ואין
             לגזור אותו ממיקומי המסעדות. `audience: "consumer"` — הקונה
             כאן אינו בהכרח עסקי, וסימון עסקי היה תיוג שגוי. */
          stripEmptyJsonLd(
            buildService({
              path: SOURCE_PAGE,
              nameHe: OCCASION.nameHe,
              descriptionHe: META.descriptionHe,
              audience: "consumer",
            }),
          ),
          buildBreadcrumbList(META.breadcrumb),
          buildFaqPage(answered),
        ]}
      />

      <OccasionIntro
        eyebrow="קייטרינג מאמאמיה · חלבי"
        /* ‎00-spec-review §A2. אין כאן «אותו תקציב» ואין «עשיר יותר» —
           טענה השוואתית על מחיר, באתר בלי מחירים. */
        title={
          <>
            קייטרינג חלבי
            <br />
            מהמטבח של המסעדה.
          </>
        }
        lede="תפריט חלבי שהוא לא גרסה מצומצמת של תפריט אחר. אנטיפסטי, פסטות וקינוחים — זה מה שמטבח עושה ממילא, והוא נבנה לאירוע שלכם לפי מספר הסועדים ולפי אופי הערב."
        facts={facts}
        primary={{ label: "לבנות את התפריט לאירוע", href: "#quote" }}
        secondary={{
          label: "לכתוב לנו בוואטסאפ",
          variant: "wa",
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
          className="mt-3 border-s border-solid border-s-[color:var(--rule)] ps-[.9rem]"
        >
          <p>
            בלחיצה על וואטסאפ נשמרת אצלנו פנייה עם פרטי האירוע שמופיעים בהודעה.{" "}
            <a href="/privacy" className="underline underline-offset-[.22em]">
              מדיניות הפרטיות
            </a>
          </p>
        </Prose>

        {/* ‎04 §5: מונה הביקורות הוא אות האמון המרכזי בקטגוריה. ריק היום
            ⇒ הרצועה אינה מרונדרת, ואין מקום שמור שנראה כמו חור. */}
        <ReviewsBlock ratingOnly className="mt-6" />
      </OccasionIntro>

      <OpsFacts rows={rows} variant="strip" />

      {/* 01 · המגדיר, מיד אחרי ההירו. הקונה מגיע עם כוונה קיימת. */}
      <ConfiguratorSection num={num("quote")} />

      {/* גיליון התפריט בחתך החלבי — הקריאה הארוכה של הדף, ולכן על קרם
          (מדיניות ההחלפה ב־`index.css`). ריק היום ⇒ אינו מרונדר, ואין
          מעטפת ריקה שנשארת מאחור. */}
      {showMenuSheet ? (
        <div data-band="cream">
          <MenuSheet
            id="menu"
            num={num("menu")}
            dishes={dishes}
            title="החתך החלבי מהתפריט"
            lede="המנות הן המנות של המסעדה. מה שמסומן חלבי כאן הוא מה שנכנס לתפריט של אירוע חלבי."
          />
        </div>
      ) : null}

      <ServiceFormats
        id="formats"
        num={num("formats")}
        formats={formats}
        sourcePage={SOURCE_PAGE}
        title="איך זה מגיע אליכם"
      />

      <DairyArgument num={num("dairy-argument")} />

      {/* ‎`content/proof.ts` ריק ⇒ אין סקשן. אין ריבוע אפור ואין «בקרוב». */}
      {proof ? (
        <section id="proof" className="sec sec--alt">
          <div className="wrap">
            <SectionHeader num={num("proof")} eyebrow="מה אומרים" title="לקוחות שכבר הזמינו" />
            <ReviewsBlock className="mt-2" />
            <Gallery className="mt-10" columns={3} />
          </div>
        </section>
      ) : null}

      <KitchenNote num={num("kitchen")} />

      {answered.length > 0 ? (
        <div data-band="cream">
          <FaqBand
            id="faq"
            num={num("faq")}
            items={faqs}
            eyebrow="לפני שמזמינים"
            title="שאלות שנשאלות על תפריט חלבי"
            lede="ומה שאין עליו תשובה כאן — שאלו אותנו ישירות."
          />
        </div>
      ) : null}

      {/* ═══ הבאנד הסוגר ═══
          אותם שלושה ערוצים של ההירו, באותו סדר, בלי לבקש דבר חדש. */}
      <section id="contact" className="sec sec--alt">
        <div className="wrap">
          <SectionHeader
            eyebrow="לסגור את האירוע"
            title="נבנה לכם תפריט חלבי"
            lede="ספרו לנו כמה סועדים ומתי, ונחזור אליכם עם תפריט והצעה בכתב."
          />

          <ContactBar
            waLocation="footer"
            primary="whatsapp"
            quoteHref="#quote"
            labels={{ quote: "לבנות את התפריט" }}
            callLocation="footer"
            framed={false}
          />
        </div>
      </section>

      <NextSteps sourcePage={SOURCE_PAGE} links={NEXT} />
    </>
  );
}
