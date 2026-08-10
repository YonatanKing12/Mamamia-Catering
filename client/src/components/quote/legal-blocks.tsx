/**
 * ═══════════════════════════════════════════════════════════════════════
 *  הבלוקים המשפטיים — יושבים **בתוך** הבנאי, לא לידו.
 * ═══════════════════════════════════════════════════════════════════════
 *
 * spec 02 §3.9, §3.10, §3.12.
 *
 * הסיבה שהם כאן ולא בעמוד: זה מה שהופך לבלתי אפשרי מבנית שדף הנחיתה
 * השמיני, שנכתב תחת דדליין, ישלח טופס איסוף בלי הודעת האיסוף שלו.
 * `QuoteBuilder` לא מתקמפל בלי `sourcePage`, והוא זה שמרנדר אותם.
 *
 * הנוסח המחייב עצמו — מדיניות הפרטיות, התקנון, הצהרת הנגישות — הוא
 * בבעלות מסמך התוכן המשפטי ודורש עורך דין. מה שנאכף כאן הוא שההודעה
 * **קיימת**, בתוך הקומפוננטה, בכל נקודת איסוף.
 */

import * as React from "react";
import { SLOTS, filled } from "@/content/business";
import { cn } from "@/lib/utils";
import { CONSENT_TEXT_VERSION, NOTICE_VERSION } from "./quote-config";

/* ═══════════════════ הודעת איסוף ═══════════════════ */

/**
 * שלושת אלה הם Slots חוסמי־בנייה לפי spec 02 §3.9: הודעת איסוף בלי זהות
 * בעל השליטה במאגר היא הודעה סטטוטורית פגומה. הם `null` היום, ולכן
 * ה**סעיף** שהיה מציג אותם נגזם — לא מוצג ריק, לא בסוגריים מרובעים
 * וברור שלא בשם מומצא. הרשימה מיוצאת כדי ששער בנייה יוכל לצרוך אותה.
 */
export const COLLECTION_NOTICE_REQUIRED_SLOTS = [
"legalName",
"companyId",
"privacyEmail",
] as const;

export function collectionNoticeMissingSlots(): string[] {
  return COLLECTION_NOTICE_REQUIRED_SLOTS.filter(
    (k) => !filled(SLOTS[k] as string | number | null),
  );
}

export interface CollectionNoticeProps {
  id?: string;
  className?: string;
}

export function CollectionNotice({ id, className }: CollectionNoticeProps) {
  const entity = SLOTS.legalName;
  const companyId = SLOTS.companyId;
  const contact = SLOTS.privacyEmail;

  React.useEffect(() => {
    if (!import.meta.env?.DEV) return;
    const missing = collectionNoticeMissingSlots();
    if (missing.length) {
      // eslint-disable-next-line no-console
      console.warn(
        `[quote] הודעת האיסוף חסרה זהות בעל המאגר. Slots ריקים: ${missing.join(", ")}. ` +
          `spec 02 §3.9 מסמן אותם כחוסמי־בנייה — למלא ב־content/business.ts לפני עלייה לאוויר.`,
      );
    }
  }, []);

  /* משפט הזהות נגזם כיחידה. שם בלי ח.פ. עדיין משפט תקין; ח.פ. בלי שם
     אינו, ולכן הוא תלוי בשם. */
  const custodian = filled(entity)
    ? filled(companyId)
      ? `המידע נשמר אצל ${entity}, ח.פ. ${companyId}, בעל השליטה במאגר, ומשמש`
      : `המידע נשמר אצל ${entity}, בעל השליטה במאגר, ומשמש`
    : "המידע משמש";

  return (
    <p
      id={id}
      data-notice-version={NOTICE_VERSION}
      className={cn("max-w-body text-3xs leading-body text-fg-subtle", className)}
    >
      המידע נמסר מרצונכם ואין חובה חוקית למסור אותו; בלי שם וטלפון לא נוכל לחזור אליכם עם
      הצעה. {custodian} רק כדי לחזור אליכם בנוגע לפנייה ולהכין הצעת מחיר. נגישים אליו מי
      שמטפל בהזמנות בשלוש המסעדות וספק התוכנה שמאחסן את האתר. אתם רשאים לעיין במידע
      שעליכם ולבקש לתקן או למחוק אותו
      {filled(contact) ? <>: {contact}</> : null}.{" "}
      הרחבה:{" "}
      <a
        href="/privacy"
        className="underline decoration-rule underline-offset-[.22em] hover:decoration-accent"
      >
        מדיניות הפרטיות
      </a>
.
    </p>
  );
}

/* ═══════════════════ תיבת סימון ═══════════════════ */

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: React.ReactNode;
}

/**
 * תיבת סימון בית. יעד מגע 24px לפחות, סימון שאינו צבע בלבד (הריבוע
 * מתמלא בדיו), ומסגרת --rule-control ולא --rule.
 */
