/**
 * ═══════════════════════════════════════════════════════════════════════
 *  P-16 · `/pasta-bar` — עמדת פסטה לאירועים.
 *  spec 01 §4 P-16, §3.1, §3.3, INV-2. `content/occasions.ts` (שער קשיח).
 * ═══════════════════════════════════════════════════════════════════════
 *
 * ─────────────────────────────────────────────────────────────────────
 *  המצב הרשמי של המסלול, ולמה הקובץ קיים בכל זאת
 * ─────────────────────────────────────────────────────────────────────
 * ‎`content/occasions.ts` מציב כאן **שער קשיח** על `SLOTS.liveStations`,
 * ו־`shared/routes.ts` מצהיר בהתאם `enabled: false` / `blockedBy:
 * ["live_stations"]`. כלומר: היום המסלול אינו מוגש, אינו נרשם, ואינו
 * נכנס ל־sitemap. **אין לפתוח אותו כאן** — `enabled` מתהפך ב־
 * ‎`shared/routes.ts` באותו שינוי שבו נמסרות מגבלות העמדה, ולא לפני.
 *
 * הקובץ קיים כדי שהדף לא ייכתב מחדש בחיפזון ביום שהמשבצת תימסר, ובדיוק
 * מאותה סיבה שבגללה `pages/catering-shiva.tsx` קיים תחת שער קשיח משלו.
 *
 * ─────────────────────────────────────────────────────────────────────
 *  הכלל שמחזיק כל שורה בדף — לקרוא לפני שנוגעים בקופי
 * ─────────────────────────────────────────────────────────────────────
 * ‎`SLOTS.liveStations` הוא `null`, ולכן **הדף אינו טוען שאנחנו מפעילים
 * עמדה חיה.** אין בו «העמדה שלנו», אין «שף במקום», אין «מבשלים אצלכם»
 * ואין «אנחנו מגיעים עם». מה שמותר, ומה שהדף עושה, הוא לתאר **מהו
 * הפורמט** ומה קובע אם הוא מתאים — תיאור של קטגוריה אינו הצהרה על
 * יכולת, והוא נשאר נכון גם כשכל משבצת ריקה.
 *
 * ‎§4 P-16 מצטט H1 `עמדת פסטה שהיא לא גימיק. זה מה שהמטבח שלנו עושה כל
 * יום.` — שתי בעיות, ושתיהן מסירות: «שהיא לא גימיק» מניחה שאנחנו
 * מפעילים אחת, ו«כל יום» היא טענה על שעות פעילות (`SLOTS.openingHours`
 * ריק; ‏00-spec-review §A3 מוחק בדיוק את הצירוף הזה מדף הבית). ה־H1 כאן
 * אומר את מה שנשאר, והוא עדיין הזווית של המפרט: פסטה היא עבודת קו של
 * מטבח מסעדה, ולא מוצר שנשכר לאירוע.
 *
 * ‎`StationsBlock` (‎§4 P-16, טווח סועדים · חשמל/מים/מקום · האם טבח נוסע)
 * **אינו מרונדר**: הוא נשען על `content/stations.ts`, מודול שטרם נוצר.
 * במקומו יושב בלוק השאלות — אותן ארבע נקודות בדיוק, מנוסחות כמה שצריך
 * לברר. ביום שהמגבלות יימסרו, הן ממלאות את אותו מקום כתשובות.
 *
 * ─────────────────────────────────────────────────────────────────────
 *  מה נשמט היום, וזו התנהגות תקינה (INV-2)
 * ─────────────────────────────────────────────────────────────────────
 *   MenuSheet       ‎`content/dishes.ts` ריק ⇒ 0 מנות בחתך `pasta` ⇒
 *                   הסקשן אינו מרונדר (‎§3.3 שורת "0"). קישור צולב
 *                   לתפריט החי של המסעדה (`liveMenuUrlFor`) נגזר מדף
 *                   סניף חסום ולכן אינו נכתב.
 *   ServiceFormats  ‎`offered === true` הוא אישור בעלים; אף פורמט אינו
 *                   מאושר ⇒ הבאנד מחזיר null.
 *   OpsFacts        מינימום, מקסימום, זמן התראה ואזור — כולם `null`.
 *   FaqBand         «האם מפעילים עמדה באירוע» קשורה ל־`liveStations`
 *                   וריקה. היא **לא** מקבלת תשובה שנשמעת נכון.
 */

