/**
 * ═══════════════════════════════════════════════════════════════════════
 *  P-25 · `/404`. spec 01 §4 P-25.
 * ═══════════════════════════════════════════════════════════════════════
 *
 * הגרסה הקודמת שילחה למבקר עברי כרטיס LTR באנגלית — "Did you forget to
 * add the page to the router?" — בלי כותרת, בלי פוטר ובלי דרך חזרה.
 * זו שאלה למפתח, על מסך של לקוח.
 *
 * ‎**404 באתר לידים הוא דף התאוששות, ולכן הוא גם דף המרה.** הוא יושב
 * בתוך `PageShell` (הכותרת והפוטר מגיעים מ־`App.tsx`), הוא עברי ו־RTL,
 * ומי שנחת עליו קיבל כאן בדיוק את מה שהיה מקבל בכל דף אחר — באותה
 * היררכיה שמחזיקה את ששת העמודים:
 *
 *   1. **בנייה — פקד ענבר ממולא אחד,** ל־`/quote`. מי שהגיע מקישור שבור
 *      עדיין מחפש קייטרינג; רשימת ניווט לבדה מבקשת ממנו לחפש שוב.
 *   2. **וואטסאפ — ghost אחד.** «תגידו לנו מה חיפשתם» הוא גם הערוץ
 *      המהיר ביותר וגם הדיווח הזול ביותר על קישור שבור.
 *   3. **טלפון — קישור טקסט.**
 *
 * ואחריהם, ולא לפניהם, רשימת ההתאוששות.
 *
 * ─────────────────────────────────────────────────────────────────────
 *  הקישורים
 * ─────────────────────────────────────────────────────────────────────
 * ‎**דף 404 שמוביל ל־404 נוסף הוא כשל חמור יותר מהראשון.** לכן כל יעד
 * ברשימה עובר `isServedPath()` בזמן רינדור — הוא קורא את `enabled`
 * וה־`blockedBy` של `shared/routes.ts`, שהוא מקור האמת היחיד. יעד
 * שנחסם נעלם מהרשימה מעצמו, בלי שאיש יזכור לעדכן כאן מערך.
 *
 * ─────────────────────────────────────────────────────────────────────
 *  מדידה
 * ─────────────────────────────────────────────────────────────────────
 * כפתור הוואטסאפ כאן אינו עובר ב־`captureWaIntent()`. `WA_LOCATIONS`
 * ב־`shared/lead-constants.ts` הוא איחוד סגור ואין בו ערך שמתאר 404;
 * ‎`waLocation` שגוי היה מזהם את דוח הערוצים. הקישור נשאר `wa.me` רגיל
 * עד שיתווסף ערך אמיתי לסכימה — מדווח בדוח החזרה.
 *
 * ‎`Head` מקבל את רשומת `/404` (`noindex, follow`). השרת אחראי להחזיר
 * סטטוס 404 אמיתי לנתיב שאינו `/api` — 01 §4 P-25.
 */

import { Link } from "wouter";
import { Head } from "@/components/seo/head";
import { CtaPair, Num, Prose } from "@/components/primitives";
import { PHONE, telLink, waLink } from "@/content/business";
import { capturePhoneClick } from "@/lib/lead-client";
import { PAGE_META } from "@/lib/seo";
import { isServedPath } from "@shared/routes";

const META = PAGE_META["/404"];

/**
 * יעדי ההתאוששות. `/quote` **אינו** ברשימה — הוא פקד הענבר למעלה, ושורה
 * שחוזרת על פקד שכבר נלחץ עליה מדללת אותו.
 */
const RECOVERY = [
  { href: "/", label: "לעמוד הבית", note: "מי אנחנו, ומאיפה האוכל יוצא." },
  { href: "/menus", label: "התפריטים", note: "איך נבנה תפריט לאירוע." },
  { href: "/catering", label: "לפי סוג האירוע", note: "לאיזה אירועים אנחנו נכנסים." },
  { href: "/kitchen", label: "המטבח", note: "מי מבשל את האוכל, ואיפה." },
] as const;

const WA_OPENER = "היי, הגעתי מהאתר ולא מצאתי את מה שחיפשתי.";

export default function NotFound() {
  /* מסנן בזמן רינדור מול מקור האמת, ולא רשימה שנכתבה ביד ותתיישן. */
  const links = RECOVERY.filter((item) => isServedPath(item.href));

  return (
    <>
      <Head meta={META} />

      <section className="pb-sec pt-[clamp(2.5rem,7vw,4.5rem)]">
        <div className="wrap">
          <div className="max-w-answer">
            <p className="eyebrow m-0">שגיאה 404</p>

            <h1 className="mt-4 text-3xl">לא מצאנו את הדף הזה.</h1>

            <Prose size="lede" measure="lede" className="mt-5">
              <p>
                יכול להיות שהכתובת השתנתה, או שהקישור נשבר בדרך. אם הגעתם לכאן
                בשביל קייטרינג — אפשר להתחיל מכאן.
              </p>
            </Prose>

            <CtaPair
              className="mt-8"
              primary={{ label: "בנו תפריט לאירוע", href: "/quote" }}
              secondary={{
                label: "תגידו לנו מה חיפשתם",
                variant: "ghost",
                href: waLink(WA_OPENER),
                target: "_blank",
                rel: "noopener noreferrer",
              }}
            />

            <p className="mt-5 text-xs text-fg-subtle">
              או בטלפון{" "}
              <a
                href={telLink()}
                data-tel=""
                className="font-semibold text-fg no-underline hover:text-accent"
                onClick={() => capturePhoneClick({ callLocation: "not_found" })}
              >
                <Num>{PHONE.display}</Num>
              </a>
            </p>

            {/* רשימה ריקה ⇒ אין כותרת ואין רשת. אותו כלל כמו בכל באנד. */}
            {links.length > 0 ? (
              <div className="mt-10">
                <p className="eyebrow m-0">או המשיכו מכאן</p>

                <ul className="mt-4 grid list-none gap-grid p-0 min-[600px]:grid-cols-2">
                  {links.map((item) => (
                    <li key={item.href} className="m-0">
                      <Link
                        href={item.href}
                        className="block rounded-card border border-solid border-[color:var(--rule)] bg-bg-form p-card text-fg no-underline transition-colors duration-state ease-house hover:border-accent hover:text-accent"
                      >
                        <span className="block text-lg font-bold">{item.label}</span>
                        <span className="mt-1 block text-xs text-fg-muted">{item.note}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </>
  );
}
