/**
 * מנוע ההצעה — spec 02 §3, §5.
 *
 * `QuoteBuilder` הוא נקודת הכניסה היחידה שעמוד צריך. `sourcePage` הוא
 * prop חובה, ומכאן שדף נחיתה אינו יכול לשלוח טופס איסוף בלי הודעת
 * האיסוף ובלי ייחוס.
 *
 * שום דבר כאן אינו מגדיר מסלול. מצב ההצלחה מיוצא כדי שעמוד `/thanks`
 * יוכל להשתמש בו, אבל הניתוב עצמו אינו בבעלות התיקייה הזאת.
 */

export { QuoteBuilder, type QuoteBuilderProps } from "./quote-builder";
export { QuoteSuccess, type QuoteSuccessProps } from "./quote-success";
export { BriefCard, type BriefCardProps } from "./brief-card";
export { QuoteProgress, type QuoteProgressProps } from "./quote-progress";
export {
  EstimateRange,
  resolveEstimate,
  type EstimateInputs,
  type EstimateRangeProps,
} from "./estimate";
export {
  CollectionNotice,
  MarketingConsent,
  MARKETING_CONSENT_TEXT,
  QuoteCheckbox,
  ReassuranceLines,
  TermsStrip,
  collectionNoticeMissingSlots,
  COLLECTION_NOTICE_REQUIRED_SLOTS,
} from "./legal-blocks";
export { DateFields, type DateFieldsProps } from "./date-fields";
export {
  useQuoteBuilder,
  clearStoredDraft,
  displayDate,
  fromIsoDate,
  toIsoDate,
  EMPTY_ANSWERS,
  type DishSelection,
  type QuoteAnswers,
  type QuoteBuilderApi,
  type QuoteSeed,
} from "./use-quote-builder";
export {
  COPY as QUOTE_COPY,
  ERRORS as QUOTE_ERRORS,
  GUEST_BAND_DISPLAY,
  SERVICE_FORMAT_LABEL,
  CONSENT_TEXT_VERSION,
  NOTICE_VERSION,
  areaChips,
  eventTypeOptions,
  guestBandNote,
  type StepNumber,
} from "./quote-config";