import * as React from "react";
import { Head } from "@/components/seo/head";
import { Num, Prose, Rule, SectionHeader } from "@/components/primitives";
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
import { CATERING_NAME, SLOTS, filled } from "@/content/business";
import { dishesForCut, provenanceMark } from "@/content/dishes";
import { cateringServiceArea } from "@/content/locations";
import { occasionById, serviceFormatsFor } from "@/content/occasions";
import { buildWaHref, captureWaIntent, newRef } from "@/lib/lead-client";
import { track } from "@/lib/analytics";
import { kashrutClauseHe, resolveExtraMeta, stripEmptyJsonLd } from "@/lib/page-meta-extra";
import type { PageMetaExtra } from "@/lib/page-meta-extra";
import { buildBreadcrumbList, buildFaqPage, buildService, buildWebPage } from "@/lib/seo";

/** הרשומה קיימת תמיד ב־`page-meta-extra`; היעדרה הוא באג ולא מצב. */
const META = resolveExtraMeta("/pasta-bar") as PageMetaExtra;

const SOURCE_PAGE = "/pasta-bar";

/** מקור יחיד לחתך התפריט ולפורמטים — לא נכתבים כאן. */
const OCCASION = occasionById("pasta-bar");

/* ═══════════════════ מסלול הוואטסאפ בהירו ═══════════════════ */

