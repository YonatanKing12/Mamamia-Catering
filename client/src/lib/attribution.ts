/**
 * ═══════════════════════════════════════════════════════════════════════
 *  ייחוס — הצד של הדפדפן.
 * ═══════════════════════════════════════════════════════════════════════
 *
 * המחצית הקובעת של הייחוס יושבת בשרת (spec 02 §10.1): מזהי קליק נשמרים
 * בעוגייה `mm_attr` / `mm_attr_first` שהיא httpOnly, ולכן JavaScript אינו
 * יכול לקרוא אותה. הקובץ הזה אינו מתיימר להחליף אותה — הוא משלים אותה:
 *
 *   • השרת מנצח על מזהי קליק ועל UTM  (spec 02 §10.2)
 *   • הקליינט מנצח על gaClientId, gaSessionId, sourcePage ו־sessionId
 *
 * למה בכל זאת קולטים כאן גם UTM ומזהי קליק: העוגייה נכתבת רק כשהבקשה
 * הראשונה עוברת דרך Express. פריסה סטטית, cache ברמת CDN, או בקשת HTML
 * שנענתה מזיכרון הדפדפן — כולן מדלגות על ה־middleware. הקליטה כאן היא
 * רשת הביטחון, וכשהעוגייה קיימת השרת פשוט דורס אותה.
 *
 * ─────────────────────────────────────────────────────────────────────
 *  gbraid / wbraid
 * ─────────────────────────────────────────────────────────────────────
 * ב־iOS ובתעבורת Safari, Google Ads שולח `gbraid` (web→app) או `wbraid`
 * (app→web) *במקום* `gclid`, לעולם לא לצידו. קליטה של gclid בלבד מאבדת
 * בשקט את רוב תעבורת המובייל בתשלום — וזה בדיוק המקום שבו נבדק קייטרינג.
 * שלושתם עמודות נפרדות, ואנחנו שומרים בדיוק אחד מהם (§normaliseGoogleClickId).
 *
 * ─────────────────────────────────────────────────────────────────────
 *  אחסון
 * ─────────────────────────────────────────────────────────────────────
 * הכל ב־sessionStorage, כלומר פר־לשונית ולא שורד סגירה. זו החלטה:
 * `sessionId` לעולם אינו נגזר ממידע אישי ולעולם אינו נשמר מעבר ללשונית
 * (spec 02 §6.8ג). המשמעות הרוחבית — הייחוס ארוך־הטווח יושב בעוגיית
 * השרת, לא כאן.
 */

import type { Attribution } from "@shared/lead-schema";

/* ═══════════════════ מפתחות אחסון ═══════════════════ */

const K_SESSION = "mm_sid";
const K_FIRST = "mm_attr_first";
const K_LAST = "mm_attr_last";

/* ═══════════════════ ניקוי ערכים ═══════════════════ */

/**
 * הערכים האלה מגיעים מהכתובת, כלומר נשלטים על ידי מי ששלח את הקישור,
 * ובסופו של דבר מוצגים במסך של בעל העסק. `shared/lead-schema.ts` דוחה
 * חריגה מהתבניות האלה ב־400. ניקוי כאן, לפני השמירה, מונע מצב שבו ליד
 * אמיתי נכשל בשליחה בגלל תו אחד בפרמטר שאיש לא שלט בו.
 */
const UTM_FORBIDDEN = /[^\w\-. |/]+/gu;
/* בלי דגל g — `test` על ביטוי גלובלי שומר lastIndex ומחזיר תשובות לסירוגין */
const CLICK_FORBIDDEN = /[^\w\-.]/;

const cleanUtm = (v: string | null | undefined): string | undefined => {
  if (!v) return undefined;
  const out = v.replace(UTM_FORBIDDEN, "").trim().slice(0, 120);
  return out.length ? out : undefined;
};

/**
 * מזהה קליק **נפסל ולא מנוקה**. חיתוך תו מתוך gclid יוצר מזהה שנראה
 * תקין, נשמר בבסיס הנתונים, ואז לא מתאים לשום קליק בהעלאה ל־Ads —
 * כלומר נתון שקרי במקום נתון חסר. מזהה אמיתי לעולם אינו מכיל תו כזה.
 */
