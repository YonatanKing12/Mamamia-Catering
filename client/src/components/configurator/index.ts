/**
 * ═══════════════════════════════════════════════════════════════════════
 *  המגדיר — spec docs/spec/04 §6.
 * ═══════════════════════════════════════════════════════════════════════
 *
 * ‎`MenuConfigurator` הוא נקודת הכניסה היחידה שעמוד צריך, ו־`sourcePage`
 * הוא prop חובה. הוא בולע בעצמו את המצב שבו אין מנות או אין חבילות
 * ומגיש במקומו את בנאי ארבע השאלות — עמוד שמרנדר אותו אינו יכול להישאר
 * ריק, ואינו צריך לבדוק דבר לפני שהוא מרנדר.
 *
 * **המודל אינו כאן.** חבילה, קטגוריה, מכסה, בחירה ומחיר יושבים ב־
 * ‎`content/packages.ts` ו־`content/dish-categories.ts`, ומיוצאים משם.
 * התיקייה הזאת היא תצוגה ומצב UI, ואינה מייצאת טיפוס נתונים משלה — כדי
 * שלא ייווצר מודל שני שיסטה מהראשון.
 *
 * שום דבר כאן אינו מגדיר מסלול. המסלול הדרוש מדווח ואינו נרשם מכאן.
 */

export { MenuConfigurator, type MenuConfiguratorProps } from "./configurator";
export {
  ConfiguratorUnavailable,
  type ConfiguratorUnavailableProps,
} from "./unavailable";

export { DishCard, type DishCardProps } from "./dish-card";
export { CategoryStep, type CategoryStepProps } from "./category-step";
export {
  GuestsStep,
  PackageStep,
  type GuestsStepProps,
  type PackageStepProps,
} from "./intro-steps";
export { ReviewStep, type ReviewStepProps } from "./review-step";
export {
  ContactStep,
  EMPTY_CONTACT,
  type ContactStepProps,
  type ContactValues,
} from "./contact-step";
export {
  RunningSummary,
  type RunningSummaryProps,
  type SummaryVariant,
} from "./running-summary";

export {
  GUESTS_INPUT_CEILING,
  buildSteps,
  categoryHasDishes,
  clearStoredBuild,
  dishIsOverQuota,
  liveDishIds,
  stepIsSatisfied,
  useConfigurator,
  type ConfiguratorApi,
  type StepDescriptor,
  type StepKind,
  type UseConfiguratorOptions,
} from "./use-configurator";

export {
  buildConfiguratorWaHref,
  buildConfiguratorWaMessage,
  buildSelectionNotes,
  type ConfiguratorWaAnswers,
} from "./wa-message";

export {
  COPY as CONFIGURATOR_COPY,
  ERRORS as CONFIGURATOR_ERRORS,
  STEP_IDS as CONFIGURATOR_STEP_IDS,
  guestsSentence,
  pickedSentence,
  quotaSentence,
  remainingSentence,
  type ConfiguratorStepId,
} from "./copy";
