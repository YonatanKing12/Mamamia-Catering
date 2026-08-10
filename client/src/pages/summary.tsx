/**
 * ═══════════════════════════════════════════════════════════════════════
 *  P-19 · `/summary?ref=` — סיכום האירוע. spec 01 §4 P-19, 02 §5.3, G13.
 * ═══════════════════════════════════════════════════════════════════════
 *
 * זה **המסמך שהקונה מעביר הלאה**. הוא אחראי לבן זוג, לוועד עובדים או
 * למנהל כספים, והוא צריך משהו להראות להם. האדם שבצד השני של ההעברה הוא
 * קליק שני ששום מנגנון אחר באתר לא מרוויח, ולכן העמוד הזה הוא תחנת המרה
 * ולא נוחות.
 *
 * ─────────────────────────────────────────────────────────────────────
 *  הרג׳יסטר — ההחלטה העיצובית היחידה שקובעת כאן הכול
 * ─────────────────────────────────────────────────────────────────────
 * ‎**כרטיס תפריט, לא חשבונית** (01 §4 P-19, 02 §5.3). מסמך שנראה כמו הצעת
 * מחיר מזמין משא ומתן על מחיר; מסמך שנראה כמו תפריט מזמין אישור. לכן
 * ‎`BriefCard` הוא הכרטיס כאן — הוא כבר כתוב בדיוק לרג׳יסטר הזה — ולכן
 * אין בעמוד טבלת שורות, אין סכומים, ואין «סה״כ».
 *
 * ─────────────────────────────────────────────────────────────────────
 *  שלוש רצועות — ולמה המסמך עצמו הוא הרצועה הקרם היחידה באתר הזה
 * ─────────────────────────────────────────────────────────────────────
 * מדיניות ההחלפה ב־`index.css`: כהה לכל משטחי הפעולה, קרם לקריאה
 * הארוכה בלבד. בעמוד הזה החלוקה יוצאת מעצמה מהתפקיד:
 *
 *   כהה  · הכותרת, מספר הפנייה ומצבי הטעינה — מה שקוראים ראשון.
 *   קרם  · **המסמך.** ‎`BriefCard`, מה כלול, התנאים ומי מבשל. זו הקריאה
 *          הארוכה, זה מה שנשלח למאשר, וזה גם מה שיוצא למדפסת — וגיליון
 *          נייר של דיו כהה הוא הדרך המהירה ביותר לאבד לקוח שינסה להדפיס
 *          את מה שהוא אמור להביא לישיבה.
 *   כהה  · כל פעולה: וואטסאפ, טלפון, שיתוף, המשך.
 *
 * ─────────────────────────────────────────────────────────────────────
 *  היררכיית ההמרה — זהה בששת העמודים, עם אותה היפוך כמו ב־`/thanks`
 * ─────────────────────────────────────────────────────────────────────
 * הבנייה כבר קרתה, ולכן פקד הענבר היחיד בעמוד אינו «בנו תפריט» אלא
 * ‎**«שלחו את הסיכום»** — הקליק השני שהעמוד הזה כולו קיים בשבילו, ושום
 * מנגנון אחר באתר אינו מרוויח. וואטסאפ ירוק אחריו, טלפון כקישור טקסט,
 * והמשך לבנייה רק בתחתית דרך `NextSteps`.
 *
 * ─────────────────────────────────────────────────────────────────────
 *  כלל הגישה — למה הקוד לבדו אינו מפתח
 * ─────────────────────────────────────────────────────────────────────
 * ‎`MM-XXXXXX` הוא שישה תווים מאלפבית בן 32. הוא מוקרא בטלפון, נשלח
 * בוואטסאפ ומודבק בקבוצה — כלומר הוא **סוד חלש**, ומרחב הקודים קטן מספיק
 * לניחוש בכוח. 01 §4 P-19 קובע לכן שהאבטחה אינה על הקוד אלא על **מה
 * שהקוד פותח**: רשימת היתר של שדות תשובה, ובה סוג אירוע, טווח סועדים,
 * תאריך, אזור, מזהי מנות, מה כלול ומה לא, תנאים מסחריים וכתובת המטבח —
 * ‎**ולעולם לא** שם, טלפון, מייל, טקסט חופשי או שדה ייחוס כלשהו.
 *
 * הרשימה הזאת נאכפת **גם כאן**, ולא רק בשרת שיבנה אותה: `pickAllowed()`
 * מרכיב את המודל שדה־שדה מתוך התשובה ומשליך את כל השאר, כך ששדה שיזלוג
 * לתשובה בטעות לא יגיע ל־DOM של מסמך שמועבר הלאה. שכבת אכיפה בצד אחד
 * בלבד היא שכבה שמישהו ישכח בסבב הבא.
 *
 * ומכאן גם מה שהעמוד **אינו** עושה: הוא אינו מציג שם, טלפון או מייל של
 * הפונה, גם כשהם יושבים מולו ב־`history.state`. במסמך שנפתח בקבוצת
 * וואטסאפ אלה פרטים אישיים של אדם שלא ביקש לפרסם אותם.
 *
 * ─────────────────────────────────────────────────────────────────────
 *  מקורות הנתונים, ומה שחסר
 * ─────────────────────────────────────────────────────────────────────
 *   1. ‎`history.state` — הגעה ישירה מהאישור, באותה לשונית. מיידי.
 *   2. ‎`GET /api/quote/:ref` — **הנתיב אינו קיים ב־`server/routes.ts`.**
 *      זה בדיוק המקרה שהעמוד חייב לשרוד: קישור שהועבר הלאה נפתח אצל אדם
 *      שאין לו את ה־state, ולכן הוא נופל למצב «כבר לא זמין» עם טלפון
 *      ווואטסאפ. הוא **לעולם לא 404** — קישור שהועבר ונשבר נקרא כעסק
 *      שבור, וזה בדיוק המנגנון שהעמוד נועד לשרת.
 *
 * הקריאה נכתבה מוכנה לנתיב שטרם קיים, ולכן היא מוודאת `content-type`:
 * ‎`GET` לנתיב API לא מוכר נופל היום ל־catch-all של ה־SPA ומחזיר **HTML
 * בסטטוס 200**. בלי הבדיקה הזאת `res.json()` היה זורק, והעמוד היה מציג
 * «שגיאת רשת» למי שהרשת שלו תקינה לגמרי.
 *
 * ─────────────────────────────────────────────────────────────────────
 *  מה שאינו מרונדר, ולמה — כולם חוסרי נתונים, לא בחירות עיצוב
 * ─────────────────────────────────────────────────────────────────────
 *   מה כלול / לא כלול   `priceIncludes` / `priceExcludes` ריקים.
 *   רצועת התנאים        `TermsStrip` מחזיר null בעצמו כשאין ולו שורה.
 *   כתובת המטבח המבשל   `cateringKitchenBranch` **וגם** `addresses` ריקים.
 *                       01 §4 P-19 מבקש את כתובת המטבח בבלוק העליון של
 *                       ההדפסה; היא תיכנס מאליה כששני ה־Slots יימסרו.
 *   שורת «נשלח ב־»      חותמת הזמן מגיעה מהרשומה בשרת בלבד. מהמסלול
 *                       המקומי אין תאריך, ולכן המשפט מתקצר ואינו מנחש.
 *
 * ‎`stickyBar: 'none'` (`shared/routes.ts` P-19, 02 §1.2): הפס לעולם אינו
 * מרונדר כאן. מסמך שמועבר לגורם מאשר אינו משטח המרה עם פס דביק.
 */

