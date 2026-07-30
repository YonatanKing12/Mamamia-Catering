# 01 · Site Architecture Spec — מאמא מיה קייטרינג

**Status:** authoritative. Supersedes the route table in `client/src/App.tsx` and **supersedes the first-pass version of this file in full.**
**Branch:** `claude/catering-landing-page-dbvbbx`
**Base design direction:** **תפריט / TAFRIT — "the menu is the site."** The first pass was written against *Kitchen as Document* because of a scoring-tally bug; that base is withdrawn. Grafts from both losing directions are carried forward as first-class (§0.3).
**Companion specs — actual filenames, not aspirational ones:**

| File | Owns |
|---|---|
| `01-site-architecture.md` (this file) | routes, page contracts, IA, decomposition, schema.org, build order |
| `02-lead-machine.md` | conversion mechanics, quote builder, WhatsApp, data model, attribution, analytics |
| `03-design-system.md` | tokens, typography, components, RTL, motion, a11y system |
| `04-legal-and-content.md` | **does not exist yet — Wave 0 deliverable.** Owns the rewritten `/privacy`, `/terms`, `/accessibility` copy, the collection notice, the cancellation clause, the allergen statement, the `docs/privacy/*` artefact set |

Any cross-reference in `02` or `03` to "`04-*` (data model)" or "`05-*` (legal)" is stale numbering from the first pass and must be rewritten to the table above.

---

## 0. Preconditions

### 0.1 Blocking deletions — Wave 0, one commit, one owner, before any page in this spec

Every item below was believed removed and is still in the working tree at HEAD.

| What | Where | Action |
|---|---|---|
| כשר / בד״ץ / מהדרין claims | `sections/hero.tsx:24,70`, `layout/footer.tsx:68`, `sections/story.tsx:24`, `data/faq-data.ts:21-29`, `pages/terms.tsx:118,121` | delete the strings. Kashrut returns only as one owner-verbatim FAQ answer (`locations[branch].kashrutStatementHe`), never a badge, never composed by us |
| Fabricated testimonials + hardcoded `Google 4.9/5 · 247` / `Facebook 4.8/5 · 189` | `sections/testimonials.tsx` (whole file) | delete file. Replaced by `PastEvents` (§4.4) + `GoogleReviews` (§4.5) |
| Invented statistics `25 שנות ניסיון`, `אלפי לקוחות מרוצים`, `10,000+`, timeline 1995/2005/2020 | `footer.tsx:12`, `story.tsx:34-53,67-74`, `data/blog-data.ts:16`, `pages/blog-post.tsx:91`, `data/gallery-data.ts:17` | delete |
| Invented prices + calculator engine | `sections/price-calculator.tsx` (whole file), `sections/events.tsx:9-30`, `data/menu-data.ts` price fields, `contact.tsx:230-233` budget bands | delete file and fields |
| Invented legal identity | `pages/terms.tsx:24,40,57,59,64-67,77-80,156,188,198`, `pages/privacy.tsx:161` (fictitious named DPO) | convert to build-blocking Slots |
| **Unlawful / מקפח terms clauses** | `pages/terms.tsx:135-138` (general liability cap), `:155` (marketing use of event photography on an opt-out), `:167` (mandatory בוררות), `:168` (exclusive Tel Aviv forum) | `:167` deleted outright; `:168` deleted; `:135-138` replaced per `04-*`; `:155` becomes an explicit opt-in in the booking document, not a תקנון clause |
| False accessibility conformance claims | `pages/accessibility.tsx:32,48,56,88-97,118` | rewrite as honest partial conformance (`04-*`) |
| Gold token `hsl(43,74%,49%)` | `client/src/index.css:28-35,113-128`, `tailwind.config.ts` | delete at token level **before** any section is restyled (2.25:1 on white — every CTA fails AA today) |
| Placeholder phone `052-123-4567` / `wa.me/972521234567` | 8 files, 14 occurrences | replaced by `client/src/config/business.ts`; build fails if unset or still equal to the placeholder |
| Font Awesome cdnjs `<link>` | `client/index.html:37-43` | delete |
| `@shared/schema` imported into the browser | `sections/contact.tsx:14` | replace with `shared/lead-schema.ts` (no drizzle; −13.5 KB gzip and it stops publishing the Postgres DDL to the public) |
| Dead `href="#"` legal links | `layout/footer.tsx:80-82` | wire to `/privacy`, `/terms`, `/accessibility` |
| Orphaned tables + seed blocks | `testimonials`, `gallery_items`, `blog_posts` in `shared/schema.ts`; their `IStorage` methods; the matching blocks in `server/seed.ts` (including `:110`, which asserts `consentGiven: true` then strips it before insert, destroying the only evidence of consent) | delete tables, methods and seed blocks |
| Arabic-script characters inside Hebrew strings | `sections/blog.tsx:13` (U+0639), `data/faq-data.ts:11` (U+064A, U+0646) | deleted with those files; the CI guard in 0.11 prevents recurrence |

### 0.2 Why the base direction changed, and what that means structurally

The corrected panel gives TAFRIT the brief-fit and buildability lenses; the Decision Sheet took conversion. The decisive architectural fact is this: **there is currently no photography of any kind, and what eventually arrives will be owner-supplied phone photos of unknown quality.** A photography-led system has a floor of labelled grey frames. A menu-led system has a floor of *a shorter menu*, which is a legitimate restaurant artefact rather than an unfinished page.

Therefore, as a hard architectural constraint:

> **Every route in this spec must be fully convincing with zero photographs, and must improve — never merely "become complete" — when real photographs land.**

Concretely: no route's above-the-fold region contains an image; no section's *structure* depends on an image; every `<Photo>` call site sits inside a block that renders correctly with the photo omitted entirely (not with a placeholder frame in its place).

### 0.3 Grafts adopted as first-class

**From המטבח כמסמך (Kitchen as Document):**
- **G1 · The Caption Law.** `<Photo>` has a **required** `caption` prop, format `{סניף} · {רחוב} · {מה קורה} · {שעה}`. Build fails on an uncaptioned image. This is what permanently blocks stock imagery and SVG stand-ins from re-entering.
- **G2 · Proof/assertion rule, applied to type.** No claim renders without an adjacent checkable fact. Applied to the dish provenance mark (§4.2).
- **G3 · One ink band per route, pinned to the kitchens section**, and it is the only place people appear.
- **G4 · Branch-named WhatsApp** and honest routing confirmation.
- **G5 · Hero CTA discipline** + a self-deleting clause-level fact line.
- **G6 · Three-axis page differentiation** + per-route `og:image`.
- **G7 · Shoot brief as metadata capture** — branch, street, action, **hour** captured at shoot time.

**From דף ההחלטה (Decision Sheet):**
- **G8 · `מה לא כלול`** as a published column of equal weight to inclusions.
- **G9 · `מה אנחנו לא עושים`** as its own numbered section, not a sentence inside inclusions.
- **G10 · Commercial-terms strip** adjacent to submit.
- **G11 · The decision checklist as mobile in-page nav**, rendering only rows whose targets are filled (the promise-of-answers framing is stripped).
- **G12 · Route-level register inversion** on `/urgent`, `/catering/business`, `/catering/shiva`.
- **G13 · The forwardable ref-coded summary** at `/summary?ref=`, printable, rendered as a **menu card, not an invoice**.
- **G14 · `<Fact>`** — a value plus a visible source label.
- **G15 · Per-branch drive-time table** as the only honest basis for area pages.
- **G16 · `PastEvents`** as a collapse-when-empty reference table.

### 0.4 Architectural invariants — fail review if broken

- **INV-1 · Caption Law.** G1. No uncaptioned image ships.
- **INV-2 · Slot-or-nothing, pruning the smallest containing unit.** A fact renders only through `<Slot>`. Unfilled ⇒ prune **clause → row → cell → section**, in that order of preference. Never a plausible default; never an empty highlighted box in production.
- **INV-3 · At most one ink band per route** (`count(data-band="ink") ≤ 1`), and where one exists it is `KitchensBand`. *Not* "exactly one" — at least ten routes legitimately have none.
- **INV-4 · One filled primary CTA per viewport in page content**, max two visible CTAs. `הזמינו עכשיו` is banned. **Stated exception:** the mobile sticky bar is chrome, not content; it carries at most one *filled* control (WhatsApp) plus one ghost, and its content is set per route by `RouteDef.stickyBar`.
- **INV-5 · Three-axis differentiation.** Pages differ on exactly three axes — copy, hero/section-specific facts, and branch/FAQ specifics — plus their own `og:image`. No page-specific accent colour, no bespoke hero, no page-specific section order except the §0.3 G12 inversion.
- **INV-6 · Every collection point carries the סעיף 11 notice**, inside the form component, above submit, as a required prop. A page cannot ship a bare form.
- **INV-7 · Every route emits its own `<title>`, `description`, `canonical`, `og:*` and JSON-LD, from the server.** Parameterised routes resolve per-parameter (§5.1).
- **INV-8 · No route ships without an entry in `shared/routes.ts`.** Sitemap, head layer, breadcrumbs and the internal-link graph all derive from that one file.
- **INV-9 · All calendar and clock logic is computed in `Asia/Jerusalem`, explicitly**, via `Intl.DateTimeFormat(…, { timeZone: 'Asia/Jerusalem' })`. The client device clock is never trusted for a cutoff, an answering-hours gate, or a Friday/Saturday determination. `new Date(x).getDay()` parses as UTC and misclassifies Friday/Saturday near midnight.
- **INV-10 · Zero third-party runtime requests by default.** No Google Fonts, no cdnjs, no Maps iframe, no embedded review widget. Anything that would add one goes through the single consent-gated module in §5.9 or does not ship.

---

## 1. Hebrew slug policy — DECIDED

**Decision: ASCII slugs. English-semantic words for concepts, standard Latin transliteration for proper place names. No Hebrew characters in any URL path. No transliterated Hebrew words.**

```
/catering/business           ✅  concept in English
/kitchens/herzliya-pituach   ✅  place name transliterated
/catering/bar-mitzvah        ✅  loanword, already Latin-conventional
/קייטרינג-לחברות             ❌  rejected — see below
/kaytering-lachavarot        ❌  rejected — strictly dominated
```

**Justification, stated honestly.** Google explicitly recommends non-English words in URLs for non-English sites (Mueller: "yes, non-English words and URLs are fine, we recommend using them for non-English websites"), and percent-encoded and Unicode forms are equivalent to it. **There is therefore no ranking argument for ASCII, and nobody on this project may tell the client otherwise.** The decision rests entirely on operability:

1. **Percent-encoding cost.** Each Hebrew letter encodes to 9 URL characters. `/קייטרינג-לחברות-בהרצליה-פיתוח` exceeds 250 characters encoded — breaking UTM builders, ad-platform destination fields, CRM columns, printed collateral and analytics reports, across ~27 routes × campaign parameters.
2. **Bidi mangling.** An LTR URL pasted inside RTL Hebrew body copy or a WhatsApp message reorders visually. The whole conversion thesis depends on a buyer **forwarding a link on WhatsApp** (`/summary?ref=`), so a URL that renders scrambled in the message body is a conversion defect.
3. **Transliterated Hebrew is strictly dominated** — no Hebrew keyword value (it is not a Hebrew word to Google) and unreadable to both audiences.
4. **Israeli readers parse `Herzliya`, `menus`, `quote` without friction.**

**The trade we are knowingly making:** Hebrew keyword-in-URL value, a very weak ranking factor, spent to buy operability. Present it to the client as a **choice**.

**Companion rules**
- Hebrew keyword value is recovered where it counts: `<title>`, `<h1>`, body copy, internal anchor text, `og:title`.
- Lowercase, hyphen-separated, no trailing slash, no file extensions. `301` any trailing-slash variant to the canonical form.
- `/summary` and `/thanks` use `?ref=MM-XXXXXX`, not a path segment — the ref code is read aloud on the phone.
- The transliteration table is fixed and lives in `shared/routes.ts`, so nobody re-romanises a city differently on page nine: `herzliya-pituach`, `raanana`, `petah-tikva`, `kfar-saba`, `hod-hasharon`, `ramat-hasharon`, `tel-aviv`.

---

## 2. Page inventory

**Register:** `menu` = the TAFRIT spine (§3.1). `operational` = the G12 inversion. **Gate:** owner facts without which the page is not built at all.

| ID | URL | Register | Phase | `stickyBar` | Gate |
|---|---|---|---|---|---|
| P-01 | `/` | menu | 1 | `quote` | ≥4 catering-available dishes (else §3.3 fallback), branch names |
| P-02 | `/menus` | menu | 1 | `quote` | ≥1 catering-available dish |
| P-03 | `/kitchens` | menu | 2 | `quote` | addresses, hours |
| P-04 | `/kitchens/herzliya-pituach` | menu | 2 | `quote` | address, hours, ≥1 branch-unique fact |
| P-05 | `/kitchens/raanana` | menu | 2 | `quote` | same, per branch |
| P-06 | `/kitchens/petah-tikva` | menu | 2 | `quote` | same, per branch |
| P-07 | `/catering` | menu | 2 | `quote` | none (hub, no new facts) |
| P-08 | `/catering/business` | **operational** | 2 | `quote` | cutoff time, minimum, procurement terms |
| P-09 | `/catering/private-events` | menu | 2 | `quote` | minimum, staffing answer |
| P-10 | `/catering/bar-mitzvah` | menu | 3 | `quote` | kashrut answer, minimum, staffing |
| P-11 | `/catering/shiva` | **operational** | 3 | `phone` | **kashrut answer (hard gate)**, lead time, delivery window, staffed phone hours |
| P-12 | `/catering/holidays` | menu | 3 | `quote` | per-חג capability, order-by date |
| P-13 | `/catering/fun-day` | menu | 3 | `quote` | station operational limits |
| P-14 | `/catering/dairy` | menu | 4 | `quote` | none beyond menus |
| P-15 | `/urgent` | **operational** | 3 | `phone` | same-day cutoff per branch |
| P-16 | `/pasta-bar` | menu | 4 | `quote` | station guest range, power/water/space, whether a cook travels |
| P-17 | `/quote` | operational | 2 | `none` | response-time commitment |
| P-18 | `/thanks` | — | 2 | `none` | response-time commitment |
| P-19 | `/summary` | — | 2 | `none` | inclusions rows, terms strip |
| P-20 | `/unsubscribe` | — | 2 | `none` | none |
| P-21 | `/privacy` | — | 2 | `none` | legal entity, ח.פ., retention periods, processors |
| P-22 | `/terms` | — | 2 | `none` | deposit, cancellation, headcount deadline, entity |
| P-23 | `/accessibility` | — | 2 | `none` | רכז נגישות name + contact, audit facts, per-branch physical access |
| P-24 | `/admin/leads` | — | 2 | `none` | none |
| P-25 | `/404` | — | 1 | `none` | none |
| P-26 | `/areas/:city` | menu | 4 | `quote` | drive time, per-area minimum & fee, one area-specific fact |
| P-27 | `/lp/:campaign` | operational | 4 | per-LP | `noindex`, excluded from sitemap |

