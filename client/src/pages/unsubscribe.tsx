/**
 * ═══════════════════════════════════════════════════════════════════════
 *  P-20 · `/unsubscribe` — הסרה מרשימת הדיוור. spec 01 §4 P-20, 02 §9.7.
 * ═══════════════════════════════════════════════════════════════════════
 *
 * העמוד הזה קיים כי תיבת הסימון בטופס מבטיחה «ניתן להסיר את ההסכמה בכל
 * הודעה» (`MARKETING_CONSENT_TEXT`), וס' 30א לחוק התקשורת מחייב כל הודעת
 * פרסומת לשאת מנגנון סירוב שעובד. בלי המסלול הזה ההבטחה בתיבה היא הבטחה
 * שהמערכת אינה יכולה לקיים — וזו בעצמה הפרה, נוסף על הפיצוי הסטטוטורי של
 * עד ‎₪1,000 להודעה בלי הוכחת נזק.
 *
 * ─────────────────────────────────────────────────────────────────────
 *  המזהה הוא טוקן, ולא `ref` — וזה תיקון אבטחה, לא העדפה
 * ─────────────────────────────────────────────────────────────────────
 * ‎01 §4 P-20 כותב `/unsubscribe?ref=MM-XXXXXX`, «בלי אימות מעבר ל־ref».
 * ‎00-spec-review §B8 דוחה את זה, ו־02 §9.7 גובר: המזהה הוא
 * ‎`?t={unsubscribe_token}` — מחרוזת אקראית בת 32 תווים שנוצרת בהוספת
 * השורה ואינה קשורה ל־`ref`.
 *
 * הסיבה: `ref` מודפס בהודעת וואטסאפ, מוקרא בקול בטלפון ומופיע בכתובת של
 * ‎`/summary` שכל תכליתה להיות מועברת הלאה. מי שמחזיק אותו יכול להסיר
 * אדם אחר מרשימת הדיוור, ומרחב הקודים קטן מספיק לסריקה בכוח. טוקן נפרד
 * מנתק את שתי היכולות זו מזו.
 *
 * ─────────────────────────────────────────────────────────────────────
 *  ההסרה קורית ב־POST בלבד. לעולם לא בטעינת הדף
 * ─────────────────────────────────────────────────────────────────────
 * ‎02 §9.7: GET מציג משפט אחד וכפתור אחד; POST מסיר. אסור לקצר את זה
 * ל«הסרה אוטומטית בכניסה» — סורקי קישורים של ספקי דואר, תצוגות מקדימות
 * ומאיצי דפדפן פותחים כל כתובת שמופיעה בהודעה, והיו מסירים אנשים שמעולם
 * לא לחצו. הכפתור אינו חיכוך; הוא ההסכמה לפעולה.
 *
 * ─────────────────────────────────────────────────────────────────────
 *  מה שהעמוד לא יעשה: אישור כוזב
 * ─────────────────────────────────────────────────────────────────────
 * ‎`POST /api/unsubscribe` **אינו קיים היום ב־`server/routes.ts`**. עמוד
 * שיציג «הוסרתם» בלי שהבקשה הצליחה הוא בדיוק סוג ההצהרה שהאתר הזה נבנה
 * לנקות — ובהקשר הזה גם ההצהרה המסוכנת ביותר, כי היא מתעדת בכתב שהעסק
 * הודיע שההסרה בוצעה. לכן כל תשובה שאינה הצלחה מפורשת מובילה למצב
 * ‎`failed`, שמוסר ערוץ אנושי שעובד היום: מייל וטלפון.
 *
 * טוקן לא מוכר מקבל **את אותו אישור** כמו טוקן מוכר (02 §9.7): התשובה
 * אינה מגלה אם קוד קיים במאגר. ההבחנה הזאת נעשית בשרת בלבד.
 *
 * ‎`stickyBar: 'none'` (`shared/routes.ts` P-20): פס המרה דביק מעל עמוד
 * שאדם הגיע אליו כדי להפסיק לקבל מאיתנו הודעות הוא בדיוק הטון הלא נכון.
 */

import * as React from "react";
import { useSearch } from "wouter";
import { Head } from "@/components/seo/head";
import { Button, Ltr, Num, Prose, Rule } from "@/components/primitives";
import { MARKETING_CONSENT_TEXT } from "@/components/quote/legal-blocks";
import { NextSteps, WhatsAppBand } from "@/components/bands";
import { PHONE, SLOTS, filled, telLink } from "@/content/business";
import { capturePhoneClick } from "@/lib/lead-client";
import { buildWebPage } from "@/lib/seo";
import {
  resolveExtraMeta,
  stripEmptyJsonLd,
  type PageMetaExtra,
} from "@/lib/page-meta-extra";

const META = resolveExtraMeta("/unsubscribe") as PageMetaExtra;

