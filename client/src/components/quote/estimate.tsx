/**
 * ═══════════════════════════════════════════════════════════════════════
 *  EstimateRange — הערכת מחיר. כבויה, וזה מצב ברירת המחדל והמצב הנוכחי.
 * ═══════════════════════════════════════════════════════════════════════
 *
 * spec 02 §2.
 *
 * ─── מה הקומפוננטה הזאת עושה היום ──────────────────────────────
 * `null`. תמיד. `SLOTS.pricePerPerson` הוא `null`, ולכן מנעול 1 נופל,
 * ולכן אין פלט. אין כאן «החל מ־», אין מספר חלופי, אין טווח לדוגמה ואין
 * מצב טעינה. אין בלוק ריק ואין כותרת יתומה.
 *
 * ─── למה זה בנוי כך ומדוע אין דרך לעקוף ──────────────────────
 * מספר בשקלים ליד פקד שנקרא כקבלה יכול להגיע ל«מסוימות» ולהפוך להצעה
 * לפי ס' 2(א) לחוק הגנת הצרכן. מחשבון המחירים של גרסת רפליט עשה בדיוק
 * את זה: `₪{total}` מודגש, מתחתיו «המחיר כולל את כל המנות והשירותים
 * שבחרתם», ומעליו כפתור «הזמינו עכשיו». התעריפים שהזינו אותו הומצאו.
 *
 * ארבעה מנעולים בלתי תלויים, וכל אחד לבדו מבטל את התצוגה:
 *
 *   1. טווח מלא וחיובי לפורמט השירות שנבחר — `SLOTS.pricePerPerson`.
 *   2. תאריך מחירון מאושר — `approvedAt`.
 *   3. הכרעה מפורשת בשאלת המע״מ — `vatLine`.
 *   4. טקסט הסייג שהבעלים כתב — `qualifier`.
 *
 * שלושת האחרונים הם props **חובה** מסוג `Slot`, ואין להם ברירת מחדל לא
 * כאן ולא בשום מקום אחר: קומפוננטה שמסרבת לרנדר מספר בלי הסייג שלו היא
 * ההגנה המבנית היחידה מפני העתקת המספר לדף נחיתה חדש בלי הסייג.
 *
 * כשהבעלים יאשר תעריפים: התצוגה היא **טווח**, לעולם לא מספר בודד, והסייג
 * יושב **מעל** המספר, באותו גודל ואותו משקל. הערת שוליים אפורה 11px מתחת
 * לספרה גדולה היא בדיוק הדפוס שנכשל במבחן הצרכן הסביר.
 */

import * as React from "react";
import { SLOTS, filled, type Slot } from "@/content/business";
import { Ltr, Money } from "@/components/primitives";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/utils";
import { GUEST_BAND_CEILING, GUEST_BAND_FLOOR } from "./quote-config";
import type { GuestBand, ServiceFormat } from "@shared/lead-constants";

export interface EstimateInputs {
  format: ServiceFormat | null;
  guestBand: GuestBand | null;
  /** נוסח הסייג כפי שהבעלים כתב אותו. בלעדיו אין תצוגה. */
  qualifier: Slot<string>;
  /** אחת משתי מחרוזות המע״מ הקבועות. בלעדיה המספר דו־משמעי משפטית. */
  vatLine: Slot<string>;
  /** תאריך המחירון שאושר, ISO. בלעדיו אין תאריך להדפיס. */
  approvedAt: Slot<string>;
}

interface ResolvedEstimate {
  lo: number;
  hi: number;
  qualifier: string;
  vatLine: string;
  approvedAt: string;
}

/** עיגול כלפי מעלה ומטה לכפולה, כדי שהטווח לא ייראה מחושב לשקל. */
const ROUND_TO = 100;
const roundDown = (n: number) => Math.floor(n / ROUND_TO) * ROUND_TO;
const roundUp = (n: number) => Math.ceil(n / ROUND_TO) * ROUND_TO;

