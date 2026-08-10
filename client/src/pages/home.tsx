/**
 * ═══════════════════════════════════════════════════════════════════════
 *  P-01 · `/` — הבית. עמוד הנחיתה של התנועה הממומנת.
 * ═══════════════════════════════════════════════════════════════════════
 *
 * ─────────────────────────────────────────────────────────────────────
 *  מה השתנה בסבב הזה, ולמה
 * ─────────────────────────────────────────────────────────────────────
 * המערכת החזותית עברה ל־`docs/spec/04-visual-reference.md`, שגובר על
 * ‎03 §2–§6: קרקע כהה, ענבר `#F39402` שנושא **כל** פעולה, Assistant אחת
 * בלי זוג סריפי, סקאלה מרוסנת. הקובץ הזה אינו כותב אף hex — כל צבע מגיע
 * מהתפקיד הסמנטי (`bg`, `fg-muted`, `accent`, `rule-control`), ולכן
 * הבאנד הקרמי של השאלות מתהפך לבד בלי variant ובלי prop.
 *
 * **סדר הסקשנים נקבע לפי המרה ולא לפי נעימות:**
 *   הירו → המגדיר → אמון → אירועים → איך זה עובד → שאלות → סגירה.
 * הקונה מגיע מקמפיין עם כוונה קיימת. הדבר השני שהוא רואה חייב להיות
 * המקום שבו הוא בונה את האירוע, לא סיפור על המטבח.
 *
 * ─────────────────────────────────────────────────────────────────────
 *  משמעת המשבצות — לא השתנתה, וזה העיקר
 * ─────────────────────────────────────────────────────────────────────
 * כל טענה בעמוד יורדת מ־`content/business.ts` דרך בורר, או שאינה נכתבת.
 * מה שריק היום ולכן **אינו מרונדר בכלל**: מונה ביקורות, גלריה, מינימום
 * ומקסימום סועדים, זמן תגובה, זמן התראה, אזור שירות, מחירים, תנאי תשלום,
 * טעימות. אין ולו ממלא־מקום אחד, אין «בקרוב», ואין רשת עם תאים ריקים.
 * המבחן: העמוד נראה מכוון וגמור כשכל המשבצות ריקות — כי זה המצב היום.
 *
 * שתי טענות שמותר לכתוב, ושתיהן דרך בורר ולא כליטרל:
 *   · הכשרות — `kashrutClauseHe("general")`, ההצהרה המסוכנת ביותר באתר.
 *   · המטבח — «מטבח של מסעדה פעילה», **בלשון יחיד**. לא שלושה
 *     מטבחים, לא עיר כמוצא האוכל, לא «בואו לטעום הערב במסעדה».
 *     שמות המסעדות הם הקשר מותג בלבד; אין לגזור מהם היקף.
 *
 * ─────────────────────────────────────────────────────────────────────
 *  המספור
 * ─────────────────────────────────────────────────────────────────────
 * הספרות `01…NN` נקבעות **בזמן רינדור לפי מיקום**. `order` למטה הוא
 * המקור היחיד להן, וכל סקשן שנשמט נשמט גם מהרצף — חור במספור הוא האות
 * הרועשת ביותר ל«תבנית עם חלקים חסרים». זה כולל את סקשן השאלות, שנעלם
 * לגמרי כשאין ולו תשובה אחת שנמסרה.
 *
 * ─────────────────────────────────────────────────────────────────────
 *  GEO ו־SEO
 * ─────────────────────────────────────────────────────────────────────
 * ‎JSON-LD: Organization, WebSite, WebPage, Service ו־FAQPage. ה־FAQPage
 * נבנה מאותה רשימה שהבאנד מרנדר ודרך אותו שער בדיוק — אי אפשר לפלוט
 * למנוע שאלה שהמבקר אינו רואה, או להפך. אין `aggregateRating`, אין
 * ‎`Review` ואין `priceRange`: אין דירוג אמיתי ואין מחירון מאושר.
 * היחידה שמצטטים היא תשובת השאלה — ולכן כל תשובה כאן היא משפט שלם
 * שעומד בפני עצמו מחוץ להקשר.
 */

