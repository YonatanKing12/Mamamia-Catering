/**
 * ═══════════════════════════════════════════════════════════════════════
 *  לקוח הלידים — עטיפות מוטיפסות מעל ארבעת מסלולי הקליטה.
 * ═══════════════════════════════════════════════════════════════════════
 *
 *   POST /api/quote      — טופס ההצעה המלא          → מחכים לתשובה
 *   POST /api/wa-intent  — קליטה לפני יציאה לוואטסאפ → שגר ושכח
 *   POST /api/draft      — טיוטה תוך כדי מילוי       → שגר ושכח
 *   POST /api/lead/phone — קליק על טלפון             → שגר ושכח
 *
 * ─────────────────────────────────────────────────────────────────────
 *  הכלל שמחזיק את הקובץ הזה
 * ─────────────────────────────────────────────────────────────────────
 * שלוש מארבע הפונקציות מחזירות `void` בכוונה תחילה. אין להן promise,
 * ולכן `await` עליהן חסר משמעות ואי אפשר בטעות לעכב איתן ניווט.
 *
 * זה לא סגנון — זה תיקון לכשל הידוע:
 *   • `await fetch()` ואז `window.open()` — Safari/iOS חוסם את הפתיחה
 *     כחלון קופץ, כי אסימון מחוות המשתמש פג ברגע שה־promise נכנע.
 *     זה הדבר שהכי סביר שיישבר כאן, וה"שיפור" שגורם לו (להמתין כדי
 *     שהשרת ייצר את המזהה) נראה כמו הנדסה טובה.
 *   • sendBeacon או fetch מתוך `unload` / `beforeunload` / `pagehide` —
 *     מתועד כלא אמין ונכשל ספציפית ב־iOS; דפדפני מובייל לעיתים קרובות
 *     לא יורים את האירועים האלה בכלל. תעבורת קייטרינג בישראל היא
 *     בעיקר אייפון, כלומר זה נכשל בשקט אצל הרוב.
 *
 * לכן: מזהה הפנייה נוצר בקליינט, ה־POST יוצא ב־sendBeacon (ואם הוא
 * מסרב — fetch עם keepalive), והניווט קורה באותו tick.
 * spec 02 §6.1–§6.3.
 */

import {
  generateRef,
  type Branch,
  type GuestBand,
  type ServiceFormat,
  type WaLocation,
} from "@shared/lead-constants";
/* טיפוסים נגזרי־zod בלבד. import type נמחק בקומפילציה ולכן אינו גורר את
   zod לבאנדל — רק ייבוא ערכי היה עושה זאת. */
import type {
  Attribution,
  DraftInput,
  QuoteLeadInput,
  WaIntentInput,
} from "@shared/lead-schema";
import { BRANCHES, PHONE, waLink } from "@/content/business";
import { getAttribution, getSessionId, getSourcePage } from "@/lib/attribution";
import { track } from "@/lib/analytics";

/** מזהה פנייה חדש. נוצר בקליינט כי הוא חייב להיות בתוך הודעת הוואטסאפ. */
export const newRef = generateRef;

/* ═══════════════════ שגר ושכח ═══════════════════ */

/**
 * שולח בלי לחסום ובלי להחזיר promise.
 *
 * `sendBeacon` הוא הנתיב הנכון: הדפדפן מתחייב לשלוח את הבקשה גם אם
 * הדף מתחיל להיפרק באותו רגע. הוא מחזיר `false` כשהתור מלא או כשהגוף
 * גדול מדי — ואז, ורק אז, נופלים ל־`fetch(keepalive)`.
 *
 * שום כשל כאן אינו מדווח למשתמש ואינו מעכב אותו. ליד שלא נקלט הוא
 * הפסד; קליק שנחסם הוא לקוח שהלך.
 */
function fireAndForget(url: string, payload: unknown): void {
  let body: string;
  try {
    body = JSON.stringify(payload);
  } catch {
    return;
  }

  try {
    if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
      /* סוג ה־Blob הוא מה שקובע את Content-Type, ובלעדיו express.json
         לא יפרסר את הגוף והבקשה תיפול ב־400 בשקט. */
      const blob = new Blob([body], { type: "application/json" });
      if (navigator.sendBeacon(url, blob)) return;
    }
  } catch {
    /* sendBeacon חסום או לא נתמך — ממשיכים ל־fetch */
  }

  try {
    void fetch(url, {
      method: "POST",
      keepalive: true,
      headers: { "Content-Type": "application/json" },
      body,
    }).catch(() => {});
  } catch {
    /* גם זה נכשל. לא נורא — הניווט חשוב יותר. */
  }
}

