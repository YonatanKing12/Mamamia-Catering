/**
 * ═══════════════════════════════════════════════════════════════════════
 *  MenuConfigurator — המגדיר. נקודת הכניסה היחידה שעמוד צריך.
 * ═══════════════════════════════════════════════════════════════════════
 *
 * ‎docs/spec/04 §6. ההבדל מהטופס הקיים מנוסח שם במדויק: הטופס **מבקש**
 * הצעה בארבע שאלות, המגדיר **בונה** את האירוע. מי שהשקיע עשר דקות בבחירת
 * מנות נוטש הרבה פחות, והליד שנוצר מכיל את הבחירות עצמן ולא רק «אירוע
 * ל־80 איש».
 *
 * ─── היחס לשכבת התוכן ───────────────────────────────────────────
 * החבילות, הקטגוריות, המכסות והמחירון חיים ב־`content/packages.ts`
 * ו־`content/dish-categories.ts`. התיקייה הזאת היא **תצוגה ומצב UI
 * בלבד**: היא לא סופרת מכסות, לא מכריעה תקרות ולא מחשבת סכומים. כל
 * שאלה על נתונים עוברת דרך `resolveSelection()` ו־`priceSelection()`.
 *
 * ─── שלושת הדברים שהקומפוננטה הזאת מבטיחה ───────────────────────
 *  1. **לעולם לא מסך לבן.** `hasConfigurator() && hasPackages()` היא
 *     השורה הראשונה. אין מנות או אין חבילות ⇒ `ConfiguratorUnavailable`,
 *     שמגיש את בנאי ארבע השאלות ואת וואטסאפ. זה המסלול הפעיל היום.
 *  2. **לעולם לא סכום שלא אושר.** `priceSelection()` נקראת **פעם אחת**,
 *     כאן, והתוצאה יורדת ל־props. אין קומפוננטה בתיקייה שקוראת מחירון
 *     בעצמה, ולכן אין שער שני שיכול לסטות. היא מחזירה `null` היום.
 *  3. **לעולם לא כשל שקט.** מכסה שנגמרה מוכרזת, קטגוריית חובה ריקה
 *     מוכרזת, שליחה שנכשלה משאירה את כל מה שהוקלד במקומו.
 *
 * ─── פוקוס ──────────────────────────────────────────────────────
 * במעבר שלב הפוקוס עובר לכותרת השלב (`data-step-heading`, `tabIndex=-1`),
 * ואם לשלב אין כותרת — לפקד הראשון בו. **לא בטעינה הראשונה**: גניבת
 * פוקוס בנחיתה קופצת את הדף ומבלבלת קורא מסך.
 */

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button, Num, SectionHeader } from "@/components/primitives";
import {
  CONSENT_TEXT_VERSION,
  NOTICE_VERSION,
  QuoteSuccess,
  type QuoteAnswers,
} from "@/components/quote";
import { GUEST_BANDS_VERSION, toE164 } from "@shared/lead-constants";
import {
  LeadSubmitError,
  SUBMIT_FAILED_MESSAGE,
  captureWaIntent,
  submitQuote,
} from "@/lib/lead-client";
import { track } from "@/lib/analytics";
import {
  hasConfigurator,
  hasPackages,
  missingRequiredCategories,
  priceSelection,
} from "@/content/packages";
import { COPY, ERRORS } from "./copy";
import { CategoryStep } from "./category-step";
import { ContactStep, EMPTY_CONTACT, type ContactValues } from "./contact-step";
import { GuestsStep, PackageStep } from "./intro-steps";
import { ReviewStep } from "./review-step";
import { RunningSummary } from "./running-summary";
import { ConfiguratorUnavailable } from "./unavailable";
import { liveDishIds, stepIsSatisfied, useConfigurator } from "./use-configurator";
import { buildConfiguratorWaHref, buildSelectionNotes } from "./wa-message";

/* ═══════════════════ props ═══════════════════ */

export interface MenuConfiguratorProps {
  /**
   * **חובה.** בלעדיו הקומפוננטה לא מתקמפלת, וזה מכוון: כך אי אפשר לשלוח
   * דף נחיתה עם נקודת איסוף בלי הודעת האיסוף ובלי ייחוס.
   */
  sourcePage: string;
  /** האם «אירוח אצלנו במסעדה» מוצע. מקורו קיבולת שנמסרה — היום false. */
  offerAtRestaurant?: boolean;
  /**
   * נקרא אחרי שהשרת אישר. העמוד אמור לנווט ל־`/thanks?ref=` — מעבר מסלול
   * ולא החלפה במקום, אחרת שום פלטפורמת מדידה לא תרשום המרה ברמת עמוד.
   * בלי handler מרונדר מצב ההצלחה במקום, כדי שהמגדיר יעבוד גם לבד.
   */
  onSubmitted?(ref: string, answers: QuoteAnswers): void;
  showHeader?: boolean;
  sectionNum?: string;
  /** עוגן. */
  id?: string;
  className?: string;
}