const cleanClickId = (v: string | null | undefined): string | undefined => {
  if (!v) return undefined;
  const out = v.trim();
  if (!out.length || out.length > 300) return undefined;
  return CLICK_FORBIDDEN.test(out) ? undefined : out;
};

const cap = (v: string | null | undefined, n: number): string | undefined => {
  if (!v) return undefined;
  const out = v.trim().slice(0, n);
  return out.length ? out : undefined;
};

/* ═══════════════════ אחסון עמיד לכשל ═══════════════════ */

/**
 * ב־Safari במצב פרטי, ובכל דפדפן שבו המשתמש חסם אחסון, כל גישה ל־
 * sessionStorage זורקת. נפילה שם משביתה את כל מנוע הלידים בשביל
 * ייחוס — שהוא הדבר הכי פחות חשוב בשרשרת. לכן: זיכרון בלבד כגיבוי.
 */
const memory = new Map<string, string>();

function readStore(key: string): string | null {
  try {
    const v = window.sessionStorage.getItem(key);
    if (v !== null) return v;
  } catch {
    /* חסום — ממשיכים לזיכרון */
  }
  return memory.get(key) ?? null;
}

function writeStore(key: string, value: string): void {
  memory.set(key, value);
  try {
    window.sessionStorage.setItem(key, value);
  } catch {
    /* חסום — הערך חי בזיכרון עד סוף חיי הדף */
  }
}

/* ═══════════════════ מזהה לשונית ═══════════════════ */

function randomId(): string {
  try {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return crypto.randomUUID();
    }
  } catch {
    /* randomUUID דורש הקשר מאובטח */
  }
  const b = new Uint8Array(16);
  if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
    crypto.getRandomValues(b);
  } else {
    for (let i = 0; i < b.length; i++) b[i] = Math.floor(Math.random() * 256);
  }
  return Array.from(b, (x) => x.toString(16).padStart(2, "0")).join("");
}

/**
 * מזהה פר־לשונית. משמש לאיחוד לידים (spec 02 §6.8ב): שלוש הקשות על
 * כפתור הוואטסאפ הן פנייה אחת, לא שלוש. אינו נגזר ממידע אישי.
 */
export function getSessionId(): string {
  if (typeof window === "undefined") return "";
  const existing = readStore(K_SESSION);
  if (existing) return existing;
  const fresh = randomId().slice(0, 40);
  writeStore(K_SESSION, fresh);
  return fresh;
}

/* ═══════════════════ צילום מהכתובת ═══════════════════ */

interface Touch {
  at: string;
  lp?: string;
  ref?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
  utmId?: string;
  gclid?: string;
  gbraid?: string;
  wbraid?: string;
  fbclid?: string;
  msclkid?: string;
  ttclid?: string;
}

/**
 * גוגל שולח gclid *או* gbraid *או* wbraid — לעולם לא שניים.
 * אם בכל זאת הגיעו יחד, זה קישור שהורכב ביד או ניסיון זיהום.
 * בוחרים אחד לפי סדר עדיפות ומשמיטים את השאר, כדי שלא ייווצר שדה
 * שלא יכול היה להתקיים באמת ושיפסל בהעלאה ל־Ads.
 */
function normaliseGoogleClickId(t: Touch): void {
  if (t.gclid) {
    delete t.gbraid;
    delete t.wbraid;
  } else if (t.gbraid) {
    delete t.wbraid;
  }
}