**Removed:** `/blog`, `/blog/:id` — fabricated content and a thin-content liability adjacent to 27 real routes. A `/guides/:slug` editorial section may be proposed later; it is out of scope and must not be revived by copying `blog-post.tsx`.

**Route strings are authoritative here.** `02-lead-machine.md` §1.5 and §15 use `/venue/{branch}` and `/shiva`; those map to `/kitchens/:slug` and `/catering/shiva` respectively and must be regenerated from this table, or `shared/routes.ts` and the analytics `source_page` dimension will not match the built site.

---

## 3. The section grammar

### 3.1 The canonical spine

Every `menu`-register route composes from this ordered set. A route omits sections; it never reorders them (INV-5) and never invents one.

| # | Section | Component | Renders when |
|---|---|---|---|
| — | Menu-leaf hero | `MenuHero` | always |
| — | Decision checklist (mobile nav) | `DecisionChecklist` | ≥3 target sections present and filled |
| 01 | `מהתפריט של המסעדה` | `MenuSheet` | ≥1 catering-available dish |
| 02 | `התפריטים לאירוע` | `ServiceMenus` | ≥1 service format has an inclusions list |
| 03 | `מה כלול, ומה לא` | `InclusionsExclusions` | ≥1 inclusion **or** ≥1 exclusion row |
| — | `בואו לטעום` | `TastingBand` | `SLOT.TASTING_POLICY` filled **and** ≥1 branch has address + hours |
| 04 | `מה אנחנו לא עושים` | `LimitsBlock` | ≥1 limit row |
| 05 | `איפה אוכלים את זה הערב` **(INK)** | `KitchensBand` | ≥1 branch has a name + address |
| — | `איך זה עובד` + terms strip | `ProcessSteps` + `TermsStrip` | process always; strip when ≥1 term filled |
| — | `אירועים שעשינו` | `PastEvents` | ≥1 consented row |
| 06 | `התפריט שלכם` | `QuoteBuilder` | route's `stickyBar !== 'phone'` and route is not `/catering/shiva` |
| 07 | `שאלות שנשאלות בטלפון` | `Faq` | ≥1 answered question |
| 08 | `לדבר עם מטבח` | `Colophon` | always |

**Numeral rule.** The numerals `01…NN` in `SectionHead` are assigned **at render time by position**, not hardcoded. A route with five sections numbers `01–05`. Gaps in numbering are the single loudest "template with bits missing" signal and are forbidden.

**Operational register (G12) — the only permitted reordering.** On `/catering/business`, `/urgent` and `/catering/shiva` the order becomes: `MenuHero` → `OpsFacts` → `DecisionChecklist` → `InclusionsExclusions` → `MenuSheet` → … the spine resumes. `OpsFacts` renders **above the fold on mobile** on exactly these three routes and nowhere else.

### 3.2 The dish row and the provenance mark

The dish row is the atomic unit of this whole site. Structure is owned by `03-design-system.md` §7.7; the **content contract** is owned here:

```
[ שם המנה ]·············································[ תג מקור ]
  [ תיאור, עד 12 מילים ]                                [ מחיר או כלום ]
```

**The provenance mark is two-tier, per G2 (no claim without an adjacent checkable fact):**

| Owner data available | Mark rendered | Links to |
|---|---|---|
| `dish.branches` includes B **and** `dish.liveMenuUrl[B]` exists | `מוגש היום ב{סניף B}` | that branch's live restaurant-menu anchor |
| `dish.branches` includes B, no `liveMenuUrl` | `מהמטבח ב{סניף B}` | `/kitchens/{B}` |
| `dish.branches` empty | **no mark at all** | — |

The word `היום` is never rendered without a live-menu URL to back it. Softening it into something vaguer is not an option; the mark is omitted.

**`הוסיפו לתפריט שלי`** sits on every dish row. It is PII-free, writes to `useBrief()` (§5.7), fires `add_to_brief`, and pre-seeds the builder. This is the top-of-funnel mechanic that the whole direction rests on; it must not be quietly demoted to a "favourite" star.

### 3.3 The documented fallback when the dish list is short

The judged weakness of this direction is real: it is single-point-dependent on a list of restaurant dishes actually available for catering, which nobody has confirmed exists. The fallback is specified in advance so nobody improvises one under deadline.

| Catering-available dish count | Behaviour |
|---|---|
| **≥ 8** | Full system. `MenuHero` renders 4 dish lines; `MenuSheet` groups by course. |
| **4–7** | `MenuHero` renders 4 dish lines; `MenuSheet` renders one ungrouped list with **no course headings**. A short menu is a menu; a four-row grid with three empty course headings is not. |
| **1–3** | `MenuHero` renders **no dish lines** (the hero is H1 + lede + fact line + CTA pair). `MenuSheet` renders the short list under section 01. |
| **0** | `/` and every `menu`-register route switch to the **operational** register: `KitchensBand` is promoted to directly under the hero, `OpsFacts` renders where available, and `MenuSheet` does not render. `/menus` returns HTTP 404 and is removed from the sitemap. |

The switch is driven by one computed value in `data/menus.ts` (`cateringAvailableCount`), asserted in a unit test, and surfaced in the production sheet so the owner can see what unlocks what.

### 3.4 Blocks that are not part of the spine

`OpsFacts`, `ServiceFormats`-as-`ServiceMenus`, `StationsBlock`, `AreaServed`, `DriveTimeTable`, `BranchFacts`, `GoogleReviews`, `WaReturnPanel`. Each is exclusive to a named page type (§4.3) — that exclusivity is what makes the pages genuinely different rather than reshuffled.

---

## 4. Page contracts

Every contract is complete enough to build from alone. `SLOT.X` does not exist yet; the containing unit prunes per INV-2. **No Hebrew string below is a business fact unless it is a Slot token.**

---

### P-01 · `/` — Home

- **Search intent:** brand + mixed discovery. Visitors from GBP, from WhatsApp forwards, and from brand search. **This page is not optimised for a head term.**
- **Cluster:** brand defence — `מאמא מיה`, `מאמא מיה קייטרינג`, `מאמא מיה הרצליה` — plus the identity separators `איטלקי`, `מהמסעדה`, and the city names. **Never optimise for bare `קייטרינג מאמא`:** `teamimofmama.com` and `bmama.co.il` own it with 20–25 years of domain history and would harvest the traffic. Brand ads need the negative list `מחזמר · סרט · פסקול · שירים · כרטיסים · ABBA · אבבא · הצגה`.
- **Title:** `קייטרינג מאמא מיה | מהמטבח של המסעדה האיטלקית בהרצליה פיתוח, רעננה ופתח תקווה`
- **Description:** `התפריט של המסעדה, אצלכם באירוע. שלושה מטבחים פעילים בהרצליה פיתוח, רעננה ופתח תקווה.`
- **H1 (fixed, three typographic lines, no rotation, no carousel):**
  `התפריט של המסעדה — אצלכם באירוע.`
