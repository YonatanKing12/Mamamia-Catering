# 02 — Lead Machine Spec

**מאמא מיה קייטרינג** · conversion, capture, attribution, notification, measurement.
Status: normative. Where this document conflicts with existing code, this document wins and the code changes.

Scope: everything between "a visitor is on a page" and "a branch manager is on the phone with them, and we know which page produced the call." Visual/typographic rules live in `01-design-system.md`; route inventory and SEO live in `03-architecture.md`. This document owns the quote builder, the price policy, the four conversion paths, the WhatsApp handoff, the schema, the notification path, the admin view, and the analytics taxonomy.

---

## 0. Preconditions — blocking, ship before any of this

These are not part of the lead machine. They are the reason the lead machine cannot ship on top of the current tree. Each is a deletion, needs no owner input, and must land in its own commit *before* any work below.

| # | Action | Files (verified at HEAD) |
|---|---|---|
| P1 | Delete every kashrut assertion | `hero.tsx:24,70`, `footer.tsx:68`, `story.tsx:24`, `faq-data.ts:21-29`, `terms.tsx:118,121`, `terms.tsx:98` |
| P2 | Delete fabricated testimonials + hardcoded platform ratings | `testimonials.tsx:2-21` (3 invented names), `:63-95` (`Google 4.9/5 · 247`, `Facebook 4.8/5 · 189`), `:34` |
| P3 | Delete every invented price and the whole pricing engine | `price-calculator.tsx:29-48,75,173-189`, `events.tsx:9,16,23,30`, `menu-data.ts`, `contact.tsx:230-233` (budget bands) |
| P4 | Delete invented statistics | `story.tsx:34-53,67-74`, `footer.tsx:12`, `blog-data.ts:16`, `blog-post.tsx:91`, `gallery-data.ts:17` |
| P5 | Delete invented identity/commitments | `privacy.tsx:161` (named DPO), `terms.tsx:24,40,57,59,64-67,77-80,156,188,198`, `contact.tsx:50,283,302` (24h / 24/7), `faq-data.ts:12,66-72` |
| P6 | Replace the placeholder phone/WhatsApp number with a build-gated config | 8 files / 14 occurrences of `052-123-4567`; 4 of `wa.me/972521234567` |

**CI gate (add with P1):**

```
# scripts/check-honesty.sh — exits non-zero on any hit
rg -n 'בד"ץ|מהדרין|כשר|25 שנות|אלפי לקוחות|4\.9|247 ביקורות' client/src && exit 1
rg -n '₪\s*[0-9]' client/src --glob '!client/src/config/**' && exit 1
rg -n '[\x{0600}-\x{06FF}]' client/src && exit 1          # Arabic chars in Hebrew strings
rg -n '\d\s*[–—]\s*\d' client/src && exit 1               # bidi-reversing numeric ranges
rg -n '\bml-|\bmr-|\bpl-|\bpr-|\bleft-|\bright-|text-left|text-right|space-x-|divide-x-' client/src/components && exit 1
exit 0
```

The last three lines are not cosmetic. `\d–\d` renders **reversed** in RTL (`25–200` displays as `200–25`), which on a guest-band selector is a consumer-facing misstatement. The design reference's own builder markup at `index.html:369-372` ships `25–50`, `50–100`, `100–200` — **all four options are currently wrong and must be rewritten to Hebrew connector form** (§3.4).

---

## 1. Conversion architecture

### 1.1 The four paths, ranked

| # | Path | Primary on | Data destination | Why it exists |
|---|---|---|---|---|
| 1 | **Quote builder** → server row → WhatsApp thread | every route except `/urgent`, `/shiva` | `leads` (`path='quote'`) | Owns the structured data and the attribution. The only path that survives a missed call. |
| 2 | **WhatsApp direct** (prefilled, ref-coded, server-committed) | `/urgent`, `/shiva`; sticky mobile bar everywhere | `leads` (`path='whatsapp'`) | Israel's default business channel. Async, works at 22:40, no business-hours failure. |
| 3 | **Phone** (`tel:`) | `/urgent`, `/shiva` only | `call_events` via DID, else unattributed | Mourning and same-day intent converts on a human voice in seconds. Elsewhere demoted to a text link. |
| 4 | **Menu / summary PDF** (see §1.4 — *there is no PDF*) | nowhere | `leads` (`path='menu'`) only if gated | Low-commitment, long cycle. |

**Hard layout rules.** Max one *filled* primary CTA per viewport. Max two visible CTAs at once. Phone is a text link, never a filled button, except on `/urgent` and `/shiva`. Every path writes to the same `leads` table with a `path` discriminator so they can be compared in one query — this is why we do **not** use a separate `whatsapp_intents` table.

The current hero renders three equal-weight buttons at the highest-attention moment on the page (`hero.tsx:88-115`). That is choice paralysis and it is the single largest structural leak on the site today.

### 1.2 Hero CTA block — exact spec

```
[ קבלו הצעה ב־4 שאלות ]        ← filled, --ink bg, scrolls to #quote
  בואו לטעום הערב במסעדה        ← ghost/text link, scrolls to #taste
  או בטלפון 09-XXXXXXX          ← plain text link, tel: with E.164 href
```

Note line beneath, built from clause-pruning Slots — **each unfilled token removes only its own clause, not the line**:

```
תשובה תוך {{RESPONSE_TIME}} · מ־{{MIN_GUESTS}} ועד {{MAX_GUESTS}} סועדים · שלושה מטבחים
```

If `RESPONSE_TIME` and `MAX_GUESTS` are unset, the line renders as `שלושה מטבחים` — the one clause that is a fact we hold. If every clause is empty the line does not render. See §7 for the `<Slot>` contract.

### 1.3 CTA verb policy

Banned: `הזמינו עכשיו`, `הזמינו אירוע עכשיו` (currently in hero, header desktop + mobile, and the calculator result). "Order now" is a transactional verb on a ₪10k+ considered purchase whose buyer's dominant fear is being locked in.

Approved labels, exhaustive:

- `קבלו הצעה ב־4 שאלות` — primary, everywhere
- `בדקו זמינות לתאריך שלכם` — date-led variant, `/events/*`
- `בואו לטעום` / `בואו לטעום הערב במסעדה` — tasting path
- `דברו איתנו בוואטסאפ` — WhatsApp
- `שלחו לי הצעה` — builder submit
- `עדיף לי בוואטסאפ` — builder secondary submit
- `הלאה` / `← חזרה` — builder nav

On mobile the primary CTA sits at the **top** of the nav drawer, above the nav items. It currently sits below six of them, outside thumb reach.

### 1.4 The menu PDF question — decided: no PDF

Do not build a gated menu PDF download. Three reasons, in order of weight:

1. **Accessibility law.** ת"י 5568 חלק 2 covers digital documents. A PDF menu is a fourth legally-exposed surface with no test harness. Publish the menu as HTML — that is already the winning direction's section 02.
2. **It is a fourth path.** The ceiling is three; a fourth dilutes by competing for the same click.
3. **The honest substitute is stronger.** The site's low-commitment path is "come eat it tonight in one of three restaurants," which requires no gate, no email capture, and no invented fact.

What ships instead: the **print stylesheet** (`@media print`) turns sections 01–02 into a single-colour A4 menu, and the confirmation view (§3.9) is a printable/shareable menu card. `window.print()` behind a text link labelled `הדפיסו את התפריט`, fires `menu_print` (§11), captures nothing, gates nothing.

If the owner later insists on a gated PDF: one field (phone only), `path='menu'`, and it must never become the primary CTA on any route.

### 1.5 Route-level register inversion

On `/urgent`, `/catering/business` and `/shiva` the menu is **not** the hero. Section order inverts: operational facts (cutoff time, minimum, delivery window, one phone number) above the fold, menu below.

| Route | Primary path | Secondary | Builder pre-seed |
|---|---|---|---|
| `/` | quote builder | tasting | none |
| `/catering/business` | quote builder | WhatsApp | `eventType='אירוע חברה'` |
| `/urgent` | **phone** (filled) | WhatsApp (filled) | builder collapsed below fold |
| `/shiva` | **phone** (filled, single number, no ₪ anywhere) | WhatsApp | no builder, no estimate, no calculator |
| `/venue/{branch}`, `/kitchens/{branch}` | quote builder | branch WhatsApp | `area` = that branch's area |
| `/pasta-bar`, `/catering/dairy` | quote builder | tasting | `eventType` unset |

`/shiva` ships only if the owner supplies a truthful per-branch kashrut statement (§14). It carries no price, no calculator, no "celebrate/event" vocabulary, no upsell, and no marketing-consent checkbox.

**Pre-seed rule, non-negotiable:** a value seeded from the route is rendered **visible and editable** on step 1, never hidden. A forwarded `/catering/business` link otherwise silently writes a mislabelled lead. The builder starts at step 2 when step 1 is pre-seeded, and step 1 remains reachable via `← חזרה`.

---

## 2. Price-estimate policy

### 2.1 The rule

The site may display a **range**, never a single number, and only after the owner has explicitly approved rates. Default state is: **no estimate renders at all.**

A single computed shekel figure is a quasi-quote. When the real quote differs the buyer feels baited, and under `ס' 2(א) לחוק הגנת הצרכן` a figure presented adjacent to an action that reads as acceptance can reach `מסוימות` and become an offer. The current `price-calculator.tsx` does exactly this: a bold `₪{total}` captioned `המחיר כולל את כל המנות והשירותים שבחרתם` directly above a `הזמינו עכשיו` button.

### 2.2 The mechanism — unset by default, three independent locks

`client/src/config/pricing.ts` — the **only** file in `client/` permitted to contain a `₪` figure or a numeric rate (the CI gate in §0 whitelists this path and nothing else):

```ts
/**
 * מחירון — ריק בכוונה.
 * כל עוד אחד מהשדות null, מסך הערכת המחיר אינו נרנדר בכלל.
 * אין למלא כאן מספר שלא אושר בכתב על ידי הבעלים.
 */
export interface PricingConfig {
  /** טווח לסועד בשקלים, כולל מע"מ. שני הערכים חייבים להיות מוגדרים. */
  perPerson: { min: number | null; max: number | null };
  /** תאריך המחירון שאושר, ISO. ההערכה לא תוצג בלי זה. */
  approvedAt: string | null;
  /** התנאים שבהם הטווח תקף — נדרש, מוצג באותו גודל טקסט כמו המספר. */
  conditions: string | null;
  /** עיגול ההערכה לכפולות של: */
  roundTo: number;
}

export const PRICING: PricingConfig = {
  perPerson: { min: null, max: null },
  approvedAt: null,
  conditions: null,
  roundTo: 100,
};

/** שלושה מנעולים בלתי תלויים. כל אחד מהם לבד מבטל את התצוגה. */
export function estimateEnabled(p: PricingConfig = PRICING): boolean {
  return (
    typeof p.perPerson.min === "number" &&
    typeof p.perPerson.max === "number" &&
    p.perPerson.min > 0 &&
    p.perPerson.max >= p.perPerson.min &&
    typeof p.approvedAt === "string" &&
    p.approvedAt.length === 10 &&
    typeof p.conditions === "string" &&
    p.conditions.trim().length > 0
  );
}
```