function readTouchFromUrl(): Touch | null {
  const q = new URLSearchParams(window.location.search);
  const get = (k: string) => q.get(k);

  const t: Touch = {
    at: new Date().toISOString(),
    utmSource: cleanUtm(get("utm_source")),
    utmMedium: cleanUtm(get("utm_medium")),
    utmCampaign: cleanUtm(get("utm_campaign")),
    utmTerm: cleanUtm(get("utm_term")),
    utmContent: cleanUtm(get("utm_content")),
    utmId: cleanUtm(get("utm_id")),
    gclid: cleanClickId(get("gclid")),
    gbraid: cleanClickId(get("gbraid")),
    wbraid: cleanClickId(get("wbraid")),
    fbclid: cleanClickId(get("fbclid")),
    msclkid: cleanClickId(get("msclkid")),
    ttclid: cleanClickId(get("ttclid")),
  };

  normaliseGoogleClickId(t);

  const carriesSignal =
    !!t.utmSource || !!t.utmMedium || !!t.utmCampaign || !!t.utmTerm ||
    !!t.utmContent || !!t.utmId || !!t.gclid || !!t.gbraid || !!t.wbraid ||
    !!t.fbclid || !!t.msclkid || !!t.ttclid;

  return carriesSignal ? t : null;
}

/**
 * נתיב בלבד, בלי query.
 *
 * שתי סיבות: `source_page` הוא מימד ב־GA4 ולא כתובת — query משתנה מפצל
 * אותו לאלף ערכים; ורצועת ה־utm הייתה נשמרת פעמיים, גם בעמודות שלה וגם
 * כאן, ומבזבזת את תקרת 200 התווים של השדה.
 */
function currentPath(): string {
  return cap(window.location.pathname, 200) ?? "/";
}

function externalReferrer(): string | undefined {
  const r = document.referrer;
  if (!r) return undefined;
  try {
    if (new URL(r).host === window.location.host) return undefined;
  } catch {
    return undefined;
  }
  return cap(r, 300);
}

function parseTouch(raw: string | null): Touch | null {
  if (!raw) return null;
  try {
    const v = JSON.parse(raw);
    return v && typeof v === "object" ? (v as Touch) : null;
  } catch {
    return null;
  }
}

/* ═══════════════════ קליטה ═══════════════════ */

let captured = false;

/**
 * נקראת פעם אחת בטעינה הראשונה של הלשונית, וגם בכל פעם שהכתובת מביאה
 * פרמטרים חדשים (משתמש שנמצא באתר וחוזר אליו דרך מודעה).
 *
 * שני כללים שקל לשבור בשיפוץ עתידי:
 *  1. **לעולם לא לדרוס מזהה קליק שמור בערך ריק.** צפייה נוספת בדף בלי
 *     פרמטרים אינה ראיה לכך שהמשתמש לא הגיע ממודעה — היא רק ניווט.
 *  2. **מגע ראשון נכתב פעם אחת בלבד.** דף הנחיתה שנשמר בו הוא מה שהשרת
 *     משתמש בו כ־landingPage, והוא זה שמסביר איזה דף ייצר את הפנייה.
 */
export function initAttribution(): void {
  if (typeof window === "undefined") return;

  getSessionId();

  const fresh = readTouchFromUrl();
  const isFirstInTab = !readStore(K_FIRST);

  if (isFirstInTab) {
    const first: Touch = {
      ...(fresh ?? { at: new Date().toISOString() }),
      lp: currentPath(),
      ref: externalReferrer(),
    };
    writeStore(K_FIRST, JSON.stringify(first));
  }

  if (fresh) {
    fresh.lp = currentPath();
    fresh.ref = externalReferrer();
    writeStore(K_LAST, JSON.stringify(fresh));
  }

  captured = true;
}

/** מבטיח שהקליטה רצה, גם אם איש לא קרא ל־initAttribution בעליית האפליקציה. */
function ensureCaptured(): void {
  if (!captured) initAttribution();
}

/* ═══════════════════ מזהי Google Analytics ═══════════════════ */

function cookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  for (const part of document.cookie.split(";")) {
    const eq = part.indexOf("=");
    if (eq < 0) continue;
    if (part.slice(0, eq).trim() === name) return decodeURIComponent(part.slice(eq + 1));
  }
  return undefined;
}

/**
 * `_ga` נראה כך: `GA1.1.1234567890.1700000000`. מזהה הלקוח הוא שני
 * החלקים האחרונים. בלי העמודה הזאת על שורת הליד, אירוע `close_convert_lead`
 * לעולם לא ניתן לתפירה חזרה ל־GA4 (spec 02 §14.2).
 */