/* ═══════════════════ שגיאות ═══════════════════ */

/**
 * הודעת הכשל. הטלפון עטוף ב־U+2066/U+2069 (isolate) כדי שרצף הספרות
 * לא יקפוץ למקום אחר בתוך המשפט העברי.
 */
export const SUBMIT_FAILED_MESSAGE =
  `השליחה לא עברה. נסו שוב, או פשוט התקשרו — ⁦${PHONE.display}⁩.`;

export class LeadSubmitError extends Error {
  readonly status: number;
  readonly fields?: Record<string, string[] | undefined>;

  constructor(message: string, status: number, fields?: Record<string, string[] | undefined>) {
    super(message);
    this.name = "LeadSubmitError";
    this.status = status;
    this.fields = fields;
  }
}

/* ═══════════════════ 1 · טופס ההצעה ═══════════════════ */

type WithoutAttribution<T> = Omit<T, keyof Attribution>;

/** מה שהבילדר מספק. הייחוס נוסף כאן, ולא באחריות הקומפוננטה. */
export type QuoteSubmission = Omit<
  WithoutAttribution<QuoteLeadInput>,
"ref" | "contactChannel" | "dateFlexible" | "areaIsFreeText" | "selectedDishes" | "consentMarketing"
> & {
  /** אם לא נמסר — נוצר כאן. */
  ref?: string;
  contactChannel?: "whatsapp" | "phone";
  dateFlexible?: boolean;
  areaIsFreeText?: boolean;
  selectedDishes?: string[];
  consentMarketing?: boolean;
};

interface QuoteResponseBody {
  success?: boolean;
  ref?: string;
  error?: string;
  fields?: Record<string, string[]>;
}

/**
 * המסלול היחיד שכן ממתין לשרת — כי המשתמש נשאר בדף, יש לו מסך המתנה,
 * ומזהה הפנייה שיוצג לו חייב להיות זה שנשמר בפועל (השרת עשוי להנפיק
 * מזהה משלו במקרה של התנגשות; spec 02 §6.8א).
 *
 * `generate_lead` נורה **כאן ורק כאן** עבור מסלול הטופס. אין לירות אותו
 * שוב מהקומפוננטה.
 */
