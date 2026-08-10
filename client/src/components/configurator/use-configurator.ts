/**
 * ═══════════════════════════════════════════════════════════════════════
 *  מצב המגדיר — שלבים, בחירות, התמדה וטיוטות.
 * ═══════════════════════════════════════════════════════════════════════
 *
 * ─── היחס לשכבת התוכן ───────────────────────────────────────────
 * המודל — חבילה, קטגוריה, מכסה, בחירה, מחיר — יושב כולו ב־
 * ‎`content/dish-categories.ts` ו־`content/packages.ts`. הקובץ הזה
 * **אינו מחזיק מודל משלו**: הוא לא סופר מכסות, לא מכריע תקרות ולא נוגע
 * בכסף. הוא מחזיק מצב UI — באיזה שלב אנחנו, מה נשמר לסשן, ומתי יוצאת
 * טיוטה — וכל שאלה על נתונים מנותבת ל־`resolveSelection()` ולחבריה.
 *
 * זה לא סידור אסתטי. מכסה שמחושבת בשני מקומות היא מכסה שתסטה ברגע
 * שמישהו יעדכן רק אחד מהם, והמספר שמוצג לקונה הוא התחייבות מסחרית.
 *
 * ─── שלושה קווי גבול, ואסור לטשטש אף אחד ────────────────────────
 *  1. **גבול המידע האישי.** שם, טלפון ומייל אינם נכנסים לכאן. הם חיים
 *     במצב מקומי של מסך פרטי הקשר בלבד, אינם נשמרים ב־sessionStorage
 *     ואינם נשלחים ל־`/api/draft`. הסכימה בשרת היא `.strict()` בדיוק
 *     כדי ששדה `phone` שנשלח בטעות ייפול ב־400 במקום להיכתב בשקט
 *     לטבלה שאמורה להיות נקייה ממנו.
 *
 *  2. **גם שדה האזור אינו נשמר.** הוא השדה החופשי היחיד בזרימה, ומבקר
 *     שמקליד «רחוב … אצל דנה» כותב שם של אדם. הניקוי שהטיוטה עוברת
 *     (`sanitiseAreaForDraft`) מסיר ספרות ו־@ אבל אינו מסיר שם. עלות
 *     ההחלטה היא שדה עיר אחד שמוקלד מחדש אחרי רענון; התמורה היא
 *     ש־sessionStorage נשאר נקי לחלוטין.
 *
 *  3. **sessionStorage ולא localStorage.** בניית תפריט היא סשן אחד ארוך,
 *     לא כוונה שמחזיקה שבוע. מכשיר משותף לא יציג לבאים אחריו את התפריט
 *     שמישהו בנה, והמפתח נמחק כשהלשונית נסגרת.
 *
 * ─── הבדל מהותי מ־`use-quote-builder.ts` ────────────────────────
 * שם השלבים קבועים בחמישה. כאן מספר השלבים **נגזר מהחבילה** שנבחרה:
 * קטגוריה אחת = שלב אחד. לכן `steps` הוא מערך מחושב ולא קבוע, וכל
 * ניווט עובר דרך אינדקס לתוכו.
 */

import * as React from "react";
import type { GuestBand } from "@shared/lead-constants";
import { saveDraft } from "@/lib/lead-client";
import { getSourcePage } from "@/lib/attribution";
import { track } from "@/lib/analytics";
/* ייבוא עמוק ובכוונה: `sanitiseAreaForDraft` אינו מיוצא מ־`quote/index.ts`.
   הקובץ אינו בבעלותי במחזור הזה ולכן לא הוספתי לו יצוא — קריאה ישירה
   עדיפה על שכפול הניקוי, שהוא בדיוק סוג הכפילות שסוטה תוך שבועיים. */
import { sanitiseAreaForDraft } from "@/components/quote/quote-config";
import {
  EMPTY_SELECTION,
  categoriesForPackage,
  countSelected,
  dishesForCategory,
  guestBandFor,
  maxFor,
  missingRequiredCategories,
  packageById,
  renderablePackages,
  resolveSelection,
  type CateringPackage,
  type CategoryId,
  type DishCategory,
  type DishId,
  type ResolvedSelection,
  type Selection,
} from "@/content/packages";

