/**
 * ═══════════════════════════════════════════════════════════════════════
 *  P-01 · `/` — הבית. spec 01 §4 P-01, §3.1, §3.3.
 * ═══════════════════════════════════════════════════════════════════════
 *
 * ─────────────────────────────────────────────────────────────────────
 *  למה העמוד קצר, וזו התנהגות תקינה
 * ─────────────────────────────────────────────────────────────────────
 * סדר הסקשנים של P-01 מונה שלושה־עשר בלוקים. רובם נשענים על נתונים
 * שהלקוח טרם מסר, ו־INV-2 קובע שסקשן בלי ולו משבצת מלאה אחת **אינו
 * מרונדר**. המצב היום:
 *
 *   MenuSheet / HeroDishLines  אין `data/menus.ts` ⇒ 0 מנות זמינות
 *                              לקייטרינג. ‎§3.3 שורת "0": העמוד עובר
 *                              לרג׳יסטר התפעולי, סקשן המטבחים מקודם אל
 *                              מתחת להירו, ו־MenuSheet לא מרונדר.
 *   ServiceMenus               אין רשימת "מה כלול" לאף פורמט הגשה.
 *   InclusionsExclusions       priceIncludes / priceExcludes ריקים.
 *   TastingBand                tastingPolicy ריק ⇒ שער §1.6 נכשל.
 *   LimitsBlock                אין שורות מגבלה שנמסרו.
 *   TermsStrip                 מקדמה, ביטול ודדליין סועדים ריקים.
 *   PastEvents                 אין ולו שורה אחת בהסכמה.
 *   Faq                        אין תשובה שנמסרה. שאלה בלי תשובה אינה
 *                              שאלה — היא הודאה שאין לנו תשובה.
 *
 * מה שנשאר הוא מה שאנחנו באמת יודעים: מטבח של מסעדה פעילה, איך התהליך עובד,
 * והדרך לפנות. זה המבחן שהעמוד נבנה לעבור — להיראות מכוון ושלם כשכל
 * המשבצות ריקות, ולא תבנית עם חורים.
 *
 * ─────────────────────────────────────────────────────────────────────
 *  מספור הסקשנים
 * ─────────────────────────────────────────────────────────────────────
 * ‎§3.1: הספרות `01…NN` נקבעות **בזמן רינדור לפי מיקום**, לא קשיחות.
 * `order` למטה הוא המקור היחיד להן, ולכן סקשן שנשמט אינו משאיר חור
 * במספור — החור הזה הוא האות הרועשת ביותר ל"תבנית עם חלקים חסרים".
 *
 * ─────────────────────────────────────────────────────────────────────
 *  הבאנד הכהה
 * ─────────────────────────────────────────────────────────────────────
 * INV-3 מתיר `data-band="ink"` אחד למסלול. `layout/footer.tsx` כבר נושא
 * אותו (`data-band-id="colophon"`), ולכן סקשן המטבחים כאן **אינו** באנד
 * כהה אלא `.sec--alt`. סתירה מדווחת בדוח החזרה.
 */

import * as React from "react";
import { useLocation } from "wouter";
import { Head } from "@/components/seo/head";
import { CtaPair, Num, Prose, Rule, SectionHeader } from "@/components/primitives";
import { QuoteBuilder } from "@/components/quote/quote-builder";
import { BRANCHES, PHONE, SLOTS, filled, telLink, waLink } from "@/content/business";
import { capturePhoneClick, captureWaIntent, buildWaHref } from "@/lib/lead-client";
import { track } from "@/lib/analytics";
import {
  buildBreadcrumbList,
  buildOrganization,
  buildWebPage,
  buildWebSite,
  PAGE_META,
} from "@/lib/seo";

const META = PAGE_META["/"];

/* ═══════════════════ עזרים מקומיים ═══════════════════ */

/** `א, ב ו־ג` — שמות הסניפים אף פעם לא נכתבים ידנית בגוף העמוד. */
function branchSentence(names: readonly string[]): string {
  if (names.length === 0) return "";
  if (names.length === 1) return names[0];
  return `${names.slice(0, -1).join(", ")} ו${names[names.length - 1]}`;
}

