/**
 * ═══════════════════════════════════════════════════════════════════════
 *  QuoteCta — באנד ההמרה. הבנאי הקיים, מוכן להשתלה בכל עמוד.
 * ═══════════════════════════════════════════════════════════════════════
 *
 * spec 01 §3.1 סקשן 06, spec 02 §3, §5.1, §1.7.
 *
 * הבנאי עצמו כתוב, מאומת ולא נוגעים בו. הבאנד הזה הוא העטיפה שחוזרת
 * בכל עמוד: משטח `--paper-3` אחד, כותרת ממוספרת שהעמוד קובע את מספרה,
 * וזריעה מראש של סוג האירוע של אותו עמוד.
 *
 * ─── ארבע הנקודות שהעטיפה קיימת בשבילן ──────────────────────────
 *
 *  1. **הכותרת נכתבת כאן ולא בבנאי.** `COPY.sectionNum` בתוך הבנאי קשיח
 *     על `05`, והמספור נקבע לפי מיקום (01 §3.1). חור במספור הוא האות
 *     הרועשת ביותר ל«תבנית עם חלקים חסרים», ולכן `showHeader={false}`
 *     והמספר מגיע מהעמוד.
 *
 *  2. **`onSubmitted` מנווט ל־`/thanks?ref=`.** מעבר מסלול ולא החלפה
 *     במקום (02 §5.1). בלי זה הבנאי מרנדר מצב הצלחה בתוך העמוד, ושום
 *     פלטפורמת מדידה לא רושמת המרה ברמת עמוד — בדיוק שלב ההמרה שאובד.
 *
 *  3. **הזריעה נשארת גלויה וניתנת לעריכה.** `applySeed` בבנאי כבר אוכף
 *     את זה; העטיפה רק מעבירה `seed`. קישור שהועבר הלאה לא יכתוב ליד עם
 *     תווית שגויה (02 §1.7).
 *
 *  4. **`offerAtRestaurant` הוא שער ולא נוחות.** הצ'יפ «אירוח אצלנו
 *     במסעדה» הוא מצג שהמסעדות מארחות אירועים פרטיים. ברירת המחדל היא
 *     `false`, והעמוד מדליק אותו רק מקיבולת אירוע פרטי שנמסרה לסניף.
 *
 * ─── איפה הבאנד הזה לא מופיע ────────────────────────────────────
 * ‎/catering/shiva ו־/urgent (01 P-11, P-15): טופס בן ארבעה שלבים הוא
 * הכלי הלא נכון למי שצריך אוכל בעוד ארבע שעות, ובעמוד שבעה הוא פשוט לא
 * במקומו. שני העמודים האלה מרנדרים `WhatsAppBand` ושורת טלפון במקום.
 */

import * as React from "react";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { SectionHeader } from "@/components/primitives";
import { QuoteBuilder } from "@/components/quote/quote-builder";
import type { QuoteAnswers, QuoteSeed } from "@/components/quote/use-quote-builder";

export interface QuoteCtaProps {
  /** **חובה.** הודעת האיסוף והייחוס תלויים בו (02 §3.9). */
  sourcePage: string;
  /** סוג אירוע, אזור, סניף, פורמט או מנות — מה שהעמוד יודע מראש. */
  seed?: QuoteSeed;
  /** ראו נקודה 4 למעלה. */
  offerAtRestaurant?: boolean;

  id?: string;
  num?: string;
  eyebrow?: React.ReactNode;
  title?: React.ReactNode;
  lede?: React.ReactNode;
  /** דריסת הניווט אחרי שליחה. ברירת המחדל היא `/thanks?ref=`. */
  onSubmitted?: (ref: string, answers: QuoteAnswers) => void;
  className?: string;
}

export function QuoteCta({
  sourcePage,
  seed,
  offerAtRestaurant = false,
  id = "quote",
  num,
  eyebrow,
  title = "התפריט שלכם",
  lede = "ארבע שאלות על האירוע, ואז פרטים ליצירת קשר. אפשר גם פשוט לכתוב בוואטסאפ.",
  onSubmitted,
  className,
}: QuoteCtaProps) {
  const [, navigate] = useLocation();

  const handleSubmitted = React.useCallback(
    (ref: string, answers: QuoteAnswers) => {
      if (onSubmitted) {
        onSubmitted(ref, answers);
        return;
      }
      navigate(`/thanks?ref=${encodeURIComponent(ref)}`, { state: { ref, answers } });
    },
    [navigate, onSubmitted],
  );

  return (
    /* העוגן יושב על העטיפה ולא על הבנאי, כדי שקפיצה מ־#quote תנחת על
       הכותרת ולא מתחתיה. */
    <div
      id={id}
      className={cn(
"border-y border-solid border-y-[color:var(--rule)] bg-bg-form",
        className,
      )}
    >
      <div className="wrap pt-sec">
        <SectionHeader num={num} eyebrow={eyebrow} title={title} lede={lede} reveal={false} />
      </div>

      <QuoteBuilder
        id={`${id}-builder`}
        sourcePage={sourcePage}
        seed={seed}
        offerAtRestaurant={offerAtRestaurant}
        showHeader={false}
        className="!pt-0"
        onSubmitted={handleSubmitted}
      />
    </div>
  );
}
