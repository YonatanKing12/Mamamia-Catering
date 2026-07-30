/**
 * ═══════════════════════════════════════════════════════════════════════
 *  P-24 · `/admin/leads` — מסך הלידים. spec 01 §4 P-24.
 * ═══════════════════════════════════════════════════════════════════════
 *
 * ─────────────────────────────────────────────────────────────────────
 *  זה כלי עבודה, לא דוח
 * ─────────────────────────────────────────────────────────────────────
 * האילוץ הכובל בכל שכבת המדידה הוא הקלדה אנושית: בעל מסעדה לא ייכנס
 * לדשבורד כדי לסמן לידים. לכן המסך פותח על **תור עבודה** — מי פנה, איך
 * להתקשר אליו עכשיו, ובורר סטטוס אחד לצידו. האגרגציה יושבת מתחת, סגורה.
 *
 * מונה «לא מסומנים» מוצג למעלה, כי ריקבון של תור צריך להיות רועש ולא שקט.
 *
 * ─────────────────────────────────────────────────────────────────────
 *  למה רשומות ולא `<table>`
 * ─────────────────────────────────────────────────────────────────────
 * המסך הזה נפתח בטלפון, וזה לא ניחוש — זה המכשיר שיש לבעל העסק ביד כשהוא
 * מחזיר טלפון ללקוח. טבלה עם תשעה טורים בטלפון היא או גלילה אופקית או
 * טקסט בגודל 9px, ושתיהן הופכות את הכלי ללא שמיש בדיוק במקום שבו הוא נחוץ.
 *
 * לכן כל ליד הוא **רשומה** עם תוויות משלו, שנפרשת לטורים מיושרים ב־`lg`
 * דרך grid. אין שורת כותרות נפרדת: תווית שיושבת על התא עצמה עובדת בקורא
 * מסך בלי `scope`/`headers`, ולא נשברת כשהרשומה נערמת בטלפון.
 *
 * הטבלה היחידה כאן היא סיכום הערוצים — נתונים טבלאיים באמת, שמונה שורות
 * לכל היותר, וגלילה אופקית משלו.
 *
 * ─────────────────────────────────────────────────────────────────────
 *  שני כללי אבטחה שאסור לרכך
 * ─────────────────────────────────────────────────────────────────────
 *  1. **הטוקן בזיכרון בלבד.** ‎`React.useState` ותו לא. לא localStorage
 *     (שורד סגירת דפדפן ונגיש לכל סקריפט ב־origin), ולא sessionStorage
 *     — שהמפרט ב־P-24 מציע, ושעדיין שורד ריענון ולשונית שנשכחה פתוחה.
 *     הטוקן הוא אישור נושא לכל מספר טלפון במסד; ריענון ⇒ מקלידים שוב.
 *  2. **שום פרט של ליד לא נכתב ל־`document.title`.** הכותרת מגיעה
 *     מ־`PAGE_META` בלבד. שם או טלפון בכותרת דולף להיסטוריית הדפדפן,
 *     לרשימת הלשוניות ולצילום מסך של מיתוג לשוניות.
 *
 * ‎`robots` הוא `noindex,nofollow` דרך `PAGE_META["/admin/leads"]`.
 * ‎`Disallow: /admin` ב־robots.txt הוא באחריות סוכן ה־SEO — מדווח.
 *
 * ─────────────────────────────────────────────────────────────────────
 *  אנליטיקה
 * ─────────────────────────────────────────────────────────────────────
 * ‎`lib/analytics.ts` אינו מיובא כאן, במכוון. אירוע שנורה ממסך שמציג מידע
 * אישי הוא הדרך הקצרה ביותר להעביר פרטי לקוח לצד שלישי בלי בסיס חוקי.
 */

