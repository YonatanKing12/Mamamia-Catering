/**
 * ═══════════════════════════════════════════════════════════════════════
 *  P-07 · `/catering` — מרכז השירות. spec 01 §4 P-07, §3.1, INV-8.
 * ═══════════════════════════════════════════════════════════════════════
 *
 * הדף הזה אינו נושא ולו עובדה עסקית אחת משלו, וזה בכוונה: `shared/routes.ts`
 * מסמן אותו `blockedBy: []` כי אין לו שער — הוא **מפרק ניווט**. תפקידו
 * לקחת מבקר שיודע שהוא צריך קייטרינג ולהעביר אותו לדף האירוע הנכון, ולכן
 * יעד ההמרה הראשון שלו הוא `event_page_click` — אבל לא היחיד.
 *
 * ─────────────────────────────────────────────────────────────────────
 *  היררכיית הפעולה — נקבעה פעם אחת, ומוחזקת בכל חמשת הדפים של הסבב
 * ─────────────────────────────────────────────────────────────────────
 * שלושה מסלולים חיים באתר — המגדיר, בנאי ארבע השאלות, ווואטסאפ — ושלושתם
 * בעמוד אחד מדללים זה את זה אם הם מוצגים כשלוש אפשרויות שוות. הדירוג:
 *
 *   1. **המגדיר** (`MenuConfigurator`, עוגן `#quote`). זה מה שהענבר נושא,
 *      וזה היעד של כל CTA ראשי בעמוד — בהירו, בבאנד הסוגר, ובפס הדביק.
 *      בנאי ארבע השאלות **אינו מסלול מתחרה**: `MenuConfigurator` בולע
 *      בעצמו את המצב שאין בו מנות ומגיש אותו במקומו. משטח אחד, לא שניים,
 *      ולכן אין בעמוד גם `QuoteCta` וגם מגדיר.
 *   2. **וואטסאפ** — ירוק, לעולם לא ענבר. פעמיים בעמוד לכל היותר: לצד
 *      ה־CTA הראשי בהירו, ובבאנד הסוגר. לא באנד וואטסאפ נפרד באמצע.
 *   3. **טלפון** — שורת טקסט מתחת למקבץ, אף פעם לא פקד שלישי (L-10).
 *
 * החריג היחיד בסבב הוא `/urgent`, ש־`shared/routes.ts` מצהיר עליו
 * ‎`ctaMode: "phone"` / `hasBuilder: false`. שם 1 ו־3 מתחלפים, וזה מוסבר
 * בקובץ עצמו.
 *
 * ─────────────────────────────────────────────────────────────────────
 *  שתי סטיות מכוונות מנוסח המפרט
 * ─────────────────────────────────────────────────────────────────────
 *  1. **הכותרת.** ‎§4 P-07 מצטט `קייטרינג לאירועים | מאמא מיה — שלושה
 *     מטבחי מסעדה`, ו־`PAGE_META` ב־`lib/seo.ts` עדיין מחזיק אותה כלשונה.
 *     «שלושה מטבחי מסעדה» היא בדיוק הטענה שנמחקה — הקייטרינג יוצא ממטבח
 *     **אחד** שזהותו לא נמסרה. הדף קורא לכן את הרשומה מ־
 *     ‎`lib/page-meta-extra.ts`, שהיא הרשומה המתוקנת.
 *
 *  2. **הבנאי.** ‎§4 P-07 כותב «No builder; one text CTA to /quote».
 *     ‎`shared/routes.ts` — הסמכות על `RouteDef` — מצהיר `hasBuilder:
 *     true`, `ctaMode: "quote"`, `stickyBar: "quote"`, והמגדיר מרונדר
 *     בהתאם. הוא יושב **אחרי** רשת האירועים: מי שבא לבחור אירוע בוחר
 *     קודם, ומי שכבר יודע גולל גלילה אחת.
 *
 * ─────────────────────────────────────────────────────────────────────
 *  המערכת החזותית
 * ─────────────────────────────────────────────────────────────────────
 * ‎`docs/spec/04-visual-reference.md` גובר על 03 §2–§6: קרקע כהה, ענבר
 * ‎`#F39402` שנושא כל פעולה, Assistant אחת בלי זוג סריפי, סקאלה מרוסנת.
 * הקובץ הזה אינו כותב אף hex ואף `font-serif` — כל ערך מגיע מהתפקיד
 * הסמנטי, ולכן באנד השאלות מתהפך לקרם בלי variant ובלי prop.
 *
 * ─────────────────────────────────────────────────────────────────────
 *  מה נשמט היום
 * ─────────────────────────────────────────────────────────────────────
 *   ReviewsBlock · Gallery   `content/proof.ts` ריק ⇒ אין סקשן הוכחה,
 *                            ואין דירוג בהירו. 04 §5 מזהה את מונה
 *                            הביקורות כאות האמון המרכזי בקטגוריה, ובדיוק
 *                            לכן אסור להמציא אותו.
 *   OpsFacts · LimitsBlock   אין שורת מגבלה שנמסרה.
 *   פריטי שאלות שקשורים למשבצת ריקה — כל אחד נגזם לחוד.
 */

