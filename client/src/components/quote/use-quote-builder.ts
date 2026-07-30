/**
 * ═══════════════════════════════════════════════════════════════════════
 *  מצב הבנאי — שלבים, תשובות, טיוטות והתמדה.
 * ═══════════════════════════════════════════════════════════════════════
 *
 * spec 02 §3, §7.
 *
 * שני קווי גבול שהקובץ הזה אוכף, ואסור לטשטש אותם:
 *
 *  1. **גבול המידע האישי.** שם, טלפון ומייל אינם נכנסים לכאן. הם חיים
 *     במצב מקומי של מסך 5 בלבד, לא נשמרים ב־localStorage ולא נשלחים
 *     ל־/api/draft. טיוטה נשלחת לפני שידוע מה מצב ההסכמה, ולכן היא
 *     חייבת להישאר אנונימית (spec 02 §7.1).
 *
 *  2. **קידום אוטומטי מושהה אחרי «חזרה».** מבקר שחזר לשלב כדי *לשנות*
 *     תשובה יימצא מקודם קדימה לפני שהספיק לראות אותה. הסט
 *     `visitedBackward` הוא מה שמונע את זה (spec 02 §3.11).
 */

import * as React from "react";
import {
  GUEST_BANDS_VERSION,
  bandFromCount,
  type GuestBand,
  type ServiceFormat,
} from "@shared/lead-schema";
import { saveDraft } from "@/lib/lead-client";
import { track } from "@/lib/analytics";
import { type BranchId } from "@/content/business";
import {
  AUTO_ADVANCE_MS,
  STEP_COUNT,
  STEP_ID_BY_NUMBER,
  isKnownEventType,
  sanitiseAreaForDraft,
  type StepNumber,
} from "./quote-config";

/* ═══════════════════ טיפוסים ═══════════════════ */

export interface DishSelection {
  id: string;
  name: string;
}

/** התשובות ללא מידע אישי. זה, וזה בלבד, מה שנשמר ומה שנשלח כטיוטה. */
export interface QuoteAnswers {
  eventType: string | null;
  guestBand: GuestBand | null;
  /** ISO YYYY-MM-DD, או "" */
  eventDate: string;
  dateFlexible: boolean;
  area: string;
  areaIsFreeText: boolean;
  branch: BranchId | null;
  serviceFormat: ServiceFormat | null;
  dishes: DishSelection[];
}

export interface QuoteSeed {
  eventType?: string | null;
  guestBand?: GuestBand | null;
  guests?: number | null;
  area?: string | null;
  areaIsFreeText?: boolean;
  branch?: BranchId | null;
  serviceFormat?: ServiceFormat | null;
  dishes?: DishSelection[];
}

export const EMPTY_ANSWERS: QuoteAnswers = {
  eventType: null,
  guestBand: null,
  eventDate: "",
  dateFlexible: false,
  area: "",
  areaIsFreeText: false,
  branch: null,
  serviceFormat: null,
  dishes: [],
};

/* ═══════════════════ התמדה מקומית ═══════════════════ */

const DRAFT_KEY = "mm_quote_draft";
const DRAFT_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

interface StoredDraft {
  draftId: string;
  step: StepNumber;
  answers: QuoteAnswers;
  updatedAt: number;
}