/**
 * קליק וואטסאפ: קליטה מקדימה ואז ניווט **באותו tick**.
 * ה־href הסטטי נשאר תקין ללא JS ולפתיחה בלשונית חדשה.
 * ‎TODO(01 §5.7): להעביר ל־`lib/whatsapp.ts openWhatsApp()` כשייווצר.
 */
function useWhatsAppHandoff(location: "hero" | "footer") {
  return React.useCallback(
    (e: React.MouseEvent) => {
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
      e.preventDefault();
      track("whatsapp_click", { wa_location: location, has_lead: false });
      const ref = captureWaIntent({ waLocation: location });
      track("whatsapp_handoff", { lead_ref: ref, wa_location: location });
      window.location.href = buildWaHref({}, ref);
    },
    [location],
  );
}

const WA_OPENER = "היי, הגעתי מהאתר ורוצה הצעה לקייטרינג.";

/* ═══════════════════ 1 · ההירו ═══════════════════ */

/**
 * ‎§4 P-01 + 02 §1.3. אין תמונה מעל הקיפול (L-2), אין רוטציית כותרות,
 * אין קרוסלה. הכותרת קבועה ומשוברת לשלוש שורות טיפוגרפיות.
 */
const MenuHero = () => {
  const names = BRANCHES.map((b) => b.name);
  const onWhatsApp = useWhatsAppHandoff("hero");

  /* שורת העובדות — גיזום ברמת הפסוקית (G5). כל אסימון ריק מוריד את
     הפסוקית שלו בלבד, ולעולם לא את השורה. במצב ההשקה נשארת פסוקית אחת:
     `מטבח של מסעדה פעילה` — היחידה שהיא עובדה שבידינו.
     לא «שלושה מטבחים»: הקייטרינג יוצא מאחת המסעדות, לא משלושתן. */
  const clauses: React.ReactNode[] = [];

  if (filled(SLOTS.responseTime)) {
    clauses.push(<>תשובה תוך {SLOTS.responseTime}</>);
  }
  if (filled(SLOTS.minGuests) && filled(SLOTS.maxGuests)) {
    clauses.push(
      <>
        מ־<Num inline>{SLOTS.minGuests}</Num> ועד <Num inline>{SLOTS.maxGuests}</Num> סועדים
      </>,
    );
  }
  if (names.length > 0) {
    clauses.push(
      <>
        <Num inline>{names.length}</Num> מטבחים
      </>,
    );
  }

  return (
    <section className="pb-sec pt-[clamp(2.5rem,7vw,5rem)]">
      <div className="wrap">
        <p className="eyebrow m-0">קייטרינג · מאמא מיה</p>

        <h1 className="mt-5 max-w-measure text-4xl">
          התפריט של המסעדה
          <br />— אצלכם
          <br />
          באירוע.
        </h1>

        <Prose size="lede" measure="lede" className="mt-7">
          <p>
            קייטרינג מאמאמיה מבושל במטבח של מסעדה איטלקית פעילה — מטבח
            שמבשל כל יום לסועדים שיושבים בו, ולא מטבח שנפתח לצורך אירועים.
            כשר בד״ץ.
          </p>
        </Prose>

        {clauses.length > 0 ? (
          <p className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-fg-subtle">
            {clauses.map((clause, i) => (
              <React.Fragment key={i}>
                {i > 0 ? (
                  <span aria-hidden="true" className="text-fg-decor">
                    ·
                  </span>
                ) : null}
                <span>{clause}</span>
              </React.Fragment>
            ))}
          </p>
        ) : null}

        {/* L-10: primary ממולא אחד, ghost אחד. הטלפון הוא קישור טקסט מתחת,
            ולא פקד שלישי במקבץ. הפקד השני היה `בואו לטעום` — 02 §1.6 קובע
            שכששער הטעימות נכשל, השני הוא וואטסאפ. */}
        <CtaPair
          className="mt-9"
          primary={{ label: "בנו תפריט לאירוע", href: "#quote" }}
          secondary={{
            label: "דברו איתנו בוואטסאפ",
            variant: "ghost",
            href: waLink(WA_OPENER),
            target: "_blank",
            onClick: onWhatsApp,
          }}
        />

        <p className="mt-5 text-xs text-fg-subtle">
          או בטלפון{" "}
          <a
            href={telLink()}
            data-tel=""
            className="text-fg no-underline hover:text-accent"
            onClick={() => capturePhoneClick({ callLocation: "hero" })}
          >
            <Num>{PHONE.display}</Num>
          </a>
        </p>
      </div>
    </section>
  );
};