/**
 * חוזה 02 §6.1–§6.3: קליטה מקדימה ואז ניווט **באותו tick**, בלי `await`.
 * המזהה נוצר ברינדור, ולכן ה־href הסטטי נושא אותו גם בלי JS.
 *
 * ‎TODO(01 §5.7): עותק נוסף של אותו קוד. מקומו ב־`lib/whatsapp.ts`.
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

/** כולן `null` היום ⇒ הרצועה אינה מרונדרת. אין טבלת מקפים. */
function opsRows(): OpsFactRow[] {
  const area = cateringServiceArea();

  return [
    {
      id: "ops-min",
      labelHe: "מינימום סועדים",
      value: filled(SLOTS.minGuests) ? <Num inline>{SLOTS.minGuests}</Num> : null,
    },
    {
      id: "ops-max",
      labelHe: "מקסימום סועדים",
      value: filled(SLOTS.maxGuests) ? <Num inline>{SLOTS.maxGuests}</Num> : null,
    },
    {
      id: "ops-lead-time",
      labelHe: "כמה מראש מזמינים",
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
  ];
}

/* ═══════════════════ הפורמט — מה זה בעצם ═══════════════════ */

/**
 * ‎T-1: הבלוק שאינו קיים בשום דף אחר. הוא מתאר את הפורמט מבחוץ — מה
 * הוא, ולמה הוא נראה כמו שהוא נראה. **אין בו גוף ראשון**: לא «אנחנו
 * מביאים», לא «העמדה שלנו». זה תיאור קטגוריה, וזה בדיוק מה ש־
 * ‎`SLOTS.liveStations` הריק מתיר.
 */
const FORMAT_POINTS = [
  {
    titleHe: "זה קו עבודה, לא הצגה",
    bodyHe:
      "פסטה נגמרת במחבת בשלושים שניות האחרונות: רוטב שכבר עמד, פסטה שיוצאת מהמים ברגע הנכון, ומעט ממי הבישול. מי שעושה את זה כל ערב במסעדה עושה את אותה תנועה בדיוק, רק על שולחן אחר.",
  },
  {
    titleHe: "המנה מגיעה חמה, כי היא נגמרת מול הסועד",
    bodyHe:
      "זה ההבדל המעשי היחיד בין פסטה שנשלחת מוכנה לפסטה שנסגרת במקום — לא אווירה, אלא כמה זמן היא עומדת בין המחבת לצלחת.",
  },
  {
    titleHe: "קצב, ולא רק תפריט",
    bodyHe:
      "עמדה מגישה מנה בכל פעם, ולכן מספר הסועדים והזמן שיש להגשה הם מה שקובע אם הפורמט מתאים — לפני שמדברים בכלל על אילו רטבים.",
  },
] as const;

function FormatBlock({ num }: { num?: string }) {
  return (
    <section id="format" className="sec">
      <div className="wrap">
        <SectionHeader
          num={num}
          eyebrow="הפורמט"
          title="מה זו בעצם עמדת פסטה"
          lede="בלי הדימוי השיווקי, זה מה שקורה שם בפועל — ומה שקובע אם זה מתאים לאירוע שלכם."
          reveal={false}
        />

        <ul className="m-0 list-none border-t border-solid border-t-[color:var(--rule)] p-0">
          {FORMAT_POINTS.map((point) => (
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

/* ═══════════════════ מה צריך לברר ═══════════════════ */

/**
 * המקום שבו `StationsBlock` יישב ביום שהמגבלות יימסרו. ארבע השורות הן
 * בדיוק ארבע המשבצות ש־`content/stations.ts` יחזיק (‎§4 P-16): טווח
 * סועדים · חשמל, מים ומקום · האם טבח נוסע · זמן.
 *
 * עד אז הן מנוסחות כשאלות שצריך לברר, ולא כתשובות שלנו. שאלה אינה
 * הצהרה: היא נכונה בלי אף משבצת, והיא גם מה שקונה באמת צריך — רוב
 * הפערים בפורמט הזה מתגלים ביום האירוע ולא בהצעה.
 */
const CHECK_POINTS = [
  {
    titleHe: "לכמה סועדים העמדה בנויה",
    bodyHe:
      "לכל עמדה יש טווח שבו היא עובדת. מתחתיו היא מיותרת, ומעליו נוצר תור. זה המספר הראשון שצריך לשאול עליו.",
  },
  {
    titleHe: "חשמל, מים ומקום",
    bodyHe:
      "כמה נקודות חשמל, האם צריך גישה למים, וכמה מטרים העמדה תופסת בפועל — כולל המקום שבו עומדים מי שמחכים.",
  },
  {
    titleHe: "מי עומד שם",
    bodyHe:
      "האם מגיע טבח שמבשל, או שהעמדה מאוישת בהגשה בלבד. זה שינוי מהותי במה שמקבלים, והוא לא תמיד כתוב בהצעה.",
  },
  {
    titleHe: "כמה זמן ההגשה נמשכת",
    bodyHe:
      "עמדה שפתוחה חצי שעה ועמדה שפתוחה שעתיים הן שני דברים שונים לגמרי מבחינת כמויות, כוח אדם וקצב.",
  },
] as const;

function CheckList({ num }: { num?: string }) {
  return (
    <section id="check" className="sec sec--alt">
      <div className="wrap">
        <SectionHeader
          num={num}
          eyebrow="לפני שסוגרים"
          title="ארבעה דברים לברר על כל עמדה"
          lede="לא רק אצלנו. אלה הדברים שקובעים אם עמדה עובדת באירוע, ורובם מתגלים ביום האירוע כשלא שואלים עליהם מראש."
          reveal={false}
        />

        <ol className="m-0 list-none p-0">
          {CHECK_POINTS.map((point, i) => (
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
 * השאלה הראשונה היא **השאלה** של הדף הזה — «האם אתם מפעילים עמדה
 * באירוע» — והתשובה עליה היא `SLOTS.liveStations`, שהוא `null`. היא
 * נשארת בלי תשובה, ולכן אינה מרונדרת כלל, ולכן גם אינה נפלטת ל־`FAQPage`.
 * זה בדיוק המנגנון: ביום שהמשבצת תימסר, השאלה נדלקת מאליה.
 */
function faqItems(): PageFaq[] {
  return [
    {
      id: "faq-offered",
      questionHe: "אתם מפעילים עמדת פסטה באירוע?",
      answerHe: filled(SLOTS.liveStations) ? SLOTS.liveStations : null,
    },
    {
      id: "faq-who-cooks",
      questionHe: "מי מבשל את הפסטה?",
      answerHe:
        "המטבח של מסעדה איטלקית פעילה — מטבח שמבשל לסועדים שיושבים בו, ולא מטבח שנפתח כדי לשרת אירועים.",
    },
    {
      id: "faq-kashrut",
      questionHe: "האם האוכל כשר?",
      /* כלשון הבעלים, דרך המשבצת. לעולם לא כמחרוזת קשיחה (LAW 1). */
      answerHe: kashrutClauseHe("general"),
    },
    {
      id: "faq-alternative",
      questionHe: "ואם עמדה לא מתאימה לאירוע שלנו?",
      answerHe:
        "אז פסטה מגיעה כמו כל מנה אחרת בתפריט, בהגשה רגילה. ספרו לנו מה אופי האירוע ונציע את מה שמתאים לו.",
    },
    {
      id: "faq-dietary",
      questionHe: "יש אצלנו רגישות לגלוטן וצמחונים. אפשר?",
      answerHe:
        "עוברים על זה איתכם כשבונים את התפריט, ולא ביום האירוע. ספרו לנו מראש מי לא אוכל מה.",
    },
    {
      id: "faq-lead-time",
      questionHe: "כמה זמן מראש צריך להזמין?",
      answerHe: filled(SLOTS.leadTime) ? SLOTS.leadTime : null,
    },
  ];
}

/* ═══════════════════ להמשיך מכאן ═══════════════════ */

/**
 * ‎§4 P-16 מונה קישורים נכנסים מ־`/catering/fun-day`, `/catering/business`
 * ו־`/catering/private-events`. `/catering/fun-day` חסום על אותה משבצת
 * בדיוק, ו־`NextSteps` מסנן אותו בעצמו מול `shared/routes.ts` — הרשימה
 * כאן היא כוונה ולא הבטחה.
 */
const NEXT: NextStepLink[] = [
  {
    href: "/catering/business",
    titleHe: "קייטרינג לחברות",
    descriptionHe: "ארוחת צוות, ישיבה או אירוע חברה.",
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

export default function PastaBar() {
  const wa = useHeroWhatsApp();

  /* החתך מ־`occasions.ts` (`courses: ["pasta"]`). ריק היום. */
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

  /* ‎`offered` הוא אישור בעלים ומגיע מ־`config/service-formats.ts`,
     שטרם נוצר. `buffet_on_site` בדף הזה הוא בנוסף טענה על עמדה חיה —
     שתי סיבות נפרדות לכך שהוא נשאר `false`. */
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
    "format",
    "check",
    "kitchen",
    "quote",
    faqs.some((f) => f.answerHe) ? "faq" : null,
  ].filter((k): k is string => k !== null);

  const num = (key: string) => {
    const i = order.indexOf(key);
    return i < 0 ? undefined : String(i + 1).padStart(2, "0");
  };

  /* גיזום ברמת הפסוקית (G5). אין כאן פסוקית על עמדה, על צוות או על
     בישול במקום — כל אחת מהן היא `SLOTS.liveStations`. */
  const facts = ["מטבח של מסעדה איטלקית פעילה", kashrutClauseHe("general")].filter(
    (c): c is string => Boolean(c),
  );

  return (
    <>
      <Head
        meta={META}
        jsonLd={[
          stripEmptyJsonLd(buildWebPage(META)),
          /* ‎`nameHe` הוא **פסטה לאירועים** ולא «עמדת פסטה»: צומת
             ‎`Service` בשם «עמדת פסטה» מצהיר בגרף שהעמדה היא שירות
             שאנחנו מציעים, וזו בדיוק הטענה ש־`SLOTS.liveStations` חוסם.
             הטיפוס נפלט לזיהוי ישות ולא לקישוט תוצאות (01 §7). */
          stripEmptyJsonLd(
            buildService({
              path: SOURCE_PAGE,
              nameHe: `${CATERING_NAME} — פסטה לאירועים`,
              descriptionHe: META.descriptionHe,
              audience: "consumer",
            }),
          ),
          buildBreadcrumbList(META.breadcrumb),
          buildFaqPage(faqs),
        ]}
      />

      <OccasionIntro
        eyebrow="קייטרינג מאמאמיה · פסטה"
        /* בלי «העמדה שלנו», בלי «לא גימיק» ובלי «כל יום». מה שנשאר הוא
           הזווית של המפרט בלי הטענה שאין לה משבצת. */
        title={
          <>
            עמדת פסטה
            <br />
            מתחילה במטבח
            <br />
            שעושה פסטה.
          </>
        }
        lede="פסטה היא עבודת קו: רוטב שכבר עמד, פסטה שיוצאת מהמים ברגע הנכון, ומחבת. הדף הזה מסביר איך הפורמט עובד ומה קובע אם הוא מתאים — ואם אתם מתכננים אירוע שהפסטה היא הלב שלו, ספרו לנו עליו."
        facts={facts}
        primary={{ label: "ספרו לנו על האירוע", href: "#quote" }}
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

      {/* 01 · מדור הפסטה מהתפריט. ריק היום ⇒ אינו מרונדר. */}
      <MenuSheet
        id="menu"
        num={num("menu")}
        dishes={dishes}
        grouping="flat"
        title="הפסטות שבתפריט"
        lede="אלה הפסטות של המסעדה. תפריט לאירוע נבנה מתוכן."
      />

      <ServiceFormats
        id="formats"
        num={num("formats")}
        formats={formats}
        sourcePage={SOURCE_PAGE}
        title="איך זה מגיע אליכם"
      />

      <FormatBlock num={num("format")} />

      <CheckList num={num("check")} />

      <KitchenNote num={num("kitchen")} />

      {/* ‎`seed` ריק: `occasions.ts` קובע `eventTypeSeed: null` — עמדת
          פסטה היא מוצר ולא סוג אירוע, וזריעת סוג אירוע כאן הייתה מתייגת
          ליד לא נכון (02 §1.7). */}
      <QuoteCta
        num={num("quote")}
        sourcePage={SOURCE_PAGE}
        title="ספרו לנו על האירוע"
        lede="ארבע שאלות על האירוע, ואז פרטים ליצירת קשר. נחזור אליכם עם מה שמתאים לו."
      />

      {/* מסלול שני, למי שגלל עד הטופס ובחר לא למלא אותו. */}
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
        title="שאלות שנשאלות על עמדת פסטה"
        lede="ומה שאין עליו תשובה כאן — שאלו אותנו ישירות."
      />

      <NextSteps sourcePage={SOURCE_PAGE} links={NEXT} />
    </>
  );
}