import * as React from "react";
import { Head } from "@/components/seo/head";
import { Button, Field, Ltr, Money, Num, TextInput, fieldControlClass } from "@/components/primitives";
import { cn } from "@/lib/utils";
import { PAGE_META } from "@/lib/seo";
import { GUEST_BAND_LABELS, type GuestBand } from "@shared/lead-constants";
import {
  AdminError,
  LEAD_STATUSES,
  MIN_DENOMINATOR,
  TOKEN_MIN_LENGTH,
  UNATTRIBUTED,
  aggregateByChannel,
  channelKeyOf,
  channelLabel,
  clickIdOf,
  downloadCsv,
  formatDateTimeHe,
  formatEventDate,
  leadsToCsv,
  listLeads,
  patchLead,
  referrerHost,
  relativeTimeHe,
  todayStamp,
  type AdminLead,
  type AdminLeadPatch,
  type LeadStatus,
} from "@/lib/admin-client";

const META = PAGE_META["/admin/leads"];

/** תקרת השרת היא 500 לבקשה. `הצגת עוד` מוסיפה עמוד נוסף. */
const PAGE_SIZE = 200;

/* ═══════════════════ תוויות ═══════════════════ */

const STATUS_LABELS: Record<LeadStatus, string> = {
  new: "חדש",
  contacted: "יצרנו קשר",
  quoted: "נשלחה הצעה",
  won: "נסגר",
  lost: "אבוד",
  disqualified: "לא רלוונטי",
};

const PATH_LABELS: Record<string, string> = {
  quote_form: "טופס הצעה",
  wa_intent: "וואטסאפ",
  phone: "קליק על טלפון",
  menu_download: "הורדת תפריט",
  draft_upgrade: "טיוטה שהושלמה",
};

const SERVICE_FORMAT_LABELS: Record<string, string> = {
  delivery: "משלוח",
  buffet_on_site: "בופה במקום",
  plated_staffed: "הגשה עם צוות",
  at_restaurant: "במסעדה",
};

const CONTACT_CHANNEL_LABELS: Record<string, string> = {
  whatsapp: "וואטסאפ",
  phone: "טלפון",
  email: "מייל",
};

const DATE_FLAG_LABELS: Record<string, string> = {
  friday: "שישי",
  saturday: "שבת",
};

const guestBandLabel = (band: string | null): string | null =>
  band ? GUEST_BAND_LABELS[band as GuestBand] ?? band : null;

/* ═══════════════════ שער הטוקן ═══════════════════ */

/**
 * הטופס מחזיק את הטוקן שהוקלד ב־state מקומי ומוסר אותו כלפי מעלה פעם אחת.
 * ‎`type="password"` + `autoComplete="off"` — מנהל סיסמאות שישמור את הערך
 * הזה הופך אותו מזיכרון־בלבד לאישור מאוחסן, וזה בדיוק מה שנמנע כאן.
 */
function TokenGate({
  onUnlock,
  busy,
  error,
}: {
  onUnlock: (token: string) => void;
  busy: boolean;
  error: AdminError | null;
}) {
  const [value, setValue] = React.useState("");

  /* ‎503 היא תקלת שרת: הטופס לא יעזור, ולכן הוא מושבת ולא מבקש ניסיון נוסף. */
  const serverDown = error?.kind === "not_configured";

  return (
    <section className="sec">
      <div className="wrap">
        <p className="eyebrow m-0">ניהול</p>
        <h1 className="mt-5 max-w-measure text-2xl">לידים</h1>

        <p className="lede mt-4">
          המסך הזה מציג מספרי טלפון של לקוחות. הטוקן נשמר בזיכרון הדפדפן בלבד
          ונמחק בריענון הדף.
        </p>

        {error ? (
          <p
            role="alert"
            className="mt-7 max-w-body border-s-2 border-solid border-danger bg-bg-alt py-3 pe-4 ps-4 text-xs text-fg"
          >
            {error.message}
          </p>
        ) : null}

        {!serverDown ? (
          <form
            className="mt-8 grid max-w-[26rem] gap-5"
            onSubmit={(e) => {
              e.preventDefault();
              if (!busy) onUnlock(value);
            }}
          >
            <Field
              id="admin-token"
              label="טוקן גישה"
              hint={<>לפחות {TOKEN_MIN_LENGTH} תווים. הערך של ADMIN_TOKEN בשרת.</>}
              required
            >
              {(control) => (
                <TextInput
                  {...control}
                  type="password"
                  dir="ltr"
                  className="text-start"
                  value={value}
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  onChange={(e) => setValue(e.target.value)}
                />
              )}
            </Field>

            <div>
              <Button type="submit" loading={busy} loadingLabel="בודקים…">
                פתיחת הרשימה
              </Button>
            </div>
          </form>
        ) : null}
      </div>
    </section>
  );
}