Three locks, not one, because the failure mode is a developer filling `perPerson` from a phone call and forgetting the qualifier. Without `approvedAt` there is no date to print; without `conditions` there is no qualifier to print; either omission suppresses the whole block.

### 2.3 Rendering, when enabled

```tsx
// EstimateRange.tsx — returns null unless all three locks pass
if (!estimateEnabled() || !band) return null;
const lo = round(band.min * PRICING.perPerson.min!, PRICING.roundTo);
const hi = round(band.max * PRICING.perPerson.max!, PRICING.roundTo);
```

Markup and copy — the qualifier is the **same type size and colour** as the figure, and sits **above** it:

```
טווח מחירים משוער
{{PRICING.conditions}}                     ← same size, same weight, above
‹span dir="ltr"›8,000 – 14,000 ₪‹/span›   ← tabular-nums, LTR-wrapped
מבוסס על מחירון {{approvedAt}}. הערכה בלבד ואינה הצעה מחייבת.
המחיר הסופי ייקבע בהצעה בכתב לאחר בירור פרטי האירוע.
```

Bidi: the numeric range **must** be inside `<span dir="ltr">`. `<bdi>` does not fix it — an isolate is substituted by U+FFFC (class ON) and the runs still mirror. `Intl.NumberFormat.formatRange` also reverses. Only an LTR container works.

### 2.4 Adjacency rule

No estimate output may sit in the same viewport as any control that could read as acceptance. The estimate appears on builder step 5; the only actions in that viewport are `שלחו לי הצעה` and `עדיף לי בוואטסאפ` — both requests, neither an order. No payment field, no `הזמינו`, ever on the same screen as a figure.

### 2.5 Guest-band lower bound

If `MIN_GUESTS` is set and the visitor picks the band below it, show an **honest downgrade** rather than proceeding silently:

```
מתחת ל־{{MIN_GUESTS}} סועדים קייטרינג מלא פשוט לא משתלם לכם.
נשמח להציע מגשי אירוח מהמסעדה — זה יוצא מאותו מטבח.
```

The lead is still captured (`path='quote'`, `guest_band='<min'`) — a small order is a real customer and a future referral. If `MIN_GUESTS` is unset, this block does not render and no band is treated as too small.

### 2.6 Bands above `MAX_GUESTS`

If `MAX_GUESTS` is set, any band whose floor exceeds it is not rendered as an option. If unset, all bands render. Never publish a capacity figure that is not owner-signed — a guessed capacity is an operational commitment against three restaurants' reputations.

---

## 3. The quote builder

Component: `client/src/components/quote/QuoteBuilder.tsx`. One component, used by every route, initial state from props.

### 3.1 Shape and the PII boundary

**5 screens: 4 questions + 1 contact screen. 8 inputs. All PII confined to screen 5.**

Ordering law, enforced in review: sort fields by (information value to the kitchen) ÷ (perceived risk to the buyer), descending, and **never place a PII field above a non-PII field**. Abandonment on screens 1–4 costs a data point; abandonment on screen 5 costs a lead. The current form does the exact inverse — `name` is field 1 and `phone` is field 2 of an 8-field single screen (`contact.tsx`).

Progress label: `שאלה {n} מתוך 4` for screens 1–4, then `פרטים ליצירת קשר` for screen 5. Discrete steps, never a percentage.

Progress bar: **fills right-to-left.** A left-filling bar in an RTL page reads as regressing. Implement as `inset-inline-start: auto; inset-inline-end: 0; inline-size: {pct}%` inside the track, or `transform-origin: right`.

### 3.2 Screen 1 — סוג האירוע (no PII)

Legend: `איזה אירוע?`
Chips (radio, not `<select>` — a native select costs a tap and reads bureaucratic; six tiles maximum):

| Value stored | Label |
|---|---|
| `אירוע חברה` | אירוע חברה |
| `שמחה פרטית` | שמחה פרטית |
| `אירוח משפחתי או חג` | אירוח משפחתי או חג |
| `יום כיף או כנס` | יום כיף או כנס |
| `אירוח אצלנו במסעדה` | אירוח אצלנו במסעדה |
| `משהו אחר` | משהו אחר |

`אירוח אצלנו במסעדה` exists only because three real venues exist. It is a revenue line the current site does not offer at all, and it is the cheapest keyword cluster in the map (`מסעדה לאירוע פרטי`, `סגירת מסעדה לאירוע`) because the caterer-vs-caterer bidding war does not touch it.

Required. Pre-seeded and **visibly selected** when the route supplies it.

### 3.3 Screen 2 — מספר סועדים (no PII)

Legend: `כמה סועדים, בערך?`
Helper: `אפשר לשנות אחר כך — אנחנו יודעים שהמספר הסופי מתגבש ברגע האחרון.`

Segmented bands, **never a number input**. A free number invites false precision the buyer does not have, summons the wrong mobile keyboard, and is mutable by scroll wheel. It also removes the current contradiction where the client caps at `max="500"` while the server accepts 5000 — silently telling a 600-guest buyer we cannot help.

| `guest_band` stored | Label (bidi-safe) | min | max |
|---|---|---|---|
| `<25` | `עד 25` | 1 | 25 |
| `25-50` | `בין 25 ל־50` | 25 | 50 |
| `50-100` | `בין 50 ל־100` | 50 | 100 |
| `100-200` | `בין 100 ל־200` | 100 | 200 |
| `200+` | `200 ומעלה` | 200 | null |

The labels use Hebrew connectors (`בין X ל־Y`) and the maqaf U+05BE, **not** an en-dash. `בין 25 ל־50` renders correctly; `25–50` renders as `50–25`. The stored `guest_band` value uses an ASCII hyphen (safe, never displayed) so it is a stable analytics dimension.

Required. Selecting `עד 25` triggers §2.5 and still advances.

### 3.4 Screen 3 — תאריך (no PII)

Legend: `מתי?`
Field label: `תאריך האירוע`
Escape hatch, mandatory: `☐ התאריך עוד לא נקבע`
Helper: `אם זה בימים הקרובים — כתבו. יש לנו שלושה מטבחים, לפעמים זה מסתדר.`

That helper is the only place on the site where three kitchens converts directly into a booking, and a single-kitchen caterer cannot write it.

Not required — either a date or the checkbox, or neither, and the visitor may still advance. Date is the highest-signal qualifier and costs one tap, but forcing it on a buyer who is comparison-shopping six months out loses the lead.

**Do not use native `<input type="date">`.** It renders LTR with device-dependent locale inside an RTL page. Use an RTL-aware picker with `dir="ltr"` on the text field and `text-align: start` overridden to right, or three `inputMode="numeric"` selects (day / month / year). Store as ISO `YYYY-MM-DD` in `event_date`.

Date-derived behaviour — **no price effect.** Delete the 15% weekend surcharge (`price-calculator.tsx:75`); it is invented, and `new Date(x).getDay()` parses as UTC and misclassifies Friday/Saturday for Israeli users near midnight anyway. Instead a Friday / Shabbat / chag-adjacent date sets `date_flag` on the lead row and changes the **follow-up copy**, not the number:

```
התאריך שבחרתם הוא ערב שבת. אנחנו עובדים בערבי שבת — נאשר לכם שעת הגשה מדויקת בשיחה.
```

Never build a fake availability API. `בדקו זמינות לתאריך שלכם` is honest as a CTA label because it starts the human process that checks. A synthetic green/red answer would be an invented business fact.

### 3.5 Screen 4 — אזור (no PII)

Legend: `איפה האירוע?`

| `area` stored | Label | Routes to `branch` |
|---|---|---|
| `הרצליה / רמת השרון` | הרצליה / רמת השרון | `herzliya` |
| `רעננה / כפר סבא / הוד השרון` | רעננה / כ״ס / הוד השרון | `raanana` |
| `פתח תקווה / גוש דן` | פתח תקווה / גוש דן | `petah_tikva` |
| `תל אביב` | תל אביב | `{{TA_DEFAULT}}` — owner slot |
| `אחר` | אזור אחר | `null` |

**The UI answers by naming the serving kitchen.** On selection, an inline line appears:

```
המטבח שלנו ברעננה מבשל את האירוע הזה — {{ADDR_RAANANA}}.
```

This is the single largest unclaimed mechanic in the category: no caterer in the Sharon or Gush Dan uses branch selection as an ordering mechanic. It costs one lookup and converts the differentiator from a claim into the product.

`אחר` shows: `נבדוק הובלה ונגיד לכם ישר, לפני שתשקיעו בזה זמן.` — and does **not** name a kitchen. Note `אחר` uses gershayim-free plain Hebrew; `כ״ס` uses U+05F4.

Required. `כ״ס` in the label is display-only; the stored value is spelled out for analytics legibility.

### 3.6 Screen 5 — פרטים (the only PII screen)

Legend: `לאן נחזור אליכם?`

Order within the screen:

1. **Estimate block** — renders only per §2.2. Above the fields, so the buyer gets something for their effort before being asked for anything.
2. **Brief card** — every prior answer echoed back, editable by clicking through to that step. Micro-commitment made visible; also the mechanism that catches a mis-seeded `eventType`.
3. `שם` — `autoComplete="name"`, required, 2–80 chars.
4. `טלפון` — `type="tel" dir="ltr" inputMode="tel" autoComplete="tel"`, required, with `text-align: right` and `input[dir=ltr]::placeholder { direction: rtl; text-align: right }` so the Hebrew placeholder stays right while typed digits run LTR.
5. **Contact-channel toggle** — `איך נוח לכם? ( וואטסאפ / שיחה )`, default `וואטסאפ`. Stored in `contact_channel`.
6. `אימייל` — **collapsed**, optional, framed as `הצעה כתובה לשלוח למישהו נוסף?` — which reframes the field from surveillance to utility and names the second decision-maker.
7. **Collection notice** — inside the form component, above the submit button. Static text, no modal, no interaction. See §3.10.
8. **Marketing consent** — one checkbox, **unchecked**, optional, never a condition of submitting. See §3.10.
9. **Submit row** — `שלחו לי הצעה` (filled) + `עדיף לי בוואטסאפ` (WhatsApp-green outline).
10. **Commercial-terms strip** — deposit / cancellation / final-headcount deadline, all Slots, collapses entirely if empty. See §3.11.

