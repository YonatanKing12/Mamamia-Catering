/**
 * ═══════════════════════════════════════════════════════════════════════
 *  P-14 · `/catering/dairy` — קייטרינג חלבי איטלקי.
 *  spec 01 §4 P-14, §3.1, §3.3, INV-2. `00-spec-review.md` §A2 גובר.
 * ═══════════════════════════════════════════════════════════════════════
 *
 * ─────────────────────────────────────────────────────────────────────
 *  הכותרת — הטענה שנמחקה, ולמה
 * ─────────────────────────────────────────────────────────────────────
 * ‎§4 P-14 מצטט `קייטרינג חלבי איטלקי — אותו תקציב, שולחן עשיר יותר.`
 * ‎00-spec-review §A2 פוסל את זה: «אותו תקציב, שולחן עשיר יותר» היא טענה
 * **השוואתית על יחס מחיר־לערך**, באתר שאין בו ולו מחיר אחד ושבו
 * ‎`SLOTS.pricePerPerson` ריק מעצם הבנייה. הביקורת גוברת על המפרט, וה־H1
 * כאן הוא הנוסח שהיא קובעת: `קייטרינג חלבי איטלקי — מהמטבח של המסעדה.`
 *
 * הטיעון החלבי עצמו **לא נמחק** — הוא ירד מהכותרת לגוף הדף, ושם הוא
 * מנוסח כעובדת קטגוריה («מטבח איטלקי בנוי סביב חלב מלכתחילה») ולא
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
 *  מה נשמט היום, וזו התנהגות תקינה (INV-2)
 * ─────────────────────────────────────────────────────────────────────
 *   MenuSheet       ‎`content/dishes.ts` ריק ⇒ 0 מנות בחתך החלבי ⇒ הסקשן
 *                   אינו מרונדר (‎§3.3 שורת "0"), והדף עובר לרג׳יסטר
 *                   התפעולי. זה גם המקום שבו הדף הזה יהפוך לחזק ביותר
 *                   באתר ברגע שהמנות יימסרו: שמות מנות אמיתיים כטיפוגרפיה.
 *   ServiceFormats  ‎`offered === true` הוא אישור בעלים, ו־
 *                   ‎`config/service-formats.ts` טרם נוצר. אף פורמט אינו
 *                   מאושר ⇒ הבאנד מחזיר null, והדף אינו אומר «מלצרים».
 *   OpsFacts        מינימום, זמן התראה, אזור ותנאי תשלום — כולם `null`.
 *   FaqBand         נדלק חלקית: מה שיש לו תשובה מרונדר, השאר לא.
 *
 * המבחן שהדף נבנה לעבור: להיראות מכוון וגמור כשכל המשבצות ריקות.
 */

import * as React from "react";
import { Head } from "@/components/seo/head";
import { Num, Prose, SectionHeader } from "@/components/primitives";
import {
  FaqBand,
  KitchenNote,
  MenuSheet,
  NextSteps,
  OccasionIntro,
  OpsFacts,
  QuoteCta,
  ServiceFormats,
  WhatsAppBand,
  type DishLine,
  type FaqItem,
  type NextStepLink,
  type OpsFactRow,
  type ServiceFormatSpec,
} from "@/components/bands";
import { SLOTS, filled } from "@/content/business";
import { dishesForCut, provenanceMark } from "@/content/dishes";
import { cateringServiceArea } from "@/content/locations";
import { occasionById, serviceFormatsFor } from "@/content/occasions";
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

/* ═══════════════════ מסלול הוואטסאפ בהירו ═══════════════════ */

/**
 * חוזה 02 §6.1–§6.3: קליטה מקדימה ואז ניווט **באותו tick**, בלי `await`
 * ובלי בדיקת תשובה. המזהה נוצר ברינדור, ולכן ה־href הסטטי נושא אותו גם
 * בלי JS, גם בלשונית חדשה וגם כשמעתיקים את הכתובת.
 *
 * ‎TODO(01 §5.7): עותק נוסף של אותו קוד (`WhatsAppBand`, `pages/home.tsx`,
 * ‎`pages/catering-business.tsx`, `pages/catering-holidays.tsx`). מקומו
 * ב־`lib/whatsapp.ts openWhatsApp()`. מדווח בדוח החזרה.
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

/* ═══════════════════ הסקשן הייחודי של הדף ═══════════════════ */

/**
 * ‎T-1: לכל דף חייב להיות בלוק שאינו קיים בשום דף אחר. הבלוק הזה נושא
 * את הטיעון שירד מה־H1 (‎§A2) — ובנוסח שהביקורת מתירה: **עובדת קטגוריה
 * על המטבח האיטלקי**, לא טענה על התמחור שלנו.
 *
 * שלוש השורות נבדקו אחת־אחת מול שאלה אחת: האם היא נכונה גם כשכל משבצת
 * באתר ריקה. אין בהן מחיר, אין השוואה, אין מספר, אין שם מנה (‎`DISHES`
 * ריק — שם מנה כאן היה בדיוק כשל §A6), ואין טענה על ההפרדה במטבח.
 */