export async function submitQuote(answers: QuoteSubmission): Promise<{ ref: string }> {
  const ref = answers.ref ?? newRef();
  const body = { ...getAttribution(), ...answers, ref };

  let res: Response;
  try {
    res = await fetch("/api/quote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    throw new LeadSubmitError(SUBMIT_FAILED_MESSAGE, 0);
  }

  let data: QuoteResponseBody | null = null;
  try {
    data = (await res.json()) as QuoteResponseBody;
  } catch {
    data = null;
  }

  if (!res.ok || !data?.success) {
    /* 429 מגיע עם נוסח עברי מהשרת ועדיף על הנוסח הגנרי */
    const message = res.status === 429 && data?.error ? data.error : SUBMIT_FAILED_MESSAGE;
    throw new LeadSubmitError(message, res.status, data?.fields);
  }

  const confirmed = typeof data.ref === "string" && data.ref ? data.ref : ref;

  track("generate_lead", {
    lead_source: "quote_builder",
    lead_ref: confirmed,
    guest_band: answers.guestBand,
    event_type: answers.eventType,
    branch_area: answers.area,
    service_format: answers.serviceFormat ?? null,
  });

  return { ref: confirmed };
}

/* ═══════════════════ 2 · טיוטה ═══════════════════ */

export type DraftSubmission = WithoutAttribution<DraftInput>;

let lastDraftBody = "";

/**
 * נשמרת תוך כדי מילוי, לפני שנמסרו פרטי קשר.
 *
 * הסכימה בשרת היא `.strict()` — מפתח שאינו מוכר מפיל את הבקשה ב־400.
 * זה מכוון: זה מה שהופך שדה `phone` שנשלח בטעות לשגיאה במקום לכתיבה
 * שקטה של מידע אישי לטבלה שאמורה להיות נקייה ממנו. אין להוסיף כאן
 * שדות חופשיים.
 */
export function saveDraft(draft: DraftSubmission): void {
  const payload = { ...getAttribution(), ...draft };
  let body: string;
  try {
    body = JSON.stringify(payload);
  } catch {
    return;
  }
  /* אותה טיוטה בדיוק — אין טעם בבקשה נוספת */
  if (body === lastDraftBody) return;
  lastDraftBody = body;
  fireAndForget("/api/draft", payload);
}

/* ═══════════════════ 3 · כוונת וואטסאפ ═══════════════════ */

export type WaIntentSubmission = Omit<WithoutAttribution<WaIntentInput>, "ref"> & { ref?: string };

/**
 * הנקודה הקריטית של כל האתר.
 *
 * קליק לוואטסאפ מוציא את המשתמש מהאתר, ובלי הקליטה המקדימה הזאת הליד
 * פשוט לא קיים אצלנו. מחזירה את המזהה **סינכרונית**, כדי שהקורא יוכל
 * לנווט מיד באותו tick.
 *
 * חוזה השימוש, ואסור לשנות אותו:
 *
 *     const ref = captureWaIntent({ waLocation: "sticky", ... });
 *     window.location.href = buildWaHref(answers, ref);   // אותו tick
 *
 * אין `await`. אין `.then`. אין בדיקת תשובה. 429 או 500 בשרת חייבים
 * להישאר בלתי נראים למשתמש — הנתיב נכשל פתוח.
 */
export function captureWaIntent(payload: WaIntentSubmission): string {
  const ref = payload.ref ?? newRef();
  fireAndForget("/api/wa-intent", { ...getAttribution(), ...payload, ref });
  return ref;
}

/* ═══════════════════ 4 · קליק על טלפון ═══════════════════ */

/**
 * שיחה אינה מסלול המרה נפרד אלא ערוץ, ולכן היא מיוחסת ברמת ערוץ בלבד
 * (spec 02 §1.1). הפונקציה אינה מעכבת את ה־`tel:` — הקישור מנווט כרגיל.
 *
 * `is_business_hours` אינו מחושב כאן. שעון המכשיר אינו נאמן לחישוב
 * Asia/Jerusalem, ושעות המענה הן Slot ריק — אם הוא לא נמסר, הפרמטר
 * מושמט ולא מנוחש.
 */
export function capturePhoneClick(opts: {
  callLocation: string;
  isBusinessHours?: boolean;
  ref?: string;
}): string {
  const ref = opts.ref ?? newRef();

  track("call_click", {
    call_location: opts.callLocation,
...(typeof opts.isBusinessHours === "boolean" ? { is_business_hours: opts.isBusinessHours } : {}),
  });

  fireAndForget("/api/lead/phone", {
    ref,
    sourcePage: getSourcePage(),
    sessionId: getSessionId(),
  });

  return ref;
}

/* ═══════════════════ הודעת הוואטסאפ ═══════════════════ */

/**
 * תוויות טווחי סועדים לשימוש בהודעה.
 *
 * **לא** משתמשים כאן ב־`GUEST_BAND_LABELS` מ־`shared/lead-schema.ts`:
 * הן מכילות קו מפריד בין ספרות (`25–50`), שנקרא בפסקה RTL כ־`50–25`.
 * על בורר מספר סועדים זו הצהרה עסקית שגויה, לא באג ויזואלי.
 * הצורה התקינה היא מחבר עברי עם מקף U+05BE (spec 02 §3.3).
 */
const WA_GUEST_BAND_LABELS: Record<GuestBand, string> = {
  lt25: "עד 25",
"25_50": "בין 25 ל־50",
"50_100": "בין 50 ל־100",
"100_200": "בין 100 ל־200",
"200p": "200 ומעלה",
};

const BRANCH_NAMES: Record<string, string> = Object.fromEntries(
  BRANCHES.map((b) => [b.id, b.name]),
);

/** ISO → DD/MM/YYYY, בלי `new Date` — פירסור UTC משבש תאריכים ישראליים. */
function displayDate(iso: string): string | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim());
  return m ? `${m[3]}/${m[2]}/${m[1]}` : null;
}