/* ═══════════════════ 2 · המטבחים ═══════════════════ */

/**
 * ‎§3.1 סקשן 05, מקודם אל מתחת להירו לפי §3.3 שורת "0".
 *
 * הכותרת שבמפרט היא `איפה אוכלים את זה הערב`. המילה `הערב` היא טענה על
 * שעות פתיחה, ו־`SLOTS.openingHours` ריק — לכן היא לא נכתבת כאן. כשיימסרו
 * שעות, הכותרת חוזרת לנוסח המפרט.
 *
 * כל שורה מציגה רק מה שמלא. כתובת, שעות ושם שף נשמטים בשקט, והשורה
 * נשארת שם הסניף — שהוא עובדה מאומתת בפני עצמה.
 */
const KitchensSection = ({ num }: { num?: string }) => {
  const branches = BRANCHES.map((b) => ({
    ...b,
    address: filled(SLOTS.addresses) ? SLOTS.addresses[b.id] : null,
    hours: filled(SLOTS.openingHours) ? SLOTS.openingHours[b.id] : null,
    chef: filled(SLOTS.chefs) ? SLOTS.chefs[b.id] : null,
  }));

  if (branches.length === 0) return null;

  return (
    <section id="kitchens" className="sec sec--alt">
      <div className="wrap">
        <SectionHeader
          num={num}
          eyebrow="המטבחים"
          title="מטבח של מסעדה, לא מטבח ייצור"
          /* בלי `כל יום` ובלי `הערב`: שעות הפעילות הן Slot ריק, וכל אחת
             מהמילים האלה היא טענה עליהן. */
          lede="הקייטרינג מבושל במטבח של מסעדה איטלקית פעילה — מטבח שמבשל כל יום לסועדים שיושבים בו, ולא מטבח שנפתח לצורך אירועים."
        />

        <ul className="m-0 list-none p-0">
          {branches.map((branch, i) => (
            <li key={branch.id} className="m-0">
              {i > 0 ? <Rule /> : null}
              <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2 py-[1.6rem]">
                <h3 className="m-0 font-serif text-2xl font-medium">{branch.name}</h3>

                {branch.isFlagship ? (
                  <span className="rounded-pill border border-solid border-rule-control px-3 py-[.3rem] text-2xs font-semibold text-fg-subtle">
                    מטבח הדגל
                  </span>
                ) : null}

                {/* כתובת, שעות ושף — כל אחד נשמט לחוד. אין כאן תא ריק. */}
                {branch.address || branch.hours || branch.chef ? (
                  <p className="m-0 basis-full text-xs text-fg-muted">
                    {[branch.address, branch.hours, branch.chef].filter(Boolean).join(" · ")}
                  </p>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

/* ═══════════════════ 3 · איך זה עובד ═══════════════════ */

/**
 * ‎§3.1 — הסקשן הזה תמיד מרונדר, כי הוא מתאר תהליך ולא מוסר עובדה.
 * ולכן גם: **אין כאן זמן תגובה, אין מינימום, ואין מועד אחרון**. כל אלה
 * הם Slots ריקים, והם היו הופכים תיאור להתחייבות.
 *
 * ‎`TermsStrip` (מקדמה · ביטול · דדליין סועדים) נשמט לגמרי — G10 מתיר לו
 * להיעלם כשאין ולו תנאי אחד שנמסר.
 */
const STEPS = [
  {
    title: "מספרים לנו על האירוע",
    body: "ארבע שאלות: איזה אירוע, כמה סועדים, מתי, ובאיזה אזור. בלי שדה תקציב ובלי טופס ארוך.",
  },
  {
    title: "חוזרים אליכם",
    body: "עוברים איתכם על מספר הסועדים, על התאריך, ועל מה שחשוב לכם שיהיה על השולחן.",
  },
  {
    title: "מרכיבים תפריט",
    body: "בוחרים מנות מהמטבח ומתאימים כמויות. ההצעה נשלחת בכתב, כדי שיהיה מה להראות למי שצריך לאשר.",
  },
  {
    title: "מבשלים, ומגיעים",
    body: "האוכל יוצא מהמטבח של המסעדה ביום האירוע.",
  },
] as const;

const ProcessSteps = () => (
  <section id="how" className="sec">
    <div className="wrap">
      <SectionHeader title="איך זה עובד" />

      <ol className="m-0 grid list-none grid-cols-1 gap-px border-t border-solid border-[color:var(--rule)] p-0 sm:grid-cols-2">
        {STEPS.map((step, i) => (
          <li key={step.title} className="m-0 border-b border-solid border-[color:var(--rule)] py-7">
            <div className="max-w-body pe-6">
              <span className="block font-serif text-xl font-medium text-fg-subtle num">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-3 font-serif text-lg font-bold">{step.title}</h3>
              <p className="mt-2 text-xs leading-[1.6] text-fg-muted">{step.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  </section>
);

/* ═══════════════════ 4 · התפריט שלכם ═══════════════════ */

/**
 * ‎§3.1 סקשן 06.
 *
 * הכותרת הממוספרת שייכת לעמוד ולא לבנאי: המספר נקבע **לפי מיקום** (§3.1),
 * ורק העמוד יודע באיזה מיקום הבנאי יושב אצלו. `COPY.sectionNum` בתוך
 * ‎`quote-builder.tsx` קשיח על `05`, ובעמוד שבו יש סקשן ממוספר אחד לפניו
 * זה חור במספור — האות הרועשת ביותר ל"תבנית עם חלקים חסרים". לכן
 * ‎`showHeader={false}`. מדווח בדוח החזרה כבקשה ל־prop `num`.
 *
 * העוגן `#quote` יושב על העטיפה ולא על הבנאי, כדי שקפיצה מה־CTA בהירו
 * תנחת על הכותרת ולא מתחתיה.
 *
 * ‎`sourcePage` הוא prop חובה (02 §3.9): הוא מה שהופך את הודעת האיסוף לפי
 * סעיף 11 ואת תיבת ההסכמה השיווקית לחלק בלתי נפרד מהטופס בכל מסלול.
 *
 * ‎`onSubmitted` מנווט ל־`/thanks?ref=` — מעבר מסלול ולא החלפה במקום
 * (02 §5.1). בלעדיו הבנאי מרנדר `QuoteSuccess` במקום, וזה בדיוק שלב
 * ההמרה שאובד בלי שינוי כתובת.
 */
const QuoteSection = ({ num }: { num?: string }) => {
  const [, navigate] = useLocation();

  return (
    <div
      id="quote"
      className="border-y border-solid border-[color:var(--rule)] bg-paper-3"
    >
      <div className="wrap pt-sec">
        <SectionHeader
          num={num}
          title="התפריט שלכם"
          lede="ארבע שאלות על האירוע, ואז פרטים ליצירת קשר. אפשר גם פשוט לכתוב בוואטסאפ."
        />
      </div>

      <QuoteBuilder
        id="quote-builder"
        sourcePage="/"
        showHeader={false}
        className="!pt-0"
        onSubmitted={(ref, answers) =>
          navigate(`/thanks?ref=${encodeURIComponent(ref)}`, { state: { ref, answers } })
        }
      />
    </div>
  );
};

/* ═══════════════════ העמוד ═══════════════════ */

export default function Home() {
  /* ‎§3.1 — מקור המספור היחיד. סקשן שנשמט אינו משאיר חור ברצף. */
  const showKitchens = BRANCHES.length > 0;
  const order = [showKitchens ? "kitchens" : null, "quote"].filter(
    (k): k is string => k !== null,
  );
  const num = (key: string) => {
    const i = order.indexOf(key);
    return i < 0 ? undefined : String(i + 1).padStart(2, "0");
  };

  return (
    <>
      <Head
        meta={META}
        jsonLd={[
          /* ‎P-01: Organization + WebSite + WebPage. בלי aggregateRating,
             בלי Review ובלי priceRange — אין דירוג אמיתי ואין טווח מחיר. */
          buildOrganization({ telephone: PHONE.tel }),
          buildWebSite({}),
          buildWebPage(META),
          buildBreadcrumbList(META.breadcrumb),
        ]}
      />

      <MenuHero />
      {showKitchens ? <KitchensSection num={num("kitchens")} /> : null}
      <ProcessSteps />
      <QuoteSection num={num("quote")} />
    </>
  );
}
