# 02 · Lead Machine Spec — מאמא מיה קייטרינג

**Status:** normative. Where this document conflicts with existing code, this document wins and the code changes.
**Base design direction:** `תפריט / TAFRIT — "The menu is the site"`, with grafts from `המטבח כמסמך` and `דף ההחלטה` (§0.3).
**Revision:** second pass. Rebased from the previously-assumed `Kitchen as Document` base, and corrected against `docs/spec/00-prior-review.md`.
**Companion specs:** `01-site-architecture.md` owns routes, page contracts and build order. `03-design-system.md` owns tokens, typography and component visuals. `04-legal-and-content.md` (to be written) owns the privacy policy, terms, accessibility statement and the `docs/privacy/` artefact set.

**Scope of this document:** everything between "a visitor is on a page" and "a branch manager is on the phone with them, and we know which page produced the call." It owns the quote builder, the dish-selection micro-commitment, the price-estimate policy, the conversion paths, the WhatsApp handoff, the lead schema, partial capture, the notification path, the admin worklist, attribution, the GA4/Ads taxonomy, and anti-spam.

---

## 0. Preconditions, direction rebase, and the rule that overrides everything

### 0.1 The rule

> **If a fact is not owner-supplied and not already verified in the repo, it is a marked content slot. Never a plausible default.**
> A page that degrades gracefully with an empty slot is correct. A page with an invented number in it is a defect, however reasonable the number looks.

This document contains **no** guest minimum, no price, no lead time, no cutoff, no delivery catchment, no capacity, no kashrut wording, no VAT statement, no response-time promise and no tasting policy. Every such value appears only as a named Slot with a `null` default and a defined degraded state.

Values corrected in this revision because the first pass shipped them as literal copy (prior review §A):

| Prior-pass defect | Correction in this document |
|---|---|
| `מ־25` as a hero-note minimum (A1) | `MIN_GUESTS` Slot only; clause prunes when unset (§1.3). Added to the honesty grep (§13). |
| `כולל מע״מ, לא כולל צוות והובלה` inside the price qualifier (A2) | The qualifier is `LEGAL.PRICE_ESTIMATE_NOTE`, `null` by default; `PRICING.vatStatus` is a separate required lock. No default string exists anywhere (§2). |
| Builder area chips publishing a delivery catchment (A3) | Areas are sourced from `locations.ts[branch].servesAreas`. With no owner data the screen degrades to a free-text city field (§3.6). |
| `בואו לטעום` shipped ungated (A4) | The tasting path renders only when `SLOT.TASTING_POLICY` is filled **and** ≥1 branch has address + hours (§1.6). |
| `אירוח אצלנו במסעדה` offered without capacity confirmation (A5) | Gated on `locations.ts[branch].privateEventCapacity` for ≥1 branch (§3.3, §3.4). |
| Service formats offered without confirmation (new in this pass) | Every service format is gated on `SERVICE_FORMATS[key].offered === true`. All four default to `null` (§3.4). |

### 0.2 Blocking deletions — ship before anything in this document

These are not part of the lead machine. They are the reason the lead machine cannot be built on top of the current tree. Each is a pure deletion, needs no owner input, and lands in one commit first. They are duplicated in `01` §0.1 deliberately — whoever ships first satisfies both.

| # | Action | Files (verified at HEAD) |
|---|---|---|
| P1 | Delete every kashrut assertion | `hero.tsx:24,70`, `footer.tsx:68`, `story.tsx:24`, `faq-data.ts:21-29`, `terms.tsx:98,118,121` |
| P2 | Delete fabricated testimonials + hardcoded platform ratings | `testimonials.tsx` (whole file): `:2-21` three invented names, `:34` `אלפי לקוחות`, `:63-95` `Google 4.9/5 · 247` and `Facebook 4.8/5 · 189` |
| P3 | Delete every invented price and the pricing engine | `price-calculator.tsx` (whole file, incl. `:29-48` rates, `:75` weekend surcharge, `:173-189` add-ons), `events.tsx:9,16,23,30`, price fields in `menu-data.ts`, `contact.tsx:230-233` budget bands |
| P4 | Delete invented statistics | `story.tsx:34-53,67-74`, `footer.tsx:12`, `blog-data.ts:16`, `blog-post.tsx:91`, `gallery-data.ts:17` |
| P5 | Delete invented identity and commitments | `privacy.tsx:161` (named DPO), `terms.tsx:24,40,57,59,64-67,77-80,135-138,155,156,167,168,188,198`, `contact.tsx:50,283,302` (24h / 24-7), `faq-data.ts:12,66-72` |
| P6 | Replace the placeholder phone / WhatsApp number with a build-gated config | 14 occurrences of `052-123-4567` across 8 files; 4 of `wa.me/972521234567` |

`terms.tsx:135-138` (general liability cap), `:155` (opt-out marketing use of event photography), `:167` (mandatory בוררות) and `:168` (exclusive Tel Aviv forum) are added to P5 in this revision; the first pass omitted all four. Replacement language is owned by `04-legal-and-content.md`; deletion is unconditional and happens now.

### 0.3 What the TAFRIT rebase changes about the lead machine

The previous base direction led with documentary photography. There is currently **no photography of any kind** in this repo, and what eventually arrives will be owner-supplied phone photos of unknown quality. The rebase is therefore not cosmetic:

1. **The lead machine has zero photo dependency.** No conversion surface — hero CTA block, builder, confirmation, summary card, admin, notification — requires an image to be complete. `og:image` on `/thanks` and `/summary` falls back to the site default (`01` E3). When real photos land, nothing in this document changes.
2. **The builder is framed as composing a menu**, not filling a form. It is section 05 of the page, headed `התפריט שלכם`, and its output artifact is a **menu card**, not an invoice or a spec table. A document that looks like a quote invites price negotiation; a document that looks like a menu invites approval.
3. **`הוסיפו לתפריט שלי` becomes a first-class mechanic** (§4). It is a PII-free, dish-level micro-commitment that seeds the builder so the buyer starts at step 2. The first pass had no equivalent — its builder entry was cold, and prior review B9 flagged `add_to_brief` as specified in `01` and implemented nowhere.
4. **Service format is captured as a menu choice, not a form field** (§3.4) — selecting a chef's menu in section 02 seeds `service_format`. It is the strongest price-band and qualification signal in catering, and no competitor asks it early.
5. **The no-price state is a legitimate genre convention, not a hole.** A chef's menu without prices is normal; an incomplete price table is not. This is what makes §2's default-off estimate survivable commercially, and it is why any table whose values are unfilled collapses to a menu-style list rather than a gapped grid.
6. **Register inversion is retained as a variation of one system** (§1.7): on `/urgent`, `/catering/business` and `/catering/shiva` the operational facts and the phone come first and the menu sits below the fold. This is a section-order change, not a second design language.

### 0.4 Files this document creates or owns

| Path | Purpose | Default state |
|---|---|---|
| `client/src/config/business.ts` | phone, WhatsApp, email, domain — single source of truth (name aligned with `01` §5.6; the first pass called it `config/contact.ts`) | build-blocking |
| `client/src/config/pricing.ts` | the only file in `client/` permitted to contain a numeric rate | all `null` |
| `client/src/config/service-formats.ts` | which service formats are offered | all `offered: null` |
| `client/src/config/quote.ts` | guest-band boundaries, step order, auto-advance timing | neutral defaults, no commercial meaning |
| `client/src/content/legal.ts` | approved claim strings (`LEGAL.*`) | all `null` |
| `client/src/data/locations.ts` | three branches; `servesAreas`, `privateEventCapacity`, hours, addresses, GBP URL | all `null` except slugs |
| `client/src/data/menus.ts` | dish records for `הוסיפו לתפריט שלי` (§4.2) | empty array |
| `client/src/lib/whatsapp.ts` | the only file allowed to construct a `wa.me` URL | — |
| `client/src/lib/attribution.ts` | client half of attribution capture | — |
| `client/src/lib/analytics.ts` | the single typed event module | — |
| `client/src/lib/consent.ts` | the single tag injector (§12.3) | — |
| `client/src/components/quote/QuoteBuilder.tsx` | the builder | — |
| `shared/lead-schema.ts` | zod validation shared by client and server, **no drizzle import** | — |

### 0.5 Dependencies to add (prior review D5)

The first pass used APIs from packages that are not installed and appear on no dependency list.

| Package | Why | Where |
|---|---|---|
| `cookie-parser` + `@types/cookie-parser` | `req.cookies.mm_attr` in the attribution merge (§10.2). Not installed. | server |
| `@radix-ui/react-direction` | `<DirectionProvider dir="rtl">` at the app root; Radix reads direction from its own context and **never** from `<html dir="rtl">`, so every chip radiogroup in the builder has inverted arrow keys without it. | client |
| `drizzle-kit` migration scripts | `db:generate` / `db:migrate` — see §6.6. `drizzle-kit` is installed; the scripts are not. | tooling |

Nothing else is added by this document. Packages **removed** are owned by `03` §11.3.

---

## 1. Conversion architecture

### 1.1 Three paths, one channel decision, zero fourth path

The ceiling is three conversion paths. Dilution is not caused by path count — it is caused by paths competing for the same click in the same viewport, and by paths that do not share a data destination. Every path below writes to the same `leads` table with a `path` discriminator, so they can be compared in one query.

| # | Path | Filled primary on | Row written | Why it exists |
|---|---|---|---|---|
| 1 | **Quote builder** → server row → WhatsApp thread | every route except `/urgent`, `/catering/shiva` | `path='quote'` | Owns the structured data and the attribution. The only path that survives a missed call. |
| 2 | **WhatsApp**, prefilled + ref-coded + server-committed | `/urgent`, `/catering/shiva`; sticky mobile bar everywhere | `path='whatsapp'` | Israel's default business channel. Async, works at 22:40, no business-hours failure. |
| 3 | **Tasting / walk-in** — `בואו לטעום הערב` | never filled; text link | `path='taste'` *only if a form is used*; usually nothing | Lowest-commitment risk reversal available, and the only one no ghost kitchen can offer. Gated (§1.6). |

**Phone is a channel, not a fourth path.** It is a plain text link with an E.164 `tel:` href on every route, and a filled button on exactly two routes (`/urgent`, `/catering/shiva`) where mourning and same-day intent converts on a human voice in seconds. Calls are attributed at channel level only (§11.7).

**Printing the menu is not a path.** `window.print()` behind a text link labelled `הדפיסו את התפריט` captures nothing, gates nothing, fires `menu_print`, and exists because the direction's central artifact is a document (§1.5).

`הוסיפו לתפריט שלי` (§4) is **not** a path either — it is a pre-path micro-commitment with no destination of its own. It writes only to builder state and to a draft row.

**Hard layout rules.** Max one *filled* primary CTA per viewport. Max two visible CTAs at once. The current hero renders three equal-weight buttons at the highest-attention moment on the page (`hero.tsx:88-115`); that is choice paralysis and the single largest structural leak on the site today.

### 1.2 Sticky mobile bar — the one declared exception

The sticky bar is **chrome, not content**. It is `position:fixed` below 760px and therefore permanently shares a viewport with whatever section CTA is on screen. Prior review B10 correctly identified that this makes it a standing violation of "one filled primary per viewport" unless the exception is stated. It is stated here.

- Exactly **one filled control** in the bar, and it is WhatsApp (`--wa` background). Everything else in the bar is a ghost or a text link.
- `RouteDef` gains `stickyBar: 'quote' | 'phone' | 'none'`.
  - `'quote'` → `[ 💬 וואטסאפ ]` filled + `התפריט שלכם` ghost.
  - `'phone'` → `[ 💬 וואטסאפ ]` filled + `התקשרו` ghost. Used on `/urgent`.
  - `'none'` → the bar does not render. **Required on `/catering/shiva`**, which forbids upsell and has no builder; a bar reading `הצעה` on a mourning page is the worst string on the site.
- The bar never renders on `/thanks`, `/summary`, `/admin/leads` or the legal routes.

### 1.3 Hero CTA block — exact spec

```
[ בנו תפריט לאירוע ]            ← filled, --ink bg → --tomato on hover, scrolls to #quote
  דברו איתנו בוואטסאפ            ← ghost
  או בטלפון {{TEL_DISPLAY}}      ← plain text link, tel: with E.164 href
```

`בנו תפריט לאירוע` is the direction's primary CTA and is deliberately non-transactional. Banned verbs, currently live in hero, header (desktop and mobile) and the calculator result: `הזמינו עכשיו`, `הזמינו אירוע עכשיו`. "Order now" is a transactional verb applied to a ₪10k+ considered purchase whose buyer's third-biggest fear is being locked in.

Note line beneath, built from **clause-pruning** Slots — each unfilled token removes only its own clause, never the line:

```
תשובה תוך {{RESPONSE_TIME}} · מ־{{MIN_GUESTS}} ועד {{MAX_GUESTS}} סועדים · שלושה מטבחים
```

With `RESPONSE_TIME`, `MIN_GUESTS` and `MAX_GUESTS` all unset — the launch state — the line renders as:

```
שלושה מטבחים
```

That is the one clause that is a fact we hold. If every clause is empty the line does not render at all. The `<Slot>` prune contract is §7.

### 1.4 Approved CTA labels, exhaustive

| Label | Use |
|---|---|
| `בנו תפריט לאירוע` | primary, menu-led routes |
| `קבלו הצעה ב־4 שאלות` | primary, register-inverted routes (`/catering/business`, `/quote`) |
| `בדקו זמינות לתאריך שלכם` | date-led variant on `/catering/holidays` |
| `הוסיפו לתפריט שלי` | dish row (§4) |
| `דברו איתנו בוואטסאפ` | WhatsApp, all locations |
| `התקשרו` / `{{TEL_DISPLAY}}` | phone |
| `בואו לטעום הערב במסעדה` | tasting, **gated** (§1.6) |
| `הלאה` · `← חזרה` | builder navigation |
| `שלחו לי הצעה` | builder submit |
| `עדיף לי בוואטסאפ` | builder secondary submit |
| `הדפיסו את התפריט` | print link |

On mobile the primary CTA sits at the **top** of the nav drawer, above the nav items. It currently sits below six of them, outside thumb reach.

### 1.5 The menu-PDF question — decided: no gated PDF

Do not build a gated menu PDF download. Three reasons, in order of weight:

1. **Accessibility law.** ת"י 5568 חלק 2 covers digital documents. A PDF menu is a fourth legally-exposed surface with no test harness and no CI gate.
2. **It would be a fourth path.** The ceiling is three.
3. **The honest substitute is stronger.** The low-commitment path is "come eat it tonight in one of three restaurants" — no gate, no email capture, no invented fact.

What ships instead: a real `@media print` stylesheet that turns page sections 01 and 02 into a single-colour A4 menu the kitchen can hand a walk-in customer, and the confirmation/summary artifact as a printable menu card (§3.11, §5). Print discipline is specified once, in §5.4, and applies to both.

If the owner later insists on a gated PDF: one field (phone only), `path='menu'`, and it may never become the primary CTA on any route.

### 1.6 The tasting path is gated (prior review A4)

`בואו לטעום הערב במסעדה` is the highest-leverage zero-invention offer available — competitors gate tastings behind an 80-portion order — but the copy the direction supplies (`בלי לתאם ובלי מינימום`) is a **policy claim**, and tasting policy is an open owner question.

Render rule for `TastingBand` and for every `בואו לטעום` link:

```
render ⟺ LEGAL.TASTING_POLICY !== null
       ∧ ∃ branch : locations[branch].address !== null ∧ locations[branch].hours !== null
```

When it renders, the policy sentence is `LEGAL.TASTING_POLICY` **verbatim as the owner wrote it** — never paraphrased, never softened, never assembled from parts. When it does not render, no tasting language appears anywhere on the site, `taste_intent` never fires, and the hero's second CTA is `דברו איתנו בוואטסאפ`.

Placement, grafted from the losing direction: the band sits **immediately after the money/inclusions section (03)**, not as a hero link — that is where doubt peaks. It is tracked as its own conversion action so it is never judged against quote volume.

Cross-link rule: a dish row may show `מוגש היום ב<סניף>` and link to the live restaurant menu **only** where `menus.ts[dish].liveMenuUrl[branch]` and `menus.ts[dish].cateringAvailable === true` are both set. Where either is absent the mark is **omitted**, not softened. Same law as the caption law, applied to type instead of images.

### 1.7 Route-level register inversion and per-route conversion config

Route names below are taken verbatim from `01` §2 (prior review B4 — the first pass referenced `/venue/{branch}`, `/catering/{city}` and `/shiva`, none of which exist).