const DAIRY_POINTS = [
  {
    titleHe: "מטבח איטלקי בנוי סביב חלב מלכתחילה",
    bodyHe:
      "בקטגוריות אחרות תפריט חלבי הוא מה שנשאר אחרי שמורידים ממנו את הבשר. במטבח איטלקי זה הפוך: הגבינות, החמאה והשמנת הן העמוד שהמטבח עומד עליו, ולא תחליף למשהו.",
  },
  {
    titleHe: "אירוע חלבי מקל על שולחן מעורב",
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
          eyebrow="למה דווקא איטלקי"
          title="חלבי הוא לא מה שנשאר"
          lede="זה הטיעון שהשוק הישראלי כבר מכיר, והוא הסיבה שהמטבח הזה נכנס לקטגוריה הזאת בצורה טבעית."
          reveal={false}
        />

        <ul className="m-0 list-none border-t border-solid border-t-[color:var(--rule)] p-0">
          {DAIRY_POINTS.map((point) => (
            <li
              key={point.titleHe}
              className="m-0 border-b border-solid border-b-[color:var(--rule)] py-7"
            >
              <div className="max-w-body pe-6">
                <h3 className="m-0 font-serif text-lg font-bold">{point.titleHe}</h3>
                <p className="mt-2 text-xs leading-[1.6] text-fg-muted">{point.bodyHe}</p>
              </div>
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
      questionHe: "האם האוכל כשר?",
      /* כלשון הבעלים, דרך המשבצת. לעולם לא כמחרוזת קשיחה (LAW 1). */
      answerHe: kashrutClauseHe("general"),
    },
    {
      id: "faq-who-cooks",
      questionHe: "מי מבשל את זה?",
      answerHe:
        "המטבח של מסעדה איטלקית פעילה — מטבח שמבשל לסועדים שיושבים בו, ולא מטבח שנפתח כדי לשרת אירועים.",
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
  { href: "/quote", titleHe: "בקשת הצעה", descriptionHe: "ארבע שאלות, ואנחנו חוזרים אליכם." },
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
  const showMenuSheet = dishes.length > 0;

  /* ‎§3.1 — מקור המספור היחיד. סקשן שנשמט אינו משאיר חור ברצף. */
  const order = [
    showMenuSheet ? "menu" : null,
    formats.some((f) => f.offered) ? "formats" : null,
    "dairy-argument",
    "kitchen",
    "quote",
    faqs.some((f) => f.answerHe) ? "faq" : null,
  ].filter((k): k is string => k !== null);

  const num = (key: string) => {
    const i = order.indexOf(key);
    return i < 0 ? undefined : String(i + 1).padStart(2, "0");
  };

  /* גיזום ברמת הפסוקית (G5): כל אסימון ריק מוריד את הפסוקית שלו בלבד.
     הכשרות נקראת מהמשבצת ולא נכתבת קשיח — היא ההצהרה בעלת הסיכון
     הגבוה ביותר באתר. */
  const facts = ["מטבח של מסעדה איטלקית פעילה", kashrutClauseHe("general")].filter(
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
          buildFaqPage(faqs),
        ]}
      />

      <OccasionIntro
        eyebrow="קייטרינג מאמאמיה · חלבי"
        /* ‎00-spec-review §A2. אין כאן «אותו תקציב» ואין «עשיר יותר» —
           טענה השוואתית על מחיר, באתר בלי מחירים. */
        title={
          <>
            קייטרינג חלבי איטלקי
            <br />
            מהמטבח
            <br />
            של המסעדה.
          </>
        }
        lede="תפריט חלבי שהוא לא גרסה מצומצמת של תפריט אחר. זה מה שמטבח איטלקי עושה ממילא — אנטיפסטי, פסטות וקינוחים — והוא נבנה אצלכם לאירוע לפי מספר הסועדים ולפי אופי הערב."
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

      <OpsFacts rows={rows} variant="strip" />

      {/* 01 · גיליון התפריט, בחתך החלבי. ריק היום ⇒ אינו מרונדר. */}
      <MenuSheet
        id="menu"
        num={num("menu")}
        dishes={dishes}
        title="החתך החלבי מהתפריט"
        lede="המנות הן המנות של המסעדה. מה שמסומן חלבי כאן הוא מה שנכנס לתפריט של אירוע חלבי."
      />

      <ServiceFormats
        id="formats"
        num={num("formats")}
        formats={formats}
        sourcePage={SOURCE_PAGE}
        title="איך זה מגיע אליכם"
      />

      <DairyArgument num={num("dairy-argument")} />

      <KitchenNote num={num("kitchen")} />

      {/* ‎`seed` ריק בכוונה: `occasions.ts` קובע `eventTypeSeed: null` לדף
          הזה, כי חלבי הוא חתך תפריט ולא סוג אירוע — אותו קונה יכול להיות
          חברה, שמחה או חג. זריעת סוג אירוע כאן הייתה מתייגת ליד לא נכון,
          וזה כשל גרוע יותר מתיוג חסר (02 §1.7). */}
      <QuoteCta
        num={num("quote")}
        sourcePage={SOURCE_PAGE}
        title="התפריט שלכם"
        lede="ארבע שאלות על האירוע, ואז פרטים ליצירת קשר. ההצעה חוזרת בכתב."
      />

      {/* המסלול השני, למי שגלל עד הטופס ובחר לא למלא אותו. */}
      <WhatsAppBand
        waLocation="quote_alt"
        title="מעדיפים לכתוב?"
        lede="אפשר לשלוח את פרטי האירוע בהודעה, ולהמשיך משם."
        labelHe="עדיף לי בוואטסאפ"
        callLocation="quote_alt"
      />

      <FaqBand
        id="faq"
        num={num("faq")}
        items={faqs}
        title="שאלות שנשאלות על תפריט חלבי"
        lede="ומה שאין עליו תשובה כאן — שאלו אותנו ישירות."
      />

      <NextSteps sourcePage={SOURCE_PAGE} links={NEXT} />
    </>
  );
}