/* ═══════════════════ שבב סינון ═══════════════════ */

function FilterChip({
  active,
  count,
  children,
  onClick,
}: {
  active: boolean;
  count?: number;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "inline-flex min-h-[44px] items-center gap-2 rounded-pill border border-solid px-4",
        "font-sans text-2xs font-semibold",
        "transition-[background-color,color,border-color] duration-state ease-house",
        active
          ? "border-btn-bg bg-btn-bg text-btn-fg"
          : "border-rule-control bg-transparent text-fg-muted hover:border-accent hover:text-accent",
      )}
    >
      <span>{children}</span>
      {count !== undefined ? (
        <Num inline className={active ? "text-btn-fg" : "text-fg-subtle"}>
          {count}
        </Num>
      ) : null}
    </button>
  );
}

/* ═══════════════════ שדה עובדה ברשומה ═══════════════════ */

/** תווית זעירה מעל הערך. ערך ריק ⇒ השדה כולו לא מרונדר (INV-2). */
function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  if (children === null || children === undefined || children === "") return null;
  return (
    <div className="m-0">
      <dt className="m-0 font-sans text-3xs font-semibold tracking-[.06em] text-fg-subtle">
        {label}
      </dt>
      <dd className="m-0 mt-[.15rem] font-sans text-xs text-fg">{children}</dd>
    </div>
  );
}

/* ═══════════════════ רשומת ליד ═══════════════════ */

/**
 * הרשומה נערמת בטלפון ונפרשת לארבעה טורים מיושרים ב־`lg`. הסדר בשני
 * המצבים זהה — זהות, מה האירוע, מאיפה הגיע, ומה עושים איתו.
 */