/* ═══════════════════ השער ═══════════════════ */

export function MenuConfigurator(props: MenuConfiguratorProps) {
  /*
   * אין מנות או אין חבילות ⇒ אין מגדיר, ואין גם שלד שממתין להן.
   * השער יושב בקומפוננטת עטיפה נפרדת כדי שלא יהיה כאן hook מותנה.
   */
  if (!hasConfigurator() || !hasPackages()) {
    return (
      <ConfiguratorUnavailable
        sourcePage={props.sourcePage}
        onSubmitted={props.onSubmitted}
        showHeader={props.showHeader}
        sectionNum={props.sectionNum}
        id={props.id}
        className={props.className}
      />
    );
  }
  return <ConfiguratorBody {...props} />;
}

/* ═══════════════════ הגוף ═══════════════════ */

type ErrorKey =
  | "guests"
  | "packageId"
  | "requiredCategory"
  | "eventType"
  | "area"
  | "name"
  | "phone"
  | "email";

function ConfiguratorBody({
  sourcePage,
  offerAtRestaurant = false,
  onSubmitted,
  showHeader = true,
  sectionNum,
  id,
  className,
}: MenuConfiguratorProps) {
  const c = useConfigurator({ sourcePage });

  const [area, setArea] = React.useState("");
  const [contact, setContact] = React.useState<ContactValues>(EMPTY_CONTACT);
  const [errors, setErrors] = React.useState<Partial<Record<ErrorKey, string>>>({});
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [sending, setSending] = React.useState(false);
  const [successRef, setSuccessRef] = React.useState<string | null>(null);

  const mountedAt = React.useRef(Date.now());
  const stepRef = React.useRef<HTMLDivElement | null>(null);
  const firstRender = React.useRef(true);

  const headingId = `cfg-step-${c.current.key}`;

  /*
   * ═══ השער היחיד של הכסף בכל התיקייה ═══
   * נקראת פעם אחת, והתוצאה יורדת ל־props. מחזירה `null` היום — אין
   * מחירון מאושר — ולכן שום קומפוננטה למטה אינה מרנדרת סכום. אין כאן
   * ברירת מחדל, אין «יחושב בהמשך», ואין דרך לעקוף.
   */
  const price = React.useMemo(() => priceSelection(c.selection), [c.selection]);
  const showPrices = price !== null;

  /* ── פוקוס במעבר שלב ─────────────────────────────────────── */

  React.useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return; /* לא גונבים פוקוס בנחיתה */
    }
    const root = stepRef.current;
    if (!root) return;
    const heading = root.querySelector<HTMLElement>("[data-step-heading]");
    if (heading) {
      heading.focus();
      return;
    }
    root.querySelector<HTMLElement>("input, textarea, select, button")?.focus();
  }, [c.stepIndex]);

  /* ── וולידציה ────────────────────────────────────────────── */

  const validate = React.useCallback((): Partial<Record<ErrorKey, string>> => {
    const found: Partial<Record<ErrorKey, string>> = {};
    switch (c.current.kind) {
      case "guests":
        if (!c.selection.guestCount) found.guests = ERRORS.guests;
        break;
      case "package":
        if (!c.selection.packageId) found.packageId = ERRORS.packageId;
        break;
      case "category":
        if (!stepIsSatisfied(c.current, c.selection)) {
          found.requiredCategory = ERRORS.requiredCategory;
        }
        break;
      case "review":
        if (missingRequiredCategories(c.selection).length) {
          found.requiredCategory = ERRORS.requiredCategory;
        }
        if (!c.eventType) found.eventType = ERRORS.eventType;
        if (!area.trim()) found.area = ERRORS.area;
        break;
      case "contact":
        if (contact.name.trim().length < 2) found.name = ERRORS.name;
        if (!toE164(contact.phone)) found.phone = ERRORS.phone;
        if (contact.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(contact.email.trim())) {
          found.email = ERRORS.email;
        }
        break;
    }
    return found;
  }, [area, c.current, c.eventType, c.selection, contact.email, contact.name, contact.phone]);

  const attemptNext = React.useCallback(() => {
    const found = validate();
    if (Object.keys(found).length) {
      setErrors(found);
      return;
    }
    setErrors({});
    /* האזור נשלח כטיוטה מנוקה — הניקוי עצמו יושב ב־`pushDraft`. */
    c.pushDraft(area);
    if (c.current.kind === "review") {
      track("quote_step_complete", {
        step_index: 4,
        step_id: "area",
...(c.eventType ? { event_type: c.eventType } : {}),
...(c.guestBand ? { guest_band: c.guestBand } : {}),
        area: area.trim(),
      });
    }
    c.next();
  }, [area, c, validate]);

  /* ── התשובות בצורת הליד, לשימוש חוזר במסך ההצלחה ─────────── */

  const answers: QuoteAnswers = React.useMemo(
    () => ({
      eventType: c.eventType,
      guestBand: c.guestBand,
      eventDate: "",
      /* התאריך אינו נשאל במגדיר. `dateFlexible` נשאר `false` בכוונה:
         `true` היה טוען שהמבקר אמר «התאריך עוד לא נקבע», והוא לא נשאל. */
      dateFlexible: false,
      area: area.trim(),
      areaIsFreeText: true,
      branch: null,
      serviceFormat: null,
      dishes:
        c.resolved?.categories.flatMap((line) =>
          line.dishes.map((d) => ({ id: d.id, name: d.nameHe })),
        ) ?? [],
    }),
    [area, c.eventType, c.guestBand, c.resolved],
  );

  /* ── שליחה ───────────────────────────────────────────────── */

  const handleSubmit = React.useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (c.current.kind !== "contact") {
        attemptNext();
        return;
      }
      if (sending) return;

      const found = validate();
      if (Object.keys(found).length) {
        setErrors(found);
        setSubmitError(null);
        return;
      }
      if (!c.eventType || !c.guestBand) {
        /* לא אמור לקרות — שלב הסיכום חוסם. שער אחרון, לא הודעה למשתמש. */
        setErrors({ eventType: ERRORS.eventType });
        return;
      }

      setErrors({});
      setSubmitError(null);
      setSending(true);

      try {
        const { ref } = await submitQuote({
          name: contact.name.trim(),
          phone: contact.phone.trim(),
...(contact.email.trim() ? { email: contact.email.trim() } : {}),
          contactChannel: contact.channel,
          eventType: c.eventType,
          guestBand: c.guestBand,
          guestBandVersion: GUEST_BANDS_VERSION,
          area: area.trim(),
          areaIsFreeText: true,
          serviceFormat: null,
          selectedDishes: liveDishIds(c.selection).slice(0, 40),
          /*
           * הפירוט המלא — חבילה, מספר סועדים ומבנה הקטגוריות — נוסע ב־
           * `notes`. `quoteLeadSchema` אינו נושא שדה חבילה, ובלי השורות
           * האלה הבעלים מקבל עשרה slugs לטיניים בלי הקשר. הפער בסכימה
           * מדווח; זה הגשר עד שייסגר.
           */
          notes: buildSelectionNotes({
            resolved: c.resolved,
            eventType: c.eventType,
            area: area.trim(),
          }),
          consentMarketing: contact.consentMarketing,
          consentTextVersion: CONSENT_TEXT_VERSION,
          noticeVersion: NOTICE_VERSION,
          draftId: c.draftId,
          stepsCompleted: 5,
          timeToCompleteMs: Math.max(0, Date.now() - c.startedAt),
          mountedAt: mountedAt.current,
          company_website: contact.honeypot,
        });

        c.finish();
        if (onSubmitted) onSubmitted(ref, answers);
        else setSuccessRef(ref);
      } catch (err) {
        /* הערכים נשמרים. שליחה שנכשלה היא הרגע שבו איבוד מה שהוקלד הופך
           תקלה זמנית לליד אבוד — ובמגדיר זה גם עשר דקות של בנייה. */
        const fields = err instanceof LeadSubmitError ? err.fields : undefined;
        if (fields) {
          const mapped: Partial<Record<ErrorKey, string>> = {};
          if (fields.name?.length) mapped.name = ERRORS.name;
          if (fields.phone?.length) mapped.phone = ERRORS.phone;
          if (fields.email?.length) mapped.email = ERRORS.email;
          setErrors(mapped);
        }
        setSubmitError(err instanceof LeadSubmitError ? err.message : SUBMIT_FAILED_MESSAGE);
      } finally {
        setSending(false);
      }
    },
    [answers, area, attemptNext, c, contact, onSubmitted, sending, validate],
  );

  /* ── וואטסאפ ─────────────────────────────────────────────── */

  /**
   * **אין `await` לפני הניווט, ואין לבדוק את התשובה.** הקליטה המקדימה
   * היא שגר־ושכח; Safari/iOS חוסם פתיחת חלון ברגע שה־promise נכנע,
   * ו־429 או 500 בשרת חייבים להישאר בלתי נראים למשתמש.
   */
  const handleWhatsApp = React.useCallback(() => {
    const trimmedName = contact.name.trim();
    const trimmedPhone = contact.phone.trim();
    const dishIds = liveDishIds(c.selection).slice(0, 40);

    const ref = captureWaIntent({
      waLocation: "quote_alt",
      branch: null,
...(c.eventType ? { eventType: c.eventType } : {}),
...(c.guestBand ? { guestBand: c.guestBand } : {}),
...(area.trim() ? { area: area.trim().slice(0, 60) } : {}),
      serviceFormat: null,
...(dishIds.length ? { dishIds } : {}),
...(trimmedName ? { name: trimmedName.slice(0, 80) } : {}),
...(trimmedPhone ? { phone: trimmedPhone.slice(0, 25) } : {}),
    });

    track("whatsapp_click", { wa_location: "quote_alt", has_lead: dishIds.length > 0 });
    track("whatsapp_handoff", { lead_ref: ref, wa_location: "quote_alt", branch: null });

    const href = buildConfiguratorWaHref(
      { resolved: c.resolved, eventType: c.eventType, area: area.trim() || null },
      ref,
    );

    c.finish();

    /* אותו tick, ובנייד באותה לשונית: אחרי שמערכת ההפעלה מעבירה
       לאפליקציה, לשונית ריקה שנשארה מאחור נקראת כאתר שבור. */
    const isMobile =
      typeof navigator !== "undefined" && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (isMobile) window.location.href = href;
    else window.open(href, "_blank", "noopener");
  }, [area, c, contact.name, contact.phone]);

  /* ── מצב הצלחה מקומי ─────────────────────────────────────── */

  if (successRef) {
    return (
      <QuoteSuccess
        leadRef={successRef}
        answers={answers}
        contactChannel={contact.channel}
        sourcePage={sourcePage}
        className={className}
      />
    );
  }

  /* ── השלב הנוכחי ─────────────────────────────────────────── */

  const step = c.current;
  const isLast = step.kind === "contact";
  const canGoBack = c.stepIndex > 0;

  /*
   * הסיכום מופיע רק כשיש מה לסכם. בשני השלבים הראשונים הוא היה תופס
   * ‎8.5rem בתחתית המסך כדי להגיד «עוד לא נבחרו מנות» — בדיוק סוג הבלוק
   * הריק שהחוק העליון אוסר.
   */
  const showSummary = c.resolved !== null && step.kind !== "guests" && step.kind !== "package";

  /* קיצור דרך לסיכום — רק משלבי הקטגוריות. משלב הסיכום ואילך הכפתורים
     של השלב עצמו הם הפעולה, וכפתור שני שאומר «לסיכום» מהסיכום הוא רעש. */
  const reviewIndex = c.steps.findIndex((s) => s.kind === "review");
  const summaryAction =
    step.kind === "category" && reviewIndex >= 0
      ? { primaryLabel: COPY.toReview, onPrimary: () => c.goTo(reviewIndex) }
      : {};

  const renderStep = () => {
    switch (step.kind) {
      case "guests":
        return (
          <GuestsStep
            guests={c.selection.guestCount}
            guestBand={c.guestBand}
            onChange={c.setGuests}
            error={errors.guests}
            headingId={headingId}
          />
        );

      case "package":
        return (
          <PackageStep
            packages={c.packages}
            value={c.selection.packageId}
            onChange={c.choosePackage}
            error={errors.packageId}
            headingId={headingId}
          />
        );

      case "category": {
        /* שורת הקטגוריה מגיעה מהבחירה הפתורה — אותו מקור שהסיכום קורא,
           ולכן המספרים בשני המקומות אינם יכולים להיפרד. */
        const line = c.resolved?.categories.find((l) => l.category.id === step.category?.id);
        if (!line) return null;
        return (
          <CategoryStep
            line={line}
            onToggle={c.toggleDish}
            showPrices={showPrices}
            showRequiredError={Boolean(errors.requiredCategory)}
            headingId={headingId}
          />
        );
      }

      case "review":
        return (
          <ReviewStep
            resolved={c.resolved}
            price={price}
            eventType={c.eventType}
            onEventType={c.setEventType}
            area={area}
            onArea={setArea}
            offerAtRestaurant={offerAtRestaurant}
            onEditCategory={c.goToCategory}
            onEditGuests={() => c.goTo(0)}
            errors={{ eventType: errors.eventType, area: errors.area }}
            headingId={headingId}
          />
        );

      case "contact":
        return (
          <ContactStep
            values={contact}
            onChange={(patch) => setContact((prev) => ({ ...prev, ...patch }))}
            errors={{ name: errors.name, phone: errors.phone, email: errors.email }}
            submitError={submitError}
            sending={sending}
            onWhatsApp={handleWhatsApp}
            headingId={headingId}
          />
        );

      default:
        return null;
    }
  };

  return (
    <section id={id} className={cn("grid gap-head", className)}>
      {showHeader ? (
        <SectionHeader
          title={COPY.categoriesHeading}
          {...(sectionNum ? { num: sectionNum } : {})}
        />
      ) : null}

      {c.resumed ? (
        <p className="flex flex-wrap items-center gap-3 text-xs text-fg-subtle">
          {COPY.resumed}
          <button
            type="button"
            onClick={c.restart}
            className="min-h-[44px] text-accent underline decoration-rule underline-offset-[.22em] hover:decoration-accent"
          >
            {COPY.restart}
          </button>
        </p>
      ) : null}

      <StepProgress index={c.stepIndex} total={c.steps.length} title={step.title} />

      <form
        noValidate
        onSubmit={handleSubmit}
        /* ריפוד תחתון שמפנה מקום למזח במובייל. במסכים רחבים המזח אינו
           קיים והריפוד מתאפס. */
        className={cn(
"grid gap-col",
          showSummary &&
"pb-[8.5rem] min-[980px]:grid-cols-[minmax(0,1fr)_300px] min-[980px]:pb-0",
        )}
      >
        <div ref={stepRef} className="grid gap-6">
          {renderStep()}

          <div className="flex flex-wrap items-center gap-3">
            {canGoBack ? (
              <Button type="button" variant="ghost" size="sm" onClick={c.back}>
                {COPY.back}
              </Button>
            ) : null}
            {!isLast ? (
              <Button type="button" onClick={attemptNext}>
                {COPY.next}
              </Button>
            ) : null}
          </div>
        </div>

        {/* אותה קומפוננטה, שתי פריסות. הרייל למסכים רחבים… */}
        {showSummary ? (
          <RunningSummary
            variant="rail"
            resolved={c.resolved}
            price={price}
            onRemove={c.removeDish}
            onEditCategory={c.goToCategory}
            {...summaryAction}
          />
        ) : null}
      </form>

      {/* …והמזח למובייל. מחוץ ל־form כדי ש־Enter בתוכו לא ישלח את הטופס. */}
      {showSummary ? (
        <RunningSummary
          variant="dock"
          resolved={c.resolved}
          price={price}
          onRemove={c.removeDish}
          onEditCategory={c.goToCategory}
          {...summaryAction}
        />
      ) : null}
    </section>
  );
}