**Dropped fields, deliberately.**

- **תקציב** — deleted. Highest-abandonment field in event catering: the buyer does not know the answer, it feels like being sized for a markup, and it is maximally threatening to someone spending a committee's money. Its qualifying function is fully served by `guest_band` × `event_type` × `area`. If the owner needs it for triage, infer it server-side. This also removes four more invented ₪ strings (`contact.tsx:230-233`).
- **פרטים נוספים (free text)** — moved to **after** submission, on the confirmation view, as optional enrichment. High value to the kitchen, high friction to the buyer, therefore asked post-commitment. Placeholder there: `טבעונים, אלרגיות, שעת הגשה מדויקת, חניה — כל דבר שיחסוך שיחה.`
- **אלרגיות as a pre-submit prompt** — never. The current placeholder (`contact.tsx:252`) actively solicits `מידע רפואי`, which is `מידע בעל רגישות מיוחדת` under תיקון 13. That one string reclassifies a marketing lead table as a health database, raises the security tier and the per-subject penalty exposure. Collect dietary data **after booking**, over the operational channel, into the event file — not into `leads`.

Notice line, required: `הטופס מיועד לבני 18 ומעלה. אין למסור כאן מידע רפואי או פרטים של אנשים אחרים.` This is enforceable by design, unlike the current privacy page's unenforceable claim that we do not collect minors' data.

### 3.7 Validation, auto-advance, back navigation, keyboard

**Validation timing.** Per-screen, on advance attempt only. Never on blur while typing.

| Screen | Rule | Failure behaviour |
|---|---|---|
| 1 | one chip selected | 300ms shake on the fieldset, focus first chip, message `בחרו סוג אירוע כדי להמשיך.` |
| 2 | one band selected | same, `בחרו מספר סועדים משוער.` |
| 3 | none | advances freely |
| 4 | one area selected | same, `בחרו אזור כדי שנדע איזה מטבח מבשל.` |
| 5 | name 2–80; phone passes shape check | inline `role="alert"` under the field + `setFocus()` on the first invalid |

Exact Hebrew field errors:

- `צריך שם, כדי שנדע למי לחזור.`
- `המספר לא נראה תקין — בדקו שוב.`
- `כתובת המייל לא נראית תקינה.`
- submit failure: `השליחה לא עברה. נסו שוב, או פשוט התקשרו — {{PHONE}}.`

**Phone validation must normalise before it validates.** The current server regex rejects real input: `+972-054-1234567`, parenthesised forms, and — critically in an RTL page — pasted numbers carrying U+200E/U+200F directional marks or non-breaking spaces. Server-side, in this order:

```ts
function normalisePhone(raw: string): string | null {
  const cleaned = raw.replace(/[‎‏ \s()\-.]/g, "");
  const digits = cleaned.startsWith("+") ? cleaned : cleaned;
  const m = /^(?:\+?972|0)(\d{8,9})$/.exec(digits);
  return m ? `+972${m[1]}` : null;
}
```

Store `phone` (raw, for the owner to read) **and** `phone_e164` (normalised). Without E.164 every enhanced-conversions upload and every call-record join is a silent no-match with no error surfaced anywhere. The regex stays only as a shape check after normalisation.

**Auto-advance.** Selecting a chip on screens 1, 2, 4 advances after **220ms**. Screen 3 does not auto-advance (a date is typed, not tapped). Auto-advance is suppressed if the visitor arrived at that screen via `← חזרה` in this session — otherwise a buyer trying to *change* an answer gets bounced forward before they can see it. Track with a `visitedForward: Set<number>`.

**Back navigation.** `← חזרה` visible on screens 2–5, hidden on 1. Preserves all state. Does not reset validation. Also reachable by clicking any row of the brief card on screen 5. The browser back button does **not** step the builder — it navigates the route (do not push history per step; a five-entry history trap on mobile is worse than the friction it saves).

**Keyboard.** `Enter` on screens 1–4 acts as `הלאה`, never as submit — the form's `onKeyDown` intercepts and calls `next()`. On screen 5, `Enter` submits. Arrow keys move between chips within a radiogroup: this requires `<DirectionProvider dir="rtl">` at the app root if any Radix primitive is used, because Radix reads direction from its own prop or that context and **never** from `<html dir="rtl">` — otherwise ArrowRight/ArrowLeft are inverted on every chip group in the builder.

**Focus management.** On advance, move focus to the new screen's `<legend>` (`tabIndex={-1}`), and announce the step via the `aria-live="polite"` progress label. Never trap focus in the builder — it is inline content, not a dialog.

### 3.8 Reassurance copy

Directly under the submit button:

```
לא שולחים ניוזלטר ולא מעבירים את הפרטים לאף אחד.
שיחה או וואטסאפ אחד בנוגע לאירוע — וזה הכל.
```

Second line, Slot-gated:

```
בדרך כלל חוזרים {{RESPONSE_TIME}}.
```

**These are factual commitments.** They must match `privacy.tsx` and actual CRM behaviour or they become a fresh honesty violation. If the owner will not confirm "no newsletter, no data sharing," the first line does not ship. `RESPONSE_TIME` is a Slot — never default to `24 שעות`, which is a losing SLA in this category and the easiest claim for a disappointed lead to screenshot.

### 3.9 Confirmation view — a conversion stage, not a thank-you

The current handler shows a toast and calls `form.reset()`. The buyer's screen returns to an empty form and they hold nothing they can show anyone. Replace with a full view that swaps out the builder:

```
קיבלנו.
מספר פנייה: MM-7F3K2Q

‹brief card — their answers echoed back›

הפנייה נשלחה למטבח בהרצליה פיתוח. {{OWNER_NAME_OR_ROLE}} יחזור אליכם
ב{{contact_channel}} — {{RESPONSE_TIME}}.

[ המשיכו בוואטסאפ ]          ← dominant filled button, thread prefilled with the brief
  הדפיסו / שתפו את הסיכום     ← window.print() + Web Share / copy link
  משהו שכדאי שנדע? [textarea]  ← optional post-commitment enrichment, PATCHes the row
  בואו לטעום הערב במסעדה →     ← tasting invitation
```

Three things make this the highest-leverage 30 seconds on the site:

1. **`הפנייה נשלחה למטבח בהרצליה פיתוח`** — the branch routing stated as fact at the moment of conversion. No competitor can say it.
2. **The dominant WhatsApp button.** The form owns the data; WhatsApp owns the conversation. Ending at a toast loses the conversation; ending at a bare `wa.me` loses the data. This ordering gets both.
3. **The shareable summary** turns the buyer into our advocate with their spouse / committee / CFO. That person is a second click we would otherwise never get.

**Render the summary as a menu card, not an invoice.** A document that looks like a quote invites price negotiation; a document that looks like a menu invites approval. Same content — spec, inclusions, exclusions, terms strip, ref code, cooking kitchen's address — set as a menu leaf with hairline rules and tabular figures.

**Implementation of the summary URL:** render it client-side from confirmation state behind `?ref=MM-7F3K2Q`, reading from `GET /api/quote/:ref` (see §5.4). Do **not** build `/סיכום/:ref` as a percent-encoded Hebrew-slug route with server-rendered head — a Hebrew slug encodes to ~9 URL characters per letter, breaking UTM builders, CRM fields and print collateral. If it later earns a route, use ASCII: `/summary/:ref`.

Print discipline for that view: `@page { margin: 14mm }`, grain layer off, sticky bar and nav `display:none`, `break-inside: avoid` on every table row, `print-color-adjust: exact` so hairlines survive, ref code and kitchen address in the top block.

### 3.10 Legal blocks inside the form component

Both live **inside** `QuoteBuilder`, not beside it, and `sourcePage` is a **required prop**. This is what makes it structurally impossible for the eighth landing page, written under deadline, to ship a bare form.

**Collection notice** (`סעיף 11`, as expanded by תיקון 13). Static text above submit, always visible, no interaction:

```
המידע נמסר מרצונכם ואין חובה חוקית למסור אותו; בלי שם וטלפון לא נוכל לחזור
אליכם עם הצעה. המידע נשמר אצל {{LEGAL_ENTITY}}, ח.פ. {{COMPANY_ID}}, בעל
השליטה במאגר, ומשמש רק כדי לחזור אליכם בנוגע לפנייה ולהכין הצעת מחיר. נגישים
אליו מי שמטפל בהזמנות בשלוש המסעדות וספק התוכנה שמאחסן את האתר. אתם רשאים
לעיין במידע שעליכם ולבקש לתקן או למחוק אותו: {{PRIVACY_CONTACT}}.
הרחבה: [מדיניות הפרטיות].
```

`LEGAL_ENTITY`, `COMPANY_ID` and `PRIVACY_CONTACT` are **build-blocking** Slots — they throw at production build if unset. This is the one place a placeholder is not merely sloppy but a defective statutory notice.

**Marketing consent** — one checkbox, unchecked, optional, non-blocking:

```
☐ אני מאשר/ת שמאמא מיה תשלח לי הצעות ועדכונים על קייטרינג בוואטסאפ,
   ב־SMS או במייל. ניתן להסיר את ההסכמה בכל הודעה.
```

**Zero required checkboxes.** Do not add `אני מאשר/ת את מדיניות הפרטיות` as a gate — Israeli law does not require it, it is widely mis-sold by website vendors as a תיקון 13 requirement, and it costs a click for no legal protection. The lawful basis for handling the enquiry is the voluntary submission plus the notice above.

The marketing checkbox is not optional to *build*. `חוק הספאם` (`ס' 30א לחוק התקשורת`) grants statutory damages up to **₪1,000 per message** with no proof of damage and is the standard vehicle for Israeli class actions. A lead machine that collects 5,000 phone numbers and later blasts a Rosh Hashana offer to all of them without per-row consent is exposed to five or six figures. `consent_marketing` must exist in the schema **before the first lead is collected** — retrofitting consent to already-collected rows is impossible.

Store `consent_text_version` (a hash or version tag of the exact string shown) so the wording is provable a year later.

### 3.11 Commercial-terms strip

Under the submit button, above the fold of the confirmation. Compact, hairline table, all Slots, collapses entirely if empty:

| | |
|---|---|
| מקדמה | `{{DEPOSIT_TERMS}}` |
| ביטול | `{{CANCELLATION_TERMS}}` |
| שינוי מספר סועדים עד | `{{HEADCOUNT_DEADLINE}}` |
| תוקף ההצעה | `{{QUOTE_VALIDITY}}` |