import * as React from "react";
import { useLocation } from "wouter";
import { Head } from "@/components/seo/head";
import { CtaPair, Num, Prose, SectionHeader } from "@/components/primitives";
import { FaqBand, KitchenNote, type FaqItem } from "@/components/bands";
import { MenuConfigurator } from "@/components/configurator";
import { ContactBar, Gallery, OccasionGrid, ReviewsBlock } from "@/components/trust";
import { CATERING_NAME, PHONE, SLOTS, filled, telLink } from "@/content/business";
import { buildableOccasions } from "@/content/occasions";
import { hasAnyProof } from "@/content/proof";
import { kashrutClauseHe, resolveExtraMeta, stripEmptyJsonLd } from "@/lib/page-meta-extra";
import type { PageMetaExtra } from "@/lib/page-meta-extra";
import {
  buildBreadcrumbList,
  buildFaqPage,
  buildService,
  buildWebPage,
} from "@/lib/seo";
import { buildWaHref, capturePhoneClick, captureWaIntent, newRef } from "@/lib/lead-client";
import { track } from "@/lib/analytics";
import { isServedPath, normalizePath } from "@shared/routes";
import type { OccasionId } from "@/content/occasions";

/** הרשומה קיימת תמיד ב־`page-meta-extra`; היעדרה הוא באג ולא מצב. */
const META = resolveExtraMeta("/catering") as PageMetaExtra;

const SOURCE_PAGE = "/catering";

/**
 * הטענה היחידה המותרת על מוצא האוכל, בלשון יחיד. נכתבת פעם אחת ומשמשת גם
 * בשאלות וגם בקישור למטבח — כדי שלא ייווצרו שתי גרסאות שאחת מהן תיסחף
 * ל«שלושה מטבחים» בעריכה הבאה.
 */
const KITCHEN_FACT_HE =
"הקייטרינג מבושל במטבח של מסעדה פעילה — מטבח שמבשל כל יום לסועדים שיושבים בו, ולא מטבח שנפתח לצורך אירועים.";

/* ═══════════════════ מסלול הוואטסאפ בהירו ═══════════════════ */

/**
 * חוזה §6.1–§6.3: קליטה מקדימה ואז ניווט **באותו tick**, בלי `await`.
 * המזהה נוצר ברינדור, ולכן ה־`href` הסטטי נושא אותו גם בלי JS.
 *
 * ‎TODO(01 §5.7): עותק נוסף של אותו קוד (`WhatsAppBand`, `ContactBar`,
 * ‎`pages/home.tsx`, `pages/menus.tsx`). מקומו ב־`lib/whatsapp.ts
 * openWhatsApp()` — מדווח.
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

type PageFaq = FaqItem & { answerHe: string | null };

/**
 * פריטים **חוצי־אירועים** — זה מה שהופך אותם לשייכים למפרק ולא לדף אירוע
 * מסוים. סט אחר לגמרי מזה שב־`/menus` ומזה שבדף הבית (T-1).
 *
 * שלושת הראשונים עונים היום, וזה שינוי מכוון: קודם כל השאלות היו קשורות
 * למשבצות ריקות, ולכן `FAQPage` לא נפלט בכלל — כלומר הדף המרכזי של
 * הקטגוריה לא מסר למנוע תשובות אף עובדה שניתן לצטט. השלושה שנוספו נכונים
 * כשכל משבצת ריקה: אחד נגזר מרשימת האירועים שנבנית ממילא, אחד הוא עובדת
 * המטבח, ואחד הוא הכשרות דרך הבורר.
 *
 * כל תשובה כתובה כמשפט שלם שעומד בפני עצמו מחוץ להקשר — זו היחידה שמנוע
 * תשובות מצטט מילה במילה.
 */
