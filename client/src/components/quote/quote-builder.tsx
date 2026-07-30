/**
 * ═══════════════════════════════════════════════════════════════════════
 *  QuoteBuilder — ארבע שאלות, ואז פרטים ליצירת קשר.
 * ═══════════════════════════════════════════════════════════════════════
 *
 * spec 02 §3. קומפוננטה אחת, כל מסלול שיש בו בנאי משתמש בה, המצב ההתחלתי
 * מגיע ב־props.
 *
 * ─── חוק סדר השדות, ואסור לבטל אותו ב«אופטימיזציה» ──────────────
 * מיון לפי (ערך המידע למטבח) ÷ (סיכון נתפס לקונה), יורד — ו**לעולם לא**
 * שדה מזהה מעל שדה שאינו מזהה. נטישה במסכים 1–4 עולה נקודת נתונים;
 * נטישה במסך 5 עולה ליד. הטופס הקודם עשה בדיוק ההפך: `שם` היה שדה 1
 * ו`טלפון` שדה 2 מתוך שמונה במסך אחד.
 *
 * ─── מה לא נמצא כאן ─────────────────────────────────────────────
 * · **מספר.** אין ₪, אין מינימום, אין זמן תגובה קשיח. ההערכה מגיעה
 *   מ־`EstimateRange`, שמחזיר null כל עוד הבעלים לא אישר תעריפים.
 * · **תקציב.** השדה הנוטש ביותר בקייטרינג אירועים: הקונה לא יודע את
 *   התשובה, והיא מרגישה כמו מדידה למרווח. תפקידו הסינוני מכוסה במלואו
 *   ע״י טווח סועדים × סוג אירוע × פורמט × אזור.
 * · **אלרגיות.** שדה שמזמין `מידע רפואי` מסווג מחדש את טבלת הלידים
 *   כמאגר בריאות תחת תיקון 13. מידע תזונתי נאסף אחרי סגירה, בערוץ
 *   התפעולי, לתיק האירוע.
 * · **פרטים נוספים.** נשאלים אחרי השליחה, כהעשרה, ולא לפניה.
 */

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  Button,
  Field,
  RadioCard,
  RadioCardGroup,
  SectionHeader,
  TextInput,
  fieldControlClass,
} from "@/components/primitives";
import { telLink } from "@/content/business";
import {
  GUEST_BANDS_VERSION,
  toE164,
  type GuestBand,
} from "@shared/lead-schema";
import {
  LeadSubmitError,
  SUBMIT_FAILED_MESSAGE,
  buildWaHref,
  captureWaIntent,
  submitQuote,
} from "@/lib/lead-client";
import { track } from "@/lib/analytics";
import {
  AREA_OTHER_LABEL,
  CONSENT_TEXT_VERSION,
  COPY,
  ERRORS,
  GUEST_BAND_DISPLAY,
  NOTICE_VERSION,
  areaChips,
  eventTypeOptions,
  guestBandNote,
  guestBandOptions,
  routingLine,
  type StepNumber,
} from "./quote-config";
import { QuoteProgress } from "./quote-progress";
import { BriefCard } from "./brief-card";
import { EstimateRange } from "./estimate";
import { DateFields } from "./date-fields";
import {
  CollectionNotice,
  MarketingConsent,
  ReassuranceLines,
  TermsStrip,
} from "./legal-blocks";
import { QuoteSuccess } from "./quote-success";
import {
  useQuoteBuilder,
  type QuoteAnswers,
  type QuoteSeed,
} from "./use-quote-builder";

/* ═══════════════════ props ═══════════════════ */