import * as React from "react";
import { useLocation } from "wouter";
import { Head } from "@/components/seo/head";
import { CtaPair, Num, Prose, SectionHeader } from "@/components/primitives";
import { FaqBand, NextSteps, type NextStepLink } from "@/components/bands";
import { MenuConfigurator } from "@/components/configurator";
import { CollectionNotice } from "@/components/quote";
import { hasConfigurator, hasPackages } from "@/content/packages";
import { buildableOccasions } from "@/content/occasions";
import { CATERING_SERVICE_AREA } from "@/content/locations";
import {
  BRANCHES,
  CATERING_NAME,
  PHONE,
  SLOTS,
  filled,
  telLink,
  waLink,
  type Slot,
} from "@/content/business";
import { kashrutClauseHe } from "@/lib/page-meta-extra";
import { buildWaHref, capturePhoneClick, captureWaIntent } from "@/lib/lead-client";
import { track } from "@/lib/analytics";
import {
  PAGE_META,
  buildBreadcrumbList,
  buildFaqPage,
  buildService,
  buildWebPage,
} from "@/lib/seo";
import { isServedPath, normalizePath } from "@shared/routes";

const META = PAGE_META["/"];

/* ═══════════════════ עובדות ובוררים מקומיים ═══════════════════ */

/**
 * הטענה היחידה המותרת על מוצא האוכל, בלשון יחיד. נכתבת פעם אחת ומשמשת
 * גם בהירו, גם בכרטיס האמון וגם בתשובת השאלה — כדי שלא ייווצרו שלוש
 * גרסאות שאחת מהן תיסחף ל«שלושה מטבחים» בעריכה הבאה.
 */
const KITCHEN_FACT_HE =
"הקייטרינג מבושל במטבח של מסעדה פעילה — מטבח שמבשל כל יום לסועדים שיושבים בו, ולא מטבח שנפתח לצורך אירועים.";

/**
 * ‎`א, ב ו־ג` — שמות המסעדות אף פעם לא נכתבים ידנית בגוף העמוד, וגם
 * מספרן אינו נכתב כמילה. «שלוש מסעדות» היה הופך שינוי נתונים לטענה שגויה.
 */
function branchSentence(names: readonly string[]): string {
  if (names.length === 0) return "";
  if (names.length === 1) return names[0];
  return `${names.slice(0, -1).join(", ")} ו${names[names.length - 1]}`;
}

/**
 * מונה ודירוג הביקורות בגוגל.
 *
 * ‎04 §5 מודד שבקטגוריה הזאת **מונה הביקורות הוא אות האמון המרכזי**, ואצלו
 * חסר לגמרי. המשבצת יושבת כאן כ־`null` מפורש ולא כהשמטה שקטה: הבלוק בנוי,
 * מחווט ונכבה, והוא נדלק ברגע שהמספר האמיתי יימסר. מספר משוער, «מאות
 * לקוחות מרוצים» או ממוצע כוכבים שאינו נמדד הם טענה מסחרית שקרית.
 *
 * TODO(owner): מונה ביקורות גוגל, ממוצע הדירוג, וקישור לפרופיל העסק.
 * TODO(dev): מקומה הטבעי ב־`content/business.ts` לצד שאר המשבצות. הקובץ
 * ההוא בבעלות אחרת בסבב הזה — מדווח בדוח החזרה.
 */
const GOOGLE_REVIEWS = null as Slot<{ count: number; ratingHe: string; url: string }>;

const WA_OPENER = "היי, הגעתי מהאתר ורוצה הצעה לקייטרינג.";

/**
 * קליק וואטסאפ: קליטה מקדימה ואז ניווט **באותו tick**, בלי await ובלי
 * בדיקת תשובה — Safari/iOS חוסם פתיחה ברגע שה־promise נכנע. ה־href
 * הסטטי נשאר תקין בלי JS ובפתיחה בלשונית חדשה.
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

/** קישור הטלפון. חוזר בהירו ובבאנד הסוגר, ולכן קומפוננטה ולא שכפול. */
const PhoneLine = ({
  callLocation,
  className,
}: {
  callLocation: string;
  className?: string;
}) => (
  <p className={className}>
    או בטלפון{" "}
    <a
      href={telLink()}
      data-tel=""
      className="font-semibold text-fg no-underline hover:text-accent"
      onClick={() => capturePhoneClick({ callLocation })}
    >
      <Num>{PHONE.display}</Num>
    </a>
  </p>
);