import * as React from "react";
import { useSearch } from "wouter";
import { Head } from "@/components/seo/head";
import { Button, Ltr, Num, Prose } from "@/components/primitives";
import { BriefCard } from "@/components/quote/brief-card";
import { TermsStrip } from "@/components/quote/legal-blocks";
import { KITCHEN_NOTE_STATEMENT_HE, NextSteps, WhatsAppBand } from "@/components/bands";
import {
  BRANCH_NAME,
  GUEST_BAND_DISPLAY,
  SERVICE_FORMAT_LABEL,
  isKnownEventType,
} from "@/components/quote/quote-config";
import { displayDate, type QuoteAnswers } from "@/components/quote/use-quote-builder";
import { dishesByIds } from "@/content/dishes";
import { PHONE, SLOTS, filled, telLink } from "@/content/business";
import { REF_PATTERN, type GuestBand, type ServiceFormat } from "@shared/lead-constants";
import type { BranchId } from "@/content/business";
import { buildWaHref, capturePhoneClick, captureWaIntent } from "@/lib/lead-client";
import { track, type ShareMethod } from "@/lib/analytics";
import { buildWebPage } from "@/lib/seo";
import {
  kashrutClauseHe,
  resolveExtraMeta,
  stripEmptyJsonLd,
  type PageMetaExtra,
} from "@/lib/page-meta-extra";