/** תקרת שפיות על מספר הסועדים המוקלד. אינה מינימום ואינה מקסימום עסקי. */
export const GUESTS_INPUT_CEILING = 5000;

/* ═══════════════════ שלבים ═══════════════════ */

export type StepKind = "guests" | "package" | "category" | "review" | "contact";

export interface StepDescriptor {
  kind: StepKind;
  /** מזהה יציב ל־DOM ולעוגני פוקוס. */
  key: string;
  /** כותרת השלב, בעברית. */
  title: string;
  /** רק ל־`kind === "category"`. */
  category?: DishCategory;
}

/**
 * רשימת השלבים לחבילה נתונה. חבילה שלא נבחרה עדיין נותנת שני שלבים
 * בלבד — אין דרך לדעת כמה קטגוריות יהיו, ואין להראות מד התקדמות שמשקר.
 *
 * ‎`categoriesForPackage()` כבר משמיטה קטגוריה שנותרה בלי מנות, ולכן
 * אין כאן מסלול שמייצר שלב עם כותרת ובלי תוכן.
 */
export function buildSteps(pkg: CateringPackage | null): StepDescriptor[] {
  const steps: StepDescriptor[] = [
    { kind: "guests", key: "guests", title: "מספר סועדים" },
    { kind: "package", key: "package", title: "חבילה" },
  ];
  if (!pkg) return steps;

  for (const category of categoriesForPackage(pkg)) {
    steps.push({
      kind: "category",
      key: `cat-${category.id}`,
      title: category.nameHe,
      category,
    });
  }
  steps.push({ kind: "review", key: "review", title: "סיכום" });
  steps.push({ kind: "contact", key: "contact", title: "פרטי קשר" });
  return steps;
}

/* ═══════════════════ התמדה ═══════════════════ */

const STORE_KEY = "mm_menu_build";
const STORE_VERSION = 1;