Nothing raises an accountable buyer's confidence faster than seeing these **before** committing, because they are exactly the facts they will be asked to defend. `CANCELLATION_TERMS` must be drafted as the two-tier clause that grants the statutory distance-selling minimum first (14 days from the transaction, provided the cancellation is at least two non-rest days before the service, fee capped at 5% or ₪100 whichever is lower) and only then adds contractual tiers for the window the statute does not cover. The current `terms.tsx:77-79` ladder purports to deny a statutory right, which is itself a `ס' 2` misleading act and a `תנאי מקפח`.

Note `faq-data.ts:66-72` and `terms.tsx:77-79` currently publish **two contradicting** cancellation policies (24h vs 72h). Both must be replaced by one Slot rendered from one source: `client/src/content/legal.ts`.

### 3.12 `client/src/content/legal.ts` — single source of approved claim strings

```ts
export const LEGAL = {
  PRICE_ESTIMATE_NOTE: null as string | null,
  VAT_NOTE: null as string | null,
  KASHRUT_BY_BRANCH: { herzliya: null, raanana: null, petah_tikva: null } as Record<string, string | null>,
  ALLERGEN_NOTE: null as string | null,
  CANCELLATION_SUMMARY: null as string | null,
  RESPONSE_TIME: null as string | null,
  MIN_GUESTS: null as number | null,
  MAX_GUESTS: null as number | null,
} as const;
```

The price and testimonial components **refuse to render without the corresponding note prop**. A new city page then physically cannot ship a number without its qualifier — the failure mode of a twelve-page site is a copy-paste of the claim without the caveat, and this is the only structural defence against it.

---

## 4. The WhatsApp engineering problem

### 4.1 The requirement

Commit the lead to the server **before** the browser leaves for WhatsApp, key it to the conversation, and attribute it — without an `await` and without an unload handler.

### 4.2 Why the two obvious approaches both fail

- **`await fetch()` then `window.open()`** — Safari/iOS blocks the open as a popup, because the user-gesture token expires the moment the promise yields. This is the single most likely way an implementer breaks this feature.
- **`navigator.sendBeacon` / `fetch(keepalive)` from `unload` / `beforeunload` / `pagehide`** — documented as unreliable and specifically failing on iOS; mobile browsers frequently never fire those events. Israeli catering traffic is heavily iPhone.

### 4.3 The answer: client-generated ref code, fire-and-forget POST, same-tick navigation

`client/src/lib/whatsapp.ts`:

```ts
import { WA_NUMBER } from "@/config/contact";
import { attributionSnapshot } from "@/lib/attribution";
import { track } from "@/lib/analytics";

const ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ"; // no 0/O/1/I — read aloud on the phone

export function newRef(): string {
  const b = new Uint8Array(6);
  crypto.getRandomValues(b);
  return "MM-" + [...b].map((x) => ALPHABET[x % 32]).join("");
}

export interface WaPayload {
  path: "whatsapp";
  waLocation: "hero" | "sticky" | "footer" | "quote_alt" | "branch" | "urgent";
  branch?: "herzliya" | "raanana" | "petah_tikva" | null;
  eventType?: string; guestBand?: string; eventDate?: string; area?: string;
  name?: string; phone?: string;
  answers?: Record<string, unknown>;
}

/**
 * חשוב: אין await לפני הניווט. הוספת await תשבור וואטסאפ ב־iOS.
 * ה־POST הוא fire-and-forget והלקוח מתעלם מהתשובה לחלוטין.
 */
export function openWhatsApp(p: WaPayload): string {
  const ref = newRef();
  const text = buildHebrewMessage(p, ref);
  const url = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`;

  fetch("/api/wa-intent", {
    method: "POST",
    keepalive: true,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ref, ...p, ...attributionSnapshot(), pageUrl: location.href }),
  }).catch(() => {});                                  // never blocks, never throws

  track("whatsapp_handoff", { lead_ref: ref, wa_location: p.waLocation, branch: p.branch ?? null });

  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  if (isMobile) {
    window.location.href = url;                        // same tab, same tick
  } else {
    window.open(`https://web.whatsapp.com/send?phone=${WA_NUMBER}&text=${encodeURIComponent(text)}`,
                "_blank", "noopener");                 // sync open inside the gesture is fine
  }
  return ref;                                          // shown on screen immediately
}
```

Rules that must be written as comments in the file, because each will be "optimised" away otherwise:

1. **No `await` precedes the navigation.** Add a test that fails if `await` appears between the `fetch` call and the navigation in this module.
2. **No `target="_blank"` on mobile.** After the OS hands off to the WhatsApp app, a blank tab is left behind and reads as a broken site.
3. **Never a bare `wa.me` href anywhere on the site.** Every WhatsApp CTA routes through this one function. Grep gate: `rg 'wa\.me' client/src --glob '!client/src/lib/whatsapp.ts'` must return nothing.
4. **The client ignores the response.** A 429 or a 500 on `/api/wa-intent` must never prevent the redirect.

### 4.4 The prefilled message

Written in **first person as the customer** — the customer is the sender, and a business-voiced message reads as a bot.

```
היי, הגעתי מהאתר ורוצה הצעה לקייטרינג.

סוג האירוע: אירוע חברה
מספר סועדים: בין 50 ל־100
תאריך משוער: 15/09/2026
אזור: הרצליה / רמת השרון
סניף מועדף: הרצליה פיתוח

מספר פנייה:
MM-7F3K2Q
```

Constraints:

- **Budget: ≤ 300 Hebrew characters.** Hebrew inflates ~4.9× under `encodeURIComponent` (every Hebrew char is 2 UTF-8 bytes → `%D7%90`, 6 URL chars). 300 Hebrew chars ≈ 1,500 encoded, total URL under ~1,600 — safely inside every practical intent ceiling. Unit test: `expect(encodeURIComponent(buildHebrewMessage(worstCase, ref)).length).toBeLessThan(1600)`.
- The message carries a **summary plus the ref code**, never the full builder transcript. Full answers live in Postgres, retrieved by ref.
- Omit any line the visitor did not answer. Never `לא צוין`.
- Ref code on its **own final line** so LTR digits do not scramble surrounding Hebrew.
- `encodeURIComponent` only — never hand-build the query with `+` for spaces. Newlines encode to `%0A`, verified working.
- **No ₪ figure may ever enter the prefilled text.** A number that travels into WhatsApp becomes a written, timestamped, customer-retained quote from the business. Until the owner supplies real rates, the message carries answers and a request only.

### 4.5 Branch-named prefill

The WhatsApp button in each branch column of section 03, and on each `/kitchens/{branch}` page, prefills `סניף מועדף: {branch}` and passes `branch` so the row arrives pre-routed. The confirmation can then honestly say `הפנייה נשלחה למטבח בהרצליה פיתוח`.

### 4.6 Phase 2 — Cloud API, and the one thing that promotes it to launch-blocking

**Phase 1 (launch, zero dependencies):** plain `wa.me` + commit-before-redirect + ref code shown on screen. The ref code is human-readable so restaurant staff can match a chat to a DB row manually.

**Phase 2 (when volume justifies):** Meta Cloud API webhook fills `wa_id`, `wa_profile_name`, `first_inbound_at`, `ctwa_clid` automatically. The Phase-1 schema is already Phase-2-shaped, so Phase 2 adds one route and zero migrations.

`POST /api/wa/webhook` (+ `GET` for Meta's `hub.challenge`, + HMAC-SHA256 verification of `X-Hub-Signature-256` — the endpoint is public). Handler: regex `/MM-[2-9A-HJ-NP-Z]{6}/` over `messages[0].text.body`; on match, `UPDATE leads SET wa_id, wa_profile_name, first_inbound_at = now(), ctwa_clid = COALESCE(...) WHERE ref = $1`. On no match, still insert a bare row (`path='whatsapp_organic'`) so nothing is lost.

**`first_inbound_at IS NULL` is the most valuable metric on the site:** WhatsApp clicks that never became conversations. Without Phase 2 it stays null forever and the business optimises toward clicks rather than leads.

**The promotion trigger:** click-to-WhatsApp ads bypass the website entirely — no `wa.me` link, no site JS. `ctwa_clid` arrives **only** in the Cloud API inbound webhook's `referral` object, and only on the first message. If the owner intends to run CTWA ads on Facebook/Instagram — very likely for catering in Israel — Cloud API stops being Phase 2 and becomes a launch prerequisite for that campaign.

**Coexistence warning, operational not technical:** registering an existing WhatsApp Business app number on Cloud API is destructive and one-way — it deletes message history and locks the number out of the Business app. Meta's "Coexistence" avoids this but is region-gated. The owner must confirm in writing that Coexistence is available for Israel on the chosen BSP **before anyone touches the live number**. Never run the direct migration path on the number printed on the website.

### 4.7 Free-message economics

All replies a business sends inside the 24-hour window opened by a customer's inbound message are **free** and need no template. Cost appears only when the business initiates or re-engages after 24h, which requires a pre-approved template. Catering leads always message first and quoting happens inside 24h — so the recurring cost is the BSP platform fee, not Meta messaging. Approve templates for exactly two cases: a follow-up nudge to a lead quiet >24h (MARKETING category, requires stored consent per §3.10) and an event-date reminder for a booked customer (UTILITY). Build no broadcast list.

---

## 5. Partial capture and abandonment recovery

### 5.1 Draft persistence — three layers

**Layer 1: localStorage, immediate.** Every answer writes `mm_quote_draft` = `{ draftId, step, answers, updatedAt }`. On mount, if a draft is <7 days old, restore it and show:

```
המשכנו מאיפה שעצרתם. [להתחיל מחדש]
```

**Layer 2: anonymous server draft, on step completion.** `POST /api/quote/draft` with `{ draftId (client UUID), step, answers, attribution }` after each of steps 1–4. Upserts on `draftId`.

**Hard constraint: no PII may enter a draft payload.** Only step 1–4 answers, which are all enumerated values plus a date. The free-text `note` field does not exist pre-submit (§3.6), and nothing from step 5 is ever drafted. Nothing is sent before the consent state is known.

**Layer 3: upgrade on submit.** `POST /api/quote` carries the same `draftId`; the server upgrades the draft row in place to a full lead (`path='quote'`, `status='new'`) rather than inserting a second row. Drafts that never upgrade are the abandonment funnel.

### 5.2 What drafts buy

1. **Resume on return** — a real conversion win on mobile, where the buyer is interrupted.
2. **Step-level abandonment analytics** — tells you exactly which question kills people. `quote_step_complete` (§11) gives the same signal client-side; the draft row gives it server-side and survives ad-blockers.
3. **Visibility into demand we are not capturing** — 40 abandoned drafts all selecting `אחר` on the area question is a delivery-radius decision, not a UX bug.

### 5.3 Recovery — what we do and do not do

**We do:** surface abandoned drafts in the admin view (§9) as an "unconverted interest" panel, aggregate only — event type, band, area, date, timestamp. The owner sees demand shape, not people.

**We do not:** contact an abandoned draft. There is no PII to contact, by design, and any attempt to attach identity to a pre-consent draft is precisely the scope creep the honesty and privacy constraints forbid.

**Partial WhatsApp handoffs** are a different case and are recoverable: they *are* full lead rows with a ref code (§4.3), just without a name. They appear in the admin worklist as `unmatched WhatsApp intents, last 72h` — the prefill shows event type / band / area, making the manual match to an incoming chat obvious.

### 5.4 Draft retention

Drafts purge at 30 days unconverted. Leads purge at `{{LEAD_RETENTION_MONTHS}}` (owner Slot, no default) unconverted, enforced by a nightly job, hard delete:

```sql
DELETE FROM quote_drafts WHERE updated_at < now() - interval '30 days';
DELETE FROM leads WHERE purge_after < now() AND converted_at IS NULL;
```

Soft-delete flags make retention theatre. Log only the count deleted, never the rows. Per-subject penalty structure under תיקון 13 means leads deleted on schedule are leads not counted — the retention job is a risk-reduction measure, not just hygiene.

---

## 6. Schema — literal additions to `shared/schema.ts`

### 6.1 Decisions taken

- **One table, not two.** WhatsApp intents live in the same table as form leads, discriminated by `path`. A separate `whatsapp_intents` table keeps DB constraints stricter but makes the one query the owner actually needs — "leads by channel, by page, this month" — a union. Strictness is preserved at the route boundary by per-channel zod schemas, which is where it belongs.
- **`name` and `phone` become nullable.** A WhatsApp intent's whole value is that the visitor has not typed either yet. Required-ness is enforced per path in zod, not by `NOT NULL`.
- **Rename `contact_submissions` → `leads`** with a Drizzle migration, keeping the old table as a view for one release if anything reads it.
- **Every new column is nullable with no `NOT NULL`.** `MemoryStorage.createContactSubmission` builds rows field-by-field explicitly; every added column needs a matching `?? null` line there or the default dev path silently drops attribution and the types drift.
- **A comment guarding the privacy threshold** sits above the table, so a future developer does not assume a PPA filing exists.

### 6.2 The code

```ts
import { sql } from "drizzle-orm";
import {
  pgTable, text, varchar, timestamp, integer, boolean, jsonb, pgEnum, index,
} from "drizzle-orm/pg-core";
import { z } from "zod";

