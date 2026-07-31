/**
 * Ltr · Num · Money — §7.32, §4.6, §4.7, ו־§4 «כללי דו־כיווניות».
 *
 * ─── Ltr ───────────────────────────────────────────────────────
 * טווח מספרים המחובר במקף עברי או en-dash מתהפך חזותית ב־RTL. אומת מול
 * FriBidi ו־python-bidi, שניהם בהסכמה: U+2013 הוא מחלקה ON, כלל N1 חל,
 * ספרות נספרות כ־R, ושני הצדדים מחליפים מקום. bdi ובידוד לא מתקנים את זה,
 * כי איזולט מוחלף ב־U+FFFC שהוא עצמו ON. רק מכולה LTR סביב הטווח **כולו**
 * עובדת. הניסוח המועדף הוא בכלל חיבור עברי («מ־… ועד …»), ו־Ltr הוא
 * המוצא כשטווח מילולי הוא בלתי נמנע.
 *
 * ─── Num ───────────────────────────────────────────────────────
 * הספרות הטבלאיות הן no-op שקט ב־Assistant: אין לה tnum בכלל, וספרת ה־1
 * שלה צרה ב־0.038em מכל השאר, כך שטור עם 1 לא מתיישר ואין לזה תיקון ב־CSS.
 * (שם המחלקה אינו כתוב כאן כלשונו — ה־extractor של Tailwind סורק את הקובץ
 * כטקסט, ואינו יודע מהי הערה.)
 *
 * ‏**Assistant היא נושאת הספרות היחידה.** ‎04 §3 מחייב משפחה אחת בלי זוג
 * סריפי, ולכן הגופן הסריפי שנשא ספרות בגרסה הקודמת הוסר מהאתר לגמרי —
 * ה־@font-face שלו, קובצי ה־woff2 וה־preload. `Num` חובה על מחיר, טלפון,
 * מספר סועדים, תאריך ושעה: תפקידו bidi, לא בחירת גופן.
 *
 * ─── Money ─────────────────────────────────────────────────────
 * התבנית הקנונית של CLDR לישראל היא מספר תחילה, עם NBSP לפני הסימן.
 * הפורמט נבנה עם locale מפורש: toLocaleString בלי ארגומנט נפתר ללוקאל של
 * זמן הריצה, וקיבוץ האלפים הופך ללא־דטרמיניסטי בין סביבות.
 * הסימן עצמו משורטט לרצועה העברית ולכן נמוך מהספרות — .shekel מתקן אותו.
 */

import * as React from "react";
import { cn } from "@/lib/utils";

export interface LtrProps extends React.HTMLAttributes<HTMLSpanElement> {}

export const Ltr = React.forwardRef<HTMLSpanElement, LtrProps>(function Ltr(
  { className, ...rest },
  ref,
) {
  return (
    <span ref={ref} dir="ltr" className={cn("[unicode-bidi:isolate]", className)} {...rest} />
  );
});

export interface NumProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** ספרות בתוך פרוזה עברית רצה: 0.94em, כי ספרה גבוהה מאות ב־20%–26%. */
  inline?: boolean;
  /** ברירת מחדל: לא נשבר לשורה. כבו רק במספר ארוך בתוך פסקה. */
  nowrap?: boolean;
}

export const Num = React.forwardRef<HTMLSpanElement, NumProps>(function Num(
  { inline = false, nowrap = true, className, ...rest },
  ref,
) {
  return (
    <span
      ref={ref}
      className={cn("num", inline && "num-inline", nowrap && "nowrap", className)}
      {...rest}
    />
  );
});

/* locale מפורש. maximumFractionDigits: 0 — אין אגורות בהצעת מחיר לאירוע. */
const ils = new Intl.NumberFormat("he-IL", {
  style: "currency",
  currency: "ILS",
  maximumFractionDigits: 0,
});

export interface MoneyProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, "children"> {
  value: number;
}

/**
 * הדרך היחידה המאושרת שדמות מטבע מגיעה ל־DOM. שום קומפוננטה לא כותבת
 * סכום כליטרל — כל מספר מגיע ממודול תוכן דרך Slot, ושער ה־CI אוכף את זה
 * בשני סדרי הכתיבה.
 */
export const Money = React.forwardRef<HTMLSpanElement, MoneyProps>(function Money(
  { value, className, ...rest },
  ref,
) {
  /*
   * Intl מזריק U+200F (RLM) לתוך הפלט של he-IL. אומת:
   *   formatToParts(7100) → ["‏", "7", ",", "100", " ‏", "₪"]
   *   קודים:               U+200F, 7, ",", 100, U+00A0 U+200F, ₪
   *
   * RLM הוא תו RTL חזק. מספר בודד נראה תקין איתו, אבל שני סכומים
   * באותה מכולה — טווח מחיר — מקבלים שניהם רמת bidi 1, וכלל L2 מהפך
   * את סדרם: «₪7,100 – ₪8,300» מוצג כ־«8,300 – ₪ 7,100 ₪», כלומר
   * האגפים מתחלפים וסימני השקל מתנתקים מהמספרים שלהם.
   *
   * הסימנים מיותרים כאן ממילא: המכולה עצמה נושאת את הכיוון.
   */
  const parts = ils.formatToParts(value).map((p) => ({
    ...p,
    value: p.value.replace(/[‎‏]/g, ""),
  }));

  return (
    <span ref={ref} className={cn("num", "nowrap", className)} {...rest}>
      {parts.map((part, i) =>
        part.type === "currency" ? (
          <span key={i} className="shekel">
            {part.value}
          </span>
        ) : (
          <React.Fragment key={i}>{part.value}</React.Fragment>
        ),
      )}
    </span>
  );
});