export interface QuoteBuilderProps {
  /**
   * **חובה.** בלעדיו הקומפוננטה לא מתקמפלת, וזה מכוון: כך אי אפשר לשלוח
   * דף נחיתה עם טופס איסוף בלי הודעת האיסוף ובלי ייחוס (spec 02 §3.9).
   */
  sourcePage: string;
  /** זריעה מראש. הערך מוצג **נבחר וניתן לעריכה**, לעולם לא מוסתר. */
  seed?: QuoteSeed;
  /**
   * האם `אירוח אצלנו במסעדה` מוצע. מקורו היחיד הוא קיבולת אירוע פרטי
   * שנמסרה לסניף כלשהו; בלעדיה הצ'יפ אינו קיים (spec 02 §3.2 / §0.1 A5).
   */
  offerAtRestaurant?: boolean;
  /**
   * נקרא אחרי שהשרת אישר. העמוד אמור לנווט ל־`/thanks?ref=` — מעבר מסלול
   * ולא החלפה במקום, אחרת שום פלטפורמת מדידה לא תרשום המרה ברמת עמוד.
   * בלי handler מרונדר מצב ההצלחה במקום, כדי שהבנאי יעבוד גם לבד.
   */
  onSubmitted?: (ref: string, answers: QuoteAnswers) => void;
  /**
   * כותרת הסקשן. כבו אותה בעמוד שכותב את הכותרת בעצמו — **המספר הסידורי
   * נקבע לפי מיקום** (spec 01 §3.1), ורק העמוד יודע איפה הבנאי יושב אצלו.
   */
  showHeader?: boolean;
  /** מספר הסקשן כשהכותרת מרונדרת כאן. ברירת מחדל: ללא מספר. */
  sectionNum?: string;
  /** עוגן. `#quote` הוא היעד של כל CTA ראשי באתר. */
  id?: string;
  className?: string;
}

/* ═══════════════════ שגיאות ═══════════════════ */

type FieldKey = "eventType" | "guestBand" | "date" | "area" | "name" | "phone" | "email";

/**
 * העוגן לכל שגיאה, לפי סדר עדיפות. «אזור» הוא שני עוגנים כי המסך משנה
 * צורה: יש רשימת אזורים שנמסרה → fieldset של צ'יפים; אין → שדה עיר חופשי.
 */
const FIELD_ANCHORS: Record<FieldKey, readonly string[]> = {
  eventType: ["quote-step-1"],
  guestBand: ["quote-step-2"],
  date: ["quote-date-day"],
  area: ["quote-area", "quote-step-4"],
  name: ["quote-name"],
  phone: ["quote-phone"],
  email: ["quote-email"],
};

const FIELD_LABEL: Record<FieldKey, string> = {
  eventType: "סוג האירוע",
  guestBand: "מספר סועדים",
  date: COPY.dateLabel,
  area: COPY.legend4,
  name: COPY.nameLabel,
  phone: COPY.phoneLabel,
  email: COPY.emailLabel,
};

/* ═══════════════════ הקומפוננטה ═══════════════════ */

