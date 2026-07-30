/**
 * ═══════════════════════════════════════════════════════════════════════
 *  P-18 · `/thanks?ref=` — אישור פנייה. spec 01 §4 P-18, 02 §5.1–§5.2.
 * ═══════════════════════════════════════════════════════════════════════
 *
 * זו **תחנת המרה, לא הודעת תודה.** המימוש הקודם הציג toast וקרא
 * ‎`form.reset()` — הקונה נשאר מול טופס ריק, בלי שום דבר להראות למי
 * שצריך לאשר. כאן הוא מקבל מספר פנייה, ערוץ המשך, ושיחה שכבר התחילה.
 *
 * ─────────────────────────────────────────────────────────────────────
 *  מדידה — מה נורה כאן, ומה במכוון לא
 * ─────────────────────────────────────────────────────────────────────
 * ‎`generate_lead` נורה **פעם אחת בלבד**, בתוך `submitQuote()`, אחרי
 * שהשרת אישר את השמירה (`lib/lead-client.ts`). ירייה נוספת כאן הייתה
 * סופרת כל ליד פעמיים ומרעילה כל אופטימיזציית הצעות מחיר שתיבנה מעליו,
 * וריענון של הדף היה מייצר המרות יש מאין.
 *
 * לכן העמוד **אינו יורה שום אירוע בעלייה**. יעדי ההמרה שלו הם
 * ‎`whatsapp_handoff` ו־`summary_share` (01 §4 P-18) — שניהם אינטראקציה,
 * לא צפייה. הטקסונומיה ב־`lib/analytics.ts` היא איחוד סגור ואין בה שם
 * לצפייה בעמוד אישור; המצאת שם כזאת אסורה במפורש.
 *
 * ─────────────────────────────────────────────────────────────────────
 *  מה נשמט, ולמה — ואלה חוסרי שרת, לא בחירות עיצוב
 * ─────────────────────────────────────────────────────────────────────
 *   הד הבריף      מחייב `GET /api/quote/:ref`. הנתיב לא קיים ב־
 *                 `server/routes.ts`. עד שיהיה, אין מה להדהד.
 *   תיבת ההעשרה   `משהו שכדאי שנדע?` מחייבת `PATCH /api/quote/:ref/notes`.
 *                 גם הוא לא קיים. **תיבת טקסט שבולעת את מה שנכתב בה
 *                 גרועה מהיעדרה** — ולכן היא לא מרונדרת.
 *   `/summary`    המסלול טרם נבנה. קישור אליו היה 404 בדיוק על המנגנון
 *                 שהוא נועד לשרת (הפניה הלאה לגורם המאשר).
 *   שורת הניתוב   `הפנייה נשלחה למטבח ב{סניף}` מותנית בפתרון סניף מתוך
 *                 האזור שנבחר, ומיפוי אזור→סניף הוא Slot ריק.
 *   שורת הטעימות  שער 02 §1.6 נכשל.
 *
 * ─────────────────────────────────────────────────────────────────────
 *  מצבי ה־ref (01 §4 P-18, 02 §5.2)
 * ─────────────────────────────────────────────────────────────────────
 * אין כאן חיפוש בשרת, ולכן ההבחנה היחידה האפשרית היא צורנית:
 *
 *   ‎`ref` תקין צורנית  → אישור מלא עם המספר.
 *   ‎`ref` חסר או פגום  → מעטפת גנרית: `הפנייה נקלטה.` + טלפון + וואטסאפ.
 *                        **לא מסך שגיאה**, ו**לא מהדהדים את הפרמטר הגולמי
 *                        חזרה ל־DOM** — פרמטר שמוזרק לעמוד הוא וקטור XSS
 *                        קלאסי, גם כשהמסגרת מנקה אותו.
 *
 * המצב `ref` תקין־אך־לא־נמצא ייכנס ברגע שיהיה נתיב חיפוש.
 *
 * ‎`stickyBar: 'none'` (02 §1.2) — הפס לעולם אינו מרונדר כאן.
 */