function LeadRecord({
  lead,
  now,
  onPatch,
}: {
  lead: AdminLead;
  now: number;
  onPatch: (id: string, patch: AdminLeadPatch) => Promise<void>;
}) {
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [valueDraft, setValueDraft] = React.useState("");
  const [reasonDraft, setReasonDraft] = React.useState("");

  const run = async (patch: AdminLeadPatch) => {
    setBusy(true);
    setError(null);
    try {
      await onPatch(lead.id, patch);
    } catch (e) {
      setError(e instanceof AdminError ? e.message : "העדכון נכשל.");
    } finally {
      setBusy(false);
    }
  };

  const tel = lead.phoneE164 ?? lead.phone;
  const eventDate = formatEventDate(lead.eventDate);
  const dateFlag = lead.dateFlag ? DATE_FLAG_LABELS[lead.dateFlag] ?? null : null;
  const channel = channelKeyOf(lead);
  const clickId = clickIdOf(lead);
  const host = referrerHost(lead.referrer);

  /* שדה הכסף נפתח רק אחרי שהסטטוס מצדיק אותו — הוא לא שדה קבוע בטופס. */
  const moneyField =
    lead.status === "quoted"
      ? { key: "quotedValueIls" as const, label: "שווי ההצעה, בשקלים", current: lead.quotedValueIls }
      : lead.status === "won"
        ? { key: "wonValueIls" as const, label: "שווי שנסגר, בשקלים", current: lead.wonValueIls }
        : null;

  const saveMoney = () => {
    const digits = valueDraft.replace(/[^\d]/g, "");
    if (!digits || !moneyField) return;
    const amount = Math.min(Number(digits), 10_000_000);
    if (!Number.isFinite(amount)) return;
    void run({ [moneyField.key]: amount } as AdminLeadPatch).then(() => setValueDraft(""));
  };

  const saveReason = () => {
    const reason = reasonDraft.trim().slice(0, 200);
    if (!reason) return;
    void run({ lostReason: reason }).then(() => setReasonDraft(""));
  };

  return (
    <li className="m-0 border-t border-solid border-[color:var(--rule)]">
      <div
        className={cn(
          "grid gap-5 py-6",
          "lg:grid-cols-[minmax(10rem,1fr)_minmax(9rem,1fr)_minmax(11rem,1.1fr)_minmax(13rem,1fr)]",
          "lg:gap-6",
          busy && "opacity-60",
        )}
      >
        {/* ───── מי ───── */}
        <div>
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h3 className="m-0 font-serif text-lg font-bold">
              {lead.name ?? <span className="text-fg-subtle">ללא שם</span>}
            </h3>
            {lead.isTest ? (
              <span className="rounded-pill border border-solid border-rule-control px-2 py-[.15rem] text-3xs font-semibold text-fg-subtle">
                בדיקה
              </span>
            ) : null}
          </div>

          <p className="m-0 mt-1 font-sans text-3xs text-fg-subtle">
            <Ltr className="num">{lead.ref}</Ltr>
            {" · "}
            <time dateTime={lead.createdAt} title={formatDateTimeHe(lead.createdAt)}>
              {relativeTimeHe(lead.createdAt, now)}
            </time>
          </p>

          {tel ? (
            <p className="m-0 mt-3">
              <a
                href={`tel:${tel}`}
                className="inline-flex min-h-[44px] items-center font-serif text-lg text-fg no-underline hover:text-accent"
              >
                <Ltr className="num">{lead.phone ?? tel}</Ltr>
              </a>
            </p>
          ) : (
            <p className="m-0 mt-3 font-sans text-xs text-fg-subtle">אין מספר טלפון</p>
          )}

          {lead.email ? (
            <p className="m-0 mt-1 font-sans text-xs">
              <a href={`mailto:${lead.email}`} className="text-fg-muted">
                <Ltr>{lead.email}</Ltr>
              </a>
            </p>
          ) : null}
        </div>

        {/* ───── מה ───── */}
        <dl className="m-0 grid content-start gap-3">
          <Fact label="אירוע">{lead.eventType}</Fact>
          <Fact label="סועדים">{guestBandLabel(lead.guestBand)}</Fact>
          <Fact label="תאריך">
            {eventDate ? (
              <>
                <Num>{eventDate}</Num>
                {dateFlag ? <span className="text-fg-subtle"> · {dateFlag}</span> : null}
              </>
            ) : lead.dateFlexible ? (
              "עוד לא נקבע"
            ) : null}
          </Fact>
          <Fact label="אזור">{lead.area}</Fact>
          <Fact label="הגשה">
            {lead.serviceFormat
              ? SERVICE_FORMAT_LABELS[lead.serviceFormat] ?? lead.serviceFormat
              : null}
          </Fact>
          <Fact label="ערוץ מועדף">
            {lead.contactChannel
              ? CONTACT_CHANNEL_LABELS[lead.contactChannel] ?? lead.contactChannel
              : null}
          </Fact>
          <Fact label="הערות">{lead.notes}</Fact>
        </dl>

        {/* ───── מאיפה ─────
            הבלוק הזה הוא כל הסיבה שקיימת שכבת הייחוס. אם הוא לא קריא,
            הקמפיינים נמדדים בהרגשה. */}
        <div className="border-s-2 border-solid border-[color:var(--rule)] ps-4">
          <p className="m-0 font-sans text-3xs font-semibold tracking-[.06em] text-fg-subtle">
            ייחוס
          </p>

          <p className="m-0 mt-1 font-sans text-xs font-semibold text-fg">
            {channel === UNATTRIBUTED ? (
              <span className="font-normal text-fg-subtle">ללא ייחוס</span>
            ) : (
              channelLabel(channel)
            )}
          </p>

          <dl className="m-0 mt-3 grid gap-2">
            <Fact label="קמפיין">{lead.utmCampaign}</Fact>
            <Fact label="מדיום">{lead.utmMedium}</Fact>
            <Fact label="מונח">{lead.utmTerm}</Fact>
            <Fact label="מודעה">{lead.utmContent}</Fact>
            <Fact label="מסלול">{PATH_LABELS[lead.path] ?? lead.path}</Fact>
            <Fact label="דף הפנייה">{lead.sourcePage}</Fact>
            <Fact label="דף נחיתה">
              {lead.landingPage && lead.landingPage !== lead.sourcePage ? lead.landingPage : null}
            </Fact>
            <Fact label="הגיע מ">{host}</Fact>
            <Fact label="מזהה קליק">
              {clickId ? <Ltr className="num">{clickId.name}</Ltr> : null}
            </Fact>
          </dl>
        </div>

        {/* ───── מה עושים איתו ───── */}
        <div className="grid content-start gap-3">
          <div>
            <label
              htmlFor={`status-${lead.id}`}
              className="block font-sans text-3xs font-semibold tracking-[.06em] text-fg-subtle"
            >
              סטטוס
            </label>
            <select
              id={`status-${lead.id}`}
              dir="rtl"
              value={lead.status}
              disabled={busy}
              onChange={(e) => void run({ status: e.target.value as LeadStatus })}
              className={cn(fieldControlClass, "mt-[.3rem]")}
            >
              {LEAD_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABELS[s]}
                </option>
              ))}
            </select>
          </div>

          {lead.statusChangedAt ? (
            <p className="m-0 font-sans text-3xs text-fg-subtle">
              עודכן {relativeTimeHe(lead.statusChangedAt, now)}
            </p>
          ) : null}

          {moneyField ? (
            <div>
              <label
                htmlFor={`value-${lead.id}`}
                className="block font-sans text-3xs font-semibold tracking-[.06em] text-fg-subtle"
              >
                {moneyField.label}
              </label>
              <div className="mt-[.3rem] flex gap-2">
                <input
                  id={`value-${lead.id}`}
                  dir="ltr"
                  inputMode="numeric"
                  autoComplete="off"
                  disabled={busy}
                  placeholder={moneyField.current != null ? String(moneyField.current) : ""}
                  value={valueDraft}
                  onChange={(e) => setValueDraft(e.target.value)}
                  className={cn(fieldControlClass, "num text-end")}
                />
                <Button size="sm" variant="ghost" onClick={saveMoney} disabled={busy}>
                  שמירה
                </Button>
              </div>
              {moneyField.current != null ? (
                <p className="m-0 mt-1 font-sans text-3xs text-fg-subtle">
                  נשמר: <Money value={moneyField.current} />
                </p>
              ) : null}
            </div>
          ) : null}

          {lead.status === "lost" ? (
            <div>
              <label
                htmlFor={`reason-${lead.id}`}
                className="block font-sans text-3xs font-semibold tracking-[.06em] text-fg-subtle"
              >
                למה אבד
              </label>
              <div className="mt-[.3rem] flex gap-2">
                <input
                  id={`reason-${lead.id}`}
                  dir="auto"
                  maxLength={200}
                  autoComplete="off"
                  disabled={busy}
                  placeholder={lead.lostReason ?? ""}
                  value={reasonDraft}
                  onChange={(e) => setReasonDraft(e.target.value)}
                  className={fieldControlClass}
                />
                <Button size="sm" variant="ghost" onClick={saveReason} disabled={busy}>
                  שמירה
                </Button>
              </div>
              {lead.lostReason ? (
                <p className="m-0 mt-1 font-sans text-3xs text-fg-subtle">{lead.lostReason}</p>
              ) : null}
            </div>
          ) : null}

          {error ? (
            <p role="alert" className="m-0 font-sans text-3xs text-danger">
              {error}
            </p>
          ) : null}
        </div>
      </div>
    </li>
  );
}

