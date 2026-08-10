/**
 * ═══════════════════════════════════════════════════════════════════════
 *  P-15 · `/urgent` — קייטרינג להיום. **רג׳יסטר תפעולי · המרה בטלפון.**
 *  spec 01 §4 P-15, §3.1, §3.3, INV-2, INV-9. `content/occasions.ts`.
 * ═══════════════════════════════════════════════════════════════════════
 *
 * זהו הדף בעל הכוונה הגבוהה ביותר באתר, והוא גם היחיד שכל קיומו נשען על
 * משבצת ריקה: `SLOTS.sameDayCutoff`. השער ב־`occasions.ts` הוא **רך** —
 * הדף עולה בלי טענת קאט־אוף, וקבוצת המודעות פשוט אינה רצה עד שהשעה
 * תימסר. הדף הזה נבנה כדי להיות כן ושימושי **בלי** השעה.
 *
 * ─────────────────────────────────────────────────────────────────────
 *  היררכיית הפעולה — החריג היחיד בסבב, ומדוע
 * ─────────────────────────────────────────────────────────────────────
 * בארבעת הדפים האחרים שלי הדירוג הוא מגדיר ← וואטסאפ ← טלפון. כאן הוא
 * מתהפך, ולא כהעדפה: `shared/routes.ts` מצהיר על המסלול הזה
 * ‎`ctaMode: "phone"`, `stickyBar: "phone"`, `hasBuilder: false`, וזו
 * הסמכות על `RouteDef`. הדירוג בפועל:
 *
 *   1. **טלפון** — המספר עצמו הוא הפקד הממולא בענבר, בראש הדף.
 *   2. **וואטסאפ** — ירוק, לצדו בהירו ובבאנד הסוגר.
 *   3. **המגדיר** — מוצע כבלוק מסומן ל־`/quote`, עמוד נפרד שהמבקר בוחר
 *      להיכנס אליו. ‏§4 P-15 נוקב בנוסח: «אם זה לא דחוף — בנו תפריט».
 *
 * ‎**המגדיר אינו מרונדר בדף הזה, וזו הכרעה ולא השמטה.** ‎§4 P-15 גובר
 * במפורש על 02 §1.5: טופס בן ארבעה שלבים הוא הכלי הלא נכון למי שצריך
 * אוכל בעוד ארבע שעות, וטופס מקופל עדיין עולה יעד גלילה ונתח קוד. אם
 * הבריף של הסבב ידרוש מגדיר גם כאן — `hasBuilder` הוא זה שצריך להתהפך,
 * ב־`shared/routes.ts`, שאינו בבעלות הקובץ הזה. מדווח.
 *
 * ─────────────────────────────────────────────────────────────────────
 *  שלוש טענות שהמפרט כותב, ושאינן נכתבות כאן
 * ─────────────────────────────────────────────────────────────────────
 *  1. **«שלושה מטבחים».** ‎§4 P-15 מצטט כותרת `צריכים אוכל להיום? שלושה
 *     מטבחים זה שלוש הזדמנויות שזה יסתדר.` — ‏`content/business.ts`
 *     (מקטע המיצוב, 30 ביולי 2026) קובע שהקייטרינג מבושל במטבח של **אחת**
 *     מהמסעדות. «שלושה מטבחים» היא בדיוק ההנחה שנמחקה מכל האתר.
 *  2. **«משלוח מהיר».** אין לה שדה ב־`business.ts`, והיא התחייבות
 *     תפעולית לכל דבר.
 *  3. **`ProductionSheet` בשלוש עמודות, טלפון וואטסאפ לכל מטבח.** נגזר
 *     ישירות ממודל שלושת המטבחים שנדחה, ואין מספר טלפון סניפי מאומת.
 *     במקומו: מספר אחד, ברור, בראש הדף.
 *
 * ואין כאן **טענת מהירות** בשום ניסוח: לא «תוך שעתיים», לא «מיידי», לא
 * «זמין עכשיו» ולא «עונים מיד». `responseTime` ו־`staffedHours` ריקים.
 * זכייה בקלאסטר הזה ואז החמצה של הבטחה היא כשל מוניטין בלי דרך חזרה
 * בשוק שמונע מביקורות.
 *
 * ─────────────────────────────────────────────────────────────────────
 *  הקאט־אוף
 * ─────────────────────────────────────────────────────────────────────
 * ‎`CutoffBand` הוא **הבאנד היחיד בדף שקשור למשבצת אחת**, והוא מרונדר רק
 * כשהיא מלאה. ברגע ש־`SLOTS.sameDayCutoff` יימסר — הוא נדלק מאליו,
 * במקום שנשמר לו מתחת להירו, בלי לגעת בקובץ הזה. INV-9: השעה מוצגת
 * כלשונה ומסומנת שעון ישראל; היא לעולם אינה מחושבת משעון המכשיר.
 *
 * ─────────────────────────────────────────────────────────────────────
 *  המערכת החזותית
 * ─────────────────────────────────────────────────────────────────────
 * ‎04 גובר על 03 §2–§6. אין בקובץ אף `font-serif` ואף hex; הענבר נושא
 * את הפעולה, והוא כאן **מבטא תפעולי** ולא חגיגי: הוא צובע את המספר
 * שמתקשרים אליו, את שעת החיתום ואת הספרות הסידוריות, ותו לא.
 */

