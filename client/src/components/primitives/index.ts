/**
 * ספריית הפרימיטיבים — docs/spec/03-design-system.md §7.
 *
 * החלקים שכל עמוד באתר מורכב מהם. כל אחד מהם:
 *   · forwardRef, props מוטפסים, ומיזוג className דרך cn.
 *   · כתוב מול הטוקנים הסמנטיים (§2.2) בלבד, ולכן מתהפך לבד בתוך
 *     [data-band="ink"] ותחת html[data-contrast="high"] בלי שום prop.
 *   · תכונות לוגיות בלבד (§9.1) — ms/me, ps/pe, start/end, border-s/e.
 *   · focus-visible מגיע מכלל הבסיס היחיד ב־index.css. לעולם לא outline:none.
 *   · אפס עובדות עסקיות. מספר, מחיר, כתובת, שעה, מינימום או אזור אינם
 *     יכולים להיכתב כאן — הם מגיעים כ־props ממודול תוכן, או שאינם.
 *
 * הטלפון והוואטסאפ מיובאים אך ורק מ־content/business.ts.
 */

export { Button, type ButtonProps, type ButtonSize, type ButtonVariant } from "./button";
export { CtaPair, type CtaPairProps, type CtaSpec } from "./cta-pair";
export {
  Field,
  TextInput,
  Textarea,
  fieldControlClass,
  type FieldControlProps,
  type FieldKind,
  type FieldProps,
  type TextInputProps,
  type TextareaProps,
} from "./field";
export {
  RadioCard,
  RadioCardGroup,
  type RadioCardProps,
  type RadioCardGroupProps,
  type RadioCardVariant,
} from "./radio-card";
export { SectionHeader, type SectionHeaderProps } from "./section-header";
export { Rule, type RuleProps, type RuleWeight } from "./rule";
export {
  PhotoFrame,
  type PhotoFrameProps,
  type PhotoRatio,
} from "./photo-frame";
export { Prose, type ProseProps, type ProseMeasure, type ProseSize } from "./prose";
export { StickyCta, type StickyCtaMode, type StickyCtaProps } from "./sticky-cta";
export { Ltr, Money, Num, type LtrProps, type MoneyProps, type NumProps } from "./ltr";
export { WhatsAppGlyph, type GlyphProps } from "./brand-icons";
