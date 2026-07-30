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
 *  שלוש טענות שהמפרט כותב, ושאינן נכתבות כאן
 * ─────────────────────────────────────────────────────────────────────
 *  1. **«שלושה מטבחים».** ‎§4 P-15 מצטט כותרת `צריכים אוכל להיום? שלושה
 *     מטבחים זה שלוש הזדמנויות שזה יסתדר.` — ‏`content/business.ts`
 *     (מקטע המיצוב, 30 ביולי 2026) קובע שהקייטרינג מבושל במטבח של **אחת**
 *     מהמסעדות. «שלושה מטבחים» היא בדיוק ההנחה שנמחקה מכל האתר, והיא
 *     אסורה בכל דף, meta ו־JSON-LD. הקיבולת שהדף נשען עליה היא מטבח
 *     מסעדה פעילה אחד, וזו גם היחידה שנמסרה.
 *  2. **«משלוח מהיר».** ‎`lib/page-meta-extra.ts` כבר הסיר אותה מה־title.
 *     אין לה שדה ב־`business.ts`, והיא התחייבות תפעולית לכל דבר.
 *  3. **`ProductionSheet` בשלוש עמודות, טלפון וואטסאפ לכל מטבח.** ‏§4
 *     P-15 מונה אותו; הוא נגזר ישירות ממודל שלושת המטבחים שנדחה, ואין
 *     מספר טלפון סניפי מאומת (`phoneFor()` מחזיר את המספר המרכזי בלבד).
 *     במקומו: מספר אחד, ברור, בראש הדף.
 *
 * ואין כאן **טענת מהירות** בשום ניסוח: לא «תוך שעתיים», לא «מיידי», לא
 * «זמין עכשיו» ולא «עונים מיד». `responseTime` ו־`staffedHours` ריקים.
 * זכייה בקלאסטר הזה ואז החמצה של הבטחה היא כשל מוניטין בלי דרך חזרה
 * בשוק שמונע מביקורות, ועם שמות שלוש מסעדות מחוברים אליו.
 *
 * ─────────────────────────────────────────────────────────────────────
 *  מה הדף כן אומר
 * ─────────────────────────────────────────────────────────────────────
 * שהתשובה לשאלה «אפשר להיום?» תלויה בשעה, בכמות ובמה שכבר על האש —
 * ושהדרך היחידה לדעת היא לשאול. זו אמירה נכונה בלי אף משבצת מלאה, והיא
 * גם מה שמצדיק מבנית את החלטת «בלי בנאי».
 *
 * ─────────────────────────────────────────────────────────────────────
 *  בלי בנאי בעמוד — הכרעה, לא השמטה
 * ─────────────────────────────────────────────────────────────────────
 * ‎§4 P-15 מכריע במפורש וגובר על 02 §1.5: **אין בנאי הצעה בדף הזה.** לא
 * מתחת לקיפול ולא מקופל. `shared/routes.ts` מצהיר `hasBuilder: false`
 * ו־`ctaMode: "phone"` בהתאם. טופס בן ארבעה שלבים הוא הכלי הלא נכון למי
 * שצריך אוכל בעוד ארבע שעות, וטופס מקופל עדיין עולה יעד גלילה ונתח קוד.
 *
 * מסלול הבנאי **מוצע** — כקישור טקסט מסומן ל־`/quote`, שהוא עמוד נפרד
 * שהמבקר בוחר להיכנס אליו. ‏§4 P-15 נוקב בנוסח: «אם זה לא דחוף — בנו
 * תפריט». שלושת המסלולים בדף: טלפון · וואטסאפ · `/quote`.
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
 *  פס ה־CTA הדביק
 * ─────────────────────────────────────────────────────────────────────
 * ‎`stickyBar: "phone"` (`shared/routes.ts`). הפס מגיע מ־`PageShell` דרך
 * ‎`RouteDef` ולא מכאן.
 */

