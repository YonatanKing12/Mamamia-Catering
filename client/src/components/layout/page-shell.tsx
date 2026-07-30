/**
 * PageShell — 03 §10.2, 01 §5.7 (`layouts/site-layout.tsx` בשמו שם).
 *
 * העטיפה שכל מסלול עובר דרכה, וזה כל מה שהיא: קישור דילוג, כותרת, ציון דרך
 * <main> אחד עם id="main", פוטר, ופס ה־CTA הדביק לפי הגדרת המסלול.
 * היום ל־home אין <main> בכלל ואין קישור דילוג בשום מקום בקוד; משהצבנו אותם
 * כאן, כל מסלול חדש יורש אותם ואי אפשר לשכוח אותם בעמוד התשיעי.
 *
 * ‎[id]{scroll-margin-top:88px} כבר בבסיס (index.css §5), ולכן קפיצה לעוגן
 * לא נחתכת מתחת לכותרת הדביקה.
 *
 * הפס הדביק הוא chrome ולא תוכן, והוא היחיד שמותר לו לחלוק מסך עם ה־CTA של
 * הסקשן (L-10). ברירת המחדל היא 'none' במכוון: מסלול שלא הצהיר מקבל עמוד בלי
 * פס. הכיוון הזה הוא הבטוח — כפתור "הצעה" קבוע על /catering/shiva הוא בדיוק
 * הכשל הטונלי שהמסלול ההוא נבנה כדי למנוע (§7.29).
 */

import * as React from "react";
import { Header } from "./header";
import { Footer } from "./footer";
import { StickyCta, type StickyCtaMode } from "@/components/primitives";
import { cn } from "@/lib/utils";

/** 01 §5.3 / 03 §7.29 — הערך מגיע מ־RouteDef.stickyBar. */
export type StickyBar = StickyCtaMode;

export interface PageShellProps {
  children: React.ReactNode;
  /** ברירת מחדל 'none' — הצהרה מפורשת נדרשת כדי להציג פס המרה. */
  stickyBar?: StickyBar;
  /** פירורי לחם: שורת קו־שיער אחת מתחת לכותרת, בכל מסלול פנימי (01 §5.3). */
  breadcrumb?: React.ReactNode;
  /** `שאלות` בניווט: עוגן בעמוד במסלול שיש בו FAQ. */
  faqHref?: string;
  /** מחלקות על <main> בלבד. הקצב עצמו מגיע מ־.sec בתוך הסקשנים. */
  className?: string;
}

export const PageShell = ({
  children,
  stickyBar = "none",
  breadcrumb,
  faqHref,
  className,
}: PageShellProps) => (
  <div className="flex min-h-screen flex-col bg-bg font-sans text-base text-fg">
    <a className="skip" href="#main">
      דלגו לתוכן הראשי
    </a>

    <Header faqHref={faqHref} />

    {breadcrumb}

    {/* tabIndex={-1} כדי שקישור הדילוג יעביר פוקוס אמיתי גם ב־Safari. */}
    <main id="main" tabIndex={-1} className={cn("flex-1 outline-none", className)}>
      {children}
    </main>

    <Footer />

    {/* mode='none' מחזיר null בעצמו, כולל ה־spacer — אין כאן תנאי כפול. */}
    <StickyCta mode={stickyBar} />
  </div>
);

export default PageShell;
