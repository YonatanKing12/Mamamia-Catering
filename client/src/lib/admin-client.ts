/**
 * ═══════════════════════════════════════════════════════════════════════
 *  לקוח האדמין — קריאה ועדכון של לידים מאחורי טוקן.
 * ═══════════════════════════════════════════════════════════════════════
 *
 *   GET   /api/leads       — רשימת לידים. `status`, `limit`, `offset`.
 *   PATCH /api/leads/:id    — סטטוס, סיבת אובדן, שווי הצעה, שווי שנסגר.
 *
 * שניהם מאחורי `requireAdmin` ב־server/routes.ts: השוואת `timingSafeEqual`
 * מול `ADMIN_TOKEN`, ‎503 כשהמשתנה אינו מוגדר או קצר מ־24 תווים.
 *
 * ─────────────────────────────────────────────────────────────────────
 *  החוק שמחזיק את הקובץ הזה
 * ─────────────────────────────────────────────────────────────────────
 * הטוקן הוא **אישור נושא** לכל מספר טלפון של לקוח שנמצא במסד. הוא נמסר
 * לכל קריאה כארגומנט מפורש, ואינו נשמר כאן — לא במשתנה מודול, לא
 * ב־localStorage ולא ב־sessionStorage.
 *
 * ‎`localStorage` היה הכשל החמור: הוא שורד סגירת דפדפן, נגיש לכל סקריפט
 * שירוץ באותו origin, ומכשיר משותף היה משאיר את המאגר פתוח. ‎`sessionStorage`
 * (שהמפרט מציע ב־P-24) עדיף עליו אך עדיין שורד ריענון ונשאר בלשונית פתוחה
 * שנשכחה. הטוקן חי ב־state של הקומפוננטה בלבד: ריענון ⇒ צריך להקליד שוב.
 *
 * שלושה כללים נוספים:
 *   · ‎`cache: "no-store"` — התשובה מכילה מידע אישי. השרת שולח
 *     ‎`Cache-Control: no-store, private`; הבקשה מצידה לא מבקשת מטמון.
 *   · ‎`credentials: "omit"` — אין כאן עוגייה שצריך לצרף, וצירוף שכזה היה
 *     פותח פתח ל־CSRF על נתיב האדמין.
 *   · שגיאות מסווגות. ‎401 ו־503 הן **שתי תקלות שונות** — טוקן שגוי מול
 *     שרת שלא הוגדר — ומי שמאחד אותן להודעה אחת שולח את בעל העסק לחפש
 *     את הטוקן שלו כשהבעיה היא במשתני הסביבה.
 */

import { LEAD_STATUSES, type LeadStatus } from "@shared/lead-constants";

/* ═══════════════════ הליד כפי שהשרת מחזיר אותו ═══════════════════ */

/**
 * ‎`shared/schema.ts` הוא צד־שרת בלבד (הוא גורר את drizzle לבאנדל), ולכן
 * הצורה מוצהרת כאן מחדש. אלה העמודות שהמסך הזה קורא — לא כולן.
 *
 * הכול nullable חוץ מהמזהים: ליד וואטסאפ נוצר **לפני** שהוקלד שם, וליד
 * מקליק על טלפון נוצר בלי שום פרט מלבד מזהה הפנייה. שדה ריק הוא המצב
 * התקין, והמסך משמיט אותו במקום להציג מציין מקום.
 */
export interface AdminLead {
  id: string;
  ref: string;
  createdAt: string;
  updatedAt: string | null;

  status: LeadStatus;
  path: string;

  name: string | null;
  phone: string | null;
  phoneE164: string | null;
  email: string | null;
  contactChannel: string | null;

  eventType: string | null;
  guestBand: string | null;
  guestCount: number | null;
  eventDate: string | null;
  dateFlexible: boolean | null;
  dateFlag: string | null;
  area: string | null;
  branch: string | null;
  serviceFormat: string | null;
  selectedDishes: string[] | null;
  notes: string | null;