function newDraftId(): string {
  try {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return crypto.randomUUID();
    }
  } catch {
    /* נופלים לגיבוי */
  }
  return `d${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
}

function readStoredDraft(): StoredDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StoredDraft>;
    if (
      !parsed ||
      typeof parsed.draftId !== "string" ||
      typeof parsed.updatedAt !== "number" ||
      !parsed.answers ||
      Date.now() - parsed.updatedAt > DRAFT_MAX_AGE_MS
    ) {
      return null;
    }
    /* מזיגה מול המבנה הריק — טיוטה מגרסה ישנה לא מפילה את הקומפוננטה,
       ומפתח לא מוכר שנשמר פעם אינו זולג פנימה. */
    const a = parsed.answers as Partial<QuoteAnswers>;
    const answers: QuoteAnswers = {
      ...EMPTY_ANSWERS,
      eventType: typeof a.eventType === "string" ? a.eventType : null,
      guestBand: (a.guestBand as GuestBand) ?? null,
      eventDate: typeof a.eventDate === "string" ? a.eventDate : "",
      dateFlexible: a.dateFlexible === true,
      area: typeof a.area === "string" ? a.area : "",
      areaIsFreeText: a.areaIsFreeText === true,
      branch: (a.branch as BranchId) ?? null,
      serviceFormat: (a.serviceFormat as ServiceFormat) ?? null,
      dishes: Array.isArray(a.dishes)
        ? a.dishes
            .filter(
              (d): d is DishSelection =>
                !!d && typeof d.id === "string" && typeof d.name === "string",
            )
            .slice(0, 40)
        : [],
    };
    const step = ([1, 2, 3, 4, 5] as StepNumber[]).includes(parsed.step as StepNumber)
      ? (parsed.step as StepNumber)
      : 1;
    return { draftId: parsed.draftId, step, answers, updatedAt: parsed.updatedAt };
  } catch {
    return null;
  }
}

function writeStoredDraft(draft: StoredDraft): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  } catch {
    /* מצב פרטי או מכסה מלאה — ההתמדה היא בונוס, לא תלות */
  }
}

export function clearStoredDraft(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(DRAFT_KEY);
  } catch {
    /* אין מה לעשות ואין למי לדווח */
  }
}

/* ═══════════════════ תאריך ═══════════════════ */

/** יום/חודש/שנה → ISO. מחזיר null אם התאריך אינו קיים בלוח השנה. */
export function toIsoDate(day: string, month: string, year: string): string | null {
  const d = Number(day);
  const m = Number(month);
  const y = Number(year);
  if (!day || !month || !year) return null;
  if (!Number.isInteger(d) || !Number.isInteger(m) || !Number.isInteger(y)) return null;
  if (y < 2000 || y > 2100 || m < 1 || m > 12 || d < 1 || d > 31) return null;

  /* אימות אמיתי של אורך החודש, בלי לתת ל־Date "לגלוש" ל־3 במרץ. */
  const probe = new Date(Date.UTC(y, m - 1, d));
  if (
    probe.getUTCFullYear() !== y ||
    probe.getUTCMonth() !== m - 1 ||
    probe.getUTCDate() !== d
  ) {
    return null;
  }

  const pad = (n: number) => String(n).padStart(2, "0");
  return `${y}-${pad(m)}-${pad(d)}`;
}

/** ISO → יום/חודש/שנה. בלי `new Date` — פירסור UTC משבש תאריכים ישראליים. */
export function fromIsoDate(iso: string): { day: string; month: string; year: string } {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim());
  return m
    ? { day: String(Number(m[3])), month: String(Number(m[2])), year: m[1] }
    : { day: "", month: "", year: "" };
}

/** ISO → DD/MM/YYYY להצגה. */
export function displayDate(iso: string): string | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim());
  return m ? `${m[3]}/${m[2]}/${m[1]}` : null;
}

/* ═══════════════════ ההוק ═══════════════════ */

export interface UseQuoteBuilderOptions {
  sourcePage: string;
  seed?: QuoteSeed;
  offerAtRestaurant?: boolean;
  /** כיבוי ההתמדה המקומית — לבדיקות ולסטוריבוק. */
  persist?: boolean;
}

export interface QuoteBuilderState {
  step: StepNumber;
  answers: QuoteAnswers;
  draftId: string;
  /** שלב שהמבקר חזר אליו — קידום אוטומטי מושהה בו. */
  isBackwardVisit: boolean;
  /** טיוטה קודמת שוחזרה, ועוד לא נדחתה. */
  resumed: boolean;
  startedAt: number;
}

export interface QuoteBuilderApi extends QuoteBuilderState {
  setEventType(value: string): void;
  setGuestBand(value: GuestBand): void;
  setDate(iso: string): void;
  setDateFlexible(value: boolean): void;
  setAreaChip(label: string, branch: BranchId | null): void;
  setAreaText(value: string): void;
  setServiceFormat(value: ServiceFormat | null): void;
  removeDish(id: string): void;
  goTo(step: StepNumber): void;
  next(): void;
  back(): void;
  /** מבטל טיוטה משוחזרת ומתחיל מחדש. */
  restart(): void;
  dismissResumed(): void;
  /** מסמן שהשליחה הסתיימה — מנקה את הטיוטה המקומית. */
  finish(): void;
}

export function useQuoteBuilder(opts: UseQuoteBuilderOptions): QuoteBuilderApi {
  const { sourcePage, seed, offerAtRestaurant = false, persist = true } = opts;

  const [state, setState] = React.useState<QuoteBuilderState>(() => {
    const stored = persist ? readStoredDraft() : null;
    const base = stored?.answers ?? EMPTY_ANSWERS;
    const answers = applySeed(base, seed, offerAtRestaurant);
    return {
      /* פותחים בשלב הראשון שאין עליו תשובה. שלב שנזרע מראש נשאר גלוי
         ונגיש דרך «חזרה» — קישור מועבר לא יכתוב ליד עם תווית שגויה. */
      step: stored ? clampStep(stored.step, answers) : firstUnanswered(answers),
      answers,
      draftId: stored?.draftId ?? newDraftId(),
      isBackwardVisit: false,
      resumed: Boolean(stored),
      startedAt: Date.now(),
    };
  });

  const visitedBackward = React.useRef<Set<number>>(new Set());
  const advanceTimer = React.useRef<number | null>(null);
  const startedTracking = React.useRef(false);
  const alive = React.useRef(true);

  /**
   * מראה של המצב לקריאה סינכרונית בתוך handlers.
   *
   * הסיבה שהיא קיימת: אסור לבצע תופעות לוואי — טיוטה, מדידה, טיימר —
   * בתוך פונקציית העדכון של useState. React מריץ אותה פעמיים ב־StrictMode,
   * וזה היה מייצר טיוטה כפולה ואירוע מדידה כפול על כל בחירה.
   */
  const stateRef = React.useRef(state);
  stateRef.current = state;

  /* ניקוי הטיימר בפריקה — קידום אוטומטי לקומפוננטה מפורקת הוא אזהרה
     בקונסול אצל המפתח וקפיצה מפתיעה אצל המשתמש. */
  React.useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      if (advanceTimer.current !== null) window.clearTimeout(advanceTimer.current);
    };
  }, []);

  const persistLocal = React.useCallback(
    (step: StepNumber, answers: QuoteAnswers, draftId: string) => {
      if (!persist) return;
      writeStoredDraft({ draftId, step, answers, updatedAt: Date.now() });
    },
    [persist],
  );

  /**
   * טיוטת שרת. **בלי מידע אישי, ובלי יוצא מן הכלל.**
   * שדה האזור החופשי מנוקה מספרות ומ־@ לפני שהוא יוצא.
   */
  const pushDraft = React.useCallback(
    (step: StepNumber, answers: QuoteAnswers, draftId: string) => {
      if (step > 4) return; /* מסך 5 הוא PII — לעולם לא נשלח כטיוטה */
      saveDraft({
        draftId,
        step: step as 1 | 2 | 3 | 4,
        ...(answers.eventType ? { eventType: answers.eventType } : {}),
        ...(answers.guestBand ? { guestBand: answers.guestBand } : {}),
        ...(answers.eventDate ? { eventDate: answers.eventDate } : {}),
        ...(answers.area ? { area: sanitiseAreaForDraft(answers.area) } : {}),
        ...(answers.serviceFormat ? { serviceFormat: answers.serviceFormat } : {}),
        ...(answers.dishes.length ? { selectedDishes: answers.dishes.map((d) => d.id) } : {}),
      });
    },
    [],
  );

  const completeStep = React.useCallback(
    (step: StepNumber, answers: QuoteAnswers, draftId: string) => {
      pushDraft(step, answers, draftId);
      track("quote_step_complete", {
        step_index: step,
        step_id: STEP_ID_BY_NUMBER[step],
        ...(answers.eventType ? { event_type: answers.eventType } : {}),
        ...(answers.guestBand ? { guest_band: answers.guestBand } : {}),
        ...(answers.area ? { area: answers.area } : {}),
        ...(step === 3 ? { date_known: Boolean(answers.eventDate) } : {}),
      });
    },
    [pushDraft],
  );

  const moveTo = React.useCallback(
    (step: StepNumber) => {
      persistLocal(step, stateRef.current.answers, stateRef.current.draftId);
      setState((prev) => ({
        ...prev,
        step,
        isBackwardVisit: visitedBackward.current.has(step),
        resumed: false,
      }));
    },
    [persistLocal],
  );

  const cancelAdvance = React.useCallback(() => {
    if (advanceTimer.current !== null) {
      window.clearTimeout(advanceTimer.current);
      advanceTimer.current = null;
    }
  }, []);

  /** בחירת צ'יפ: משלימה את השלב ומקדמת אחרי 220ms. */
  const chooseAndAdvance = React.useCallback(
    (from: StepNumber, answers: QuoteAnswers) => {
      const { draftId } = stateRef.current;
      persistLocal(from, answers, draftId);
      setState((prev) => ({ ...prev, answers, resumed: false }));
      completeStep(from, answers, draftId);

      /* קידום אוטומטי מושהה בשלב שחזרו אליו — spec 02 §3.11. מבקר שבא
         *לשנות* תשובה לא ייזרק קדימה לפני שהספיק לראות אותה. */
      if (visitedBackward.current.has(from)) return;

      cancelAdvance();
      advanceTimer.current = window.setTimeout(() => {
        advanceTimer.current = null;
        if (!alive.current) return;
        if (stateRef.current.step !== from) return;
        const to = Math.min(from + 1, STEP_COUNT) as StepNumber;
        persistLocal(to, stateRef.current.answers, stateRef.current.draftId);
        setState((prev) => ({
          ...prev,
          step: to,
          isBackwardVisit: visitedBackward.current.has(to),
          resumed: false,
        }));
      }, AUTO_ADVANCE_MS);
    },
    [cancelAdvance, completeStep, persistLocal],
  );

  /** עדכון תשובה בלי קידום — הקלדה אינה בחירה. */
  const patch = React.useCallback(
    (partial: Partial<QuoteAnswers>) => {
      const prev = stateRef.current;
      const answers = { ...prev.answers, ...partial };
      persistLocal(prev.step, answers, prev.draftId);
      setState((s) => ({ ...s, answers, resumed: false }));
      return answers;
    },
    [persistLocal],
  );

  /* ── פעולות ───────────────────────────────────────────────── */

  const setEventType = React.useCallback(
    (value: string) => {
      const answers = { ...stateRef.current.answers, eventType: value };
      if (!startedTracking.current) {
        startedTracking.current = true;
        track("quote_start", { source_page: sourcePage, event_type: value });
      }
      chooseAndAdvance(1, answers);
    },
    [chooseAndAdvance, sourcePage],
  );

  const setGuestBand = React.useCallback(
    (value: GuestBand) => {
      chooseAndAdvance(2, { ...stateRef.current.answers, guestBand: value });
    },
    [chooseAndAdvance],
  );

  const setDate = React.useCallback(
    (iso: string) => {
      patch({ eventDate: iso, ...(iso ? { dateFlexible: false } : {}) });
    },
    [patch],
  );

  const setDateFlexible = React.useCallback(
    (value: boolean) => {
      patch({ dateFlexible: value, ...(value ? { eventDate: "" } : {}) });
    },
    [patch],
  );

  const setAreaChip = React.useCallback(
    (label: string, branch: BranchId | null) => {
      chooseAndAdvance(4, {
        ...stateRef.current.answers,
        area: label,
        areaIsFreeText: false,
        branch,
      });
    },
    [chooseAndAdvance],
  );

  /** שדה חופשי — **לא** מקדם אוטומטית (spec 02 §3.11). */
  const setAreaText = React.useCallback(
    (value: string) => {
      patch({ area: value.slice(0, 60), areaIsFreeText: true, branch: null });
    },
    [patch],
  );

  const setServiceFormat = React.useCallback(
    (value: ServiceFormat | null) => {
      patch({ serviceFormat: value });
    },
    [patch],
  );

  const removeDish = React.useCallback(
    (id: string) => {
      const dishes = stateRef.current.answers.dishes.filter((d) => d.id !== id);
      patch({ dishes });
      track("remove_from_brief", { dish_id: id, brief_size: dishes.length });
    },
    [patch],
  );

  const goTo = React.useCallback(
    (step: StepNumber) => {
      const prev = stateRef.current;
      if (step === prev.step) return;
      cancelAdvance();
      if (step < prev.step) {
        visitedBackward.current.add(step);
        track("quote_step_back", { from_step: prev.step });
      }
      moveTo(step);
    },
    [cancelAdvance, moveTo],
  );

  /** קידום מפורש — `הלאה` או Enter. הוולידציה יושבת בקומפוננטה. */
  const next = React.useCallback(() => {
    const prev = stateRef.current;
    const to = Math.min(prev.step + 1, STEP_COUNT) as StepNumber;
    if (to === prev.step) return;
    cancelAdvance();
    completeStep(prev.step, prev.answers, prev.draftId);
    moveTo(to);
  }, [cancelAdvance, completeStep, moveTo]);

  const back = React.useCallback(() => {
    const prev = stateRef.current;
    const to = Math.max(prev.step - 1, 1) as StepNumber;
    if (to === prev.step) return;
    cancelAdvance();
    visitedBackward.current.add(to);
    track("quote_step_back", { from_step: prev.step });
    moveTo(to);
  }, [cancelAdvance, moveTo]);

  const restart = React.useCallback(() => {
    cancelAdvance();
    clearStoredDraft();
    visitedBackward.current = new Set();
    startedTracking.current = false;
    const answers = applySeed(EMPTY_ANSWERS, seed, offerAtRestaurant);
    setState({
      step: firstUnanswered(answers),
      answers,
      draftId: newDraftId(),
      isBackwardVisit: false,
      resumed: false,
      startedAt: Date.now(),
    });
  }, [cancelAdvance, offerAtRestaurant, seed]);

  const dismissResumed = React.useCallback(() => {
    setState((prev) => (prev.resumed ? { ...prev, resumed: false } : prev));
  }, []);

  const finish = React.useCallback(() => {
    cancelAdvance();
    clearStoredDraft();
  }, [cancelAdvance]);

  return {
    ...state,
    setEventType,
    setGuestBand,
    setDate,
    setDateFlexible,
    setAreaChip,
    setAreaText,
    setServiceFormat,
    removeDish,
    goTo,
    next,
    back,
    restart,
    dismissResumed,
    finish,
  };
}

/* ═══════════════════ עזר ═══════════════════ */

/**
 * זריעה מראש. ערך שנזרע נשאר **גלוי ונבחר** ותמיד ניתן לעריכה —
 * קישור `/quote?event=…` שהועבר הלאה לא יכתוב ליד עם תווית שגויה
 * (spec 02 §1.7, spec 01 P-17).
 *
 * סוג אירוע מתקבל **רק** אם הוא אחד מהערכים המוכרים. טקסט חופשי מכתובת
 * הוא קלט של מי ששלח את הקישור, והוא מגיע בסוף למסך של בעל העסק.
 */
function applySeed(
  base: QuoteAnswers,
  seed: QuoteSeed | undefined,
  offerAtRestaurant: boolean,
): QuoteAnswers {
  if (!seed) return base;
  const out: QuoteAnswers = { ...base };

  if (!out.eventType && seed.eventType && isKnownEventType(seed.eventType, offerAtRestaurant)) {
    out.eventType = seed.eventType;
  }
  if (!out.guestBand) {
    out.guestBand = seed.guestBand ?? bandFromCount(seed.guests) ?? null;
  }
  if (!out.area && seed.area) {
    out.area = seed.area.slice(0, 60);
    out.areaIsFreeText = seed.areaIsFreeText ?? false;
  }
  if (!out.branch && seed.branch) out.branch = seed.branch;
  if (!out.serviceFormat && seed.serviceFormat) out.serviceFormat = seed.serviceFormat;
  if (!out.dishes.length && seed.dishes?.length) out.dishes = seed.dishes.slice(0, 40);

  return out;
}

function firstUnanswered(a: QuoteAnswers): StepNumber {
  if (!a.eventType) return 1;
  if (!a.guestBand) return 2;
  /* מסך 3 אינו חובה ולכן לעולם אינו "השלב הראשון שאין עליו תשובה" */
  if (!a.area) return 4;
  return 5;
}

/** טיוטה משוחזרת לא תפתח בשלב שהתשובות שלו נמחקו בינתיים. */
function clampStep(step: StepNumber, a: QuoteAnswers): StepNumber {
  const floor = firstUnanswered(a);
  return step > floor ? floor : step;
}

export { GUEST_BANDS_VERSION };