export interface WaMessageAnswers {
  eventType?: string;
  guestBand?: GuestBand;
  /** ISO YYYY-MM-DD */
  eventDate?: string;
  /** המשתמש סימן "התאריך עוד לא נקבע" */
  dateFlexible?: boolean;
  area?: string;
  branch?: Branch | null;
  /** שמות מנות להצגה, לא מזהים */
  dishNames?: string[];
}

/**
 * תקציב הכתובת. עברית מתנפחת פי ~4.9 תחת encodeURIComponent (כל תו
 * עברי הוא 2 בתים ב־UTF-8, כלומר `%D7%90` — שישה תווים בכתובת).
 * מעל זה, לקוחות וואטסאפ מסוימים חותכים את הטקסט או מסרבים לפתוח.
 */
const ENCODED_BUDGET = 1500;

/**
 * ההודעה הממולאת מראש, **בגוף ראשון כלקוח**. הלקוח הוא השולח; נוסח
 * בגוף העסק נקרא כמו בוט.
 *
 * שני כללים בלתי מתפשרים:
 *  • שורה שהמשתמש לא ענה עליה **מושמטת**. לעולם לא `לא צוין`.
 *  • **שום סכום בשקלים אינו נכנס לכאן**, גם לא כשמנעולי המחיר עוברים.
 *    מספר שנוסע לוואטסאפ הופך להצעת מחיר כתובה, מתוארכת ושמורה אצל
 *    הלקוח. ההערכה נשארת בדף.
 *
 * מזהה הפנייה יושב בשורה אחרונה נפרדת, כדי שרצף הספרות והלטינית לא
 * יערבב את העברית סביבו.
 */
export function buildWaMessage(answers: WaMessageAnswers, ref: string): string {
  const compose = (dishLine: string | null): string => {
    const facts: string[] = [];

    if (answers.eventType) facts.push(`סוג האירוע: ${answers.eventType}`);
    if (answers.guestBand) facts.push(`מספר סועדים: ${WA_GUEST_BAND_LABELS[answers.guestBand]}`);

    const date = answers.eventDate ? displayDate(answers.eventDate) : null;
    if (date) facts.push(`תאריך משוער: ${date}`);
    else if (answers.dateFlexible) facts.push("תאריך: עוד לא נקבע");

    if (answers.area) facts.push(`אזור: ${answers.area}`);

    const branchName = answers.branch ? BRANCH_NAMES[answers.branch] : undefined;
    if (branchName) facts.push(`סניף מועדף: ${branchName}`);

    if (dishLine) facts.push(`מהתפריט: ${dishLine}`);

    /* בלי תשובות בכלל, ההודעה היא פתיח ומזהה — ובלי שורה ריקה מיותמת */
    return [
"היי, הגעתי מהאתר ורוצה הצעה לקייטרינג.",
...(facts.length ? ["", ...facts] : []),
"",
"מספר פנייה:",
      ref,
    ].join("\n");
  };

  const all = (answers.dishNames ?? []).map((d) => d.trim()).filter(Boolean);

  /* קיצוץ מדורג: קודם מקצרים את רשימת המנות, ורק אם זה לא מספיק
     מוותרים עליה לגמרי. הפרטים העסקיים לעולם לא נחתכים. */
  const candidates: Array<string | null> = [];
  if (all.length) candidates.push(all.join(", "));
  if (all.length > 3) candidates.push(`${all.slice(0, 3).join(", ")} ועוד ${all.length - 3}`);
  candidates.push(null);

  for (const dishLine of candidates) {
    const text = compose(dishLine);
    if (encodeURIComponent(text).length <= ENCODED_BUDGET) return text;
  }

  /* מצב קיצון תיאורטי (אזור חופשי ארוך במיוחד): מוודאים שהמזהה עובר. */
  return compose(null).slice(0, 300);
}

/**
 * הקישור המוכן. `waLink()` מ־`content/business.ts` הוא המקום היחיד
 * שמרכיב כתובת וואטסאפ — אין מספר קשיח באף קומפוננטה.
 */
export function buildWaHref(answers: WaMessageAnswers, ref: string): string {
  return waLink(buildWaMessage(answers, ref));
}

/* ═══════════════════ נוחות ═══════════════════ */

export type { Attribution, Branch, GuestBand, ServiceFormat, WaLocation };