import * as React from "react";
import { Link } from "wouter";
import { Head } from "@/components/seo/head";
import { Num, Prose, SectionHeader } from "@/components/primitives";
import {
  FaqBand,
  KitchenNote,
  MenuSheet,
  OccasionIntro,
  OpsFacts,
  type DishLine,
  type FaqItem,
  type OpsFactRow,
} from "@/components/bands";
import { ContactBar, Gallery, ReviewsBlock } from "@/components/trust";
import { PHONE, SLOTS, filled, telLink } from "@/content/business";
import { dishesForCut, provenanceMark } from "@/content/dishes";
import { cateringServiceArea } from "@/content/locations";
import { occasionById } from "@/content/occasions";
import { hasAnyProof } from "@/content/proof";
import { buildWaHref, capturePhoneClick, captureWaIntent, newRef } from "@/lib/lead-client";
import { track } from "@/lib/analytics";
import { kashrutClauseHe, resolveExtraMeta, stripEmptyJsonLd } from "@/lib/page-meta-extra";
import type { PageMetaExtra } from "@/lib/page-meta-extra";
import { buildBreadcrumbList, buildFaqPage, buildService, buildWebPage } from "@/lib/seo";

/** הרשומה קיימת תמיד ב־`page-meta-extra`; היעדרה הוא באג ולא מצב. */
const META = resolveExtraMeta("/urgent") as PageMetaExtra;

const SOURCE_PAGE = "/urgent";

/** מקור יחיד לשם, לכוונה ולחתך התפריט — לא נכתבים כאן. */
const OCCASION = occasionById("urgent");

/** הטענה היחידה המותרת על מוצא האוכל, בלשון יחיד. נכתבת פעם אחת. */
const KITCHEN_FACT_HE =
"המטבח של מסעדה פעילה — מטבח שמבשל כל יום לסועדים שיושבים בו, ולא מטבח שנפתח כדי לשרת אירועים.";

/* ═══════════════════ מסלול הוואטסאפ בהירו ═══════════════════ */

/**
 * ‎`waLocation: "urgent"` ולא `"hero"` — זהו הערך הייעודי ב־
 * ‎`shared/lead-constants.ts`, והוא מה שמפריד את הלידים האלה בדוח. ליד
 * דחוף שנרשם כ־`hero` נבלע בין כל השאר, וזה בדיוק הליד שצריך להיענות
 * ראשון.
 *
 * חוזה 02 §6.1–§6.3: קליטה מקדימה ואז ניווט **באותו tick**, בלי `await`.
 * ‎TODO(01 §5.7): מקומו ב־`lib/whatsapp.ts openWhatsApp()` — מדווח.
 */
