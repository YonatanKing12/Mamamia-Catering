/**
 * Footer / Colophon — 03 §10.11.
 *
 * הקולופון הוא בראש ובראשונה משטח נגישות, לגיטימציה וגילוי משפטי, ורק אחר כך
 * ניווט. הוא נצבע בדיו דרך [data-band="ink"], שמחליף את כל התפקידים הסמנטיים
 * בבת אחת (index.css §5) — ולכן אין כאן אף צבע קשיח, והוא מתהפך לנייר לבן
 * בהדפסה בלי כלל נוסף. באנד הדיו של הקולופון אינו נספר מול L-9 (§10.11);
 * data-band-id="colophon" קיים כדי שבדיקת ה־CI תוכל להחריג אותו.
 *
 * כל פרט תפעולי כאן הוא חריץ. אם `addresses` ו־`openingHours` ריקים, שלוש
 * עמודות המסעדות אינן נבנות כשלד ריק — הן מתקפלות לשורה אחת של שלוש
 * המסעדות (L-6: מתדרדרים לתפריט, לא לפער), שנבנית ב־Intl.ListFormat בעברית
 * תקנית. במצב הזה, שהוא המצב היום, הפוטר נראה גמור ולא חסר.
 *
 * העובדות המאומתות היחידות שנוגעות בקובץ הזה: הטלפון, שמות שלוש המסעדות,
 * השם המשפטי וכתובת הדוא״ל. אין כאן כשרות, אין שנת הקמה, אין אזור חלוקה,
 * אין מספר לקוחות.
 *
 * ─────────────────────────────────────────────────────────────────────
 *  המיצוב — מה תוקן כאן, ולמה זה לא ניסוח
 * ─────────────────────────────────────────────────────────────────────
 * שורת התיאור תחת הלוגו אמרה «קייטרינג איטלקי משלושת המטבחים שלנו». זו
 * בדיוק הטענה שהמיצוב (`content/business.ts`, 30 ביולי 2026) מוחק:
 * הקייטרינג מבושל במטבח של **אחת** מהמסעדות, ואיזו — לא נמסר. הקולופון
 * מופיע בכל מסלול באתר, ולכן זו הייתה הטענה השגויה בעותקים הרבים ביותר.
 *
 * מאותה סיבה כותרת העמודה היא «המסעדות» ולא «המטבחים», והקישור לעמוד
 * סניף עובר דרך `branchHrefIfServed` — P-04…P-06 נמחקו, וקישור אליהם הוא
 * ‏404 בכל עמוד. השם מוצג בלי קישור כשאין יעד מוגש, ומקבל אותו מעצמו אם
 * ייפתח שער בעתיד.
 */

import { capturePhoneClick } from "@/lib/lead-client";
import { Link } from "wouter";
import { Num, Rule } from "@/components/primitives";
/* מהמודול עצמו ולא מ־`@/components/bands`: הקולופון יושב בצ׳אנק הכניסה,
   וייבוא דרך החבית היה גורר אליו את כל ספריית הבאנדים בשביל פונקציה אחת. */
import { branchHrefIfServed } from "@/components/bands/branch-strip";
import {
  BRANCHES,
  PHONE,
  SLOTS,
  filled,
  telLink,
  waLink,
  type BranchId,
  type Slot,
} from "@/content/business";
import { cn } from "@/lib/utils";

const pick = (record: Slot<Record<BranchId, string>>, id: BranchId): string | null =>
  filled(record) && filled(record[id]) ? record[id] : null;

const LEGAL_NAV = [
  { href: "/privacy", label: "מדיניות פרטיות" },
  { href: "/terms", label: "תקנון" },
  { href: "/accessibility", label: "הצהרת נגישות" },
] as const;

const COL_LABEL = "m-0 pb-3 font-sans text-2xs font-semibold tracking-[.09em] text-fg";
const COL_LINK =
  "block min-h-[44px] py-2 text-fg-muted no-underline " +
  "transition-colors duration-state ease-house hover:text-fg";

/** השנה מחושבת ב־Asia/Jerusalem במפורש — לא לפי שעון המכשיר (§4.7). */
const jerusalemYear = () =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jerusalem", year: "numeric" }).format(
    new Date(),
  );

/** ‎"הרצליה פיתוח, רעננה ופתח תקווה" — הצורה העברית, בלי פסיק סדרתי. */
const BranchSentence = () => {
  const names = BRANCHES.map((b) => b.name);
  const hrefOf = (name: string) => {
    const match = BRANCHES.find((b) => b.name === name);
    return match ? branchHrefIfServed(match.id) : null;
  };

  const parts =
    typeof Intl !== "undefined" && typeof Intl.ListFormat === "function"
      ? new Intl.ListFormat("he-IL", { style: "long", type: "conjunction" }).formatToParts(names)
      : names.flatMap((name, i) =>
          i === 0
            ? [{ type: "element" as const, value: name }]
            : [
                { type: "literal" as const, value: i === names.length - 1 ? " ו" : ", " },
                { type: "element" as const, value: name },
              ],
        );

  return (
    <p className="m-0 text-fg-muted">
      {parts.map((part, i) => {
        if (part.type !== "element") return <span key={i}>{part.value}</span>;
        const href = hrefOf(part.value);
        return href ? (
          <Link
            key={i}
            href={href}
            className="text-fg-muted underline decoration-rule-control underline-offset-[.22em] transition-colors duration-state ease-house hover:text-fg hover:decoration-accent"
          >
            {part.value}
          </Link>
        ) : (
          <span key={i}>{part.value}</span>
        );
      })}
    </p>
  );
};