  waLocation: string | null;
  sourcePage: string | null;
  landingPage: string | null;
  referrer: string | null;

  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmTerm: string | null;
  utmContent: string | null;
  utmId: string | null;

  gclid: string | null;
  gbraid: string | null;
  wbraid: string | null;
  fbclid: string | null;
  msclkid: string | null;
  ttclid: string | null;

  statusChangedAt: string | null;
  statusChangedBy: string | null;
  lostReason: string | null;
  quotedValueIls: number | null;
  wonValueIls: number | null;
  wonAt: string | null;

  consentMarketing: boolean | null;
  isTest: boolean | null;
}

/** מה ש־PATCH /api/leads/:id מקבל. הסכימה בשרת היא `.strict()`. */
export interface AdminLeadPatch {
  status?: LeadStatus;
  lostReason?: string;
  quotedValueIls?: number;
  wonValueIls?: number;
}

/* ═══════════════════ שגיאות ═══════════════════ */

export type AdminErrorKind =
  /** ‎401 — הטוקן אינו תואם. בעיה של האדם שמקליד. */
  | "unauthorized"
  /** ‎503 — ‎ADMIN_TOKEN אינו מוגדר בשרת, או קצר מ־24 תווים. בעיית תצורה. */
  | "not_configured"
  /** הטוקן שהוקלד קצר מ־24 תווים. נחסם לפני שהוא יוצא מהדפדפן. */
  | "token_too_short"
  /** ‎400 — הגוף נדחה על ידי zod. */
  | "invalid"
  /** ‎404 — הליד אינו קיים (נמחק בין הטעינה לעדכון). */
  | "not_found"
  /** הבקשה לא יצאה או לא חזרה. */
  | "network"
  /** תשובה שאינה JSON, או JSON בלי `success`. */
  | "bad_response"
  /** ‎5xx. */
  | "server";

const MESSAGE: Record<AdminErrorKind, string> = {
  unauthorized: "הטוקן שגוי. ודאו שהעתקתם אותו במלואו, בלי רווח בהתחלה או בסוף.",
  not_configured:
"המשתנה ADMIN_TOKEN אינו מוגדר בשרת, או קצר מ־24 תווים. זו תקלת תצורה בשרת ולא בטוקן שהקלדתם — צפייה בלידים מושבתת עד שיוגדר.",
  token_too_short: "הטוקן קצר מדי. ADMIN_TOKEN הוא לפחות 24 תווים.",
  invalid: "השרת דחה את העדכון.",
  not_found: "הליד לא נמצא. ייתכן שנמחק. רעננו את הרשימה.",
  network: "אין תשובה מהשרת. בדקו את החיבור ונסו שוב.",
  bad_response: "השרת החזיר תשובה לא צפויה.",
  server: "השרת נכשל בבקשה. נסו שוב בעוד רגע.",
};

export class AdminError extends Error {
  readonly kind: AdminErrorKind;
  readonly status: number;

  constructor(kind: AdminErrorKind, status = 0, serverMessage?: string | null) {
    /* הודעת השרת נוספת רק כשהיא מוסיפה מידע — למשל פירוט שדה שנדחה. */
    const base = MESSAGE[kind];
    super(serverMessage && kind === "invalid" ? `${base} ${serverMessage}` : base);
    this.name = "AdminError";
    this.kind = kind;
    this.status = status;
  }
}

/** ‎401 מחייב לנעול את המסך ולבקש טוקן מחדש; שאר השגיאות אינן. */
export const isAuthFailure = (e: unknown): boolean =>
  e instanceof AdminError && (e.kind === "unauthorized" || e.kind === "token_too_short");

/* ═══════════════════ התעבורה ═══════════════════ */

/** אותה בדיקה שהשרת עושה, לפני שהטוקן יוצא מהמכשיר. */
export const TOKEN_MIN_LENGTH = 24;