/**
 * ארבעת המנעולים. מחזירה `null` — כלומר «אין תצוגה» — אלא אם כולם עוברים.
 * זו הפונקציה היחידה שיכולה להוליד מספר, וקל לבדוק אותה בבידוד.
 */
export function resolveEstimate(input: EstimateInputs): ResolvedEstimate | null {
  const { format, guestBand, qualifier, vatLine, approvedAt } = input;
  if (!format || !guestBand) return null;

  /* 1 — תעריף מאושר לפורמט הזה */
  const table = SLOTS.pricePerPerson;
  if (!filled(table)) return null;
  const band = table[format];
  if (
    !band ||
    typeof band.from !== "number" ||
    typeof band.to !== "number" ||
    !Number.isFinite(band.from) ||
    !Number.isFinite(band.to) ||
    band.from <= 0 ||
    band.to < band.from
  ) {
    return null;
  }

  /* 2 — תאריך מחירון מאושר */
  if (!filled(approvedAt) || !/^\d{4}-\d{2}-\d{2}$/.test(approvedAt)) return null;

  /* 3 — הכרעה מפורשת בשאלת המע״מ */
  if (!filled(vatLine)) return null;

  /* 4 — סייג שהבעלים כתב */
  if (!filled(qualifier) || qualifier.trim().length === 0) return null;

  const floor = GUEST_BAND_FLOOR[guestBand];
  const ceiling = GUEST_BAND_CEILING[guestBand] ?? floor;

  const lo = roundDown(floor * band.from);
  const hi = roundUp(ceiling * band.to);
  if (!(lo > 0) || !(hi >= lo)) return null;

  return { lo, hi, qualifier: qualifier.trim(), vatLine, approvedAt };
}

export interface EstimateRangeProps extends EstimateInputs {
  className?: string;
}

export function EstimateRange({ className, ...input }: EstimateRangeProps) {
  const resolved = resolveEstimate(input);

  /* המדידה נורית רק כשבאמת הוצג טווח. במצב ההשקה `estimate_shown`
     לא נורה מעולם, וזה נכון — אין מה למדוד. */
  React.useEffect(() => {
    if (!resolved || !input.format) return;
    track("estimate_shown", {
      estimate_min: resolved.lo,
      estimate_max: resolved.hi,
      service_format: input.format,
    });
  }, [resolved?.lo, resolved?.hi, input.format]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!resolved) return null;

  return (
    <div className={cn("rounded border border-rule bg-bg-alt p-[1.3rem_1.4rem]", className)}>
      <p className="eyebrow mb-2">טווח מחירים משוער</p>

      {/* הסייג מעל המספר, באותו גודל ואותו משקל — spec 02 §2.3. */}
      <p className="max-w-body text-lg font-medium leading-sub">{resolved.qualifier}</p>

      {/*
        מחבר עברי במקום מקף בין שני סכומים.
        מקף בין שני רצפי ספרות בפסקה RTL מתהפך — ו־U+2013 בין ספרות הוא
        גם הפרה של L-14. מילות החיבור «בין» ו«ל־» הן תווים RTL חזקים,
        ולכן כל סכום נשאר במקומו ואין צורך במכולת LTR עוטפת בכלל.
      */}
      <p className="mt-3 text-lg font-medium">
        בין <Money value={resolved.lo} /> ל־<Money value={resolved.hi} />
      </p>

      <p className="mt-3 max-w-body text-xs text-fg-subtle">{resolved.vatLine}</p>
      <p className="mt-1 max-w-body text-xs text-fg-subtle">
        מבוסס על מחירון <Ltr className="num-inline">{resolved.approvedAt}</Ltr>. הערכה בלבד
        ואינה הצעה מחייבת. המחיר הסופי ייקבע בהצעה בכתב לאחר בירור פרטי האירוע.
      </p>
    </div>
  );
}
