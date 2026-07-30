/**
 * ═══════════════════════════════════════════════════════════════════════
 *  P-22 · `/terms` — תקנון ותנאי שימוש. spec 01 §4 P-22, §0.1.
 * ═══════════════════════════════════════════════════════════════════════
 *
 * הקובץ שהוחלף כאן היה הפרה החמורה ביותר של חוק 1 בכל המאגר. הוא פרסם
 * כהתחייבות מחייבת: מקדמה של 50%, יתרה עד 7 ימים לפני האירוע, מדרג ביטול
 * ‎72/24 שעות, תוספת 15% לסופי שבוע, חוזה מעל ₪10,000, תשלום מלא מראש עד
 * ‎20 אורחים, «כל המזון כשר בד״ץ מהדרין», ח.פ. `123456789`, כתובת רשומה,
 * מייל, וטלפון ממלא מקום. אף מספר מהם לא נמסר על ידי אף אחד.
 *
 * ושלושה סעיפים נוספים שאינם רק שקריים אלא ככל הנראה מקפחים לפי ס׳ 4
 * לחוק החוזים האחידים, ו־01 §0.1 מורה למחוק אותם בשמם:
 *
 *   ‎:135-138  תקרת אחריות גורפת לערך השירות
 *   ‎:155      שימוש שיווקי בצילומי האירוע על בסיס opt-out
 *   ‎:167      בוררות חובה
 *   ‎:168      סמכות שיפוט ייחודית למחוז תל אביב
 *
 * ─────────────────────────────────────────────────────────────────────
 *  מה מחליף אותם
 * ─────────────────────────────────────────────────────────────────────
 * תנאי מסחר אמיתיים — מקדמה, ביטול, מועד סגירת מספר סועדים, מחיר — הם
 * ‎Slots ריקים ב־`content/business.ts`. כל עוד הם ריקים **הם אינם מרונדרים
 * בשום נוסח**, גם לא מרוכך ולא «בכפוף לאישור». מה שכן אפשר לומר היום, ובלי
 * להמציא כלום, הוא איפה התנאים כן נקבעים: בהצעה הכתובה לאירוע. זה נכון,
 * זה שימושי, וזה לא מתחייב למספר שאיש לא אישר.
 *
 * ‎§4 האומר שאין באתר הצעה מחייבת אינו התחמקות — הוא פשוט תיאור נכון של
 * אתר שאינו מפרסם ולו מחיר אחד (01 §4 P-02, `PriceFloor`).
 *
 * ‎**חוסם עלייה לאוויר:** בלי `legalName` ו־`companyId` אין כאן צד להתקשר
 * איתו, ובלי `paymentTerms` / `headcountDeadline` אין תקנון מסחרי. התוכן
 * המלא בבעלות `04-legal-and-content.md`, שטרם נכתב. מדווח בדוח החזרה.
 */

import { Link } from "wouter";
import { Head } from "@/components/seo/head";
import { Num, Prose, Rule } from "@/components/primitives";
import { PHONE, SLOTS, filled, telLink } from "@/content/business";
import { capturePhoneClick } from "@/lib/lead-client";
import { buildBreadcrumbList, buildWebPage, PAGE_META } from "@/lib/seo";

const META = PAGE_META["/terms"];

/**
 * תנאים מסחריים, כל אחד עם ה־Slot שלו. שורה שה־Slot שלה ריק אינה נכנסת
 * לרשימה, ואם כולן ריקות הגוש כולו אינו מרונדר — INV-2, גיזום ליחידה
 * המכילה הקטנה ביותר.
 */
function commercialRows(): { label: string; value: string }[] {
  const rows: { label: string; value: string }[] = [];

  if (filled(SLOTS.paymentTerms)) {
    rows.push({ label: "תשלום וביטול", value: SLOTS.paymentTerms });
  }
  if (filled(SLOTS.headcountDeadline)) {
    rows.push({ label: "שינוי מספר סועדים", value: SLOTS.headcountDeadline });
  }
  if (filled(SLOTS.leadTime)) {
    rows.push({ label: "זמן התראה להזמנה", value: SLOTS.leadTime });
  }

  return rows;
}

function CommercialTerms() {
  const rows = commercialRows();
  if (rows.length === 0) return null;

  return (
    <>
      <Rule />
      <section className="pt-8">
        <h2 className="text-xl">תנאים מסחריים</h2>
        <dl className="mt-4 m-0">
          {rows.map((row, i) => (
            <div key={row.label} className="m-0">
              {i > 0 ? <Rule /> : null}
              <dt className="py-1 font-serif text-base font-bold">{row.label}</dt>
              <dd className="m-0 pb-4 text-sm text-fg-muted">{row.value}</dd>
            </div>
          ))}
        </dl>
      </section>
    </>
  );
}

