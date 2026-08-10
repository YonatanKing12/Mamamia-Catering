/**
 * ═══════════════════════════════════════════════════════════════════════
 *  P-23 · `/accessibility` — הצהרת נגישות. spec 01 §4 P-23, §0.1.
 * ═══════════════════════════════════════════════════════════════════════
 *
 * ‎01 §0.1 מסמן את הקובץ הקודם כ־«False accessibility conformance claims»
 * בשורות `32,48,56,88-97,118`. הוא הצהיר על התאמה ל־WCAG 2.1 AA, על ניגודיות
 * מינימלית של 4.5:1, על טקסט חלופי «לכל התמונות», ועל בדיקות שוטפות בידי
 * מומחי נגישות עם NVDA, JAWS, VoiceOver, axe ו־WAVE. לא נערכה שום בדיקה
 * כזאת. בנוסף הוא פירט «סרגל נגישות מתקדם» — רכיב ש־§5.5 מחק, כלומר תיאור
 * של פקד שאינו קיים במסך.
 *
 * הצהרת נגישות שקרית גרועה מהיעדר הצהרה: היא בדיוק המסמך שרשות האכיפה
 * קוראת ראשון, והיא מתעדת בכתב שהעסק ידע מה נדרש והצהיר שעמד בו.
 *
 * ─────────────────────────────────────────────────────────────────────
 *  הכלל שהחליף אותו
 * ─────────────────────────────────────────────────────────────────────
 * ‎**מוצהר רק מה שאפשר לפתוח בעורך ולראות.** כל שורה ב־`IMPLEMENTED` נגזרת
 * מקוד קיים:
 *
 *   קישור דילוג ו־<main> יחיד   `layout/page-shell.tsx`
 *   ‎lang="he" dir="rtl"          `client/index.html:2,39`
 *   טבעת פוקוס גלויה             `index.css:234` (ו־`:235` שלא מכבה אותה)
 *   כיבוד prefers-reduced-motion `index.css:195,314`
 *   שדות טופס מקושרים לשגיאה     `primitives/field.tsx` — aria-describedby,
 *                                aria-invalid, aria-required
 *   הודעת שגיאה מוכרזת           `quote/quote-builder.tsx` — role="alert"
 *   אפס רכיבי צד שלישי           INV-10
 *
 * ו־`NOT_VERIFIED` מפרט מה שבאמת לא נבדק. זו הצהרת התאמה חלקית, וזה
 * המצב האמיתי. **רמת התאמה אינה מוצהרת בשום מקום בעמוד** — לא AA ולא
 * אחרת — כי איש לא בדק, וטענת רמה היא בדיוק סוג העובדה שחוק 1 אוסר להמציא.
 *
 * ‎`SLOTS` של רכז נגישות ושל נגישות פיזית בסניפים ריקים ⇒ אותם גושים אינם
 * מרונדרים. תקנה 35 לתקנות שוויון זכויות דורשת רכז נגישות בהצהרה, ולכן זהו
 * **חוסם עלייה לאוויר** — מדווח בדוח החזרה, ולא מגושר בשם מומצא.
 */

import { Head } from "@/components/seo/head";
import { Button, Ltr, Num, Prose, Rule } from "@/components/primitives";
import { PHONE, SLOTS, filled, telLink, waLink } from "@/content/business";
import { capturePhoneClick } from "@/lib/lead-client";
import { buildBreadcrumbList, buildWebPage, PAGE_META } from "@/lib/seo";

const META = PAGE_META["/accessibility"];

/** כל שורה מצביעה על קוד קיים. אין להוסיף כאן שורה בלי להצביע על המימוש. */
const IMPLEMENTED = [
"האתר כתוב בעברית בכיוון ימין־לשמאל, ומוצהר ככזה לדפדפן ולקורא מסך.",
"קישור «דלגו לתוכן הראשי» הוא הפקד הראשון בכל עמוד, ומעביר פוקוס אמיתי.",
"אפשר להגיע לכל קישור, כפתור ושדה טופס במקלדת בלבד, וטבעת הפוקוס גלויה תמיד. היא לא מכובה בשום מקום באתר.",
"שדות הטופס מקושרים לתוויות ולהודעות השגיאה שלהם, ושגיאה מוכרזת לקורא מסך ולא רק נצבעת באדום.",
"הכותרות בנויות בסדר היררכי, וכל עמוד מתחיל בכותרת ראשית אחת.",
"מי שהגדיר במערכת ההפעלה «צמצום תנועה» מקבל אתר בלי אנימציות ובלי גלילה רכה.",
"הטקסט נמדד ביחידות יחסיות, ומתרחב עם הגדלת הגופן בדפדפן בלי שתוכן ייעלם.",
"אין באתר קרוסלות, אין ניגון אוטומטי, ואין תוכן שמתחלף מעצמו.",
"אין באתר וידג׳טים חיצוניים — לא צ׳אט, לא מפה מוטמעת ולא סרגל נגישות של ספק — כלומר אין רכיב שיכול לשבור ניווט מקלדת או להתנגש עם קורא מסך.",
] as const;

