/**
 * ═══════════════════════════════════════════════════════════════════════
 *  OpsFacts — רצועת העובדות התפעוליות.
 * ═══════════════════════════════════════════════════════════════════════
 *
 * spec 03 §7.12, §7.9, spec 01 §3.1 (G12), P-08 §OpsFacts, P-11, P-15.
 *
 * זמן התראה · מינימום · שעת חיתום להיום · חלון משלוח · אזור חלוקה ·
 * איסוף עצמי · תנאי רכש. ארבע עד שש שאלות שמנהלת משרד, בן משפחה שמארגן
 * שבעה, או מי שצריך אוכל היום — שואלים לפני כל דבר אחר.
 *
 * ─── למה זו רשימת תפריט ולא טבלה (L-6) ──────────────────────────
 * טבלה של שתי עמודות עם ארבעה תאים ריקים נראית שבורה; אותן ארבע עובדות
 * כרשימת תפריט נראות שלמות. לכן הרצועה מרונדרת כ־`<dl>` עם קו מוביל
 * מקווקו — אותו מכשיר בדיוק של שורת המנה, כך שהעמוד נשאר מסמך אחד ולא
 * מסמך עם טבלה תקועה בתוכו. תחת 640px זה גם מה שמונע גלילה אופקית.
 *
 * ─── שני כללי גזימה ─────────────────────────────────────────────
 *  · **כל שורה נגזמת לחוד.** שורה בלי ערך אינה שורה עם מקף — היא לא
 *    קיימת. אין ברירת מחדל, אין «בתיאום», אין «בדרך כלל».
 *  · **כל השורות ריקות ⇒ אין רצועה.** מסלול שאין לו ולו עובדה תפעולית
 *    אחת מדלג עליה לגמרי וחוזר לסדר הסקשנים הרגיל (01 P-08).
 *
 * ─── מיקום ──────────────────────────────────────────────────────
 * ‎`variant="strip"` הוא הצורה הצרה שיושבת מיד מתחת להירו, מעל הקיפול
 * בנייד, ב־/catering/business, ב־/urgent וב־/catering/shiva בלבד (G12).
 * בכל שאר המסלולים `variant="section"` יושב מתחת לגוש הכסף.
 *
 * ─── מה אין כאן ─────────────────────────────────────────────────
 * אף מספר, שעה, אזור או מינימום אינם נכתבים בקובץ הזה. כולם מגיעים
 * ב־props מהעמוד, שקורא אותם מ־`content/business.ts`. שעה מחושבת
 * ומוצגת ב־Asia/Jerusalem בלבד (§4.7) — ולא משעון המכשיר.
 */

import * as React from "react";
import { cn } from "@/lib/utils";
import { BandSection, type BandTone } from "./section";

/** ערך שאינו קיים. `0` ו־`false` אינם ערכים תפעוליים תקפים כאן. */
const hasValue = (v: React.ReactNode): boolean =>
  v !== null && v !== undefined && v !== "" && v !== false;

export interface OpsFactRow {
  /** מפתח יציב, לא חובה — מיפוי לפי אינדקס מספיק כשאין. */
  id?: string;
  labelHe: string;
  /** `null` הוא המצב התקין. שורה בלי ערך פשוט אינה קיימת. */
  value: React.ReactNode | null;
  /** הבהרה זעירה מתחת לערך. נגזמת לחוד. */
  noteHe?: string | null;
}

export interface OpsFactsProps {
  rows: readonly OpsFactRow[];

  id?: string;
  num?: string;
  eyebrow?: React.ReactNode;
  title?: React.ReactNode;
  lede?: React.ReactNode;
  /** "strip" — הצורה הצרה שמעל הקיפול. "section" — סקשן מלא. */
  variant?: "strip" | "section";
  tone?: BandTone;
  className?: string;
}

export function OpsFacts({
  rows,
  id,
  num,
  eyebrow,
  title,
  lede,
  variant = "section",
  tone,
  className,
}: OpsFactsProps) {
  const visible = rows.filter((row) => hasValue(row.value));

  /* INV-2 / §7.12: אין ולו שורה מלאה אחת ⇒ אין רצועה, לא טבלת מקפים. */
  if (visible.length === 0) return null;

  const strip = variant === "strip";

  return (
    <BandSection
      id={id}
      num={num}
      eyebrow={eyebrow}
      title={title}
      lede={lede}
      tone={tone ?? (strip ? "alt" : "paper")}
      tight={strip}
      className={className}
    >
      <dl
        className={cn(
          "m-0 grid gap-x-grid",
          /* שורה אחת נראית מכוונת בעמודה אחת; ארבע מתפרסות לשתיים. */
          strip
            ? "[grid-template-columns:repeat(auto-fit,minmax(240px,1fr))]"
            : "[grid-template-columns:repeat(auto-fit,minmax(280px,1fr))]",
        )}
      >
        {visible.map((row, i) => (
          <div
            key={row.id ?? `${row.labelHe}-${i}`}
            className={cn(
              "grid grid-cols-[1fr_auto] items-baseline gap-x-[.9rem] py-[.7rem]",
              "border-b border-dotted border-b-[color:var(--rule)]",
            )}
          >
            {/* ‎collapse="menu" (§7.9): התווית לובשת את תפקיד שם המנה,
                והערך את תפקיד המחיר. אותו קצב, אותו קו מוביל. */}
            <dt className="col-start-1 m-0 font-serif text-lg font-medium leading-dish">
              {row.labelHe}
            </dt>
            {/* ‎.num חובה על כל ערך מספרי. תפקידה bidi — לבודד רצף ספרות
                בתוך עברית — ולא בחירת גופן: מאז 04 §3 יש באתר משפחה אחת,
                Assistant, והיא אינה מיישרת טור שיש בו 1 (§4.6). */}
            <dd className="num col-start-2 row-start-1 m-0 text-lg font-medium">{row.value}</dd>
            {row.noteHe ? (
              <p className="col-span-2 col-start-1 m-0 mt-[.2rem] max-w-dish text-xs text-fg-muted">
                {row.noteHe}
              </p>
            ) : null}
          </div>
        ))}
      </dl>
    </BandSection>
  );
}