/**
 * ‎INV-6: בכל נקודת איסוף יושבת הודעת איסוף. קליק וואטסאפ כותב שורת ליד
 * לפני שנפתחת האפליקציה, ולכן גם הוא נקודת איסוף — גם כשאין טופס שיישא
 * את ההודעה. בהירו יושבת הגרסה הקצרה; הבאנד הסוגר נושא את `CollectionNotice`
 * המלאה.
 */
const WaNotice = ({ className }: { className?: string }) => (
  <p className={className}>
    בלחיצה על וואטסאפ נשמרת אצלנו פנייה עם הפרטים שבהודעה.{" "}
    <a
      href="/privacy"
      className="underline decoration-rule underline-offset-[.22em] hover:decoration-accent"
    >
      מדיניות הפרטיות
    </a>
.
  </p>
);

/* ═══════════════════ ההירו ═══════════════════ */

/**
 * הבטחה אחת קבועה. אין קרוסלה, אין סלוגן מתחלף, ואין תמונה מעל הקיפול.
 *
 * הריפוד מכוון בכוונה קצר: המשימה של ההירו היא למסור את ההבטחה ולפנות
 * מקום — הקונה צריך להתחיל לבחור מנות בתוך גלילה אחת בנייד ובלי גלילה
 * כלל במסך שולחני. כותרת ענק הייתה דוחפת את המגדיר מתחת לקיפול, וזו גם
 * הסיבה ש־04 §3 מרסן את הסקאלה.
 */
const Hero = () => {
  const onWhatsApp = useWhatsAppHandoff("hero");

  /* התגיות — גיזום ברמת התג. תג ריק יורד לבדו, והשורה כולה יורדת רק אם
     לא נשאר ולו תג אחד. הכשרות עוברת דרך הבורר ולעולם לא כליטרל. */
  const kashrut = kashrutClauseHe("general");

  const badges: { key: string; label: React.ReactNode; accent?: boolean }[] = [];
  if (kashrut) badges.push({ key: "kashrut", label: kashrut, accent: true });
  badges.push({ key: "kitchen", label: "מטבח של מסעדה פעילה" });
  if (filled(SLOTS.responseTime)) {
    badges.push({ key: "response", label: `תשובה תוך ${SLOTS.responseTime}` });
  }
  if (filled(GOOGLE_REVIEWS)) {
    badges.push({
      key: "reviews",
      label: (
        <>
          <Num inline>{GOOGLE_REVIEWS.count}</Num> ביקורות בגוגל
        </>
      ),
      accent: true,
    });
  }

  return (
    <section className="pb-[clamp(2.25rem,4.5vw,3.25rem)] pt-[clamp(1.75rem,4vw,3rem)]">
      <div className="wrap">
        <p className="eyebrow m-0">{CATERING_NAME}</p>

        <h1 className="mt-4 max-w-measure text-4xl font-bold">
          התפריט של המסעדה,
          <br />
          אצלכם באירוע.
        </h1>

        {/* לֶדֶה משלה, ולא העתק של עובדת המטבח. אותה עובדה נאמרת במלואה
            פעם אחת בסקשן האמון ופעם אחת כתשובת שאלה — שלוש הופעות של אותו
            משפט בעמוד אחד הן טקסט דק בעיני מנוע חיפוש, ושכפול בעיני קורא. */}
        <Prose size="lede" measure="lede" className="mt-5">
          <p>
            בונים כאן את התפריט לאירוע ואנחנו חוזרים אליכם עם הצעה בכתב.
            האוכל מבושל במטבח של המסעדה, ומגיע אליכם ביום האירוע.
          </p>
        </Prose>

        {badges.length > 0 ? (
          <ul className="m-0 mt-6 flex list-none flex-wrap gap-2 p-0">
            {badges.map((badge) => (
              <li
                key={badge.key}
                className={[
"m-0 rounded-pill border border-solid px-[.9rem] py-[.4rem] text-2xs font-semibold",
                  badge.accent
                    ? "border-accent text-accent"
                    : "border-rule-control text-fg-muted",
                ].join(" ")}
              >
                {badge.label}
              </li>
            ))}
          </ul>
        ) : null}

        {/* L-10: פקד ממולא אחד. הענבר נושא את הפעולה הראשית, וואטסאפ לצדו,
            הטלפון שורת טקסט מתחת — ולא פקד שלישי במקבץ. */}
        <CtaPair
          className="mt-8"
          primary={{ label: "לבנות את התפריט לאירוע", href: "#quote" }}
          secondary={{
            label: "לכתוב לנו בוואטסאפ",
            variant: "wa",
            href: waLink(WA_OPENER),
            target: "_blank",
            onClick: onWhatsApp,
          }}
        />

        <PhoneLine callLocation="hero" className="mt-5 text-xs text-fg-subtle" />
        <WaNotice className="mt-2 max-w-body text-3xs leading-[1.55] text-fg-subtle" />
      </div>
    </section>
  );
};