export const Footer = () => {
  const branches = BRANCHES.map((branch) => ({
    ...branch,
    address: pick(SLOTS.addresses, branch.id),
    hours: pick(SLOTS.openingHours, branch.id),
  }));

  /* אם אין ולו פרט תפעולי אחד, אין עמודות סניפים — יש שורה אחת. */
  const hasBranchDetail = branches.some((b) => b.address !== null || b.hours !== null);

  const legalName = filled(SLOTS.legalName) ? SLOTS.legalName : null;
  const companyId = filled(SLOTS.companyId) ? SLOTS.companyId : null;
  const privacyEmail = filled(SLOTS.privacyEmail) ? SLOTS.privacyEmail : null;
  const staffedHours = filled(SLOTS.staffedHours) ? SLOTS.staffedHours : null;

  return (
    <footer
      data-band="ink"
      data-band-id="colophon"
      className="mt-auto pt-[clamp(3rem,6vw,4.5rem)] text-sm text-fg-subtle"
    >
      <div className="wrap">
        <div
          className={cn(
            "grid gap-x-grid gap-y-10 sm:grid-cols-2",
            hasBranchDetail
              ? "lg:grid-cols-[1.3fr_repeat(4,1fr)]"
              : "lg:grid-cols-[1.3fr_repeat(2,1fr)]",
          )}
        >
          <div>
            <span className="block font-serif text-[1.35rem] font-bold text-fg">מאמא מיה</span>
            {/* מטבח אחד, לא שלושה. איזה — לא נמסר, ולכן אין כאן עיר. */}
            <p className="m-0 pt-2 text-xs">קייטרינג איטלקי ממטבח של מסעדה פעילה</p>
          </div>

          {hasBranchDetail ? (
            branches.map((branch) => {
              const href = branchHrefIfServed(branch.id);
              return (
                <div key={branch.id}>
                  <h2 className={COL_LABEL}>
                    {href ? (
                      <Link
                        href={href}
                        className="text-fg no-underline transition-colors duration-state ease-house hover:text-accent"
                      >
                        {branch.name}
                      </Link>
                    ) : (
                      branch.name
                    )}
                  </h2>
                  {branch.address ? <p className="m-0 pb-1">{branch.address}</p> : null}
                  {branch.hours ? <p className="m-0 pb-1">{branch.hours}</p> : null}
                </div>
              );
            })
          ) : (
            <div className="sm:col-span-2 lg:col-span-2">
              <h2 className={COL_LABEL}>המסעדות</h2>
              <BranchSentence />
            </div>
          )}

          <div>
            <h2 className={COL_LABEL}>יצירת קשר</h2>
            <a
              href={telLink()}
              data-tel=""
              /* ראו הערה ב־header: `data-tel` הוא מסמן ולא מאזין. */
              onClick={() => capturePhoneClick({ callLocation: "footer" })}
              className={COL_LINK}
            >
              <Num>{PHONE.display}</Num>
            </a>
            <a
              href={waLink("היי, אשמח לקבל פרטים על קייטרינג")}
              target="_blank"
              rel="noopener noreferrer"
              className={COL_LINK}
            >
              וואטסאפ
            </a>
            {staffedHours ? <p className="m-0 pt-1 text-xs">מענה אנושי: {staffedHours}</p> : null}
            {privacyEmail ? (
              <p className="m-0 pt-3 text-xs">
                לפניות בנושא פרטיות
                <br />
                <a href={`mailto:${privacyEmail}`} className="text-fg-muted hover:text-fg">
                  {privacyEmail}
                </a>
              </p>
            ) : null}
          </div>
        </div>

        <Rule className="mt-12" />

        <div className="flex flex-col gap-4 py-5 text-xs sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="m-0">
              © <Num>{jerusalemYear()}</Num> מאמא מיה קייטרינג. כל הזכויות שמורות.
            </p>
            {/* TODO(slot): כשקיים <Slot blocking> — לעטוף את שני אלה, §7.30. */}
            {legalName || companyId ? (
              <p className="m-0 pt-1">
                {legalName}
                {legalName && companyId ? " · " : null}
                {companyId ? (
                  <>
                    ח״פ <Num>{companyId}</Num>
                  </>
                ) : null}
              </p>
            ) : null}
          </div>

          <nav aria-label="מידע משפטי" className="flex flex-wrap gap-x-6 gap-y-1">
            {LEGAL_NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="inline-flex min-h-[44px] items-center text-fg-subtle no-underline transition-colors duration-state ease-house hover:text-fg"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