const META = resolveExtraMeta("/summary") as PageMetaExtra;

/* ═══════════════════ המודל, ורשימת ההיתר ═══════════════════ */

/**
 * כל מה שמותר לעמוד הזה להחזיק. אין כאן שדה קשר, אין שדה ייחוס, ואין
 * שדה טקסט חופשי מלבד האזור שהפונה הקליד בעצמו — שהוא חלק מהמפרט שלו,
 * מוצג כטקסט בלבד ומקוצץ לאורך.
 */
interface SummaryRecord {
  answers: QuoteAnswers;
  /** ISO ‎YYYY-MM-DD. מהשרת בלבד. */
  submittedOn: string | null;
}

const EMPTY: QuoteAnswers = {
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

const isIsoDay = (v: unknown): v is string =>
  typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v.trim());

/** חותמת זמן מלאה או תאריך — נלקח היום בלבד. בלי `new Date`: פירסור UTC משבש תאריך ישראלי. */
function isoDayOf(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const head = v.trim().slice(0, 10);
  return isIsoDay(head) ? head : null;
}

const text = (v: unknown, max: number): string =>
  typeof v === "string" ? v.trim().slice(0, max) : "";

/**
 * ─────────────────────────────────────────────────────────────────────
 *  ‎`pickAllowed` — רשימת ההיתר של 01 §4 P-19, אכופה בקליינט
 * ─────────────────────────────────────────────────────────────────────
 * בונה את המודל **שדה־שדה**. אין כאן פריסה (`...`) של התשובה בשום מקום,
 * וזו הנקודה כולה: פריסה הופכת כל שדה עתידי שהשרת יוסיף — שם, טלפון,
 * הערה חופשית, פרמטר קמפיין — לשדה שנכנס אוטומטית למסמך שמועבר הלאה.
 *
 * ערך שאינו עובר אימות פשוט נשמט, ולעולם אינו מוצג כ־`—` או כערך גולמי.
 * מחזיר `null` כשלא נותרה אף עובדה — כרטיס בלי אף שורה אינו כרטיס.
 */
function pickAllowed(raw: unknown): SummaryRecord | null {
  if (!raw || typeof raw !== "object") return null;
  const body = raw as Record<string, unknown>;
  /* השרת רשאי לעטוף ב־`{ quote: … }` או להחזיר שטוח. שניהם נתמכים. */
  const src = (body.quote && typeof body.quote === "object" ? body.quote : body) as Record<
    string,
    unknown
  >;

  const eventType = text(src.eventType, 60);
  const guestBand = src.guestBand as GuestBand | undefined;
  const serviceFormat = src.serviceFormat as ServiceFormat | undefined;
  const branch = src.branch as BranchId | undefined;

  const dishIds = Array.isArray(src.selectedDishes ?? src.dishIds)
    ? ((src.selectedDishes ?? src.dishIds) as unknown[])
.filter((d): d is string => typeof d === "string")
.slice(0, 40)
    : [];

  const answers: QuoteAnswers = {
...EMPTY,
    /* סוג אירוע מתקבל רק אם הוא אחד מהצ׳יפים המוכרים. מחרוזת חופשית
       שהגיעה מהשרת אינה מוצגת במסמך שנפתח בקבוצת צ׳אט. */
    eventType: eventType && isKnownEventType(eventType) ? eventType : null,
    guestBand: guestBand && guestBand in GUEST_BAND_DISPLAY ? guestBand : null,
    eventDate: isIsoDay(src.eventDate) ? (src.eventDate as string).trim() : "",
    dateFlexible: src.dateFlexible === true,
    area: text(src.area, 60),
    areaIsFreeText: src.areaIsFreeText === true,
    branch: branch && branch in BRANCH_NAME ? branch : null,
    serviceFormat:
      serviceFormat && serviceFormat in SERVICE_FORMAT_LABEL ? serviceFormat : null,
    /* מזהה → שם מ־`content/dishes.ts`. מזהה שאין לו מנה נזרק בשקט:
       קוד מנה גולמי בכרטיס תפריט הוא בדיוק סוג ה«שורה ריקה» שהמסמך
       הזה לא רשאי להכיל. */
    dishes: dishesByIds(dishIds).map((d) => ({ id: d.id, name: d.nameHe })),
  };

  const hasFact =
    answers.eventType !== null ||
    answers.guestBand !== null ||
    answers.eventDate !== "" ||
    answers.dateFlexible ||
    answers.area !== "" ||
    answers.serviceFormat !== null ||
    answers.dishes.length > 0;

  if (!hasFact) return null;

  return {
    answers,
    submittedOn: isoDayOf(src.submittedAt ?? src.createdAt),
  };
}