/* ═════════════════ enums ═════════════════ */

export const leadPathEnum = pgEnum("lead_path", [
  "quote",              // 4-question builder, full submit
  "whatsapp",           // WhatsApp handoff from the site
  "whatsapp_organic",   // inbound WhatsApp with no matching ref (Phase 2)
  "phone",              // manually logged from a call
  "menu",               // gated menu download, if ever built
  "walk_in",            // manually logged in-restaurant enquiry
  "manual",             // anything the owner types in by hand
]);

export const leadStatusEnum = pgEnum("lead_status", [
  "new",          // untouched
  "working",      // someone has picked it up
  "quoted",       // a written quote went out
  "qualified",    // quote sent + tasting/site visit booked → the Ads-optimisable event
  "won",          // booked and paid deposit
  "lost",         // lost, with a reason
  "disqualified", // spam, wrong region, out of scope
]);

export const branchEnum = pgEnum("branch", ["herzliya", "raanana", "petah_tikva"]);

export const contactChannelEnum = pgEnum("contact_channel", ["whatsapp", "phone", "email"]);

/* ═════════════════ leads ═════════════════ */

/**
 * מאגר הלידים.
 *
 * חובת הודעה לרשות להגנת הפרטיות קמה רק במאגר עם מידע בעל רגישות מיוחדת
 * על 100,000 נושאי מידע ומעלה — לא חל כאן. אם הטבלה חוצה ~50,000 שורות,
 * או אם מתווסף שדה של מידע רפואי/דתי, יש להעביר לבדיקת יעוץ משפטי.
 * אין להוסיף שדה שמזמין מידע רפואי (אלרגיות) לטבלה הזו — הוא מעלה את
 * רמת האבטחה הנדרשת ואת חשיפת העיצום הכספי.
 */
export const leads = pgTable(
  "leads",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),

    /* ── מזהה אנושי, מוצג ללקוח ומופיע בהודעת הוואטסאפ ── */
    ref: varchar("ref", { length: 12 }).notNull().unique(),

    /* ── מי ── (nullable: ליד וואטסאפ נוצר לפני שהוקלד שם) */
    name: text("name"),
    phone: text("phone"),                                  // raw, as typed — for dialling
    phoneE164: text("phone_e164"),                         // +9725XXXXXXXX — for uploads/joins
    phoneSha256: text("phone_sha256"),                     // enhanced conversions
    email: text("email"),
    emailSha256: text("email_sha256"),
    contactChannel: contactChannelEnum("contact_channel"),

    /* ── מה ── */
    eventType: text("event_type"),
    guestBand: text("guest_band"),                         // '<25' | '25-50' | … | '200+'
    guestCount: integer("guest_count"),                    // only if a human later refines it
    eventDate: text("event_date"),                         // ISO YYYY-MM-DD
    dateFlexible: boolean("date_flexible").default(false),
    dateFlag: text("date_flag"),                           // 'friday' | 'shabbat' | 'chag_adjacent'
    area: text("area"),
    branch: branchEnum("branch"),
    serviceFormat: text("service_format"),                 // 'delivery' | 'staffed' | 'at_restaurant'
    answers: jsonb("answers"),                             // full builder state, forward-compatible
    notes: text("notes"),                                  // post-submit enrichment + owner notes

    /* ── מאיפה ── */
    path: leadPathEnum("path").notNull(),
    sourcePage: text("source_page"),                       // '/catering/business'
    landingPage: text("landing_page"),                      // first page of the session
    referrer: text("referrer"),
    waLocation: text("wa_location"),                        // hero | sticky | footer | quote_alt | branch
    utmSource: text("utm_source"),
    utmMedium: text("utm_medium"),
    utmCampaign: text("utm_campaign"),
    utmTerm: text("utm_term"),
    utmContent: text("utm_content"),
    utmId: text("utm_id"),
    firstTouchSource: text("first_touch_source"),
    firstTouchAt: timestamp("first_touch_at", { withTimezone: true }),
    touchCount: integer("touch_count"),

    /* ── מזהי קליק ── (gbraid/wbraid arrive INSTEAD of gclid on iOS, never alongside) */
    gclid: text("gclid"),
    gbraid: text("gbraid"),
    wbraid: text("wbraid"),
    fbclid: text("fbclid"),
    msclkid: text("msclkid"),
    ttclid: text("ttclid"),
    clickIdCapturedAt: timestamp("click_id_captured_at", { withTimezone: true }),

    /* ── GA4 stitching ── */
    gaClientId: text("ga_client_id"),
    gaSessionId: text("ga_session_id"),

    /* ── וואטסאפ ── */
    waId: text("wa_id"),                                    // Phase 2, from webhook = their phone
    waProfileName: text("wa_profile_name"),
    ctwaClid: text("ctwa_clid"),                            // click-to-WhatsApp ads only
    firstInboundAt: timestamp("first_inbound_at", { withTimezone: true }),
    firstReplyAt: timestamp("first_reply_at", { withTimezone: true }),

    /* ── הסכמות ── */
    consentMarketing: boolean("consent_marketing").notNull().default(false),
    consentMarketingAt: timestamp("consent_marketing_at", { withTimezone: true }),
    consentAnalytics: boolean("consent_analytics"),
    consentAdUserData: boolean("consent_ad_user_data"),
    consentTextVersion: text("consent_text_version"),
    noticeVersion: text("notice_version"),

    /* ── צינור המכירה ── */
    status: leadStatusEnum("status").notNull().default("new"),
    statusChangedAt: timestamp("status_changed_at", { withTimezone: true }),
    statusChangedBy: text("status_changed_by"),              // token fingerprint, not a name
    lostReason: text("lost_reason"),
    quotedValueIls: integer("quoted_value_ils"),
    wonValueIls: integer("won_value_ils"),
    wonAt: timestamp("won_at", { withTimezone: true }),
    convertedAt: timestamp("converted_at", { withTimezone: true }),

    /* ── תפעול ── */
    draftId: varchar("draft_id", { length: 40 }),
    stepsCompleted: integer("steps_completed"),
    timeToCompleteMs: integer("time_to_complete_ms"),
    notifiedAt: timestamp("notified_at", { withTimezone: true }),
    notifyAttempts: integer("notify_attempts").notNull().default(0),
    adsUploadStatus: text("ads_upload_status"),              // pending|uploaded|skipped_*|expired_window|failed
    adsUploadedAt: timestamp("ads_uploaded_at", { withTimezone: true }),
    isTest: boolean("is_test").notNull().default(false),
    duplicateOf: varchar("duplicate_of"),
    purgeAfter: timestamp("purge_after", { withTimezone: true }),

    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    createdIdx: index("leads_created_idx").on(t.createdAt),
    statusIdx: index("leads_status_idx").on(t.status),
    pathIdx: index("leads_path_idx").on(t.path),
    branchIdx: index("leads_branch_idx").on(t.branch),
    purgeIdx: index("leads_purge_idx").on(t.purgeAfter),
  }),
);

/* ═════════════════ quote_drafts ═════════════════ */