function faqItems(occasionNamesHe: readonly string[]): PageFaq[] {
  return [
    {
      id: "faq-occasions",
      questionHe: "לאילו אירועים קייטרינג מאמאמיה עושה תפריט?",
      answerHe:
        occasionNamesHe.length > 0
          ? `${occasionNamesHe.join(", ")}. לכל אחד מהם יש דף נפרד עם התפריט והתשובות של אותו אירוע.`
          : null,
    },
    {
      id: "faq-kitchen",
      questionHe: "מי מבשל את האוכל?",
      answerHe: KITCHEN_FACT_HE,
    },
    {
      id: "faq-kashrut",
      questionHe: "האם הקייטרינג כשר?",
      /* דרך הבורר, כלשון הבעלים. לעולם לא כמחרוזת קשיחה (LAW 1). */
      answerHe: (() => {
        const k = kashrutClauseHe("general");
        return k ? `הקייטרינג ${k}.` : null;
      })(),
    },
    {
      id: "faq-how",
      questionHe: "איך מקבלים הצעה?",
      answerHe:
"בונים את התפריט כאן בדף ומשאירים פרטים, או שולחים את פרטי האירוע בוואטסאפ. אנחנו חוזרים אליכם, עוברים על מספר הסועדים ועל התאריך, ושולחים הצעה בכתב.",
    },
    {
      id: "faq-lead-time",
      questionHe: "כמה זמן מראש צריך להזמין?",
      answerHe: filled(SLOTS.leadTime) ? SLOTS.leadTime : null,
    },
    {
      id: "faq-response",
      questionHe: "תוך כמה זמן חוזרים אליי?",
      answerHe: filled(SLOTS.responseTime) ? SLOTS.responseTime : null,
    },
    {
      id: "faq-headcount",
      questionHe: "עד מתי אפשר לעדכן מספר סועדים?",
      answerHe: filled(SLOTS.headcountDeadline) ? SLOTS.headcountDeadline : null,
    },
    {
      id: "faq-payment",
      questionHe: "מה תנאי התשלום והביטול?",
      answerHe: filled(SLOTS.paymentTerms) ? SLOTS.paymentTerms : null,
    },
  ];
}

/* ═══════════════════ המגדיר ═══════════════════ */

/**
 * ‎04 §6: המגדיר **בונה** את האירוע במקום **לבקש** הצעה בארבע שאלות. מי
 * שהשקיע דקות בבחירת מנות נוטש הרבה פחות, והליד נושא את הבחירות עצמן.
 *
 * ‎`MenuConfigurator` בולע בעצמו את המצב שאין בו מנות ומגיש במקומו את בנאי
 * ארבע השאלות — ולכן הסקשן הזה **לעולם אינו ריק**, ואין כאן שער.
 *
 * ‎`[&_.wrap]` / `[&_.sec]` מנטרלים את המרזב והריפוד של הבנאי הפנימי: הוא
 * מרנדר `.sec .wrap` משלו, ובתוך העטיפה כאן זה היה מרזב כפול. אין כאן
 * דריסת צבע או טיפוגרפיה.
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
          title="לא בטוחים לאיזה סוג זה שייך?"
          lede="לא צריך להחליט קודם. מספרים לנו על האירוע, ואנחנו משייכים אותו ומחזירים הצעה בכתב."
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

/* ═══════════════════ העמוד ═══════════════════ */