- **Lede:** `מאמא מיה היא מסעדה איטלקית עם שלושה מטבחים פעילים: הרצליה פיתוח, רעננה ופתח תקווה. מה שכתוב כאן מתבשל במטבחי המסעדה.`
  *(The second sentence of the direction's lede — the walk-in-tonight promise — moves into `TastingBand` and renders only when `SLOT.TASTING_POLICY` is filled. It is a policy, not a fact we hold.)*
- **Fact line, clause-level pruning (G5):** `תשובה תוך {{RESPONSE_TIME}} · מ־{{MIN_GUESTS}} ועד {{MAX_GUESTS}} סועדים · שלושה מטבחים`. With `RESPONSE_TIME`, `MIN_GUESTS` and `MAX_GUESTS` all unset the line renders as `שלושה מטבחים` alone — the one clause that is a fact we hold. With every clause empty the line does not render.
  **There is no dateline.** A "updated today" eyebrow on a static marketing page is a manufactured freshness signal, is not an owner fact, breaks head-layer cacheability, and creates an SSR/CSR mismatch. If a real `dateModified` is ever wanted it comes from the content module's last git commit, nowhere else.
- **CTA pair (G5):** filled `בנו תפריט לאירוע` → `#quote`; ghost `בואו לטעום` → `#taste` (renders only when the tasting band does). Phone as a plain text link with an E.164 `href`.
- **Conversion goal (single):** `quote_start`.
- **Section order:** `MenuHero` (+ 4 `HeroDishLines`) → `DecisionChecklist` → **01** `MenuSheet` (condensed: 3 dishes per course, `כל התפריטים` → `/menus`) → **02** `ServiceMenus` → **03** `InclusionsExclusions` → `TastingBand` → **04** `LimitsBlock` → **05** `KitchensBand` *(the ink band)* → `ProcessSteps` + `TermsStrip` → `PastEvents` → **06** `QuoteBuilder` → **07** `Faq` (6 items max) → **08** `Colophon`.
- **Unique to this page:** H1, lede, the four hero dish lines, the condensed 3-per-course selection, the 6 chosen FAQ items, `og:image`.
- **Links out:** `/menus`, `/kitchens` + all three branch pages (from the ink band), `/catering`, `/catering/business`, `/catering/private-events`, `/quote`, `/privacy`, `/terms`, `/accessibility`.
- **Links in:** header wordmark on every route; all three GBP brand references; colophon on every route.
- **Schema:** `Organization` (`@id {DOMAIN}/#org`, `subOrganization` → three `Restaurant` `@id`s), `WebSite` (`@id {DOMAIN}/#website`), `WebPage`. No `aggregateRating`, no `Review`, no `priceRange`.

---

### P-02 · `/menus` — התפריטים

Under TAFRIT this is the **second most important page on the site and is built in Wave 1, not Wave 2.** It is the spine made addressable.

- **Search intent:** evaluation, plus dish-name long tail (`פסטה לאירועים`, `תפריט קייטרינג איטלקי`, `מגשי אנטיפסטי`).
- **Title:** `התפריטים | קייטרינג מאמא מיה — מהמטבח של המסעדה`
- **H1:** `התפריטים, בלי אותיות קטנות`
- **Conversion goal:** `add_to_brief` → `brief_to_builder`. Browsing *is* qualification here.
- **Section order:** `MenuHero` (no photo, no dish lines — the page itself is the dish lines) → `DecisionChecklist` → **01** `MenuSheet` full, grouped by course (`אנטיפסטי וכיבוד · פסטות · מנות עיקריות · קינוחים`), every row carrying `הוסיפו לתפריט שלי` and its provenance mark → **02** `ServiceMenus` full → **03** `InclusionsExclusions` → `TastingBand` → **04** `LimitsBlock` (dietary and allergen reality) → **05** `KitchensBand` → **06** `QuoteBuilder` pre-seeded with the accumulated brief → **07** `Faq` (dietary, allergens, substitutions, minimum) → **08** `Colophon`.
- **Price handling — corrected from the first pass.** `PriceFloor` renders **only** when both (a) a real owner-signed floor exists in `client/src/config/pricing.ts` and (b) `LEGAL.PRICE_ESTIMATE_NOTE` is non-null. **This spec supplies no qualifier text.** Whether prices include VAT, and what is excluded at the floor, are open owner questions; the entire qualifier is owner-authored and stored in `content/legal.ts`, and the price component **refuses to render without it** (a required, non-defaulted prop). Unfilled ⇒ the price cell does not render and the menu ships as a chef's menu without prices, which is a legitimate restaurant convention rather than an unfinished page. Never a computed total; never adjacent to any word that could read as acceptance.
- **Print (G13 extension):** `@media print` renders sections 01–02 as a single-colour A4 menu a branch can hand a walk-in — grain layer off, nav and sticky bar hidden, `break-inside: avoid` on dish rows, `print-color-adjust: exact` so hairlines survive. One text link `הדפיסו את התפריט` fires `menu_print`, captures nothing, gates nothing.
- **No PDF.** ת״י 5568 חלק 2 covers digital documents; a PDF menu is a fourth legally-exposed surface with no test harness, and it would be a fourth conversion path against a ceiling of three.
- **Deferred:** `/menus/:menu` sub-routes, until there is enough per-menu content to survive T-1.
- **Schema:** `Menu` → `hasMenuSection` → `MenuItem`. `MenuItem.offers` emitted **only** where a real owner-signed price exists; otherwise `offers` omitted entirely. `BreadcrumbList`.

---

### P-03 · `/kitchens` — המטבחים שלנו (hub)

- **Search intent:** verification — someone checking whether three restaurants actually exist.
- **Cluster:** `מאמא מיה מסעדה`, `מסעדה איטלקית הרצליה פיתוח`, `מאמא מיה סניפים`.
- **Title:** `המטבחים שלנו | שלוש מסעדות איטלקיות פעילות — מאמא מיה`
- **H1:** `שלושה מטבחים פעילים. כתובת, שעות, ומי מנהל כל אחד.`
- **Conversion goal:** `branch_click`. No builder; three branch-named WhatsApp buttons instead (G4).
- **Section order:** `MenuHero` (no dish lines) → `ProductionSheet` (all three columns, all rows) → `DriveTimeTable` (the only page rendering it in full) → `GoogleReviews` → `TastingBand` → `Faq` (3 items: pickup, hours, parking) → `Colophon`.
- **No ink band here** — the whole page is the kitchens section, and an ink band inside an ink-themed page reads as a mistake. INV-3 is `≤ 1`, not `= 1`.
- **Unique:** the drive-time table in full, the hub H1.
- **Links out:** three branch pages, `/menus`, `/quote`.
- **Links in:** every `KitchensBand` on every route; header nav; each branch page (`שני המטבחים האחרים`).
- **Schema:** `CollectionPage` + `BreadcrumbList`. The three `Restaurant` nodes are `@id`-referenced only, never repeated here — each entity stays canonical on its own page.
- **Note:** the folder is `/kitchens`, not `/locations`. The word carries no SEO weight; `המטבחים שלנו` is the differentiator.

---

### P-04…P-06 · `/kitchens/{herzliya-pituach | raanana | petah-tikva}` — branch entity pages

One contract, three instances, authored separately. These are **entity** pages: exactly three, forever. A fourth may never be added.

- **Search intent:** local verification + local commercial.
- **Cluster per branch:** Herzliya Pituach → corporate/office density (`קייטרינג לחברות הרצליה פיתוח`, `מגשי אירוח הרצליה פיתוח`) + private dining (`מסעדה לאירוע פרטי הרצליה`). Raanana → private celebrations + home hosting (`ארוחת שף בבית רעננה`). Petah Tikva → corporate Gush Dan + family/holiday. Geo terms need both prefixed and unprefixed variants (`קייטרינג הרצליה` / `בהרצליה` / `להרצליה`) and the spelling variants `קיטרינג · קטרינג`.
- **Title pattern:** `קייטרינג איטלקי ב{עיר} | מהמטבח של המסעדה שלנו ב{עיר} — מאמא מיה`
- **H1 pattern:** `התפריט של המסעדה ב{עיר} — אצלכם באירוע.`
- **Conversion goal:** `quote_start` with `branch` pre-seeded, **or** `whatsapp_handoff` from that branch's button. Both write the same `leads` row with a `path` discriminator.
- **Section order:** `MenuHero` → `DecisionChecklist` → `BranchFacts` (single-column production sheet for this branch: כתובת · שעות המטבח · מי מנהל · איסוף עצמי · אזור חלוקה · קיבולת ליום · נגישות) → **01** `MenuSheet` (dishes filtered to `dish.branches.includes(branch)`) → **02** `ServiceMenus` → **03** `InclusionsExclusions` → `TastingBand` (this branch's address and hours only) → **04** `LimitsBlock` → **05** `KitchensBand` *(ink; this branch first, plus `שני המטבחים האחרים`)* → `GoogleReviews` (this branch) → `PastEvents` (filtered to this branch) → **06** `QuoteBuilder` (branch pre-seeded, visible, editable) → **07** `Faq` (branch-specific) → **08** `Colophon`.
- **Genuinely unique per branch — the anti-thin-content payload. A branch page may not ship with fewer than seven filled:**
  1. street address + `PostalAddress` + `geo`
  2. branch phone (distinct number; E.164 in `href`, local form displayed)
  3. `openingHoursSpecification` for that kitchen
  4. **named** chef / kitchen manager (`SLOT.CHEF_{BRANCH}`) with consent — the highest-leverage E-E-A-T lever available and it is free; an unnamed column collapses rather than rendering an anonymous cell
  5. the dish subset that branch actually cooks
  6. that branch's production capacity per day
  7. self-pickup: offered? minimum? hours?
  8. that branch's delivery area + drive times
  9. that branch's `sameAs` GBP URL
  10. loading/parking logistics for pickup
  11. what that branch is realistically best suited for
  12. per-branch physical accessibility (parking, entrance, toilet, seating, lift/ramp) — required by the accessibility statement and currently asserted baselessly at `contact.tsx:377`
  13. one or two captioned photographs shot **in that kitchen** — **optional; the page must read correctly with zero**
- **Map handling — corrected.** **No Google Maps iframe.** An embedded map transmits every visitor's IP to Google and sets Google cookies, reinstating the exact disclosure/consent obligation that self-hosting fonts and dropping Font Awesome removes (INV-10). What ships: a **static map image generated at build** (`scripts/maps.ts`, output committed to `client/public/maps/{slug}.png`, `<Photo>`-captioned like any other image) **plus** a text link `הוראות הגעה ב־Google Maps` → that branch's Maps URL, `rel="noopener"`. With no map image, only the text link renders.
- **Thin-content test, enforced in review (T-1):** *swap the city name in the body copy — if the page still reads correctly, it is a doorway page and must not ship.*
- **Links out:** `/kitchens`, the other two branch pages, `/menus`, the 2–3 event pages matching that branch's cluster, `/quote`.
- **Links in:** `/kitchens`; every `KitchensBand` on every route; **that branch's GBP `website` field** — pointed at this page, not the homepage, with its own UTM. That is the highest-leverage GBP setting available and it is routinely wasted.
- **Schema:** `Restaurant` (**not** bare `LocalBusiness`) `@id {DOMAIN}/kitchens/{slug}#kitchen` with `name`, `address`, `geo`, `telephone`, `openingHoursSpecification`, `servesCuisine: "Italian"`, `hasMenu: {DOMAIN}/menus`, `sameAs: [GBP URL]`, `parentOrganization: {DOMAIN}/#org`; plus `BreadcrumbList`. **`priceRange` omitted entirely** — never the design reference's `"{{PRICE_RANGE}}"` placeholder, never a guess.
- **GBP coupling (not code, but it belongs here):** add a **secondary** category `Caterer / ספק מזון ושתייה לאירועים` to each existing restaurant profile. **Do not** change the primary category away from Italian restaurant — that would damage existing restaurant map visibility and current dine-in revenue, and it is the most plausible self-inflicted wound in the plan. **Do not** create a fourth "מאמא מיה קייטרינג" profile at an existing address; a catering desk inside a restaurant fails the dedicated-space/dedicated-line tests and risks merge or removal of profiles the restaurants depend on. Give each profile a **non-overlapping primary** service radius so the three do not proximity-filter each other.

---

### P-07 · `/catering` — service hub

- **Search intent:** orientation. Also the internal-linking spine for every occasion page.
- **Cluster:** `קייטרינג איטלקי`, `קייטרינג לאירועים`.
- **Title:** `קייטרינג לאירועים | מאמא מיה — שלושה מטבחי מסעדה`
- **H1:** `לאיזה אירועים אנחנו נכנסים`
- **Conversion goal:** `event_page_click`. No builder; one text CTA to `/quote`.
- **Section order:** `MenuHero` (no dish lines) → `EventRows` (full set, corporate first; each row = one logistical paragraph + one stated limit + a deep link that pre-seeds `eventType`) → **01** `InclusionsExclusions` → **02** `LimitsBlock` → **03** `Faq` (4 cross-cutting items) → **04** `Colophon`.
- **Unique:** the full event-row set with per-row logistical paragraphs and per-row stated limits.
- **Links out:** every `/catering/*` page, `/urgent`, `/pasta-bar`, `/menus`, `/quote`.
- **Links in:** header nav, home ink-band adjacency, every event page (breadcrumb + `עוד סוגי אירועים`).
- **Schema:** `CollectionPage` + `BreadcrumbList`.

---

### P-08 · `/catering/business` — קייטרינג לחברות **(operational register)**

**The #1 page to build and the #1 campaign to fund.** Herzliya Pituach sits inside Israel's densest tech-office district and the flagship kitchen is in it. The SERP for `מגשי אירוח הרצליה פיתוח` is held by delivery aggregators and sandwich vendors — no premium restaurant brand owns it. Repeat orders make LTV a multiple of a one-off simcha, so a mediocre CPA here is still the best CPA in the account.

- **Search intent:** transactional, high-frequency, low-drama. An office manager who needs platters on a date.
- **Cluster A:** `מגשי אירוח` · `מגשי אירוח לחברות` · `מגשי אירוח משלוח` · `כיבוד לישיבות` · `כיבוד לישיבת הנהלה` · `קייטרינג לחברות` · `קייטרינג לכנס` · `קייטרינג להשקה` + geo variants + `מגשי כיבוד` / `מגש אירוח` singular.
- **Title:** `מגשי אירוח וקייטרינג לחברות בהרצליה פיתוח | מאמא מיה — מטבח מסעדה`
- **H1:** `ארוחת צוות מהמטבח של המסעדה, בהרצליה פיתוח.`
- **Conversion goal:** `generate_lead` via the structured builder. Corporate converts on a form plus email follow-up; the phone stays visible as a text link for same-day.
- **Section order (inverted, G12):** `MenuHero` (no dish lines, no photo) → **`OpsFacts` above the fold on mobile** → `DecisionChecklist` → **01** `InclusionsExclusions` → **02** `MenuSheet` (platter-oriented, `הוסיפו לתפריט שלי`) → **03** `ServiceMenus` → `TastingBand` → **04** `LimitsBlock` → **05** `KitchensBand` *(ink; Herzliya first, its office-district proximity stated as a fact, not a boast)* → `ProcessSteps` + `TermsStrip` → `PastEvents` (corporate rows only) → **06** `QuoteBuilder` (`eventType` pre-seeded, visible, editable; step 5 gains an optional `מספר הזמנת רכש` field) → **07** `Faq` (procurement-shaped) → **08** `Colophon` → anchor `#gibush` linking to `/catering/fun-day` while that page is unbuilt.
- **`OpsFacts` rows — four Slots, four questions an office manager asks before anything else.** Each row prunes independently: `שעת קאט־אוף להזמנה להיום {{CUTOFF_TIME}}` · `מינימום {{MIN_PORTIONS_TRAYS}}` · `משלוח {{DELIVERY_WINDOW}}` · `חשבונית והזמנת רכש {{PROCUREMENT_TERMS}}`. No row carries a default. All four unfilled ⇒ the block does not render and the page falls back to the `menu` register order.
- **Unique:** `OpsFacts`, the procurement FAQ set (invoicing, ח.פ., recurring orders, `ספק מאושר` onboarding, dietary coverage, fixed delivery windows), the PO field, the corporate `og:image`.
- **Links out:** `/kitchens/herzliya-pituach` (primary), `/kitchens/petah-tikva`, `/catering/fun-day`, `/pasta-bar`, `/urgent`, `/menus`, `/quote`.
- **Links in:** `/catering`, home `EventRows` first row, all three branch pages.
- **Schema:** `Service` (`serviceType: "Catering"`, `provider` → `#org`, `areaServed`, `audience: BusinessAudience`) + `BreadcrumbList` + `FAQPage` for filled questions only. Note honestly: `Service` markup has **no** corresponding Google rich result — it is emitted for entity disambiguation, not SERP decoration.

---

### P-09 · `/catering/private-events` — שמחות פרטיות ואירוח בבית

- **Search intent:** transactional, considered, emotionally loaded. Also carries the near-empty **private-dining-in-a-real-restaurant** cluster — the cheapest cluster in the map, because caterer-vs-caterer bidding never touches it.
- **Cluster B + home hosting:** `מסעדה לאירוע פרטי` · `סגירת מסעדה לאירוע` · `מסעדה לאירוע קטן` · `חדר פרטי במסעדה` · `אירוע במסעדה הרצליה פיתוח` · `ארוחת שף בבית` · `אירוח בבית` · `מסיבת יום הולדת במסעדה`.
- **Title:** `אירוע פרטי במסעדה או קייטרינג בבית | מאמא מיה — הרצליה פיתוח, רעננה, פתח תקווה`
- **H1:** `בר מצווה, אירוסין, יום הולדת — מהמטבח של המסעדה, אצלכם.`
  *(`ברית` is deliberately absent from the H1: it carries kosher-mehadrin intent this business may not be able to serve, and putting it in an H1 is a targeting decision, not a copy decision.)*
- **Conversion goal:** `generate_lead`, with the service-format question doing the qualifying work.
- **Section order:** `MenuHero` → `DecisionChecklist` → **01** `ServiceMenus` (promoted above the dish list on this page — format is the decision here) → **02** `MenuSheet` → **03** `InclusionsExclusions` → `TastingBand` → **04** `LimitsBlock` → **05** `KitchensBand` (ink) → `ProcessSteps` + `TermsStrip` → `PastEvents` → **06** `QuoteBuilder` (service format surfaced on step 2) → **07** `Faq` → **08** `Colophon`.
- **`אירוח אצלנו במסעדה` — gated, corrected from the first pass.** Hosting a private event at a restaurant is a *representation* that the restaurants host private events. Private-event capacity (seated, standing, whether the space can be closed off, parking, accessibility) is an unanswered owner question. Therefore: the third service-format row **and** the matching builder chip render **only** where `locations[branch].privateEventCapacity` is filled for at least one branch, and the row names those branches. Unfilled ⇒ two formats render, not three, and nothing on the page implies venue hire.
- **Unique:** `ServiceMenus` in the promoted position, per-branch venue capacity facts, the private-event `og:image`, an FAQ set covering staffing, equipment, porcelain, parking and accessibility.
- **Links out:** all three branch pages, `/catering/bar-mitzvah`, `/menus`, `/pasta-bar`, `/quote`.
- **Schema:** `Service` + `BreadcrumbList` + `FAQPage`.

---

### P-10 · `/catering/bar-mitzvah` — בר מצווה ובת מצווה

- **Search intent:** transactional but long-cycle (3–9 months out) and heavily price-compared.
- **Cluster G:** `קייטרינג לבר מצווה` · `קייטרינג לבת מצווה` · `מחיר מנה בר מצווה`. **`קייטרינג חתונה` is an account-wide negative keyword, not a target** — wedding searchers are 6–12 months out, compare 5+ vendors, demand kashrut, and a restaurant group without a banquet hall loses them at high cost-per-lead.
- **Title:** `קייטרינג לבר מצווה ולבת מצווה | מאמא מיה — מטבח מסעדה איטלקית`
- **H1:** `בר מצווה ובת מצווה — מהמטבח של המסעדה, אצלכם.`
- **Conversion goal:** `generate_lead` with a **long-lead date capture** — the `התאריך עוד לא נקבע` escape is the important control on this page — plus retargeting eligibility.
- **Section order:** as P-09, with `ServiceMenus` returned to position 02 and a `GuestBands` explainer replacing it at 01.
- **Kashrut handling — the whole page hangs on it, and this spec supplies no wording.** Kashrut is asked as a **requested constraint** on builder step 2 (a chip the buyer selects, which routes to a human answer), never asserted as a certification. The only kashrut text that may ever appear on this site is `locations[branch].kashrutStatementHe`, **rendered verbatim exactly as the owner wrote it**, in the FAQ, per branch. No composed sentence, no template, no ready-to-paste "safe formulation" — the first pass shipped one and it is deleted. If that Slot is empty for a branch, that branch has no kashrut text at all. If it is empty for every branch, this page ships in an explicitly kashrut-agnostic framing and the `ברית` / `שבת חתן` / `חינה` variants are negative-keyworded out rather than targeted. The word `כשר` in any inflection may not appear absent a current certificate.
- **Links out:** `/catering/private-events`, `/menus`, branch pages, `/quote`.
- **Schema:** `Service` + `BreadcrumbList` + `FAQPage`.

---

### P-11 · `/catering/shiva` — אירוח שבעה ואזכרה **(operational · HARD-GATED)**

**Do not build this page until the kashrut answer exists in writing.** Every ranking result in this cluster leads with `כשר למהדרין` / `בד״ץ` / `גלאט`. Traffic here carries kosher intent and will bounce at a missing badge; building it anyway wastes the build and risks implying a status that does not exist. If the owner cannot answer, the page is **not built** and the cluster is negative-keyworded out.

If it is built, it is likely the highest-intent, lowest-competition entry point available, and it is uniquely well served by the actual differentiator: shiva catering is same-day or next-day, non-negotiable on reliability, and effectively impossible for a ghost kitchen or a venue-renting event company to serve.

- **Cluster F:** `קייטרינג לשבעה` · `קייטרינג לאזכרה` · `אוכל לשבעה` · `מגשי אירוח לשבעה` · `סעודת אבלים`. **`שבעה` runs phrase/exact match only** — it is homographic with the number seven and broad match burns budget.
- **Title:** `אוכל לשבעה — משלוח מהמטבח שלנו | מאמא מיה`
- **H1:** `אוכל לשבעה. אנחנו מסתדרים, אתם לא צריכים.`
- **Conversion goal:** `call_click`. Phone-first, one number, staffed hours stated.
- **Page rules — binding, non-negotiable.** No prices anywhere. No `אירוע` / `חוויה` / `לחגוג` vocabulary. **No builder, no estimate, no tasting band, no `PastEvents`, no upsell, no cross-sell, no marketing-consent checkbox, no `og:image` of a celebration.** `stickyBar: 'phone'` — the bar carries a phone link and WhatsApp only, never `הצעה`. One phone number, one WhatsApp, a stated delivery window, and copy written assuming the reader is in the worst week of their life.
- **Section order:** `MenuHero` (H1 + two sentences + the phone number as the filled primary) → `OpsFacts` (lead time · delivery window · delivery area · minimum — all Slots) → **01** `MenuSheet` (a single short list, no prices, no `הוסיפו לתפריט שלי`) → **02** `Faq` (kashrut verbatim, delivery, disposables, how to order) → **03** `Colophon`.
- **Geo:** tight around Herzliya Pituach / Raanana secular catchments — never nationally.
- **Schema:** `Service` + `BreadcrumbList`. No `FAQPage` unless every answer is filled.

---

### P-12 · `/catering/holidays` — חגים (seasonal template)

- **Search intent:** seasonal transactional, spiking 4–6 weeks pre-חג.
- **Cluster H:** `קייטרינג ראש השנה` · `קייטרינג סוכות` · `קייטרינג שבועות` · `מגשי גבינות שבועות` · `ארוחת שבועות חלבית` · `קייטרינג חנוכה` · `קייטרינג סילבסטר`.
- **The seasonality inversion is the strategic point of this page.** ראש השנה / סוכות is the market's peak. **פסח is a structural revenue hole for a pasta-and-bread kitchen — spend nothing on פסח keywords.** **שבועות is the one holiday where an Italian dairy kitchen is the best-positioned vendor in the entire market** — own `קייטרינג שבועות` and `מגשי גבינות` hard, where competition is thinnest and fit is perfect.
- **Title pattern:** `קייטרינג ל{חג} {{YEAR}} | מאמא מיה — מטבח מסעדה איטלקית`. Appending the current year is a category freshness convention (competitors ship `תפריט 2026` in titles); `{{YEAR}}` is derived from `Asia/Jerusalem` at build time, never hardcoded.
- **H1 pattern:** `ארוחת {חג} מהמטבח של המסעדה.`
- **Conversion goal:** `generate_lead` with a hard order-by date.
- **Architecture requirement — one reusable route with a date-driven seasonal slot, not five thin pages.** `client/src/content/seasons.ts`:
  ```ts
  type Season = {
    id: SeasonId; nameHe: string;
    active: { from: string; to: string };   // Asia/Jerusalem dates, owner-signed
    orderByDate?: string;                   // Slot — no default
    menuIds: DishId[];                      // subset of catering-available dishes
    ogImage?: string;
  };
  ```
  Outside every active window the route renders a short evergreen `החגים אצלנו` page and **never** a stale holiday. Season boundaries are owner-signed dates; the build does not compute Hebrew-calendar dates itself (see §5.10).
- **Section order:** `MenuHero` → `OpsFacts` (order-by date · pickup vs delivery · collection hours) → **01** `MenuSheet` (seasonal subset) → **02** `ServiceMenus` → **03** `InclusionsExclusions` → **04** `LimitsBlock` → **05** `KitchensBand` (ink) → `ProcessSteps` + `TermsStrip` → **06** `QuoteBuilder` → **07** `Faq` → **08** `Colophon`.
- **Schema:** `Service` + `BreadcrumbList`. `Offer.availabilityEnds` only where `orderByDate` is a real owner-signed date.

---

### P-13 · `/catering/fun-day` — ימי גיבוש וימי כיף

- **Search intent:** transactional; an HR/office-manager buyer distinct from general corporate.
- **Cluster I:** `קייטרינג ליום גיבוש` · `אוכל ליום גיבוש` · `קייטרינג לימי כיף` · `קייטרינג לסדנת צוות` · `ארוחת צוות`.
- **Title:** `קייטרינג ליום גיבוש ולימי כיף | מאמא מיה — מטבח מסעדה איטלקית`
- **H1:** `יום גיבוש: עמדה חיה מהמטבח שלנו, לא דוכן שנשכר.`
  *(The first pass named `פסטה בר, פיצה מהתנור, אנטיפסטי פתוח` in the H1. Whether on-site cooking is offered at all — and which stations — is an open owner question. Station names come from `content/stations.ts` Slots and appear in `StationsBlock`, never in the H1.)*
- **Conversion goal:** `generate_lead`. The form differs: HR buyers convert on `מספר משתתפים`, `תאריך`, `כתובת`, and whether staff come — not on menu browsing.
- **Promotion rule:** may launch as the `#gibush` anchor inside P-08 and be promoted to its own route once it has (a) real station operational limits and (b) content that passes T-1. **Do not ship it as P-08 with the words swapped** — that is the doorway pattern.
- **Section order:** `MenuHero` → `StationsBlock` (per-station Slots: guest range · power/water/space · whether a cook travels) → **01** `MenuSheet` → **02** `InclusionsExclusions` → **03** `LimitsBlock` → **04** `KitchensBand` (ink) → `ProcessSteps` + `TermsStrip` → **05** `QuoteBuilder` → **06** `Faq` → **07** `Colophon`.
- **`StationsBlock` renders only where ≥1 station has both a name and a guest range.** No station is named anywhere on the site otherwise.
- **Links out:** `/pasta-bar`, `/catering/business`, `/quote`.
- **Schema:** `Service` + `BreadcrumbList`.

---

### P-14 · `/catering/dairy` — קייטרינג חלבי איטלקי

- **Search intent:** research → transactional. Mostly SEO/organic plus a cheap always-on ad group; must not carry the account.
- **Cluster C:** `קייטרינג חלבי` · `קייטרינג חלבי לאירועים` · `קייטרינג חלבי לאירועים קטנים` · `קייטרינג איטלקי` · `קייטרינג גבינות` · `מגשי גבינות` · `בר גבינות לאירוע`.
- **H1:** `קייטרינג חלבי איטלקי — מהמטבח של המסעדה.`
- **Framing:** dairy is not a limitation, it is the reason the same budget buys a richer table. This is already the Israeli market's own argument, so it is pre-validated with buyers.
- **Section order:** the canonical spine, `MenuSheet` filtered to dairy dishes.
- **Links out:** `/catering/holidays` (שבועות), `/menus`, `/quote`.
- **Schema:** `Service` + `BreadcrumbList`.

---

### P-15 · `/urgent` — קייטרינג להיום **(operational register)**

- **Search intent:** urgent transactional. Cheapest CPA in the account; converts by phone, not by form.
- **Cluster E:** `קייטרינג להיום` · `קייטרינג דחוף` · `מגשי אירוח להיום` · `מגשי אירוח משלוח מהיר` · `קייטרינג ברגע האחרון` · `אוכל מוכן עכשיו`.
- **Title:** `קייטרינג להיום — משלוח מהיר משלושה מטבחים | מאמא מיה`
- **H1:** `צריכים אוכל להיום? שלושה מטבחים זה שלוש הזדמנויות שזה יסתדר.`
- **Conversion goal:** `call_click`. Phone-first, call-only ad variant, WhatsApp second.
- **Builder decision — settled here, superseding `02-lead-machine.md` §1.5.** **There is no in-page builder on `/urgent`.** Not below the fold, not collapsed. A four-step form is the wrong instrument for a buyer who needs food in four hours, and a collapsed form still costs a scroll target and a chunk. The page carries one text link `אם זה לא דחוף — בנו תפריט` → `/quote`.
- **Absolute rule:** the cutoff is a Slot and must be the **conservative** owner-signed figure, computed and displayed in `Asia/Jerusalem` (INV-9). Winning this cluster and then missing a promised same-day cutoff is a reputational failure with no recovery in a review-driven local market, with three restaurants' names attached. Never publish a cutoff the kitchens cannot hold. Unfilled ⇒ the page ships without a cutoff claim and the ad group does not run.
- **Section order:** `MenuHero` (phone as filled primary, WhatsApp second, no photo, no dish lines) → `OpsFacts` (cutoff per branch · delivery radius per branch · minimum · delivery window) → `ProductionSheet` (three columns, each with its own phone and WhatsApp) → **01** `MenuSheet` (short: what is genuinely available today) → **02** `Faq` (3 items) → **03** `Colophon`.
- **Schema:** `Service` + `BreadcrumbList`.

---

### P-16 · `/pasta-bar` — עמדת פסטה

- **Search intent:** product-specific transactional, high margin, uniquely credible here.
- **Cluster D:** `דוכן פסטה לאירועים` · `עמדת פסטה` · `פסטה בר לאירועים` · `בר פסטה` · `עמדות שף לאירוע` · `דוכן פסטה אל דנטה`.
- **Title:** `עמדת פסטה לאירועים | קו העבודה של המטבח שלנו — מאמא מיה`
- **H1:** `עמדת פסטה שהיא לא גימיק. זה מה שהמטבח שלנו עושה כל יום.`
- **Angle — the sharpest expression of "authentic, not glitzy" in the keyword map:** everyone else's pasta station is an outsourced station rented in for an event; here it is line work by cooks who make it for paying restaurant guests daily.
- **Gate:** the entire page is blocked on station operational limits (guest range, power/water/space, whether a cook travels). Absent them there is no honest page here.
- **Section order:** `MenuHero` → `StationsBlock` → **01** `MenuSheet` (the pasta course, cross-linked to the live restaurant menu where `liveMenuUrl` exists) → **02** `InclusionsExclusions` → **03** `LimitsBlock` → **04** `KitchensBand` (ink) → **05** `QuoteBuilder` → **06** `Faq` → **07** `Colophon`.
- **Links in:** `/catering/fun-day`, `/catering/business`, `/catering/private-events`, home `EventRows`.
- **Schema:** `Service` + `BreadcrumbList`.

---

### P-17 · `/quote` — התפריט שלכם

- **Search intent:** navigational/intentional. Also the destination for every "get a quote" link in email, WhatsApp, ads and print.
- **Title:** `בקשת הצעה לקייטרינג | 4 שאלות — מאמא מיה`
- **H1:** `בואו נבנה את התפריט שלכם`
- **Conversion goal:** `generate_lead`. The only page whose sole purpose is the builder.
- **Section order:** `MenuHero` (compressed: H1 + one sentence, no dish lines) → `BriefCard` (renders the accumulated `useBrief()` selection if non-empty, editable) → `QuoteBuilder` full-width, step 1 visible immediately → `TermsStrip` → `TastingBand` → `Colophon`.
- **Pre-seeding:** accepts `?event=`, `?branch=`, `?guests=`, `?dishes=` from any inbound link. **A pre-seeded value stays visible and editable, never hidden** — a forwarded `/quote?event=wedding` link must not silently write a wrong lead field. When step 1 is pre-seeded the builder opens at step 2 and step 1 stays reachable via `← חזרה`.
- **Links in:** every route's primary CTA where the current page has no in-page builder; header CTA; GBP; ads.
- **Schema:** `ContactPage` + `BreadcrumbList`.

---

### P-18 · `/thanks` — אישור פנייה

**Not a thank-you message. A conversion stage.** The current implementation shows a toast and calls `form.reset()`, leaving the buyer with an empty form and nothing to show anyone.

- **URL:** `/thanks?ref=MM-XXXXXX`. **A real URL change, decided here and superseding `02-lead-machine.md` §3.9's in-place swap.** Without a navigation no analytics platform can record a conversion, whichever one is later installed; and the post-submit enrichment textarea works identically on a new route.
- **Robots:** `noindex, follow`. Excluded from sitemap.
- **Content, in order:** the buyer's brief echoed back **as a menu card, not a table** → the reference code (`MM-7F3K2Q`, tabular figures, selectable) → who will contact them, through which channel, within what time (`SLOT.RESPONSE_TIME`) → **which kitchen the enquiry went to** (G4): `הפנייה נשלחה למטבח ב{סניף}` → a dominant `המשך בוואטסאפ` button opening the thread pre-filled with the brief and the ref code → the tasting invitation with that branch's address and hours (only when the tasting Slot is filled) → the optional post-submit enrichment field (`משהו שכדאי שנדע?`) → `שמרו או שלחו הלאה` → `/summary?ref=`.
- **Defined states — previously undefined:**

  | Case | Render |
  |---|---|
  | valid `ref` | full confirmation as above |
  | **no `ref` param** | generic shell: `הפנייה נקלטה.` + response time + phone + WhatsApp + tasting. No brief echo, no ref line. **Not an error state.** |
  | **unknown or purged `ref`** | generic shell + `לא הצלחנו לטעון את סיכום הפנייה. שמרו את הקוד {ref} ודברו איתנו.` + phone. HTTP 200. |

- **Conversion goals:** `whatsapp_handoff` and `summary_share`. The shareable summary is a conversion feature disguised as a nicety — the person the buyer forwards it to is a second click nothing else earns.
- **Schema:** none.

---

### P-19 · `/summary` — סיכום אירוע (the forwardable artifact, G13)

- **URL:** `/summary?ref=MM-XXXXXX`. A **query param, not a Hebrew path** — the code is read aloud on the phone and pasted into WhatsApp. Rendered **client-side from confirmation state plus `GET /api/quote/:ref`** in Phase 1; promoted to a server-rendered persisted route only when volume justifies it, and with an ASCII slug when it is.
- **Robots:** `noindex, nofollow`. Excluded from sitemap.
- **Register — the single most important formatting decision on the page:** it must read as a **menu card, not an invoice.** A document that looks like a quote invites price negotiation; a document that looks like a menu invites approval.
- **Content:** ref code + submission date · the buyer's own spec echoed back (event type, guests, date, area) · the selected dishes as a menu card · itemised `מה כלול` and `מה לא כלול` · the commercial-terms strip · **the address of the kitchen that will cook it** · one phone, one WhatsApp.
- **Freshness line:** `הסיכום משקף את הפרטים שנשלחו ב־{{submittedAt}}.` — a fact from the record, not a claim about the quote's current validity.
- **Expired / purged / unknown `ref`:** `הסיכום הזה כבר לא זמין.` + phone + WhatsApp + a link to `/quote`. HTTP 200 with `noindex`, never the 404 page — a forwarded link that 404s reads as a broken business.
- **Data endpoint — an architectural requirement on `02-lead-machine.md`, which references `GET /api/quote/:ref` without specifying it.** As implied it would be a public unauthenticated endpoint returning a lead record keyed on a 6-character code printed in a WhatsApp message. It must be specified with: a **response field allowlist** (event type, guest band, date, area, selected dish ids, inclusions, exclusions, terms, serving branch address — **never** name, phone, email, free text, or any attribution field), its own rate limit, `Cache-Control: no-store`, and a defined 404 body for unknown or purged refs.
- **Print:** `@page` A4 margins, grain off, nav and sticky bar hidden, `break-inside: avoid` on rows, `print-color-adjust: exact` so hairlines survive, ref code and kitchen address in the top block.
- **Schema:** none.

---

### P-20 · `/unsubscribe` — הסרה מרשימת הדיוור

- **Exists because the marketing-consent checkbox promises `ניתן להסיר את ההסכמה בכל הודעה`, and `ס' 30א` requires every advertising message to carry a working refusal mechanism.** Without this route that promise is one the system cannot keep.
- **URL:** `/unsubscribe?ref=MM-XXXXXX`. No auth beyond the ref. `noindex, nofollow`, excluded from sitemap.
- **Behaviour:** one visible statement of what is being removed, one button, one POST. Sets `unsubscribed_at`. Confirmation is rendered in place: `הוסרתם. לא נשלח לכם עוד הודעות שיווקיות.` Unknown ref ⇒ the same confirmation (never reveal whether a code exists).
- **System rule:** every marketing send path filters on `consent_marketing = true AND unsubscribed_at IS NULL`. Asserted in a unit test on the send query, not left to discipline.
- **Schema:** none.

---

### P-21…P-23 · `/privacy`, `/terms`, `/accessibility`

- **Search intent:** none. These exist for legal reachability, corporate procurement, and regulatory duty.
- **Robots:** `index, follow` — a policy that cannot be reached discharges no disclosure duty — but excluded from every internal CTA path.
- **Links in:** the `Colophon` on **every** route via wouter `<Link>`, **plus** a policy link inside the form's collection notice itself. Footers are not where a person about to hand over a phone number looks.
- **Content is owned by `04-legal-and-content.md`.** Architectural requirements owned here:
  - Every legal-identity field is a **build-blocking** Slot: renders `[למילוי: שם החברה הרשום ומספר ח.פ.]` in dev and **throws at build time in production**. The same entity string appears identically in `/terms`, `/privacy` and the collection notice — three different names is itself a finding an inspector will pull on.
  - The **registered-entity address is a different fact from any branch address** and must never be sourced from `locations.ts`.
  - `/accessibility` must name a real רכז נגישות with phone, email and postal address; state the standard actually targeted; and openly list what is **not** yet conformant, with a target date. Per-branch physical accessibility renders from `locations[branch].accessibility`, and an **alternative human service channel** (a staffed phone with hours, for people who cannot use the site) is a required, non-prunable row — if its Slot is empty the page states plainly that it is not yet published. Publishing a rewritten statement that still contains an unverified claim is worse than publishing none.
  - `/privacy` must include the photo-takedown line: `צולמתם באירוע ולא רוצים שהתמונה תופיע? {{PRIVACY_EMAIL}} ונסיר.` This converts a latent claim into a support ticket and costs nothing.
- **Schema:** `WebPage` + `BreadcrumbList`.

---

### P-24 · `/admin/leads` — לידים (protected)

- **Auth:** the existing `requireAdmin` in `server/routes.ts` (bearer `ADMIN_TOKEN`, ≥24 chars, route disabled when unset). The client page prompts for the token, holds it in `sessionStorage` only, sends `Authorization: Bearer`. **One token per person**, so the logged fingerprint identifies a human.
- **Robots:** `noindex, nofollow` + `Disallow: /admin` in `robots.txt`. Excluded from sitemap. Lazy-loaded; must never appear in the shared chunk.
- **It is a WORKLIST, not a report.** The binding constraint on the whole measurement layer is human data entry: a restaurateur will not log into a dashboard to mark leads.
  1. `לידים שממתינים לסטטוס` — two-tap `נסגר` / `אבוד` / `נשלחה הצעה` + one ₪ field, and a visible `X לידים לא מסומנים` counter so decay is obvious rather than silent.
  2. `פניות וואטסאפ ללא התאמה — 72 שעות אחרונות` — each showing its prefill summary so a human can attach a real conversation to the time-proximate intent.
  3. One aggregate table: `ערוץ | פניות | איכותיות | הצעות | נסגרו | ₪ שנסגר | ₪ לפנייה | % סגירה`.
- **Statistical discipline (architectural, not cosmetic):** default to a rolling 90-day window, aggregate at **channel** level not campaign level, and **suppress any ratio whose denominator is under 10** — render `—`. "33% close rate" off 3 leads is how an owner makes a bad budget decision.
- **Access is paginated and `since=`-filterable** so a routine view returns recent leads rather than the whole history, and every access is logged as `timestamp + sha256(token)[0:8] + req.ip + record count` — never field values. Access logs retained 24 months.
- **Also hosts the DSR actions** (§C of the prior review): per-lead `עיון` (export one record) and `מחיקה` (hard delete), so fulfilling an access or deletion request is one action rather than hand-edited SQL.
- **Schema:** none.

---

### P-25 · `/404`

- Hebrew, RTL, inside `SiteLayout`. The current page ships English developer copy — "did you forget to add the page to the router" — on an LTR card with no header, footer or route back in.
- Content: `לא מצאנו את הדף הזה.` + links to `/`, `/menus`, `/kitchens`, plus one phone text link and one WhatsApp button. A 404 on a lead-gen site is a recovery page.
- Server returns HTTP 404 for unmatched non-`/api` paths, **and an `/api`-scoped JSON 404 is registered before the static fallback** — `server/vite.ts:82-84` currently returns `index.html` with HTTP 200 for any unmatched `/api/*`, which breaks client error handling (`JSON.parse` on an HTML body) as the API grows.

---

### P-26 · `/areas/:city` — service-area pages (demand pages, gated)

- **A distinct page type from a kitchen page, and must never be confused with one.** There are exactly three restaurants; a page titled for any other city may **not** imply a local kitchen.
- **Copy contract:** branch pages say `המסעדה שלנו ב{עיר} — {כתובת}`. Area pages say `קייטרינג ל{עיר} — מוגש מהמטבח שלנו ב{סניף}, כ־{{DRIVE_MINUTES}} דקות נסיעה.`
- **Gate — all four required before a city page exists:** owner-signed drive time from the serving branch, that area's minimum order, that area's delivery fee, and one genuinely area-specific fact. Absent any of them the city is not built. **Populating a delivery radius by inference from a map is forbidden** — that is exactly how `faq-data.ts:34-49` acquired ~14 invented service cities.
- **Candidate cities (Phase 4, in order):** Kfar Saba, Hod Hasharon, Ramat Hasharon, Tel Aviv. **Hard cap: no city page is created solely because a competitor has one.** 5 occasions × 8 cities = 40 pages is the trap; the occasion×city matrix is not built.
- **Head-term expectation setting:** `b144`, `easy`, `rest` and vendor city pages with years of authority hold `קייטרינג + עיר`. This page type is not measured on the head term; the winnable queries are differentiator-shaped long tail.
- **Section order:** `MenuHero` → `AreaServed` (serving branch · drive time · minimum · fee · delivery window) → `DriveTimeTable` (this area's row highlighted) → **01** `MenuSheet` (condensed) → **02** `InclusionsExclusions` → **03** `LimitsBlock` → **04** `KitchensBand` (ink; the serving branch first) → **05** `QuoteBuilder` (area pre-seeded) → **06** `Faq` → **07** `Colophon`.
- **Schema:** `Service` with `areaServed: City` + `provider` → `#org` + `BreadcrumbList`. **No `Restaurant` node** — emitting one would assert a premises that does not exist.

---

### P-27 · `/lp/:campaign` — paid landing pages

- **Separate tree. `noindex, nofollow`, excluded from sitemap, no internal links pointing in.** This is what lets aggressive conversion-focused variants be A/B tested without diluting the crawlable site or forcing canonical gymnastics.
- Built from the same components and tokens. Free to reorder sections and drop the menu register entirely.
- **Compliance is not relaxed on paid pages:** INV-1, INV-2 and INV-6 apply unchanged. Every LP carries the collection notice inside its form.

---

## 5. Routing, decomposition, and the infrastructure every page depends on

### 5.1 The per-route head layer — a hard blocker, and it must be parameter-aware

**Do not build a single page in §4 until this exists.** The app is a single-HTML SPA today: `server/vite.ts` `serveStatic()` ends with `app.use("*", …) res.sendFile(index.html)` and `client/index.html` hardcodes one `<title>`/`description`/`og:` block. There is no `react-helmet` or equivalent. Every route would ship byte-identical head tags and no canonical, Google would treat them as duplicates, and the entire multi-page effort would return nothing.

It is also a **lead-generation** requirement: WhatsApp and Facebook link-preview crawlers do not execute JavaScript, so client-injected `og:` tags produce no preview card. Every forwarded link to a branch or occasion page would render as a bare grey URL and lose the click.

**`RouteDef` must resolve per parameter.** A single `titleHe` keyed on the wouter *pattern* would give three branch pages, four area pages and every LP byte-identical titles and canonicals — the exact failure the layer exists to prevent.

```ts
// shared/routes.ts — plain TS, NO drizzle import
export type HeadDef = {
  titleHe: string;
  descriptionHe: string;
  canonicalPath: string;             // absolute path, self-referential
  ogImage: string | "auto";          // "auto" ⇒ generated card, §5.6
  robots: "index" | "noindex";
};

export type RouteDef = {
  id: string;                        // "P-04"
  path: string;                      // wouter pattern, e.g. "/kitchens/:slug"
  register: "menu" | "operational";
  stickyBar: "quote" | "phone" | "none";
  launchReady: boolean;              // §5.8 — gates T-2 / T-6 from warn to fail
  inSitemap: boolean;
  changefreq?: string;
  schema: SchemaKind[];
  breadcrumb: { labelHe: string; path: string }[];
  head: HeadDef | ((params: Record<string,string>) => HeadDef | null);
  //                                    ↑ null ⇒ unknown param ⇒ HTTP 404
  enumerate?: () => string[];        // concrete param values, for the sitemap
};
```

- `head` for `/kitchens/:slug` resolves against `content/kitchens/{slug}.ts`; for `/areas/:city` against `content/areas/{city}.ts`. **Unknown parameter ⇒ `head` returns `null` ⇒ the server responds 404 with the `NotFound` shell** (wouter's `/kitchens/:slug` otherwise matches `/kitchens/anything` and the head layer would emit a 200 and a canonical for a nonexistent branch). The client component performs the same check.
- `enumerate()` is what expands parameterised routes into the sitemap. A route with `inSitemap: true` and no `enumerate` on a parameterised path fails a unit test.

```
server/seo/head.ts       reads shared/routes.ts; string-injects <title>, description,
                         canonical, og:*, twitter:*, robots, the CSP nonce, and the
                         page's JSON-LD into the index.html template before send.
                         Mirrors the existing template.replace() pattern in server/vite.ts.
server/seo/sitemap.ts    GET /sitemap.xml, generated from shared/routes.ts + enumerate()
client/public/robots.txt Disallow: /admin, /lp, /thanks, /summary, /unsubscribe
                         Sitemap: {DOMAIN}/sitemap.xml
```

Build-time prerendering is the better end state and is planned for Wave 3; the string-injection layer is what unblocks Waves 1–2. Without prerendering, all Hebrew copy is invisible to crawlers that do not execute JS.

### 5.2 `App.tsx`

```tsx
import { Switch, Route } from "wouter";
import { DirectionProvider } from "@radix-ui/react-direction";
import { lazy, Suspense } from "react";
import SiteLayout from "@/layouts/site-layout";
import RouteShellSkeleton from "@/layouts/route-shell-skeleton";
import { useHashScroll } from "@/hooks/use-hash-scroll";

const Home          = lazy(() => import("@/pages/home"));
const Menus         = lazy(() => import("@/pages/menus"));
const Kitchens      = lazy(() => import("@/pages/kitchens"));
const KitchenBranch = lazy(() => import("@/pages/kitchen-branch"));
const CateringHub   = lazy(() => import("@/pages/catering-hub"));
const Business      = lazy(() => import("@/pages/catering-business"));
const PrivateEvents = lazy(() => import("@/pages/catering-private-events"));
const BarMitzvah    = lazy(() => import("@/pages/catering-bar-mitzvah"));
const Shiva         = lazy(() => import("@/pages/catering-shiva"));
const Holidays      = lazy(() => import("@/pages/catering-holidays"));
const FunDay        = lazy(() => import("@/pages/catering-fun-day"));
const Dairy         = lazy(() => import("@/pages/catering-dairy"));
const Urgent        = lazy(() => import("@/pages/urgent"));
const PastaBar      = lazy(() => import("@/pages/pasta-bar"));
const Quote         = lazy(() => import("@/pages/quote"));
const Thanks        = lazy(() => import("@/pages/thanks"));
const Summary       = lazy(() => import("@/pages/summary"));
const Unsubscribe   = lazy(() => import("@/pages/unsubscribe"));
const Area          = lazy(() => import("@/pages/area"));
const Lp            = lazy(() => import("@/pages/lp"));
const Privacy       = lazy(() => import("@/pages/privacy"));
const Terms         = lazy(() => import("@/pages/terms"));
const Accessibility = lazy(() => import("@/pages/accessibility"));
const AdminLeads    = lazy(() => import("@/pages/admin-leads"));
const NotFound      = lazy(() => import("@/pages/not-found"));

export default function App() {
  useHashScroll();
  return (
    <DirectionProvider dir="rtl">
      <SiteLayout>                                {/* header + colophon OUTSIDE Suspense */}
        <Suspense fallback={<RouteShellSkeleton />}>
          <Switch>
            <Route path="/"                        component={Home} />
            <Route path="/menus"                   component={Menus} />
            <Route path="/kitchens"                component={Kitchens} />
            <Route path="/kitchens/:slug"          component={KitchenBranch} />
            <Route path="/catering"                component={CateringHub} />
            <Route path="/catering/business"       component={Business} />
            <Route path="/catering/private-events" component={PrivateEvents} />
            <Route path="/catering/bar-mitzvah"    component={BarMitzvah} />
            <Route path="/catering/shiva"          component={Shiva} />
            <Route path="/catering/holidays"       component={Holidays} />
            <Route path="/catering/fun-day"        component={FunDay} />
            <Route path="/catering/dairy"          component={Dairy} />
            <Route path="/urgent"                  component={Urgent} />
            <Route path="/pasta-bar"               component={PastaBar} />
            <Route path="/quote"                   component={Quote} />
            <Route path="/thanks"                  component={Thanks} />
            <Route path="/summary"                 component={Summary} />
            <Route path="/unsubscribe"             component={Unsubscribe} />
            <Route path="/areas/:city"             component={Area} />
            <Route path="/lp/:campaign"            component={Lp} />
            <Route path="/privacy"                 component={Privacy} />
            <Route path="/terms"                   component={Terms} />
            <Route path="/accessibility"           component={Accessibility} />
            <Route path="/admin/leads"             component={AdminLeads} />
            <Route                                 component={NotFound} />
          </Switch>
        </Suspense>
      </SiteLayout>
    </DirectionProvider>
  );
}
```

Removed from the current shell: `QueryClientProvider` (≈18 KB gzip for one POST), `TooltipProvider` (no tooltips in the marketing UI), `Toaster` (the success message becomes inline form state — better UX at the highest-anxiety moment in the funnel), and the globally mounted `AccessibilityToolbar` (deleted, not repaired — §5.5).

`KitchenBranch` and `Area` are **parameterised pages, not templates with substituted words.** Each reads its unique copy from `content/kitchens/{slug}.ts` / `content/areas/{city}.ts`, which are **authored** files, not generated ones. That distinction is the difference between three entity pages and three doorway pages.

### 5.3 Header and navigation IA — 27 routes, one nav

Previously unspecified, and it is the one piece of IA a build of this size cannot start without.

**Desktop header (sticky, hairline appears on scroll >8px, no shadow, no shrinking logo):**

```
[ wordmark → / ]      התפריטים   המטבחים   לאיזה אירועים   שאלות        [ קבלו הצעה ]  09-XXXXXXX
                      /menus     /kitchens  /catering       /#faq*        filled → /quote   text link
```
`*` `שאלות` is an in-page anchor on routes that have a FAQ and a link to `/catering#faq` elsewhere.

**Four items, and no more.** The eight occasion pages are deliberately **not** in the header: an eight-item occasion menu is a nav nobody opens and a link carpet on every page. They are reached from `/catering`, from `EventRows` on `/` and on branch pages, and from contextual body links.

**Mobile (<860px):** wordmark + hamburger. The drawer opens with the **primary CTA at the top**, above the nav items — it currently sits below six of them, outside thumb reach. Order: `[ קבלו הצעה ]` → the four nav items → the three branches → `הדפיסו את התפריט` (on `/menus` only) → legal links. Built on the Radix `Dialog`/`Sheet` primitive already in the repo, never a hand-rolled translated panel (the current one keeps ~8 controls in the tab order while closed and sets `aria-modal` permanently).

**Breadcrumb** renders as a single hairline row directly beneath the header on every non-home indexable route, sourced from `RouteDef.breadcrumb`, and emits `BreadcrumbList`.

**Sticky mobile CTA bar** is chrome, driven by `RouteDef.stickyBar`:

| Value | Contents |
|---|---|
| `quote` | `[ וואטסאפ ]` filled + `התפריט שלכם` ghost |
| `phone` | `[ וואטסאפ ]` filled + `{{PHONE}}` ghost |
| `none` | bar does not render |

Exactly one filled control, always WhatsApp. This is the stated INV-4 exception.

### 5.4 Chunking, preloading, hash navigation

- `React.lazy` per route with **one** `Suspense`. Header, colophon and the sticky bar stay **outside** the boundary — wouter's `<Switch>` unmounts the outgoing route immediately, so only the body may swap, and the fallback must be a fixed-height skeleton matching the route shell so CLS stays 0.
- wouter has no route preloading. Export each lazy module's loader as a named function; call it from `onPointerEnter` / `onTouchStart` / `onFocus` on `<Link>`; `requestIdleCallback`-prefetch `/quote` and `/menus` after LCP.
- Pin a `framework` chunk via `build.rollupOptions.output.manualChunks` so the shell hash is stable across content-only deploys; set `experimentalMinChunkSize ≈ 4000` (a whole RTT for a 269-byte chunk is a net loss on cellular).
- **Route-level splitting always. Section-level splitting only when a route chunk exceeds 14 KB gzip**, and then the split point is the fold. **Never lazy-load the builder on a landing route.**
- `useHashScroll()`: read `location.hash` on mount and on every route change, wait one `requestAnimationFrame` for layout, scroll respecting `prefers-reduced-motion`, move focus to the target. All anchor targets carry `scroll-margin-top` clearing the fixed header. Every hash CTA from a non-home route currently fails silently (`header.tsx:40,60,104,127` do `window.location.href = "/#" + id`, a full reload that discards the SPA; wouter ignores fragments entirely).

### 5.5 RTL infrastructure — blocking, one commit

- `DirectionProvider dir="rtl"` at the root. Radix primitives read direction from their own `dir` prop or this provider and **do not** read `document.dir` or `<html dir="rtl">`.
- **In the same commit**, revert the hand-flipped physical `left-4` close buttons in `ui/dialog.tsx:41` and `ui/alert-dialog.tsx:37` to logical `end-4`. Landing the provider without reverting them double-flips them.
- Lint-ban `ml-*`, `mr-*`, `pl-*`, `pr-*`, `left-*`, `right-*`, `text-left`, `text-right`, `border-l`, `border-r`, `rounded-l`, `rounded-r`, `float-left`, `float-right`, `space-x-*`, `divide-x-*` inside `client/src`. `space-x-*` emits physical margins: in an RTL row there is **no gap between the first two visual items** and a phantom gap at the trailing edge. Use `gap`.
- **Deleted, not refactored:** `ui/accessibility-toolbar.tsx` + `hooks/use-accessibility.tsx`. The overlay produces no conformance, inverts every food photograph, makes `html` a containing block that repositions fixed descendants and kills `backdrop-filter`, overrides the user's own browser font size, ships 7 `console.log`s, and is itself the least accessible component in the codebase. The deletion must land in the **same** change as the contrast/focus/form fixes so it does not read as a regression.

### 5.6 `og:image` — a pipeline, not a wish

With ~20 indexable routes and an owner supplying perhaps four photographs, most routes would emit a 404 `og:image` — a blank WhatsApp card on the exact forwarding mechanic the thesis depends on.

- `HeadDef.ogImage: "auto"` ⇒ `scripts/og.ts` generates `client/public/og/{routeId}.jpg` at build time: the route's H1 typeset on `--paper` with the wordmark and the three city names, 1200×630, no photograph. Deterministic, cached by content hash.
- A real photograph replaces it by setting an explicit path. The generated card is the default, permanently — not a placeholder.
- One unit test asserts every `inSitemap: true` route resolves to an `og:image` that exists on disk after build.

### 5.7 Component decomposition

```
client/src/
  layouts/
    site-layout.tsx            SkipLink · <header> · Breadcrumb · <main id="main"> ·
                               <footer> · GrainLayer · StickyCtaBar · WaReturnPanel
    route-shell-skeleton.tsx   fixed-height Suspense fallback, CLS-safe
  components/
    primitives/                (design contract owned by 03; architecture requires these props)
      slot.tsx                 <Slot id blocking? prune="clause|row|cell|section">
      fact.tsx                 <Fact value source href?>   → "3 מטבחים · כתובות בסעיף 05"
      photo.tsx                <Photo src? caption(REQUIRED) ratio index? priority? alt>
      ltr.tsx  num.tsx  hairline-table.tsx  wa-button.tsx  cta-pair.tsx  section-head.tsx
    sections/
      menu-hero.tsx            eyebrow · h1 · lede · FactLine · CtaPair · HeroDishLines
      hero-dish-lines.tsx      4 dish rows; renders only at ≥4 catering-available dishes
      decision-checklist.tsx   mobile in-page nav; only filled targets
      menu-sheet.tsx           THE dish list                                    §3.2
      service-menus.tsx        three service formats as three chef's menus
      inclusions-exclusions.tsx two columns, equal weight                       G8
      tasting-band.tsx         gated on SLOT.TASTING_POLICY                     §6.2
      limits-block.tsx         מה אנחנו לא עושים, its own section               G9
      kitchens-band.tsx        THE ink band                                     INV-3
      branch-facts.tsx         single-branch sheet (P-04…06)
      production-sheet.tsx     three-column sheet + per-branch WaButton         G4
      drive-time-table.tsx                                                      G15
      google-reviews.tsx       outbound GBP links only, zero numbers            §4.5
      event-rows.tsx           hairline rows, self-routing, one stated limit each
      ops-facts.tsx            cutoff · minimum · delivery window · procurement
      stations-block.tsx  area-served.tsx
      process-steps.tsx        4 steps
      terms-strip.tsx          deposit · cancellation · headcount deadline      G10
      past-events.tsx          collapse-when-empty; consentRef required         G16
      price-floor.tsx          renders only with a real floor AND its owner note
      brief-card.tsx           the accumulated selection, echoed back
      quote-builder.tsx        (spec owned by 02)
      faq.tsx                  Radix Accordion; FAQPage for filled answers only
      colophon.tsx
      wa-return-panel.tsx      §6.3
  content/                     authored copy + slots, one module per page
    slots.ts  legal.ts  inclusions.ts  limits.ts  process.ts  seasons.ts  stations.ts
    kitchens/{herzliya-pituach,raanana,petah-tikva}.ts
    areas/{city}.ts
  data/
    locations.ts               THE NAP source of truth                          §6.1
    menus.ts                   THE dish source of truth                         §6.2
  config/
    business.ts                WA_NUMBER · TEL · EMAIL · DOMAIN — build fails if unset
    pricing.ts                 locked by default; three independent locks (02 §2.2)
  hooks/
    use-hash-scroll.ts  use-reveal.ts  use-scrolled-past.ts  use-brief.ts
  lib/
    whatsapp.ts                openWhatsApp() — commit-before-redirect, no await
    schema-jsonld.ts           builders per SchemaKind
    analytics.ts               typed discriminated union; no page may invent an event name
    consent-gate.ts            §5.9 — the only path any third-party script may enter
shared/
  routes.ts                    route manifest — plain TS, no drizzle
  lead-schema.ts               zod, no drizzle (client-safe)
```

**One config module, one name: `client/src/config/business.ts`.** `02-lead-machine.md` §4.3 and §15 import `@/config/contact` — that path does not exist and must be rewritten.

**`ui/` retention — reconciled with `03-design-system.md` §11.3.** Keep: `button`, `input`, `label`, `textarea`, `card`, `accordion`, `form`, plus `dialog` and `sheet` as the drawer/modal primitives. Delete the other ~35 unreachable files (worth ≈7.3 KB gzip of CSS via Tailwind's content globs — **not** JS, which is already tree-shaken). `lib/utils.ts` is **rewritten**, not kept: `tailwind-merge` is removed (20 KB raw / 6.8 KB gzip for conflict resolution nothing in the surviving set needs), so `cn()` becomes `clsx` only.

**Components `03-design-system.md` must add** (it owns components and currently specifies none of these): `DecisionChecklist`, `EventRows`, `TastingBand`, `LimitsBlock`, `InclusionsExclusions`, `ProcessSteps`, `TermsStrip`, `OpsFacts`, `ServiceMenus`, `StationsBlock`, `AreaServed`, `DriveTimeTable`, `HeroDishLines`, `GoogleReviews`, `PriceFloor`, `BriefCard`, `WaReturnPanel`, `CtaPair`, `HairlineTable`, `WaButton`, `Ltr`, `Num`. `DecisionChecklist` and `OpsFacts` carry the mobile anti-bounce mechanic and the entire corporate/urgent value proposition.

**`<Slot>` API — one definition, and `03` must implement all of it.** Three incompatible signatures exist across the three specs. The architecture requires: `id` (string), `blocking` (boolean — throws at production build when unfilled; this is what protects `LEGAL_ENTITY`), `prune` (`"clause" | "row" | "cell" | "section"`, default `"row"`), children as the rendered value. There is no `<SlotGroup>` and no `<SlotRow>`/`<SlotSection>` — pruning granularity is a prop, not three components.

### 5.8 Anti-thin-content tests — with the degradation escape they were missing

- **T-1 · Swap test.** Substitute the city or occasion in the page's unique copy. If it still reads correctly, reject. Human, at review.
- **T-2 · Unique-string ratio ≥ 35%** of rendered Hebrew text, measured against the union of shared content modules.
- **T-3 · Title/description uniqueness.** No two resolved heads share a `title` or `description` — including across parameterised instances. Unit test over `enumerate()`.
- **T-4 · Canonical self-reference.** Every indexable route's canonical points at itself. No cross-canonicals.
- **T-5 · Ink band.** `count(data-band="ink") ≤ 1` per rendered route, and where present it is `KitchensBand`.
- **T-6 · Caption coverage.** Every `<img>` reachable in a route has a non-empty caption (INV-1).

**T-2 and T-6 are warnings until `RouteDef.launchReady === true`, and blocking after.** A page whose Slots are unfilled legitimately has *less* unique copy while the shared modules stay constant, so the degradation contract would otherwise mechanically fail CI — and the first gated page would get the gate disabled instead of the page fixed. `launchReady` is flipped by a human when the page's owner facts have landed.

### 5.9 CSP and the single script gate

`server/index.ts:31-40` sets four security headers and **no `Content-Security-Policy`.** Given the page carries inline JSON-LD and an inline `data:` SVG grain layer, the CSP must be written deliberately now or it will be omitted forever.

- The head layer generates a per-request **nonce**, injects it on the JSON-LD `<script>` tags, and emits:
  `default-src 'self'; script-src 'self' 'nonce-{N}'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'`
- **No analytics or advertising script may be added by editing HTML or a component.** `client/src/lib/consent-gate.ts` is the only injection path: it takes a declared vendor from a fixed allowlist, checks consent state, injects the tag, and — critically — the CSP `script-src` and `connect-src` entries for that vendor are added in the same commit. A vendor not in the allowlist cannot load, by construction.
- Until a pixel is actually approved by the owner, the allowlist is empty and INV-10 holds: **zero third-party requests.**

### 5.10 Time, dates and the Hebrew calendar

- INV-9 applies everywhere: cutoff display, answering-hours gating, `is_business_hours`, escalation windows, the `{{YEAR}}` in holiday titles, and the Friday/Saturday determination.
- **`date_flag = 'chag_adjacent'` (from `02` §3.4) is not implementable as specified** — it needs a Hebrew calendar, and `03` deletes `date-fns` without adding one. Two options, and one must be chosen in Wave 0: (a) drop `chag_adjacent` and keep `friday | shabbat | none`, or (b) add a named Hebrew-calendar dependency and derive it. **Default: drop it.** Season windows on `/catering/holidays` are owner-signed date ranges precisely so the build never has to compute a chag.

---

## 6. Data contracts owned by this spec

### 6.1 `client/src/data/locations.ts` — the NAP source of truth

The phone `052-123-4567` is hardcoded in 8 files and the single address `מדינת היהודים 85, הרצליה פיתוח` in 5 — and that address is on the "confirm it is correct and current" list, so it appears nowhere in this document as an example.

```ts
export type BranchSlug = "herzliya-pituach" | "raanana" | "petah-tikva";

export type Branch = {
  slug: BranchSlug;
  cityHe: string;                                  // known
  nameHe: string;                                  // known
  // everything below is an owner fact; every field optional, no defaults
  street?: string;
  geo?: { lat: number; lng: number };
  phoneE164?: string;      phoneDisplay?: string;  // E.164 in href, local form displayed
  whatsappE164?: string;
  hours?: { days: string; opens: string; closes: string }[];
  answeringHours?: string;                         // catering enquiries may differ
  chef?: { nameHe: string; roleHe: string; consent: boolean };
  pickup?: { offered: boolean; minimum?: string; hours?: string; loading?: string };
  servesAreas?: { cityHe: string; driveMinutes: number; minimum?: string; fee?: string }[];
  capacityPerDay?: string;
  cutoff?: { weekday?: string; friday?: string };
  privateEventCapacity?: { seated?: number; standing?: number;
                           canClose?: boolean; parking?: string; accessible?: boolean };
  gbpUrl?: string;                                 // sameAs + GoogleReviews
  mapImage?: string;                               // build-generated static PNG, §4 P-04
  kashrutStatementHe?: string;                     // OWNER VERBATIM. Never composed.
  accessibility?: { parking?: string; entrance?: string; toilet?: string;
                    seating?: string; lift?: string };
  photos?: { src: string; caption: string; ratio: string }[];  // caption REQUIRED
  bestSuitedForHe?: string;
};
```

`chef.consent === false` ⇒ the name never renders anywhere, including in JSON-LD.

### 6.2 `client/src/data/menus.ts` — the dish source of truth

Three tracks depend on this and no spec defined it.

```ts
export type DishId = string;
export type Course = "antipasti" | "pasta" | "mains" | "dessert" | "platters";

export type Dish = {
  id: DishId;
  nameHe: string;                       // verbatim from the restaurant menu
  descriptionHe?: string;               // ≤ 12 words; lint-enforced
  course: Course;
  cateringAvailable: boolean;           // OWNER FACT — false ⇒ never rendered
  branches: BranchSlug[];               // which kitchens actually cook it — OWNER FACT
  liveMenuUrl?: Partial<Record<BranchSlug, string>>;   // powers the "היום" mark, §3.2
  dietary?: ("vegetarian" | "vegan" | "gluten-free-ingredients")[];
  seasons?: SeasonId[];
  heroEligible?: boolean;               // may appear in HeroDishLines
  // NO price field. Prices live only in config/pricing.ts, behind three locks.
};

export const cateringAvailableCount: number;   // drives the §3.3 fallback
```

**Rules, asserted in tests:** a dish renders only when `cateringAvailable === true && branches.length ≥ 1`. `descriptionHe` over 12 words fails lint. No numeric literal preceded or followed by `₪` may appear in this file. `dietary: "gluten-free-ingredients"` renders as an ingredients statement only — the string `ללא גלוטן` unqualified is banned site-wide.

### 6.3 Brief state — `useBrief()`

- `localStorage` key `mm_brief_v1`: `{ dishIds: DishId[], updatedAt: number }`. Cap 20. **No PII, ever.** Expires after 14 days.
- Fires `add_to_brief` / `remove_from_brief`; entering the builder with a non-empty brief fires `brief_to_builder`.
- Persisted to the lead as `leads.selected_dish_ids text[]` — a column `02-lead-machine.md` does not currently define and must add — and echoed on `/thanks` and `/summary`.
- `WaReturnPanel`: `openWhatsApp()` writes `sessionStorage.mm_last_ref = { ref, at }` **before** navigating. On any route mount, if `mm_last_ref` is younger than 30 minutes the panel renders: `שלחנו אתכם לוואטסאפ. מספר הפנייה שלכם: {ref}` + `לא נפתח? {{WHATSAPP_DISPLAY}}` + a link to `/summary?ref=`. Dismissible, dismissal persisted. Without it, the return-from-WhatsApp experience on the dominant Israeli channel is undefined — the tab is backgrounded and returns to exactly the page the user left.

### 6.4 Analytics events this spec's pages require

`02-lead-machine.md` §11.2 is a closed discriminated union that no page may extend. These are used in §4 and must be **added to that union**, with parameters:

| Event | Params | Ads tier |
|---|---|---|
| `add_to_brief` | `source_page`, `dish_id`, `course`, `brief_size` | — |
| `remove_from_brief` | `dish_id`, `brief_size` | — |
| `brief_to_builder` | `brief_size`, `source_page` | — |
| `branch_click` | `source_page`, `branch` | — |
| `event_page_click` | `source_page`, `event_type` | — |
| `summary_share` | `lead_ref`, `method` (`print｜copy｜whatsapp`) | secondary |

Everything else uses `02`'s existing names. `quote_submit` and `kitchen_page_click` from the first pass do not exist; the correct names are `generate_lead` and `branch_click`.

---

## 7. schema.org modelling

One graph, `@id`-linked, emitted server-side per route by `server/seo/head.ts`.

### 7.1 The graph

```
{DOMAIN}/#org                                Organization
  ├ name, legalName (Slot), taxID (Slot), url, logo, telephone, email
  ├ sameAs: [ Instagram, Facebook ]          ← only when real URLs exist
  └ subOrganization: [ #kitchen-herzliya, #kitchen-raanana, #kitchen-petah ]

{DOMAIN}/kitchens/{slug}#kitchen             Restaurant
  ├ parentOrganization: {DOMAIN}/#org
  ├ address (PostalAddress), geo, telephone, openingHoursSpecification
  ├ servesCuisine: "Italian",  hasMenu: {DOMAIN}/menus
  └ sameAs: [ that branch's Google Maps URL ]  ← the highest-value edge in the graph

{DOMAIN}/#website                            WebSite ( publisher → #org )
```

`subOrganization` / `parentOrganization` — **never `department`.** `department` is for departments inside one place (a pharmacy within a supermarket), not sibling branches in different cities. The design reference's JSON-LD uses `department` and types the brand entity as `FoodEstablishment` with no address of its own; both are wrong and must not be ported.

### 7.2 Per page type

| Page type | Nodes |
|---|---|
| `/` | `Organization`, `WebSite`, `WebPage` |
| `/menus` | `Menu` → `hasMenuSection` → `MenuItem`, `BreadcrumbList` |
| `/kitchens` | `CollectionPage`, `BreadcrumbList` (branch nodes `@id`-referenced only) |
| `/kitchens/:slug` | `Restaurant` (full, canonical here), `BreadcrumbList` |
| `/catering` | `CollectionPage`, `BreadcrumbList` |
| event pages | `Service` (`serviceType: "Catering"`, `provider` → `#org`, `areaServed`, `audience`), `BreadcrumbList`, `FAQPage` (filled answers only) |
| `/quote` | `ContactPage`, `BreadcrumbList` |
| `/areas/:city` | `Service` with `areaServed: City`, `BreadcrumbList` — **no `Restaurant` node** |
| legal | `WebPage`, `BreadcrumbList` |
| `/thanks`, `/summary`, `/unsubscribe`, `/admin/leads`, `/lp/*`, `/404` | none |

### 7.3 Prohibitions

- **`aggregateRating` and `Review`: never.** No real attributable reviews exist; Google disallows self-serving review snippets for `LocalBusiness`; and the fabricated `4.9/247` and `4.8/189` figures are deleted, not marked up. Real GBP reviews, linked out to their source, are the only compliant proof (`GoogleReviews`, §5.7 — three outbound links, no numbers, per branch only where `gbpUrl` is filled).
- **`priceRange`: omitted entirely.** Never `"{{PRICE_RANGE}}"`, never a guess.
- **`Offer.price` only where an owner-signed price exists**, with its conditions published alongside.
- **`hasCertification` / any kashrut claim: never**, absent a current certificate per branch.
- **Expectation setting for the client, stated plainly:** `Service` markup has no corresponding Google rich result, and `LocalBusiness` markup no longer generates a meaningful visual SERP feature. This work buys entity disambiguation and legibility to AI answer surfaces — not stars. Do not promise a SERP feature.

---

## 8. Build order, dependencies, parallel ownership

Waves are sequential. Within a wave, tracks are parallel and **file-disjoint** — the ownership column is the collision-avoidance contract.

### Wave 0 — Foundations (single owner, one branch, no parallelism)

| # | Task | Files owned |
|---|---|---|
| 0.1 | The §0.1 deletion commit, including the four unlawful `terms.tsx` clauses and the three orphaned tables | the files listed in §0.1 |
| 0.2 | Palette + token rewrite (gold deleted, paper/ink adopted), `--radius: 3px`, italic reset, single motion primitive, `prefers-reduced-motion`, grain layer, high-contrast as a **token override, never a filter** | `index.css`, `tailwind.config.ts` |
| 0.3 | `config/business.ts`, `config/pricing.ts` (locked), `data/locations.ts` (§6.1) | new |
| 0.4 | `shared/routes.ts` — all 27 `RouteDef`s with the §5.1 `head` resolver and `enumerate()` | new |
| 0.5 | `server/seo/head.ts` (incl. CSP nonce + JSON-LD), `server/seo/sitemap.ts`, `robots.txt`, `/api` JSON 404 before the static fallback, CSP header | `server/vite.ts`, `server/index.ts`, new |
| 0.6 | `shared/lead-schema.ts`; drop `@shared/schema` from the client | new, `contact.tsx` |
| 0.7 | **Data model.** Lead attribution + pipeline columns; `selected_dish_ids`; `unsubscribed_at`; `consent_*`; `phone_e164`; `wa_ref_code`. Tables: `leads` (renamed), **`quote_drafts`**, **`call_events`**, `lead_events`. **No `whatsapp_intents` table** — `02` §1.1 rejects it and every path writes to `leads` with a `path` discriminator. Requires `db:generate` + `db:migrate` scripts and a **hand-written SQL migration** (`db:push` alone would drop and recreate, destroying rows, and cannot create a compatibility view). Every added column needs a matching `?? null` line in `MemoryStorage.createContactSubmission`, which builds rows field-by-field — ~60 lines plus a parity test. Budget it as a real task. | `shared/schema.ts`, `server/storage.ts`, `server/routes.ts`, `migrations/*` |
| 0.8 | **Attribution merge.** Express middleware writes click IDs to an `httpOnly` `mm_attr` cookie; `POST /api/quote` and `POST /api/wa-intent` **merge `req.cookies.mm_attr` server-side** into the row. JS cannot read an `httpOnly` cookie, so without this `gclid` is captured and discarded and the Ads export returns zero rows forever. Precedence: server cookie wins for click IDs; client wins for `ga_client_id` (read from `_ga`). Note `secure: true` means attribution never persists over local http — dev must set `secure` from `NODE_ENV`. | `server/index.ts`, `server/routes.ts` |
| 0.9 | Primitives: `Slot` (with `blocking` + `prune`), `Fact`, `Photo`, `Ltr`, `Num`, `HairlineTable`, `WaButton`, `CtaPair`, `SectionHead` | `components/primitives/*` |
| 0.10 | `SiteLayout`, `RouteShellSkeleton`, header + nav IA (§5.3), `Colophon`, `Breadcrumb`, `StickyCtaBar`, `useHashScroll`, `DirectionProvider` + the `end-4` revert | `layouts/*`, `layout/*`, `App.tsx` |
| 0.11 | Self-hosted Hebrew-subset variable fonts, `scripts/images.ts` (sharp + manifest), `scripts/og.ts`, `scripts/maps.ts`, brotli precompression, `express.static` cache headers (`maxAge: '1y', immutable` for `/assets/*`, `no-cache` for `index.html`) | `client/index.html`, `scripts/*`, `server/vite.ts` |
| 0.12 | CI gates (below) | `.github/workflows/*`, `scripts/checks/*` |
| 0.13 | `docs/privacy/` artefact set: `database-definition.he.md` (מסמך הגדרות המאגר — required at every security level), `processors.md` (hosting + webhook vendor + country + DPA status; the cross-border written undertaking), `retention.md`, `dsr-runbook.md`, `incident-runbook.md`, `consent-log.md` | new |
| 0.14 | Write `04-legal-and-content.md`; renumber every `04-*`/`05-*` cross-reference in `01`, `02`, `03` | `docs/spec/*` |

**Additive dependencies (none of these are installed; no spec lists them):**

| Package | For | Task |
|---|---|---|
| `@radix-ui/react-direction` | `DirectionProvider` | 0.10 |
| `cookie-parser` | `req.cookies.mm_attr` | 0.8 |
| `nanoid` | already imported by `server/vite.ts:7` but **undeclared** — resolves only transitively and breaks on `npm prune` | 0.5 |
| `sharp` | image pipeline, `og.ts` | 0.11 |
| a brotli precompressor | `.br` assets | 0.11 |
| `size-limit` | per-route KB budget, **fails** the build | 0.12 |
| `@axe-core/cli` (or equivalent) | a11y CI | 0.12 |

**Removals in the same pass:** `tailwind-merge`, `@tanstack/react-query`, `@tailwindcss/typography`, `framer-motion`, `recharts`, `embla-carousel-react`, `cmdk`, `vaul`, `react-day-picker`, `date-fns`, `input-otp`, `react-resizable-panels`, `react-icons`, `next-themes`, `passport`, `passport-local`, `express-session`, `connect-pg-simple`, `memorystore`, and the ~22 unused `@radix-ui/*`.

**CI gates (0.12) — corrected regexes.** The first-pass gates were broken in two ways.

```bash
#!/usr/bin/env bash
# scripts/checks/honesty.sh — writes to stdout, quotes its args, exits non-zero on any hit
set -uo pipefail
fail=0
scan() {                       # scan <label> <pattern> [rg args…]
  local label="$1" pat="$2"; shift 2
  if rg -n --pcre2 "$pat" "$@"; then echo "FAIL: $label"; fail=1; fi
}
SRC=(client/src shared server --glob '!client/src/config/**')

# ₪ in either house order — the first-pass gate only matched the format we ban
scan "hardcoded price"   '[0-9][\s ]*₪|₪[\s ]*[0-9]' "${SRC[@]}"
# anchored so הכשרה / מכשיר / להכשיר do not false-positive a BLOCKING gate
scan "kashrut claim"     '(^|[\s"'"'"'>(])(כשר|כשרות|בד״ץ|בד"ץ|מהדרין|גלאט)([\s"'"'"'<).,!?]|$)' "${SRC[@]}"
scan "invented stat"     '25 שנות|אלפי לקוחות|10,000|4\.9|4\.8|247 ביקורות|189 ביקורות' "${SRC[@]}"
scan "invented minimum"  'מ־25|מ-25|עד 25 סועדים|25 סועדים' "${SRC[@]}"
scan "placeholder tel"   '052-?123-?4567|972521234567' "${SRC[@]}"
scan "bidi range"        '\d\s*[–—]\s*\d' "${SRC[@]}"
scan "arabic script"     '[\x{0600}-\x{06FF}]' client/src
scan "unqualified GF"    'ללא גלוטן' "${SRC[@]}"
exit $fail
```

Plus: T-3/T-4/T-5 unit tests, T-2/T-6 (warn until `launchReady`), the logical-property lint, `size-limit` per route, and axe-core per route.

**Why 0.12 lands in Wave 0, not at the end:** a budget or ban-list that only warns is gone in two weeks, and page six otherwise reintroduces every defect fixed on page one.

### Wave 1 — Reference implementation (single owner)

| # | Task | Owns |
|---|---|---|
| 1.1 | Every shared section component, built against P-01 and P-02 | `components/sections/*` |
| 1.2 | `QuoteBuilder` + `POST /api/quote` + `POST /api/wa-intent` + `GET /api/quote/:ref` (allowlisted, §4 P-19) + `openWhatsApp()` | `quote-builder.tsx`, `lib/whatsapp.ts`, `server/routes.ts` |
| 1.3 | **P-01 `/`** | `pages/home.tsx`, `content/home.ts` |
| 1.4 | **P-02 `/menus`** + `data/menus.ts` + the print stylesheet | `pages/menus.tsx`, `data/menus.ts` |
| 1.5 | **P-25 `/404`** | `pages/not-found.tsx` |

P-01 and P-02 are the reference implementation — under TAFRIT the menu page is not a Wave 2 page, it is half the thesis. **No Wave 2 track may begin until both merge.**

### Wave 2 — Parallel tracks (six owners, file-disjoint)

| Track | Pages | Owns exclusively | Depends on |
|---|---|---|---|
| **A** | P-03, P-04, P-05, P-06 | `pages/kitchens.tsx`, `pages/kitchen-branch.tsx`, `content/kitchens/*`, `sections/branch-facts.tsx`, `sections/drive-time-table.tsx`, `sections/google-reviews.tsx` | 0.3, 1.1 |
| **B** | P-07, P-08 | `pages/catering-hub.tsx`, `pages/catering-business.tsx`, `content/business.ts`, `sections/ops-facts.tsx`, `sections/event-rows.tsx` | 1.1 |
| **C** | P-09 | `pages/catering-private-events.tsx`, `content/private-events.ts`, `sections/service-menus.tsx` | 1.1 |
| **D** | P-17, P-18, P-19, P-20 | `pages/{quote,thanks,summary,unsubscribe}.tsx`, `content/summary.ts`, `sections/brief-card.tsx` | 1.2 |
| **E** | P-21, P-22, P-23 | `pages/{privacy,terms,accessibility}.tsx`, `content/legal.ts` | 0.7, 0.9, 0.14 |
| **F** | P-24 | `pages/admin-leads.tsx`, admin endpoints | 0.7, 0.8 |

Shared-file rule: `ops-facts.tsx`, `service-menus.tsx`, `branch-facts.tsx` are **created** by tracks B, C and A respectively and **consumed read-only** by everyone else. A consumer needing a change opens a request to the owner; no cross-track edits.

### Wave 3 — Gated pages (parallel, each blocked on a specific owner fact)

| Page | Blocked on | Track |
|---|---|---|
| P-10 `/catering/bar-mitzvah` | kashrut answer, minimum, staffing | G |
| P-11 `/catering/shiva` | **kashrut answer (hard)**, lead time, delivery window, staffed phone hours | G |
| P-12 `/catering/holidays` | per-חג capability, owner-signed order-by dates, `seasons.ts` | H |
| P-15 `/urgent` | conservative owner-signed same-day cutoff per branch | H |
| P-13 `/catering/fun-day` | station operational limits | I |
| Prerendering | Wave 2 complete | J |

### Wave 4 — Expansion (only after Wave 2 pages have 30 days of data)

P-16 `/pasta-bar`, P-14 `/catering/dairy`, P-26 `/areas/:city` (one city at a time, each fully gated), P-27 `/lp/*`, `/menus/:menu`.

### 8.1 Critical path

```
0.1 deletions
  → 0.2 tokens ────┬→ 0.9 primitives → 1.1 sections ─┬→ 1.3 P-01 ┐
  → 0.3 config ────┤                                  │  1.4 P-02 ├→ Wave 2 → Wave 3 → Wave 4
  → 0.4 routes → 0.5 head layer ─────────────────────┤            │
  → 0.6/0.7 data → 0.8 attribution → 1.2 builder ────┘            │
  → 0.11 images/fonts/og ────────────────────────────┘            │
  → 0.12 CI gates ─────────────────────────────────────────────────┘  (blocks every merge after)
  → 0.13 privacy docs, 0.14 spec 04 ──────────────────→ Wave 2 track E
```

`0.5` blocks **every** page. `1.2` blocks tracks B, C, D. `0.11` blocks any page containing a `<Photo>`. `0.14` blocks track E entirely.

### 8.2 Launch blockers that are not code

Outside the build team's control. Escalate on day one, with dates.

1. **The dish list.** Which restaurant menu items are actually catering-available, per branch, and the live-menu URL per branch. This is the single point of failure for the whole direction (§3.3) and it is also the cheapest possible ask — the owner already holds the artefact.
2. **Three addresses, three phone numbers, three sets of hours, three GBP URLs.**
3. **The kashrut answer per branch, verbatim, in writing.** Gates P-10 and P-11 and sets the account-wide negative-keyword list.
4. **The response-time commitment**, and the hours each channel is actually staffed. Appears on P-01, P-17, P-18 and is an operational promise, not copy.
5. **Legal entity name + ח.פ.** — build-blocking Slots on P-21 and P-22.
6. **Minimum, lead time, delivery windows, per-kitchen capacity, same-day cutoff.** Each is a commercial commitment; ship the conservative figure or ship nothing.
7. **A named chef per branch**, with consent to be named.
8. **Photography** — optional by design, and it is the last item on this list on purpose. Required metadata at shoot time (G7): branch, street, what is happening, and the **hour**. Hour and action are unreconstructable afterwards and cost nothing to request in advance.

**Degradation contract.** Every one of these, unfilled, produces a *shorter honest page* — a shorter menu, a two-format service list instead of three, a fact line of one clause, a branch column without a chef row, a page with no photographs at all. Never a placeholder, never a plausible guess, never a gapped grid. That is the whole architecture, and it is the only version of "authentic" that survives contact with a real business's unfilled facts.
