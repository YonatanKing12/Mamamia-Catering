/**
 * ═══════════════════════════════════════════════════════════════════════
 *  ספריית הבאנדים — הסקשנים המשותפים שכל חמישה־עשר העמודים מורכבים מהם.
 * ═══════════════════════════════════════════════════════════════════════
 *
 * docs/spec/03-design-system.md §7, docs/spec/01-site-architecture.md §3.1.
 *
 * בלי הספרייה הזאת כל עמוד ימציא מחדש את אותם בלוקים, והאתר ייראה
 * כחמישה־עשר אתרים. הקומפוננטות כאן הן שכבה אחת מעל `primitives/`:
 * הן מרכיבות פרימיטיבים, הן לא ממציאות חדשים.
 *
 * ─── מה שנכון לגבי כל באנד כאן, בלי יוצא מן הכלל ─────────────────
 *
 *  · **props מוטפסים, ואפס עובדה עסקית בגוף הקובץ.** מחיר, מינימום,
 *    כתובת, שעה, אזור וזמן תגובה מגיעים מהעמוד, שקורא אותם מ־
 *    ‎`content/business.ts`. באנד שכותב אחד מהם בעצמו הוא באג.
 *
 *  · **שער, לא שלד ריק (INV-2 / L-5).** באנד שאין לו ולו משבצת מלאה
 *    אחת מחזיר `null` — לא כותרת מעל כלום, לא רשת של תאים ריקים, ולא
 *    ‎`—` במקום ערך. זה המבחן שכל עמוד נבנה לעבור: להיראות מכוון ושלם
 *    כשכל המשבצות ריקות, כי זה המצב היום.
 *
 *  · **תכונות לוגיות בלבד (L-12), עברית בלבד, בלי מקף בין שני מספרים
 *    (L-14).** טווח נכתב בצורת מחבר — «בין X ל־Y».
 *
 *  · **בלי צילום (L-1, L-2).** אין לאף באנד כאן prop של תמונה. זו לא
 *    השמטה — זו הסיבה שהכיוון שורד מלאי צילומים ריק.
 *
 * ─── סדר השדרה (01 §3.1) ────────────────────────────────────────
 *   01 MenuSheet · 02 ServiceFormats · 03 InclusionsExclusions ·
 *   04 LimitsBlock · 05 BranchStrip · 06 QuoteCta · 07 FaqBand ·
 *   08 Colophon (‎`layout/footer.tsx`).
 * ‎`KitchenNote`, `OpsFacts`, `WhatsAppBand` ו־`NextSteps` אינם בשדרה
 * ‎(§3.4) ומשובצים לפי חוזה העמוד.
 *
 * ─── הספרות הסידוריות ───────────────────────────────────────────
 * ‎`num` נקבע **בעמוד לפי מיקום** ולעולם לא בתוך באנד: סקשן שנשמט אינו
 * רשאי להשאיר חור במספור, וחור במספור הוא האות הרועשת ביותר ל«תבנית
 * עם חלקים חסרים».
 *
 * ‎`section.tsx` (`BandSection`) אינו מיוצא מכאן בכוונה — הוא הפיגום
 * הפנימי של הספרייה, לא באנד שעמוד משבץ.
 */

export { MenuSheet, type MenuSheetProps, type MenuSheetGrouping } from "./menu-sheet";
export { DishList, type DishLine, type DishListProps, type DishMark } from "./dish-list";

export { OccasionIntro, type OccasionIntroProps } from "./occasion-intro";

export {
  ServiceFormats,
  type ServiceFormatSpec,
  type ServiceFormatsProps,
} from "./service-formats";

export { OpsFacts, type OpsFactRow, type OpsFactsProps } from "./ops-facts";

export {
  KitchenNote,
  KITCHEN_NOTE_STATEMENT_HE,
  KITCHEN_NOTE_TITLE_HE,
  type KitchenNoteProps,
} from "./kitchen-note";

export {
  BranchStrip,
  branchHrefIfServed,
  branchSlug,
  defaultBranchEntries,
  type BranchStripEntry,
  type BranchStripProps,
} from "./branch-strip";

export { FaqBand, answeredFaqs, type FaqBandProps, type FaqItem } from "./faq-band";

export { QuoteCta, type QuoteCtaProps } from "./quote-cta";

export { WhatsAppBand, type WhatsAppBandProps } from "./whatsapp-band";

export { NextSteps, type NextStepLink, type NextStepsProps } from "./next-steps";

/** נחשף רק לעמוד שבונה באנד חדש בתוך אותו קצב טיפוגרפי. */
export type { BandTone } from "./section";