/* ═══════════════════ סיכום לפי ערוץ ═══════════════════ */

/**
 * ‎§P-24: אגרגציה ברמת **ערוץ** ולא ברמת קמפיין, ויחס שמכנהו קטן
 * מ־`MIN_DENOMINATOR` מוצג כ־`—`. הבחירה הזאת ארכיטקטונית ולא קוסמטית:
 * אחוז סגירה על מדגם זעיר הוא מספר שמזיז תקציב לכיוון הלא נכון.
 *
 * הטבלה כאן היא `<table>` אמיתי — הנתונים באמת טבלאיים, ויש להם גלילה
 * אופקית משלהם כדי שגוף העמוד לא יזוז לרוחב.
 */
function ChannelSummary({ rows }: { rows: AdminLead[] }) {
  const agg = React.useMemo(() => aggregateByChannel(rows), [rows]);
  if (agg.length === 0) return null;

  const pct = (v: number | null) => (v === null ? "—" : `${Math.round(v * 100)}%`);

  return (
    <details className="mt-sec-tight border-t border-solid border-[color:var(--rule)] pt-6">
      <summary className="cursor-pointer font-sans text-sm font-semibold text-fg">
        סיכום לפי ערוץ
      </summary>

      <p className="mt-3 max-w-body font-sans text-3xs text-fg-subtle">
        לידי בדיקה מוחרגים. יחס שמבוסס על פחות מ־{MIN_DENOMINATOR} פניות מוצג
        כקו — הוא עדיין לא אומר כלום.
      </p>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[38rem] border-collapse text-start font-sans text-xs">
          <thead>
            <tr className="border-b border-solid border-[color:var(--fg)]">
              <th scope="col" className="py-2 pe-4 text-start font-semibold">ערוץ</th>
              <th scope="col" className="py-2 pe-4 text-start font-semibold">פניות</th>
              <th scope="col" className="py-2 pe-4 text-start font-semibold">הצעות</th>
              <th scope="col" className="py-2 pe-4 text-start font-semibold">נסגרו</th>
              <th scope="col" className="py-2 pe-4 text-start font-semibold">אבודים</th>
              <th scope="col" className="py-2 pe-4 text-start font-semibold">אחוז סגירה</th>
              <th scope="col" className="py-2 text-start font-semibold">שנסגר</th>
            </tr>
          </thead>
          <tbody>
            {agg.map((row) => (
              <tr key={row.key} className="border-b border-solid border-[color:var(--rule)]">
                <th scope="row" className="py-2 pe-4 text-start font-normal">
                  {row.labelHe}
                </th>
                <td className="py-2 pe-4"><Num>{row.leads}</Num></td>
                <td className="py-2 pe-4"><Num>{row.quoted}</Num></td>
                <td className="py-2 pe-4"><Num>{row.won}</Num></td>
                <td className="py-2 pe-4"><Num>{row.lost}</Num></td>
                <td className="py-2 pe-4">
                  {row.closeRate === null ? (
                    <span className="text-fg-subtle">—</span>
                  ) : (
                    <Num>{pct(row.closeRate)}</Num>
                  )}
                </td>
                <td className="py-2">
                  {row.wonValueIls > 0 ? (
                    <Money value={row.wonValueIls} />
                  ) : (
                    <span className="text-fg-subtle">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}

/* ═══════════════════ העמוד ═══════════════════ */

export default function AdminLeads() {
  /* הטוקן. `null` = נעול. אין קריאה ל־storage בשום ענף. */
  const [token, setToken] = React.useState<string | null>(null);
  const [rows, setRows] = React.useState<AdminLead[] | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<AdminError | null>(null);
  const [exhausted, setExhausted] = React.useState(false);

  const [statusFilter, setStatusFilter] = React.useState<LeadStatus | "all">("all");
  const [sourceFilter, setSourceFilter] = React.useState<string>("all");

  /* «לפני 3 דקות» שלא מתעדכן הוא שקר שקט אחרי רבע שעה. */
  const [now, setNow] = React.useState(() => Date.now());
  React.useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(id);
  }, []);

  const unlocked = rows !== null;

  /**
   * טוען עמוד. `append` מוסיף לתחתית; אחרת מחליף.
   *
   * ‎401 **נועל את המסך**: הטוקן שהוחזק בזיכרון אינו תקף יותר (הוחלף בשרת,
   * או הוקלד שגוי מלכתחילה), ולהמשיך להחזיק אותו זה להחזיק אישור מת.
   */
  const load = React.useCallback(
    async (activeToken: string, append: boolean) => {
      setBusy(true);
      setError(null);
      try {
        const offset = append ? rows?.length ?? 0 : 0;
        const page = await listLeads(activeToken, { limit: PAGE_SIZE, offset });
        /* עימוד לפי offset על רשימה שממוינת לפי createdAt יורד: ליד שנקלט
           בין שתי הבקשות מזיז את החלון ומחזיר שורה שכבר מוצגת. בלי הסינון
           הזה מתקבלים שני `key` זהים ב־React, והשורה נראית כפולה למי שעובד. */
        setRows((prev) => {
          if (!append || !prev) return page;
          const seen = new Set(prev.map((r) => r.id));
          return [...prev, ...page.filter((r) => !seen.has(r.id))];
        });
        setExhausted(page.length < PAGE_SIZE);
        setToken(activeToken);
      } catch (e) {
        const err = e instanceof AdminError ? e : new AdminError("bad_response");
        setError(err);
        if (err.kind === "unauthorized" || err.kind === "token_too_short") {
          setToken(null);
          setRows(null);
        }
      } finally {
        setBusy(false);
      }
    },
    [rows],
  );

  const applyPatch = React.useCallback(
    async (id: string, patch: AdminLeadPatch) => {
      if (!token) throw new AdminError("unauthorized", 401);
      const updated = await patchLead(token, id, patch);
      setRows((prev) => (prev ? prev.map((r) => (r.id === id ? updated : r)) : prev));
    },
    [token],
  );

  const lock = () => {
    setToken(null);
    setRows(null);
    setError(null);
    setStatusFilter("all");
    setSourceFilter("all");
  };

  /* ── נגזרות ── */

  const all = rows ?? [];

  const statusCounts = React.useMemo(() => {
    const counts = Object.fromEntries(LEAD_STATUSES.map((s) => [s, 0])) as Record<LeadStatus, number>;
    for (const lead of all) counts[lead.status] = (counts[lead.status] ?? 0) + 1;
    return counts;
  }, [all]);

  const sources = React.useMemo(() => {
    const counts = new Map<string, number>();
    for (const lead of all) {
      const key = channelKeyOf(lead);
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return [...counts.entries()]
      .map(([key, count]) => ({ key, count, label: channelLabel(key) }))
      .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, "he"));
  }, [all]);

  const visible = React.useMemo(
    () =>
      all.filter(
        (lead) =>
          (statusFilter === "all" || lead.status === statusFilter) &&
          (sourceFilter === "all" || channelKeyOf(lead) === sourceFilter),
      ),
    [all, statusFilter, sourceFilter],
  );

  const filtered = statusFilter !== "all" || sourceFilter !== "all";
  const unmarked = statusCounts.new ?? 0;

  /* ── נעול ── */

  if (!unlocked || !token) {
    return (
      <>
        <Head meta={META} />
        <TokenGate onUnlock={(t) => void load(t, false)} busy={busy} error={error} />
      </>
    );
  }

  /* ── פתוח ── */

  return (
    <>
      <Head meta={META} />

      <section className="pb-sec-tight pt-[clamp(2rem,5vw,3.5rem)]">
        <div className="wrap">
          {/* ───── כותרת ופעולות ───── */}
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow m-0">ניהול</p>
              <h1 className="mt-3 text-2xl">לידים</h1>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button size="sm" variant="ghost" onClick={() => void load(token, false)} disabled={busy}>
                רענון
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => downloadCsv(leadsToCsv(visible), `leads-${todayStamp()}.csv`)}
                disabled={visible.length === 0}
              >
                ייצוא CSV
              </Button>
              <Button size="sm" variant="ghost" onClick={lock}>
                נעילה
              </Button>
            </div>
          </div>

          {/* ───── מונה הריקבון ─────
              המספר שמפריע. לידים שלא סומנו הם התור שנשכח, וזה הכשל היחיד
              שמסך כזה קיים כדי למנוע. */}
          <p className="mt-6 font-sans text-sm text-fg">
            {unmarked > 0 ? (
              <>
                <Num className="text-lg font-bold">{unmarked}</Num> לידים לא מסומנים
              </>
            ) : (
              "כל הלידים סומנו."
            )}
            <span className="text-fg-subtle">
              {" · "}
              <Num inline>{all.length}</Num> נטענו
            </span>
          </p>

          {error ? (
            <p
              role="alert"
              className="mt-5 max-w-body border-s-2 border-solid border-danger bg-bg-alt py-3 pe-4 ps-4 text-xs text-fg"
            >
              {error.message}
            </p>
          ) : null}

          {/* ───── סינון ───── */}
          <div className="mt-8 grid gap-4 border-t border-solid border-[color:var(--rule)] pt-6">
            <div>
              <p className="m-0 font-sans text-3xs font-semibold tracking-[.06em] text-fg-subtle">
                סטטוס
              </p>
              <div role="group" aria-label="סינון לפי סטטוס" className="mt-2 flex flex-wrap gap-2">
                <FilterChip
                  active={statusFilter === "all"}
                  count={all.length}
                  onClick={() => setStatusFilter("all")}
                >
                  הכול
                </FilterChip>
                {LEAD_STATUSES.map((s) => (
                  <FilterChip
                    key={s}
                    active={statusFilter === s}
                    count={statusCounts[s] ?? 0}
                    onClick={() => setStatusFilter(s)}
                  >
                    {STATUS_LABELS[s]}
                  </FilterChip>
                ))}
              </div>
            </div>

            {sources.length > 1 ? (
              <div>
                <p className="m-0 font-sans text-3xs font-semibold tracking-[.06em] text-fg-subtle">
                  ערוץ
                </p>
                <div role="group" aria-label="סינון לפי ערוץ" className="mt-2 flex flex-wrap gap-2">
                  <FilterChip
                    active={sourceFilter === "all"}
                    onClick={() => setSourceFilter("all")}
                  >
                    כל הערוצים
                  </FilterChip>
                  {sources.map((s) => (
                    <FilterChip
                      key={s.key}
                      active={sourceFilter === s.key}
                      count={s.count}
                      onClick={() => setSourceFilter(s.key)}
                    >
                      {s.label}
                    </FilterChip>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          {/* ───── התור ───── */}
          {busy && all.length === 0 ? (
            <p role="status" className="mt-10 font-sans text-sm text-fg-subtle">
              טוענים לידים…
            </p>
          ) : all.length === 0 ? (
            <div className="mt-10 max-w-body">
              <h2 className="text-xl">עוד לא נקלט אף ליד</h2>
              <p className="mt-3 font-sans text-xs text-fg-muted">
                כל פנייה מהאתר תופיע כאן — טופס ההצעה, קליק לוואטסאפ וקליק על
                מספר הטלפון. הרשימה נטענת מחדש בכל כניסה למסך.
              </p>
            </div>
          ) : visible.length === 0 ? (
            <div className="mt-10 max-w-body">
              <h2 className="text-xl">אין לידים שתואמים לסינון</h2>
              <p className="mt-3 font-sans text-xs text-fg-muted">
                <Num inline>{all.length}</Num> לידים נטענו, ואף אחד מהם לא נכנס
                לסינון הנוכחי.
              </p>
              <div className="mt-5">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setStatusFilter("all");
                    setSourceFilter("all");
                  }}
                >
                  ניקוי הסינון
                </Button>
              </div>
            </div>
          ) : (
            <>
              <ul className="m-0 mt-8 list-none p-0">
                {visible.map((lead) => (
                  <LeadRecord key={lead.id} lead={lead} now={now} onPatch={applyPatch} />
                ))}
              </ul>

              <div className="mt-8 flex flex-wrap items-center gap-4 border-t border-solid border-[color:var(--rule)] pt-6">
                {!exhausted ? (
                  <Button
                    size="sm"
                    variant="ghost"
                    loading={busy}
                    loadingLabel="טוענים…"
                    onClick={() => void load(token, true)}
                  >
                    הצגת עוד
                  </Button>
                ) : null}
                <p className="m-0 font-sans text-3xs text-fg-subtle">
                  {filtered ? (
                    <>
                      מוצגים <Num inline>{visible.length}</Num> מתוך{" "}
                      <Num inline>{all.length}</Num> שנטענו
                    </>
                  ) : (
                    <>
                      <Num inline>{all.length}</Num> לידים נטענו
                      {exhausted ? ", וזה הכול" : ""}
                    </>
                  )}
                </p>
              </div>

              <ChannelSummary rows={all} />
            </>
          )}
        </div>
      </section>
    </>
  );
}