import * as React from "react";
import { Link } from "wouter";
import { Head } from "@/components/seo/head";
import { Num, Prose, Rule, SectionHeader } from "@/components/primitives";
import {
  FaqBand,
  KitchenNote,
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
import { capturePhoneClick } from "@/lib/lead-client";
import { kashrutClauseHe, resolveExtraMeta, stripEmptyJsonLd } from "@/lib/page-meta-extra";
import type { PageMetaExtra } from "@/lib/page-meta-extra";
import { buildBreadcrumbList, buildFaqPage, buildService, buildWebPage } from "@/lib/seo";

/** הרשומה קיימת תמיד ב־`page-meta-extra`; היעדרה הוא באג ולא מצב. */
const META = resolveExtraMeta("/urgent") as PageMetaExtra;

const SOURCE_PAGE = "/urgent";

/** מקור יחיד לשם, לכוונה ולחתך התפריט — לא נכתבים כאן. */
const OCCASION = occasionById("urgent");

/* ═══════════════════ באנד הקאט־אוף ═══════════════════ */

/**
 * הבאנד שממתין למשבצת. `SLOTS.sameDayCutoff` ריק ⇒ `null`, ואין בדף
 * שום רמז לכך שחסר כאן משהו — לא כותרת מעל כלום ולא «בתיאום».
 *
 * INV-9: השעה מוצגת **כלשונה כפי שנמסרה**, מסומנת שעון ישראל, ולעולם
 * אינה נגזרת מ־`new Date()` של המכשיר. השעון של המבקר אינו נאמן, והפרש
 * של שעה בדף הזה הוא הזמנה שלא תעמוד.
 */
function CutoffBand({ num }: { num?: string }) {
  if (!filled(SLOTS.sameDayCutoff)) return null;

  return (
    <section id="cutoff" className="sec sec--alt sec--tight rule-top">
      <div className="wrap">
        <SectionHeader
          num={num}
          eyebrow="הזמנה לאותו יום"
          title="עד מתי אפשר להזמין להיום"
          reveal={false}
        />

        {/* ‎§4.6: `Num` חובה על שעה — Frank Ruhl Libre היא נושאת הספרות,
            ו־Assistant אינה מיישרת טור שיש בו 1. */}
        <p className="m-0 font-serif text-2xl font-medium">
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
          reveal={false}
        />

        <ol className="m-0 list-none p-0">
          {CALL_POINTS.map((point, i) => (
            <li key={point.titleHe} className="m-0">
              {i > 0 ? <Rule /> : null}
              <div className="max-w-body py-[1.7rem] pe-6">
                <span className="num block font-serif text-lg font-medium text-fg-subtle">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-3 font-serif text-lg font-bold">{point.titleHe}</h3>
                <p className="mt-2 text-xs leading-[1.6] text-fg-muted">{point.bodyHe}</p>
              </div>
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
 * ‎§4 P-15 מבקש שלוש. ארבע נכתבות, וכל אחת נגזמת לחוד — התשובות שקשורות
 * למשבצת נדלקות מאליהן ביום שהיא תימסר. שאלה בלי תשובה אינה מרונדרת,
 * ואותו סינון בדיוק מזין את ה־`FAQPage`.
 *
 * ‎«אפשר להיום?» היא השאלה הראשונה בדף, והתשובה עליה היא `sameDayCutoff`
 * — ריקה. היא **לא** מקבלת כאן תשובה «שנשמעת נכון». זו הנקודה שכל הדף
 * נבנה סביבה.
 */
function faqItems(): PageFaq[] {
  const area = cateringServiceArea();

  return [
    {
      id: "faq-same-day",
      questionHe: "אפשר להזמין להיום?",
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
  const showCutoff = filled(SLOTS.sameDayCutoff);
  const showMenuSheet = dishes.length > 0;

  /* ‎§3.1 — המספור נקבע לפי מיקום. הרצועה התפעולית ובלוק יצירת הקשר
     אינם ממוספרים: הם אינם פרקים בגיליון, הם הדרך לפנות. */
  const order = [
    showCutoff ? "cutoff" : null,
    "call",
    showMenuSheet ? "menu" : null,
    "kitchen",
    faqs.some((f) => f.answerHe) ? "faq" : null,
  ].filter((k): k is string => k !== null);

  const num = (key: string) => {
    const i = order.indexOf(key);
    return i < 0 ? undefined : String(i + 1).padStart(2, "0");
  };

  /* שתי פסוקיות, כל אחת נגזמת לחוד (G5). **לא** «שלושה מטבחים»: הקיבולת
     שנמסרה היא מטבח של מסעדה פעילה אחת. */
  const facts = ["מטבח של מסעדה איטלקית פעילה", kashrutClauseHe("general")].filter(
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
          buildFaqPage(faqs),
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
            זו שיחת טלפון,
            <br />
            לא טופס.
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
        showPhone={false}
        callLocation="hero"
      />

      {/* ממתין למשבצת. ריקה ⇒ אין באנד, ואין רמז שחסר כאן משהו. */}
      <CutoffBand num={num("cutoff")} />

      <OpsFacts rows={rows} variant="strip" />

      {/* מסלול שני. `waLocation="urgent"` הוא הערך הייעודי ב־
          `shared/lead-schema.ts`, והוא מה שמפריד את הלידים האלה בדוח.
          יושב מיד אחרי ההירו: הדרך לפנות חייבת להישאר קצרה, וכשיימסרו
          מנות `MenuSheet` יידחף מתחתיו ולא מעליו. */}
      <WhatsAppBand
        id="contact"
        waLocation="urgent"
        callLocation="contact"
        title="קל יותר לכתוב?"
        lede="שלחו בהודעה כמה אנשים, לאיזו שעה ולאיזו כתובת — ואנחנו נחזור אליכם."
        labelHe="כתבו לנו בוואטסאפ"
        phoneLeadHe="או בטלפון"
      />

      <CallChecklist num={num("call")} />

      {/* 0N · גיליון קצר. ריק היום. הכותרת אינה טוענת «מה יש היום» —
          זמינות יומית היא נתון שאיש לא מסר. בלי מחירים ובלי «הוסיפו
          לתפריט שלי»: אין בנאי בדף שיאסוף אותם. */}
      <MenuSheet
        id="menu"
        num={num("menu")}
        dishes={dishes}
        grouping="flat"
        title="מה יוצא מהמטבח"
        lede="המנות של המסעדה. בהזמנה לאותו יום עוברים עליהן בטלפון ומרכיבים מהן את מה שאפשר."
      />

      <KitchenNote num={num("kitchen")} />

      {/* המסלול השלישי — הבנאי, כעמוד נפרד. ‎§4 P-15 אוסר בנאי **בדף
          הזה** ונוקב בנוסח הקישור. זה בלוק מסומן ולא שורה קבורה: מי
          שנחת כאן בטעות והאירוע שלו בעוד שבועיים צריך למצוא אותו. */}
      <section id="not-urgent" className="sec sec--tight">
        <div className="wrap">
          <div className="max-w-body border-s border-solid border-s-[color:var(--rule)] ps-[1.1rem]">
            <h2 className="m-0 font-serif text-xl font-medium">אם זה לא דחוף</h2>
            <Prose size="body" measure="body" className="mt-3">
              <p>
                לאירוע שיש לו תאריך, עדיף לבנות תפריט ולקבל הצעה בכתב.{" "}
                <Link
                  href="/quote"
                  className="text-fg underline underline-offset-[.22em] hover:text-accent"
                >
                  בנו תפריט
                </Link>{" "}
                — ארבע שאלות, ואנחנו חוזרים אליכם.
              </p>
            </Prose>
          </div>
        </div>
      </section>

      <FaqBand
        id="faq"
        num={num("faq")}
        items={faqs}
        title="שאלות שנשאלות בטלפון"
        lede="ומה שאין עליו תשובה כאן — שאלו אותנו ישירות."
      />
    </>
  );
}