export const QuoteCheckbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  function QuoteCheckbox({ label, className, ...rest }, ref) {
    return (
      <label className={cn("flex cursor-pointer items-start gap-[.6rem]", className)}>
        <input ref={ref} type="checkbox" className="peer absolute h-0 w-0 opacity-0" {...rest} />
        <span
          aria-hidden="true"
          className={
"mt-[.15em] grid h-[24px] w-[24px] shrink-0 place-items-center rounded border " +
"border-solid border-rule-control bg-bg text-bg transition-colors duration-state ease-house " +
"peer-checked:border-fg peer-checked:bg-fg " +
"peer-focus-visible:outline peer-focus-visible:outline-2 " +
"peer-focus-visible:outline-offset-2 peer-focus-visible:outline-focus"
          }
        >
          <svg viewBox="0 0 16 16" className="h-[12px] w-[12px]" focusable="false">
            <path
              d="M2.5 8.5l3.5 3.5 7.5-8"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="square"
            />
          </svg>
        </span>
        <span className="max-w-body text-xs leading-body text-fg-muted">{label}</span>
      </label>
    );
  },
);

/* ═══════════════════ הסכמת דיוור ═══════════════════ */

export const MARKETING_CONSENT_TEXT =
"אני מאשר/ת שמאמא מיה תשלח לי הצעות ועדכונים על קייטרינג בוואטסאפ, ב־SMS או במייל. " +
"ניתן להסיר את ההסכמה בכל הודעה.";

export interface MarketingConsentProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
}

/**
 * תיבה אחת, לא מסומנת, **לא חובה ולעולם לא תנאי לשליחה**.
 *
 * אין לצידה תיבת «אני מאשר/ת את מדיניות הפרטיות»: החוק בישראל אינו דורש
 * אותה, ספקי אתרים מוכרים אותה בטעות כדרישת תיקון 13, והיא עולה קליק
 * בלי שום הגנה משפטית בתמורה.
 *
 * הטקסט מבטיח מנגנון הסרה — ולכן חייב להתקיים מנגנון הסרה. ס' 30א לחוק
 * התקשורת מקנה פיצוי סטטוטורי של עד ₪1,000 להודעה בלי הוכחת נזק, והוא
 * הרכב הרגיל של תובענות ייצוגיות בתחום. וואטסאפ נכלל, לא רק SMS ומייל.
 */
export function MarketingConsent({ checked, onChange, className }: MarketingConsentProps) {
  return (
    <QuoteCheckbox
      name="consent_marketing"
      checked={checked}
      onChange={(e) => onChange(e.currentTarget.checked)}
      data-consent-version={CONSENT_TEXT_VERSION}
      label={MARKETING_CONSENT_TEXT}
      className={className}
    />
  );
}

/* ═══════════════════ הרגעה ═══════════════════ */

/**
 * spec 02 §3.10.
 *
 * השורה «לא שולחים ניוזלטר · שיחה או וואטסאפ אחד בנוגע לאירוע — וזה הכל»
 * **אינה מרונדרת כאן בכוונה.** היא התחייבות עובדתית על התנהגות ה־CRM
 * ועל אי־העברת מידע לצד שלישי, ואף אחת מהשתיים לא אושרה. אם היא תישלח
 * בלי אישור, השורה הופכת מהבטחה מרגיעה להפרת אמון — ולצילום מסך.
 *
 * מה שכן מרונדר: זמן התגובה, ורק אם נמסר. `24 שעות` אינו ברירת מחדל
 * לגיטימית — זו ה־SLA המפסידה בקטגוריה והטענה הקלה ביותר לצילום.
 */
export function ReassuranceLines({ className }: { className?: string }) {
  const responseTime = SLOTS.responseTime;
  if (!filled(responseTime)) return null;

  return (
    <p className={cn("max-w-body text-xs text-fg-muted", className)}>
      בדרך כלל חוזרים {responseTime}.
    </p>
  );
}

/* ═══════════════════ תנאים מסחריים ═══════════════════ */

/**
 * spec 02 §3.12 — רצועה דקה מתחת לכפתור השליחה.
 *
 * שום דבר לא מעלה את הביטחון של קונה אחראי מהר יותר מלראות את התנאים
 * **לפני** שהוא מתחייב, כי אלה בדיוק העובדות שהוא יידרש להגן עליהן.
 * כל שורה נגזמת לחוד; אם כל השורות ריקות הרצועה אינה קיימת.
 */
export function TermsStrip({ className }: { className?: string }) {
  const rows: Array<{ term: string; value: string }> = [];

  const payment = SLOTS.paymentTerms;
  if (filled(payment)) rows.push({ term: "מקדמה ותשלום", value: payment });

  const headcount = SLOTS.headcountDeadline;
  if (filled(headcount)) rows.push({ term: "שינוי מספר סועדים עד", value: headcount });

  if (!rows.length) return null;

  return (
    <dl
      className={cn(
"hairline max-w-body grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 pt-4 text-3xs text-fg-subtle",
        className,
      )}
    >
      {rows.map((row) => (
        <React.Fragment key={row.term}>
          <dt className="font-semibold tracking-[.09em]">{row.term}</dt>
          <dd className="m-0">{row.value}</dd>
        </React.Fragment>
      ))}
    </dl>
  );
}