/* ═══════════════════ הטוקן ═══════════════════ */

/**
 * ‎02 §9.7 קובע 32 תווים. הבדיקה כאן רחבה ממנו במכוון: היא אינה מאמתת
 * דבר — **השרת הוא הסמכות היחידה** — אלא רק מבחינה בין «יש בקישור מזהה»
 * ל«אין». בדיקה צרה מדי כאן הייתה הופכת שינוי אורך בצד השרת לעמוד מת
 * בלי שאיש יבחין, וזה מנגנון סירוב שבור.
 */
const TOKEN_PATTERN = /^[A-Za-z0-9_-]{16,128}$/;

function readToken(search: string): string | null {
  let raw: string | null = null;
  try {
    raw = new URLSearchParams(search).get("t");
  } catch {
    raw = null;
  }
  if (!raw) return null;
  const value = raw.trim();
  return TOKEN_PATTERN.test(value) ? value : null;
}

/* ═══════════════════ הבקשה ═══════════════════ */

type Status = "idle" | "sending" | "done" | "failed";

/**
 * מחזירה `true` רק על הצלחה מפורשת ומאומתת. כל השאר — כולל תשובת HTML
 * מה־catch-all של ה־SPA כשהנתיב עדיין לא קיים — הוא כישלון.
 */
async function postUnsubscribe(token: string): Promise<boolean> {
  let res: Response;
  try {
    res = await fetch("/api/unsubscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      cache: "no-store",
      body: JSON.stringify({ token }),
    });
  } catch {
    return false;
  }

  if (!res.ok) return false;
  if (!(res.headers.get("content-type") ?? "").includes("application/json")) return false;

  try {
    const data = (await res.json()) as { success?: unknown; ok?: unknown };
    return data.success === true || data.ok === true;
  } catch {
    return false;
  }
}

/* ═══════════════════ הערוץ האנושי ═══════════════════ */

/**
 * הנפילה לאחור לשני המצבים שבהם הכפתור אינו יכול לעבוד: קישור בלי טוקן,
 * ובקשה שנכשלה. מנגנון סירוב חייב להישאר זמין בשניהם, ולכן הבלוק הזה
 * אינו קישוט — הוא **המנגנון** במצבים האלה.
 *
 * המייל מגיע מ־`SLOTS.privacyEmail` ולעולם אינו נכתב כמחרוזת. אם יתרוקן
 * — נשארת שורת הטלפון, שהיא ערוץ סירוב תקף בפני עצמו.
 */
function ManualChannel({ className }: { className?: string }) {
  const email = filled(SLOTS.privacyEmail) ? SLOTS.privacyEmail : null;

  return (
    <div className={className}>
      <p className="eyebrow m-0">להסרה ידנית</p>
      <Prose measure="answer" className="mt-3">
        <p>
          {email ? (
            <>
              שלחו לנו הודעה למייל{" "}
              <a href={`mailto:${email}?subject=${encodeURIComponent("הסרה מרשימת הדיוור")}`}>
                <Ltr>{email}</Ltr>
              </a>{" "}
              ונסיר אתכם.{" "}
            </>
          ) : null}
          אפשר גם בטלפון{" "}
          <a
            href={telLink()}
            data-tel=""
            className="text-fg no-underline hover:text-accent"
            onClick={() => capturePhoneClick({ callLocation: "unsubscribe" })}
          >
            <Num>{PHONE.display}</Num>
          </a>
.
        </p>
      </Prose>
    </div>
  );
}

/* ═══════════════════ העמוד ═══════════════════ */