import * as React from "react";
import { useSearch } from "wouter";
import { Head } from "@/components/seo/head";
import { Button, Ltr, Num, Prose } from "@/components/primitives";
import { BriefCard } from "@/components/quote/brief-card";
import { BRANCH_NAME } from "@/components/quote/quote-config";
import type { QuoteAnswers } from "@/components/quote/use-quote-builder";
import { PHONE, SLOTS, filled, telLink, waLink } from "@/content/business";
import { REF_PATTERN } from "@shared/lead-schema";
import { buildWaHref, capturePhoneClick, captureWaIntent } from "@/lib/lead-client";
import { track } from "@/lib/analytics";
import { PAGE_META } from "@/lib/seo";

const META = PAGE_META["/thanks"];

const WA_LABEL = "המשיכו בוואטסאפ";
const WA_OPENER = "היי, שלחתי בקשה להצעה דרך האתר.";

/**
 * הבריף מגיע ב־`history.state` מהניווט של הבנאי (`onSubmitted`), ולא
 * מהשרת — `GET /api/quote/:ref` עדיין לא קיים. לכן:
 *   · הגעה ישירה מהבנאי  → הד מלא של התשובות.
 *   · רענון, קישור שנשמר → מעטפת עם מספר הפנייה בלבד. אין המצאה, ואין
 *     כרטיס עם שורות ריקות.
 *
 * ה־state מאומת שדה־שדה: `history.state` ניתן לזיוף מקונסולה, ואובייקט
 * שרירותי שנכנס ישר ל־`BriefCard` היה מפיל את הרינדור.
 */
function readAnswers(expectedRef: string | null): QuoteAnswers | null {
  if (!expectedRef || typeof window === "undefined") return null;

  const raw = window.history.state as unknown;
  if (!raw || typeof raw !== "object") return null;

  const box = raw as { ref?: unknown; answers?: unknown };
  if (box.ref !== expectedRef) return null;

  const a = box.answers as Partial<QuoteAnswers> | undefined;
  if (!a || typeof a !== "object") return null;

  /* צורה מינימלית תקינה. שדה חסר הופך ל־null/ריק, ו־BriefCard משמיט
     את השורה שלו — אותו כלל גיזום, רק צעד אחד קודם. */
  return {
    eventType: typeof a.eventType === "string" ? a.eventType : null,
    guestBand: typeof a.guestBand === "string" ? (a.guestBand as QuoteAnswers["guestBand"]) : null,
    eventDate: typeof a.eventDate === "string" ? a.eventDate : "",
    dateFlexible: a.dateFlexible === true,
    area: typeof a.area === "string" ? a.area : "",
    areaIsFreeText: a.areaIsFreeText === true,
    branch: typeof a.branch === "string" ? (a.branch as QuoteAnswers["branch"]) : null,
    serviceFormat:
      typeof a.serviceFormat === "string" ? (a.serviceFormat as QuoteAnswers["serviceFormat"]) : null,
    dishes: Array.isArray(a.dishes)
      ? a.dishes.filter(
          (d): d is { id: string; name: string } =>
            !!d && typeof d === "object" &&
            typeof (d as { id?: unknown }).id === "string" &&
            typeof (d as { name?: unknown }).name === "string",
        )
      : [],
  };
}

/** קורא `?ref=` ומחזיר אותו **רק** אם הוא תואם `MM-XXXXXX` בדיוק. */
function readRef(search: string): string | null {
  let raw: string | null = null;
  try {
    raw = new URLSearchParams(search).get("ref");
  } catch {
    raw = null;
  }
  if (!raw) return null;
  const value = raw.trim().toUpperCase();
  return REF_PATTERN.test(value) ? value : null;
}

