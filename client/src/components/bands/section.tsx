/**
 * ═══════════════════════════════════════════════════════════════════════
 *  BandSection — הפיגום המשותף לכל הבאנדים. פנימי לספרייה.
 * ═══════════════════════════════════════════════════════════════════════
 *
 * spec 03 §3.1, §3.4, §7.6. אינו מיוצא מ־index.ts בכוונה: הוא אינו
 * פרימיטיב ואינו באנד, אלא העטיפה שחמישה־עשר עמודים לא צריכים לכתוב
 * חמש־עשרה פעמים. באנד מייצא את עצמו; העטיפה נשארת פנימית.
 *
 * שלוש החלטות שמחזיקות אותו:
 *
 *  1. **הוא לעולם לא מחליט אם לרנדר.** ההחלטה הזאת שייכת לבאנד, שהוא
 *     היחיד שיודע אילו משבצות שלו מלאות (INV-2). העטיפה מניחה שכבר הוכרע
 *     שיש מה להראות.
 *
 *  2. **`reveal` כבוי כברירת מחדל.** `.reveal{opacity:0}` יושב ב־index.css
 *     ואין בקוד שום דבר שמוסיף `.is-in` — אין `useReveal`, אין
 *     IntersectionObserver, אין כלום (מאומת בעץ ב־HEAD; זה בדיוק D2 בדוח
 *     ביקורת המפרטים). כל כותרת שנדלקת עם reveal היום היא כותרת בלתי
 *     נראית. עד שהמנגנון קיים, ברירת המחדל היא לא להסתיר תוכן.
 *
 *  3. **הבאנד הכהה הוא opt-in ומוגבל.** L-9 מתיר `data-band="ink"` אחד
 *     למסלול, ו־`layout/footer.tsx` כבר נושא אותו. לכן `tone="ink"` קיים
 *     אבל אינו ברירת המחדל של אף באנד כאן.
 */

import * as React from "react";
import { cn } from "@/lib/utils";
import { SectionHeader } from "@/components/primitives";

export type BandTone = "paper" | "alt" | "form" | "ink";

const TONE: Record<BandTone, string> = {
  paper: "",
  /* .sec--alt נושא גם רקע וגם קווי גבול עליון ותחתון (§3.4 טכניקה 4) */
  alt: "sec--alt",
  /* משטח הטופס — אחד לעמוד (§2.1). הקווים נכתבים במפורש, כי --rule
     כמחלקה קצרה מתנגש עם borderWidth.rule=2px בקונפיג. */
  form: "bg-bg-form border-y border-solid border-y-[color:var(--rule)]",
  /* הרקע נקרא מ־--bg, שהבלוק [data-band="ink"] מגדיר מחדש על האלמנט עצמו. */
  ink: "bg-bg",
};

export interface BandSectionProps
  extends Omit<React.HTMLAttributes<HTMLElement>, "title"> {
  /** עוגן. `#quote`, `#kitchens`, `#faq` — יעדי הקפיצה של העמוד. */
  id?: string;
  /** הספרה הסידורית. נקבעת בעמוד לפי מיקום (§3.1), לא כאן. */
  num?: string;
  eyebrow?: React.ReactNode;
  title?: React.ReactNode;
  lede?: React.ReactNode;
  headingAs?: "h1" | "h2" | "h3";
  tone?: BandTone;
  /** ריפוד מוקטן — לבאנדים דקים (§3.1 --pad-sec-tight). */
  tight?: boolean;
  /** ראו הערה 2 למעלה. אל תדליקו עד שקיים משקיף שמוסיף `.is-in`. */
  reveal?: boolean;
  /** מזהה הבאנד לצורך L-9. רלוונטי רק ל־tone="ink". */
  bandId?: string;
  /** תוכן שיושב מעל הכותרת, בתוך ה־wrap. */
  before?: React.ReactNode;
  children?: React.ReactNode;
}

export function BandSection({
  id,
  num,
  eyebrow,
  title,
  lede,
  headingAs = "h2",
  tone = "paper",
  tight = false,
  reveal = false,
  bandId,
  before,
  className,
  children,
  ...rest
}: BandSectionProps) {
  const ink = tone === "ink";

  return (
    <section
      id={id}
      data-band={ink ? "ink" : undefined}
      data-band-id={ink ? bandId ?? "kitchens" : undefined}
      className={cn(tight ? "sec sec--tight" : "sec", TONE[tone], className)}
      {...rest}
    >
      <div className="wrap">
        {before}
        <SectionHeader
          num={num}
          eyebrow={eyebrow}
          title={title}
          lede={lede}
          as={headingAs}
          reveal={reveal}
        />
        {children}
      </div>
    </section>
  );
}