/** אין PII כאן. אף פעם. רק תשובות מתוך רשימה סגורה ותאריך. */
export const quoteDrafts = pgTable(
  "quote_drafts",
  {
    draftId: varchar("draft_id", { length: 40 }).primaryKey(),
    step: integer("step").notNull().default(1),
    eventType: text("event_type"),
    guestBand: text("guest_band"),
    eventDate: text("event_date"),
    area: text("area"),
    sourcePage: text("source_page"),
    utmSource: text("utm_source"),
    utmCampaign: text("utm_campaign"),
    upgradedLeadId: varchar("upgraded_lead_id"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({ updatedIdx: index("drafts_updated_idx").on(t.updatedAt) }),
);

/* ═════════════════ lead_events ═════════════════ */

/** יומן append-only. מאפשר לשחזר מעברי סטטוס ולנסות שוב העלאות שנכשלו. */
export const leadEvents = pgTable(
  "lead_events",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    leadId: varchar("lead_id").notNull(),
    eventName: text("event_name").notNull(),   // generate_lead | working_lead | qualify_lead | close_convert_lead | …
    payload: jsonb("payload"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({ leadIdx: index("lead_events_lead_idx").on(t.leadId) }),
);

/* ═════════════════ call_events ═════════════════ */

export const callEvents = pgTable("call_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  providerCallId: text("provider_call_id"),
  fromE164: text("from_e164"),
  toDid: text("to_did"),                       // which swapped DID rang → channel
  channelLabel: text("channel_label"),         // 'google_ads' | 'meta' | 'organic_direct'
  durationSeconds: integer("duration_seconds"),
  answered: boolean("answered"),
  matchedLeadId: varchar("matched_lead_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

/* ═════════════════ zod, per path ═════════════════ */
/* NOTE: this file must NOT be imported from client code — it drags drizzle-orm
   (45.5 KB raw / 13.5 KB gzip, measured) into the browser bundle and publishes
   the table DDL in a public JS file. Client validation lives in
   shared/lead-schema.ts, which imports zod only. */

const phoneShape = /^\+972(?:[23489]\d{7}|5\d{8}|7\d{8})$/;   // applied AFTER normalisation

export const quoteLeadSchema = z.object({
  ref: z.string().regex(/^MM-[2-9A-HJ-NP-Z]{6}$/),
  name: z.string().trim().min(2, "צריך שם, כדי שנדע למי לחזור.").max(80),
  phone: z.string().trim().min(9).max(25),
  email: z.string().trim().email("כתובת המייל לא נראית תקינה.").max(120).optional().or(z.literal("")),
  contactChannel: z.enum(["whatsapp", "phone"]).default("whatsapp"),
  eventType: z.string().trim().min(2).max(60),
  guestBand: z.enum(["<25", "25-50", "50-100", "100-200", "200+"]),
  eventDate: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/).optional().or(z.literal("")),
  dateFlexible: z.boolean().default(false),
  area: z.string().trim().max(60),
  consentMarketing: z.boolean().default(false),
  consentTextVersion: z.string().max(40).optional(),
  draftId: z.string().max(40).optional(),
  stepsCompleted: z.coerce.number().int().min(1).max(5).optional(),
  timeToCompleteMs: z.coerce.number().int().min(0).max(3_600_000).optional(),
});

export const waIntentSchema = z.object({
  ref: z.string().regex(/^MM-[2-9A-HJ-NP-Z]{6}$/),
  waLocation: z.enum(["hero", "sticky", "footer", "quote_alt", "branch", "urgent"]),
  branch: z.enum(["herzliya", "raanana", "petah_tikva"]).nullish(),
  eventType: z.string().trim().max(60).optional(),
  guestBand: z.string().trim().max(20).optional(),
  eventDate: z.string().trim().max(20).optional(),
  area: z.string().trim().max(60).optional(),
  name: z.string().trim().max(80).optional(),
  phone: z.string().trim().max(25).optional(),
});

/* ── attribution, shared by both paths ──
   UTM and referrer are attacker-controlled strings that WILL be rendered in an
   owner-facing view. Whitelist the charset and cap the length at ingest. */
const utmValue = z.string().trim().max(120).regex(/^[\w\-. |/]*$/u).optional();

export const attributionSchema = z.object({
  sourcePage: z.string().trim().max(200).optional(),
  landingPage: z.string().trim().max(200).optional(),
  referrer: z.string().trim().max(300).optional(),
  utmSource: utmValue, utmMedium: utmValue, utmCampaign: utmValue,
  utmTerm: utmValue, utmContent: utmValue, utmId: utmValue,
  gclid: z.string().trim().max(200).regex(/^[\w\-.]*$/).optional(),
  gbraid: z.string().trim().max(200).regex(/^[\w\-.]*$/).optional(),
  wbraid: z.string().trim().max(200).regex(/^[\w\-.]*$/).optional(),
  fbclid: z.string().trim().max(300).regex(/^[\w\-.]*$/).optional(),
  gaClientId: z.string().trim().max(60).regex(/^[\w.\-]*$/).optional(),
  gaSessionId: z.string().trim().max(40).regex(/^[\w.\-]*$/).optional(),
});

export type Lead = typeof leads.$inferSelect;
export type InsertLead = typeof leads.$inferInsert;
```

### 6.3 Corresponding `MemoryStorage` obligation

Add one `?? null` line per new column in `server/storage.ts`. Without it the Postgres path works and the default dev path silently drops attribution — nobody notices until production data is inspected. A test asserting `Object.keys(memoryRow).length === Object.keys(pgRow).length` prevents recurrence.

### 6.4 `server/db.ts` fix, shipped with the migration

`ssl: { rejectUnauthorized: false }` currently encrypts but does not authenticate the Postgres server, so the connection carrying every lead's name and phone is MITM-able — while `privacy.tsx` simultaneously promises `הצפנת נתונים בהעברה`. Set `rejectUnauthorized: true` and supply the provider CA via `DATABASE_CA_CERT`. Only then may the privacy page claim encryption in transit.

---

## 7. The `<Slot>` and `<Fact>` contract

```tsx
// Slot: renders nothing in production when unfilled, and prunes the smallest
// containing unit — clause, then row, then cell, then section.
<Slot id="RESPONSE_TIME" />                    // inline clause
<SlotRow id="MIN_ORDER" label="מינימום" />     // table row, removed entirely if empty
<SlotSection id="TESTIMONIALS">…</SlotSection>  // section + heading removed if all children empty
<Slot id="LEGAL_ENTITY" blocking />            // throws at production build if unset
```

- **Dev:** renders `«[למילוי: …]»` on `#fff5cc` with a `1px #e8d489` ring.
- **Production:** renders `null` and collapses its parent unit. Never a plausible default.
- **`blocking`:** `throw` during `vite build` when `NODE_ENV=production`. Used for `LEGAL_ENTITY`, `COMPANY_ID`, `PRIVACY_CONTACT`, `WA_NUMBER`, `TEL`.

`<Fact value="3" source="כתובות בסעיף 04" />` is the same law applied to numerals: every figure either cites where it can be checked or does not render.

Build gate: `WA_NUMBER` must fail the build if unset **or** still equal `972521234567`. That placeholder is a syntactically valid Israeli mobile number and may belong to a real person who would otherwise receive the site's entire lead flow.

---

## 8. Notification path and response-time SLA

### 8.1 Why this is the highest-ROI code in the repo

Speed-to-lead is the binding constraint, not form design. The MIT/InsideSales study (Oldroyd, ~15,000 leads, >100,000 call attempts) found contacting within 5 minutes made a lead ~21× more likely to qualify than at 30 minutes; the HBR follow-up across 2,241 firms found a 42-hour average first response with 23% never responding.

**Do not print "21×" or any borrowed statistic on the site.** Use the mechanism, not the number. `first_inbound_at` and `first_reply_at` give the business a real median within weeks, and *that* becomes an honest claim it owns.

### 8.2 Current state and required changes

`notifyNewLead` in `server/routes.ts` is opt-in via an unset env var, fails silently, and has no retry. Required:

1. **`NOTIFY_WEBHOOK_URL` becomes a startup requirement in production.** Refuse to boot without it — `log()` a fatal and exit. A lead machine with no alerting is a lead machine with no leads.
2. **Reject any URL that is not `https:`** at startup, and validate its host against `NOTIFY_WEBHOOK_HOSTS` (comma-separated allowlist) so a compromised env cannot silently exfiltrate leads elsewhere.
3. **Minimise the payload.** The notification's only job is to make someone pick up the phone. Send: first name, `phone` (raw, dialable), `event_type`, `guest_band`, `area`, `branch`, `ref`, and a link to the admin row. **Not** the email, **not** the free text, **not** the answers blob. This also reduces what a breached automation vendor holds.
4. **Retry with backoff.** 3 attempts at 0s / 5s / 30s, incrementing `notify_attempts`. Set `notified_at` on success. Log delivery failures loudly (`log(..., "notify-FAIL")`).
5. **A sweeper.** Every 60s, any lead with `notified_at IS NULL AND notify_attempts >= 3 AND created_at > now() - interval '1 day'` is retried and surfaced in the admin view as a red banner.

### 8.3 Where the alert goes

A WhatsApp group the branch managers actually watch. This is a routing decision, not a code one — the webhook is provider-agnostic by design, pointing at Zapier / Make / n8n / a WhatsApp API provider.

Message shape:

```
🔔 ליד חדש · MM-7F3K2Q
אירוע חברה · בין 50 ל־100 · הרצליה / רמת השרון
15/09/2026
דנה · 054-XXXXXXX  ← tap to call
מטבח: הרצליה פיתוח
מהדף: /catering/business
[פתחו בממשק]
```

Including the event summary in the alert body is what lets the responder answer **substantively on the first reply** rather than opening with "מה בדיוק אתם צריכים?".

### 8.4 After-hours

**Phase 1 needs no code.** Configure the WhatsApp Business app's Greeting and Away messages with a correct Israeli week — closed Friday afternoon through Saturday evening, which is *not* a Sun–Sat assumption. Away messages are reactive only (they fire when the customer writes first); there is no native scheduled send.

Away-message wording is a Slot. Never invent a callback promise. It must state a concrete expectation the owner will honour, e.g. `{{AWAY_MESSAGE}}`.

Site-side: the `tel:` link is de-emphasised outside `{{ANSWERING_HOURS}}` and the WhatsApp path is promoted, with an honest line: `עכשיו סגור. כתבו בוואטסאפ ונחזור אליכם {{RESPONSE_TIME}}.` If `ANSWERING_HOURS` is unset, no hours-based behaviour renders at all — do not guess hours, and delete the current `זמינים 24/7` claim (`contact.tsx:302`, `faq-data.ts:12`), which is the kind of claim that generates angry reviews when a 23:40 call goes unanswered.

### 8.5 SLA mechanics

- `first_reply_at` is set when the owner marks the lead `working` in the admin view, or automatically by the Phase-2 webhook on the first outbound message.
- Escalation: a lead `status='new'` with `created_at > 20 minutes ago` during `ANSWERING_HOURS` fires a second webhook to `NOTIFY_ESCALATION_URL` (a second branch manager). No escalation outside answering hours.
- The admin dashboard shows median first-response time for the last 30 days and the count of leads still `new`. `X לידים ללא טיפול` is the number that keeps the system alive.

**The whole architecture is capped by response speed.** If no branch manager staffs the channel within minutes, a better form buys nothing.

---

## 9. Admin leads view

### 9.1 Auth

Keep the existing `requireAdmin` middleware — token-gated, disabled by default when `ADMIN_TOKEN` is unset or under 24 chars, `timingSafeEqual` comparison, `Cache-Control: no-store, private`. Three additions:

1. **One token per person**, not one shared token. `ADMIN_TOKENS` = comma-separated list; each token maps to a label in the `מסמך הגדרות מאגר`. The token fingerprint then identifies a human.
2. **Access logging.** Every `/api/leads` hit logs `timestamp · sha256(token).slice(0,8) · req.ip · rowCount`. Never field values. Retain 24 months. A test must assert no lead field ever reaches the logger.
3. **Pagination and a `since=` filter.** `GET /api/leads?since=2026-07-01&limit=50&cursor=…`. The current endpoint returns the entire table at once, so one leaked token exposes every lead ever collected and a routine view is indistinguishable from an exfiltration.

### 9.2 It is a worklist, not a report

The binding constraint on closed-won attribution is human data entry, and a restaurateur will not log into GA4 to do it. Layout, in order:

**Panel 1 — `לידים שממתינים לטיפול`** (default view, `status='new'` or `'working'`). Each row is two taps wide:

```
MM-7F3K2Q · 12:04 · דנה · 054-… · אירוע חברה · 50–100 · הרצליה
[📞 חייגו] [💬 וואטסאפ] [בטיפול] [נשלחה הצעה] [נסגר ✓] [לא יצא]
```

`נסגר ✓` opens one ₪ field (`won_value_ils`) and nothing else. `לא יצא` opens a `lost_reason` select. No modal, no form, no page navigation.

**Panel 2 — `פניות וואטסאפ ללא התאמה · 72 שעות`** — rows where `path='whatsapp' AND first_inbound_at IS NULL`. Shows event type / band / area / time so the owner can manually attach a real conversation to the time-proximate intent.

**Panel 3 — `התראות שנכשלו`** — red, only when non-empty.

**Panel 4 — the report**, one table:

| ערוץ | פניות | איכותיות | הצעות | נסגרו | ₪ שנסגר | ₪ לפנייה | % סגירה |

**Panel 5 — `עניין שלא הושלם`** — aggregated abandoned drafts. Counts by event type / band / area only, never rows.

### 9.3 Statistical hygiene, enforced in the UI

At this business's volume, monthly closed-won will be single-digit. Therefore:

- Default window is a **rolling 90 days**.
- Aggregate at **channel** level, not campaign level.
- **Suppress any ratio whose denominator is under 10** — render `—`, not a percentage. Showing "33% close rate" off 3 leads is exactly how an owner makes a bad budget decision, and a dashboard that enables that is worse than no dashboard.

### 9.4 Status transitions

```
new → working → quoted → qualified → won
                              ↘ lost
new → disqualified
```

Every transition appends a row to `lead_events` (append-only, so transitions are replayable and failed uploads retryable) and sets `status_changed_at` + `status_changed_by` (token fingerprint). Backwards transitions are permitted and logged — real sales are not a DAG.

### 9.5 Data-subject rights, as routes not prose

- `GET /api/leads/:id` and `DELETE /api/leads/:id` behind the same auth, so fulfilling an `עיון` or `מחיקה` request is one action rather than hand-edited SQL.
- 30-day response clock documented in `docs/privacy/dsr-runbook.md`, identity verified against the phone on file, written answer logged.

### 9.6 Export

`GET /api/leads/export.csv?since=…` — admin-gated, `Content-Disposition: attachment`, UTF-8 **with BOM** (Excel on Hebrew Windows mangles it otherwise), all columns.

`GET /api/leads/ads-export.csv?since=…` — a separate, narrow export for Google Ads, columns **exactly**:

```
Google Click ID,Conversion Name,Conversion Time,Conversion Value,Conversion Currency
```

Only rows where a click ID exists, `consent_ad_user_data` is not false, and `click_id_captured_at` is inside the upload window. Rows outside it are marked `ads_upload_status='expired_window'` and excluded — never silently dropped.

---

## 10. Attribution capture

### 10.1 Capture in Express, not JS

`server/index.ts` middleware, on the initial HTML request:

```ts
app.use((req, res, next) => {
  const q = req.query as Record<string, string | undefined>;
  const ids = ["gclid", "gbraid", "wbraid", "fbclid", "msclkid", "ttclid"];
  const hasClick = ids.some((k) => q[k]);
  const hasUtm = q.utm_source || q.utm_campaign;
  if (hasClick || hasUtm) {
    const payload = JSON.stringify({
      ...Object.fromEntries(ids.filter((k) => q[k]).map((k) => [k, String(q[k]).slice(0, 200)])),
      utm_source: q.utm_source?.slice(0, 120), utm_medium: q.utm_medium?.slice(0, 120),
      utm_campaign: q.utm_campaign?.slice(0, 120), utm_content: q.utm_content?.slice(0, 120),
      at: new Date().toISOString(), lp: req.path.slice(0, 200),
    });
    res.cookie("mm_attr", payload, { httpOnly: true, sameSite: "lax", secure: true, maxAge: 90 * 864e5 });
    if (!req.cookies?.mm_attr_first) {
      res.cookie("mm_attr_first", payload, { httpOnly: true, sameSite: "lax", secure: true, maxAge: 180 * 864e5 });
    }
  }
  next();
});
```

Why server-side and `httpOnly`:

- It is immune to consent-tool script blocking and to any CMP that clears JS cookies, and is defensible as strictly-necessary first-party measurement.
- With `ad_storage` denied, `gtag` will not cookie the `gclid` at all, and `url_passthrough` decorates only real anchor navigations — it does **not** apply to wouter's client-side route changes. But Express sees the click ID on the very first request regardless.
- **Never overwrite a stored click ID with an empty value** on a later pageview. Write only when a new click ID or a non-direct UTM set is present.

`gbraid`/`wbraid` arrive **instead of** `gclid` on iOS/Safari ad traffic, never alongside — capturing only `gclid` silently loses a large share of paid mobile traffic, which is where catering research happens. All three need separate columns; all three are valid upload keys.

### 10.2 Consent Mode

Region-scoped. Consent Mode v2 is required by Google only for EEA/UK/CH; Israel is outside that scope. Default `denied` for `ad_storage`, `ad_user_data`, `ad_personalization`, `analytics_storage` with `region: ['EEA','GB','CH']`; a separate Israeli default paired with a prominent non-dark-pattern notice and one-tap opt-out. Set `ads_data_redaction: true` and `url_passthrough: true` while denied.

**This is a business decision requiring the owner's own legal sign-off.** Present it as a documented choice, never as legal advice. The relevant cost: Google's conversion modeling — which is what backfills consent-denied conversions — requires per-account volume this business will never reach, so consent-denied traffic here means genuinely lost conversions, not modelled ones. That is the strongest argument against defaulting `analytics_storage` to denied on Israeli traffic, and the owner should decide it knowing that.

**Cookie banner:** none is currently required — the site sets no tracking cookies (only functional accessibility prefs in localStorage). But the Google Fonts and cdnjs Font Awesome tags transmit every visitor's IP to Google and Cloudflare on every page view. **Eliminate rather than disclose:** self-host the fonts, drop Font Awesome for lucide. Result: zero third-party requests, no banner, no disclosure paragraph. If Meta Pixel or Google Ads is later added, the position flips and a genuine consent gate becomes necessary — so build pixels so they can only be injected through a single consent-gated module, never a raw script tag.

---

## 11. GA4 taxonomy and Google Ads mapping

### 11.1 Setup, before any event fires

1. **Turn OFF "Form interactions"** in enhanced measurement. GA4's automatic `form_start`/`form_submit` will double-count against `quote_start`/`generate_lead`.
2. **Set event data retention to 14 months** on day one. Default is 2 months; a 3–8 month catering sales cycle is unanalyzable at 2, and retention is **not retroactive**.
3. Register `step_id`, `guest_band`, `branch_area`, `lead_source`, `wa_location` as **event-scoped custom dimensions** or they are invisible in reports.

### 11.2 Event taxonomy

Use GA4's **reserved** lead-gen names — that is what populates the built-in Lead Generation reports and the eight lead audience templates. No `lead_submit`, no `form_success`.

| Event | Params | Fired |
|---|---|---|
| `quote_open` | `source_page` | builder enters viewport |
| `quote_start` | `source_page`, `event_type` | first answer on step 1 |
| `quote_step_complete` | `step_index` 1–5, `step_id` (`event_type\|guests\|date\|area\|contact`), `event_type`, `guest_band`, `area`, `date_known` | on advance |
| `quote_step_back` | `from_step` | `← חזרה` |
| `estimate_shown` | `estimate_min`, `estimate_max` | only when §2.2 locks pass |
| **`generate_lead`** | `lead_source` (`quote_builder\|whatsapp_handoff\|menu`), `lead_ref`, `guest_band`, `event_type`, `branch_area` — **no `value`** | server-confirmed submit |
| `whatsapp_click` | `wa_location`, `has_lead` | any WhatsApp CTA |
| `whatsapp_handoff` | `lead_ref`, `wa_location`, `branch` | `openWhatsApp()` |
| `call_click` | `call_location`, `is_business_hours` | any `tel:` |
| `taste_intent` | `source_page`, `branch` | tasting section CTA |
| `menu_print` | `source_page` | print link |
| **`working_lead`** | `lead_ref` | admin → working (server-side, Measurement Protocol) |
| **`qualify_lead`** | `lead_ref` | admin → qualified (MP) |
| **`close_convert_lead`** | `lead_ref`, `value`, `currency: 'ILS'` | admin → won (MP) |
| **`close_unconvert_lead`** | `lead_ref`, `lost_reason` | admin → lost (MP) |

The four post-submit events can only be fired **server-side via Measurement Protocol** from the admin status change — which is why `ga_client_id` must be persisted on the lead row. Without that column, closed-won can never be stitched back into GA4 at all. Store `ga_session_id` too, to reduce (not eliminate) session-splitting distortion.

The taxonomy lives in **one** typed module, `client/src/lib/analytics.ts`, with a discriminated-union event type so a new landing page cannot invent its own event names.

### 11.3 `generate_lead` carries no `value`

Until the owner supplies per-guest-band values they will stand behind. Deriving value from the current calculator's invented rates would make Smart Bidding bid real money against fabricated economics — the same consumer-protection class of problem as the removed בד"ץ badge, with a budget attached.

### 11.4 Google Ads conversion mapping

| Tier | Action | Ads setting |
|---|---|---|
| 1 primary | `Lead — quote submitted` | Primary, count **One**, click-through window **90 days** |
| 1 primary | `Lead — WhatsApp handoff` | Primary, count One — **separate action** so its lower quality stays visible |
| 2 secondary | `call_click`, `whatsapp_click`, `estimate_shown`, `taste_intent` | **Secondary / observation only** |
| 3 imported | `Qualified lead` | Imported, value-adjustment signal |
| 3 imported | `Closed won` | Imported, **reporting only** |

Count = **One**, not Every: a couple planning a wedding will submit twice, and Every inflates the denominator of every ratio the owner looks at. Marking `call_click` and `whatsapp_click` Secondary is the single setting that stops Smart Bidding chasing unmeasurable intent proxies.

**Bid on `Lead — quote submitted`, not on closed-won.** Smart Bidding needs roughly 15–30 conversions per 30 days per campaign; closed-won catering events across three branches will be far below that and the campaign will thrash. Revisit only at a sustained 30+/month.

**The optimisable conversion cannot be closed-won for a second, structural reason:** GCLID-keyed offline uploads are accepted only within 90 days of the click, and enhanced-conversions-for-leads uploads keyed on hashed PII only within 63 days. A wedding booked 4–8 months out closes **after** the window and can never be imported. `Qualified lead` (= quote sent + tasting or site visit booked, landing around day 1–10) is the in-window proxy. `click_id_captured_at` exists so the export job computes window eligibility instead of guessing.

### 11.5 Upload mechanism — CSV, not the API

**As of 15 June 2026 (already past) offline conversion imports and enhanced-conversions-for-leads uploads were migrated to the Data Manager API and blocked in the Google Ads API.** Only developer tokens that sent an `UploadClickConversions` request between January and June 2026 were allowlisted; others receive `CUSTOMER_NOT_ALLOWLISTED_FOR_THIS_FEATURE`. This project has no pre-existing developer token, so the Google Ads API path is closed.

Therefore: `GET /api/leads/ads-export.csv` (§9.6) + a scheduled Google Sheets import in the Ads UI. Move to the Data Manager API only if volume ever justifies OAuth app maintenance. **Every 2024–2025 tutorial for this task is now wrong** — write this into the code comment above the export handler.

### 11.6 The split, declared so nobody "fixes" it

- **Postgres is the source of truth for channel ROI.** It holds the click ID, the consent state and the owner-entered ₪.
- **GA4 is for funnel and behaviour analysis.** MP events sent with `client_id` but no valid `session_id` are attributed to a new session, and GA4 credits closed-won using the touchpoints known at *upload* time rather than the original click. It will never be a trustworthy ROI system here.
- **Google Ads receives uploads purely to feed bidding.**

### 11.7 Call tracking

Google forwarding numbers availability in Israel is **unverified** (Google's country-list page returns 403 to automated fetch; third-party sources confirm only US/UK/CA/AU). Do not design around GFN. Instead: three DIDs from an Israeli VoIP provider, one per traffic class (Google Ads / Meta / organic+direct), all ringing the same restaurant line, swapped client-side from the `mm_attr` cookie; the provider webhook POSTs to `/api/call-event` into `call_events`. This yields **channel-level** call attribution, explicitly not click-level. Someone must confirm GFN availability inside the real Ads account before anyone promises click-level call conversions.

A `tel:` click is not a call. Google's default 15-second qualifying-call threshold is far too short for catering. Define a qualified call as **≥60s connected** and count only those. `call_click` stays a GA4 secondary signal for CTA-placement analysis, never a conversion.

### 11.8 The success metric, agreed before launch

This architecture deliberately trades raw submission volume for qualified volume: a 4-question builder with a real consent checkbox and no fabricated price total will produce **fewer, better** leads than an 8-field open form plus an invented calculator. If the owner measures raw form submissions they will conclude the rebuild failed.

**Report on booked events and cost per booked event, never on form submissions.** Without the `status` field and someone updating it, the phrase "insane lead machine" is unfalsifiable.

---

## 12. Anti-spam without hurting conversion

Ordered by cost to a real visitor, ascending. Nothing here adds a CAPTCHA.

**1. Wire up the existing honeypot.** The server already implements it (`routes.ts:104-105,153-158`) keyed on `company_website` — but the form never renders that field, so the measure is dead code. Add:

```tsx
<div className="hp" aria-hidden="true">
  <label>אל תמלאו:
    <input name="company_website" tabIndex={-1} autoComplete="off" />
  </label>
</div>
```

Positioned off-screen with `position:absolute; inset-inline-start:-9999px`, never `display:none` (some bots skip hidden fields). Keep the current behaviour of returning `success: true` to a bot so it does not try another way.

**2. A timing check.** Reject a submit that arrives <2.5s after the builder mounted. No human completes four questions faster. `mountedAt` is a hidden field; the server compares against `Date.now()` with a generous skew allowance. This alone kills most naive form spam.

**3. Fix the rate limiter, which currently costs real leads.** `windowMs: 10min, max: 8` keyed on `req.ip` — Israeli mobile carriers use carrier-grade NAT extensively, so many unrelated users share one public IP and an office behind NAT hits 429 on a *first, legitimate* submission. Changes:

- `/api/contact` (→ `/api/quote`): raise to **20 / 10 min**, and key on `ip + coarse UA hash` rather than IP alone.
- `/api/wa-intent`: **60 / 10 min**, fails **open** — a 429 must never prevent the redirect, and the client already ignores the response. Low-value endpoint, deduped by unique `ref`.
- `/api/quote/draft`: **120 / 10 min**, fails open.
- `/api/wa/webhook`: no limit, HMAC-verified instead.

**4. Server-side field discipline.** Enumerated fields (`guestBand`, `area`, `contactChannel`, `path`, `waLocation`) are `z.enum` — not free strings. Free text exists only in `notes`, only post-submit, capped at 1,000 chars. UTM and referrer are charset-whitelisted and length-capped at ingest (§6.2), because they will be rendered in an owner-facing view and are attacker-controlled.

**5. Duplicate collapse, not rejection.** Two submits with the same `phone_e164` within 30 minutes: keep the newer, set `duplicate_of` on it, fire **no** second notification, and do not fire a second `generate_lead`. Never show the visitor an error — a "you already submitted" message on a genuine second attempt is a lost lead.

**6. Nothing else.** No CAPTCHA, no reCAPTCHA v3 score gate, no email verification, no phone OTP. Each of those costs more real leads than the spam it stops at this volume, and reCAPTCHA additionally reintroduces a third-party request and a privacy disclosure that §10.2 just eliminated.

---

## 13. Build gates — what CI must fail on

| Gate | Assertion |
|---|---|
| Honesty | `scripts/check-honesty.sh` returns 0 (§0) |
| Bidi | no `/\d\s*[–—]\s*\d/` in any Hebrew string literal |
| Estimate default | with default `PRICING`, `estimateEnabled() === false` and `<EstimateRange>` renders `null` |
| No ₪ outside config | `rg '₪\s*[0-9]' client/src --glob '!client/src/config/**'` empty |
| WhatsApp discipline | `rg 'wa\.me' client/src --glob '!**/lib/whatsapp.ts'` empty; no `await` between the `fetch` and the navigation in `whatsapp.ts` |
| Prefill length | `encodeURIComponent(buildHebrewMessage(worstCase, ref)).length < 1600` |
| Placeholder number | build fails if `WA_NUMBER` is unset or `=== '972521234567'` |
| Blocking slots | build fails if `LEGAL_ENTITY`, `COMPANY_ID`, `PRIVACY_CONTACT`, `TEL` unset in production |
| Notice presence | `QuoteBuilder` cannot render without `sourcePage`; snapshot test asserts the collection notice and marketing checkbox are in the DOM |
| No client drizzle | `rg "@shared/schema" client/src` empty |
| Storage parity | `MemoryStorage` row keys === `leads` column count |
| No PII in logs | test asserts no lead field name appears in any logger call |
| No PII in drafts | test asserts `POST /api/quote/draft` rejects any payload containing `name`, `phone`, `email`, or `notes` |
| axe-core | 0 violations on the builder at steps 1–5, at 320px and at 200% zoom |
| Logical props | §0 grep gate |

---

## 14. Owner-blocking facts

The lead machine ships without these, degraded but honest. Each unfilled Slot removes a clause, a row, or a section — never a guess.

**Blocks launch (build fails):** registered legal name + ח.פ.; privacy contact channel; real phone per branch in display + E.164 form; the WhatsApp number, and whether it is already live on the Business app and on whose phone; branch addresses.

**Blocks a specific component:** `RESPONSE_TIME` (hero note, reassurance line, confirmation view, away message) · `MIN_GUESTS` / `MAX_GUESTS` (band list, downgrade offer, hero note) · `perPerson` + `approvedAt` + `conditions` (the entire estimate) · deposit / cancellation / headcount-deadline / quote-validity (terms strip) · `ANSWERING_HOURS` (after-hours behaviour) · per-branch chef name (branch columns) · kashrut per branch, verbatim, per certificate — or explicit "no certification," which gates whether `/shiva` is built at all · `TA_DEFAULT` branch (area routing) · testimonials with documented consent (section absent otherwise) · Google Business Profile URLs (the only honest ratings display) · marketing-consent and follow-up-contact wording, verbatim · lead retention period in months (the purge job) · same-day cutoff per branch, weekday and Friday (the whole `/urgent` route) · per-guest-band ₪ values the owner will stand behind (any Ads conversion value).

**Blocks a decision, not code:** consent defaults for Israeli traffic, with the owner's own legal sign-off · whether CTWA ads will run (promotes Cloud API to launch-blocking) · whether cross-branch backup is a commitment they will publicly honour · GA4 measurement ID, Ads account ID, and the exact conversion action names, which the CSV export's `Conversion Name` column must match character-for-character or every row is rejected.

---

## 15. Sequencing

1. **P1–P6** deletions + honesty CI gate. No owner input needed. Ship today.
2. Palette/token replacement (gold → paper-and-ink) — before any section is restyled, or every new CTA inherits 2.25:1.
3. `config/contact.ts`, `config/pricing.ts`, `content/legal.ts`, `<Slot>`, `<Fact>` + their build gates.
4. Schema migration + `MemoryStorage` parity + `db.ts` TLS fix + attribution middleware. **Before any UI work** — the whole multi-page strategy is unmeasurable without it, and consent columns cannot be retrofitted to collected rows.
5. `lib/whatsapp.ts` + `/api/wa-intent` + `/api/quote` + `/api/quote/draft`. Notification hardening in the same commit.
6. `QuoteBuilder` + confirmation view + print stylesheet.
7. Admin worklist. **Before launch** — a lead machine nobody triages is a dead code path with confident-looking zeros.
8. `lib/analytics.ts` + GA4 + Ads conversion actions + the CSV export. **Before the second landing page**, or there is no baseline.
9. Route variants (§1.5), in ROI order: `/catering/business` → `/venue/{branch}` → `/urgent` → `/pasta-bar` → `/catering/{city}`.
10. Phase 2 WhatsApp Cloud API — unless CTWA ads are planned, in which case it moves to step 5.
