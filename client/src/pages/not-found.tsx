/**
 * ═══════════════════════════════════════════════════════════════════════
 *  P-25 · `/404`. spec 01 §4 P-25.
 * ═══════════════════════════════════════════════════════════════════════
 *
 * הגרסה הקודמת שילחה למבקר עברי כרטיס LTR באנגלית — "Did you forget to
 * add the page to the router?" — בלי כותרת, בלי פוטר ובלי דרך חזרה.
 * זו שאלה למפתח, על מסך של לקוח.
 *
 * ‎**404 באתר לידים הוא דף התאוששות.** הוא יושב בתוך `PageShell` (הכותרת
 * והפוטר מגיעים מ־`App.tsx`), הוא עברי ו־RTL, והוא נותן שלוש דרכים
 * להמשיך: לחזור לבית, לבנות תפריט, או פשוט לדבר עם מישהו.
 *
 * ─────────────────────────────────────────────────────────────────────
 *  הקישורים
 * ─────────────────────────────────────────────────────────────────────
 * המפרט מונה גם `/menus` וגם `/kitchens`. שני המסלולים טרם נבנו, ולכן
 * הם אינם מקושרים כאן: **דף 404 שמוביל ל־404 נוסף הוא כשל חמור יותר
 * מהראשון.** כשהעמודים ינחתו, מוסיפים אותם לרשימת `RECOVERY` למטה.
 *
 * ─────────────────────────────────────────────────────────────────────
 *  מדידה
 * ─────────────────────────────────────────────────────────────────────
 * כפתור הוואטסאפ כאן אינו עובר ב־`captureWaIntent()`. `WA_LOCATIONS`
 * ב־`shared/lead-schema.ts` הוא איחוד סגור ואין בו ערך שמתאר 404;
 * ‎`waLocation` שגוי היה מזהם את דוח הערוצים. הקישור נשאר `wa.me` רגיל
 * עד שיתווסף ערך אמיתי לסכימה.
 *
 * ‎`Head` מקבל את רשומת `/404` (`noindex, follow`). השרת אחראי להחזיר
 * סטטוס 404 אמיתי לנתיב שאינו `/api` — 01 §4 P-25.
 */

import { Link } from "wouter";
import { Head } from "@/components/seo/head";
import { Button, Num, Prose, Rule } from "@/components/primitives";
import { PHONE, telLink, waLink } from "@/content/business";
import { capturePhoneClick } from "@/lib/lead-client";
import { PAGE_META } from "@/lib/seo";

const META = PAGE_META["/404"];

/** מסלולים שקיימים בפועל. אין לרשום כאן יעד שאין לו קובץ עמוד. */
const RECOVERY = [
  { href: "/", label: "לעמוד הבית", note: "מי אנחנו, ומאיפה האוכל יוצא." },
  { href: "/quote", label: "בנו תפריט לאירוע", note: "ארבע שאלות, ואנחנו חוזרים אליכם." },
] as const;

export default function NotFound() {
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
                יכול להיות שהכתובת השתנתה, או שהקישור נשבר בדרך. אלה הדפים
                שכן קיימים:
              </p>
            </Prose>

            <ul className="mt-8 m-0 list-none p-0">
              {RECOVERY.map((item, i) => (
                <li key={item.href} className="m-0">
                  {i > 0 ? <Rule /> : null}
                  <Link
                    href={item.href}
                    className="block py-5 text-fg no-underline hover:text-accent"
                  >
                    <span className="block font-serif text-lg font-bold">{item.label}</span>
                    <span className="mt-1 block text-xs text-fg-muted">{item.note}</span>
                  </Link>
                </li>
              ))}
            </ul>

            <Rule />

            <div className="pt-8">
              <Prose size="note" measure="answer">
                <p>או פשוט תגידו לנו מה חיפשתם:</p>
              </Prose>

              <div className="mt-4 flex flex-wrap items-center gap-4">
                <Button
                  variant="wa"
                  size="sm"
                  href={waLink("היי, הגעתי מהאתר ולא מצאתי את מה שחיפשתי.")}
                  target="_blank"
                >
                  וואטסאפ
                </Button>

                <a
                  href={telLink()}
                  data-tel=""
                  className="text-sm text-fg no-underline hover:text-accent"
                  onClick={() => capturePhoneClick({ callLocation: "not_found" })}
                >
                  <Num>{PHONE.display}</Num>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
