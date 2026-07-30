/**
 * Rule — הקו הדק שהמערכת נשענת עליו במקום צללים (§3.3, §3.4, L-8).
 *
 *   hairline  1px --rule   — הפרדה דקורטיבית: קצה באנד, מפריד ברשימה,
 *                            מרזב ברשת, קו מוביל בשורת מנה.
 *   masthead  2px --fg     — כותר: ראש בלוק, ראש כרטיס התדריך, ראש טעימות.
 *
 * ברירת המחדל דקורטיבית ולכן היא <div aria-hidden>. קו שבאמת מפריד בין שני
 * נושאים הוא <hr> סמנטי — העבירו decorative={false} ותקבלו role="separator".
 * שני המצבים מאפסים את סגנון ברירת המחדל של הדפדפן ל־<hr>.
 */

import * as React from "react";
import { cn } from "@/lib/utils";

export type RuleWeight = "hairline" | "masthead";

export interface RuleProps extends React.HTMLAttributes<HTMLElement> {
  weight?: RuleWeight;
  /** ברירת מחדל: דקורטיבי, ולכן מוסתר מעץ הנגישות. */
  decorative?: boolean;
}

/* הצבע נכתב כערך שרירותי מפורש ולא כ־`border-rule`: tailwind.config.ts מגדיר
   `rule` גם ב־borderWidth (2px) וגם ב־colors, ולכן המחלקה הקצרה פולטת את שתי
   ההצהרות ומחזירה קו של 2px בצבע הלא נכון. אותו סייג תקף לכל `border-rule`
   באתר — מסומן בדוח כדי שמפתח הקונפיג ישנה את שם המפתח. */
const WEIGHT: Record<RuleWeight, string> = {
  hairline: "border-t-[length:var(--bw)] border-t-[color:var(--rule)]",
  masthead: "border-t-[length:var(--bw-rule)] border-t-[color:var(--fg)]",
};

export const Rule = React.forwardRef<HTMLElement, RuleProps>(function Rule(
  { weight = "hairline", decorative = true, className, ...rest },
  ref,
) {
  const classes = cn("m-0 block w-full border-0 border-solid", WEIGHT[weight], className);

  if (decorative) {
    return (
      <div
        ref={ref as React.Ref<HTMLDivElement>}
        aria-hidden="true"
        className={classes}
        {...rest}
      />
    );
  }

  return <hr ref={ref as React.Ref<HTMLHRElement>} className={classes} {...rest} />;
});