/* ═══════════════════ המקור המקומי ═══════════════════ */

/** קורא `?ref=` ומחזיר אותו **רק** אם הוא תואם `MM-XXXXXX` בדיוק. */
function readRef(search: string): string | null {
  let raw: string | null = null;
  try {
    raw = new URLSearchParams(search).get("ref");
  } catch {
    raw = null;
  }
  if (!raw) return null;
  const value = raw.trim().toUpperCase();
  return REF_PATTERN.test(value) ? value : null;
}

/**
 * הגעה ישירה מהאישור, באותה לשונית: `{ ref, answers }` ב־`history.state`.
 *
 * ה־state עובר את **אותה** `pickAllowed` בדיוק. `history.state` ניתן
 * לזיוף מקונסולה, ואובייקט שרירותי שנכנס ישר ל־`BriefCard` היה מפיל את
 * הרינדור — ומעל זה, שתי דרכי כניסה עם שני אימותים שונים הן שתי דרכים
 * שיסטו זו מזו בסבב הבא.
 *
 * (‎`pages/thanks.tsx` מחזיק ולידטור מקביל. מבוקשת הוצאה למודול משותף
 * בדוח החזרה — אין לי בעלות על הקובץ ההוא.)
 */
function readLocalRecord(expectedRef: string | null): SummaryRecord | null {
  if (!expectedRef || typeof window === "undefined") return null;
  const raw = window.history.state as unknown;
  if (!raw || typeof raw !== "object") return null;
  const box = raw as { ref?: unknown; answers?: unknown };
  if (box.ref !== expectedRef) return null;
  return pickAllowed(box.answers);
}

/* ═══════════════════ הטעינה מהשרת ═══════════════════ */

type Remote =
  | { kind: "none" }
  | { kind: "loading" }
  | { kind: "ok"; record: SummaryRecord }
  | { kind: "gone" }
  | { kind: "error" };

/**
 * ‎00-spec-review §E4 מחייב מצב כשל־רשת מוגדר, בנפרד ממצב «לא נמצא»:
 *
 *   404 / 410 / תשובה שאינה JSON  → `gone`  — «הסיכום כבר לא זמין»
 *   429 / 5xx / הרשת נפלה          → `error` — «לא הצלחנו לטעון», עם ניסיון חוזר
 *
 * ההפרדה אינה קוסמטית: «כבר לא זמין» היא הודעה סופית שמסיימת את הביקור,
 * ורשת שנפלה לרגע אינה מקרה סופי.
 */
async function fetchRecord(ref: string, signal: AbortSignal): Promise<Remote> {
  let res: Response;
  try {
    res = await fetch(`/api/quote/${encodeURIComponent(ref)}`, {
      headers: { Accept: "application/json" },
      cache: "no-store",
      signal,
    });
  } catch {
    return { kind: "error" };
  }

  if (res.status === 404 || res.status === 410) return { kind: "gone" };
  if (res.status === 429 || res.status >= 500) return { kind: "error" };
  if (!res.ok) return { kind: "gone" };

  /* הנתיב עדיין לא קיים ⇒ ה־catch-all של ה־SPA מחזיר HTML ב־200. */
  if (!(res.headers.get("content-type") ?? "").includes("application/json")) {
    return { kind: "gone" };
  }

  let data: unknown;
  try {
    data = await res.json();
  } catch {
    return { kind: "gone" };
  }

  const record = pickAllowed(data);
  return record ? { kind: "ok", record } : { kind: "gone" };
}