| Route | Builder | Filled primary | `stickyBar` | Builder pre-seed |
|---|---|---|---|---|
| `/` | yes | quote | `quote` | none |
| `/kitchens`, `/kitchens/:slug` | yes | quote | `quote` | `area` = that branch's area, **only if** `servesAreas` is filled |
| `/catering` | yes | quote | `quote` | none |
| `/catering/business` | yes, **above the menu** | quote | `quote` | `eventType='אירוע חברה'` |
| `/catering/private-events` | yes | quote | `quote` | `eventType='שמחה פרטית'` |
| `/catering/bar-mitzvah` | yes | quote | `quote` | `eventType='שמחה פרטית'` |
| `/catering/holidays` | yes | quote (date-led label) | `quote` | `eventType='אירוח משפחתי או חג'` |
| `/catering/fun-day`, `/pasta-bar` | yes | quote | `quote` | `eventType='יום כיף או כנס'` |
| `/catering/dairy`, `/menus` | yes | quote | `quote` | none |
| `/urgent` | **no builder** | **phone** | `phone` | — |
| `/catering/shiva` | **no builder** | **phone**, single number | **`none`** | — |
| `/quote` | yes, is the page | quote | `quote` | from query params, visible and editable |
| `/areas/:city` | yes | quote | `quote` | `area` = that city, **only if** it appears in some branch's `servesAreas` |
| `/lp/:campaign` | yes | quote | `quote` | from `RouteDef` |
| `/thanks`, `/summary`, legal, `/admin/leads`, `/404` | no | — | `none` | — |

Prior review B3 is resolved here: **`/urgent` and `/catering/shiva` have no builder at all.** Phone and WhatsApp only. `/urgent` is a 30-second, phone-first intent; a five-screen builder on it is a scroll-depth failure. `/catering/shiva` additionally carries no price, no estimate, no "celebrate/event" vocabulary, no upsell, and **no marketing-consent checkbox** — and it ships only if the owner supplies a truthful per-branch kashrut statement (§14).

**Pre-seed rule, non-negotiable.** A value seeded from the route or from a dish selection is rendered **visible and selected**, never hidden, and is editable. The builder opens at the first *unanswered* screen, and every earlier screen stays reachable via `← חזרה`. A forwarded `/catering/business` link otherwise silently writes a mislabelled lead — and a mislabelled lead is worse than a missing one, because the branch manager acts on it.

---

## 2. Price-estimate policy

### 2.1 The rule

The site may display a **range**, never a single number, and only after the owner has explicitly approved rates. **Default state: no estimate renders at all, anywhere.**

A single computed shekel figure is a quasi-quote. When the real quote differs the buyer feels baited, and under `ס' 2(א) לחוק הגנת הצרכן` a figure presented adjacent to an action that reads as acceptance can reach `מסוימות` and become an offer. The current `price-calculator.tsx` does exactly that: a bold `₪{total}` captioned `המחיר כולל את כל המנות והשירותים שבחרתם` directly above a `הזמינו עכשיו` button. It is deleted in P3.

Why not simply stay silent forever: an accountable buyer's job-to-be-done before contacting anyone is to be able to **say a number to someone else** — a spouse, a committee, a CFO. A site with no number cannot be used as ammunition, so they call the three competitors who do publish one and we get compared last. The published Israeli band is 39–65 ₪ per portion; a restaurant-grade Italian product almost certainly sits above it, which is exactly why the comparison axis must be **inclusions and exclusions**, not a bare number. That argument is §3.4 and §3.5, and it works with zero prices published.

### 2.2 The mechanism — unset by default, four independent locks

`client/src/config/pricing.ts` is the **only** file in `client/` permitted to contain a numeric rate or a `₪` glyph. The CI gate (§13) whitelists this path and nothing else.

```ts
/**
 * מחירון — ריק בכוונה.
 *
 * כל עוד אחד מהמנעולים אינו מתקיים, בלוק הערכת המחיר אינו מרונדר בכלל —
 * לא כטווח, לא כמספר, ולא כטקסט חלופי. אין למלא כאן ערך שלא אושר בכתב
 * על ידי הבעלים, כולל את שאלת המע״מ. ערך שנלקח משיחת טלפון ולא תועד
 * הוא ערך מומצא לכל דבר.
 */
export type ServiceFormatKey =
  | "delivery"        // מגשים — משלוח והנחה
  | "buffet_on_site"  // בופה במקום
  | "plated_staffed"  // מוגש בצלחות, עם צוות שלנו
  | "at_restaurant";  // אירוח אצלנו במסעדה

export interface PerPersonBand {
  /** ₪ לסועד. שני הערכים חייבים להיות מוגדרים וחיוביים. */
  min: number | null;
  max: number | null;
}

export interface PricingConfig {
  /** טווח לסועד לכל פורמט שירות בנפרד. פורמט חסר = אין הערכה לפורמט הזה. */
  perPerson: Partial<Record<ServiceFormatKey, PerPersonBand>>;
  /** תאריך המחירון שאושר, ISO YYYY-MM-DD. בלעדיו אין תאריך להדפיס. */
  approvedAt: string | null;
  /** האם המחירים כוללים מע״מ. אין ברירת מחדל ואין ניחוש. */
  vatStatus: "included" | "excluded" | null;
  /** עיגול ההערכה לכפולות של: */
  roundTo: number;
}

export const PRICING: PricingConfig = {
  perPerson: {},
  approvedAt: null,
  vatStatus: null,
  roundTo: 100,
};

/** ארבעה מנעולים בלתי תלויים. כל אחד לבדו מבטל את התצוגה. */
export function estimateEnabled(
  format: ServiceFormatKey | null,
  p: PricingConfig = PRICING,
  legal = LEGAL,
): boolean {
  if (!format) return false;
  const band = p.perPerson[format];
  return (
    // 1. טווח מלא וחיובי לפורמט הנבחר
    !!band &&
    typeof band.min === "number" && typeof band.max === "number" &&
    band.min > 0 && band.max >= band.min &&
    // 2. תאריך מחירון מאושר
    typeof p.approvedAt === "string" && /^\d{4}-\d{2}-\d{2}$/.test(p.approvedAt) &&
    // 3. הכרעה מפורשת בשאלת המע״מ
    (p.vatStatus === "included" || p.vatStatus === "excluded") &&
    // 4. טקסט הסייג שאושר על ידי הבעלים — מ־content/legal.ts, לא מכאן
    typeof legal.PRICE_ESTIMATE_NOTE === "string" &&
    legal.PRICE_ESTIMATE_NOTE.trim().length > 0
  );
}
```

Four locks, not one, because the failure mode is a developer filling `perPerson` from a phone call and forgetting everything else. Lock 4 is the correction to prior-review A2: the qualifier is **not** a template in this spec with the guest count slotted in — it is an owner-written string in `content/legal.ts`, and no code path can synthesise it. Without `approvedAt` there is no date to print; without `vatStatus` the figure is legally ambiguous; without `PRICE_ESTIMATE_NOTE` there is no qualifier; any omission suppresses the whole block.

### 2.3 Rendering, when enabled

```tsx
// EstimateRange.tsx — returns null unless all four locks pass for THIS format
export function EstimateRange({ format, band }: Props) {
  if (!estimateEnabled(format) || !band) return null;
  const p = PRICING.perPerson[format]!;
  const lo = roundTo(band.min * p.min!, PRICING.roundTo);
  const hi = roundTo(band.max * p.max!, PRICING.roundTo);
  // …
}
```

Markup order — the qualifier is the **same type size, weight and colour** as the figure, and sits **above** it. A grey 11px footnote under a 4xl bold ₪ figure is the exact pattern that fails the reasonable-consumer test.

```
טווח מחירים משוער
{{LEGAL.PRICE_ESTIMATE_NOTE}}                 ← same size, same weight, above the number
‹span dir="ltr"›8,000 – 14,000 ₪‹/span›       ← tabular-nums, LTR-wrapped
{{VAT_LINE}}                                   ← derived from PRICING.vatStatus, never invented
מבוסס על מחירון {{PRICING.approvedAt}}. הערכה בלבד ואינה הצעה מחייבת.
המחיר הסופי ייקבע בהצעה בכתב לאחר בירור פרטי האירוע.
```

`VAT_LINE` is exactly one of two fixed strings selected by `vatStatus`, and neither exists when it is `null`:

```
vatStatus === "included"  →  המחירים בשקלים חדשים וכוללים מע״מ.
vatStatus === "excluded"  →  המחירים בשקלים חדשים ואינם כוללים מע״מ.
```

**Bidi:** the numeric range **must** sit inside `<span dir="ltr">`. `<bdi>` does not fix it — an isolate is substituted by U+FFFC (class ON) and the two number runs still mirror. `Intl.NumberFormat.formatRange` also reverses. Only an LTR container works. Currency is number-first with a non-breaking space (`120 ₪`), formatted through one shared `Intl.NumberFormat('he-IL', {style:'currency', currency:'ILS'})`.

### 2.4 Adjacency rule

No estimate output may sit in the same viewport as any control that could read as acceptance. The estimate appears on builder screen 5; the only actions in that viewport are `שלחו לי הצעה` and `עדיף לי בוואטסאפ` — both requests, neither an order. No payment field, no `הזמינו`, ever on the same screen as a figure. Keep at least one genuinely open essential term (final menu, headcount confirmation, logistics) so the output cannot satisfy `מסוימות`.

### 2.5 Guest counts below `MIN_GUESTS`

If and only if `MIN_GUESTS` is set and the visitor's band floor is below it, show an honest downgrade rather than proceeding silently:

```
מתחת ל־{{MIN_GUESTS}} סועדים קייטרינג מלא פשוט לא משתלם לכם.
נשמח להציע מגשי אירוח מהמסעדה — זה יוצא מאותו מטבח.
```

The lead is still captured (`path='quote'`, band recorded) — a small order is a real customer and a future referral, and routing them away honestly is the cheapest credibility on the site. **If `MIN_GUESTS` is unset, this block does not render and no band is treated as too small.**

### 2.6 Guest counts above `MAX_GUESTS`

If `MAX_GUESTS` is set and the selected band's floor exceeds it, show an honest note and **still capture the lead**:

```
{{MAX_GUESTS}} סועדים זה הרף שאנחנו מרימים בשלושת המטבחים יחד.
מעל זה — דברו איתנו, נגיד לכם ישר אם זה אפשרי.
```

This is a deliberate change from the first pass, which removed over-capacity bands from the option list. Removing the option prevents the buyer from describing their event and loses the lead outright; the honest note keeps it and converts a limit into scarcity. If `MAX_GUESTS` is unset, all bands render and no capability is implied either way — selecting a band is the buyer describing their event, not us promising to serve it.

### 2.7 Guest bands carry no commercial meaning

`config/quote.ts` holds the band boundaries. They are a UX and analytics segmentation and they are **not** a published minimum, maximum, or price tier. If the owner later supplies a real `MIN_GUESTS` that falls inside a band, the boundaries are re-cut in config; no component changes, and the `guest_band` dimension is versioned via `config/quote.ts` `BANDS_VERSION` so historical reports are not silently re-bucketed.

---

## 3. The quote builder — `התפריט שלכם`

Component: `client/src/components/quote/QuoteBuilder.tsx`. One component, used by every route that has a builder, initial state from props. Section heading on the page: `05 · התפריט שלכם`.

### 3.1 Shape and the PII boundary

**5 screens: 4 questions + 1 contact screen. All PII confined to screen 5.**

Ordering law, enforced in review: sort fields by (information value to the kitchen) ÷ (perceived risk to the buyer), descending, and **never place a PII field above a non-PII field**. Abandonment on screens 1–4 costs a data point; abandonment on screen 5 costs a lead. The rationale is recorded here so a later "optimisation" cannot quietly undo it. The current form does the exact inverse — `name` is field 1 and `phone` field 2 of an 8-field single screen (`contact.tsx`).

Progress label: `שאלה {n} מתוך 4` for screens 1–4, then `פרטים ליצירת קשר` for screen 5. Discrete steps, never a percentage. `aria-live="polite"`.

Progress bar **fills right-to-left**. A left-filling bar in an RTL page reads as regressing. Implement with `inset-inline-end: 0; inline-size: {pct}%` inside the track, never `transform-origin: left`.

**The brief card.** Every answered question is echoed back into a visibly growing card set in the **same typography as the printed menu** — dish-row grammar, hairline rules, tabular figures. This is the accumulating sunk investment the buyer can see, and it is also the mechanism that catches a mis-seeded `eventType` from a forwarded link. Each row is clickable and jumps back to its screen.

### 3.2 Screen 1 — סוג האירוע (no PII)

Legend: `איזה אירוע?`
Chips (radio group, not `<select>` — a native select costs a tap and reads bureaucratic; six tiles maximum):

| Stored `event_type` | Label | Gate |
|---|---|---|
| `אירוע חברה` | אירוע חברה | always |
| `שמחה פרטית` | שמחה פרטית | always |
| `אירוח משפחתי או חג` | אירוח משפחתי או חג | always |
| `יום כיף או כנס` | יום כיף או כנס | always |
| `אירוח אצלנו במסעדה` | אירוח אצלנו במסעדה | **`∃ branch : privateEventCapacity !== null`** |
| `משהו אחר` | משהו אחר | always |

The fifth chip is gated (prior review A5). Private-event capacity per restaurant — seated, standing, whether the space can be closed off, parking, accessibility — is an unanswered owner question, and offering the option is a representation that the restaurants host private events. When the gate fails, the chip does not render, `at_restaurant` is not a selectable service format (§3.4), and the site says nothing about hosting.

When the gate passes, this is the cheapest keyword cluster in the entire map (`מסעדה לאירוע פרטי`, `סגירת מסעדה לאירוע`, `חדר פרטי במסעדה`) because the caterer-versus-caterer bidding war does not touch it, and it is a revenue line the current site does not offer at all.

Required. Pre-seeded and **visibly selected** when the route or a dish selection supplies it.

### 3.3 Screen 2 — מספר סועדים (no PII)

Legend: `כמה סועדים, בערך?`
Helper: `אפשר לשנות אחר כך — אנחנו יודעים שהמספר הסופי מתגבש ברגע האחרון.`

Segmented bands, **never a number input**. A free number invites false precision the buyer does not have, summons the wrong mobile keyboard, and is mutable by scroll wheel. It also removes the current contradiction where the client caps at `max="500"` while the server accepts 5000 — silently telling a 600-guest buyer we cannot help.

| Stored `guest_band` | Label (bidi-safe) | floor | ceiling |
|---|---|---|---|
| `lt25` | `עד 25` | 1 | 25 |
| `25_50` | `בין 25 ל־50` | 25 | 50 |
| `50_100` | `בין 50 ל־100` | 50 | 100 |
| `100_200` | `בין 100 ל־200` | 100 | 200 |
| `200p` | `200 ומעלה` | 200 | null |

Labels use Hebrew connectors (`בין X ל־Y`) and the maqaf U+05BE. **Never an en-dash between digits**: `25–50` renders as `50–25` in an RTL paragraph, which on a guest selector is a consumer-facing misstatement, not a cosmetic bug. The design reference's own builder markup at `index.html:369-372` ships `25–50`, `50–100`, `100–200` — all of them are wrong and must be rewritten. Stored values are underscore-delimited ASCII (never displayed) so `guest_band` is a stable analytics dimension immune to relabelling.

Required. Selection triggers §2.5 / §2.6 where those slots are filled, and always advances.

### 3.4 Service format — captured as a menu choice, not a builder question

This is a TAFRIT mechanic and it is why the builder is four questions rather than five. Page section `02 · התפריטים לאירוע` presents the service formats as three or four **fixed chef's menus**, each with a real dish list and an inclusions/exclusions column. Choosing one seeds `service_format` on the builder and on the draft, and appears as a row in the brief card.

`client/src/config/service-formats.ts`:

```ts
export interface ServiceFormat {
  key: ServiceFormatKey;
  label: string;                 // display only — fixed, not an owner slot
  /** האם השירות מוצע בפועל. null = לא נשאל / לא אושר → הפורמט אינו מרונדר. */
  offered: boolean | null;
  /** מה כלול — פריטים בלבד, כפי שהבעלים ניסח. */
  includes: string[] | null;
  /** מה לא כלול — עמודה שווה במשקל. */
  excludes: string[] | null;
  /** מזהי מנות מ־data/menus.ts */
  dishIds: string[];
}

export const SERVICE_FORMATS: ServiceFormat[] = [
  { key: "delivery",       label: "מגשים — משלוח והנחה",          offered: null, includes: null, excludes: null, dishIds: [] },
  { key: "buffet_on_site", label: "בופה במקום",                    offered: null, includes: null, excludes: null, dishIds: [] },
  { key: "plated_staffed", label: "מוגש בצלחות, עם צוות שלנו",     offered: null, includes: null, excludes: null, dishIds: [] },
  { key: "at_restaurant",  label: "אירוח אצלנו במסעדה",            offered: null, includes: null, excludes: null, dishIds: [] },
];
```

Render rules:

- A format renders **only** where `offered === true`. `plated_staffed` in particular asserts that waiters, service equipment and porcelain are available — an open owner question. `at_restaurant` additionally requires `∃ branch : privateEventCapacity !== null`.
- Where `includes`/`excludes` are unfilled, the format's card **collapses to a menu-style list of its dishes** — never a gapped grid with empty cells. An incomplete table reads as an unfinished quote; a menu-style list without prices reads as a legitimate chef's-menu convention.
- **`מה לא כלול` is a published column of equal weight to `מה כלול`**, not a sentence appended to the inclusions list. Restaurant-grade Italian loses a bare per-portion comparison against a 39–65 ₪ category band; inclusions-and-exclusions is the axis where it wins, and the exclusions half is what pre-empts the objection that kills deals in week two.
- If **no** format has `offered === true`, section 02 does not render, `service_format` stays `null` on every lead, and the estimate is off by construction (§2.2 requires a format). This is an acceptable launch state and it looks intentional: the site is a menu, and a menu need not describe service tiers.