function useHeroWhatsApp() {
  const [ref] = React.useState(() => newRef());
  const href = React.useMemo(() => buildWaHref({}, ref), [ref]);

  const onClick = React.useCallback<React.MouseEventHandler<HTMLButtonElement & HTMLAnchorElement>>(
    (e) => {
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;

      track("whatsapp_click", { wa_location: "urgent", has_lead: false });
      captureWaIntent({ ref, waLocation: "urgent" });
      track("whatsapp_handoff", { lead_ref: ref, wa_location: "urgent" });

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

/* ═══════════════════ באנד הקאט־אוף ═══════════════════ */

/**
 * הבאנד שממתין למשבצת. `SLOTS.sameDayCutoff` ריק ⇒ `null`, ואין בדף
 * שום רמז לכך שחסר כאן משהו — לא כותרת מעל כלום ולא «בתיאום».
 *
 * INV-9: השעה מוצגת **כלשונה כפי שנמסרה**, מסומנת שעון ישראל, ולעולם
 * אינה נגזרת מ־`new Date()` של המכשיר. השעון של המבקר אינו נאמן, והפרש
 * של שעה בדף הזה הוא הזמנה שלא תעמוד.
 *
 * השעה עצמה היא המספר החשוב ביותר בדף, ולכן היא — ולא הכותרת — נושאת
 * את הענבר. הסקאלה נשארת מרוסנת (04 §3): `text-2xl`, לא כותרת ענק.
 */
function CutoffBand({ num }: { num?: string }) {
  if (!filled(SLOTS.sameDayCutoff)) return null;

  return (
    <section id="cutoff" className="sec sec--alt sec--tight rule-top">
      <div className="wrap">
        <SectionHeader num={num} eyebrow="הזמנה לאותו יום" title="עד מתי אפשר להזמין להיום" />

        <p className="m-0 text-2xl font-bold text-accent">
          <Num>{SLOTS.sameDayCutoff}</Num>
        </p>
        <p className="m-0 mt-2 max-w-body text-xs text-fg-subtle">
          שעון ישראל. אחרי השעה הזאת עדיין כדאי להתקשר — אנחנו נגיד לכם מה אפשר.
        </p>
      </div>
    </section>
  );
}

/* ═══════════════════ הרצועה התפעולית ═══════════════════ */

/**
 * מה שקונה דחוף שואל בשלושים השניות הראשונות. הקאט־אוף עצמו **אינו**
 * כאן — הוא הבאנד שמעל, ושורה כפולה הייתה מחלישה את שניהם.
 *
 * כולן `null` היום ⇒ הרצועה אינה מרונדרת.
 */
function opsRows(): OpsFactRow[] {
  const area = cateringServiceArea();

  return [
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
      id: "ops-max",
      labelHe: "מקסימום ליום",
      value: filled(SLOTS.maxGuests) ? <Num inline>{SLOTS.maxGuests}</Num> : null,
    },
    {
      id: "ops-hours",
      labelHe: "שעות מענה",
      value: filled(SLOTS.staffedHours) ? SLOTS.staffedHours : null,
    },
  ];
}

/* ═══════════════════ הסקשן הייחודי של הדף ═══════════════════ */

/**
 * ‎T-1: הבלוק שאינו קיים בשום דף אחר. הוא מתאר **את השיחה עצמה** — מה
 * להגיד כדי לקבל תשובה בשיחה אחת ולא בשלוש.
 *
 * כל שורה נבדקה מול שאלה אחת: האם היא נכונה גם כשכל משבצת ריקה. אין בה
 * שעה, אין מספר, אין הבטחת זמן ואין «אנחנו נספיק». היא מתארת מה שהקונה
 * מביא לשיחה, לא מה שאנחנו מתחייבים בה.
 */
const CALL_POINTS = [
  {
    titleHe: "כמה אנשים, ולאיזו שעה",
    bodyHe:
"השעה שבה האוכל צריך להיות על השולחן — לא השעה שבה מתחיל האירוע. שני המספרים האלה הם מה שקובע אם אפשר, ובאיזה היקף.",
  },
  {
    titleHe: "לאן זה מגיע",
    bodyHe:
"כתובת, קומה, ואיך נכנסים. בהזמנה של אותו יום זה לא פרט טכני — זה חלק מהתשובה אם זה ריאלי.",
  },
  {
    titleHe: "מה חייב להיות, ומה גמיש",
    bodyHe:
"בהזמנה דחופה התפריט נבנה ממה שכבר עומד במטבח. אם תגידו מה קריטי ומה פחות, נוכל להציע את מה שבאמת אפשר להוציא היום.",
  },
  {
    titleHe: "מגבלות תזונה, אם יש",
    bodyHe:
"צמחוני, ללא גלוטן, רגישות. עדיף שזה ייאמר בשיחה הראשונה ולא בהודעה שאחריה.",
  },
] as const;

function CallChecklist({ num }: { num?: string }) {
  return (
    <section id="call" className="sec">
      <div className="wrap">
        <SectionHeader
          num={num}
          eyebrow="לפני שמתקשרים"
          title="ארבעה דברים שיקצרו את השיחה"
          lede="אף אחד מהם אינו טופס. זה פשוט מה שנשאל בטלפון, ולכן עדיף שיהיה ביד."
        />

        <ol className="m-0 grid list-none gap-grid p-0 [grid-template-columns:repeat(auto-fit,minmax(230px,1fr))]">
          {CALL_POINTS.map((point, i) => (
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
        </ol>
      </div>
    </section>
  );
}

/* ═══════════════════ שאלות ותשובות ═══════════════════ */

type PageFaq = FaqItem & { answerHe: string | null };

/**
 * ‎«אפשר להיום?» היא השאלה הראשונה בדף, והתשובה עליה היא `sameDayCutoff`
 * — ריקה. היא **לא** מקבלת כאן תשובה «שנשמעת נכון». זו הנקודה שכל הדף
 * נבנה סביבה.
 *
 * מה שכן עונה היום: תיאור התהליך, עובדת המטבח, והכשרות דרך הבורר —
 * שלושתם נכונים כשכל משבצת ריקה, ושלושתם משפטים שלמים שעומדים בפני
 * עצמם מחוץ להקשר. בלעדיהם `FAQPage` לא היה נפלט כלל מהדף בעל הכוונה
 * הגבוהה ביותר באתר.
 */
function faqItems(): PageFaq[] {
  const area = cateringServiceArea();

  return [
    {
      id: "faq-same-day",
      questionHe: "אפשר להזמין קייטרינג להיום?",
      answerHe: filled(SLOTS.sameDayCutoff) ? SLOTS.sameDayCutoff : null,
    },
    {
      id: "faq-how",
      questionHe: "איך מזמינים כשזה דחוף?",
      /* תיאור תהליך, לא מסירת עובדה. אין בו שעה, אין מספר ואין
         התחייבות זמן — ולכן הוא נכון גם כשכל משבצת ריקה. */
      answerHe:
"מתקשרים. אומרים כמה אנשים, לאיזו שעה ולאיזו כתובת, ועוברים על מה שאפשר להוציא היום. מי שמעדיף לכתוב — אפשר גם בוואטסאפ.",
    },
    {
      id: "faq-who-cooks",
      questionHe: "מי מבשל את האוכל?",
      answerHe: KITCHEN_FACT_HE,
    },
    {
      id: "faq-kashrut",
      questionHe: "האם האוכל כשר?",
      /* דרך הבורר, כלשון הבעלים. לעולם לא כמחרוזת קשיחה (LAW 1). */
      answerHe: (() => {
        const k = kashrutClauseHe("general");
        return k ? `הקייטרינג ${k}.` : null;
      })(),
    },
    {
      id: "faq-minimum",
      questionHe: "יש מינימום להזמנה?",
      answerHe: filled(SLOTS.minGuests) ? `${SLOTS.minGuests} מנות.` : null,
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
  ];
}

/* ═══════════════════ העמוד ═══════════════════ */

export default function Urgent() {
  const wa = useHeroWhatsApp();

  /* החתך מ־`occasions.ts` (`platters` + `antipasti`) ולא רשימה שנכתבת
     כאן. ריק היום ⇒ `MenuSheet` אינו מרונדר. וגם כשיימלא — הכותרת אינה
     טוענת «מה יש היום»: זמינות יומית היא נתון תפעולי שאיש לא מסר. */
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

  const rows = opsRows();
  const faqs = faqItems();
  const answered = faqs.filter(
    (f): f is FaqItem & { answerHe: string } => f.answerHe !== null,
  );
  const showCutoff = filled(SLOTS.sameDayCutoff);
  const showMenuSheet = dishes.length > 0;
  const proof = hasAnyProof();

  /* ‎§3.1 — המספור נקבע לפי מיקום. הרצועה התפעולית והבאנד הסוגר אינם
     ממוספרים: הם אינם פרקים בגיליון, הם הדרך לפנות. */
  const order = [
    showCutoff ? "cutoff" : null,
"call",
    showMenuSheet ? "menu" : null,
    proof ? "proof" : null,
"kitchen",
    answered.length > 0 ? "faq" : null,
  ].filter((k): k is string => k !== null);

  const num = (key: string) => {
    const i = order.indexOf(key);
    return i < 0 ? undefined : String(i + 1).padStart(2, "0");
  };

  /* שתי פסוקיות, כל אחת נגזמת לחוד (G5). **לא** «שלושה מטבחים»: הקיבולת
     שנמסרה היא מטבח של מסעדה פעילה אחת. */
  const facts = ["מטבח של מסעדה פעילה", kashrutClauseHe("general")].filter(
    (c): c is string => Boolean(c),
  );

  return (
    <>
      <Head
        meta={META}
        jsonLd={[
          stripEmptyJsonLd(buildWebPage(META)),
          /* ‎Service בלי `areaServed` ובלי `hoursAvailable`: אזור החלוקה
             ושעות המענה הם משבצות ריקות. אין `Offer`, אין `priceRange`,
             ואין שום שדה שמרמז על זמינות מיידית. */
          stripEmptyJsonLd(
            buildService({
              path: SOURCE_PAGE,
              nameHe: OCCASION.nameHe,
              descriptionHe: META.descriptionHe,
            }),
          ),
          buildBreadcrumbList(META.breadcrumb),
          buildFaqPage(answered),
        ]}
      />

      <OccasionIntro
        eyebrow="קייטרינג מאמאמיה · להיום"
        /* בלי «שלושה מטבחים» ובלי «משלוח מהיר». הכותרת אומרת מה הדף
           הזה הוא — שיחה, לא טופס — וזו גם ההכרעה המבנית שמאחוריו. */
        title={
          <>
            צריכים אוכל להיום?
            <br />
            זו שיחת טלפון, לא טופס.
          </>
        }
        lede="אם זה אפשרי היום תלוי בשעה, בכמות ובמה שכבר עומד על האש — ואת זה אי אפשר לדעת מטופס. מתקשרים, אומרים כמה אנשים ולאיזו שעה, ובודקים יחד מה אפשר להוציא."
        facts={facts}
        /* ‎ctaMode "phone" (`shared/routes.ts`): הפקד הממולא הוא המספר
           עצמו ולא עוגן לטופס. `showPhone={false}` מכבה את שורת הטלפון
           שמתחת — הטלפון כבר כאן, ושכפול שלו הוא רעש (03 §7.8, L-10). */
        primary={{
          label: (
            <>
              התקשרו <Num>{PHONE.display}</Num>
            </>
          ),
          href: telLink(),
          /* בלי `data-tel`: `CtaSpec` הוא אובייקט מוטפס, ובדיקת המאפיינים
             העודפים פוסלת מאפיין שאינו בטיפוס. הקליק מקוטלג בלעדיו.
             מדווח בדוח החזרה כבקשה להוסיף `data-tel` ל־`ButtonProps`. */
          onClick: () => capturePhoneClick({ callLocation: "hero" }),
        }}
        /* המסלול השני, מיד לצד המספר ולא באנד נפרד בהמשך: מי שלא יכול
           לדבר עכשיו — בפגישה, בנסיעה, בבית מלא — צריך למצוא את זה בלי
           לגלול. */
        secondary={{
          label: "לכתוב לנו בוואטסאפ",
          variant: "wa",
          href: wa.href,
          target: "_blank",
          rel: "noopener noreferrer",
          onClick: wa.onClick,
        }}
        showPhone={false}
        callLocation="hero"
      >
        {/* INV-6: קליק על וואטסאפ כותב שורת ליד לפני שנפתחת האפליקציה,
            ולכן הודעת סעיף 11 צמודה לפקד. */}
        <Prose
          size="fine"
          measure="body"
          className="mt-3 border-s border-solid border-s-[color:var(--rule)] ps-[.9rem]"
        >
          <p>
            בלחיצה על וואטסאפ נשמרת אצלנו פנייה עם הפרטים שמופיעים בהודעה.{" "}
            <a href="/privacy" className="underline underline-offset-[.22em]">
              מדיניות הפרטיות
            </a>
          </p>
        </Prose>

        {/* ‎04 §5. ריק היום ⇒ אינו מרונדר. */}
        <ReviewsBlock ratingOnly className="mt-6" />
      </OccasionIntro>

      {/* ממתין למשבצת. ריקה ⇒ אין באנד, ואין רמז שחסר כאן משהו. */}
      <CutoffBand num={num("cutoff")} />

      <OpsFacts rows={rows} variant="strip" />

      <CallChecklist num={num("call")} />

      {/* גיליון קצר. ריק היום. הכותרת אינה טוענת «מה יש היום» — זמינות
          יומית היא נתון שאיש לא מסר. בלי מחירים ובלי «הוסיפו לתפריט
          שלי»: אין בנאי בדף שיאסוף אותם. */}
      {showMenuSheet ? (
        <div data-band="cream">
          <MenuSheet
            id="menu"
            num={num("menu")}
            dishes={dishes}
            grouping="flat"
            title="מה יוצא מהמטבח"
            lede="המנות של המסעדה. בהזמנה לאותו יום עוברים עליהן בטלפון ומרכיבים מהן את מה שאפשר."
          />
        </div>
      ) : null}

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

      {/* המסלול השלישי — המגדיר, כעמוד נפרד. ‎§4 P-15 אוסר בנאי **בדף
          הזה** ונוקב בנוסח הקישור. זה כרטיס מסומן בגבול ענבר ולא שורה
          קבורה: מי שנחת כאן בטעות והאירוע שלו בעוד שבועיים צריך למצוא
          אותו בלי לחפש. */}
      <section id="not-urgent" className="sec sec--tight">
        <div className="wrap">
          <div className="max-w-body rounded-card border border-solid border-[color:var(--rule-control)] bg-bg-alt p-card">
            <h2 className="m-0 text-xl font-bold">אם זה לא דחוף</h2>
            <Prose size="body" measure="body" className="mt-3">
              <p>
                לאירוע שיש לו תאריך, עדיף לבנות תפריט ולקבל הצעה בכתב. אותו מטבח, רק בלי
                לחץ של שעות.
              </p>
            </Prose>
            <Link
              href="/quote"
              className="mt-4 inline-flex items-center gap-[.4rem] rounded-pill border border-solid border-accent px-[1.05rem] py-[.5rem] text-sm font-semibold text-accent no-underline transition-colors duration-state ease-house hover:bg-accent hover:text-accent-foreground"
            >
              לבנות את התפריט לאירוע
            </Link>
          </div>
        </div>
      </section>

      {answered.length > 0 ? (
        <div data-band="cream">
          <FaqBand
            id="faq"
            num={num("faq")}
            items={faqs}
            eyebrow="לפני שמתקשרים"
            title="שאלות שנשאלות בטלפון"
            lede="ומה שאין עליו תשובה כאן — שאלו אותנו ישירות."
          />
        </div>
      ) : null}

      {/* ═══ הבאנד הסוגר ═══
          אותם שני ערוצים של ההירו, באותו סדר: וואטסאפ ממולא, הטלפון
          מתחתיו. `showQuote={false}` — מסלול המגדיר כבר יושב בכרטיס
          המסומן שמעל, ופקד «הצעה» כאן היה מסלול רביעי בדף שכל עניינו
          לקצר. */}
      <section id="contact" className="sec sec--alt">
        <div className="wrap">
          <SectionHeader
            eyebrow="לדבר עכשיו"
            title="קל יותר לכתוב?"
            lede="שלחו בהודעה כמה אנשים, לאיזו שעה ולאיזו כתובת — ואנחנו נחזור אליכם."
          />

          <ContactBar
            waLocation="urgent"
            primary="whatsapp"
            showQuote={false}
            labels={{ wa: "לכתוב לנו בוואטסאפ", phoneLead: "או פשוט חייגו" }}
            callLocation="contact"
            framed={false}
          />
        </div>
      </section>
    </>
  );
}
