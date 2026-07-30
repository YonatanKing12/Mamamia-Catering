/**
 * ═══════════════════════════════════════════════════════════════════════
 *  P-21 · `/privacy` — מדיניות פרטיות. spec 01 §4 P-21, §0.1.
 * ═══════════════════════════════════════════════════════════════════════
 *
 * הגרסה שהוחלפה כאן הייתה קובץ רפליט שלא נגע בו אף אחד מגל הכתיבה, והיא
 * הפרה את חוק 1 בשש נקודות נפרדות: ממונה פרטיות בשם בדוי («דוד כהן»),
 * טלפון ממלא מקום `052-123-4567`, כתובת מומצאת, מייל שאיש אינו קורא,
 * תקופות שמירה מומצאות (3 שנים / 7 שנים / «לצמיתות»), והתחייבות להודעה
 * מוקדמת של 30 יום על שינוי מדיניות. אף אחת מהן אינה עובדה שבידינו.
 * ‎01 §0.1 מסמן את השורה `privacy.tsx:161` בשמה.
 *
 * ─────────────────────────────────────────────────────────────────────
 *  מה נשאר, ולמה דווקא זה
 * ─────────────────────────────────────────────────────────────────────
 * כל טענה בעמוד הזה נגזרת מקוד שאפשר לפתוח ולקרוא, ולא מהצהרה של אף אחד:
 *
 *   · רשימת השדות     — `shared/lead-schema.ts` §quoteSchema. זה בדיוק
 *                        מה שהטופס שולח, לא מה שנחמד לכתוב שהוא שולח.
 *   · שדות הייחוס      — `lib/attribution.ts`. sessionStorage, פר־לשונית.
 *   · העדר עוגיות צד ג׳ — INV-10. `lib/analytics.ts` הוא no-op כל עוד אין
 *                        `window.gtag`, ואין היום תג באתר.
 *   · הזכויות          — חוק הגנת הפרטיות התשמ״א־1981. ציטוט דין, לא הבטחה.
 *
 * ‎`legalName` / `companyId` / `privacyEmail` ריקים ⇒ גוש זהות בעל המאגר
 * **אינו מרונדר כלל**, ולא כמסגרת ריקה. אותו היגיון בדיוק כמו
 * ‎`CollectionNotice` ב־`quote/legal-blocks.tsx`, ומאותה סיבה.
 *
 * ‎`leadRetentionMonths` ריק ⇒ אין כאן שום מספר חודשים. מדיניות שמירה היא
 * התחייבות, וניחוש שלה הוא בדיוק הכשל שהקובץ הקודם הדגים. העמוד אומר
 * שאפשר לבקש מחיקה בטלפון — וזה נכון היום.
 *
 * ‎**חוסם עלייה לאוויר:** בלי זהות בעל המאגר ובלי תקופת שמירה זה אינו
 * מסמך שמשחרר חובת גילוי. מדווח ככזה בדוח החזרה.
 */

import { Head } from "@/components/seo/head";
import { Num, Prose, Rule } from "@/components/primitives";
import { PHONE, SLOTS, filled, telLink } from "@/content/business";
import { capturePhoneClick } from "@/lib/lead-client";
import { buildBreadcrumbList, buildWebPage, PAGE_META } from "@/lib/seo";

const META = PAGE_META["/privacy"];

/** מה שהטופס באמת שולח — `shared/lead-schema.ts`. */
const COLLECTED = [
  "שם וטלפון — בלעדיהם אין למי לחזור.",
  "כתובת מייל, אם מסרתם. אינה שדה חובה.",
  "הערוץ שבו אתם מעדיפים שנחזור אליכם: וואטסאפ או טלפון.",
  "פרטי האירוע: סוג, טווח סועדים, תאריך (או שהוא עוד לא נקבע), אזור, פורמט הגשה, ומנות שסימנתם.",
  "טקסט חופשי, אם כתבתם משהו בשדה ההערות.",
  "האם סימנתם הסכמה לדיוור שיווקי. ברירת המחדל היא שלא.",
] as const;

/** מה שנאסף טכנית — `lib/attribution.ts`. */
const TECHNICAL = [
  "הדף שממנו נשלחה הפנייה, דף הנחיתה שאליו הגעתם, והאתר שהפנה אתכם.",
  "מזהה מושב זמני, שנשמר ב־sessionStorage של הלשונית ונמחק כשסוגרים אותה.",
  "פרמטרי קמפיין (UTM) ומזהי הקלקה של מערכות הפרסום, אם הגעתם ממודעה.",
] as const;

/** ציטוט דין — חוק הגנת הפרטיות התשמ״א־1981. */
const RIGHTS = [
  "לדעת אם מוחזק עליכם מידע, ולעיין בו.",
  "לבקש לתקן מידע שאינו נכון.",
  "לבקש למחוק את הפנייה.",
  "לבטל הסכמה לדיוור בכל רגע, גם אם נתתם אותה קודם.",
  "להגיש תלונה לרשות להגנת הפרטיות.",
] as const;