/** מה שבאמת לא נבדק. הרשימה הזאת היא מה שהופך את המסמך לאמין. */
const NOT_VERIFIED = [
"לא נערכה בדיקת נגישות חיצונית בידי מורשה נגישות, ולא נבדקה התאמה מלאה לת״י 5568.",
"לא הושלמה בדיקה ידנית מקצה לקצה עם קוראי מסך.",
"יחסי הניגודיות נבחרו לפי חישוב, אך טרם עברו ביקורת חיצונית על כל מצב ומצב.",
"האתר עדיין בבנייה, ועמודים שייווספו לא ייבדקו אוטומטית עם פרסומם.",
] as const;

/*
 * ─────────────────────────────────────────────────────────────────────
 *  שני גושים שאינם כאן, במכוון
 * ─────────────────────────────────────────────────────────────────────
 *  · **רכז נגישות.** תקנה 35 דורשת שם ודרך התקשרות בהצהרה. אין ל־
 *    `content/business.ts` Slot לרכז נגישות, ולכן הגוש פשוט אינו קיים.
 *    מפורשות **לא** גושר ב־`legalName`: שם חברה תחת הכותרת «רכז הנגישות»
 *    הוא עובדה שגויה, לא גיזום.
 *  · **נגישות פיזית בסניפים.** `SLOTS.addresses` הוא כתובת, ולא מידע
 *    נגישות — חניה, כניסה, שירותים, מעלית. רינדור כתובת תחת הכותרת הזאת
 *    היה טענת נגישות שלא נבדקה. שני ה־Slots מבוקשים בדוח החזרה.
 */

export default function Accessibility() {
  return (
    <>
      <Head
        meta={META}
        jsonLd={[buildWebPage(META), buildBreadcrumbList(META.breadcrumb)]}
      />

      <section className="pb-sec pt-[clamp(2.5rem,7vw,4.5rem)]">
        <div className="wrap">
          <div className="max-w-answer">
            <p className="eyebrow m-0">הצהרת נגישות</p>

            <h1 className="mt-4 text-3xl">מה נגיש באתר היום, ומה עדיין לא</h1>

            <Prose size="lede" measure="lede" className="mt-5">
              <p>
                האתר נבנה מתוך כוונה לעמוד בת״י 5568. הוא עדיין בבנייה, ולא
                נערכה בדיקה חיצונית. לכן זו הצהרת התאמה חלקית, ולא הצהרת עמידה.
              </p>
            </Prose>

            <Rule />

            <section className="pt-8">
              <h2 className="text-xl">מה כבר מיושם</h2>
              <Prose measure="answer" className="mt-4">
                <ul>
                  {IMPLEMENTED.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </Prose>
            </section>

            <Rule />

            <section className="pt-8">
              <h2 className="text-xl">מה עוד לא נבדק</h2>
              <Prose measure="answer" className="mt-4">
                <p>
                  אנחנו מעדיפים לומר את זה מראש ולא להצהיר על רמת התאמה שלא
                  נבדקה:
                </p>
                <ul>
                  {NOT_VERIFIED.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </Prose>
            </section>

            <Rule />

            <section className="pt-8">
              <h2 className="text-xl">נתקלתם במשהו שלא עובד?</h2>
              <Prose measure="answer" className="mt-4">
                <p>
                  ספרו לנו מה ניסיתם לעשות ואיפה זה נתקע — נתקן, ובינתיים נסגור
                  את מה שרציתם בטלפון או בוואטסאפ. אפשר להזמין קייטרינג מאיתנו
                  לגמרי בעל פה; אין שום דבר באתר שחייבים למלא לבד.
                </p>
              </Prose>

              <div className="mt-6 flex flex-wrap items-center gap-4">
                <Button
                  variant="wa"
                  size="sm"
                  href={waLink("היי, נתקלתי בבעיית נגישות באתר.")}
                  target="_blank"
                >
                  וואטסאפ
                </Button>

                <a
                  href={telLink()}
                  data-tel=""
                  className="text-sm text-fg no-underline hover:text-accent"
                  onClick={() => capturePhoneClick({ callLocation: "accessibility" })}
                >
                  <Num>{PHONE.display}</Num>
                </a>
              </div>
            </section>

            {filled(SLOTS.accessibilityCoordinator) ? (
              <>
                <Rule />

                {/*
                  תקנה 35 לתקנות שוויון זכויות מחייבת ציון רכז נגישות ודרך
                  התקשרות איתו בהצהרה. הגוש נשען על Slot ייעודי ולא על
                  `legalName`: שם חברה תחת הכותרת «רכז הנגישות» אינו גיזום
                  של מידע חסר אלא המצאה שלו.
                */}
                <section className="pt-8">
                  <h2 className="text-xl">רכז הנגישות</h2>
                  <Prose measure="answer" className="mt-4">
                    <p>{SLOTS.accessibilityCoordinator.name}</p>
                    <p>
                      <a
                        href={telLink()}
                        data-tel=""
                        className="text-fg no-underline hover:text-accent"
                        onClick={() =>
                          capturePhoneClick({ callLocation: "accessibility_coordinator" })
                        }
                      >
                        <Num>{SLOTS.accessibilityCoordinator.phone}</Num>
                      </a>
                    </p>
                    <p>
                      <a
                        href={`mailto:${SLOTS.accessibilityCoordinator.email}`}
                        className="text-fg hover:text-accent"
                      >
                        <Ltr>{SLOTS.accessibilityCoordinator.email}</Ltr>
                      </a>
                    </p>
                  </Prose>
                </section>
              </>
            ) : null}
          </div>
        </div>
      </section>
    </>
  );
}
