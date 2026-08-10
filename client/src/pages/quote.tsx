/**
 * ═══════════════════════════════════════════════════════════════════════
 *  P-17 · `/quote` — התפריט שלכם. spec 01 §4 P-17, 02 §3.
 * ═══════════════════════════════════════════════════════════════════════
 *
 * העמוד היחיד שכל תכליתו הוא משטח הבנייה. הוא גם יעד כל קישור «קבלו
 * הצעה» במייל, בוואטסאפ, במודעות ובדפוס — ולכן הוא רזה במכוון: כותרת,
 * משפט אחד, שורת אמון, ומיד המשטח. שום דבר אחר לא נכנס מעל הקיפול.
 *
 * ‎§5.4: **המשטח לעולם אינו lazy במסלול נחיתה.** הוא מיובא סטטית כאן,
 * כי הצ׳אנק שלו הוא התוכן, לא תוספת לו.
 *
 * ─────────────────────────────────────────────────────────────────────
 *  היררכיית ההמרה — זהה בששת העמודים שבבעלות הקובץ הזה
 * ─────────────────────────────────────────────────────────────────────
 *   1. **הבנייה — משטח אחד בעמוד.** כאן הוא *כל* העמוד, ולכן אין בהירו
 *      ‎`CtaPair` כלל: פקד ענבר שגולל אל טופס שכבר על המסך הוא רעש, וגם
 *      הפקד הממולא היחיד שמותר לעמוד היה נשרף עליו.
 *   2. **וואטסאפ — קישור טקסט אחד בהירו.** לא כפתור: כפתור ירוק מעל
 *      טופס פתוח מושך החוצה ממנו. הפקד הירוק המלא יושב **בתוך** המשטח,
 *      בשלב פרטי הקשר, שהוא רגע ההחלטה.
 *   3. **טלפון — קישור טקסט,** לצידו.
 *
 * ─────────────────────────────────────────────────────────────────────
 *  איזה משטח מוגש
 * ─────────────────────────────────────────────────────────────────────
 * ‎`MenuConfigurator` כשיש מנות וחבילות; בנאי ארבע השאלות כשאין (04 §6).
 * שניהם יושבים על אותו עוגן `#quote` ובאותה עטיפת `--bg-form`, ולכן
 * המעבר ביניהם אינו משנה אף קישור נכנס ואף מדידה.
 *
 * ‎**מגבלה מתועדת:** ל־`MenuConfigurator` אין `seed`. כל עוד הוא כבוי זה
 * חסר משמעות; ברגע שיידלק, `?event=` ו־`?guests=` מקמפיין יפסיקו לזרוע.
 * תוספת `seed` ל־`MenuConfiguratorProps` מבוקשת בדוח החזרה.
 *
 * ─────────────────────────────────────────────────────────────────────
 *  מה נשמט, ולמה
 * ─────────────────────────────────────────────────────────────────────
 *   BriefCard    ‎`quote/brief-card.tsx` מרנדר את הבחירה המצטברת **מתוך**
 *                הבנאי, ושם היא נמצאת.
 *   TermsStrip   הרצועה חיה בתוך מסך 5 של הבנאי ומתקפלת לבדה כשכל
 *                התנאים ריקים (G10). אין לה עותק שני בעמוד.
 *   TastingBand  ‎`tastingPolicy` ריק ⇒ שער 02 §1.6 נכשל.
 *   ReviewsBlock מרונדר, ומחזיר `null` היום — `content/proof.ts` ריק.
 *                הוא נשאר בקוד **בלי שער בעמוד**, בשונה מ־`/menus`
 *                ו־`/kitchen`: כאן הוא שורה בשורת האמון של ההירו ולא
 *                סקשן עם padding משלו, ולכן היעדרו אינו מותיר חור.
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
 *  3. **‎`?dishes=` אינו נקלט עדיין.** מזהה מנה בלי קטלוג מנות אינו ניתן
 *     להמרה לשם, וזריעת מזהה בלי שם הייתה מציגה שורה בלי תוכן.
 *
 * ─────────────────────────────────────────────────────────────────────
 *  אחרי השליחה
 * ─────────────────────────────────────────────────────────────────────
 * ‎`onSubmitted` מנווט ל־`/thanks?ref=` — **מעבר מסלול, לא החלפה במקום**
 * (02 §5.1). התשובות נוסעות ב־`history.state`, כדי ש־`/thanks` יוכל
 * להדהד את הבריף מיד; ה־`?ref=` בכתובת הוא מה ששורד רענון והעברה הלאה.
 *
 * ‎`stickyBar` הוא `'none'` (01 §2, 02 §1.7): פס המרה מעל טופס המרה הוא
 * שני פקדים ממולאים באותו viewport, והמשטח כבר על המסך.
 */

import * as React from "react";
import { useLocation, useSearch } from "wouter";
import { Head } from "@/components/seo/head";
import { Num, Prose, SectionHeader } from "@/components/primitives";
import { QuoteBuilder } from "@/components/quote/quote-builder";
import type { QuoteAnswers, QuoteSeed } from "@/components/quote/use-quote-builder";
import { MenuConfigurator } from "@/components/configurator";
import { KashrutBadge, ReviewsBlock } from "@/components/trust";
import { BRANCHES, PHONE, telLink, waLink, type BranchId } from "@/content/business";
import { hasConfigurator } from "@/content/dish-categories";
import { hasPackages } from "@/content/packages";
import { buildWaHref, capturePhoneClick, captureWaIntent } from "@/lib/lead-client";
import { track } from "@/lib/analytics";
import { buildBreadcrumbList, buildWebPage, PAGE_META } from "@/lib/seo";