/** זהות הצד המתקשר. ריקה ⇒ אינה מרונדרת. */
function LegalEntity() {
  const name = SLOTS.legalName;
  if (!filled(name)) return null;

  return (
    <>
      <Rule />
      <section className="pt-8">
        <h2 className="text-xl">הצד המתקשר</h2>
        <Prose measure="answer" className="mt-4">
          <p>
            {name}
            {filled(SLOTS.companyId) ? (
              <>
                , ח.פ. <Num inline>{SLOTS.companyId}</Num>
              </>
            ) : null}
            .
          </p>
        </Prose>
      </section>
    </>
  );
}

export default function Terms() {
  return (
    <>
      <Head
        meta={META}
        jsonLd={[buildWebPage(META), buildBreadcrumbList(META.breadcrumb)]}
      />

      <section className="pb-sec pt-[clamp(2.5rem,7vw,4.5rem)]">
        <div className="wrap">
          <div className="max-w-answer">
            <p className="eyebrow m-0">תקנון ותנאי שימוש</p>

            <h1 className="mt-4 text-3xl">מה חל על השימוש באתר, ומה נקבע בהצעה</h1>

            <Prose size="lede" measure="lede" className="mt-5">
              <p>
                האתר הזה מציג מה אנחנו מבשלים ומאפשר לבקש הצעה. התנאים המחייבים
                של אירוע נקבעים בהצעה הכתובה שתקבלו, ולא כאן.
              </p>
            </Prose>

            <Rule />

            <section className="pt-8">
              <h2 className="text-xl">אין באתר הצעה מחייבת</h2>
              <Prose measure="answer" className="mt-4">
                <p>
                  התכנים באתר — תפריטים, תיאורי מנות וכל טקסט אחר — הם מידע, לא
                  הצעה משפטית מחייבת ולא התחייבות לזמינות. אין באתר מחירים, וגם
                  לא מחשבון שמפיק סכום. פנייה דרך הטופס אינה הזמנה ואינה מחייבת
                  אתכם בתשלום.
                </p>
                <p>
                  הזמנה נכנסת לתוקף רק כשיש הצעה כתובה שאתם אישרתם. מה שכתוב בה
                  — היקף, מחיר, מועדים ותנאי ביטול — גובר על כל דבר שמופיע כאן.
                </p>
              </Prose>
            </section>

            <Rule />

            <section className="pt-8">
              <h2 className="text-xl">מה נדרש מכם בפנייה</h2>
              <Prose measure="answer" className="mt-4">
                <p>
                  שפרטי הקשר יהיו נכונים, כדי שנוכל לחזור אליכם. ואם יש באירוע
                  אלרגיה או מגבלה תזונתית — שתאמרו לנו עליה מראש ובכתב. זה הדבר
                  היחיד בעמוד הזה שיכול להיות עניין של בטיחות.
                </p>
              </Prose>
            </section>

            <CommercialTerms />

            <Rule />

            <section className="pt-8">
              <h2 className="text-xl">שימוש בתכני האתר</h2>
              <Prose measure="answer" className="mt-4">
                <p>
                  התכנים והעיצוב של האתר הם שלנו. אפשר לקרוא, להדפיס ולשלוח
                  הלאה קישור בחופשיות; העתקה מסחרית של התכנים דורשת אישור.
                </p>
              </Prose>
            </section>

            <LegalEntity />

            <Rule />

            <section className="pt-8">
              <h2 className="text-xl">דין ופרטיות</h2>
              <Prose measure="answer" className="mt-4">
                <p>
                  על תנאים אלה חלים דיני מדינת ישראל. הטיפול בפרטים שנמסרים
                  בטופס מתואר ב<Link href="/privacy">מדיניות הפרטיות</Link>.
                </p>
              </Prose>
            </section>

            <Rule />

            <section className="pt-8">
              <h2 className="text-xl">שאלה על התנאים</h2>
              <p className="mt-4">
                <a
                  href={telLink()}
                  data-tel=""
                  className="text-fg no-underline hover:text-accent"
                  onClick={() => capturePhoneClick({ callLocation: "terms" })}
                >
                  <Num>{PHONE.display}</Num>
                </a>
              </p>
            </section>
          </div>
        </div>
      </section>
    </>
  );
}
