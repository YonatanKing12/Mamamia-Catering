/**
 * ═══════════════════════════════════════════════════════════════════════
 *  שכבת האמון.
 * ═══════════════════════════════════════════════════════════════════════
 *
 * בקטגוריית הקייטרינג הקונה אינו יכול לטעום לפני שהוא סוגר, ולכן ההחלטה
 * שלו נשענת כמעט כולה על ראיות חיצוניות: גוף כשרות נקוב, מונה ביקורות
 * גלוי עם דירוג, וצילומים של אירועים שבאמת קרו. באתר הזה אין היום אף
 * אחד מהשלושה — וזה, ולא העיצוב, הפער הגדול ביותר מול הקטגוריה
 * (`docs/spec/04-visual-reference.md` §5).
 *
 * חמש הקומפוננטות כאן בנויות מלאות ומחווטות, וכל אחת מהן שואלת שער
 * לפני שהיא מרנדרת משהו:
 *
 *   KashrutBadge   ← `SLOTS.kashrutByBranch` · `kashrutStatement()`
 *   ReviewsBlock   ← `googleReviews()` · `publishableTestimonials()`
 *   Gallery        ← `galleryImages()`
 *   OccasionGrid   ← `buildableOccasions()`      ← **מרנדרת היום**
 *   ContactBar     ← אינה תלויה בשום משבצת ריקה  ← **מרנדרת היום**
 *
 * שלוש הראשונות מחזירות `null` כרגע, ובכוונה: המבחן הוא שכל עמוד נראה
 * מכוון וגמור כשכל משבצת ריקה, כי זה מצבו של האתר היום. אין ריבוע אפור,
 * אין דירוג לדוגמה, ואין «בקרוב».
 *
 * מה שמדליק כל אחת מהן יושב ב־`content/proof.ts` וב־`content/business.ts`,
 * במשבצת אחת לכל עובדה, עם `TODO(owner)` שמסביר בדיוק מה נדרש.
 */

export {
  KashrutBadge,
  kashrutWording,
  hasKashrutWording,
  type KashrutBadgeProps,
  type KashrutBadgeVariant,
} from "./kashrut-badge";

export { ReviewsBlock, type ReviewsBlockProps } from "./reviews-block";
export { Gallery, type GalleryProps } from "./gallery";
export { OccasionGrid, type OccasionGridProps } from "./occasion-grid";
export { ContactBar, type ContactBarProps } from "./contact-bar";
