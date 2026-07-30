/**
 * ═══════════════════════════════════════════════════════════════════════
 *  P-17 · `/quote` — התפריט שלכם. spec 01 §4 P-17, 02 §3.
 * ═══════════════════════════════════════════════════════════════════════
 *
 * העמוד היחיד שכל תכליתו הוא הבנאי. הוא גם יעד כל קישור "קבלו הצעה"
 * במייל, בוואטסאפ, במודעות ובדפוס — ולכן הוא רזה במכוון: כותרת, משפט
 * אחד, ומיד הבנאי. שום דבר אחר לא נכנס מעל הקיפול.
 *
 * ‎§5.4: **הבנאי לעולם אינו lazy במסלול נחיתה.** הוא מיובא סטטית כאן,
 * כי הצ׳אנק שלו הוא התוכן, לא תוספת לו.
 *
 * ─────────────────────────────────────────────────────────────────────
 *  מה נשמט, ולמה
 * ─────────────────────────────────────────────────────────────────────
 *   BriefCard    ‎`quote/brief-card.tsx` מרנדר את הבחירה המצטברת **מתוך**
 *                הבנאי, ושם היא נמצאת. מחוצה לו אין עדיין `useBrief()`
 *                (01 §5.7) ואין קטלוג מנות, ולכן אין מה להדהד מעליו.
 *   TermsStrip   הרצועה חיה בתוך מסך 5 של הבנאי ומתקפלת לבדה כשכל
 *                התנאים ריקים (G10). אין לה עותק שני בעמוד.
 *   TastingBand  ‎`tastingPolicy` ריק ⇒ שער 02 §1.6 נכשל. אין שום נוסח
 *                טעימות באתר כל עוד הוא ריק.
 *
 * ─────────────────────────────────────────────────────────────────────
 *  זריעה מוקדמת מפרמטרים — הכלל הבלתי מתפשר
 * ─────────────────────────────────────────────────────────────────────
 * ‎`useQuoteBuilder` מקבל `seed` ואינו קורא את הכתובת בעצמו, ולכן הפירוק
 * יושב כאן, בשכבת הניתוב. שלושה כללים:
 *
 *  1. **ערך זרוע נשאר גלוי, נבחר וניתן לעריכה.** `applySeed` כותב
 *     לתשובות עצמן ולא לשדה נסתר, והבנאי נפתח בשלב הראשון שלא נענה.
 *     קישור מועבר עם `?event=` שגוי חייב להיראות למי שקיבל אותו — ליד
 *     מתויג לא נכון גרוע מליד חסר, כי מנהל הסניף פועל לפיו.
 *  2. **ערך לא מוכר נזרק בשקט.** `isKnownEventType` מסנן בהוק, ולכן
 *     ‎`?event=` מומצא פשוט לא נכנס. הצ׳יפ `אירוח אצלנו במסעדה` מסונן
 *     שם גם הוא כל עוד `offerAtRestaurant` שקרי — ואין לעקוף אותו כאן.
 *  3. **‎`?dishes=` אינו נקלט עדיין.** מזהה מנה בלי `data/menus.ts` אינו
 *     ניתן להמרה לשם מנה, וזריעת מזהה בלי שם הייתה מציגה בכרטיס הבריף
 *     שורה בלי תוכן. נכנס יחד עם קטלוג המנות.
 *
 * ─────────────────────────────────────────────────────────────────────
 *  אחרי השליחה
 * ─────────────────────────────────────────────────────────────────────
 * ‎`onSubmitted` מנווט ל־`/thanks?ref=` — **מעבר מסלול, לא החלפה במקום**
 * (02 §5.1). התשובות נוסעות ב־`history.state`, כדי ש־`/thanks` יוכל
 * להדהד את הבריף מיד; ה־`?ref=` בכתובת הוא מה ששורד רענון והעברה הלאה.
 *
 * ‎`stickyBar` הוא `'none'` (01 §2, 02 §1.7): פס המרה מעל טופס המרה הוא
 * שני פקדים ממולאים באותו viewport, והבנאי כבר על המסך.
 */

import { useLocation, useSearch } from "wouter";
import { Head } from "@/components/seo/head";
import { Num, Prose, SectionHeader } from "@/components/primitives";
import { QuoteBuilder } from "@/components/quote/quote-builder";
import type { QuoteAnswers, QuoteSeed } from "@/components/quote/use-quote-builder";
import { BRANCHES, PHONE, telLink, type BranchId } from "@/content/business";
import { capturePhoneClick } from "@/lib/lead-client";
import { buildBreadcrumbList, buildWebPage, PAGE_META } from "@/lib/seo";

const META = PAGE_META["/quote"];

/* ═══════════════════ פירוק פרמטרים ═══════════════════ */