/* ═══════════════════ מד התקדמות ═══════════════════ */

/**
 * «שלב 3 מתוך 7» — שתי הספרות מופרדות במילה עברית, ולכן אין מקף בין שני
 * רצפי ספרות ואין היפוך. מספר השלבים נגזר מהחבילה ולכן הוא משתנה; מד
 * שמראה מספר קבוע היה משקר ברגע שהמבקר בוחר חבילה עם יותר קטגוריות.
 */
function StepProgress({
  index,
  total,
  title,
}: {
  index: number;
  total: number;
  title: string;
}) {
  const done = index + 1;
  const pct = Math.round((done / Math.max(total, 1)) * 100);

  return (
    <div className="grid gap-2">
      <p className="flex flex-wrap items-baseline gap-x-3 text-2xs text-fg-subtle">
        <span>
          שלב <Num inline>{done}</Num> מתוך <Num inline>{total}</Num>
        </span>
        <span className="font-semibold text-fg">{title}</span>
      </p>
      <div
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={total}
        aria-valuenow={done}
        aria-label="התקדמות בבניית התפריט"
        className="h-[3px] w-full overflow-hidden rounded-pill bg-bg-form"
      >
        <span
          aria-hidden="true"
          className="block h-full bg-accent transition-[inline-size] duration-slow ease-house"
          style={{ inlineSize: `${pct}%` }}
        />
      </div>
    </div>
  );
}