interface Envelope<T> {
  success?: boolean;
  data?: T;
  error?: string;
  fields?: Record<string, string[]>;
}

async function request<T>(
  token: string,
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const clean = token.trim();
  if (clean.length < TOKEN_MIN_LENGTH) throw new AdminError("token_too_short");

  let res: Response;
  try {
    res = await fetch(path, {
...init,
      cache: "no-store",
      credentials: "omit",
      headers: {
...(init.headers ?? {}),
        Authorization: `Bearer ${clean}`,
      },
    });
  } catch {
    throw new AdminError("network");
  }

  /* ‎server/vite.ts מחזיר index.html לנתיב לא מוכר, ולכן גוף שאינו JSON
     הוא תרחיש אמיתי ולא תיאורטי. `null` ואז סיווג לפי הסטטוס. */
  let body: Envelope<T> | null = null;
  try {
    body = (await res.json()) as Envelope<T>;
  } catch {
    body = null;
  }

  if (res.status === 401) throw new AdminError("unauthorized", 401);
  if (res.status === 503) throw new AdminError("not_configured", 503);
  if (res.status === 404) throw new AdminError("not_found", 404);
  if (res.status === 400) throw new AdminError("invalid", 400, body?.error ?? null);
  if (res.status >= 500) throw new AdminError("server", res.status);
  if (!res.ok || body?.success !== true || body.data === undefined) {
    throw new AdminError("bad_response", res.status);
  }

  return body.data;
}

export interface ListLeadsOptions {
  /** סינון בשרת. המסך מסנן בצד הלקוח כדי להציג מונה לכל סטטוס. */
  status?: LeadStatus;
  /** תקרת השרת היא 500. */
  limit?: number;
  offset?: number;
}

export async function listLeads(
  token: string,
  opts: ListLeadsOptions = {},
): Promise<AdminLead[]> {
  const q = new URLSearchParams();
  if (opts.status) q.set("status", opts.status);
  if (opts.limit != null) q.set("limit", String(opts.limit));
  if (opts.offset != null) q.set("offset", String(opts.offset));
  const qs = q.toString();
  return request<AdminLead[]>(token, `/api/leads${qs ? `?${qs}` : ""}`);
}