const META = PAGE_META["/quote"];

const SOURCE_PAGE = "/quote";

/** המשטח שמוגש בפועל. ראו «איזה משטח מוגש» למעלה. */
const CONFIGURATOR_LIVE = hasConfigurator() && hasPackages();

const WA_OPENER = "היי, אשמח לקבל הצעה לאירוע.";

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

  const onSubmitted = React.useCallback(
    (ref: string, answers: QuoteAnswers) => {
      navigate(`/thanks?ref=${encodeURIComponent(ref)}`, { state: { ref, answers } });
    },
    [navigate],
  );

  /**
   * קליטה מקדימה ואז ניווט **באותו tick**, בלי `await` — Safari חוסם
   * ניווט ברגע שה־promise נכנע. ה־href הסטטי נשאר תקין ללא JS.
   *
   * ‎`WA_LOCATIONS` הוא איחוד סגור; `quote_alt` הוא הערך שמתאר בדיוק את
   * מה שקורה כאן — וואטסאפ כחלופה למשטח הבנייה.
   */
  const onWhatsApp = React.useCallback((e: React.MouseEvent) => {
    if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    track("whatsapp_click", { wa_location: "quote_alt", has_lead: false });
    const ref = captureWaIntent({ waLocation: "quote_alt" });
    track("whatsapp_handoff", { lead_ref: ref, wa_location: "quote_alt" });
    window.location.href = buildWaHref({}, ref);
  }, []);

  return (
    <>
      <Head
        meta={META}
        jsonLd={[
          buildWebPage(META, { type: "ContactPage" }),
          buildBreadcrumbList(META.breadcrumb),
        ]}
      />

      {/* הירו מכווץ: h1, משפט אחד, שורת אמון, ושני קישורי טקסט. */}
      <section className="pb-10 pt-[clamp(2rem,5vw,3.5rem)]">
        <div className="wrap">
          <p className="eyebrow m-0">בקשת הצעה</p>

          <h1 className="mt-4 max-w-measure">בואו נבנה את התפריט שלכם</h1>

          <Prose size="lede" measure="lede" className="mt-5">
            <p>
              {CONFIGURATOR_LIVE
                ? "בוחרים מנות, משאירים פרטים, ומקבלים הצעה על התפריט שבניתם."
                : "ארבע שאלות על האירוע, ואז פרטים ליצירת קשר. אין שדה תקציב, ואין מה למלא כדי לראות מחיר."}
            </p>
          </Prose>

          {/* שורת האמון. שני הנשאים שואלים שער בעצמם — הכשרות נדלקת היום,
              הדירוג עדיין לא. שורה, לא סקשן: היעדר אינו מותיר חור. */}
          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
            <KashrutBadge variant="pill" size="sm" />
            <ReviewsBlock ratingOnly />
          </div>

          {/* שני ערוצי המשנה, בשורה אחת ובמשקל טקסט. */}
          <p className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-fg-subtle">
            <span>
              מעדיפים לכתוב?{" "}
              <a
                href={waLink(WA_OPENER)}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-fg no-underline hover:text-accent"
                onClick={onWhatsApp}
              >
                וואטסאפ
              </a>
            </span>
            {/* לא `text-fg-decor`: הטוקן הזה הוא non-text בלבד (4.08:1).
                המפריד הוא תו, גם כשהוא `aria-hidden`. */}
            <span aria-hidden="true" className="text-fg-subtle">
              ·
            </span>
            <span>
              או בטלפון{" "}
              <a
                href={telLink()}
                data-tel=""
                className="font-semibold text-fg no-underline hover:text-accent"
                onClick={() => capturePhoneClick({ callLocation: "quote_hero" })}
              >
                <Num>{PHONE.display}</Num>
              </a>
            </span>
          </p>
        </div>
      </section>

      {/*
        משטח הבנייה — הבאנד `--bg-form` היחיד בעמוד (03 §2.1).

        ‎`showHeader={false}` והכותרת נכתבת כאן, כי **המספר נקבע לפי מיקום**
        (01 §3.1) ורק העמוד יודע באיזה מיקום המשטח יושב אצלו. ‎`sectionNum`
        בבנאי קשיח על `05`, ובעמוד שיש בו סקשן ממוספר אחד זה חור במספור.
        מדווח בדוח החזרה כבקשה ל־prop `num`.

        העוגן `#quote` יושב על העטיפה ולא על המשטח, כדי שקפיצה מ־CTA תנחת
        על הכותרת ולא מתחתיה.
      */}
      <div id="quote" className="border-y border-solid border-y-[color:var(--rule)] bg-bg-form">
        <div className="wrap pt-sec">
          <SectionHeader num="01" title="התפריט שלכם" reveal={false} />
        </div>

        {CONFIGURATOR_LIVE ? (
          <div className="wrap pb-sec">
            <MenuConfigurator
              id="quote-builder"
              sourcePage={SOURCE_PAGE}
              showHeader={false}
              onSubmitted={onSubmitted}
            />
          </div>
        ) : (
          <QuoteBuilder
            id="quote-builder"
            sourcePage={SOURCE_PAGE}
            seed={seed}
            showHeader={false}
            onSubmitted={onSubmitted}
            className="!pt-0"
          />
        )}
      </div>
    </>
  );
}