export default function Catering() {
  const wa = useHeroWhatsApp();

  /**
   * שני שערים, שניהם במקור אחד: `buildableOccasions()` מסנן לפי המשבצות,
   * ו־`isServedPath` מסנן לפי `shared/routes.ts`. אירוע שהשער שלו סגור —
   * שבעה, ימי גיבוש, עמדת פסטה — **אינו קיים ברשת**, לא ככרטיס מעומעם
   * ולא כ«בקרוב».
   */
  const served = React.useMemo(
    () =>
      buildableOccasions().filter((o) => {
        const path = normalizePath(o.route);
        return path !== SOURCE_PAGE && isServedPath(path);
      }),
    [],
  );

  const servedIds = React.useMemo<OccasionId[]>(() => served.map((o) => o.id), [served]);
  const faqs = React.useMemo(() => faqItems(served.map((o) => o.nameHe)), [served]);
  const answered = faqs.filter(
    (f): f is FaqItem & { answerHe: string } => f.answerHe !== null,
  );

  const proof = hasAnyProof();

  /* ‎§3.1 — המספור נקבע לפי מיקום. סקשן שנשמט אינו משאיר חור ברצף.
     הבאנד הסוגר אינו ממוספר: הוא אינו פרק, הוא הדרך לפנות. */
  const order = [
    servedIds.length > 0 ? "events" : null,
"quote",
    proof ? "proof" : null,
"kitchen",
    answered.length > 0 ? "faq" : null,
  ].filter((k): k is string => k !== null);

  const num = (key: string) => {
    const i = order.indexOf(key);
    return i < 0 ? undefined : String(i + 1).padStart(2, "0");
  };

  /* גיזום ברמת הפסוקית (G5). הכשרות נקראת מהמשבצת ולא נכתבת קשיח. */
  const facts = ["מטבח של מסעדה פעילה", kashrutClauseHe("general")].filter(
    (c): c is string => Boolean(c),
  );

  return (
    <>
      <Head
        meta={META}
        jsonLd={[
          /* CollectionPage — הדף אוסף את דפי האירועים.
             `Service` נפלט לזיהוי ישות ולא לקישוט תוצאות: אין לו תוצאה
             עשירה מקבילה בגוגל. **בלי `areaServed`** — אזור השירות הוא
             משבצת ריקה, ואין לגזור אותו ממיקומי המסעדות. */
          stripEmptyJsonLd(buildWebPage(META, { type: "CollectionPage" })),
          stripEmptyJsonLd(
            buildService({
              path: SOURCE_PAGE,
              nameHe: CATERING_NAME,
              descriptionHe: META.descriptionHe,
            }),
          ),
          buildBreadcrumbList(META.breadcrumb),
          buildFaqPage(answered),
        ]}
      />

      {/* ═══ ההירו ═══
          כותרת קצרה, שתי שורות, בסקאלה המרוסנת של 04 §3. הפקד הממולא
          מוביל למגדיר; וואטסאפ ירוק לצדו; הטלפון שורת טקסט מתחת. */}
      <section className="pb-sec pt-[clamp(1.75rem,4vw,3rem)]">
        <div className="wrap">
          <p className="eyebrow m-0">{CATERING_NAME}</p>

          <h1 className="mt-4 max-w-measure text-4xl font-bold">
            אותו מטבח.
            <br />
            תפריט אחר לכל אירוע.
          </h1>

          <Prose size="lede" measure="lede" className="mt-6">
            <p>
              ארוחת צוות, שמחה פרטית, שולחן חג או תפריט חלבי. בוחרים את סוג האירוע ומגיעים
              לדף שמדבר עליו — או בונים את התפריט כאן, ומקבלים הצעה בכתב.
            </p>
          </Prose>

          {facts.length > 0 ? (
            <ul className="m-0 mt-6 flex list-none flex-wrap gap-2 p-0">
              {facts.map((fact, i) => (
                <li
                  key={fact}
                  className={[
"m-0 rounded-pill border border-solid px-[.9rem] py-[.4rem] text-2xs font-semibold",
                    /* פסוקית הכשרות היא הראשונה שקונה מחפש בקטגוריה, ולכן
                       היא זו שנושאת את הענבר. */
                    i === facts.length - 1 && facts.length > 1
                      ? "border-accent text-accent"
                      : "border-rule-control text-fg-muted",
                  ].join(" ")}
                >
                  {fact}
                </li>
              ))}
            </ul>
          ) : null}

          {/* L-10: פקד ממולא אחד. הענבר נושא את המסלול הראשי, וואטסאפ ירוק
              לצדו, והטלפון שורת טקסט מתחת — ולא פקד שלישי במקבץ.
              ‎`ContactBar` אינו משמש כאן בכוונה: הוא מרנדר וואטסאפ ראשון
              בסדר ה־DOM, וזה היה מציב את המסלול השני לפני הראשון. */}
          <CtaPair
            className="mt-8"
            primary={{ label: "לבנות את התפריט לאירוע", href: "#quote" }}
            secondary={{
              label: "לכתוב לנו בוואטסאפ",
              variant: "wa",
              href: wa.href,
              target: "_blank",
              rel: "noopener noreferrer",
              onClick: wa.onClick,
            }}
          />

          <p className="mt-5 max-w-none text-xs text-fg-subtle">
            או בטלפון{" "}
            <a
              href={telLink()}
              data-tel=""
              className="font-semibold text-fg no-underline hover:text-accent"
              onClick={() => capturePhoneClick({ callLocation: "hero" })}
            >
              <Num>{PHONE.display}</Num>
            </a>
          </p>

          {/* INV-6: קליק על וואטסאפ כותב שורת ליד לפני שנפתחת האפליקציה,
              ולכן הודעת סעיף 11 צמודה לפקד. אין להסיר אותה כדי «לנקות»
              את ההירו. */}
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

          {/* ‎04 §5: מונה הביקורות הוא אות האמון המרכזי בקטגוריה. ריק היום
              ⇒ הרצועה אינה מרונדרת, ואין מקום שמור שנראה כמו חור. */}
          <ReviewsBlock ratingOnly className="mt-6" />
        </div>
      </section>

      {/* 01 · רשת האירועים — עמוד השדרה של הקישור הפנימי (INV-8), וגם
          יעד ההמרה הראשון של המפרק (`event_page_click`). הכרטיסים נושאים
          את הענבר בשברון ובגבול ה־hover. */}
      {servedIds.length > 0 ? (
        <section id="events" className="sec sec--alt">
          <div className="wrap">
            <OccasionGrid
              only={servedIds}
              columns={3}
              eyebrow="לאיזה אירוע"
              title="סוגי האירועים"
              lede="כל כרטיס הוא דף עם התפריט, המגבלות והתשובות של אותו אירוע."
            />
          </div>
        </section>
      ) : null}

      <ConfiguratorSection num={num("quote")} />

      {/* ‎`content/proof.ts` ריק ⇒ אין סקשן. אין ריבוע אפור, אין דירוג
          לדוגמה, ואין «בקרוב». */}
      {proof ? (
        <section id="proof" className="sec">
          <div className="wrap">
            <SectionHeader num={num("proof")} eyebrow="מה אומרים" title="לקוחות שכבר הזמינו" />
            <ReviewsBlock className="mt-2" />
            <Gallery className="mt-10" columns={3} />
          </div>
        </section>
      ) : null}

      <KitchenNote num={num("kitchen")} />

      {/* הקריאה הארוכה על קרקע קרמית — מדיניות ההחלפה ב־`index.css`
          מייעדת בדיוק אותה לקרקע הבהירה. הענבר נגזר שם מחדש ל־`--amber-ink`
          בלי שהקוד כאן יודע על כך דבר. */}
      {answered.length > 0 ? (
        <div data-band="cream">
          <FaqBand
            id="faq"
            num={num("faq")}
            items={faqs}
            eyebrow="לפני שמזמינים"
            title="שאלות שנשאלות בטלפון"
          />
        </div>
      ) : null}

      {/* ═══ הבאנד הסוגר ═══
          מי שגלל עד לכאן קרא הכול ועדיין לא פנה. אותם שלושה ערוצים של
          ההירו, באותו סדר, בלי לבקש דבר חדש. */}
      <section id="contact" className="sec sec--alt">
        <div className="wrap">
          <SectionHeader
            eyebrow="לסגור את האירוע"
            title="נבנה לכם תפריט"
            lede="ספרו לנו על האירוע ונחזור אליכם עם תפריט והצעה בכתב. אפשר גם פשוט לכתוב בוואטסאפ."
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
    </>
  );
}