function gaClientId(): string | undefined {
  const raw = cookie("_ga");
  if (!raw) return undefined;
  const parts = raw.split(".");
  if (parts.length < 4) return undefined;
  const id = `${parts[parts.length - 2]}.${parts[parts.length - 1]}`;
  return /^[\w.\-]{1,60}$/.test(id) ? id : undefined;
}

/**
 * `_ga_<MEASUREMENT_ID>` נראה כך: `GS1.1.1700000000.3.1.1700000123.0.0.0`.
 * מזהה המדידה אינו ידוע לנו ואסור להמציא אותו — לכן סורקים לפי תחילית.
 */
function gaSessionId(): string | undefined {
  if (typeof document === "undefined") return undefined;
  for (const part of document.cookie.split(";")) {
    const eq = part.indexOf("=");
    if (eq < 0) continue;
    const name = part.slice(0, eq).trim();
    if (!name.startsWith("_ga_")) continue;
    const fields = decodeURIComponent(part.slice(eq + 1)).split(".");
    const id = fields[2];
    if (id && /^[\w.\-]{1,40}$/.test(id)) return id;
  }
  return undefined;
}

/* ═══════════════════ הפלט ═══════════════════ */

/** משמיט מפתחות ריקים. שדה שאין לו ערך פשוט לא נשלח — לא נשלח כ־null. */
function compact<T extends Record<string, unknown>>(o: T): T {
  for (const k of Object.keys(o)) {
    const v = o[k];
    if (v === undefined || v === null || v === "") delete o[k];
  }
  return o;
}

/**
 * הצילום שנפרש לתוך כל קריאת ליד.
 *
 * מדיניות המיזוג בתוך הלשונית: **המגע האחרון מנצח על UTM ועל מזהי קליק**
 * (זה מה שהשרת עושה ב־§10.2, ואי־התאמה כאן הייתה יוצרת שתי אמיתות),
 * **המגע הראשון מנצח על landingPage**. אם אין מגע אחרון — נופלים למגע
 * הראשון, כדי שביקור ישיר שהתחיל ממודעה עדיין יגיע מיוחס.
 */
export function getAttribution(): Attribution {
  if (typeof window === "undefined") return {};
  ensureCaptured();

  const first = parseTouch(readStore(K_FIRST));
  const last = parseTouch(readStore(K_LAST));
  const src = last ?? first;

  return compact({
    sourcePage: currentPath(),
    landingPage: first?.lp,
    referrer: first?.ref,
    sessionId: getSessionId(),

    utmSource: src?.utmSource,
    utmMedium: src?.utmMedium,
    utmCampaign: src?.utmCampaign,
    utmTerm: src?.utmTerm,
    utmContent: src?.utmContent,
    utmId: src?.utmId,

    /* אחד בלבד מתוך השלושה יכול להיות מלא — ראו normaliseGoogleClickId */
    gclid: src?.gclid,
    gbraid: src?.gbraid,
    wbraid: src?.wbraid,
    fbclid: src?.fbclid,
    msclkid: src?.msclkid,
    ttclid: src?.ttclid,

    gaClientId: gaClientId(),
    gaSessionId: gaSessionId(),
  }) as Attribution;
}

/** שם הדף הנוכחי בלבד — לאירועי אנליטיקס שאינם צריכים ייחוס מלא. */
export function getSourcePage(): string {
  if (typeof window === "undefined") return "";
  return currentPath();
}

/** האם הביקור הזה הגיע מקמפיין בתשלום. לשימוש תצוגתי בלבד. */
export function isPaidTraffic(): boolean {
  const a = getAttribution();
  return !!(a.gclid || a.gbraid || a.wbraid || a.fbclid || a.msclkid || a.ttclid);
}

/* קליטה מיידית בעליית המודול: הפרמטרים חייבים להיתפס לפני הניווט
   הפנימי הראשון של wouter, שמחליף את ה־search בלי טעינה מחדש. */
if (typeof window !== "undefined") initAttribution();