/* ═══════════════════ שיתוף ═══════════════════ */

/**
 * ‎02 §5.3 — `summary_share` עם `share_method`.
 *
 * הכותרת והטקסט שנשלחים ל־Web Share הם **גנריים**: כותרת המסמך בלבד.
 * פרטי האירוע לא נכנסים לשם לעולם — הם היו מודלפים לתצוגה המקדימה
 * בקבוצת הצ׳אט שאליה המסמך מועבר, וזו בדיוק ההדלפה ש־00-spec-review §E4
 * מבקש למנוע בכרטיס ה־og.
 */
function ShareRow({ leadRef }: { leadRef: string }) {
  const [copied, setCopied] = React.useState(false);

  const url = React.useMemo(() => {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}${META.path}?ref=${encodeURIComponent(leadRef)}`;
  }, [leadRef]);

  const fire = (method: ShareMethod) => track("summary_share", { lead_ref: leadRef, share_method: method });

  const onShare = async () => {
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      try {
        await navigator.share({ title: META.titleHe, url });
        fire("webshare");
        return;
      } catch {
        /* ביטול או סירוב — נופלים להעתקה, שהיא תמיד זמינה בפועל */
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      fire("copy");
    } catch {
      /* דפדפן בלי הרשאת לוח. אין מה לדווח למשתמש — הכתובת מולו בשורת
         הכתובת, וההודעה היחידה שאפשר להציג כאן היא «לא הצלחנו», שאינה
         עוזרת לאיש. */
    }
  };

  const onPrint = () => {
    fire("print");
    window.print();
  };

  return (
    /* הפקד הממולא היחיד בעמוד. ראו «היררכיית ההמרה» בראש הקובץ:
       השיתוף הוא הקליק השני שהעמוד קיים בשבילו. */
    <div data-print="hide" className="mt-9 flex flex-wrap items-center gap-x-4 gap-y-3">
      <Button variant="primary" onClick={() => void onShare()}>
        {copied ? "הקישור הועתק" : "שלחו את הסיכום"}
      </Button>
      <Button variant="link" onClick={onPrint}>
        להדפסה
      </Button>
    </div>
  );
}

/* ═══════════════════ בלוקים ═══════════════════ */

/**
 * מה כלול ומה לא. שתי הרשימות Slots ריקים, ולכן הבלוק אינו קיים היום.
 * הוא נכתב גזום־לחוד: רשימה אחת שתימסר תופיע לבדה, בלי עמודה ריקה לצידה.
 */
function InclusionsBlock() {
  const includes = filled(SLOTS.priceIncludes) ? SLOTS.priceIncludes : null;
  const excludes = filled(SLOTS.priceExcludes) ? SLOTS.priceExcludes : null;
  if (!includes && !excludes) return null;

  return (
    <div className="mt-10 grid gap-8 sm:grid-cols-2">
      {includes ? (
        <div>
          <p className="eyebrow m-0">מה כלול</p>
          <ul className="mt-3 grid list-none gap-1 p-0 text-sm">
            {includes.map((line) => (
              <li key={line} className="border-b border-solid border-[color:var(--rule)] pb-1">
                {line}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {excludes ? (
        <div>
          <p className="eyebrow m-0">מה לא כלול</p>
          <ul className="mt-3 grid list-none gap-1 p-0 text-sm text-fg-muted">
            {excludes.map((line) => (
              <li key={line} className="border-b border-solid border-[color:var(--rule)] pb-1">
                {line}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

/**
 * מי מבשל — שתי העובדות שגורם מאשר שואל עליהן ראשונות, ושתיהן מאומתות:
 * מטבח של מסעדה **פעילה** (לשון יחיד), והכשרות כפי שנמסרה.
 * ‎`kashrutClauseHe` הוא הנוסח היחיד המותר; אין כאן מחרוזת קשיחה.
 */
function KitchenLine() {
  const kashrut = kashrutClauseHe("general");
  return (
    <div className="mt-10">
      <p className="eyebrow m-0">מי מבשל</p>
      <Prose measure="confirm" className="mt-3">
        <p>
          {KITCHEN_NOTE_STATEMENT_HE}
          {kashrut ? ` ${kashrut}.` : null}
        </p>
      </Prose>
    </div>
  );
}

/** טלפון + וואטסאפ, עם הודעת סעיף 11 שצמודה לקליטה המקדימה (INV-6). */
function ContactBlock({ record, leadRef }: { record: SummaryRecord | null; leadRef: string | null }) {
  const answers = record?.answers;

  /* מזהה אחד למחזור החיים של הבלוק: ה־href הסטטי והקליטה נושאים אותו
     יחד, ולכן הקישור תקין גם בלי JS ובלשונית חדשה. כשיש `ref` — הוא
     נשלח כמות שהוא, כדי שהשיחה תיתפר לאותה שורת ליד ולא תיצור שנייה. */
  const waAnswers = React.useMemo(
    () => ({
...(answers?.eventType ? { eventType: answers.eventType } : {}),
...(answers?.guestBand ? { guestBand: answers.guestBand } : {}),
...(answers?.eventDate ? { eventDate: answers.eventDate } : {}),
...(answers?.dateFlexible ? { dateFlexible: true } : {}),
...(answers?.area ? { area: answers.area } : {}),
      branch: answers?.branch ?? null,
...(answers?.dishes.length ? { dishNames: answers.dishes.map((d) => d.name) } : {}),
    }),
    [answers],
  );

  const href = React.useMemo(
    () => (leadRef ? buildWaHref(waAnswers, leadRef) : null),
    [waAnswers, leadRef],
  );

  const onWhatsApp = (e: React.MouseEvent) => {
    if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    if (!leadRef || !href) return;
    e.preventDefault();
    track("whatsapp_click", { wa_location: "quote_alt", has_lead: true });
    captureWaIntent({
      ref: leadRef,
      waLocation: "quote_alt",
      branch: answers?.branch ?? null,
...(answers?.eventType ? { eventType: answers.eventType } : {}),
...(answers?.guestBand ? { guestBand: answers.guestBand } : {}),
...(answers?.eventDate ? { eventDate: answers.eventDate } : {}),
...(answers?.area ? { area: answers.area } : {}),
    });
    track("whatsapp_handoff", { lead_ref: leadRef, wa_location: "quote_alt" });
    window.location.href = href;
  };

  return (
    <div>
      <p className="eyebrow m-0">איך מגיעים אלינו</p>

      {href ? (
        <div data-print="hide" className="mt-4">
          <Button variant="wa" href={href} target="_blank" onClick={onWhatsApp}>
            המשיכו בוואטסאפ
          </Button>
        </div>
      ) : null}

      <p className="mt-4 text-xs text-fg-subtle">
        או בטלפון{" "}
        <a
          href={telLink()}
          data-tel=""
          className="text-fg no-underline hover:text-accent"
          onClick={() => capturePhoneClick({ callLocation: "summary", ...(leadRef ? { ref: leadRef } : {}) })}
        >
          <Num>{PHONE.display}</Num>
        </a>
      </p>

      {href ? (
        <Prose
          size="fine"
          measure="body"
          data-print="hide"
          className="mt-5 border-s border-solid border-s-[color:var(--rule)] ps-[.9rem]"
        >
          <p>
            בלחיצה נשמרת אצלנו פנייה עם פרטי האירוע שמופיעים בהודעה.{" "}
            <a href="/privacy" className="underline underline-offset-[.22em]">
              מדיניות הפרטיות
            </a>
          </p>
        </Prose>
      ) : null}
    </div>
  );
}

/* ═══════════════════ העמוד ═══════════════════ */

export default function Summary() {
  const search = useSearch();
  const leadRef = readRef(search);

  /* נקרא פעם אחת: `history.state` משתנה תחת הרגליים בכל ניווט. */
  const [local] = React.useState<SummaryRecord | null>(() => readLocalRecord(leadRef));

  const [remote, setRemote] = React.useState<Remote>(() => {
    if (local) return { kind: "ok", record: local };
    return leadRef ? { kind: "loading" } : { kind: "none" };
  });

  /* מפתח הניסיון החוזר: שינויו מריץ את האפקט מחדש. */
  const [attempt, setAttempt] = React.useState(0);

  React.useEffect(() => {
    if (!leadRef || local) return;
    const controller = new AbortController();
    let live = true;
    setRemote({ kind: "loading" });
    void fetchRecord(leadRef, controller.signal).then((next) => {
      if (live && !controller.signal.aborted) setRemote(next);
    });
    return () => {
      live = false;
      controller.abort();
    };
  }, [leadRef, local, attempt]);

  const record = remote.kind === "ok" ? remote.record : null;
  const submittedOn = record?.submittedOn ? displayDate(record.submittedOn) : null;

  return (
    <>
      <Head
        meta={META}
        /* ‎01 §4 P-19: הסכימה של העמוד היא «none». נפלט צומת `WebPage`
           אחד בלבד, גנרי לגמרי — הכותרת והתיאור שכבר יושבים ב־head —
           ובו אפס פרטי אירוע. שום שדה מהרשומה אינו נכנס לגרף. */
        jsonLd={[stripEmptyJsonLd(buildWebPage(META))]}
      />

      {/* ═══ רצועה 1 · כהה — הכותרת, המספר, והמצבים ═══════════════ */}
      <section className="pb-sec-tight pt-[clamp(2.5rem,7vw,4.5rem)]">
        <div className="wrap">
          <div className="max-w-confirm">
            {/* ─── הבלוק העליון. הוא גם הבלוק הראשון בהדפסה (01 §4 P-19). ─── */}
            <p className="eyebrow m-0">סיכום פנייה</p>
            <h1 className="mt-4 text-3xl">מה ביקשתם מאיתנו</h1>

            {/* מספר הפנייה הוא החפץ שהמסמך הזה נסוב עליו: הוא מוקרא
                בטלפון ומודבק בהודעה. כרטיס מוגבה עם תווית ענבר, ספרות
                טבלאיות, בידוד דו־כיווני, וסימון בקליק אחד. */}
            {leadRef ? (
              <div className="mt-8 rounded-card border border-solid border-[color:var(--rule)] bg-bg-form p-card">
                {/* לא `.eyebrow`: היא קובעת `color:var(--fg-subtle)` באותה
                    שכבת utilities, ו־`text-accent` אינו מובטח לגבור עליה. */}
                <p className="m-0 text-2xs font-semibold tracking-[.09em] text-accent">
                  מספר פנייה
                </p>
                <p className="num mt-2 select-all text-2xl font-bold">
                  <Ltr>{leadRef}</Ltr>
                </p>
              </div>
            ) : null}

            {/* ─── המצבים ─── */}

            {remote.kind === "loading" ? (
              <p className="mt-8 text-sm text-fg-muted" role="status" aria-live="polite">
                טוענים את הסיכום…
              </p>
            ) : null}

            {remote.kind === "none" ? (
              <Prose measure="confirm" className="mt-8">
                <p>
                  בכתובת הזאת אין מספר פנייה, ולכן אין סיכום להציג. יש לכם מספר
                  פנייה? הקריאו אותו בטלפון או שלחו אותו בוואטסאפ, ונמצא את
                  הפרטים.
                </p>
              </Prose>
            ) : null}

            {remote.kind === "gone" ? (
              <Prose measure="confirm" className="mt-8">
                <p>הסיכום הזה כבר לא זמין.</p>
                <p>שמרו את מספר הפנייה ודברו איתנו. נאתר את הפרטים ונשלח שוב.</p>
              </Prose>
            ) : null}

            {remote.kind === "error" ? (
              <div className="mt-8">
                <Prose measure="confirm">
                  <p>לא הצלחנו לטעון את הסיכום כרגע. אפשר לנסות שוב, או פשוט לדבר איתנו.</p>
                </Prose>
                <div data-print="hide" className="mt-4">
                  <Button variant="ghost" size="sm" onClick={() => setAttempt((n) => n + 1)}>
                    נסו שוב
                  </Button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      {/* ═══ רצועה 2 · קרם — המסמך. הקריאה הארוכה, וזה מה שמודפס. ═══ */}
      {record ? (
        <div
          data-band="cream"
          className="border-y border-solid border-y-[color:var(--rule)]"
        >
          <section className="sec sec--tight">
            <div className="wrap">
              <div className="max-w-confirm">
                <Prose measure="confirm">
                  <p>
                    {submittedOn ? (
                      <>
                        הסיכום משקף את הפרטים שנשלחו ב־<Num>{submittedOn}</Num>.
                      </>
                    ) : (
"הסיכום משקף את הפרטים שנשלחו בפנייה הזאת."
                    )}{" "}
                    הצעת המחיר עצמה נשלחת בנפרד בכתב.
                  </p>
                </Prose>

                <BriefCard answers={record.answers} title="מה ששלחתם" className="mt-8" />

                <InclusionsBlock />

                {/* גזום־לחוד, ומחזיר null בעצמו כשאין ולו תנאי אחד שנמסר. */}
                <TermsStrip className="mt-8" />

                <KitchenLine />
              </div>
            </div>
          </section>
        </div>
      ) : null}

      {/* ═══ רצועה 3 · כהה — כל פעולה ═══════════════════════════════ */}
      <section className="sec sec--tight">
        <div className="wrap">
          <div className="max-w-confirm">
            <ContactBlock record={record} leadRef={leadRef} />
          </div>
        </div>
      </section>

      {/* ─── השיתוף. פעולה על המסמך, ולכן אחרי שקראו אותו — אבל **לפני**
          ‏`NextSteps`: זו הפעולה בעלת התשואה הגבוהה ביותר בעמוד, ולקבור
          אותה מתחת לרשימת קישורים זה לוותר עליה. רצועה `--alt` נפרדת,
          כדי שפקד הענבר וכפתור הוואטסאפ לא ייקראו כזוג. מרונדר רק כשיש
          מה לשתף, כלומר כשיש מספר פנייה. ─── */}
      {leadRef ? (
        <section data-print="hide" className="sec sec--tight sec--alt">
          <div className="wrap">
            <div className="max-w-confirm">
              <p className="eyebrow m-0">שמרו או שלחו הלאה</p>
              <Prose measure="confirm" className="mt-3">
                <p>
                  צריך אישור של עוד מישהו? זה הדף להעביר לו. הוא נפתח בכל
                  מכשיר, ואפשר גם להדפיס אותו.
                </p>
              </Prose>
              {/* לא `ref={…}` — `ref` היא תכונה שמורה של React ואינה
                  מגיעה לקומפוננטת פונקציה כ־prop. */}
              <ShareRow leadRef={leadRef} />
            </div>
          </div>
        </section>
      ) : null}

      {/* ─────────────────────────────────────────────────────────────
          מסלול הוואטסאפ הגנרי ומסלול הבנאי.
          שניהם `data-print="hide"`: מסמך מודפס אינו משטח המרה.

          הבאנד הזה מרונדר **רק כשאין רשומה** — כשיש רשומה, מסלול
          הוואטסאפ כבר קיים למעלה עם מספר הפנייה בתוכו, ושני כפתורי
          וואטסאפ באותו עמוד הם שני לידים לאותה שיחה.

          ‎`waLocation` הוא איחוד סגור ואין בו ערך ל־summary. `quote_alt`
          הוא ההתאמה הקרובה (מסלול הוואטסאפ כחלופה לבנאי); תוספת ערך
          ייעודי מבוקשת בדוח החזרה. המצאת ערך כאן הייתה מפילה את הקליטה
          ב־400 מול `z.enum` בשרת.
          ───────────────────────────────────────────────────────────── */}
      {!record ? (
        <div data-print="hide">
          <WhatsAppBand
            waLocation="quote_alt"
            callLocation="summary"
            title="לדבר איתנו"
            lede="הכי מהיר בוואטסאפ. אפשר לשלוח את מספר הפנייה בהודעה ונמצא את הפרטים."
            labelHe="דברו איתנו בוואטסאפ"
          />
        </div>
      ) : null}

      <div data-print="hide">
        <NextSteps
          sourcePage={META.path}
          title="לבנות תפריט לאירוע"
          lede="ארבע שאלות על האירוע, ואז פרטים ליצירת קשר."
          links={[
            {
              href: "/quote",
              titleHe: "בקשת הצעה",
              descriptionHe: "טופס קצר שממנו מתחילים.",
            },
            {
              href: "/catering",
              titleHe: "קייטרינג לאירועים",
              descriptionHe: "סוגי האירועים שאנחנו עושים.",
            },
          ]}
        />
      </div>

    </>
  );
}