interface StoredBuild {
  v: number;
  draftId: string;
  guestCount: number | null;
  packageId: string | null;
  byCategory: Record<CategoryId, DishId[]>;
  stepIndex: number;
  /** מרשימה סגורה, ולכן אינו טקסט חופשי ואינו יכול לשאת PII. */
  eventType: string | null;
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
  return `c${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
}

function readStore(): StoredBuild | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(STORE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StoredBuild>;
    if (!parsed || parsed.v !== STORE_VERSION || typeof parsed.draftId !== "string") return null;

    /* מיזוג מול המבנה הריק: מפתח לא מוכר שנשמר פעם אינו זולג פנימה,
       ובחירה מגרסה ישנה אינה מפילה את הקומפוננטה. הניקוי האמיתי מול
       התוכן הנוכחי קורה ב־`resolveSelection()`, לא כאן. */
    const byCategory: Record<CategoryId, DishId[]> = {};
    const rawPicks = parsed.byCategory;
    if (rawPicks && typeof rawPicks === "object") {
      for (const [key, value] of Object.entries(rawPicks)) {
        if (!Array.isArray(value)) continue;
        byCategory[key] = value.filter((v): v is DishId => typeof v === "string").slice(0, 40);
      }
    }

    return {
      v: STORE_VERSION,
      draftId: parsed.draftId,
      guestCount:
        typeof parsed.guestCount === "number" &&
        Number.isInteger(parsed.guestCount) &&
        parsed.guestCount > 0
          ? Math.min(parsed.guestCount, GUESTS_INPUT_CEILING)
          : null,
      packageId: typeof parsed.packageId === "string" ? parsed.packageId : null,
      byCategory,
      stepIndex: typeof parsed.stepIndex === "number" ? parsed.stepIndex : 0,
      eventType: typeof parsed.eventType === "string" ? parsed.eventType : null,
      updatedAt: typeof parsed.updatedAt === "number" ? parsed.updatedAt : Date.now(),
    };
  } catch {
    return null;
  }
}

function writeStore(build: StoredBuild): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(STORE_KEY, JSON.stringify(build));
  } catch {
    /* מצב פרטי או מכסה מלאה — ההתמדה היא בונוס, לא תלות */
  }
}

export function clearStoredBuild(): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(STORE_KEY);
  } catch {
    /* אין מה לעשות ואין למי לדווח */
  }
}

/* ═══════════════════ ההוק ═══════════════════ */

export interface UseConfiguratorOptions {
  sourcePage: string;
  /** כיבוי ההתמדה — לבדיקות ולסטוריבוק. */
  persist?: boolean;
}

export interface ConfiguratorApi {
  /* מצב */
  selection: Selection;
  /** הבחירה נקייה ומדודה. `null` כשטרם נבחרה חבילה מוכרת. */
  resolved: ResolvedSelection | null;
  pkg: CateringPackage | null;
  packages: CateringPackage[];
  steps: StepDescriptor[];
  stepIndex: number;
  current: StepDescriptor;
  draftId: string;
  startedAt: number;
  /** בנייה קודמת שוחזרה מהסשן ועוד לא נדחתה. */
  resumed: boolean;
  /** סוג האירוע, מרשימה סגורה. נשמר בסשן. */
  eventType: string | null;
  guestBand: GuestBand | null;

  /* פעולות */
  setGuests(value: number | null): void;
  choosePackage(id: string): void;
  toggleDish(categoryId: CategoryId, dishId: DishId): "added" | "removed" | "blocked";
  removeDish(categoryId: CategoryId, dishId: DishId): void;
  setEventType(value: string): void;
  goTo(index: number): void;
  next(): void;
  back(): void;
  /** קפיצה לשלב של קטגוריה מסוימת — «שינוי» מתוך הסיכום. */
  goToCategory(categoryId: CategoryId): void;
  dismissResumed(): void;
  restart(): void;
  /** אחרי שליחה מוצלחת — מנקה את הבנייה השמורה. */
  finish(): void;
  /** דוחף טיוטה לשרת עם המצב הנוכחי. `area` מנוקה כאן. */
  pushDraft(area?: string): void;
}

interface InternalState {
  selection: Selection;
  eventType: string | null;
  stepIndex: number;
  draftId: string;
  resumed: boolean;
  startedAt: number;
}

export function useConfigurator(opts: UseConfiguratorOptions): ConfiguratorApi {
  const { sourcePage, persist = true } = opts;

  const packages = React.useMemo(() => renderablePackages(), []);

  const [state, setState] = React.useState<InternalState>(() => {
    const stored = persist ? readStore() : null;
    const selection: Selection = stored
      ? {
          guestCount: stored.guestCount,
          packageId: stored.packageId,
          byCategory: stored.byCategory,
        }
      : EMPTY_SELECTION;
    const steps = buildSteps(packageById(selection.packageId));
    return {
      selection,
      eventType: stored?.eventType ?? null,
      stepIndex: clamp(stored?.stepIndex ?? 0, 0, steps.length - 1),
      draftId: stored?.draftId ?? newDraftId(),
      resumed: Boolean(stored && (stored.packageId || stored.guestCount)),
      startedAt: Date.now(),
    };
  });

  const pkg = React.useMemo(
    () => packageById(state.selection.packageId),
    [state.selection.packageId],
  );
  const resolved = React.useMemo(() => resolveSelection(state.selection), [state.selection]);
  const steps = React.useMemo(() => buildSteps(pkg), [pkg]);
  const stepIndex = clamp(state.stepIndex, 0, steps.length - 1);
  const current = steps[stepIndex];
  const guestBand = React.useMemo(() => guestBandFor(state.selection), [state.selection]);

  /**
   * מראה סינכרוני של המצב.
   *
   * קיים משום שאסור לבצע תופעות לוואי — טיוטה, מדידה — בתוך פונקציית
   * העדכון של `useState`: React מריץ אותה פעמיים ב־StrictMode, וזה היה
   * מייצר טיוטה כפולה ואירוע מדידה כפול על כל בחירת מנה.
   */
  const ref = React.useRef(state);
  ref.current = state;

  const startTracked = React.useRef(false);

  /* ── התמדה מקומית ──────────────────────────────────────────── */

  const persistLocal = React.useCallback(
    (next: InternalState) => {
      if (!persist) return;
      writeStore({
        v: STORE_VERSION,
        draftId: next.draftId,
        guestCount: next.selection.guestCount,
        packageId: next.selection.packageId,
        byCategory: Object.fromEntries(
          Object.entries(next.selection.byCategory).map(([k, v]) => [k, [...v]]),
        ),
        stepIndex: next.stepIndex,
        eventType: next.eventType,
        updatedAt: Date.now(),
      });
    },
    [persist],
  );

  /* ── טיוטת שרת ─────────────────────────────────────────────── */

  /**
   * ‎`/api/draft` מקבל `step` בטווח ‎1–4 ואוסף מפתח לא מוכר. לכן שלבי
   * המגדיר ממופים לארבעה, ומסך פרטי הקשר **לעולם** אינו נשלח כטיוטה.
   *
   * ‎`packageId` אינו שדה בסכימה ולכן אינו נשלח — הפער מדווח. מזהי המנות
   * נלקחים מ־`resolveSelection()` ולא מהבחירה הגולמית, כדי שמזהה מת לא
   * ייכתב לטבלת הטיוטות.
   */
  const pushDraft = React.useCallback((area?: string) => {
    const snapshot = ref.current;
    const currentSteps = buildSteps(packageById(snapshot.selection.packageId));
    const kind = currentSteps[clamp(snapshot.stepIndex, 0, currentSteps.length - 1)]?.kind;
    if (kind === "contact") return; /* PII — לעולם לא נשלח כטיוטה */

    const draftStep: 1 | 2 | 3 | 4 =
      kind === "guests" ? 1 : kind === "package" ? 2 : kind === "category" ? 3 : 4;

    const band = guestBandFor(snapshot.selection);
    const dishes = liveDishIds(snapshot.selection);
    const cleanArea = area ? sanitiseAreaForDraft(area) : "";

    saveDraft({
      draftId: snapshot.draftId,
      step: draftStep,
...(band ? { guestBand: band } : {}),
...(snapshot.eventType ? { eventType: snapshot.eventType } : {}),
...(cleanArea ? { area: cleanArea } : {}),
...(dishes.length ? { selectedDishes: dishes.slice(0, 40) } : {}),
    });
  }, []);

  /* ── עדכון מרכזי ───────────────────────────────────────────── */

  const apply = React.useCallback(
    (patch: Partial<Pick<InternalState, "selection" | "eventType" | "stepIndex">>) => {
      const next: InternalState = { ...ref.current, ...patch, resumed: false };
      ref.current = next;
      setState(next);
      persistLocal(next);
    },
    [persistLocal],
  );

  /* ── פעולות ────────────────────────────────────────────────── */

  const setGuests = React.useCallback(
    (value: number | null) => {
      const guestCount =
        value !== null && Number.isFinite(value) && value > 0
          ? Math.min(Math.floor(value), GUESTS_INPUT_CEILING)
          : null;
      apply({ selection: { ...ref.current.selection, guestCount } });
    },
    [apply],
  );

  const choosePackage = React.useCallback(
    (id: string) => {
      const prev = ref.current.selection;
      const nextPkg = packageById(id);
      /*
       * בחירות של קטגוריות שאינן בחבילה החדשה נשארות באובייקט אבל
       * **אינן נספרות ואינן מוצגות**: `resolveSelection()` עובר רק על
       * ‎`categoriesForPackage()`. השארה מכוונת — מבקר שהתלבט בין שתי
       * חבילות וחזר, מוצא את מה שבחר. מה שיוצא לשרת ולסיכום עובר תמיד
       * דרך הפתרון, ולכן שום דבר מיותם לא מגיע לליד.
       */
      const selection: Selection = { ...prev, packageId: id };
      const nextSteps = buildSteps(nextPkg);
      const firstCategory = nextSteps.findIndex((s) => s.kind === "category");
      apply({ selection, stepIndex: firstCategory === -1 ? 1 : firstCategory });
      pushDraft();
    },
    [apply, pushDraft],
  );

  const toggleDish = React.useCallback(
    (categoryId: CategoryId, dishId: DishId): "added" | "removed" | "blocked" => {
      const prev = ref.current.selection;
      const chosen = prev.byCategory[categoryId] ?? [];
      const alreadyIn = chosen.includes(dishId);

      const write = (ids: readonly DishId[]) => ({
...prev,
        byCategory: { ...prev.byCategory, [categoryId]: ids },
      });

      if (alreadyIn) {
        const selection = write(chosen.filter((id) => id !== dishId));
        apply({ selection });
        track("remove_from_brief", {
          dish_id: dishId,
          brief_size: countSelected(selection),
        });
        pushDraft();
        return "removed";
      }

      /*
       * החסימה. התקרה מגיעה מ־`maxFor()` — הפונקציה היחידה שיודעת
       * להכריע בין תקרת החבילה, תקרת הקטגוריה, ומדיניות החריגה. אין
       * לשכפל את ההכרעה הזאת כאן.
       *
       * הספירה היא `countSelected()`, שסופר מנות **חיות** בלבד: מזהה מת
       * בטיוטה לא יחסום בחירה אמיתית.
       */
      const ceiling = maxFor(prev.packageId, categoryId);
      if (ceiling !== null && countSelected(prev, categoryId) >= ceiling) return "blocked";

      const selection = write([...chosen, dishId]);
      apply({ selection });
      track("add_to_brief", {
        dish_id: dishId,
        source_page: sourcePage || getSourcePage(),
        brief_size: countSelected(selection),
      });
      pushDraft();
      return "added";
    },
    [apply, pushDraft, sourcePage],
  );

  const removeDish = React.useCallback(
    (categoryId: CategoryId, dishId: DishId) => {
      const prev = ref.current.selection;
      const chosen = prev.byCategory[categoryId] ?? [];
      if (!chosen.includes(dishId)) return;
      const selection: Selection = {
...prev,
        byCategory: { ...prev.byCategory, [categoryId]: chosen.filter((id) => id !== dishId) },
      };
      apply({ selection });
      track("remove_from_brief", { dish_id: dishId, brief_size: countSelected(selection) });
      pushDraft();
    },
    [apply, pushDraft],
  );

  const setEventType = React.useCallback(
    (value: string) => {
      if (!startTracked.current) {
        startTracked.current = true;
        track("quote_start", { source_page: sourcePage, event_type: value });
      }
      apply({ eventType: value });
      pushDraft();
    },
    [apply, pushDraft, sourcePage],
  );

  const goTo = React.useCallback(
    (index: number) => {
      const prev = ref.current;
      const currentSteps = buildSteps(packageById(prev.selection.packageId));
      const target = clamp(index, 0, currentSteps.length - 1);
      if (target === prev.stepIndex) return;
      if (target < prev.stepIndex) track("quote_step_back", { from_step: prev.stepIndex + 1 });
      apply({ stepIndex: target });
    },
    [apply],
  );

  const next = React.useCallback(() => {
    const prev = ref.current;
    const currentSteps = buildSteps(packageById(prev.selection.packageId));
    const kind = currentSteps[clamp(prev.stepIndex, 0, currentSteps.length - 1)]?.kind;

    /* מזהי השלבים בטקסונומיה סגורים ל־event_type/guests/date/area/contact.
       נורים רק השלבים שיש להם מזהה **נכון**; «חבילה» ו«קטגוריה» אין להם
       מזהה, ואירוע עם מזהה שקרי גרוע מאירוע חסר. הפער מדווח. */
    if (kind === "guests") {
      const band = guestBandFor(prev.selection);
      track("quote_step_complete", {
        step_index: 2,
        step_id: "guests",
...(band ? { guest_band: band } : {}),
      });
    }

    goTo(prev.stepIndex + 1);
    pushDraft();
  }, [goTo, pushDraft]);

  const back = React.useCallback(() => {
    goTo(ref.current.stepIndex - 1);
  }, [goTo]);

  const goToCategory = React.useCallback(
    (categoryId: CategoryId) => {
      const prev = ref.current;
      const currentSteps = buildSteps(packageById(prev.selection.packageId));
      const index = currentSteps.findIndex(
        (s) => s.kind === "category" && s.category?.id === categoryId,
      );
      if (index >= 0) goTo(index);
    },
    [goTo],
  );

  const dismissResumed = React.useCallback(() => {
    setState((prev) => (prev.resumed ? { ...prev, resumed: false } : prev));
  }, []);

  const restart = React.useCallback(() => {
    clearStoredBuild();
    startTracked.current = false;
    const fresh: InternalState = {
      selection: EMPTY_SELECTION,
      eventType: null,
      stepIndex: 0,
      draftId: newDraftId(),
      resumed: false,
      startedAt: Date.now(),
    };
    ref.current = fresh;
    setState(fresh);
  }, []);

  const finish = React.useCallback(() => {
    clearStoredBuild();
  }, []);

  React.useEffect(() => {
    track("quote_open", { source_page: sourcePage });
  }, [sourcePage]);

  return {
    selection: state.selection,
    resolved,
    pkg,
    packages,
    steps,
    stepIndex,
    current,
    draftId: state.draftId,
    startedAt: state.startedAt,
    resumed: state.resumed,
    eventType: state.eventType,
    guestBand,

    setGuests,
    choosePackage,
    toggleDish,
    removeDish,
    setEventType,
    goTo,
    next,
    back,
    goToCategory,
    dismissResumed,
    restart,
    finish,
    pushDraft,
  };
}

/* ═══════════════════ עזר ═══════════════════ */

function clamp(n: number, lo: number, hi: number): number {
  if (!Number.isFinite(n)) return lo;
  return Math.min(Math.max(Math.trunc(n), lo), Math.max(lo, hi));
}

/**
 * מזהי המנות **החיות** שנבחרו, בלי כפילויות ובסדר הקטגוריות.
 *
 * עובר דרך `resolveSelection()` ולא דרך `selection.byCategory` הגולמי:
 * מזהה שנמחק מהתפריט בינתיים אינו מגיע לטיוטה, לליד, או להודעת
 * הוואטסאפ. זו אותה הגנה בדיוק ש־`dishesByIds()` נותנת ב־`dishes.ts`.
 */
export function liveDishIds(selection: Selection): DishId[] {
  const resolved = resolveSelection(selection);
  if (!resolved) return [];
  const seen = new Set<DishId>();
  const out: DishId[] = [];
  for (const line of resolved.categories) {
    for (const dish of line.dishes) {
      if (seen.has(dish.id)) continue;
      seen.add(dish.id);
      out.push(dish.id);
    }
  }
  return out;
}

/**
 * האם המנה יושבת **מעבר למכסה הכלולה** של הקטגוריה — כלומר האם היא
 * הבחירה השמינית כשכלולות שבע.
 *
 * ‎`content/packages.ts` נותן `isOverQuota()` ברמת קטגוריה; זה הפירוט
 * ברמת מנה, שהכרטיס צריך כדי לסמן את **הנכונה**. הוא נגזר מאותו מקור —
 * המיקום ברשימה הפתורה מול `quota` — ואינו מחשב מכסה מחדש.
 */
export function dishIsOverQuota(
  resolved: ResolvedSelection | null,
  categoryId: CategoryId,
  dishId: DishId,
): boolean {
  const line = resolved?.categories.find((c) => c.category.id === categoryId);
  if (!line) return false;
  const index = line.dishes.findIndex((d) => d.id === dishId);
  return index >= 0 && index >= line.quota;
}

/** האם אפשר להתקדם מהשלב. הוולידציה עצמה יושבת בקומפוננטה. */
export function stepIsSatisfied(step: StepDescriptor, selection: Selection): boolean {
  switch (step.kind) {
    case "guests":
      return typeof selection.guestCount === "number" && selection.guestCount > 0;
    case "package":
      return Boolean(packageById(selection.packageId));
    case "category":
      if (!step.category?.required) return true;
      return countSelected(selection, step.category.id) > 0;
    case "review":
      return missingRequiredCategories(selection).length === 0;
    default:
      return true;
  }
}

/** האם לקטגוריה נותרו מנות להציג. שער הרינדור של שלב קטגוריה. */
export const categoryHasDishes = (category: DishCategory): boolean =>
  dishesForCategory(category).length > 0;
