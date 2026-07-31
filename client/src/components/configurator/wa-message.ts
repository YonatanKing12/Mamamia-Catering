/**
 * ═══════════════════════════════════════════════════════════════════════
 *  הודעת הוואטסאפ של המגדיר.
 * ═══════════════════════════════════════════════════════════════════════
 *
 * ─── למה לא `buildWaMessage` מ־`lib/lead-client` ────────────────
 * ההודעה שם בנויה לטופס ארבע השאלות: סוג · סועדים · תאריך · אזור, ורשימת
 * מנות שטוחה. המגדיר שולח **מבנה** — חבילה, ואז קטגוריה אחר קטגוריה עם
 * המנות שנבחרו בה. שטיחה של המבנה הזה לשורה אחת הופכת את מה שהמבקר בנה
 * לעשר דקות לרשימת שמות בלי הקשר, ובדיוק בערוץ שבו הבעלים באמת קורא.
 *
 * מה כן נלקח משם, מילה במילה:
 *   · `waLink()` מ־`content/business.ts` הוא המקום **היחיד** שמרכיב
 *     כתובת וואטסאפ. אין מספר קשיח כאן ולא יהיה.
 *   · תקציב הכתובת. עברית מתנפחת פי ~4.9 תחת `encodeURIComponent`
 *     (`%D7%90` — שישה תווים לאות), ומעליו לקוחות מסוימים חותכים או
 *     מסרבים לפתוח.
 *   · שני הכללים הבלתי מתפשרים: שורה שאין עליה תשובה **מושמטת** ולעולם
 *     לא «לא צוין», ו**שום סכום בשקלים אינו נכנס לכאן** — גם לא כשמנעולי
 *     המחיר יעברו. מספר שנוסע לוואטסאפ הופך להצעת מחיר כתובה, מתוארכת
 *     ושמורה אצל הלקוח. ההערכה נשארת בדף.
 *
 * הקלט הוא `ResolvedSelection` ולא הבחירה הגולמית, ובכוונה: מזהה מנה
 * שנמחק מהתפריט בינתיים כבר נזרק שם, ולכן אין מסלול שבו שם ריק או מנה
 * שאיבדה זמינות מגיעים להודעה ששולח הלקוח.
 *
 * ההודעה בגוף ראשון כלקוח. הלקוח הוא השולח; נוסח בגוף העסק נקרא כמו בוט.
 */

import { waLink } from "@/content/business";
import type { ResolvedSelection } from "@/content/packages";
import { guestsSentence } from "./copy";

/** אותו תקציב כמו ב־`lib/lead-client`. */
const ENCODED_BUDGET = 1500;

export interface ConfiguratorWaAnswers {
  resolved: ResolvedSelection | null;
  eventType?: string | null;
  area?: string | null;
}

/**
 * ארבע רמות קיצוץ, מהמפורט לקומפקטי. **הפרטים העסקיים לעולם לא נחתכים** —
 * חבילה, סועדים, סוג אירוע, אזור ומזהה פנייה שורדים בכל רמה.
 *
 *   `full`    — קטגוריה אחר קטגוריה, מנה בשורה.
 *   `compact` — קטגוריה בשורה, מנות מופרדות בפסיקים.
 *   `counts`  — קטגוריה ומספר המנות בלבד.
 *   `none`    — בלי פירוט מנות.
 */
type Detail = "full" | "compact" | "counts" | "none";

function compose(answers: ConfiguratorWaAnswers, ref: string, detail: Detail): string {
  const { resolved } = answers;
  const lines: string[] = ["היי, בניתי תפריט באתר ורוצה הצעה."];

  const facts: string[] = [];
  if (resolved) facts.push(`חבילה: ${resolved.pkg.nameHe}`);
  if (resolved?.guestCount !== null && resolved?.guestCount !== undefined) {
    facts.push(`מספר סועדים: ${guestsSentence(resolved.guestCount)}`);
  }
  if (answers.eventType) facts.push(`סוג האירוע: ${answers.eventType}`);
  if (answers.area) facts.push(`אזור: ${answers.area}`);
  if (facts.length) lines.push("", ...facts);

  const picked = resolved?.categories.filter((line) => line.count > 0) ?? [];
  if (picked.length && detail !== "none") {
    lines.push("", "התפריט שבחרתי:");
    for (const line of picked) {
      const name = line.category.nameHe;
      if (detail === "counts") {
        lines.push(`${name}: ${line.count}`);
        continue;
      }
      if (detail === "compact") {
        lines.push(`${name}: ${line.dishes.map((d) => d.nameHe).join(", ")}`);
        continue;
      }
      lines.push(`${name}:`);
      for (const dish of line.dishes) lines.push(`· ${dish.nameHe}`);
    }
  }

  lines.push("", "מספר פנייה:", ref);
  return lines.join("\n");
}

/**
 * ההודעה המוכנה. יורדת ברמת הפירוט עד שהיא נכנסת לתקציב הכתובת.
 * הרמה האחרונה תמיד עוברת — היא כמה שורות עובדה ומזהה.
 */
export function buildConfiguratorWaMessage(
  answers: ConfiguratorWaAnswers,
  ref: string,
): string {
  const levels: Detail[] = ["full", "compact", "counts", "none"];
  for (const detail of levels) {
    const text = compose(answers, ref, detail);
    if (encodeURIComponent(text).length <= ENCODED_BUDGET) return text;
  }
  return compose(answers, ref, "none").slice(0, 300);
}

/** הקישור המוכן. עובר דרך `waLink()` — אין מספר קשיח בשום קומפוננטה. */
export function buildConfiguratorWaHref(answers: ConfiguratorWaAnswers, ref: string): string {
  return waLink(buildConfiguratorWaMessage(answers, ref));
}

/**
 * הפירוט שנכנס לשדה `notes` של הליד.
 *
 * הוא קיים מסיבה אחת: `quoteLeadSchema` נושא `selectedDishes` כמזהים
 * בלבד, ואין בו שדה לחבילה ולא למבנה הקטגוריות. בלי השורות האלה, הבעלים
 * מקבל שורת ליד עם עשרה slugs לטיניים ואינו יודע איזו חבילה נבחרה ומה
 * שייך למה. הפער האמיתי הוא בסכימה, והוא מדווח; זה הגשר עד שייסגר.
 *
 * **בלי מידע אישי ובלי סכומים**, בדיוק כמו הודעת הוואטסאפ.
 */
export function buildSelectionNotes(answers: ConfiguratorWaAnswers): string {
  const { resolved } = answers;
  if (!resolved) return "";

  const lines: string[] = [`חבילה: ${resolved.pkg.nameHe}`];
  if (resolved.guestCount !== null) {
    lines.push(`מספר סועדים שנבחר במגדיר: ${resolved.guestCount}`);
  }
  for (const line of resolved.categories) {
    if (line.count === 0) continue;
    /* «נבחרו X מתוך Y» ולא «X/Y»: לוכסן בין שני רצפי ספרות בפסקה עברית
       מתהפך בדיוק כמו מקף, והשורה הזאת נקראת במסך של בעל העסק. */
    lines.push(
      `${line.category.nameHe} — נבחרו ${line.count} מתוך ${line.quota}: ` +
        line.dishes.map((d) => d.nameHe).join(", "),
    );
  }
  return lines.join("\n").slice(0, 2000);
}