export async function patchLead(
  token: string,
  id: string,
  patch: AdminLeadPatch,
): Promise<AdminLead> {
  return request<AdminLead>(token, `/api/leads/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
}

/* ═══════════════════ הערוץ — הגזירה שהופכת ייחוס לקריא ═══════════════════ */

/**
 * הערוץ שהביא את הליד.
 *
 * זו **גזירה מכנית** מהשדות שנקלטו, ולא ניחוש: `utm_source` הוא מה שהמפרסם
 * הצהיר, ומזהי הקליק הם חתימה חד־משמעית של הרשת ששלחה אותם. ‎gbraid/wbraid
 * מגיעים ב־iOS **במקום** gclid ולא לצידו, ולכן שלושתם מובילים לאותו ערוץ.
 *
 * מה שאין כאן: שיוך אחרון־מנצח בין ערוצים, חלונות המרה, וניחוש מהדף הנוחת.
 * ליד בלי אף אחד מהסימנים אינו "אורגני" ואינו "ישיר" — הוא **לא ידוע**,
 * וזה מה שנכתב.
 */
export const UNATTRIBUTED = "__none__";

export function channelKeyOf(lead: AdminLead): string {
  const utm = lead.utmSource?.trim();
  if (utm) return utm.toLowerCase();

  if (lead.gclid || lead.gbraid || lead.wbraid) return "google_ads";
  if (lead.fbclid) return "meta_ads";
  if (lead.msclkid) return "microsoft_ads";
  if (lead.ttclid) return "tiktok_ads";

  const host = referrerHost(lead.referrer);
  if (host) return host;

  return UNATTRIBUTED;
}

/** מארח ההפניה, בלי `www.`. מחזיר null כשאין הפניה או שהיא לא נפרסת. */
export function referrerHost(referrer: string | null): string | null {
  if (!referrer) return null;
  try {
    const host = new URL(referrer).hostname.replace(/^www\./i, "");
    return host || null;
  } catch {
    return null;
  }
}

const CHANNEL_LABELS: Record<string, string> = {
  google_ads: "גוגל — ממומן",
  meta_ads: "מטא — ממומן",
  microsoft_ads: "מיקרוסופט — ממומן",
  tiktok_ads: "טיקטוק — ממומן",
  [UNATTRIBUTED]: "ללא ייחוס",
};

/** תווית להצגה. מפתח שאינו מוכר מוצג כפי שנקלט — הוא מה שהמפרסם כתב. */
export const channelLabel = (key: string): string => CHANNEL_LABELS[key] ?? key;

/* ═══════════════════ זמן ═══════════════════ */

/**
 * "לפני כמה זה הגיע". מדויק בדקות עד שעה, בשעות עד יממה, בימים עד חודש,
 * ומעבר לזה תאריך מלא — טווח ארוך בימים כבר לא אומר לבעל העסק כלום.
 *
 * בלי מקף בין שני רצפי ספרות בשום ענף: בעברית הוא מתהפך חזותית.
 */
export function relativeTimeHe(iso: string | null, now: number = Date.now()): string {
  if (!iso) return "";
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return "";

  const seconds = Math.round((now - t) / 1000);
  if (seconds < 0) return "עכשיו";
  if (seconds < 60) return "עכשיו";

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return minutes === 1 ? "לפני דקה" : `לפני ${minutes} דקות`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return hours === 1 ? "לפני שעה" : `לפני ${hours} שעות`;

  const days = Math.floor(hours / 24);
  if (days === 1) return "אתמול";
  if (days < 31) return `לפני ${days} ימים`;

  return formatDateTimeHe(iso, { dateOnly: true });
}

/**
 * חותמת מלאה בשעון ישראל. שעון המכשיר אינו נאמן לחישוב `Asia/Jerusalem`,
 * ולכן אזור הזמן מוצהר במפורש בכל פורמט בקובץ הזה.
 */
export function formatDateTimeHe(
  iso: string | null,
  opts: { dateOnly?: boolean } = {},
): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("he-IL", {
    timeZone: "Asia/Jerusalem",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
...(opts.dateOnly ? {} : { hour: "2-digit", minute: "2-digit" }),
  }).format(d);
}

/**
 * תאריך האירוע: `YYYY-MM-DD` → `DD/MM/YYYY`, בלי `new Date`.
 * ‎`new Date("2026-08-14")` נפרס כ־UTC ומזיז את התאריך יום אחורה בישראל.
 */
export function formatEventDate(iso: string | null): string | null {
  if (!iso) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim());
  return m ? `${m[3]}/${m[2]}/${m[1]}` : null;
}

/** התאריך של היום בשעון ישראל, `YYYY-MM-DD`. משמש לשם קובץ הייצוא. */
export function todayStamp(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jerusalem",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

/* ═══════════════════ ייצוא CSV ═══════════════════ */

/**
 * מפריד לפי ערך `,` וכל תא במרכאות.
 *
 * שני דברים שהם לא קוסמטיקה:
 *
 *  1. **הזרקת נוסחאות.** `notes`, `name` ו־`area` הם קלט חופשי של גולש,
 *     ו־`utm_*` מגיעים מהכתובת, כלומר נשלטים על ידי מי ששלח את הקישור.
 *     תא שמתחיל ב־`=`, `+`, `-` או `@` מורץ כנוסחה כשהקובץ נפתח באקסל.
 *     לכן תא כזה מקבל גרש מוביל. זה חל גם על טלפון ב־E.164 (`+972…`).
 *  2. **BOM.** בלעדיו אקסל בחלונות פותח UTF-8 כ־windows-1255 וכל העברית
 *     יוצאת ג׳יבריש. הקובץ הזה נפתח באקסל, לא בעורך טקסט.
 *
 * שורות מסתיימות ב־CRLF, כנדרש ב־RFC 4180.
 */
const RISKY_PREFIX = /^[=+\-@\t\r]/;

/**
 * חותמת לקובץ: `YYYY-MM-DD HH:MM` בשעון ישראל.
 *
 * במכוון לא הפורמט העברי `30.07.2026`: טור כזה ממוין באקסל כטקסט, ולכן
 * יוצא לפי היום ולא לפי השנה. הצורה הזאת ממוינת נכון גם כטקסט.
 */
function csvStamp(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jerusalem",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  })
.format(d)
.replace(", ", " ");
}

function csvCell(value: unknown): string {
  let s: string;
  if (value === null || value === undefined) s = "";
  else if (typeof value === "boolean") s = value ? "כן" : "לא";
  else if (Array.isArray(value)) s = value.join(" | ");
  else s = String(value);

  if (RISKY_PREFIX.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
}

type CsvColumn = { header: string; value: (lead: AdminLead) => unknown };

/**
 * העמודות. הסדר הוא סדר העבודה: מי, מתי, מה, ואז מאיפה.
 *
 * ‎`answers` ו־`sessionId` **אינם** מיוצאים: הראשון הוא העתק מלא של הטופס
 * כולל שדות שכבר מיוצאים לחוד, והשני הוא מזהה מעקב שאין בו ערך לבעל העסק
 * וקובץ שיוצא מהמערכת עדיף שלא יישא אותו.
 */
const CSV_COLUMNS: CsvColumn[] = [
  { header: "מספר פנייה", value: (l) => l.ref },
  { header: "נקלט", value: (l) => csvStamp(l.createdAt) },
  { header: "סטטוס", value: (l) => l.status },
  { header: "מסלול", value: (l) => l.path },
  { header: "שם", value: (l) => l.name },
  { header: "טלפון", value: (l) => l.phoneE164 ?? l.phone },
  { header: "מייל", value: (l) => l.email },
  { header: "ערוץ קשר מועדף", value: (l) => l.contactChannel },
  { header: "סוג אירוע", value: (l) => l.eventType },
  { header: "טווח סועדים", value: (l) => l.guestBand },
  { header: "תאריך אירוע", value: (l) => formatEventDate(l.eventDate) },
  { header: "תאריך גמיש", value: (l) => l.dateFlexible },
  { header: "אזור", value: (l) => l.area },
  { header: "פורמט הגשה", value: (l) => l.serviceFormat },
  { header: "מנות שנבחרו", value: (l) => l.selectedDishes },
  { header: "הערות", value: (l) => l.notes },
  { header: "ערוץ", value: (l) => channelLabel(channelKeyOf(l)) },
  { header: "utm_source", value: (l) => l.utmSource },
  { header: "utm_medium", value: (l) => l.utmMedium },
  { header: "utm_campaign", value: (l) => l.utmCampaign },
  { header: "utm_term", value: (l) => l.utmTerm },
  { header: "utm_content", value: (l) => l.utmContent },
  { header: "מזהה קליק", value: (l) => clickIdOf(l)?.value ?? null },
  { header: "דף פנייה", value: (l) => l.sourcePage },
  { header: "דף נחיתה", value: (l) => l.landingPage },
  { header: "הגיע מ", value: (l) => l.referrer },
  { header: "מיקום כפתור וואטסאפ", value: (l) => l.waLocation },
  { header: "סטטוס שונה ב", value: (l) => csvStamp(l.statusChangedAt) },
  { header: "סיבת אובדן", value: (l) => l.lostReason },
  { header: "שווי הצעה", value: (l) => l.quotedValueIls },
  { header: "שווי שנסגר", value: (l) => l.wonValueIls },
  { header: "הסכמה לדיוור", value: (l) => l.consentMarketing },
  { header: "ליד בדיקה", value: (l) => l.isTest },
];

/** מזהה הקליק שנמצא על הליד, אם יש. לכל היותר אחד רלוונטי בפועל. */
export function clickIdOf(lead: AdminLead): { name: string; value: string } | null {
  const pairs: Array<[string, string | null]> = [
    ["gclid", lead.gclid],
    ["gbraid", lead.gbraid],
    ["wbraid", lead.wbraid],
    ["fbclid", lead.fbclid],
    ["msclkid", lead.msclkid],
    ["ttclid", lead.ttclid],
  ];
  for (const [name, value] of pairs) if (value) return { name, value };
  return null;
}

export function leadsToCsv(rows: AdminLead[]): string {
  const lines = [
    CSV_COLUMNS.map((c) => csvCell(c.header)).join(","),
...rows.map((lead) => CSV_COLUMNS.map((c) => csvCell(c.value(lead))).join(",")),
  ];
  return `﻿${lines.join("\r\n")}\r\n`;
}

/**
 * מוריד את הקובץ. ‎`URL.revokeObjectURL` נדחה בפריים אחד: ביטול מיידי
 * מבטל את ההורדה בחלק מהדפדפנים לפני שהיא התחילה.
 */
export function downloadCsv(csv: string, filename: string): void {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

/* ═══════════════════ אגרגציה לפי ערוץ ═══════════════════ */

export interface ChannelRow {
  key: string;
  labelHe: string;
  leads: number;
  quoted: number;
  won: number;
  lost: number;
  wonValueIls: number;
  /** ‎null כשהמכנה קטן מ־`MIN_DENOMINATOR`. */
  closeRate: number | null;
  valuePerLead: number | null;
}

/**
 * מתחת לזה שום יחס אינו מוצג.
 *
 * זו לא קפדנות סטטיסטית לשמה: "‎33% סגירה" על שלוש פניות הוא בדיוק המספר
 * שגורם לבעל עסק להזיז תקציב לערוץ שלא הוכיח כלום. מכנה קטן ⇒ מוצג `—`,
 * והמונה עצמו נשאר גלוי כדי שאפשר יהיה לראות שהנתון פשוט צעיר.
 */
export const MIN_DENOMINATOR = 10;

/**
 * לידי בדיקה (`isTest`) מוחרגים. הם נוצרים בפיתוח ובבדיקות עשן, והם
 * מזייפים בדיוק את המכנה שהשורה שלמעלה מגנה עליו.
 */
export function aggregateByChannel(rows: AdminLead[]): ChannelRow[] {
  const buckets = new Map<string, ChannelRow>();

  for (const lead of rows) {
    if (lead.isTest) continue;
    const key = channelKeyOf(lead);
    let row = buckets.get(key);
    if (!row) {
      row = {
        key,
        labelHe: channelLabel(key),
        leads: 0,
        quoted: 0,
        won: 0,
        lost: 0,
        wonValueIls: 0,
        closeRate: null,
        valuePerLead: null,
      };
      buckets.set(key, row);
    }
    row.leads += 1;
    if (lead.status === "quoted") row.quoted += 1;
    if (lead.status === "won") {
      row.won += 1;
      row.wonValueIls += lead.wonValueIls ?? 0;
    }
    if (lead.status === "lost") row.lost += 1;
  }

  const out = [...buckets.values()];
  for (const row of out) {
    if (row.leads >= MIN_DENOMINATOR) {
      row.closeRate = row.won / row.leads;
      row.valuePerLead = Math.round(row.wonValueIls / row.leads);
    }
  }

  /* לפי נפח יורד; שובר שוויון אלפביתי כדי שהסדר יהיה יציב בין רינדורים. */
  return out.sort((a, b) => b.leads - a.leads || a.labelHe.localeCompare(b.labelHe, "he"));
}

/** רשימת הסטטוסים, לשימוש המסך. מיוצא כדי שלא ייכתב מערך מקביל. */
export { LEAD_STATUSES, type LeadStatus };