export default function Unsubscribe() {
  const search = useSearch();
  const [token] = React.useState<string | null>(() => readToken(search));
  const [status, setStatus] = React.useState<Status>("idle");

  const onRemove = React.useCallback(() => {
    if (!token || status === "sending" || status === "done") return;
    setStatus("sending");
    void postUnsubscribe(token).then((ok) => setStatus(ok ? "done" : "failed"));
  }, [token, status]);

  return (
    <>
      <Head
        meta={META}
        /* ‎01 §4 P-20: «Schema: none». נפלט צומת `WebPage` אחד בלבד, גנרי,
           בלי שום נתון על אדם — הוא מתאר את הדף, לא את מי שהגיע אליו. */
        jsonLd={[stripEmptyJsonLd(buildWebPage(META))]}
      />

      <section className="pb-sec pt-[clamp(2.5rem,7vw,4.5rem)]">
        <div className="wrap">
          <div className="max-w-answer">
            <p className="eyebrow m-0">רשימת הדיוור</p>

            <h1 className="mt-4 text-3xl">
              {status === "done" ? "הוסרתם." : "הסרה מרשימת הדיוור"}
            </h1>

            {/* ─── אחרי הסרה ─── */}
            {status === "done" ? (
              <>
                <Prose size="lede" measure="lede" className="mt-6">
                  <p>לא נשלח לכם עוד הודעות שיווקיות.</p>
                </Prose>
                <Prose measure="answer" className="mt-5">
                  <p>
                    אם יש לכם פנייה פתוחה אצלנו, ההסרה אינה נוגעת לה — נמשיך
                    לחזור אליכם לגביה כרגיל.
                  </p>
                </Prose>
              </>
            ) : null}

            {/* ─── יש טוקן, טרם הוסר ─── */}
            {status !== "done" && token ? (
              <>
                <Prose size="lede" measure="lede" className="mt-6">
                  <p>זו ההסכמה שאתם מסירים:</p>
                </Prose>

                {/* ציטוט מדויק של הטקסט שהוצג בטופס. אין כאן ניסוח מחדש:
                    האדם צריך לזהות את מה שהוא אישר, ולא תקציר שלו. */}
                <blockquote className="mt-5 border-s-[length:var(--bw-rule)] border-solid border-s-[color:var(--rule-control)] ps-5">
                  <p className="m-0 max-w-body text-sm text-fg-muted">
                    {MARKETING_CONSENT_TEXT}
                  </p>
                </blockquote>

                <Prose measure="answer" className="mt-6">
                  <p>
                    ההסרה נוגעת להודעות שיווקיות בלבד. אם יש לכם פנייה פתוחה
                    אצלנו, נמשיך לחזור אליכם לגביה כרגיל.
                  </p>
                </Prose>

                <div className="mt-8">
                  <Button onClick={onRemove} loading={status === "sending"} loadingLabel="מסירים…">
                    הסירו אותי
                  </Button>
                </div>

                {status === "failed" ? (
                  <div role="alert" className="mt-8">
                    <Prose measure="answer">
                      <p>
                        ההסרה לא הושלמה כאן, ולכן אנחנו לא כותבים שהיא בוצעה.
                        אפשר לנסות שוב, או להסיר בערוץ אחר — כל אחד מהם עובד.
                      </p>
                    </Prose>
                    <ManualChannel className="mt-6" />
                  </div>
                ) : null}
              </>
            ) : null}

            {/* ─── אין טוקן בקישור ─── */}
            {status !== "done" && !token ? (
              <>
                <Prose size="lede" measure="lede" className="mt-6">
                  <p>
                    בקישור הזה חסר המזהה שנדרש כדי לדעת מי להסיר, ולכן אי אפשר
                    להסיר מכאן.
                  </p>
                </Prose>
                <Prose measure="answer" className="mt-5">
                  <p>
                    הקישור המלא נמצא בסוף כל הודעה ששלחנו. אפשר גם פשוט לבקש
                    מאיתנו, ונסיר.
                  </p>
                </Prose>
                <ManualChannel className="mt-8" />
              </>
            ) : null}

            <Rule className="mt-10" />

            <Prose size="fine" measure="body" className="mt-6">
              <p>
                מה אנחנו שומרים ולמה — ב
                <a href="/privacy" className="underline underline-offset-[.22em]">
                  מדיניות הפרטיות
                </a>
.
              </p>
            </Prose>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          מסלול הוואטסאפ ומסלול הבנאי.

          הם נשארים גם בעמוד הזה, אבל **מתחת לקו ובטון מוסר מידע**: מי
          שהגיע לכאן ביקש להפסיק לקבל פרסום, ורצועת שכנוע מעל הכפתור
          הייתה קוראת כהתעלמות מהבקשה. מה שהם כן עושים הוא להבהיר שהסרה
          מהדיוור אינה סגירת הדלת — אדם שיזמין מחר עדיין יודע לאן לפנות.

          ‎`waLocation` הוא איחוד סגור ואין בו ערך ל־unsubscribe;
          ‎`quote_alt` היא ההתאמה הקרובה. תוספת ערך ייעודי מבוקשת בדוח
          החזרה — המצאת ערך כאן מפילה את הקליטה ב־400 מול `z.enum`.
          ───────────────────────────────────────────────────────────── */}
      <WhatsAppBand
        waLocation="quote_alt"
        callLocation="unsubscribe"
        showPhone={false}
        title="עדיין רוצים אוכל לאירוע?"
        lede="ההסרה מהדיוור לא סוגרת שום דבר. כשתצטרכו, אנחנו כאן."
        labelHe="דברו איתנו בוואטסאפ"
      />

      <NextSteps
        sourcePage={META.path}
        title="להמשך"
        links={[
          {
            href: "/quote",
            titleHe: "בקשת הצעה",
            descriptionHe: "ארבע שאלות על האירוע, ואז פרטים ליצירת קשר.",
          },
          {
            href: "/catering",
            titleHe: "קייטרינג לאירועים",
            descriptionHe: "סוגי האירועים שאנחנו עושים.",
          },
        ]}
      />
    </>
  );
}