/* ═══════════════════ המגדיר ═══════════════════ */

/**
 * ‎04 §6: המגדיר **בונה** את האירוע במקום **לבקש** הצעה בארבע שאלות. מי
 * שהשקיע דקות בבחירת מנות נוטש הרבה פחות, והליד נושא את הבחירות עצמן.
 *
 * ‎`MenuConfigurator` בולע בעצמו את המצב שאין בו מנות ומגיש במקומו את בנאי
 * ארבע השאלות — ולכן הסקשן הזה **לעולם אינו ריק**, ואין כאן שער.
 *
 * הכותרת נכתבת בעמוד ולא בקומפוננטה: המספר נקבע לפי מיקום, וקומפוננטה
 * שמספרת את עצמה יוצרת חור ברצף בעמוד שיש בו סקשן ממוספר אחר. הלֶדֶה
 * נכתבת רק כשהמגדיר חי — במצב המנוון הקומפוננטה כבר מסבירה את עצמה,
 * ושתי פסקאות הסבר זו מעל זו הן רעש.
 *
 * ‎`[&_.wrap]` / `[&_.sec]` מנטרלים את המרזב והריפוד של הבנאי הפנימי:
 * הוא מרנדר `.sec .wrap` משלו, ובתוך העטיפה כאן זה היה מרזב כפול — הכותרת
 * במקום אחד והשדות מוזחים פנימה. אין כאן דריסת צבע או טיפוגרפיה.
 */
const ConfiguratorSection = ({ num }: { num?: string }) => {
  const [, navigate] = useLocation();
  const live = hasConfigurator() && hasPackages();

  return (
    <div
      id="quote"
      className="border-y border-solid border-y-[color:var(--rule)] bg-bg-form py-sec [&_.sec]:py-0 [&_.wrap]:max-w-none [&_.wrap]:px-0"
    >
      <div className="wrap">
        <SectionHeader
          num={num}
          eyebrow="בונים את האירוע"
          title="התפריט שלכם"
          lede={
            live
              ? "בוחרים מנות מול המכסה של החבילה, רואים את התפריט מתמלא, ובסוף משאירים פרטים."
              : undefined
          }
        />

        <MenuConfigurator
          id="quote-builder"
          sourcePage="/"
          showHeader={false}
          onSubmitted={(ref, answers) =>
            navigate(`/thanks?ref=${encodeURIComponent(ref)}`, { state: { ref, answers } })
          }
        />
      </div>
    </div>
  );
};

/* ═══════════════════ האמון ═══════════════════ */

type TrustCard = { key: string; title: string; body: React.ReactNode };

/**
 * שלושה אותות אמון בקטגוריה: ביקורות, כשרות, וצילום. שניים מהם ריקים
 * היום ולכן **אינם מרונדרים**:
 *
 *   · ביקורות — `GOOGLE_REVIEWS` הוא `null`. 04 §5 מזהה את המונה כאות
 *     האמון המרכזי, ובדיוק בגלל זה אסור להמציא אותו.
 *   · גלריה — אין ולו תצלום אחד של אוכל אמיתי בעץ. מסגרת ריקה, תמונת
 *     מלאי או פלייסהולדר אפור גרועים מהיעדר גלריה: הם משדרים שהאתר לא
 *     נגמר. הגלריה נכנסת עם התצלומים, לא לפניהם.
 *
 * מה שנשאר הוא מה שאנחנו באמת יודעים, וזה גם מה שמנוע תשובות יכול לצטט.
 */