### 3.5 `מה אנחנו לא עושים` — its own block, not a footnote

Grafted from the Decision Sheet, and it belongs to the lead machine because it is a qualification mechanism, not a content decision. A standalone limits block sits in page section 03, adjacent to `מה כלול, ומה לא`:

- No competitor in the category publishes a limit of any kind.
- It disqualifies bad-fit leads before they cost a phone call.
- It is the register that makes every other number on the page believable.

Every figure in it is an owner-signed Slot with a row-level prune: minimum portions, lead time per format, delivery window, self-pickup per branch, delivery area, same-day cutoff. An invented capacity, minimum or cutoff is an **operational commitment against three restaurants' reputations**, and a missed same-day promise is the fastest reputation kill in this vertical. With every slot empty the block does not render, and the limits it would have stated are simply absent.

### 3.6 Screen 3 — תאריך (no PII)

Legend: `מתי?`
Field label: `תאריך האירוע`
Escape hatch, mandatory: `☐ התאריך עוד לא נקבע`
Helper: `אם זה בימים הקרובים — כתבו. יש לנו שלושה מטבחים, לפעמים זה מסתדר.`

That helper is the only place on the site where three kitchens converts directly into a booking, and a single-kitchen caterer cannot write it. Note it promises nothing — `לפעמים זה מסתדר` is honest about a capacity we have not published.

**Not required.** Either a date, or the checkbox, or neither — the visitor may advance regardless. Date is the highest-signal qualifier and costs one tap, but forcing it on a buyer comparison-shopping six months out loses the lead.

**Do not use native `<input type="date">`.** It renders LTR with device-dependent locale inside an RTL page. Use three `inputMode="numeric"` fields (day / month / year) or an RTL-aware picker. Store as ISO `YYYY-MM-DD`.

**Date-derived behaviour — no price effect.** The 15% weekend surcharge (`price-calculator.tsx:75`) is invented and is deleted in P3. Instead, `date_flag` is computed **server-side** and changes the follow-up copy, never a number:

```
התאריך שבחרתם הוא ערב שבת. נאשר לכם שעת הגשה מדויקת בשיחה.
```

Note what that string does *not* say: it does not claim we work on Friday evenings. It says we will confirm a serving time by phone, which is true of every date.

**Timezone rule, global to this document (prior review D7).** All calendar and clock logic — `date_flag`, answering-hours gating, `is_business_hours`, the escalation window, any cutoff display — is computed with `Intl.DateTimeFormat` and an explicit `timeZone: 'Asia/Jerusalem'`, **server-side**. The client's device clock is never trusted. `new Date(x).getDay()` parses as UTC and misclassifies Friday/Saturday for Israeli users near midnight; that bug is live in the code being deleted and must not be reintroduced.

`date_flag` values are exactly `'friday' | 'saturday' | null`. **`chag_adjacent` is deleted** — it requires a Hebrew-calendar dependency that `03` §11.3 removes and does not replace, and per-חג capability is an unanswered owner question. Re-adding it requires both a named calendar source and the owner's per-חג answer; until then a חג-adjacent date is handled by a human, which is what actually happens anyway.

**Never build a fake availability API.** `בדקו זמינות לתאריך שלכם` is honest as a CTA label only because it starts the human process that checks. A synthetic green/red answer would be an invented business fact.

### 3.7 Screen 4 — אזור (no PII) — sourced, never published (prior review A3)

Legend: `איפה האירוע?`

The first pass hardcoded four catchment chips (`הרצליה / רמת השרון`, `רעננה / כ״ס / הוד השרון`, `פתח תקווה / גוש דן`, `תל אביב`) and answered a selection with `המטבח שלנו ברעננה מבשל את האירוע הזה`. That is a published delivery catchment plus a service promise, on the primary conversion surface, invented. `faq-data.ts:34-49`'s ~14 invented service cities are being deleted for exactly this reason.

**Corrected model.** Areas come from `client/src/data/locations.ts`:

```ts
export interface Branch {
  slug: "herzliya-pituach" | "raanana" | "petah-tikva";
  nameHe: string;                       // fixed, not a slot — the branch exists
  address: string | null;
  hours: OpeningHours | null;
  telE164: string | null;
  telDisplay: string | null;
  waNumber: string | null;              // digits only, no +, no leading 0
  gbpUrl: string | null;                // Google Business Profile — the only honest ratings display
  chefName: string | null;
  /** ערים/אזורים שהסניף הזה מגיש להם בפועל. null = לא נמסר → אין רשימת אזורים. */
  servesAreas: string[] | null;
  /** קיבולת אירוע פרטי במסעדה. null = לא נמסר → 'אירוח אצלנו' לא מוצע. */
  privateEventCapacity: PrivateEventCapacity | null;
  liveMenuUrl: string | null;
}
```

Render logic:

```
areas = union over branches of (servesAreas ?? [])

if areas.length === 0:
    → single free-text field, label 'עיר האירוע', inputMode="text", autoComplete="address-level2"
    → helper: נבדוק הובלה ונגיד לכם ישר, לפני שתשקיעו בזה זמן.
    → no kitchen is named, no service is implied, area stored verbatim (capped 60 chars)

else:
    → one chip per area, each mapping to its owning branch
    → plus a permanent chip 'אזור אחר' that reveals the same free-text field
    → selecting a mapped chip renders the inline routing line below
```

Inline routing line, rendered **only** for a mapped chip and **only** where that branch's address is filled:

```
המטבח שלנו ב{{BRANCH_NAME}} מבשל את האירוע הזה — {{BRANCH_ADDRESS}}.
```

`אזור אחר` never names a kitchen and shows the free-text helper instead.

This is the single largest unclaimed mechanic in the category — no caterer in the Sharon or Gush Dan uses branch selection as an ordering mechanic; only Roladin, a bakery chain, does — and it costs one lookup. But it is only sayable where the owner has said it. Required (a chip or non-empty text).

The `TA_DEFAULT` slot from the first pass is deleted: Tel Aviv appears if and only if a branch lists it.

### 3.8 Screen 5 — פרטים (the only PII screen)

Legend: `לאן נחזור אליכם?`

Order within the screen, top to bottom:

1. **Estimate block** — renders only per §2.2. Above the fields, so the buyer gets something for their effort before being asked for anything.
2. **Brief card** — every prior answer plus any selected dishes and the chosen service format, echoed back in menu typography, each row clickable back to its screen.
3. `שם` — `autoComplete="name"`, required, 2–80 chars.
4. `טלפון` — `type="tel" dir="ltr" inputMode="tel" autoComplete="tel"`, required, with `text-align: right` and a base rule `input[dir="ltr"]::placeholder { direction: rtl; text-align: right }` so the Hebrew placeholder stays right while typed digits run LTR.
5. **Contact-channel toggle** — `איך נוח לכם? ( וואטסאפ / שיחה )`, default `וואטסאפ`. Stored in `contact_channel`.
6. `אימייל` — **collapsed**, optional, framed as `הצעה כתובה לשלוח למישהו נוסף?` — which reframes the field from surveillance to utility and names the second decision-maker, who is the person the summary card is built for.
7. **Collection notice** — inside the form component, above the submit button. Static text, always visible, no modal, no interaction (§3.9).
8. **Marketing consent** — one checkbox, unchecked, optional, never a condition of submitting (§3.9). **Not rendered on `/catering/shiva`.**
9. **Submit row** — `שלחו לי הצעה` (filled) + `עדיף לי בוואטסאפ` (WhatsApp-green outline).
10. **Reassurance lines** (§3.10).
11. **Commercial-terms strip** — deposit / cancellation / headcount deadline / quote validity, all Slots, collapses entirely if empty (§3.12).

**Dropped fields, deliberately.**

- **תקציב — deleted.** The highest-abandonment field in event catering: the buyer does not know the answer, it feels like being sized for a markup, and it is maximally threatening to someone spending a committee's money. Its qualifying function is fully served by `guest_band` × `event_type` × `service_format` × `area`. If the owner needs it for triage, infer it server-side. This also removes four more invented ₪ strings (`contact.tsx:230-233`).
- **פרטים נוספים (free text) — moved to after submission**, on `/thanks`, as optional enrichment. High value to the kitchen, high friction to the buyer, therefore asked post-commitment. Placeholder there: `טבעונים, שעת הגשה מדויקת, חניה — כל דבר שיחסוך שיחה.`
- **אלרגיות as a pre-submit prompt — never.** The current placeholder (`contact.tsx:252`) actively solicits `מידע רפואי`, which is `מידע בעל רגישות מיוחדת` under תיקון 13. That one string reclassifies a marketing lead table as a health database, raises the required security tier, raises per-subject penalty exposure and imports heightened-consent expectations. Dietary and allergen data is collected **after booking**, over the operational channel, into the event file — never into `leads`. Note the post-submit placeholder above deliberately omits the word `אלרגיות` for the same reason.

Required notice line on screen 5: `הטופס מיועד לבני 18 ומעלה. אין למסור כאן מידע רפואי או פרטים של אנשים אחרים.` This is enforceable by design, unlike the current privacy page's unenforceable claim that we do not collect minors' data — and the event-type list includes בר/בת מצווה, so third-party and minors' details would otherwise routinely arrive in free text.

### 3.9 Legal blocks live inside the form component

Both live **inside** `QuoteBuilder`, not beside it, and `sourcePage` is a **required prop**. This is what makes it structurally impossible for the eighth landing page, written under deadline, to ship a bare form.

**Collection notice** (`סעיף 11`, as expanded by תיקון 13). Static, always visible, above submit:

```
המידע נמסר מרצונכם ואין חובה חוקית למסור אותו; בלי שם וטלפון לא נוכל לחזור
אליכם עם הצעה. המידע נשמר אצל {{LEGAL_ENTITY}}, ח.פ. {{COMPANY_ID}}, בעל
השליטה במאגר, ומשמש רק כדי לחזור אליכם בנוגע לפנייה ולהכין הצעת מחיר. נגישים
אליו מי שמטפל בהזמנות בשלוש המסעדות וספק התוכנה שמאחסן את האתר. אתם רשאים
לעיין במידע שעליכם ולבקש לתקן או למחוק אותו: {{PRIVACY_CONTACT}}.
הרחבה: [מדיניות הפרטיות].
```

`LEGAL_ENTITY`, `COMPANY_ID` and `PRIVACY_CONTACT` are **build-blocking** Slots (§7) — they throw during a production build if unset. This is the one place where a placeholder is not merely sloppy but a defective statutory notice. The same entity string must appear identically here, in `terms`, and in `privacy`; three different names is itself a finding.

The precise wording of the notice, the terms and the policy is owned by `04-legal-and-content.md` and must be reviewed by Israeli privacy counsel before launch. What this document owns is that the notice **is present, inside the component, on every collection point, with the entity slots build-blocking**.

**Marketing consent** — one checkbox, unchecked, optional, non-blocking:

```
☐ אני מאשר/ת שמאמא מיה תשלח לי הצעות ועדכונים על קייטרינג בוואטסאפ,
   ב־SMS או במייל. ניתן להסיר את ההסכמה בכל הודעה.
```

**Zero required checkboxes.** Do not add `אני מאשר/ת את מדיניות הפרטיות` as a gate — Israeli law does not require it, it is widely mis-sold by website vendors as a תיקון 13 requirement, and it costs a click for no legal protection. The lawful basis for handling the enquiry is the voluntary submission plus the notice above.

The marketing checkbox is not optional to *build*. `ס' 30א לחוק התקשורת` grants statutory damages up to **₪1,000 per message** with no proof of damage and is the standard vehicle for Israeli class actions; WhatsApp is covered, not just SMS and email. `consent_marketing` must exist in the schema **before the first lead is collected** — retrofitting consent to already-collected rows is impossible. Store `consent_text_version` (a hash or tag of the exact string shown) so the wording is provable a year later.

**The checkbox text promises a working refusal mechanism, so one must exist.** `/unsubscribe` is specified in §9.7; without it the copy is a promise the system cannot keep, which is itself a `ס' 2` problem.

### 3.10 Reassurance copy

Directly under the submit button:

```
לא שולחים ניוזלטר ולא מעבירים את הפרטים לאף אחד.
שיחה או וואטסאפ אחד בנוגע לאירוע — וזה הכל.
```

Second line, Slot-gated:

```
בדרך כלל חוזרים {{RESPONSE_TIME}}.
```

**These are factual commitments.** The first line must match `privacy.tsx` and actual CRM behaviour or it becomes a fresh honesty violation — specifically, it is false the moment leads are forwarded to any third party for event execution, and whether that happens is an open owner question. **If the owner will not confirm "no newsletter, no data sharing," the first line does not ship.** `RESPONSE_TIME` is a Slot and must never default to `24 שעות` — a 24-hour promise is a losing SLA in this category and the easiest claim for a disappointed lead to screenshot.

### 3.11 Validation, auto-advance, back navigation, keyboard

**Validation timing.** Per-screen, on advance attempt only. Never on blur while typing.

| Screen | Rule | Failure behaviour |
|---|---|---|
| 1 | one chip selected | 300ms shake on the fieldset, focus first chip, `בחרו סוג אירוע כדי להמשיך.` |
| 2 | one band selected | same, `בחרו מספר סועדים משוער.` |
| 3 | none | advances freely |
| 4 | one chip **or** non-empty city text | same, `כתבו איפה האירוע כדי שנדע איזה מטבח מבשל.` |
| 5 | name 2–80; phone passes shape check after normalisation | inline `role="alert"` under the field + focus to the first invalid |

Exact Hebrew errors:

- `צריך שם, כדי שנדע למי לחזור.`
- `המספר לא נראה תקין — בדקו שוב.`
- `כתובת המייל לא נראית תקינה.`
- submit failure: `השליחה לא עברה. נסו שוב, או פשוט התקשרו — {{TEL_DISPLAY}}.`

On submit failure the entered values are **preserved**, and the error renders as a persistent inline `role="alert"` beside the submit button — not only as a toast. A transient toast is a poor sole carrier for "your lead was not submitted."

**Phone normalisation happens before validation, server-side.** The current server regex rejects real input — `+972-054-1234567`, parenthesised forms, and critically in an RTL page, pasted numbers carrying U+200E / U+200F directional marks or non-breaking spaces:

```ts
const BIDI_AND_SPACE = /[‎‏‪-‮ \s()\-.]/g;

export function normalisePhone(raw: string): string | null {
  const cleaned = raw.replace(BIDI_AND_SPACE, "");
  const m = /^(?:\+?972|0)(\d{8,9})$/.exec(cleaned);
  if (!m) return null;
  const national = m[1];
  return /^(?:[23489]\d{7}|5\d{8}|7\d{8})$/.test(national) ? `+972${national}` : null;
}
```

Store `phone` (raw, for the owner to read and dial) **and** `phone_e164` (normalised). Without E.164, every enhanced-conversions upload and every call-record join is a silent no-match with no error surfaced anywhere. The shape regex applies only after normalisation.

**Auto-advance.** Selecting a chip on screens 1, 2 and 4 advances after **220ms**. Screen 3 never auto-advances (a date is typed, not tapped), and screen 4 does not auto-advance from the free-text field. Auto-advance is **suppressed** if the visitor reached that screen via `← חזרה` in this session — otherwise a buyer trying to *change* an answer is bounced forward before they can see it. Track with `visitedBackward: Set<number>`.

**Back navigation.** `← חזרה` visible on screens 2–5, hidden on 1. Preserves all state, does not reset validation, also reachable by clicking any brief-card row. The browser back button does **not** step the builder — it navigates the route. Do not push a history entry per step; a five-entry history trap on mobile is worse than the friction it saves.

**Keyboard.** `Enter` on screens 1–4 acts as `הלאה`, never as submit — `onKeyDown` intercepts and calls `next()`. On screen 5, `Enter` submits. Arrow keys move within a chip radiogroup, which requires `<DirectionProvider dir="rtl">` at the app root (§0.5).

**Focus management.** On advance, move focus to the new screen's `<legend>` (`tabIndex={-1}`). Never trap focus in the builder — it is inline content, not a dialog. On invalid submit, render an error summary above the fields with `role="alert"` linking to each bad field, and move focus to the first invalid control.

**Accessibility gates** (asserted in CI, §13): axe-core clean at all five screens, at 320px viewport width and at 200% zoom; every field carries `autoComplete` (1.3.5 is AA in WCAG 2.1); required fields carry `aria-required`, not only a `*` in the label text.

### 3.12 Commercial-terms strip

Directly under the submit button, and repeated on `/thanks` and `/summary`. Compact hairline table, all Slots, **collapses entirely if all are empty**:

| | |
|---|---|
| מקדמה | `{{DEPOSIT_TERMS}}` |
| ביטול | `{{CANCELLATION_SUMMARY}}` |
| שינוי מספר סועדים עד | `{{HEADCOUNT_DEADLINE}}` |
| תוקף ההצעה | `{{QUOTE_VALIDITY}}` |

Nothing raises an accountable buyer's confidence faster than seeing these **before** committing, because they are exactly the facts they will be asked to defend. Rows prune individually (`<SlotRow>`), so a partially-answered owner still gets a correct strip.