export function QuoteBuilder({
  sourcePage,
  seed,
  offerAtRestaurant = false,
  onSubmitted,
  showHeader = true,
  sectionNum,
  id = "quote",
  className,
}: QuoteBuilderProps) {
  const b = useQuoteBuilder({ sourcePage, seed, offerAtRestaurant });
  const { answers, step } = b;

  /* מסך 5 בלבד. המצב הזה לא נשמר, לא מגיע לטיוטה, ולא עוזב את הדפדפן
     עד ההגשה — זה גבול המידע האישי, והוא מיושם כאן כהפרדת מצב. */
  const [name, setName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [emailOpen, setEmailOpen] = React.useState(false);
  const [contactChannel, setContactChannel] = React.useState<"whatsapp" | "phone">("whatsapp");
  const [consentMarketing, setConsentMarketing] = React.useState(false);
  const [honeypot, setHoneypot] = React.useState("");

  const [errors, setErrors] = React.useState<Partial<Record<FieldKey, string>>>({});
  const [summary, setSummary] = React.useState<FieldKey[]>([]);
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [sending, setSending] = React.useState(false);
  const [successRef, setSuccessRef] = React.useState<string | null>(null);
  const [shake, setShake] = React.useState(false);

  const formRef = React.useRef<HTMLFormElement | null>(null);
  const stepRef = React.useRef<HTMLDivElement | null>(null);
  const summaryRef = React.useRef<HTMLDivElement | null>(null);
  const mountedAt = React.useRef<number>(Date.now());
  const firstRender = React.useRef(true);
  const shakeTimer = React.useRef<number | null>(null);

  const chips = React.useMemo(() => areaChips(), []);
  const hasAreaChips = chips.length > 0;
  const eventOptions = React.useMemo(
    () => eventTypeOptions(offerAtRestaurant),
    [offerAtRestaurant],
  );

  /* ── quote_open — פעם אחת, כשהבנאי נכנס למסך ─────────────── */
  React.useEffect(() => {
    const el = formRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    let fired = false;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting || fired) continue;
          fired = true;
          track("quote_open", { source_page: sourcePage });
          io.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [sourcePage]);

  /* ── מיקוד ל־legend של המסך החדש ────────────────────────────
     לעולם לא לכידת פוקוס: הבנאי הוא תוכן בזרימה, לא דיאלוג. */
  React.useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    const legend = stepRef.current?.querySelector("legend");
    if (!legend) return;
    legend.setAttribute("tabindex", "-1");
    (legend as HTMLLegendElement).focus({ preventScroll: false });
  }, [step]);

  React.useEffect(
    () => () => {
      if (shakeTimer.current !== null) window.clearTimeout(shakeTimer.current);
    },
    [],
  );

  const bump = React.useCallback(() => {
    setShake(true);
    if (shakeTimer.current !== null) window.clearTimeout(shakeTimer.current);
    shakeTimer.current = window.setTimeout(() => {
      shakeTimer.current = null;
      setShake(false);
    }, 320);
  }, []);

  const focusAnchor = React.useCallback((key: FieldKey) => {
    for (const anchor of FIELD_ANCHORS[key]) {
      const el = document.getElementById(anchor);
      if (!el) continue;
      if (el.tagName === "FIELDSET") {
        /* פוקוס לפקד הראשון בקבוצה, לא ל־fieldset עצמו — קורא מסך
           שמקבל פוקוס על fieldset לא מכריז את האפשרויות. */
        el.querySelector<HTMLElement>("input, textarea, select")?.focus();
      } else {
        el.focus();
      }
      return;
    }
  }, []);

  /* ── ולידציה למסך ────────────────────────────────────────── */

  const [datePartial, setDatePartial] = React.useState(false);

  const validateStep = React.useCallback(
    (n: StepNumber): Partial<Record<FieldKey, string>> => {
      const out: Partial<Record<FieldKey, string>> = {};
      if (n === 1 && !answers.eventType) out.eventType = ERRORS.eventType;
      if (n === 2 && !answers.guestBand) out.guestBand = ERRORS.guestBand;
      /* מסך 3 אינו חובה. תאריך שהוקלד חלקית **כן** נחסם — קידום שקט
         היה זורק את מה שהמבקר הקליד בלי לומר מילה. */
      if (n === 3 && datePartial) out.date = ERRORS.date;
      if (n === 4 && !answers.area.trim()) out.area = ERRORS.area;
      if (n === 5) {
        const trimmed = name.trim();
        if (trimmed.length < 2 || trimmed.length > 80) out.name = ERRORS.name;
        if (!toE164(phone)) out.phone = ERRORS.phone;
        if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) {
          out.email = ERRORS.email;
        }
      }
      return out;
    },
    [answers.area, answers.eventType, answers.guestBand, datePartial, email, name, phone],
  );

  const attemptNext = React.useCallback(() => {
    const found = validateStep(step);
    const keys = Object.keys(found) as FieldKey[];
    if (keys.length) {
      setErrors(found);
      setSummary([]);
      bump();
      focusAnchor(keys[0]);
      return;
    }
    setErrors({});
    b.next();
  }, [b, bump, focusAnchor, step, validateStep]);

  /* ── שליחה ───────────────────────────────────────────────── */

  const handleSubmit = React.useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (step < 5) {
        attemptNext();
        return;
      }
      if (sending) return;

      const found = validateStep(5);
      const keys = Object.keys(found) as FieldKey[];
      if (keys.length) {
        setErrors(found);
        setSummary(keys);
        setSubmitError(null);
        bump();
        /* הסיכום מוכרז ראשון, ורק אחריו הפוקוס עובר לשדה הראשון הפגום. */
        window.setTimeout(() => summaryRef.current?.focus(), 0);
        return;
      }

      setErrors({});
      setSummary([]);
      setSubmitError(null);
      setSending(true);

      try {
        const { ref } = await submitQuote({
          name: name.trim(),
          phone: phone.trim(),
          ...(email.trim() ? { email: email.trim() } : {}),
          contactChannel,
          eventType: answers.eventType!,
          guestBand: answers.guestBand!,
          guestBandVersion: GUEST_BANDS_VERSION,
          ...(answers.eventDate ? { eventDate: answers.eventDate } : {}),
          dateFlexible: answers.dateFlexible,
          area: answers.area.trim(),
          areaIsFreeText: answers.areaIsFreeText,
          serviceFormat: answers.serviceFormat,
          selectedDishes: answers.dishes.map((d) => d.id),
          consentMarketing,
          consentTextVersion: CONSENT_TEXT_VERSION,
          noticeVersion: NOTICE_VERSION,
          draftId: b.draftId,
          stepsCompleted: 5,
          timeToCompleteMs: Math.max(0, Date.now() - b.startedAt),
          mountedAt: mountedAt.current,
          company_website: honeypot,
        });

        b.finish();
        if (onSubmitted) onSubmitted(ref, answers);
        else setSuccessRef(ref);
      } catch (err) {
        /* הערכים נשמרים. שליחה שנכשלה היא הרגע שבו איבוד מה שהוקלד
           הופך תקלה זמנית לליד אבוד. */
        const fields = err instanceof LeadSubmitError ? err.fields : undefined;
        if (fields) {
          const mapped: Partial<Record<FieldKey, string>> = {};
          if (fields.name?.length) mapped.name = ERRORS.name;
          if (fields.phone?.length) mapped.phone = ERRORS.phone;
          if (fields.email?.length) mapped.email = ERRORS.email;
          setErrors(mapped);
          setSummary(Object.keys(mapped) as FieldKey[]);
        }
        setSubmitError(
          err instanceof LeadSubmitError ? err.message : SUBMIT_FAILED_MESSAGE,
        );
      } finally {
        setSending(false);
      }
    },
    [
      answers,
      attemptNext,
      b,
      bump,
      consentMarketing,
      contactChannel,
      email,
      honeypot,
      name,
      onSubmitted,
      phone,
      sending,
      step,
      validateStep,
    ],
  );

  /**
   * מסלול הוואטסאפ.
   *
   * **אין `await` לפני הניווט, ואין לבדוק את התשובה.** הקליטה המקדימה
   * היא שגר־ושכח; Safari/iOS חוסם פתיחת חלון ברגע שה־promise נכנע,
   * ו־429 או 500 בשרת חייבים להישאר בלתי נראים למשתמש.
   */
  const handleWhatsApp = React.useCallback(() => {
    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();

    const ref = captureWaIntent({
      waLocation: "quote_alt",
      branch: answers.branch,
      ...(answers.eventType ? { eventType: answers.eventType } : {}),
      ...(answers.guestBand ? { guestBand: answers.guestBand } : {}),
      ...(answers.eventDate ? { eventDate: answers.eventDate } : {}),
      ...(answers.area ? { area: answers.area.trim().slice(0, 60) } : {}),
      serviceFormat: answers.serviceFormat,
      ...(answers.dishes.length ? { dishIds: answers.dishes.map((d) => d.id) } : {}),
      ...(trimmedName ? { name: trimmedName.slice(0, 80) } : {}),
      ...(trimmedPhone ? { phone: trimmedPhone.slice(0, 25) } : {}),
    });

    track("whatsapp_click", { wa_location: "quote_alt", has_lead: Boolean(answers.eventType) });
    track("whatsapp_handoff", {
      lead_ref: ref,
      wa_location: "quote_alt",
      branch: answers.branch ?? null,
    });

    const href = buildWaHref(
      {
        ...(answers.eventType ? { eventType: answers.eventType } : {}),
        ...(answers.guestBand ? { guestBand: answers.guestBand } : {}),
        ...(answers.eventDate ? { eventDate: answers.eventDate } : {}),
        dateFlexible: answers.dateFlexible,
        ...(answers.area ? { area: answers.area.trim() } : {}),
        branch: answers.branch,
        dishNames: answers.dishes.map((d) => d.name),
      },
      ref,
    );

    b.finish();

    /* אותו tick, ובנייד באותה לשונית: אחרי שמערכת ההפעלה מעבירה
       לאפליקציה, לשונית ריקה שנשארה מאחור נקראת כאתר שבור. */
    const isMobile =
      typeof navigator !== "undefined" && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (isMobile) window.location.href = href;
    else window.open(href, "_blank", "noopener");
  }, [answers, b, name, phone]);

  /* ── מצב הצלחה מקומי ─────────────────────────────────────── */
  if (successRef) {
    return (
      <QuoteSuccess
        leadRef={successRef}
        answers={answers}
        contactChannel={contactChannel}
        className={className}
      />
    );
  }

  /* ── מסכים ───────────────────────────────────────────────── */

  const bandNote = guestBandNote(answers.guestBand);
  const routing = answers.areaIsFreeText ? null : routingLine(answers.branch);

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <RadioCardGroup
            id="quote-step-1"
            legend={COPY.legend1}
            error={errors.eventType}
            variant="card"
          >
            {eventOptions.map((option) => (
              <RadioCard
                key={option.value}
                name="event_type"
                value={option.value}
                label={option.label}
                checked={answers.eventType === option.value}
                onChange={() => b.setEventType(option.value)}
              />
            ))}
          </RadioCardGroup>
        );

      case 2:
        return (
          <>
            <RadioCardGroup
              id="quote-step-2"
              legend={COPY.legend2}
              hint={COPY.hint2}
              error={errors.guestBand}
              variant="card"
            >
              {guestBandOptions().map((band) => (
                <RadioCard
                  key={band}
                  name="guest_band"
                  value={band}
                  label={<span className="num">{GUEST_BAND_DISPLAY[band as GuestBand]}</span>}
                  checked={answers.guestBand === band}
                  onChange={() => b.setGuestBand(band as GuestBand)}
                />
              ))}
            </RadioCardGroup>

            {/* מרונדר רק אם הבעלים מסר מינימום או מקסימום. הליד נקלט
                בכל מקרה — הפניה כנה החוצה זולה יותר משיחה מבוזבזת. */}
            {bandNote ? (
              <p className="mt-4 max-w-body text-sm text-fg-muted">{bandNote}</p>
            ) : null}
          </>
        );

      case 3:
        return (
          <StepFieldset legend={COPY.legend3} hint={COPY.hint3}>
            <label
              htmlFor="quote-date-day"
              className="mb-[.4rem] block font-sans text-xs font-semibold text-fg-muted"
            >
              {COPY.dateLabel}
            </label>
            <DateFields
              id="quote-date"
              value={answers.eventDate}
              onChange={b.setDate}
              onPartial={setDatePartial}
              error={errors.date}
            />

            <label className="mt-5 flex cursor-pointer items-center gap-[.6rem]">
              <input
                type="checkbox"
                name="date_flexible"
                checked={answers.dateFlexible}
                onChange={(e) => b.setDateFlexible(e.currentTarget.checked)}
                className="peer absolute h-0 w-0 opacity-0"
              />
              <span
                aria-hidden="true"
                className={
                  "grid h-[24px] w-[24px] shrink-0 place-items-center rounded border border-solid " +
                  "border-rule-control bg-bg text-bg transition-colors duration-state ease-house " +
                  "peer-checked:border-fg peer-checked:bg-fg " +
                  "peer-focus-visible:outline peer-focus-visible:outline-2 " +
                  "peer-focus-visible:outline-offset-2 peer-focus-visible:outline-focus"
                }
              >
                <svg viewBox="0 0 16 16" className="h-[12px] w-[12px]" focusable="false">
                  <path
                    d="M2.5 8.5l3.5 3.5 7.5-8"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="square"
                  />
                </svg>
              </span>
              <span className="text-sm">{COPY.dateUnknown}</span>
            </label>
          </StepFieldset>
        );

      case 4:
        return hasAreaChips ? (
          <>
            <RadioCardGroup
              id="quote-step-4"
              legend={COPY.legend4}
              error={errors.area}
              variant="chip"
            >
              {chips.map((chip) => (
                <RadioCard
                  key={chip.label}
                  name="area"
                  value={chip.label}
                  variant="chip"
                  label={chip.label}
                  checked={!answers.areaIsFreeText && answers.area === chip.label}
                  onChange={() => b.setAreaChip(chip.label, chip.branch)}
                />
              ))}
              <RadioCard
                name="area"
                value={AREA_OTHER_LABEL}
                variant="chip"
                label={AREA_OTHER_LABEL}
                checked={answers.areaIsFreeText}
                onChange={() => b.setAreaText("")}
              />
            </RadioCardGroup>

            {/* «אזור אחר» לעולם לא נוקב בשם מטבח. */}
            {answers.areaIsFreeText ? (
              <div className="mt-5">
                <AreaTextField
                  value={answers.area}
                  onChange={b.setAreaText}
                  error={errors.area}
                />
              </div>
            ) : null}

            {routing ? (
              <p className="mt-4 max-w-body text-sm text-fg-muted">{routing}</p>
            ) : null}
          </>
        ) : (
          /* אין רשימת אזורים שנמסרה → שדה עיר חופשי. לא מפרסמים
             קטצ'מנט, לא נוקבים בשם מטבח ולא מבטיחים שירות. */
          <StepFieldset legend={COPY.legend4}>
            <AreaTextField value={answers.area} onChange={b.setAreaText} error={errors.area} />
          </StepFieldset>
        );

      case 5:
      default:
        return (
          <StepFieldset legend={COPY.legend5}>
            {summary.length ? (
              <div
                ref={summaryRef}
                role="alert"
                tabIndex={-1}
                className="mb-6 border-s-2 border-danger ps-4 text-danger"
              >
                <p className="font-semibold">
                  {summary.length === 1 ? "יש שדה אחד שצריך להשלים:" : `יש ${summary.length} שדות שצריך להשלים:`}
                </p>
                <ul className="mt-1 grid gap-1 text-xs">
                  {summary.map((key) => (
                    <li key={key}>
                      <a
                        href={`#${FIELD_ANCHORS[key][0]}`}
                        onClick={(e) => {
                          e.preventDefault();
                          focusAnchor(key);
                        }}
                        className="underline underline-offset-[.22em]"
                      >
                        {FIELD_LABEL[key]} — {errors[key]}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {/* ההערכה מעל השדות: הקונה מקבל משהו בתמורה למאמץ לפני
                שמבקשים ממנו משהו. היום היא מחזירה null — אין תעריף
                מאושר, אין תאריך מחירון, אין הכרעת מע״מ ואין נוסח סייג.
                ארבעת ה־null כאן הם המצב הכן, לא TODO. */}
            <EstimateRange
              format={answers.serviceFormat}
              guestBand={answers.guestBand}
              qualifier={null}
              vatLine={null}
              approvedAt={null}
              className="mb-6"
            />

            {bandNote ? (
              <p className="mb-6 max-w-body text-sm text-fg-muted">{bandNote}</p>
            ) : null}

            <BriefCard
              answers={answers}
              onEdit={(s) => b.goTo(s)}
              onRemoveDish={b.removeDish}
              className="mb-8"
            />

            <div className="grid max-w-body gap-5">
              <Field id="quote-name" label={COPY.nameLabel} error={errors.name} required>
                {(control) => (
                  <TextInput
                    {...control}
                    kind="name"
                    name="name"
                    value={name}
                    maxLength={80}
                    onChange={(e) => setName(e.currentTarget.value)}
                  />
                )}
              </Field>

              <Field id="quote-phone" label={COPY.phoneLabel} error={errors.phone} required>
                {(control) => (
                  <TextInput
                    {...control}
                    kind="phone"
                    name="phone"
                    value={phone}
                    maxLength={25}
                    onChange={(e) => setPhone(e.currentTarget.value)}
                  />
                )}
              </Field>

              <RadioCardGroup id="quote-channel" legend={COPY.channelLegend} variant="chip">
                <RadioCard
                  name="contact_channel"
                  value="whatsapp"
                  variant="chip"
                  label={COPY.channelWa}
                  checked={contactChannel === "whatsapp"}
                  onChange={() => setContactChannel("whatsapp")}
                />
                <RadioCard
                  name="contact_channel"
                  value="phone"
                  variant="chip"
                  label={COPY.channelPhone}
                  checked={contactChannel === "phone"}
                  onChange={() => setContactChannel("phone")}
                />
              </RadioCardGroup>

              {/* מייל מקופל, ומנוסח כתועלת ולא כאיסוף: הוא נועד לאדם
                  השני שמחליט, וזה בדיוק מי שקורא את הסיכום. */}
              <div>
                <button
                  type="button"
                  aria-expanded={emailOpen}
                  aria-controls="quote-email-wrap"
                  onClick={() => setEmailOpen((v) => !v)}
                  className="min-h-[44px] text-start text-sm underline decoration-rule underline-offset-[.22em] hover:decoration-accent"
                >
                  {COPY.emailReveal}
                </button>
                <div id="quote-email-wrap" hidden={!emailOpen} className="mt-3">
                  <Field id="quote-email" label={COPY.emailLabel} error={errors.email}>
                    {(control) => (
                      <TextInput
                        {...control}
                        kind="email"
                        name="email"
                        value={email}
                        maxLength={120}
                        onChange={(e) => setEmail(e.currentTarget.value)}
                      />
                    )}
                  </Field>
                </div>
              </div>
            </div>

            <p className="mt-6 max-w-body text-3xs leading-body text-fg-subtle">
              {COPY.ageAndMedicalNotice}
            </p>

            <CollectionNotice className="mt-3" />

            <MarketingConsent
              checked={consentMarketing}
              onChange={setConsentMarketing}
              className="mt-5"
            />

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Button type="submit" variant="primary" loading={sending}>
                {COPY.submit}
              </Button>
              <Button type="button" variant="wa" onClick={handleWhatsApp}>
                {COPY.submitWa}
              </Button>
            </div>

            {/* כשל שליחה נשאר על המסך. טוסט חולף הוא נשא גרוע להודעה
                «הפנייה שלכם לא נשלחה». */}
            {submitError ? (
              <p role="alert" className="mt-4 max-w-body text-sm text-danger">
                {/* המספר כבר בתוך המחרוזת, עטוף באיזולטים. הקישור נושא
                    תווית ולא ספרות, כדי שלא יופיע פעמיים. */}
                {submitError}{" "}
                <a
                  href={telLink()}
                  className="underline decoration-danger underline-offset-[.22em]"
                >
                  התקשרו
                </a>
              </p>
            ) : null}

            <ReassuranceLines className="mt-4" />
            <TermsStrip className="mt-6" />
          </StepFieldset>
        );
    }
  };

  return (
    <section id={id} className={cn("sec", className)}>
      <div className="wrap">
        {showHeader ? (
          <SectionHeader num={sectionNum} title={COPY.heading} reveal={false} />
        ) : null}

        <form
          ref={formRef}
          data-quote-builder=""
          noValidate
          onSubmit={handleSubmit}
          onKeyDown={(e) => {
            /* Enter במסכים 1–4 הוא `הלאה`, לעולם לא שליחה. */
            if (e.key !== "Enter" || step >= 5) return;
            const target = e.target as HTMLElement;
            if (target.tagName === "TEXTAREA") return;
            e.preventDefault();
            attemptNext();
          }}
          className="max-w-measure rounded border border-rule bg-bg p-form"
        >
          {/* מלכודת בוט. מחוץ למסך, מחוץ לתור הפוקוס, מוסתרת מקורא מסך. */}
          <div aria-hidden="true" className="absolute [inset-inline-start:-9999px]">
            <label htmlFor="quote-company-website">אל תמלאו</label>
            <input
              id="quote-company-website"
              name="company_website"
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={honeypot}
              onChange={(e) => setHoneypot(e.currentTarget.value)}
            />
          </div>

          <QuoteProgress step={step} />

          {b.resumed ? (
            <p className="mb-6 flex flex-wrap items-center gap-3 border-s-2 border-accent ps-4 text-sm text-fg-muted">
              {COPY.resumed}
              <button
                type="button"
                onClick={b.restart}
                className="underline decoration-rule underline-offset-[.22em] hover:decoration-accent"
              >
                {COPY.restart}
              </button>
            </p>
          ) : null}

          <div ref={stepRef} className={cn(shake && "shake")}>
            {renderStep()}
          </div>

          {/* שורת הניווט. `הלאה` אינו מוצג במסך 5 — שם יש כפתור שליחה. */}
          <div className="mt-8 flex flex-wrap items-center gap-4">
            {step > 1 ? (
              <button
                type="button"
                onClick={b.back}
                className="min-h-[44px] text-sm text-fg-subtle underline decoration-rule underline-offset-[.22em] hover:text-fg hover:decoration-accent"
              >
                {COPY.back}
              </button>
            ) : null}

            {step < 5 ? (
              <Button type="button" variant="ghost" onClick={attemptNext}>
                {COPY.next}
              </Button>
            ) : null}
          </div>
        </form>
      </div>
    </section>
  );
}

/* ═══════════════════ עזרי מסך ═══════════════════ */

function StepFieldset({
  legend,
  hint,
  children,
}: {
  legend: React.ReactNode;
  hint?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <fieldset className="m-0 min-w-0 border-0 p-0">
      <legend className="mb-4 font-serif text-xl font-medium leading-sub text-fg">{legend}</legend>
      {hint ? <p className="mb-4 max-w-body text-xs text-fg-subtle">{hint}</p> : null}
      {children}
    </fieldset>
  );
}

function AreaTextField({
  value,
  onChange,
  error,
}: {
  value: string;
  onChange: (v: string) => void;
  error?: string;
}) {
  return (
    <Field id="quote-area" label={COPY.areaFreeLabel} hint={COPY.areaFreeHint} error={error} required>
      {(control) => (
        <TextInput
          {...control}
          kind="text"
          name="area"
          value={value}
          maxLength={60}
          inputMode="text"
          autoComplete="address-level2"
          onChange={(e) => onChange(e.currentTarget.value)}
          className={fieldControlClass}
        />
      )}
    </Field>
  );
}