const TrustSection = ({ num, cards }: { num?: string; cards: TrustCard[] }) => {
  if (cards.length === 0) return null;

  return (
    <section id="trust" className="sec sec--alt">
      <div className="wrap">
        <SectionHeader
          num={num}
          eyebrow="מי מבשל"
          title="מטבח של מסעדה, לא מטבח ייצור"
          lede={KITCHEN_FACT_HE}
        />

        <ul className="m-0 grid list-none gap-grid p-0 [grid-template-columns:repeat(auto-fit,minmax(240px,1fr))]">
          {cards.map((card) => (
            <li
              key={card.key}
              className="m-0 rounded-card border border-solid border-[color:var(--rule)] bg-bg p-card"
            >
              <h3 className="m-0 text-lg font-semibold">{card.title}</h3>
              <p className="mt-2 max-w-none text-xs leading-[1.6] text-fg-muted">{card.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

/** הכרטיסים נבנים מחוץ לקומפוננטה כדי שהעמוד יידע לספור אותם למספור. */
function trustCards(): TrustCard[] {
  const cards: TrustCard[] = [];
  const kashrut = kashrutClauseHe("general");

  /* עובדת המטבח עצמה יושבת בלֶדֶה של הסקשן ולא ככרטיס — אחרת אותו משפט
     מופיע פעמיים באותה מסגרת. הכרטיסים הם האותות שמסביבה. */

  if (kashrut) {
    cards.push({
      key: "kashrut",
      title: "כשרות",
      /* הערך מגיע מהבורר. אין כאן מחרוזת כשרות כתובה, ואין שם גוף מכשיר
         שלא נמסר — «בד״ץ» אינו גוף אחד, וההשלמה בניחוש היא בדיוק הכשל
         שדף שבעה חסום עליו. */
      body: `הקייטרינג ${kashrut}.`,
    });
  }

  if (BRANCHES.length > 0) {
    cards.push({
      key: "restaurants",
      title: "מאמא מיה",
      /* הקשר מותג בלבד. אין כאן טענה על היקף מערך הקייטרינג, אין מספר
         מטבחים, ואין עיר שממנה יוצא האוכל. */
      body: `מאמא מיה מפעילה את המסעדות ${branchSentence(
        BRANCHES.map((b) => b.name),
      )}. הקייטרינג מבושל במטבח של אחת מהן.`,
    });
  }

  if (filled(GOOGLE_REVIEWS)) {
    cards.push({
      key: "reviews",
      title: "ביקורות בגוגל",
      body: (
        <>
          <Num inline>{GOOGLE_REVIEWS.count}</Num> ביקורות, בדירוג {GOOGLE_REVIEWS.ratingHe}.{" "}
          <a
            href={GOOGLE_REVIEWS.url}
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-rule underline-offset-[.22em] hover:decoration-accent"
          >
            לקריאה בגוגל
          </a>
        </>
      ),
    });
  }

  return cards;
}

/* ═══════════════════ איך זה עובד ═══════════════════ */

/**
 * הסקשן מתאר **תהליך** ולא מוסר עובדה, ולכן הוא תמיד מרונדר. ובדיוק
 * מהסיבה הזאת אין בו זמן תגובה, אין מינימום סועדים ואין מועד אחרון —
 * כל אלה משבצות ריקות, וכל אחת מהן הייתה הופכת תיאור להתחייבות.
 */
const STEPS = [
  {
    title: "מספרים לנו על האירוע",
    body: "כמה סועדים, איזה אירוע, מתי ואיפה. בלי שדה תקציב ובלי טופס ארוך.",
  },
  {
    title: "חוזרים אליכם",
    body: "עוברים איתכם על מספר הסועדים, על התאריך, ועל מה שחשוב לכם שיהיה על השולחן.",
  },
  {
    title: "מרכיבים תפריט",
    body: "בוחרים מנות ומתאימים כמויות. ההצעה נשלחת בכתב, כדי שיהיה מה להראות למי שצריך לאשר.",
  },
  {
    title: "מבשלים, ומגיעים",
    body: "האוכל יוצא מהמטבח של המסעדה ביום האירוע.",
  },
] as const;

const ProcessSection = ({ num }: { num?: string }) => (
  <section id="how" className="sec">
    <div className="wrap">
      <SectionHeader num={num} eyebrow="התהליך" title="איך זה עובד" />

      <ol className="m-0 grid list-none gap-grid p-0 [grid-template-columns:repeat(auto-fit,minmax(230px,1fr))]">
        {STEPS.map((step, i) => (
          <li
            key={step.title}
            className="m-0 rounded-card border border-solid border-[color:var(--rule)] p-card"
          >
            {/* הספרה בענבר — אחת מארבע הנקודות ש־04 §2 שם בהן את המבטא. */}
            <span className="sec__num num">{String(i + 1).padStart(2, "0")}</span>
            <h3 className="mt-3 text-lg font-semibold">{step.title}</h3>
            <p className="mt-2 max-w-none text-xs leading-[1.6] text-fg-muted">{step.body}</p>
          </li>
        ))}
      </ol>
    </div>
  </section>
);

/* ═══════════════════ השאלות ═══════════════════ */

/**
 * **שאלה בלי תשובה אינה שאלה — היא הודאה שאין לנו תשובה.** הפריטים
 * שתשובתם `null` פשוט אינם מרונדרים, ואין ולו פריט אחד ⇒ אין סקשן.
 *
 * כל תשובה כאן היא או עובדה שנמסרה, או **ציטוט ישיר של משבצת** שתידלק
 * ברגע שתימסר. אין תשובה שנוסחה «בערך»: תשובת FAQ היא היחידה שמנוע
 * תשובות מצטט מילה במילה, ותשובה שגויה שם חיה הרבה אחרי שתוקנה כאן.
 *
 * הבאנד יושב על קרם: זו הקריאה הארוכה של העמוד, ומדיניות ההחלפה ב־
 * ‎`index.css` מייעדת בדיוק אותה לקרקע הבהירה. הענבר נגזר שם מחדש
 * ל־`--amber-ink` בלי שהקוד כאן יודע על כך דבר.
 */
function faqItems(): { id: string; questionHe: string; answerHe: string | null }[] {
  const kashrut = kashrutClauseHe("general");
  const area = CATERING_SERVICE_AREA;

  return [
    {
      id: "faq-kitchen",
      questionHe: "מי מבשל את האוכל?",
      answerHe: KITCHEN_FACT_HE,
    },
    {
      id: "faq-kashrut",
      questionHe: "האם הקייטרינג כשר?",
      answerHe: kashrut ? `הקייטרינג ${kashrut}.` : null,
    },
    {
      id: "faq-how",
      questionHe: "איך מזמינים?",
      answerHe:
"בונים את התפריט כאן באתר ומשאירים פרטים, או כותבים לנו בוואטסאפ. אנחנו חוזרים אליכם, עוברים על מספר הסועדים ועל התאריך, ושולחים הצעה בכתב.",
    },
    {
      id: "faq-lead-time",
      questionHe: "כמה זמן מראש צריך להזמין?",
      /* ציטוט המשבצת כלשונה. אין «בדרך כלל שבוע» ואין «ככל שמוקדם יותר». */
      answerHe: filled(SLOTS.leadTime) ? SLOTS.leadTime : null,
    },
    {
      id: "faq-area",
      questionHe: "לאן אתם מגיעים?",
      answerHe: filled(area) && filled(area.descriptionHe) ? area.descriptionHe : null,
    },
    {
      id: "faq-payment",
      questionHe: "איך עובד התשלום?",
      answerHe: filled(SLOTS.paymentTerms) ? SLOTS.paymentTerms : null,
    },
    {
      id: "faq-tasting",
      questionHe: "אפשר לטעום לפני שסוגרים?",
      answerHe: filled(SLOTS.tastingPolicy) ? SLOTS.tastingPolicy : null,
    },
  ];
}

/* ═══════════════════ הבאנד הסוגר ═══════════════════ */

/**
 * המבקר שגלל עד לכאן קרא הכול ועדיין לא פנה. הבאנד הזה הוא ההזדמנות
 * האחרונה, ולכן הוא נושא בדיוק את אותם שלושה ערוצים של ההירו ובאותו סדר —
 * ענבר, וואטסאפ, טלפון — ולא מבקש דבר חדש.
 *
 * ‎`CollectionNotice` המלאה יושבת כאן ולא בהירו: זו נקודת האיסוף שאין בה
 * טופס שיישא את ההודעה, וההודעה בגרסתה המלאה שייכת לתחתית העמוד.
 */
const ClosingSection = ({ num }: { num?: string }) => {
  const onWhatsApp = useWhatsAppHandoff("footer");

  return (
    <section id="contact" className="sec sec--alt">
      <div className="wrap">
        <SectionHeader
          num={num}
          eyebrow="לסגור את האירוע"
          title="נבנה לכם תפריט"
          lede="ספרו לנו על האירוע ונחזור אליכם עם תפריט והצעה. אפשר גם פשוט לכתוב בוואטסאפ."
        />

        <CtaPair
          primary={{ label: "לבנות את התפריט לאירוע", href: "#quote" }}
          secondary={{
            label: "לכתוב לנו בוואטסאפ",
            variant: "wa",
            href: waLink(WA_OPENER),
            target: "_blank",
            onClick: onWhatsApp,
          }}
        />

        <PhoneLine callLocation="footer" className="mt-5 text-xs text-fg-subtle" />
        <CollectionNotice className="mt-5" />
      </div>
    </section>
  );
};

/* ═══════════════════ העמוד ═══════════════════ */

export default function Home() {
  /* הנתונים נבררים פעם אחת, כי אותה בררה קובעת גם מה מרונדר וגם את
     המספור. שני מקורות נפרדים היו מייצרים חור ברצף ביום שאחד מהם ישתנה. */
  const cards = React.useMemo(() => trustCards(), []);
  const faqs = React.useMemo(() => faqItems(), []);
  const answered = faqs.filter(
    (f): f is { id: string; questionHe: string; answerHe: string } => f.answerHe !== null,
  );

  /* דפי האירועים: השער היחיד הוא `shared/routes.ts`. מסלול שאינו מוגש
     היום פשוט אינו קיים ברשת הזאת, ואינו משאיר כרטיס חסר במקומו. */
  const occasionLinks = React.useMemo<NextStepLink[]>(
    () =>
      buildableOccasions()
.map((o) => ({
          href: o.route,
          titleHe: o.nameHe,
          descriptionHe: o.intentHe,
        }))
.filter((link) => {
          const path = normalizePath(link.href);
          return path !== "/" && isServedPath(path);
        }),
    [],
  );

  const order = [
"quote",
    cards.length > 0 ? "trust" : null,
    occasionLinks.length > 0 ? "occasions" : null,
"how",
    answered.length > 0 ? "faq" : null,
"close",
  ].filter((k): k is string => k !== null);

  const num = (key: string) => {
    const i = order.indexOf(key);
    return i < 0 ? undefined : String(i + 1).padStart(2, "0");
  };

  return (
    <>
      <Head
        meta={META}
        jsonLd={[
          /* ‎`Organization` ו־`WebSite` **אינם** נבנים כאן. `buildGraph`
             זורע אותם בכל גרף, בדיוק פעם אחת, כדי ש־`about`, `isPartOf`
             ו־`provider` ייפתרו בכל דף ולא רק בזה. שכפולם כאן היה מייצר
             שני צמתים באותו `@id`. */
          buildWebPage(META),
          /* ‎`areaServed` מושמט: אזור שירות לא נמסר, וגזירה ממיקומי
             המסעדות היא בדיוק האופן שבו נכנסו לאתר הקודם ערי שירות
             מומצאות. */
          buildService({
            path: "/",
            nameHe: CATERING_NAME,
            descriptionHe: META.descriptionHe,
          }),
          buildFaqPage(answered),
          buildBreadcrumbList(META.breadcrumb),
        ]}
      />

      <Hero />

      <ConfiguratorSection num={num("quote")} />

      <TrustSection num={num("trust")} cards={cards} />

      {occasionLinks.length > 0 ? (
        <NextSteps
          id="occasions"
          num={num("occasions")}
          sourcePage="/"
          links={occasionLinks}
          /* ‎0 ⇒ בלי תקרה. הרשימה כבר מסוננת בשער המסלולים, וכל אירוע
             שהמסלול שלו פתוח הוא דלת כניסה נוספת מהחיפוש. */
          limit={0}
          eyebrow="לאיזה אירוע"
          title="מה יוצא מהמטבח"
        />
      ) : null}

      <ProcessSection num={num("how")} />

      {/* הקריאה הארוכה על קרקע קרמית. כל התפקידים נגזרים מחדש מהאטריביוט —
          אין כאן dark: ואין prop של באנד. */}
      {answered.length > 0 ? (
        <div data-band="cream">
          <FaqBand
            id="faq"
            num={num("faq")}
            eyebrow="לפני שמזמינים"
            title="שאלות שנשאלות בטלפון"
            items={faqs}
          />
        </div>
      ) : null}

      <ClosingSection num={num("close")} />
    </>
  );
}