`CANCELLATION_SUMMARY` is a **summary of** the clause in `/terms`, not a second policy. Note that `faq-data.ts:66-72` and `terms.tsx:77-79` currently publish two contradicting cancellation policies (24h versus 72h); internal contradiction between two published policies is independently damaging. Both are deleted in P5 and replaced by one Slot rendered from `content/legal.ts`. The clause itself must grant the statutory distance-selling minimum before adding contractual tiers — drafting is owned by `04-legal-and-content.md`; this document owns only that the strip renders from a single source and never from a default.

### 3.13 `client/src/content/legal.ts`

```ts
export const LEGAL = {
  PRICE_ESTIMATE_NOTE: null as string | null,
  VAT_NOTE: null as string | null,              // derived display only — see §2.3
  KASHRUT_BY_BRANCH: {
    "herzliya-pituach": null, "raanana": null, "petah-tikva": null,
  } as Record<string, string | null>,
  ALLERGEN_NOTE: null as string | null,
  CANCELLATION_SUMMARY: null as string | null,
  DEPOSIT_TERMS: null as string | null,
  HEADCOUNT_DEADLINE: null as string | null,
  QUOTE_VALIDITY: null as string | null,
  TASTING_POLICY: null as string | null,
  RESPONSE_TIME: null as string | null,
  ANSWERING_HOURS: null as string | null,
  AWAY_MESSAGE: null as string | null,
  MIN_GUESTS: null as number | null,
  MAX_GUESTS: null as number | null,
  LEAD_RETENTION_MONTHS: null as number | null,
} as const;
```

Every value is `null` and every consumer degrades. `KASHRUT_BY_BRANCH` holds the owner's sentence **verbatim, per branch**, and is rendered as a sentence in the FAQ and nowhere else — never as a badge or a seal, because a badge implies certification and a sentence states a fact. This document ships **no** sample kashrut wording in either the positive or the negative direction (prior review A7); the first pass shipped a copy-pasteable "no certificate" formulation, which is itself a per-branch factual claim about suppliers and ingredients.

The price and terms components **refuse to render without their corresponding note prop.** A new city page then physically cannot ship a number without its qualifier — the failure mode of a twelve-page site is a copy-paste of the claim without the caveat, and this is the only structural defence against it.

---

## 4. `הוסיפו לתפריט שלי` — the dish-level micro-commitment

The best top-of-funnel mechanic in any of the three judged directions, and the mechanism that makes multiple landing pages actually pay: each dish selection seeds the builder, so the buyer starts at screen 2 instead of screen 1. Fewer steps raises completion and the page feels bespoke rather than generic.

### 4.1 Behaviour

- A quiet `+ הוסיפו לתפריט שלי` control sits at the end of every dish row in page section 01 and on every chef's-menu card in section 02. Ghost weight, never filled — it must not compete with the section's primary CTA.
- Clicking it is **PII-free**, requires no scroll, and produces a one-line acknowledgement in place: `נוסף לתפריט שלכם · {n} מנות`.
- A small persistent counter appears in the sticky bar (`{n} מנות`) linking to `#quote`. It is a text affordance, not a button, and does not count against the two-CTA rule.
- Selections persist in `localStorage` under the builder draft (§5.1) and are sent to the draft row.
- On entering the builder, selections appear as a row in the brief card: `מהתפריט: פפרדלה רגו · קרפצ׳ו · טירמיסו`. They are removable there.
- Selecting a dish that belongs to exactly one service format seeds `service_format`. Selecting dishes across formats seeds nothing and is not an error — the builder simply asks nothing extra.
- Analytics: `add_to_brief` with `dish_id`, `source_page`, `brief_size` (§11.2).

### 4.2 The dish record — normative contract (prior review E7)

No spec previously defined this, and three tracks depend on it. `client/src/data/menus.ts`:

```ts
export interface Dish {
  id: string;                             // stable slug, never renamed — it is an analytics dimension
  nameHe: string;                         // real dish name from the restaurant menu
  /** תיאור קצר — עד 12 מילים. חובה מבחינת עיצוב (03 §dish row), לא מבחינת נתונים. */
  descriptionHe: string | null;
  course: "antipasti" | "pasta" | "mains" | "desserts";
  /** האם המנה זמינה בפועל לקייטרינג. null/false → אינה מופיעה בסעיף 01. */
  cateringAvailable: boolean | null;
  /** באילו סניפים היא על התפריט הפעיל היום. ריק → אין סימון «מוגש היום ב…». */
  servedAtBranches: BranchSlug[];
  /** קישור למנה בתפריט המסעדה החי, לפי סניף. חסר → אין קישור צולב. */
  liveMenuUrl: Partial<Record<BranchSlug, string>>;
  serviceFormats: ServiceFormatKey[];     // which chef's menus include it
  dietary: Array<"vegetarian" | "vegan" | "gluten_free_ingredients">;
  /** אין שדה מחיר. מחירים חיים אך ורק ב־config/pricing.ts. */
}
```

There is deliberately **no price field on a dish.** A per-dish price is a price, and prices live behind the four locks in §2.2 or they do not exist.

`dietary` uses `gluten_free_ingredients`, never `gluten_free`. The kitchens are shared; "ללא גלוטן" is a safety claim we cannot make, and the honest formulation is "ללא גלוטן במרכיבים, מוכן במטבח שאינו נקי מגלוטן" — which is `LEGAL.ALLERGEN_NOTE`, owner-supplied, rendered once in the FAQ.

With `menus.ts` empty — the launch state until the owner supplies the catering-available list — page section 01 renders nothing, `add_to_brief` never fires, and the builder entry is cold but functional. This is the direction's largest single-point dependency and it is stated as such: the menu is the one asset the client already holds as a finished physical object, but nobody has confirmed which dishes are catering-available.

---

## 5. Confirmation and the forwardable artifact

### 5.1 `/thanks?ref=` is a route change, not an in-place swap (prior review B2)

The current handler shows a toast and calls `form.reset()` — the buyer's screen returns to an empty form and they hold nothing they can show anyone. That is a wasted conversion stage.

The confirmation is a **route change to `/thanks?ref=MM-7F3K2Q`**, not a component swap. Without a URL change no analytics platform can record a page-level conversion, and the post-submit enrichment textarea works identically on a route. This resolves the first pass's contradiction between `01` P-18 (route) and `02` §3.9 (swap): the route wins.

Navigation is `wouter`'s `setLocation` after the POST resolves, so the builder state is still in memory and `/thanks` renders instantly from it; the `?ref=` param is what makes the page survive a reload or a forward.

### 5.2 What `/thanks` renders

```
קיבלנו.
מספר פנייה: MM-7F3K2Q

‹brief card — their answers and selected dishes, in menu typography›

{{ROUTING_LINE}}
{{RESPONSE_LINE}}

[ המשיכו בוואטסאפ ]              ← dominant filled button, thread prefilled with the brief + ref
  הדפיסו / שתפו את הסיכום        ← window.print() + Web Share API, falls back to copy-link
  משהו שכדאי שנדע? [textarea]     ← optional post-commitment enrichment → PATCH /api/quote/:ref/notes
  {{TASTING_LINE}}                ← only if §1.6 gate passes

‹commercial-terms strip — §3.12, prunes per row›
```

Slot-gated lines, each pruning independently:

- `ROUTING_LINE` → `הפנייה נשלחה למטבח ב{{BRANCH_NAME}}.` Renders only when `branch` was resolved from a mapped area chip. This is the branch routing stated as fact at the moment of conversion, and no competitor can say it.
- `RESPONSE_LINE` → `נחזור אליכם ב{{contact_channel}} — {{RESPONSE_TIME}}.` If `RESPONSE_TIME` is unset it degrades to `נחזור אליכם ב{{contact_channel}}.`
- `TASTING_LINE` → `בואו לטעום הערב במסעדה →` gated per §1.6.

**No-`ref` and unknown-`ref` states** (prior review B2, E4):

| Condition | Render |
|---|---|
| `?ref` absent | Generic `קיבלנו.` with no brief card, no ref, no enrichment box, plus links to `/menus` and the WhatsApp CTA. Never an error page. |
| `ref` well-formed but not found (purged, or typo) | `לא מצאנו את מספר הפנייה הזה. יכול להיות שעבר הרבה זמן. דברו איתנו ונמצא אתכם.` + WhatsApp + phone. HTTP 200, `noindex`. |
| `ref` malformed | Same as unknown. Never echo the raw param back into the DOM. |

`/thanks` and `/summary` are `noindex, nofollow` and `Cache-Control: no-store`.

### 5.3 `/summary?ref=` — the artifact the second decision-maker reads

Same content, standalone, forwardable, printable, no builder chrome, no sticky bar. Its job is to be **the document a buyer forwards to a spouse, committee or CFO** — that person is a second click no other mechanism earns.

**Rendered as a menu card, not an invoice.** A document that looks like a quote invites price negotiation; a document that looks like a menu invites approval. Same content — event spec, selected dishes, inclusions, exclusions, terms strip, ref code, cooking kitchen's address — set as a menu leaf with hairline rules and tabular figures.

Implementation: client-rendered from `GET /api/quote/:ref` behind a query param. Do **not** build `/סיכום/:ref` — a Hebrew slug percent-encodes to roughly nine URL characters per letter, producing 200+ character URLs that break in ad-platform UTM builders, CRM fields, print collateral and analytics reports, and an LTR URL embedded in RTL Hebrew text reorders visually. If it later earns a path segment, it is ASCII: `/summary/:ref`.

**Staleness contract**, which must be stated on the page itself because the artifact outlives the session:

```
הסיכום משקף את מה שנשלח ב־{{createdAt}}. הצעת המחיר עצמה נשלחת בנפרד בכתב.
```

The summary reflects the **submitted spec**, never later edits by staff — otherwise a committee reading it six weeks later sees a document that silently changed. Owner edits live in the admin view and in the written quote, not here.

Sharing fires `summary_share` with `share_method` (`webshare` | `copy` | `print`).

### 5.4 Print discipline — applies to `/summary`, `/thanks` and the menu sections

```css
@media print {
  @page { margin: 14mm; }
  body::after { display: none; }          /* grain layer off */
  header, nav, .sticky-bar, .cta, .builder { display: none; }
  .dish-row, .terms-row, tr { break-inside: avoid; }
  * { print-color-adjust: exact; -webkit-print-color-adjust: exact; }  /* hairlines survive */
  a[href^="http"]::after { content: " (" attr(href) ")"; font-size: 0.8em; }
}
```

The ref code and the cooking kitchen's address sit in the top block of the printed page. Page sections 01 and 02 print as a single-colour A4 menu — the site's central artifact becomes a physical object the kitchen can hand a walk-in customer, which costs one media query.

---

## 6. The WhatsApp engineering problem

### 6.1 The requirement

Commit the lead to the server **before** the browser leaves for WhatsApp, key it to the conversation, and attribute it — without an `await` and without an unload handler.

### 6.2 Why the two obvious approaches both fail

- **`await fetch()` then `window.open()`** — Safari/iOS blocks the open as a popup, because the user-gesture token expires the moment the promise yields. This is the single most likely way an implementer breaks this feature, and the "improvement" that causes it (awaiting so the server can mint the ref) looks like good engineering.
- **`navigator.sendBeacon` / `fetch(keepalive)` from `unload` / `beforeunload` / `pagehide`** — documented as unreliable and specifically failing on iOS; mobile browsers frequently never fire those events at all. Israeli catering traffic is heavily iPhone, so this fails silently for the majority.

### 6.3 The answer — client-generated ref, fire-and-forget POST, same-tick navigation

`client/src/lib/whatsapp.ts`:

```ts
import { WA_NUMBER } from "@/config/business";
import { attributionSnapshot, sessionId } from "@/lib/attribution";
import { track } from "@/lib/analytics";

const ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ"; // no 0/O/1/I — this gets read aloud on the phone

export function newRef(): string {
  const b = new Uint8Array(6);
  crypto.getRandomValues(b);
  return "MM-" + [...b].map((x) => ALPHABET[x % 32]).join("");
}

export type WaLocation =
  | "hero" | "sticky" | "footer" | "quote_alt" | "branch" | "urgent" | "shiva" | "thanks";

export interface WaPayload {
  waLocation: WaLocation;
  branch?: BranchSlug | null;
  eventType?: string; guestBand?: string; eventDate?: string; area?: string;
  serviceFormat?: ServiceFormatKey | null;
  dishIds?: string[];
  name?: string; phone?: string;      // present only from the builder's secondary submit
}

/**
 * חשוב מאוד: אין await לפני הניווט.
 * הוספת await תשבור את וואטסאפ ב־iOS (חוסם חלון קופץ אחרי שה־promise נכנע).
 * ה־POST הוא fire-and-forget והלקוח מתעלם מהתשובה לחלוטין.
 */
export function openWhatsApp(p: WaPayload): string {
  const ref = newRef();
  const text = buildHebrewMessage(p, ref);
  const url = `https://wa.me/${waNumberFor(p.branch)}?text=${encodeURIComponent(text)}`;

  fetch("/api/wa-intent", {
    method: "POST",
    keepalive: true,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ref, sessionId: sessionId(), ...p,
      ...attributionSnapshot(), pageUrl: location.pathname + location.search,
    }),
  }).catch(() => {});                                   // never blocks, never throws

  track("whatsapp_handoff", { lead_ref: ref, wa_location: p.waLocation, branch: p.branch ?? null });
  rememberHandoff(ref, p);                              // §6.7 return-state

  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  if (isMobile) {
    window.location.href = url;                         // same tab, same tick
  } else {
    window.open(
      `https://web.whatsapp.com/send?phone=${waNumberFor(p.branch)}&text=${encodeURIComponent(text)}`,
      "_blank", "noopener",                             // a synchronous open inside the gesture is fine
    );
  }
  return ref;
}
```

Rules that must be written as comments in the file, because each will otherwise be optimised away:

1. **No `await` precedes the navigation.** CI asserts that no `await` token appears between the `fetch(` call and the navigation statement in this module.
2. **No `target="_blank"` on mobile.** After the OS hands off to the WhatsApp app, an orphaned blank tab is left behind and reads as a broken site.
3. **Never a bare `wa.me` href anywhere on the site.** Every WhatsApp CTA routes through this function. Gate: `rg 'wa\.me|api\.whatsapp\.com' client/src --glob '!client/src/lib/whatsapp.ts'` must return nothing.
4. **The client ignores the response.** A 429 or a 500 on `/api/wa-intent` must never prevent the redirect; the endpoint fails open (§12.3).
5. **`WA_NUMBER` is digits only** — full international format, no leading `+`, no leading zero, no spaces or dashes. `052-123-4567` → `972521234567`. Guard: `if (!/^972\d{8,9}$/.test(n)) throw`.

### 6.4 The prefilled message

Written in **first person as the customer** — the customer is the sender, and a business-voiced message reads as a bot.

```
היי, הגעתי מהאתר ורוצה הצעה לקייטרינג.

סוג האירוע: אירוע חברה
מספר סועדים: בין 50 ל־100
תאריך משוער: 15/09/2026
אזור: הרצליה
סניף מועדף: הרצליה פיתוח
מהתפריט: פפרדלה רגו, קרפצ׳ו, טירמיסו

מספר פנייה:
MM-7F3K2Q
```

Constraints:

- **Budget ≤ 300 Hebrew characters.** Hebrew inflates ~4.9× under `encodeURIComponent` (each Hebrew char is 2 UTF-8 bytes → `%D7%90`, 6 URL chars). 300 Hebrew chars ≈ 1,500 encoded, total URL under ~1,600. Unit test: `expect(encodeURIComponent(buildHebrewMessage(worstCase, ref)).length).toBeLessThan(1600)`. The dish list is truncated to the first three names plus `ועוד {n}` to stay inside it.
- The message carries a **summary plus the ref code**, never the full builder transcript. Full answers live in Postgres, retrieved by ref.
- Omit any line the visitor did not answer. Never `לא צוין`.
- Ref code on its **own final line** so LTR digits do not scramble the surrounding Hebrew.
- `encodeURIComponent` only. Never hand-build the query with `+` for spaces — `+` is form encoding and its handling in `?text=` is not guaranteed. Newlines encode to `%0A`.
- **No ₪ figure may ever enter the prefilled text**, even when §2.2's locks pass. A number that travels into WhatsApp becomes a written, timestamped, customer-retained quote from the business. The estimate stays on the page.
- Prefill text is **user-editable and is commonly cleared** before sending, especially on WhatsApp Web. Treat ref recovery as lossy and instrument the loss (§9.3).

### 6.5 Branch-named prefill and per-branch numbers

The WhatsApp button in each branch column of page section 04, and on each `/kitchens/:slug` page, prefills `סניף מועדף: {branch}` and passes `branch`, so the row arrives pre-routed. `waNumberFor(branch)` returns `locations[branch].waNumber ?? BUSINESS.WA_NUMBER`.

**Recommendation: one central number at launch**, with `branch` captured on the row and named in the prefill. One number means one Away message, one ref space, one SLA and one analytics series. Three published numbers with nobody reliably staffing one is worse than no WhatsApp at all — a visibly unanswered WhatsApp converts the differentiator (real kitchens, real teams) into evidence against it. The config shape (`Record<BranchSlug, string | null>` with a default) makes going per-branch a one-line change once the owner confirms who staffs each.

### 6.6 Phase 2 — Cloud API, and the one thing that promotes it to launch-blocking

**Phase 1 (launch, zero dependencies):** plain `wa.me` + commit-before-redirect + ref code shown on screen. The ref is human-readable so restaurant staff can match a chat to a DB row manually.

**Phase 2 (when volume justifies):** Meta Cloud API webhook fills `wa_id`, `wa_profile_name`, `first_inbound_at`, `ctwa_clid` automatically. The Phase-1 schema is already Phase-2-shaped, so Phase 2 adds one route and zero migrations.

`POST /api/wa/webhook` (+ `GET` for Meta's `hub.challenge`, + HMAC-SHA256 verification of `X-Hub-Signature-256` against the app secret — the endpoint is public and this is not optional). Handler: regex `/MM-[2-9A-HJ-NP-Z]{6}/` over `messages[0].text.body`; on match, `UPDATE leads SET wa_id = …, wa_profile_name = …, first_inbound_at = now(), ctwa_clid = COALESCE(ctwa_clid, $x) WHERE ref = $1 OR $1 = ANY(ref_aliases)`. On no match, insert a bare row with `path='whatsapp_organic'` so nothing is lost.

**`first_inbound_at IS NULL` is the most valuable metric on the site:** WhatsApp clicks that never became conversations. Without Phase 2 it stays null forever and the business optimises toward clicks rather than leads.

**The promotion trigger.** Click-to-WhatsApp ads bypass the website entirely — no `wa.me` link, no site JS ever runs. `ctwa_clid` arrives **only** in the Cloud API inbound webhook's `referral` object, and only on the first inbound message. If the owner intends to run CTWA ads on Facebook/Instagram — very likely for catering in Israel — Cloud API stops being Phase 2 and becomes a launch prerequisite for that campaign. Without it, that spend is unattributable and Meta cannot optimise delivery.

**Coexistence warning — operational, not technical.** Registering an existing WhatsApp Business app number on Cloud API is destructive and one-way: it deletes message history and locks the number out of the Business app until deregistered. Meta's "Coexistence" avoids this but is region-gated. The owner must confirm **in writing** that Coexistence is available for Israel on the chosen BSP before anyone touches the live number. Never run the direct migration path on the number printed on the website.

**Economics.** All replies sent inside the 24-hour window opened by a customer's inbound message are free and need no template; cost appears only when the business initiates or re-engages after 24h, which requires a pre-approved template. Catering leads always message first and quoting happens inside 24h, so the recurring cost is the BSP platform fee, not Meta messaging. Approve templates for exactly two cases: a follow-up nudge to a lead quiet more than 24h (MARKETING category — requires `consent_marketing = true AND unsubscribed_at IS NULL`) and an event-date reminder for a booked customer (UTILITY). Build no broadcast list.

### 6.7 Return-from-WhatsApp state (prior review E2)

`openWhatsApp()` navigates the tab away. On mobile the tab is backgrounded and, on return, the page is exactly as it was — which for the dominant Israeli channel means the entire post-conversion experience is nothing. Specified:

- `rememberHandoff(ref, p)` writes `sessionStorage.mm_wa_handoff = { ref, at, waLocation, branch }`.
- A `<WaReturnPanel>` mounted at the app root renders when that key exists and is under 6 hours old. It appears on the next paint (desktop, where the tab never left) and on `visibilitychange → visible` (mobile, on return).
- Content — a dismissible inline panel, not a modal, not a toast:

```
שלחנו אתכם לוואטסאפ עם מספר פנייה MM-7F3K2Q.
לא נפתח? [נסו שוב]  ·  אפשר גם בטלפון {{TEL_DISPLAY}}
{{RESPONSE_LINE}}
[סגירה]
```

- `נסו שוב` re-invokes `openWhatsApp` with the **same** ref (no new row, no new notification — the dedup rule in §6.8 covers it).
- Dismissal clears the key. The panel never blocks scroll and never covers the sticky bar.
- This also handles the WhatsApp-not-installed case, which is otherwise a dead end.

### 6.8 Ref integrity, collisions and dedup (prior review D11)

The client generates the ref because it must be inside the WhatsApp message before navigation. Three consequences the first pass left unhandled:

**(a) Collision or hostile reuse.** `ref` is `UNIQUE`. Insert is `INSERT … ON CONFLICT (ref) DO NOTHING RETURNING id`. If nothing is returned:

```
1. server generates its own ref (same alphabet, retried up to 5 times against the unique index)
2. the client's ref is stored in `ref_aliases` if it is not already taken as a ref or alias
3. lookups resolve `WHERE ref = $1 OR $1 = ANY(ref_aliases)`
4. `log(..., "ref-collision")` — a nonzero rate here means someone is probing, not that 32^6 ran out
```

The customer's displayed code therefore always resolves, which is what matters; the first pass would have handed the customer a code matching no row.

**(b) Multi-click dedup.** The first pass claimed `/api/wa-intent` was "deduped by unique `ref`" — but every click mints a *new* ref, so there was no dedup at all, and three taps on the sticky bar created three `status='new'` rows. Corrected: dedup on `(session_id, wa_location)` within **30 minutes**. On a dedup hit the server does **not** insert; it appends the new ref to `ref_aliases` on the existing row, appends a `lead_events` row `whatsapp_reclick`, and fires **no** second notification and **no** second `generate_lead`.

`session_id` is a per-tab UUID in `sessionStorage`, generated in `lib/attribution.ts`, never derived from PII, never persisted beyond the tab.

**(c) Escalation and reporting exclusion.** A WhatsApp handoff row with `first_inbound_at IS NULL` is a *click*, not a conversation. Such rows:

- are **excluded** from the §8.5 escalation sweep (they would otherwise page a manager for a tap);
- appear in the admin worklist in **Panel 2** (`פניות ללא התאמה`), not Panel 1;
- still count as the tier-1 Ads conversion `Lead — WhatsApp handoff`, because dedup now makes the count meaningful — but they are reported as a **separate** channel row so their lower quality stays visible.

---

## 7. Partial capture and abandonment recovery

### 7.1 Three layers

**Layer 1 — localStorage, immediate.** Every answer and every dish selection writes `mm_quote_draft = { draftId, step, answers, dishIds, serviceFormat, updatedAt }`. On mount, a draft under 7 days old is restored with:

```
המשכנו מאיפה שעצרתם. [להתחיל מחדש]
```

**Layer 2 — anonymous server draft, on step completion.** `POST /api/quote/draft` with `{ draftId (client UUID), sessionId, step, answers, dishIds, serviceFormat, attribution }` after each of screens 1–4 and after each `add_to_brief`. Upserts on `draftId`.

**Hard constraint: no PII may enter a draft payload.** Only enumerated answers, a date, dish ids and — the one risk — the free-text area field from §3.7 when no chip list exists. That field is **capped at 60 chars and stripped of digits and `@`** before it enters a draft, so a visitor who types a full address or a phone number into it does not create a PII-bearing anonymous row. Nothing from screen 5 is ever drafted, and nothing is sent before the consent state is known. CI asserts the endpoint rejects any payload containing `name`, `phone`, `email` or `notes`.

**Layer 3 — upgrade on submit.** `POST /api/quote` carries the same `draftId`; the server upgrades the draft row in place (sets `upgraded_lead_id`) rather than leaving a phantom. Drafts that never upgrade are the abandonment funnel.

### 7.2 What drafts buy

1. **Resume on return** — a real conversion win on mobile, where the buyer is interrupted.
2. **Step-level abandonment analytics**, server-side, surviving ad-blockers. `quote_step_complete` gives the same signal client-side; the draft row is the one that is still there when a content blocker ate the tag.
3. **Visibility into demand we are not capturing** — forty abandoned drafts all typing an out-of-area city is a delivery-radius decision, not a UX bug, and it is exactly the kind of fact the owner needs in order to answer `servesAreas`.

### 7.3 Recovery — what we do and do not do

**We do:** surface abandoned drafts in the admin view as an aggregate-only panel — counts by event type, band, area and date. The owner sees demand shape, not people.

**We do not:** contact an abandoned draft. There is no PII to contact, by design, and attaching identity to a pre-consent draft is precisely the scope creep the honesty and privacy constraints forbid.

**Partial WhatsApp handoffs are a different case and are recoverable:** they *are* full lead rows with a ref code, just without a name. They appear in Panel 2 of the worklist; the prefill shows event type, band and area, making the manual match to an incoming chat obvious.

### 7.4 Retention

```sql
DELETE FROM quote_drafts WHERE updated_at < now() - interval '30 days';
DELETE FROM leads WHERE purge_after < now() AND converted_at IS NULL;
```

Nightly job, `server/jobs/purge-leads.ts`. **Hard delete** — soft-delete flags make retention theatre. Log only the count deleted, never the rows.

`purge_after` is set at insert to `created_at + LEGAL.LEAD_RETENTION_MONTHS`. **If `LEAD_RETENTION_MONTHS` is null, `purge_after` is null and nothing is purged** — the job cannot invent a retention period, and the admin view shows a standing notice `לא הוגדרה תקופת שמירה ללידים` until the owner supplies one. Under תיקון 13 the penalty structure scales per data subject, so leads deleted on schedule are leads not counted; the retention job is a risk-reduction measure, not hygiene.

---

## 8. Schema — literal additions to `shared/schema.ts`

### 8.1 Decisions taken

- **One table, not two.** WhatsApp intents live in the same table as form leads, discriminated by `path`. A separate `whatsapp_intents` table keeps DB constraints stricter but makes the one query the owner actually needs — "leads by channel, by page, this month" — a union. Strictness is preserved at the route boundary by per-path zod schemas, which is where it belongs. **`01` Wave 0 must not create `whatsapp_intents`** (prior review B1); it creates `leads`, `quote_drafts`, `lead_events` and `call_events`.
- **`name` and `phone` become nullable.** A WhatsApp intent's whole value is that the visitor has not typed either yet. Required-ness is enforced per path in zod, not by `NOT NULL`.
- **`contact_submissions` is renamed to `leads`** via a hand-written SQL migration (§8.6), not `db:push`.
- **Every new column is nullable with no `NOT NULL`** except the small set with real defaults. `MemoryStorage.createContactSubmission` builds rows field-by-field explicitly, so every added column needs a matching `?? null` line there or the default dev path silently drops attribution.
- **A comment guards the privacy threshold**, so a future developer does not assume a PPA filing exists.

### 8.2 The code

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
  "taste",              // tasting enquiry, if ever gated behind a field
  "menu",               // gated menu download, if ever built
  "walk_in",            // manually logged in-restaurant enquiry
  "manual",             // anything the owner types in by hand
]);

export const leadStatusEnum = pgEnum("lead_status", [
  "new",          // untouched
  "working",      // someone has picked it up
  "quoted",       // a written quote went out
  "qualified",    // quote sent + tasting or site visit booked → the Ads-optimisable event
  "won",          // booked, deposit paid
  "lost",         // lost, with a reason
  "disqualified", // spam, out of region, out of scope
]);

export const branchEnum = pgEnum("branch", ["herzliya_pituach", "raanana", "petah_tikva"]);

export const contactChannelEnum = pgEnum("contact_channel", ["whatsapp", "phone", "email"]);

/* ═════════════════ leads ═════════════════ */

/**
 * מאגר הלידים.
 *
 * חובת הודעה לרשות להגנת הפרטיות קמה רק במאגר עם מידע בעל רגישות מיוחדת
 * על 100,000 נושאי מידע ומעלה — לא חל כאן. אם הטבלה חוצה ~50,000 שורות,
 * או אם מתווסף שדה של מידע רפואי / דתי / ביומטרי, יש להעביר לבדיקת ייעוץ
 * משפטי לפני שהשדה נכנס לפרודקשן.
 *
 * אין להוסיף שדה שמזמין מידע רפואי (אלרגיות, מגבלות תזונה) לטבלה הזו.
 * מידע כזה נאסף אחרי סגירת ההזמנה, בערוץ התפעולי, לתיק האירוע.
 */
export const leads = pgTable(
  "leads",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),

    /* ── מזהה אנושי, מוצג ללקוח ומופיע בהודעת הוואטסאפ ── */
    ref: varchar("ref", { length: 12 }).notNull().unique(),
    /** קודים נוספים שמצביעים על אותה שורה: התנגשות, או קליק חוזר שאוחד. */
    refAliases: text("ref_aliases").array(),

    /* ── מי ── (nullable: ליד וואטסאפ נוצר לפני שהוקלד שם) */
    name: text("name"),
    phone: text("phone"),                                  // raw, as typed — for dialling
    phoneE164: text("phone_e164"),                         // +9725XXXXXXXX — uploads and call joins
    phoneSha256: text("phone_sha256"),                     // enhanced conversions
    email: text("email"),
    emailSha256: text("email_sha256"),
    contactChannel: contactChannelEnum("contact_channel"),

    /* ── מה ── */
    eventType: text("event_type"),
    guestBand: text("guest_band"),                         // 'lt25'|'25_50'|'50_100'|'100_200'|'200p'
    guestBandVersion: text("guest_band_version"),          // config/quote.ts BANDS_VERSION
    guestCount: integer("guest_count"),                    // only if a human later refines it
    eventDate: text("event_date"),                         // ISO YYYY-MM-DD
    dateFlexible: boolean("date_flexible").default(false),
    dateFlag: text("date_flag"),                           // 'friday' | 'saturday' | null — Asia/Jerusalem
    area: text("area"),                                    // chip value, or free text (≤60)
    areaIsFreeText: boolean("area_is_free_text").default(false),
    branch: branchEnum("branch"),
    serviceFormat: text("service_format"),                 // delivery|buffet_on_site|plated_staffed|at_restaurant
    selectedDishes: text("selected_dishes").array(),       // dish ids from add_to_brief
    answers: jsonb("answers"),                             // full builder state, forward-compatible
    notes: text("notes"),                                  // post-submit enrichment + owner notes

    /* ── מאיפה ── */
    path: leadPathEnum("path").notNull(),
    sourcePage: text("source_page"),                       // '/catering/business'
    landingPage: text("landing_page"),                     // first page of the session
    referrer: text("referrer"),
    waLocation: text("wa_location"),
    sessionId: varchar("session_id", { length: 40 }),      // per-tab UUID, dedup key, never PII
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
    unsubscribedAt: timestamp("unsubscribed_at", { withTimezone: true }),
    unsubscribeToken: varchar("unsubscribe_token", { length: 40 }),

    /* ── צינור המכירה ── */
    status: leadStatusEnum("status").notNull().default("new"),
    statusChangedAt: timestamp("status_changed_at", { withTimezone: true }),
    statusChangedBy: text("status_changed_by"),             // token fingerprint, not a name
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
    escalatedAt: timestamp("escalated_at", { withTimezone: true }),
    adsUploadStatus: text("ads_upload_status"),             // pending|uploaded|skipped_*|expired_window|failed
    adsUploadedAt: timestamp("ads_uploaded_at", { withTimezone: true }),
    gaMpUploadStatus: text("ga_mp_upload_status"),
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
    sessionIdx: index("leads_session_idx").on(t.sessionId, t.waLocation),
    phoneIdx: index("leads_phone_idx").on(t.phoneE164),
    aliasIdx: index("leads_alias_idx").using("gin", t.refAliases),
  }),
);

/* ═════════════════ quote_drafts ═════════════════ */

/** אין PII כאן. אף פעם. רק תשובות מרשימה סגורה, תאריך, ומזהי מנות. */
export const quoteDrafts = pgTable(
  "quote_drafts",
  {
    draftId: varchar("draft_id", { length: 40 }).primaryKey(),
    sessionId: varchar("session_id", { length: 40 }),
    step: integer("step").notNull().default(1),
    eventType: text("event_type"),
    guestBand: text("guest_band"),
    eventDate: text("event_date"),
    area: text("area"),                                     // scrubbed: ≤60 chars, no digits, no '@'
    serviceFormat: text("service_format"),
    selectedDishes: text("selected_dishes").array(),
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
    eventName: text("event_name").notNull(),
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

export type Lead = typeof leads.$inferSelect;
export type InsertLead = typeof leads.$inferInsert;
```

### 8.3 Validation lives in `shared/lead-schema.ts` — zod only, no drizzle

`shared/schema.ts` **must not be imported from client code.** `contact.tsx:14` currently does, dragging `drizzle-orm/pg-core` + `drizzle-zod` into the browser: measured at 45.5 KB raw / 13.5 KB gzip, and it publishes the Postgres table and column names inside a public JS file.

```ts
// shared/lead-schema.ts — imported by both client and server. zod only.
import { z } from "zod";

export const GUEST_BANDS = ["lt25", "25_50", "50_100", "100_200", "200p"] as const;
export const SERVICE_FORMATS = ["delivery", "buffet_on_site", "plated_staffed", "at_restaurant"] as const;
export const WA_LOCATIONS = ["hero", "sticky", "footer", "quote_alt", "branch", "urgent", "shiva", "thanks"] as const;
export const BRANCHES = ["herzliya_pituach", "raanana", "petah_tikva"] as const;

const refShape = /^MM-[2-9A-HJ-NP-Z]{6}$/;

/* UTM and referrer are attacker-controlled strings that WILL be rendered in an
   owner-facing view. Whitelist the charset and cap the length at ingest. */
const utmValue = z.string().trim().max(120).regex(/^[\w\-. |/]*$/u).optional();
const clickId  = z.string().trim().max(300).regex(/^[\w\-.]*$/).optional();

export const attributionSchema = z.object({
  sourcePage:  z.string().trim().max(200).optional(),
  landingPage: z.string().trim().max(200).optional(),
  referrer:    z.string().trim().max(300).optional(),
  sessionId:   z.string().trim().max(40).regex(/^[\w-]*$/).optional(),
  utmSource: utmValue, utmMedium: utmValue, utmCampaign: utmValue,
  utmTerm: utmValue, utmContent: utmValue, utmId: utmValue,
  gclid: clickId, gbraid: clickId, wbraid: clickId, fbclid: clickId,
  msclkid: clickId, ttclid: clickId,
  gaClientId: z.string().trim().max(60).regex(/^[\w.\-]*$/).optional(),
  gaSessionId: z.string().trim().max(40).regex(/^[\w.\-]*$/).optional(),
});

export const quoteLeadSchema = attributionSchema.extend({
  ref: z.string().regex(refShape),
  name: z.string().trim().min(2, "צריך שם, כדי שנדע למי לחזור.").max(80),
  phone: z.string().trim().min(9).max(25),      // normalised server-side before the shape check
  email: z.string().trim().email("כתובת המייל לא נראית תקינה.").max(120).optional().or(z.literal("")),
  contactChannel: z.enum(["whatsapp", "phone"]).default("whatsapp"),
  eventType: z.string().trim().min(2).max(60),
  guestBand: z.enum(GUEST_BANDS),
  guestBandVersion: z.string().max(20).optional(),
  eventDate: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/).optional().or(z.literal("")),
  dateFlexible: z.boolean().default(false),
  area: z.string().trim().max(60),
  areaIsFreeText: z.boolean().default(false),
  serviceFormat: z.enum(SERVICE_FORMATS).nullish(),
  selectedDishes: z.array(z.string().max(60)).max(40).default([]),
  consentMarketing: z.boolean().default(false),
  consentTextVersion: z.string().max(40).optional(),
  noticeVersion: z.string().max(40).optional(),
  draftId: z.string().max(40).optional(),
  stepsCompleted: z.coerce.number().int().min(1).max(5).optional(),
  timeToCompleteMs: z.coerce.number().int().min(0).max(3_600_000).optional(),
  mountedAt: z.coerce.number().int().optional(),   // anti-spam timing check, §12.2
  company_website: z.string().max(0).optional(),   // honeypot
});

export const waIntentSchema = attributionSchema.extend({
  ref: z.string().regex(refShape),
  waLocation: z.enum(WA_LOCATIONS),
  branch: z.enum(BRANCHES).nullish(),
  eventType: z.string().trim().max(60).optional(),
  guestBand: z.enum(GUEST_BANDS).optional(),
  eventDate: z.string().trim().max(20).optional(),
  area: z.string().trim().max(60).optional(),
  serviceFormat: z.enum(SERVICE_FORMATS).nullish(),
  dishIds: z.array(z.string().max(60)).max(40).optional(),
  name: z.string().trim().max(80).optional(),
  phone: z.string().trim().max(25).optional(),
});

export const draftSchema = attributionSchema.extend({
  draftId: z.string().max(40),
  step: z.coerce.number().int().min(1).max(4),
  eventType: z.string().trim().max(60).optional(),
  guestBand: z.enum(GUEST_BANDS).optional(),
  eventDate: z.string().trim().max(20).optional(),
  area: z.string().trim().max(60).optional(),
  serviceFormat: z.enum(SERVICE_FORMATS).nullish(),
  selectedDishes: z.array(z.string().max(60)).max(40).optional(),
}).strict();   // .strict() is what makes an accidental `phone` key a 400, not a silent write
```

`.strict()` on `draftSchema` is load-bearing: it is the mechanism behind the "no PII in drafts" CI assertion.

### 8.4 `MemoryStorage` parity obligation

`server/storage.ts`'s `createContactSubmission` builds ten fields by hand. This schema adds roughly sixty columns, so every one needs a matching `?? null` line — approximately sixty hand-written lines, not a footnote. Budget an hour. Then a parity test:

```ts
expect(Object.keys(memoryRow).sort()).toEqual(Object.keys(getTableColumns(leads)).sort());
```

Without it the Postgres path works, the default dev path silently drops attribution, and nobody notices until production data is inspected.

### 8.5 `server/db.ts` TLS fix, shipped in the same commit

`ssl: { rejectUnauthorized: false }` currently encrypts but does not authenticate the Postgres server, so the connection carrying every lead's name and phone is MITM-able — while `privacy.tsx` simultaneously promises consumers `הצפנת נתונים בהעברה`. The gap between the published claim and the code is what turns a technical weakness into a misrepresentation. Set `rejectUnauthorized: true`, supply the provider CA via `DATABASE_CA_CERT` (document it in `.env.example`). Only then may the privacy page claim encryption in transit, and it may **not** claim encryption at rest unless the provider's at-rest encryption is verified and named.

### 8.6 Migration mechanics (prior review D6)

`package.json` currently has only `db:push`, which drops and recreates and cannot create a compatibility view. Add:

```json
"db:generate": "drizzle-kit generate",
"db:migrate":  "drizzle-kit migrate"
```

and a hand-written first migration `migrations/0001_leads.sql`:

```sql
ALTER TABLE contact_submissions RENAME TO leads;
ALTER TABLE leads ALTER COLUMN name  DROP NOT NULL;
ALTER TABLE leads ALTER COLUMN phone DROP NOT NULL;
ALTER TABLE leads ALTER COLUMN event_type DROP NOT NULL;
ALTER TABLE leads ADD COLUMN ref varchar(12);
UPDATE leads SET ref = 'MM-LEGACY' WHERE ref IS NULL;   -- pre-migration rows, deduped by id
-- … remaining ADD COLUMNs, then:
ALTER TABLE leads ALTER COLUMN ref SET NOT NULL;
CREATE UNIQUE INDEX leads_ref_uniq ON leads (ref);
CREATE VIEW contact_submissions AS
  SELECT id, name, phone, email, event_type, guest_count, event_date, notes AS details, created_at
  FROM leads;                                            -- kept for one release
```

`db:push` is removed from any deployment path. Legacy rows get a distinguishable ref; if there is more than one, suffix with a short hash of `id` before adding the unique index.

---

## 9. API surface

All endpoints return JSON. All error bodies are `{ success: false, error: string, fields?: Record<string,string[]> }` in Hebrew. An `/api`-scoped JSON 404 is registered **before** the SPA static fallback (`server/vite.ts:82-84` currently returns `index.html` with HTTP 200 for any unmatched `/api/*` path, which makes client `JSON.parse` fail on an HTML body).

### 9.1 `POST /api/quote`

Body: `quoteLeadSchema`. Steps, in order:

1. Honeypot check (§12.1) — a hit returns `{ success: true }` and writes nothing.
2. Timing check (§12.2).
3. `normalisePhone` → `phone_e164`; shape check; on failure 400 with `fields`.
4. Merge server-side attribution from the `mm_attr` cookie (§10.2). **Server cookie wins for click IDs; the client body wins for `ga_client_id` / `ga_session_id`**, which JS reads from the `_ga` cookie.
5. Compute `date_flag` in `Asia/Jerusalem`.
6. Resolve `branch` from `area` via `locations.ts`, only for a mapped chip.
7. Duplicate collapse (§12.5).
8. Insert with `ON CONFLICT (ref) DO NOTHING`; on collision follow §6.8(a).
9. Set `purge_after` if `LEAD_RETENTION_MONTHS` is set.
10. Upgrade the matching draft row.
11. `void notifyNewLead(minimalPayload)` — §11.
12. `201 { success: true, ref }`.

The **client displays the ref returned by the server**, not the one it generated, so a collision is invisible to the customer. The quote path awaits this response, which is safe — there is no popup to block.

Returns per-field errors. `lib/queryClient.ts:5-7` currently throws before `response.json()` runs, so the populated `fields` object is discarded and the visitor sees only a generic toast with no indication which field is wrong. That is silent lead loss and it is fixed by reading the body before throwing.

### 9.2 `POST /api/wa-intent`

Body: `waIntentSchema`. Fails **open** — a 429 or an exception must never surface, and the client ignores the response entirely.

Dedup on `(session_id, wa_location)` within 30 minutes (§6.8b). No notification, no `generate_lead`, on a dedup hit.

### 9.3 `GET /api/quote/:ref` (prior review D8)

Previously referenced and never specified — which as implied was a **public, unauthenticated endpoint returning a lead record keyed on a six-character code printed in a WhatsApp message**. Specified now:

- **Response field allowlist, exhaustive:** `ref`, `createdAt`, `eventType`, `guestBand`, `eventDate`, `dateFlexible`, `area`, `serviceFormat`, `selectedDishes`, `branchPublic` (branch name + address only, from `locations.ts`), plus the rendered inclusions / exclusions / terms strings resolved from config.
- **Never returned:** `id`, `name`, `phone`, `phoneE164`, any hash, `email`, `notes`, `answers`, any attribution field, any consent field, any pipeline field, `sessionId`, `refAliases`.
- Lookup: `WHERE ref = $1 OR $1 = ANY(ref_aliases)`.
- Unknown, malformed or purged ref → `404 { success: false }`; the client renders the state in §5.2.
- `Cache-Control: no-store`. No `Access-Control-Allow-Origin`.
- Rate limit **60 / 10 min** keyed on IP, and a global cap of 600/hour so the code space cannot be enumerated cheaply. `MM-` plus six characters from a 32-symbol alphabet is ~10⁹ combinations; at 600/hour an attacker needs ~200 years for a 10% hit rate, and the payload contains no PII anyway.

### 9.4 `POST /api/quote/draft`

Body: `draftSchema` with `.strict()`. Upsert on `draftId`. Fails open. Rate limit 120 / 10 min.

### 9.5 `PATCH /api/quote/:ref/notes`

The post-submit enrichment textarea on `/thanks`. Body: `{ notes: string }`, max 1,000 chars, appended not replaced. Allowed only within 24 hours of `created_at` and only when `notes` is empty or was written by the same `session_id`. Rate limit 10 / 10 min.

### 9.6 `POST /api/call-event`

Provider webhook from the VoIP DID vendor (§11.7). Shared-secret header, allowlisted source IPs, inserts into `call_events`, attempts a match to a lead on `from_e164 = phone_e164` within 30 days.

### 9.7 `GET|POST /api/unsubscribe` and `/unsubscribe` (prior review C2)

The marketing checkbox promises `ניתן להסיר את ההסכמה בכל הודעה`; `ס' 30א` requires every advertising message to carry a working refusal mechanism. Without this the copy is a promise the system cannot keep.

- Route `/unsubscribe?t={unsubscribe_token}`, `noindex`, no auth beyond the token.
- `unsubscribe_token` is a 32-char random string generated at insert, unrelated to `ref`, and it is the only identifier that appears in outgoing marketing messages.
- GET renders one sentence and one button (`הסירו אותי`); POST sets `unsubscribed_at = now()` and renders `הוסרתם. לא נשלח לכם עוד הודעות שיווקיות.` Idempotent, and a POST for an unknown token renders the same confirmation without revealing whether the token existed.
- **Send rule, enforced in the export and in any automation:** a marketing message may only go to rows where `consent_marketing = true AND unsubscribed_at IS NULL`.

### 9.8 Admin endpoints

`GET /api/leads`, `GET /api/leads/:id`, `PATCH /api/leads/:id` (status, values, notes), `DELETE /api/leads/:id`, `GET /api/leads/export.csv`, `GET /api/leads/ads-export.csv`, `GET /api/drafts/summary`. All behind `requireAdmin` (§13.1 of this document's admin section, §12).

---

## 10. Attribution capture

### 10.1 Capture in Express, not JS

`server/index.ts` middleware, running on the initial HTML request:

```ts
app.use(cookieParser());
app.use((req, res, next) => {
  const q = req.query as Record<string, string | undefined>;
  const ids = ["gclid", "gbraid", "wbraid", "fbclid", "msclkid", "ttclid"] as const;
  const hasClick = ids.some((k) => q[k]);
  const hasUtm = q.utm_source || q.utm_campaign;
  if (hasClick || hasUtm) {
    const payload = JSON.stringify({
      ...Object.fromEntries(ids.filter((k) => q[k]).map((k) => [k, String(q[k]).slice(0, 300)])),
      utm_source: q.utm_source?.slice(0, 120), utm_medium: q.utm_medium?.slice(0, 120),
      utm_campaign: q.utm_campaign?.slice(0, 120), utm_term: q.utm_term?.slice(0, 120),
      utm_content: q.utm_content?.slice(0, 120), utm_id: q.utm_id?.slice(0, 120),
      at: new Date().toISOString(), lp: req.path.slice(0, 200),
      ref: (req.get("referer") ?? "").slice(0, 300),
    });
    const secure = process.env.NODE_ENV === "production";   // ← not literal `true`
    res.cookie("mm_attr", payload, { httpOnly: true, sameSite: "lax", secure, maxAge: 90 * 864e5 });
    if (!req.cookies?.mm_attr_first) {
      res.cookie("mm_attr_first", payload, { httpOnly: true, sameSite: "lax", secure, maxAge: 180 * 864e5 });
    }
  }
  next();
});
```

Why server-side and `httpOnly`:

- Immune to consent-tool script blocking and to any CMP that clears JS cookies, and defensible as strictly-necessary first-party measurement.
- With `ad_storage` denied, `gtag` will not cookie the `gclid` at all, and `url_passthrough` decorates only real anchor navigations — it does **not** apply to `wouter`'s client-side route changes. Express sees the click ID on the very first request regardless.
- `gbraid` / `wbraid` arrive **instead of** `gclid` on iOS and Safari ad traffic, never alongside. Capturing only `gclid` silently loses a large share of paid mobile traffic, which is where catering research happens. All three need separate columns; all three are valid upload keys and the Ads CSV expects distinct columns.
- **Never overwrite a stored click ID with an empty value** on a later pageview. Write only when a new click ID or a non-direct UTM set is present.
- `secure` is environment-derived, not literal `true`, or attribution silently never persists in local dev over http.

### 10.2 The merge — the step the first pass omitted (prior review D4)

JavaScript **cannot read an `httpOnly` cookie.** The first pass wrote click IDs into `mm_attr` and then had the client send `attributionSnapshot()` in the POST body — so `gclid` was captured and immediately discarded, and `ads-export.csv` would have returned zero rows forever.

Stated explicitly: **`POST /api/quote` and `POST /api/wa-intent` merge `req.cookies.mm_attr` server-side into the row.**

```ts
function mergeAttribution(body: Attribution, req: Request): Attribution {
  const cookie = safeParse(req.cookies?.mm_attr);          // never throws, caps sizes
  const first  = safeParse(req.cookies?.mm_attr_first);
  return {
    ...body,                                               // client wins for GA ids + page path
    gclid:   cookie?.gclid   ?? body.gclid   ?? null,      // server cookie wins for click ids
    gbraid:  cookie?.gbraid  ?? body.gbraid  ?? null,
    wbraid:  cookie?.wbraid  ?? body.wbraid  ?? null,
    fbclid:  cookie?.fbclid  ?? body.fbclid  ?? null,
    msclkid: cookie?.msclkid ?? body.msclkid ?? null,
    ttclid:  cookie?.ttclid  ?? body.ttclid  ?? null,
    clickIdCapturedAt: cookie?.at ?? null,
    utmSource:   cookie?.utm_source   ?? body.utmSource   ?? null,
    utmMedium:   cookie?.utm_medium   ?? body.utmMedium   ?? null,
    utmCampaign: cookie?.utm_campaign ?? body.utmCampaign ?? null,
    utmTerm:     cookie?.utm_term     ?? body.utmTerm     ?? null,
    utmContent:  cookie?.utm_content  ?? body.utmContent  ?? null,
    utmId:       cookie?.utm_id       ?? body.utmId       ?? null,
    firstTouchSource: first?.utm_source ?? first?.ref ?? null,
    firstTouchAt:     first?.at ?? null,
    landingPage:      first?.lp ?? body.landingPage ?? null,
  };
}
```

Precedence rule, stated once: **server cookie wins for click IDs and UTMs; the client body wins for `gaClientId`, `gaSessionId`, `sourcePage` and `sessionId`.** `ga_client_id` is read by JS from the `_ga` cookie, which the server does not parse.

`clickIdCapturedAt` exists so the export job computes upload-window eligibility instead of guessing (§11.5).

### 10.3 Consent mode and the cookie-banner position

Region-scoped. Consent Mode v2 is required by Google only for EEA/UK/CH; Israel is outside that scope. Default `denied` for `ad_storage`, `ad_user_data`, `ad_personalization`, `analytics_storage` with `region: ['EEA','GB','CH']`; a separate Israeli default paired with a prominent, non-dark-pattern notice and a one-tap opt-out. Set `ads_data_redaction: true` and `url_passthrough: true` while denied.

**This is a business decision requiring the owner's own legal sign-off.** Present it as a documented choice, never as legal advice. The relevant cost, which the owner must decide knowingly: Google's conversion modeling — which is what backfills consent-denied conversions — requires per-account volume this business will never reach. Consent-denied traffic here therefore means genuinely lost conversions, not modelled ones. That is the strongest argument against defaulting `analytics_storage` to denied on Israeli traffic, and it is also why §10.1's server-side capture matters more here than it would elsewhere.

**Cookie banner:** none is required today — the site sets no tracking cookies (only functional accessibility prefs in localStorage; `mm_attr` is first-party strictly-necessary measurement). But `client/index.html` loads Google Fonts and cdnjs Font Awesome, transmitting every visitor's IP and user-agent to Google and Cloudflare on every page view. **Eliminate rather than disclose:** self-host the two Hebrew font subsets, drop Font Awesome for the already-installed `lucide-react`.

**Third-party arithmetic, stated honestly (prior review B7).** The "zero third-party requests" conclusion holds only if nothing else is embedded. A Google Maps iframe on three branch pages would reinstate exactly the disclosure and consent obligation just eliminated. Decision: **a self-hosted static map image generated at build time, plus a text `הוראות הגעה` link to Google Maps.** Keeps the local-verification value, keeps the request count at zero. The same rule governs any future embed.

Once GA4 or Meta Pixel is added the position flips and a genuine consent gate is required before those scripts load — which is what §12.3 exists for.

---

## 11. Notification path and response-time SLA

### 11.1 Why this is the highest-ROI code in the repo

Speed-to-lead is the binding constraint, not form design. The MIT / InsideSales study (Oldroyd, ~15,000 leads, >100,000 call attempts) found contacting within 5 minutes made a lead ~21× more likely to qualify than at 30 minutes; the HBR follow-up across 2,241 firms found a 42-hour average first response with 23% never responding. Both measure outbound B2B phone calls, not inbound WhatsApp for consumer catering.

**Do not print "21×" or any borrowed statistic on the site.** Use the mechanism, not the number — a borrowed statistic presented as our own is the same class of fabricated authority this project exists to purge. `first_inbound_at` and `first_reply_at` give the business a real median within weeks, and *that* becomes an honest claim it owns.

### 11.2 Required changes to `notifyNewLead`

Currently opt-in via an unset env var, fails silently, no retry.

1. **`NOTIFY_WEBHOOK_URL` becomes a startup requirement in production.** Refuse to boot without it — fatal log and exit. A lead machine with no alerting is a lead machine with no leads.
2. **Reject any URL that is not `https:`** at startup, and validate the host against `NOTIFY_WEBHOOK_HOSTS` (comma-separated allowlist), so a compromised env cannot silently exfiltrate the lead flow elsewhere.
3. **Minimise the payload.** The notification's only job is to make someone pick up the phone. Send: first name, `phone` (raw, dialable), `event_type`, `guest_band`, `area`, `branch`, `ref`, `source_page`, and a link to the admin row. **Not** the email, **not** the notes, **not** the answers blob, **not** attribution. This also reduces what a breached automation vendor holds — and the vendor is a `מחזיק` and almost certainly a cross-border transfer, requiring a written undertaking recorded in `docs/privacy/processors.md`.
4. **Retry with backoff.** Three attempts at 0s / 5s / 30s, incrementing `notify_attempts`, setting `notified_at` on success, logging failures loudly.
5. **A sweeper.** Every 60s, any lead with `notified_at IS NULL AND notify_attempts >= 3 AND created_at > now() - interval '1 day'` is retried and surfaced in the admin view as a red banner.

### 11.3 Alert shape

Destination is a WhatsApp group the branch managers actually watch. This is a routing decision, not a code one — the webhook stays provider-agnostic (Zapier / Make / n8n / a WhatsApp API provider).

```
🔔 ליד חדש · MM-7F3K2Q
אירוע חברה · בין 50 ל־100 · הרצליה
15/09/2026
דנה · 054-XXXXXXX  ← tap to call
מטבח: הרצליה פיתוח
מהדף: /catering/business
[פתחו בממשק]
```

Including the event summary in the body is what lets the responder answer **substantively on the first reply** rather than opening with `מה בדיוק אתם צריכים?`.

### 11.4 After-hours

**Phase 1 needs no code.** Configure the WhatsApp Business app's Greeting and Away messages against a correct Israeli week — closed Friday afternoon through Saturday evening, which is *not* a Sun–Sat assumption. Away messages are reactive only; there is no native scheduled send.

Away wording is `LEGAL.AWAY_MESSAGE`, verbatim from the owner. Never invent a callback promise.

Site-side, gated on `LEGAL.ANSWERING_HOURS`: outside those hours the `tel:` link is de-emphasised and WhatsApp promoted, with `עכשיו סגור. כתבו בוואטסאפ ונחזור אליכם {{RESPONSE_TIME}}.` **If `ANSWERING_HOURS` is unset, no hours-based behaviour renders at all** — the phone link stays as it is and no claim about availability appears. Delete the current `זמינים 24/7` claim (`contact.tsx:302`, `faq-data.ts:12`), which is the kind of claim that generates angry reviews when a 23:40 call goes unanswered. Hours are evaluated in `Asia/Jerusalem`, server-side.

### 11.5 SLA mechanics

- `first_reply_at` is set when the owner marks the lead `working`, or automatically by the Phase-2 webhook on the first outbound message.
- **Escalation:** a lead with `status='new'` older than 20 minutes **during `ANSWERING_HOURS`** fires a second webhook to `NOTIFY_ESCALATION_URL` and sets `escalated_at`. Excluded: `path='whatsapp' AND first_inbound_at IS NULL` (a tap is not a conversation), `is_test`, and rows with a `duplicate_of`. No escalation when `ANSWERING_HOURS` is unset — an escalation policy without known hours would page someone at 03:00.
- The admin dashboard shows median first-response for the last 30 days and the count still `new`. `X לידים ללא טיפול` is the number that keeps the system alive.

**The whole architecture is capped by response speed.** If no branch manager staffs the channel within minutes, a better form buys nothing.

---

## 12. Anti-spam without hurting conversion

Ordered by cost to a real visitor, ascending. Nothing here adds a CAPTCHA.

**12.1 Wire up the existing honeypot.** The server already implements it (`routes.ts:104-105,153-158`) keyed on `company_website` — but the form never renders the field, so the measure is dead code.

```tsx
<div className="hp" aria-hidden="true">
  <label>אל תמלאו:
    <input name="company_website" tabIndex={-1} autoComplete="off" />
  </label>
</div>
```

Positioned with `position:absolute; inset-inline-start:-9999px`, never `display:none` (some bots skip hidden fields). Keep the current behaviour of returning `{ success: true }` to a bot so it does not try another way.

**12.2 A timing check.** Reject a submit arriving under 2.5s after the builder mounted; no human completes four screens faster. `mountedAt` is a hidden field compared against server time with a generous skew allowance. This alone kills most naive form spam and costs a real visitor nothing.

**12.3 Fix the rate limiter, which currently costs real leads.** `windowMs: 10min, max: 8` keyed on `req.ip` — Israeli mobile carriers use carrier-grade NAT extensively, so many unrelated users share one public IP and an office behind NAT hits 429 on a *first, legitimate* submission. That is a lead-losing failure mode that looks like nothing at all in logs.

| Endpoint | Limit | Behaviour |
|---|---|---|
| `POST /api/quote` | 20 / 10 min, keyed on `ip + coarse UA hash` | 429 with a Hebrew message that includes the phone number |
| `POST /api/wa-intent` | 60 / 10 min | **fails open** — never blocks the redirect |
| `POST /api/quote/draft` | 120 / 10 min | fails open |
| `GET /api/quote/:ref` | 60 / 10 min + 600/hour global | 404 on limit, never 429 (does not leak existence) |
| `PATCH /api/quote/:ref/notes` | 10 / 10 min | 429 |
| `POST /api/wa/webhook` | none | HMAC-verified instead |

**12.4 Server-side field discipline.** Enumerated fields (`guestBand`, `serviceFormat`, `waLocation`, `branch`, `path`, `contactChannel`) are `z.enum`, not free strings. Free text exists only in `notes` (post-submit, ≤1,000 chars) and the area field (≤60, scrubbed before drafting). UTM and referrer are charset-whitelisted and length-capped at ingest, because they are attacker-controlled and **will** be rendered in an owner-facing view.

**12.5 Duplicate collapse, not rejection.** Two submits with the same `phone_e164` within 30 minutes: keep the newer, set `duplicate_of` on it, fire **no** second notification and **no** second `generate_lead`. Never show the visitor an error — a "you already submitted" message on a genuine second attempt is a lost lead.

**12.6 Nothing else.** No CAPTCHA, no reCAPTCHA v3 score gate, no email verification, no phone OTP. Each costs more real leads than the spam it stops at this volume, and reCAPTCHA additionally reintroduces a third-party request and a privacy disclosure that §10.3 just eliminated.

---

## 13. Admin leads view

### 13.1 Auth

Keep the existing `requireAdmin` middleware — token-gated, disabled by default when `ADMIN_TOKEN` is unset or under 24 chars, `timingSafeEqual` comparison, `Cache-Control: no-store, private`. Three additions:

1. **One token per person**, not one shared token. `ADMIN_TOKENS` is a comma-separated list; each token maps to a label recorded in `מסמך הגדרות המאגר`. The token fingerprint then identifies a human, which the security regulations' access-permission and incident-documentation requirements assume you can do.
2. **Access logging.** Every `/api/leads*` hit logs `timestamp · sha256(token).slice(0,8) · req.ip · rowCount`. Never field values. Retained 24 months. A test asserts no lead field name ever reaches the logger.
3. **Pagination and a `since=` filter.** `GET /api/leads?since=2026-07-01&limit=50&cursor=…`. The current endpoint returns the entire table at once, so one leaked token exposes every lead ever collected and a routine view is indistinguishable from an exfiltration.

### 13.2 It is a worklist, not a report

The binding constraint on closed-won attribution is human data entry, and a restaurateur will not log into GA4 to do it. Layout, in order:

**Panel 1 — `לידים שממתינים לטיפול`** (default; `status IN ('new','working')`). Each row is two taps wide:

```
MM-7F3K2Q · 12:04 · דנה · 054-… · אירוע חברה · בין 50 ל־100 · הרצליה
[📞 חייגו] [💬 וואטסאפ] [בטיפול] [נשלחה הצעה] [נסגר ✓] [לא יצא]
```

`נסגר ✓` opens one ₪ field (`won_value_ils`) and nothing else. `לא יצא` opens a `lost_reason` select. No modal, no form, no page navigation.

**Panel 2 — `פניות וואטסאפ ללא התאמה · 72 שעות`** — `path='whatsapp' AND first_inbound_at IS NULL`. Shows event type, band, area and time so the owner can attach a real conversation to the time-proximate intent. Also shows the **ref-code match rate** as a first-class number, because prefill text is user-editable and recovery is known-lossy.

**Panel 3 — `התראות שנכשלו`** — red, only when non-empty.

**Panel 4 — the report**, one table:

| ערוץ | פניות | איכותיות | הצעות | נסגרו | ₪ שנסגר | ₪ לפנייה | % סגירה |

**Panel 5 — `עניין שלא הושלם`** — aggregated abandoned drafts. Counts by event type, band, area and step-of-abandonment. Never rows.

**Standing notices**, rendered above Panel 1 when true: `לא הוגדרה תקופת שמירה ללידים` · `{n} לידים ללא טיפול` · `לא הוגדר NOTIFY_WEBHOOK_URL`.

A **daily WhatsApp digest** to the owner's own number carries Panel 1's count, yesterday's leads by channel, and the unmarked count. That is the surface they will actually read; the dashboard is where they act.

### 13.3 Statistical hygiene, enforced in the UI

At this business's volume, monthly closed-won will be single-digit to low-double-digit, making per-campaign comparisons statistical noise. Therefore:

- Default window is a **rolling 90 days**.
- Aggregate at **channel** level, not campaign level.
- **Suppress any ratio whose denominator is under 10** — render `—`, never a percentage. Showing "33% close rate" off 3 leads is exactly how an owner makes a bad budget decision, and a dashboard that enables that is worse than no dashboard.

### 13.4 Status transitions

```
new → working → quoted → qualified → won
                              ↘ lost
new → disqualified
```

Every transition appends a `lead_events` row and sets `status_changed_at` + `status_changed_by` (token fingerprint). Backwards transitions are permitted and logged — real sales are not a DAG. Transitions to `working`, `qualified`, `won` and `lost` also fire the corresponding GA4 Measurement Protocol event (§14.2).

### 13.5 Data-subject rights, as routes not prose

- `GET /api/leads/:id` and `DELETE /api/leads/:id` behind the same auth, so fulfilling an `עיון` or `מחיקה` request is one action rather than hand-edited SQL.
- 30-day response clock, identity verified against the phone on file, written answer logged — procedure in `docs/privacy/dsr-runbook.md`, owned by `04-legal-and-content.md` together with `database-definition.he.md`, `processors.md`, `retention.md`, `incident-runbook.md` and `consent-log.md`. Those five documents are the cheapest available compliance evidence and are `01` Wave 0 deliverables, not future work.

### 13.6 Export

`GET /api/leads/export.csv?since=…` — admin-gated, `Content-Disposition: attachment`, UTF-8 **with BOM** (Excel on Hebrew Windows mangles it otherwise), all columns, `Cache-Control: no-store`.

`GET /api/leads/ads-export.csv?since=…` — a separate, narrow export for Google Ads, columns **exactly**:

```
Google Click ID,Conversion Name,Conversion Time,Conversion Value,Conversion Currency
```

Rows included only where a click ID exists, `consent_ad_user_data IS NOT FALSE`, and `click_id_captured_at` is inside the upload window. Rows outside it are marked `ads_upload_status='expired_window'` and excluded — never silently dropped.

---

## 14. GA4 taxonomy and Google Ads mapping

### 14.1 Setup, before any event fires

1. **Turn OFF "Form interactions"** in enhanced measurement, or GA4's automatic `form_start` / `form_submit` double-counts against `quote_start` / `generate_lead`.
2. **Set event data retention to 14 months** on day one. The default is 2 months; a 3–8 month catering sales cycle is unanalysable at 2, and retention is **not retroactive**.
3. Register `step_id`, `guest_band`, `branch_area`, `lead_source`, `wa_location`, `service_format`, `dish_id` as **event-scoped custom dimensions** or they are invisible in reports.

### 14.2 Event taxonomy — closed union, one module

Use GA4's **reserved** lead-gen names — that is what populates the built-in Lead Generation reports and the eight lead audience templates. No `lead_submit`, no `form_success`, no `quote_submit`.

| Event | Params | Fired |
|---|---|---|
| `quote_open` | `source_page` | builder enters viewport |
| `quote_start` | `source_page`, `event_type` | first answer on screen 1 |
| `quote_step_complete` | `step_index` 1–5, `step_id` (`event_type｜guests｜date｜area｜contact`), `event_type`, `guest_band`, `area`, `date_known` | on advance |
| `quote_step_back` | `from_step` | `← חזרה` |
| **`add_to_brief`** | `dish_id`, `source_page`, `brief_size`, `service_format` | `הוסיפו לתפריט שלי` |
| `remove_from_brief` | `dish_id`, `brief_size` | removal in the brief card |
| `service_format_select` | `service_format`, `source_page` | chef's-menu card selection |
| `estimate_shown` | `estimate_min`, `estimate_max`, `service_format` | only when all four §2.2 locks pass |
| **`generate_lead`** | `lead_source` (`quote_builder｜whatsapp_handoff｜menu｜taste`), `lead_ref`, `guest_band`, `event_type`, `branch_area`, `service_format` — **no `value`** | server-confirmed submit |
| `whatsapp_click` | `wa_location`, `has_lead` | any WhatsApp CTA |
| `whatsapp_handoff` | `lead_ref`, `wa_location`, `branch` | `openWhatsApp()` |
| `call_click` | `call_location`, `is_business_hours` | any `tel:` |
| `taste_intent` | `source_page`, `branch` | tasting band CTA — only when §1.6 gate passes |
| `menu_print` | `source_page` | print link |
| `summary_share` | `lead_ref`, `share_method` (`webshare｜copy｜print`) | `/summary` share |
| `kitchen_page_click` | `branch`, `source_page` | any link into `/kitchens/:slug` |
| `event_page_click` | `target_route`, `source_page` | any link into a `/catering/*` occasion page |
| **`working_lead`** | `lead_ref` | admin → working (server-side, Measurement Protocol) |
| **`qualify_lead`** | `lead_ref` | admin → qualified (MP) |
| **`close_convert_lead`** | `lead_ref`, `value`, `currency: 'ILS'` | admin → won (MP) |
| **`close_unconvert_lead`** | `lead_ref`, `lost_reason` | admin → lost (MP) |

The last five names in the middle block (`add_to_brief`, `summary_share`, `kitchen_page_click`, `event_page_click`, `service_format_select`) close prior-review B9: `01` names them as page conversion goals and the first pass's union contained none of them.

The four post-submit events can only be fired **server-side via Measurement Protocol** from the admin status change — which is why `ga_client_id` must be persisted on the lead row. Without that column, closed-won can never be stitched back into GA4 at all. Store `ga_session_id` too, to reduce (not eliminate) session-splitting distortion.

The taxonomy lives in **one** typed module, `client/src/lib/analytics.ts`, as a discriminated union so a new landing page cannot invent its own event names. Per-step distinct event names are deliberately avoided — they burn GA4's 500-name budget and make funnel exploration harder than one parameterised event.

### 14.3 `generate_lead` carries no `value`

Until the owner supplies per-guest-band values they will stand behind (gross margin per guest × a realistic close rate for that band). Deriving value from the deleted calculator's invented rates would make Smart Bidding bid real money against fabricated economics — the same class of problem as the removed בד"ץ badge, with a budget attached.

### 14.4 Google Ads conversion mapping

| Tier | Action | Ads setting |
|---|---|---|
| 1 primary | `Lead — quote submitted` | Primary, count **One**, click-through window **90 days** |
| 1 primary | `Lead — WhatsApp handoff` | Primary, count One — **separate action** so its lower quality stays visible |
| 2 secondary | `call_click`, `whatsapp_click`, `estimate_shown`, `taste_intent`, `add_to_brief` | **Secondary / observation only** |
| 3 imported | `Qualified lead` | Imported, value-adjustment signal |
| 3 imported | `Closed won` | Imported, **reporting only** |

Count = **One**, not Every: a couple planning a wedding will submit twice, and Every inflates the denominator of every ratio the owner looks at. Marking `call_click` and `whatsapp_click` Secondary is the single setting that stops Smart Bidding chasing unmeasurable intent proxies.

**Bid on `Lead — quote submitted`, not on closed-won.** Smart Bidding needs roughly 15–30 conversions per 30 days per campaign; closed-won catering events across three branches will be far below that and the campaign will thrash. Revisit only at a sustained 30+/month.

**The optimisable conversion cannot be closed-won for a second, structural reason:** GCLID-keyed offline uploads are accepted only within 90 days of the click, and enhanced-conversions-for-leads uploads keyed on hashed PII only within 63 days. A wedding booked 4–8 months out closes **after** the window and can never be imported. `Qualified lead` (quote sent + tasting or site visit booked, landing around day 1–10) is the in-window proxy.

### 14.5 Upload mechanism — CSV, not the API

**As of 15 June 2026 — already past — offline conversion imports and enhanced-conversions-for-leads uploads were migrated to the Data Manager API and blocked in the Google Ads API.** Only developer tokens that sent an `UploadClickConversions` request between January and June 2026 were allowlisted; others receive `CUSTOMER_NOT_ALLOWLISTED_FOR_THIS_FEATURE`. This project has no pre-existing developer token, so the Google Ads API path is closed.

Therefore: `GET /api/leads/ads-export.csv` (§13.6) plus a scheduled Google Sheets import in the Ads UI. Move to the Data Manager API only if volume ever justifies OAuth app maintenance. **Every 2024–2025 tutorial for this task is now wrong** — write that sentence into the code comment above the export handler, because someone will follow one.

### 14.6 The split, declared so nobody "fixes" it

- **Postgres is the source of truth for channel ROI.** It holds the click ID, the consent state and the owner-entered ₪.
- **GA4 is for funnel and behaviour analysis.** MP events sent with `client_id` but no valid `session_id` are attributed to a new session, and GA4 credits closed-won using the touchpoints known at *upload* time rather than the original click. It will never be a trustworthy ROI system here.
- **Google Ads receives uploads purely to feed bidding.**

### 14.7 Call tracking

Google forwarding-number availability in Israel is **unverified** (Google's country-list page returns 403 to automated fetch; third-party sources confirm only US/UK/CA/AU). Do not design around GFN. Instead: three DIDs from an Israeli VoIP provider — one per traffic class (Google Ads / Meta / organic+direct) — all ringing the same restaurant line, swapped client-side from the `mm_attr` cookie via a server-rendered value (the cookie is `httpOnly`, so the swap value is injected into the HTML, not read by JS). The provider webhook POSTs to `/api/call-event`.

This yields **channel-level** call attribution, explicitly not click-level. Someone must confirm GFN availability inside the real Ads account before anyone promises click-level call conversions.

A `tel:` click is not a call, and Google's default 15-second qualifying threshold is far too short for catering. Define a qualified call as **≥60s connected** and count only those. `call_click` stays a GA4 secondary signal for CTA-placement analysis, never a conversion.

### 14.8 Tag loading and CSP (prior review C8)

No analytics or advertising script may be added as a raw `<script>` tag. All of them load through one module, `client/src/lib/consent.ts`, exposing `loadTag(kind: 'ga4' | 'ads' | 'meta')`, which:

- checks the consent state for the visitor's region before injecting;
- injects at most once per kind;
- is the only place in the codebase permitted to create a `<script src>` pointing at a non-same-origin host.

`server/index.ts` gains a `Content-Security-Policy` (it currently sets four security headers and no CSP). Baseline, tightened as tags are added:

```
default-src 'self';
script-src  'self' 'nonce-{perRequest}';
style-src   'self' 'unsafe-inline';
img-src     'self' data:;
font-src    'self';
connect-src 'self';
frame-src   'none';
base-uri    'self';
form-action 'self';
object-src  'none';
```

`img-src data:` is required by the inline SVG grain layer; the JSON-LD blocks are `<script type="application/ld+json">` and need the nonce. Adding GA4 later means adding `www.googletagmanager.com` to `script-src` and `connect-src` **in the same commit as the consent gate**, never before.

### 14.9 The success metric, agreed before launch

This architecture deliberately trades raw submission volume for qualified volume: a four-question builder with a real consent checkbox and no fabricated price total will produce **fewer, better** leads than an eight-field open form plus an invented calculator. If the owner measures raw form submissions they will conclude the rebuild failed.

**Report on booked events and cost per booked event, never on form submissions.** Agree it in writing before launch. Without the `status` field and someone updating it, the phrase "insane lead machine" is unfalsifiable.

---

## 15. The `<Slot>` and `<Fact>` contract this document depends on

Components are owned by `03-design-system.md`. This document states the **capabilities it requires**, because the first pass had three incompatible APIs across three files (prior review B6) and the one that owned components omitted the `blocking` prop entirely.

Required capabilities:

| Capability | Requirement |
|---|---|
| **Clause prune** | `<Slot id>` inline removes only its own clause — its surrounding separator (` · `) goes with it, and the line survives if any sibling clause remains. Demonstrated by §1.3 degrading to `שלושה מטבחים`. |
| **Row prune** | A table row with an empty value is removed entirely (§3.12). |
| **Cell prune** | A table whose values are **all** empty collapses to a menu-style list, never a gapped grid (§3.4). |
| **Section prune** | A section whose children are all empty removes itself and its heading (§1.6, §3.5). |
| **`blocking`** | Throws during `vite build` when `NODE_ENV=production` and the value is unset. Required for `LEGAL_ENTITY`, `COMPANY_ID`, `PRIVACY_CONTACT`, `WA_NUMBER`, `TEL_E164`. |
| **Dev visibility** | Renders `«[למילוי: …]»` on a highlighted background in development; renders `null` in production. Never a plausible default, in either mode. |
| **`<Fact>`** | `<Fact value source />` — every figure either cites where it can be checked (`3 מטבחים · כתובות בסעיף 04`) or does not render. |

Build gate: `WA_NUMBER` fails the build if unset **or** still equal to `972521234567`. That placeholder is a syntactically valid Israeli mobile number and may belong to a real person who would otherwise receive the site's entire lead flow.

---

## 16. Build gates — what CI must fail on

The first pass's gate script was broken in three ways (prior review D10): it wrote to `/dev/tty`, which does not exist on a CI runner; it passed unquoted arguments that could not carry a glob; and its `₪` pattern matched only the format the spec bans while missing every price written in house style (prior review D9). Corrected:

```bash
#!/usr/bin/env bash
# scripts/check-honesty.sh — exits non-zero on any hit. Writes to stdout.
set -uo pipefail
fail=0

check() {                       # check <label> <pattern> [rg-args...]
  local label="$1"; local pat="$2"; shift 2
  if rg -n --pcre2 "$pat" "$@"; then
    printf '✗ %s\n' "$label"; fail=1
  fi
}

SRC=client/src

# 1. kashrut and fabricated proof — anchored, so הכשרה / מכשיר do not false-positive
check "kashrut / invented proof" \
  '(?<![\p{Hebrew}])(כשר|כשרות|בד״ץ|בד"ץ|מהדרין|גלאט)(?![\p{Hebrew}])|25 שנות|אלפי לקוחות|10,?000\+|4\.9|4\.8|247 ביקורות|189 ביקורות' \
  "$SRC"

# 2. any price, in either currency order, incl. NBSP
check "hardcoded price" \
  '[0-9][\s\x{00A0}]*₪|₪[\s\x{00A0}]*[0-9]' \
  "$SRC" --glob '!'"$SRC"'/config/pricing.ts'

# 3. invented commitments that were shipped as copy in the first pass
check "invented minimum / SLA" \
  'מ־?25 (ועד|סועדים)|24/7|זמינים 24|תוך 24 שעות|כולל מע״מ|לא כולל צוות' \
  "$SRC" --glob '!'"$SRC"'/content/legal.ts'

# 4. Arabic codepoints inside Hebrew strings (two verified occurrences at HEAD)
check "Arabic chars in Hebrew" '[\x{0600}-\x{06FF}]' "$SRC"

# 5. bidi-reversing numeric ranges
check "en/em dash between digits" '\d\s*[\x{2013}\x{2014}]\s*\d' "$SRC"

# 6. physical direction utilities in an RTL codebase
check "physical direction utilities" \
  '\b(ml|mr|pl|pr)-|\b(left|right)-[0-9]|text-(left|right)|\bspace-x-|\bdivide-x-' \
  "$SRC/components"

# 7. WhatsApp discipline
check "bare wa.me" 'wa\.me|api\.whatsapp\.com' "$SRC" --glob '!'"$SRC"'/lib/whatsapp.ts'

# 8. drizzle in the browser bundle
check "@shared/schema in client" '@shared/schema' "$SRC"

exit "$fail"
```

Additional gates:

| Gate | Assertion |
|---|---|
| Estimate default | with default `PRICING` and default `LEGAL`, `estimateEnabled(f) === false` for every `f`, and `<EstimateRange>` renders `null` |
| Service formats default | with default `SERVICE_FORMATS`, page section 02 renders `null` and `service_format` is never set |
| Tasting gate | with `LEGAL.TASTING_POLICY === null`, no `בואו לטעום` string appears in the rendered DOM of any route |
| Area gate | with every `servesAreas === null`, screen 4 renders a free-text field and no city name appears |
| No `await` before WhatsApp nav | AST check on `lib/whatsapp.ts`: no `AwaitExpression` between the `fetch` call and the navigation |
| Prefill length | `encodeURIComponent(buildHebrewMessage(worstCase, ref)).length < 1600` |
| Placeholder number | build fails if `WA_NUMBER` unset or `=== '972521234567'` |
| Blocking slots | build fails if `LEGAL_ENTITY`, `COMPANY_ID`, `PRIVACY_CONTACT`, `TEL_E164` unset in production |
| Notice presence | `QuoteBuilder` cannot compile without `sourcePage`; snapshot asserts the collection notice is in the DOM on every route that renders a builder |
| Consent checkbox absent on shiva | snapshot asserts no marketing checkbox on `/catering/shiva` |
| Storage parity | `MemoryStorage` row keys === `leads` column names |
| No PII in logs | no lead field name appears in any logger call |
| No PII in drafts | `POST /api/quote/draft` rejects a payload containing `name`, `phone`, `email` or `notes` (`.strict()`) |
| Timezone | no `getDay()` / `getHours()` on a `Date` outside a helper that passes `timeZone: 'Asia/Jerusalem'` |
| Unsubscribe reachable | `/unsubscribe?t=…` returns 200 for a valid token and the marketing checkbox copy is present |
| axe-core | 0 violations on the builder at screens 1–5, at 320px and at 200% zoom |

---

## 17. Owner-blocking facts

The lead machine ships without every one of these, degraded but honest. Each unfilled Slot removes a clause, a row, a section or a whole mechanic — never a guess.

**Blocks launch (build fails):**
registered legal name + ח.פ. · privacy contact channel (a monitored mailbox and a phone, plus the internal role that answers עיון/תיקון/מחיקה — not a personal name in a DPO title) · real phone per branch in display and E.164 form · the WhatsApp number, whether it is already live on the Business app, and on whose phone · branch addresses.

**Blocks a specific mechanic:**

| Slot | What stops working |
|---|---|
| `RESPONSE_TIME` | hero note clause, reassurance line 2, `/thanks` response line, away message |
| `MIN_GUESTS` / `MAX_GUESTS` | hero note clause, the honest downgrade (§2.5) and the over-capacity note (§2.6) |
| `PRICING.perPerson` + `approvedAt` + `vatStatus` + `PRICE_ESTIMATE_NOTE` | the entire estimate, everywhere, including `estimate_shown` |
| `SERVICE_FORMATS[*].offered` | page section 02, `service_format` capture, format-level pricing |
| `SERVICE_FORMATS[*].includes` / `excludes` | the inclusions/exclusions columns — the axis on which we beat a 45 ₪ competitor without publishing a price |
| `locations[*].servesAreas` | area chips and branch routing; screen 4 degrades to free text |
| `locations[*].privateEventCapacity` | the `אירוח אצלנו במסעדה` chip and the `at_restaurant` format |
| `locations[*].chefName`, `gbpUrl`, `hours` | branch columns, the only compliant social proof, after-hours behaviour |
| `TASTING_POLICY` | the entire tasting path and `taste_intent` |
| `menus.ts` (which dishes are catering-available) | page section 01, `add_to_brief`, dish rows in the prefill and the summary card |
| `DEPOSIT_TERMS` / `CANCELLATION_SUMMARY` / `HEADCOUNT_DEADLINE` / `QUOTE_VALIDITY` | the commercial-terms strip, per row |
| `ANSWERING_HOURS` | after-hours copy **and** the escalation sweep |
| `KASHRUT_BY_BRANCH` | the FAQ answer, and whether `/catering/shiva` is built at all |
| `ALLERGEN_NOTE` | the allergen FAQ answer; `gluten_free_ingredients` tags stay unexplained |
| `LEAD_RETENTION_MONTHS` | the purge job; a standing admin notice appears instead |
| marketing-consent + follow-up wording, verbatim | the checkbox does not ship, so no marketing may ever be sent |
| per-guest-band ₪ values the owner will stand behind | any Ads conversion value; `generate_lead` stays value-free |
| same-day cutoff per branch (weekday and Friday) | the whole `/urgent` route |

**Blocks a decision, not code:**
consent defaults for Israeli traffic, with the owner's own legal sign-off · whether CTWA ads will run (promotes Cloud API from Phase 2 to launch-blocking) · whether cross-branch backup is a commitment they will publicly honour · whether leads are actually passed to any third party for event execution (decides whether the reassurance line in §3.10 may ship at all) · GA4 measurement ID, Ads account ID, and the exact conversion action names, which the CSV export's `Conversion Name` column must match character-for-character or every row is rejected · the chosen BSP and written confirmation that Coexistence is available for Israel.

---

## 18. Sequencing

1. **P1–P6 deletions + the honesty CI gate** (§0.2, §16). No owner input. Ship today. Nothing below may land on top of live kashrut claims, fabricated testimonials or invented prices — the design work would otherwise re-endorse them with better typography.
2. **Palette and token replacement** (gold → paper-and-ink), before any section is restyled, or every new CTA inherits 2.25:1.
3. `config/business.ts`, `config/pricing.ts`, `config/service-formats.ts`, `config/quote.ts`, `content/legal.ts`, `data/locations.ts`, `data/menus.ts`, `<Slot>`, `<Fact>` and their build gates.
4. **Schema migration** (§8) + `MemoryStorage` parity + `db.ts` TLS fix + the attribution middleware and merge (§10). **Before any UI work** — the multi-page strategy is unmeasurable without it, and consent columns cannot be retrofitted to already-collected rows.
5. `lib/whatsapp.ts`, `POST /api/wa-intent`, `POST /api/quote`, `POST /api/quote/draft`, `GET /api/quote/:ref`, `/unsubscribe`. Notification hardening (§11.2) in the same commit — it is the highest-ROI code in the repo.
6. `QuoteBuilder` + `add_to_brief` + `/thanks` + `/summary` + the print stylesheet.
7. **Admin worklist**, before launch. A lead machine nobody triages is a dead code path producing confident-looking zeros.
8. `lib/analytics.ts` + `lib/consent.ts` + CSP + GA4 + Ads conversion actions + the CSV export. **Before the second landing page**, or there is no baseline.
9. Route variants (§1.7) in ROI order: `/catering/business` → `/kitchens/:slug` → `/urgent` → `/pasta-bar` → `/areas/:city`.
10. Phase 2 WhatsApp Cloud API — unless CTWA ads are planned, in which case it moves to step 5.