/** גוש זהות בעל המאגר. ריק לגמרי ⇒ null, ולא מסגרת ריקה. */
function Custodian() {
  const name = SLOTS.legalName;
  const companyId = SLOTS.companyId;
  const email = SLOTS.privacyEmail;

  if (!filled(name) && !filled(email)) return null;

  return (
    <>
      <Rule />
      <section className="pt-8">
        <h2 className="text-xl">מי מחזיק במידע</h2>
        <Prose measure="answer" className="mt-4">
          <p>
            {filled(name) ? (
              <>
                {name}
                {filled(companyId) ? (
                  <>
                    , ח.פ. <Num inline>{companyId}</Num>
                  </>
                ) : null}
                .{" "}
              </>
            ) : null}
            {filled(email) ? <>לפניות בנושא פרטיות: {email}.</> : null}
          </p>
        </Prose>
      </section>
    </>
  );
}

export default function Privacy() {
  return (
    <>
      <Head
        meta={META}
        jsonLd={[buildWebPage(META), buildBreadcrumbList(META.breadcrumb)]}
      />

      <section className="pb-sec pt-[clamp(2.5rem,7vw,4.5rem)]">
        <div className="wrap">
          <div className="max-w-answer">
            <p className="eyebrow m-0">מדיניות פרטיות</p>

            <h1 className="mt-4 text-3xl">מה נשמר מהפנייה שלכם, ולמה</h1>

            <Prose size="lede" measure="lede" className="mt-5">
              <p>
                אנחנו אוספים את מה שדרוש כדי לחזור אליכם עם הצעה, ולא מעבר לזה.
                מה שכתוב כאן הוא מה שהטופס באמת שולח.
              </p>
            </Prose>

            <Rule />

            <section className="pt-8">
              <h2 className="text-xl">מה נאסף בטופס</h2>
              <Prose measure="answer" className="mt-4">
                <p>
                  מסירת הפרטים היא מרצונכם ואין חובה חוקית למסור אותם. בלי שם
                  וטלפון פשוט אין לנו דרך לחזור אליכם.
                </p>
                <ul>
                  {COLLECTED.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </Prose>
            </section>

            <Rule />

            <section className="pt-8">
              <h2 className="text-xl">מה נאסף טכנית</h2>
              <Prose measure="answer" className="mt-4">
                <ul>
                  {TECHNICAL.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
                <p>
                  זה משמש כדי לדעת אילו עמודים מייצרים פניות. אין באתר עוגיות
                  פרסום של צד שלישי, ואין בו כרגע כלי מדידה חיצוני כלשהו. אם
                  ייווסף אחד, העמוד הזה יעודכן לפני שהוא נדלק.
                </p>
                <p>
                  גם הגופנים והתמונות מוגשים מהשרת שלנו. הדפדפן שלכם אינו פונה
                  לשרת חיצוני כלשהו בזמן הגלישה באתר.
                </p>
              </Prose>
            </section>

            <Rule />

            <section className="pt-8">
              <h2 className="text-xl">למה זה משמש</h2>
              <Prose measure="answer" className="mt-4">
                <p>
                  כדי לחזור אליכם בנוגע לפנייה, להכין הצעת מחיר, ולתאם את
                  האירוע. דיוור שיווקי נשלח רק אם סימנתם אותו במפורש, וכל הודעה
                  כזאת נושאת דרך להסיר את ההסכמה.
                </p>
              </Prose>
            </section>

            <Rule />

            <section className="pt-8">
              <h2 className="text-xl">מי רואה את זה</h2>
              <Prose measure="answer" className="mt-4">
                <p>
                  מי שמטפל בהזמנות בשלוש המסעדות, וספק התוכנה שמאחסן את האתר
                  ואת מסד הנתונים. איננו מוכרים ואיננו משכירים את המידע לאף אחד.
                  מסירה לגורם נוסף תיעשה רק אם חובה שבדין מחייבת אותה.
                </p>
              </Prose>
            </section>

            <Rule />

            <section className="pt-8">
              <h2 className="text-xl">הזכויות שלכם</h2>
              <Prose measure="answer" className="mt-4">
                <p>לפי חוק הגנת הפרטיות התשמ״א־1981 אתם רשאים:</p>
                <ul>
                  {RIGHTS.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
                <p>
                  כדי לממש כל אחת מהן — התקשרו, ונטפל בזה. אין צורך בנוסח מיוחד
                  ואין טופס למלא.
                </p>
              </Prose>
            </section>

            <Custodian />

            <Rule />

            <section className="pt-8">
              <h2 className="text-xl">לדבר איתנו על זה</h2>
              <p className="mt-4">
                <a
                  href={telLink()}
                  data-tel=""
                  className="text-fg no-underline hover:text-accent"
                  onClick={() => capturePhoneClick({ callLocation: "privacy" })}
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