export default function Thanks() {
  const search = useSearch();
  const ref = readRef(search);

  /* נקרא פעם אחת: `history.state` משתנה תחת הרגליים בכל ניווט. */
  const [answers] = React.useState<QuoteAnswers | null>(() => readAnswers(ref));

  const responseTime = filled(SLOTS.responseTime) ? SLOTS.responseTime : null;

  /* ‎G4 / 02 §5.2 — שורת הניתוב היא **עובדה** על לאן הפנייה הלכה, ולכן
     היא נכתבת רק כשהקונה בחר אזור שמופה לסניף. מיפוי אזור→סניף מגיע
     מ־`SLOTS.servesAreas`; כל עוד הוא ריק אין `branch`, ואין שורה. */
  const routedBranch = answers?.branch ? BRANCH_NAME[answers.branch] : null;

  /* קליטה מקדימה ואז ניווט באותו tick. כשיש ref — הוא נשלח כמות שהוא,
     כדי שהשיחה בוואטסאפ תיתפר לאותה שורת ליד ולא תיצור שנייה. */
  const onWhatsApp = (e: React.MouseEvent) => {
    if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    track("whatsapp_click", { wa_location: "thanks", has_lead: ref !== null });
    const handoffRef = captureWaIntent({ waLocation: "thanks", ...(ref ? { ref } : {}) });
    track("whatsapp_handoff", { lead_ref: handoffRef, wa_location: "thanks" });
    window.location.href = buildWaHref({}, handoffRef);
  };

  return (
    <>
      <Head meta={META} />

      <section className="pb-sec pt-[clamp(2.5rem,7vw,4.5rem)]">
        <div className="wrap">
          <div className="max-w-confirm">
          <h1 className="text-3xl">{ref ? "קיבלנו." : "הפנייה נקלטה."}</h1>

          {/* מספר הפנייה: ספרות טבלאיות, מבודד דו־כיווני, וניתן לסימון
              ולהעתקה. הוא נקרא בקול בטלפון, ולכן הוא גדול. */}
          {ref ? (
            <div className="mt-8 border-t-[length:var(--bw-rule)] border-solid border-t-[color:var(--fg)] pt-5">
              <p className="eyebrow m-0">מספר פנייה</p>
              <p className="mt-2 select-all font-serif text-2xl font-medium num">
                <Ltr>{ref}</Ltr>
              </p>
            </div>
          ) : null}

          <Prose measure="confirm" className="mt-8">
            <p>
              {responseTime ? `נחזור אליכם — ${responseTime}.` : "נחזור אליכם."}{" "}
              {ref
                ? "שמרו את המספר: הוא מקצר כל שיחה איתנו, ואפשר להקריא אותו בטלפון."
                : "אם יש מספר פנייה שקיבלתם, שמרו אותו — הוא מקצר כל שיחה איתנו."}
            </p>
            {routedBranch ? <p>הפנייה נשלחה למטבח ב{routedBranch}.</p> : null}
            <p>
              רוצים להתקדם עכשיו? הכי מהיר להמשיך את השיחה בוואטסאפ, עם המספר
              כבר בפנים.
            </p>
          </Prose>

          {/* הד הבריף — בטיפוגרפיה של תפריט, לא של חשבונית (02 §5.2).
              בלי `onEdit` הכרטיס הוא מסמך: אין לאן לחזור ולערוך אחרי
              שהפנייה כבר נשלחה. */}
          {answers ? (
            <BriefCard answers={answers} title="מה ששלחתם" className="mt-10" />
          ) : null}

          {/* ה־CTA הדומיננטי היחיד בעמוד. `data-print="hide"` — דף אישור
              מודפס הוא מסמך, לא משטח המרה. */}
          <div data-print="hide" className="mt-8">
            <Button
              variant="wa"
              href={ref ? buildWaHref({}, ref) : waLink(WA_OPENER)}
              onClick={onWhatsApp}
            >
              {WA_LABEL}
            </Button>
          </div>

          <p className="mt-5 text-xs text-fg-subtle">
            או בטלפון{" "}
            <a
              href={telLink()}
              data-tel=""
              className="text-fg no-underline hover:text-accent"
              onClick={() => capturePhoneClick({ callLocation: "thanks", ...(ref ? { ref } : {}) })}
            >
              <Num>{PHONE.display}</Num>
            </a>
          </p>

          {/* ‎02 §3.10: `לא שולחים ניוזלטר` הוא **התחייבות עובדתית** על
              התנהגות ה־CRM ועל אי־העברת פרטים לצד שלישי. הלקוח טרם אישר
              אותה, ולכן היא לא נכתבת כאן. משפט מרגיע שאיננו יכולים לעמוד
              מאחוריו הוא בדיוק סוג ההצהרה שהאתר הזה נבנה כדי לנקות.
              ‎`<Rule>` סוגר לא נשאר כאן: קו אופקי שאין אחריו תוכן הוא
              קישוט של חוסר. */}
          </div>
        </div>
      </section>
    </>
  );
}