/**
 * כינויי ASCII ל־`?event=`. ‎01 §1 קובע נתיבים בלטינית מטעמי תפעול
 * (בוני UTM, שדות CRM, קישור שמועבר בוואטסאפ), ואותו היגיון חל על ערכי
 * פרמטר. הערך **הנשמר** נשאר עברי, כי הוא מגיע כך למסך של בעל העסק.
 * ערך עברי מלא מתקבל גם הוא, כדי שקישור פנימי לא יזדקק לטבלה הזאת.
 */
const EVENT_ALIASES: Readonly<Record<string, string>> = {
  business: "אירוע חברה",
  corporate: "אירוע חברה",
  private: "שמחה פרטית",
  "private-events": "שמחה פרטית",
  "bar-mitzvah": "שמחה פרטית",
  family: "אירוח משפחתי או חג",
  holidays: "אירוח משפחתי או חג",
  "fun-day": "יום כיף או כנס",
  conference: "יום כיף או כנס",
  other: "משהו אחר",
};

/** `herzliya-pituach` ו־`herzliya_pituach` שניהם מתקבלים. */
function readBranch(raw: string | null): BranchId | null {
  if (!raw) return null;
  const key = raw.trim().toLowerCase().replace(/-/g, "_");
  const match = BRANCHES.find((b) => b.id === key);
  return match ? match.id : null;
}

function readGuests(raw: string | null): number | null {
  if (!raw) return null;
  const n = Number.parseInt(raw.trim(), 10);
  return Number.isFinite(n) && n > 0 && n < 100_000 ? n : null;
}

function readSeed(search: string): QuoteSeed | undefined {
  let params: URLSearchParams;
  try {
    params = new URLSearchParams(search);
  } catch {
    return undefined;
  }

  const rawEvent = params.get("event")?.trim() ?? "";
  const eventType = rawEvent ? (EVENT_ALIASES[rawEvent.toLowerCase()] ?? rawEvent) : null;

  const seed: QuoteSeed = {
    eventType,
    guests: readGuests(params.get("guests")),
    branch: readBranch(params.get("branch")),
  };

  /* בלי ולו ערך אחד — לא מעבירים אובייקט, כדי שהבנאי ידע שאין זריעה. */
  return seed.eventType || seed.guests || seed.branch ? seed : undefined;
}

/* ═══════════════════ העמוד ═══════════════════ */

export default function Quote() {
  const seed = readSeed(useSearch());
  const [, navigate] = useLocation();

  const onSubmitted = (ref: string, answers: QuoteAnswers) => {
    navigate(`/thanks?ref=${encodeURIComponent(ref)}`, {
      state: { ref, answers },
    });
  };

  return (
    <>
      <Head
        meta={META}
        jsonLd={[
          buildWebPage(META, { type: "ContactPage" }),
          buildBreadcrumbList(META.breadcrumb),
        ]}
      />

      {/* הירו מכווץ: h1 ומשפט אחד. אין CtaPair — הבנאי עצמו הוא ה־CTA,
          ופקד שגולל אל טופס שכבר על המסך הוא רעש. */}
      <section className="pb-10 pt-[clamp(2rem,5vw,3.5rem)]">
        <div className="wrap">
          <p className="eyebrow m-0">בקשת הצעה</p>

          <h1 className="mt-4 max-w-measure">בואו נבנה את התפריט שלכם</h1>

          <Prose size="lede" measure="lede" className="mt-5">
            <p>
              ארבע שאלות על האירוע, ואז פרטים ליצירת קשר. אין שדה תקציב, ואין
              מה למלא כדי לראות מחיר.
            </p>
          </Prose>

          <p className="mt-5 text-xs text-fg-subtle">
            מעדיפים לדבר?{" "}
            <a
              href={telLink()}
              data-tel=""
              className="text-fg no-underline hover:text-accent"
              onClick={() => capturePhoneClick({ callLocation: "quote_hero" })}
            >
              <Num>{PHONE.display}</Num>
            </a>
          </p>
        </div>
      </section>

      {/*
        הבנאי הוא הבאנד `--paper-3` היחיד בעמוד (03 §2.1).

        ‎`showHeader={false}` והכותרת נכתבת כאן, כי **המספר נקבע לפי מיקום**
        (01 §3.1) ורק העמוד יודע באיזה מיקום הבנאי יושב אצלו. ‎`COPY.sectionNum`
        בבנאי קשיח על `05`, ובעמוד שיש בו סקשן ממוספר אחד זה חור במספור.
        מדווח בדוח החזרה כבקשה ל־prop `num`.

        העוגן `#quote` יושב על העטיפה ולא על הבנאי, כדי שקפיצה מ־CTA תנחת
        על הכותרת ולא מתחתיה.
      */}
      <div
        id="quote"
        className="border-y border-solid border-[color:var(--rule)] bg-paper-3"
      >
        <div className="wrap pt-sec">
          <SectionHeader num="01" title="התפריט שלכם" reveal={false} />
        </div>

        <QuoteBuilder
          id="quote-builder"
          sourcePage="/quote"
          seed={seed}
          showHeader={false}
          onSubmitted={onSubmitted}
          className="!pt-0"
        />
      </div>
    </>
  );
}
