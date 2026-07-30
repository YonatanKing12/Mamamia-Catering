# 01 · Site Architecture Spec — מאמא מיה קייטרינג

**Status:** authoritative. Supersedes the current route table in `client/src/App.tsx`.
**Branch:** `claude/catering-landing-page-dbvbbx`
**Design direction:** `המטבח כמסמך` (Kitchen as Document) as the base system, with three grafts adopted as first-class (see §0.2).
**Companion specs:** `02-*` (design tokens & components), `03-*` (copy & slots), `04-*` (data model & measurement), `05-*` (legal/a11y). This document owns **routes, page contracts, decomposition, and build order** — nothing else.

---

## 0. Preconditions and direction reconciliation

### 0.1 Blocking deletions — Wave 0, before any page in this spec is built

These are not part of any page's build. They ship as one commit, first, by one owner. Every one of them was believed already removed and is still in the working tree.

| What | Where | Action |
|---|---|---|
| כשר / בד״ץ / מהדרין claims | `sections/hero.tsx:24,70`, `layout/footer.tsx:68`, `sections/story.tsx:24`, `data/faq-data.ts:21-29`, `pages/terms.tsx:118,121` | delete strings; kashrut becomes one owner-verbatim FAQ answer only (`SLOT.FAQ_KOSHER`), never a badge |
| Fabricated testimonials + hardcoded `Google 4.9/5 · 247 ביקורות` / `Facebook 4.8/5 · 189` | `sections/testimonials.tsx` (whole file) | delete file; replaced by `PastEvents` (§4.10) |
| Invented statistics `25 שנות ניסיון`, `אלפי לקוחות מרוצים`, `10,000+`, timeline 1995/2005/2020 | `footer.tsx:12`, `story.tsx:34-53,67-74`, `data/blog-data.ts:16`, `pages/blog-post.tsx:91`, `data/gallery-data.ts:17` | delete |
| Invented prices + calculator engine | `sections/price-calculator.tsx` (whole file), `sections/events.tsx:9-30`, `data/menu-data.ts` price fields, `contact.tsx:230-233` budget bands | delete file and fields |
| Invented legal identity | `pages/terms.tsx:24,40,57,59,64-67,77-80,156,188,198`, `pages/privacy.tsx:161` (fictitious DPO by name) | convert to build-blocking Slots |
| False accessibility conformance claims | `pages/accessibility.tsx:32,48,56,88-97,118` | rewrite as honest partial-conformance (spec `05-*`) |
| Gold token `hsl(43,74%,49%)` | `client/src/index.css:28-35,113-128`, `tailwind.config.ts` | delete at token level **before** any section is restyled (2.25:1 on white; every CTA currently fails AA) |
| Placeholder phone `052-123-4567` / `wa.me/972521234567` | 8 files, 14 occurrences | replaced by `client/src/config/business.ts`, build fails if unset |
| Font Awesome cdnjs `<link>` | `client/index.html:37-43` | delete |
| `@shared/schema` imported into the browser | `sections/contact.tsx:14` | replace with `shared/lead-schema.ts` (no drizzle) |
| Dead `href="#"` legal links | `layout/footer.tsx:80-82` | wire to `/privacy`, `/terms`, `/accessibility` |

### 0.2 Direction reconciliation — what "chosen" means for architecture

The judge panel split. The authoritative direction block is **Kitchen as Document**; the conversion lens preferred **Decision Sheet** and the brief-fit and buildability lenses preferred **TAFRIT**. Architecture resolves this rather than relitigating it:

1. **Base system = Kitchen as Document.** The section vocabulary, band sequence, one-ink-band rule, and the **Caption Law** are the house rules on every route.
2. **Graft A (from TAFRIT):** real dish names appear as type, not photography; the `MenuSheet` component with `הוסיפו לתפריט שלי` dish-level, PII-free micro-commitment that seeds step 1 of the builder; any table whose values are unfilled **collapses to a menu-style list, never a gapped grid**.
3. **Graft B (from Decision Sheet):** `מה לא כלול` is a published column of equal weight to inclusions; `מה אנחנו לא עושים` is its own section; a commercial-terms strip sits adjacent to submit; the confirmation artifact is forwardable and reference-coded; `מה צריך להחליט` doubles as mobile in-page nav, rendering **only** items whose target slots are filled.
4. **Graft C — route-level register inversion.** On `/urgent`, `/catering/business` and `/catering/shiva`, operational facts and the phone come first and the article register is subordinate. This is a **section-order variation of one system**, not a second design language: same tokens, same components, same band sequence rules.

### 0.3 Architectural invariants (fail review if broken)

- **INV-1 · Caption Law.** `<Photo>` has a **required** `caption` prop. Format: `{n} · {סניף} · {רחוב} · {מה קורה} · {שעה}`. Build fails on an uncaptioned image. No stock imagery, no SVG stand-ins.
- **INV-2 · Slot-or-nothing.** A fact renders only through `<Slot>`. Unfilled ⇒ prune the **smallest containing unit**: clause → row → cell → section. Never a plausible default, never an empty highlighted box in production.
- **INV-3 · One ink band per route**, and it is always `KitchensBand`. Test: count of `data-band="ink"` per rendered route === 1.
- **INV-4 · One filled primary CTA per viewport**, max two visible CTAs. `הזמינו עכשיו` is banned.
- **INV-5 · Three-axis page differentiation.** Pages differ on exactly three axes — copy, hero photograph, branch/FAQ specifics — plus their own `og:image`. No page-specific accent colour, no page-specific section order except the §0.2(4) inversion, no bespoke hero.
- **INV-6 · Every collection point carries the סעיף 11 notice.** The notice lives **inside** the form component, above submit, as a required prop. A page cannot ship a bare form.
- **INV-7 · Every route emits its own `<title>`, `description`, `canonical`, `og:*` from the server.** No route may be added to `shared/routes.ts` without them.
- **INV-8 · No route ships without an entry in `shared/routes.ts`.** The sitemap, the head layer, the breadcrumb trail and the internal-link graph all derive from that one file.

---

## 1. Hebrew slug policy — DECIDED

**Decision: ASCII slugs. English-semantic words for concepts, standard Latin transliteration for proper place names. No Hebrew characters in any URL path. No transliterated Hebrew words.**

```
/catering/business          ✅  concept in English
/kitchens/herzliya-pituach  ✅  place name transliterated
/catering/bar-mitzvah       ✅  loanword, already Latin-conventional
/קייטרינג-לחברות            ❌  rejected (see below)
/kaytering-lachavarot       ❌  rejected — worst of all worlds
```

**Justification, and what it costs us.** Google explicitly recommends non-English words in URLs for non-English sites (Mueller: "yes, non-English words and URLs are fine, we recommend using them for non-English websites"), and percent-encoded and Unicode forms are equivalent to it. So there is **no ranking argument** for ASCII here, and nobody on this project may tell the client otherwise. The decision is made on operational grounds only:

1. **Percent-encoding cost.** Each Hebrew letter encodes to 9 URL characters. `/קייטרינג-לחברות-בהרצליה-פיתוח` exceeds 250 characters encoded. That breaks UTM builders, ad-platform destination fields, CRM columns, printed collateral, and analytics reports — and this build has ~13 routes × campaign parameters.
2. **Bidi mangling.** An LTR URL pasted inside RTL Hebrew body copy or a WhatsApp message reorders visually. Since the whole conversion thesis depends on a buyer **forwarding a link on WhatsApp**, a URL that renders scrambled in the message body is a conversion defect, not an aesthetic one.
3. **Transliterated Hebrew is strictly dominated.** It carries no Hebrew keyword value (it is not a Hebrew word to Google) and is unreadable to both audiences. It is never the answer.
4. **Israeli readers parse `Herzliya`, `Raanana`, `menus`, `quote` without friction.** The UX cost is near zero.

**The trade we are knowingly making:** keyword-in-URL value in Hebrew. It is a very weak ranking factor and we are spending it to buy operability. Present this to the client as a **choice**, never as a technical necessity.

**Companion rules**
- Hebrew keyword value is recovered where it actually counts: `<title>`, `<h1>`, on-page copy, internal anchor text, and `og:title`.
- Lowercase, hyphen-separated, no trailing slash, no file extensions. `301` any trailing-slash variant to the canonical form.
- `/summary` uses `?ref=MM-XXXXXX`, not a path segment (see P-19) — the ref code must survive being read aloud on the phone.
- Transliteration table is fixed and lives in `shared/routes.ts` so nobody re-romanises a city differently on page nine: `herzliya-pituach`, `raanana`, `petah-tikva`, `kfar-saba`, `hod-hasharon`, `ramat-hasharon`, `tel-aviv`.

---

## 2. Page inventory

Legend — **Register:** `article` = Kitchen-as-Document order; `operational` = §0.2(4) inversion. **Gate:** owner facts that block the page from being built at all.

| ID | URL | Register | Phase | Gate |
|---|---|---|---|---|
| P-01 | `/` | article | 1 | photos ×3, addresses, chef names |
| P-02 | `/kitchens` | article | 2 | addresses, hours |
| P-03 | `/kitchens/herzliya-pituach` | article | 2 | address, hours, chef name, 2 photos, capacity |
| P-04 | `/kitchens/raanana` | article | 2 | same, per branch |
| P-05 | `/kitchens/petah-tikva` | article | 2 | same, per branch |
| P-06 | `/catering` | article | 2 | none (hub, no new facts) |
| P-07 | `/catering/business` | **operational** | 2 | cutoff time, minimum, invoicing terms |
| P-08 | `/catering/private-events` | article | 2 | minimum, staffing, venue capacity |
| P-09 | `/catering/bar-mitzvah` | article | 3 | kashrut answer, minimum, staffing |
| P-10 | `/catering/shiva` | **operational** | 3 | **kashrut answer (hard gate)**, lead time, delivery window |
| P-11 | `/catering/holidays` | article | 3 | per-חג capability, order-by date |
| P-12 | `/catering/fun-day` | article | 3 | pasta-station operational limits |
| P-13 | `/urgent` | **operational** | 3 | same-day cutoff per branch |
| P-14 | `/pasta-bar` | article | 4 | station guest range, power/water/space |
| P-15 | `/catering/dairy` | article | 4 | none beyond menus |
| P-16 | `/menus` | article | 2 | which restaurant dishes are catering-available |
| P-17 | `/quote` | operational | 2 | response-time commitment |
| P-18 | `/thanks` | — | 2 | response-time commitment |
| P-19 | `/summary` | — | 2 | inclusions, terms strip |
| P-20 | `/privacy` | — | 2 | legal entity, ח.פ., retention periods, processors |
| P-21 | `/terms` | — | 2 | deposit, cancellation, headcount deadline, entity |
| P-22 | `/accessibility` | — | 2 | רכז נגישות name+contact, audit facts, per-branch physical access |
| P-23 | `/admin/leads` | — | 2 | none |
| P-24 | `/404` | — | 1 | none |
| P-25 | `/areas/:city` | article | 4 | drive-time table, per-area minimum & fee |
| P-26 | `/lp/:campaign` | operational | 4 | `noindex`, excluded from sitemap |

**Removed routes:** `/blog`, `/blog/:id` — deleted in Wave 0 (fabricated content, and a thin-content liability adjacent to 13 real routes). A `/guides/:slug` editorial section may be proposed later; it is out of scope here and must not be revived by copying `blog-post.tsx`.

---

## 3. Page contracts

Every contract below is complete enough to build from alone. Where a value is `SLOT.X` it does not exist yet and the containing unit must prune per INV-2.

---

### P-01 · `/` — Home

- **Search intent:** brand and mixed-discovery. `מאמא מיה קייטרינג`, plus non-navigational visitors landing from GBP and WhatsApp forwards. This page must **not** be optimised for a head term.
- **Cluster:** brand defence (`מאמא מיה`, `מאמא מיה קייטרינג`, `מאמא מיה הרצליה`) + the identity separators `איטלקי`, `מהמסעדה`. **Never** optimise for bare `קייטרינג מאמא` — two entrenched competitors (`teamimofmama.com`, `bmama.co.il`) own it with 20–25 years of domain history and would harvest the traffic.
- **Title:** `קייטרינג מאמא מיה | מהמטבח של המסעדה האיטלקית בהרצליה פיתוח, רעננה ופתח תקווה`
- **Description:** `קייטרינג איטלקי משלושה מטבחי מסעדה פעילים. אותו צוות שמבשל אצלנו כל יום מבשל לאירוע שלכם. הצעה ב־4 שאלות.`
- **H1 (fixed, three lines, no rotation):** `אנחנו מסעדה איטלקית. הקייטרינג הוא אותו מטבח, אותו צוות — אצלכם.`
- **Conversion goal (single):** `quote_start` — entering the builder at §4.12. Everything else on the page is subordinate.
- **Section order:**
  1. `ArticleHero` — dateline eyebrow `הרצליה פיתוח · רעננה · פתח תקווה · {{TODAY_HE}}`, H1, standfirst, one 4:5 captioned photo. CTA pair: filled `קבלו הצעה ב־4 שאלות` → `#quote`; ghost `בואו לטעום הערב במסעדה` → `#tasting`. Phone as a text link only. `FactLine` = `תשובה תוך {{RESPONSE_TIME}} · מ־25 ועד {{MAX_GUESTS}} סועדים · שלושה מטבחים` (clause-level pruning).
  2. `DecisionChecklist` — sticky-on-mobile anchor nav; renders only rows whose targets are filled.
  3. `KitchensBand` **(the single ink band)** — three 3:2 captioned photos in a `gap:1px` grid, one per branch, plus the provenance paragraph. Each branch name links to its `/kitchens/*` page.
  4. `EventRows` — four hairline rows, corporate first. Each row deep-links to its event page **and** pre-seeds `eventType` in the builder (visible + editable).
  5. `MenuSheet` (condensed: 3 dishes per menu + `כל התפריטים` → `/menus`) with `הוסיפו לתפריט שלי`.
  6. `InclusionsExclusions` — two columns, equal weight.
  7. `TastingBand` `#tasting` — placed immediately after the money section, where doubt peaks.
  8. `ProcessSteps` + `TermsStrip`.
  9. `LimitsBlock` — `מה אנחנו לא עושים`.
  10. `ProductionSheet` — three branch columns, each ending in a branch-named WhatsApp button.
  11. `PastEvents` — collapses entirely if empty.
  12. `Faq` — 6 questions max on home; deeper sets live on event pages.
  13. `QuoteBuilder` `#quote`.
  14. `Colophon`.
- **Unique to this page:** the H1, the standfirst, the hero photo, the dateline, the condensed 3-dish menu selection, the 6 chosen FAQ items, `og:image` = `/og/home.jpg`.
- **Inherited unchanged:** every component's structure, the band sequence, the terms strip, the production sheet.
- **Links out:** `/kitchens/*` ×3 (from captions and production sheet), `/catering/business`, `/catering/private-events`, `/catering/bar-mitzvah`, `/catering/holidays`, `/menus`, `/quote`, `/privacy`, `/terms`, `/accessibility`.
- **Links in:** header logo on every route; all three GBP profiles' brand references; footer on every route.
- **Schema:** `Organization` (`@id: {DOMAIN}/#org`) with `subOrganization` → the three `Restaurant` `@id`s; `WebSite` (`@id: {DOMAIN}/#website`); `WebPage`. No `aggregateRating`, no `Review`, no `priceRange`.

---

### P-02 · `/kitchens` — המטבחים שלנו (hub)

- **Search intent:** verification. Someone checking whether the three restaurants are real.
- **Cluster:** `מאמא מיה מסעדה`, `מסעדה איטלקית הרצליה פיתוח`, `מאמא מיה סניפים`.
- **Title:** `המטבחים שלנו | שלוש מסעדות איטלקיות פעילות — מאמא מיה`
- **H1:** `שלושה מטבחים פעילים. כתובת, שעות, ומי מנהל כל אחד.`
- **Conversion goal:** `kitchen_page_click` — routing the visitor to the right branch page. This hub does **not** carry the builder; it carries three branch-named WhatsApp buttons.
- **Section order:** `ArticleHero` (no photo; the three branch photos below carry the page) → `ProductionSheet` (full, all three columns, all rows) → `DriveTimeTable` → `TastingBand` → `Faq` (3 items: pickup, hours, parking) → `Colophon`.
- **Unique:** the drive-time table (the only page that renders it in full), the hub H1.
- **Links out:** three branch pages; `/quote`.
- **Links in:** every `KitchensBand` caption; header nav; every branch page ("שני המטבחים האחרים").
- **Schema:** `CollectionPage` + `BreadcrumbList` (`בית › המטבחים שלנו`). Three `Restaurant` nodes are **not** repeated here — they are `@id`-referenced only, to keep each entity canonical on its own page.
- **Note:** the folder is `/kitchens`, not `/locations`. The word carries no SEO weight; `המטבחים שלנו` is the differentiator and the brand story.

---

### P-03…P-05 · `/kitchens/{herzliya-pituach | raanana | petah-tikva}` — branch entity pages

One contract, three instances. These are **entity** pages: exactly three, forever. A fourth may never be added.

- **Search intent:** local verification + local commercial. `קייטרינג איטלקי הרצליה פיתוח`, `מסעדה לאירוע פרטי רעננה`, `קייטרינג פתח תקווה`.
- **Cluster per branch:** Herzliya Pituach = corporate/office density (cluster A) + private dining (B). Raanana = private celebrations + home hosting (`ארוחת שף בבית רעננה`). Petah Tikva = corporate (Gush Dan) + family/holiday.
- **Title pattern:** `קייטרינג איטלקי ב{עיר} | מהמטבח שלנו ב{כתובת קצרה} — מאמא מיה`
- **H1 pattern:** `קייטרינג איטלקי ב{עיר} — מהמטבח שלנו ב{עיר}.`
- **Conversion goal:** `quote_start` with `branch` pre-seeded and visible, **or** the branch WhatsApp handoff. Both write the same lead row with a `path` discriminator.
- **Section order:** `ArticleHero` (branch hero photo, captioned) → `DecisionChecklist` → `BranchFacts` (single-column `ProductionSheet` for this branch only: כתובת / שעות המטבח / מי מנהל / איסוף עצמי / אזור חלוקה / קיבולת ליום) → `KitchensBand` **(ink band, this branch's two photos + `שני המטבחים האחרים` links)** → `EventRows` (ordered per that branch's cluster) → `MenuSheet` (condensed) → `InclusionsExclusions` → `TastingBand` (this branch's address and hours only) → `LimitsBlock` → `PastEvents` (filtered to this branch) → `Faq` (branch-specific: pickup, parking, delivery area, capacity) → `QuoteBuilder` (branch pre-seeded) → `Colophon`.
- **Genuinely unique per branch — the anti-thin-content payload.** A branch page may not ship with fewer than **seven** of these filled:
  1. street address + `PostalAddress` + `geo` + embedded map
  2. branch phone (distinct number; E.164 in `href`, local form displayed)
  3. `openingHoursSpecification` for that kitchen
  4. **named** chef / kitchen manager + their photo (`SLOT.CHEF_{BRANCH}`) — the single highest-leverage E-E-A-T lever available and cheap; a column with no name collapses rather than rendering an anonymous cell
  5. two captioned photographs shot **in that kitchen** (caption carries the hour)
  6. that branch's production capacity per day
  7. self-pickup offered? minimum? pickup hours?
  8. that branch's delivery area + drive times
  9. that branch's `sameAs` GBP URL
  10. loading/parking logistics for pickup
  11. what that branch is realistically best suited for
- **Thin-content test (mechanical, enforced in review):** *swap the city name in the body copy — if the page still reads correctly, it is a doorway page and must not ship.* Shared stock photography across the three defeats the entire differentiator.
- **Links out:** `/kitchens`, the other two branch pages, `/menus`, the 2–3 event pages matching that branch's cluster, `/quote`.
- **Links in:** `/kitchens`; every `KitchensBand` caption on every route; **that branch's GBP `website` field** (not the homepage — this is the highest-leverage GBP setting available, with its own UTM per branch).
- **Schema:** `Restaurant` (**not** bare `LocalBusiness`) with `@id: {DOMAIN}/kitchens/{slug}#kitchen`, `name`, `address` (`PostalAddress`), `geo`, `telephone`, `openingHoursSpecification`, `servesCuisine: "Italian"`, `hasMenu: {DOMAIN}/menus`, `sameAs: [GBP URL]`, `parentOrganization: {DOMAIN}/#org`; plus `BreadcrumbList`. **Omit `priceRange` entirely** — never emit the design reference's `"priceRange": "{{PRICE_RANGE}}"` placeholder, and never fill it with a guess.
- **GBP coupling (not a code change, but it belongs in this spec):** add a **secondary** category `Caterer / ספק מזון ושתייה לאירועים` to each existing restaurant profile. Do **not** change the primary category away from Italian restaurant, and do **not** create a fourth "מאמא מיה קייטרינג" profile at an existing address — it risks merge/removal of profiles the restaurants depend on. Assign each profile a **non-overlapping primary** service radius so the three do not proximity-filter each other.

---

### P-06 · `/catering` — service hub

- **Search intent:** orientation. Also the internal-linking spine.
- **Cluster:** `קייטרינג איטלקי`, `קייטרינג מאמא מיה`.
- **Title:** `קייטרינג לאירועים | מאמא מיה — שלושה מטבחי מסעדה`
- **H1:** `לאיזה אירועים אנחנו נכנסים`
- **Conversion goal:** `event_page_click`. This hub has no builder; it has one text CTA to `/quote`.
- **Section order:** `ArticleHero` (no photo) → `EventRows` (full set, one paragraph + tag row + one stated limit each) → `InclusionsExclusions` → `LimitsBlock` → `Faq` (4 cross-cutting items) → `Colophon`.
- **Unique:** the full event-row set with per-row logistical paragraphs.
- **Links out:** every `/catering/*` page, `/urgent`, `/pasta-bar`, `/menus`, `/quote`.
- **Links in:** header nav; every event page (breadcrumb + "עוד סוגי אירועים"); home.
- **Schema:** `CollectionPage` + `BreadcrumbList`.

---

### P-07 · `/catering/business` — קייטרינג לחברות **(register: operational)**

**This is the #1 page to build and the #1 campaign to fund.** Herzliya Pituach sits inside Israel's densest tech-office district, the flagship kitchen is in it, and the SERP for `מגשי אירוח הרצליה פיתוח` is held by delivery aggregators and sandwich vendors — no premium restaurant brand owns it. Repeat orders make LTV a multiple of a one-off simcha, so a mediocre CPA here is still the best CPA in the account.

- **Search intent:** transactional, high-frequency, low-drama. An office manager who needs platters on a date.
- **Cluster A:** `מגשי אירוח`, `מגשי אירוח לחברות`, `מגשי אירוח משלוח`, `כיבוד לישיבות`, `כיבוד לישיבת הנהלה`, `קייטרינג לחברות`, `קייטרינג לכנס`, `קייטרינג להשקה`, + geo variants `מגשי אירוח הרצליה פיתוח / רעננה / פתח תקווה`, and spelling variants `קיטרינג / קטרינג / מגשי כיבוד / מגש אירוח`.
- **Title:** `מגשי אירוח וקייטרינג לחברות בהרצליה פיתוח | מאמא מיה — מטבח מסעדה`
- **H1:** `ארוחת צוות שמגיעה בשעה שאמרנו, ומחזירה את כולם לעבודה.`
- **Conversion goal:** structured `quote_submit`. Corporate converts on a form plus email follow-up, not on a phone call — but the phone stays visible for same-day.
- **Section order (inverted):**
  1. `ArticleHero` — no large photo above the fold; H1 + one-paragraph standfirst + CTA pair.
  2. `OpsFacts` — **above the fold on mobile.** Four answers an office manager needs before anything else, each a Slot: `שעת קאט־אוף להזמנה להיום {{CUTOFF_TIME}}` · `מינימום {{MIN_PORTIONS_TRAYS}} מנות` · `משלוח עד השולחן — {{DELIVERY_WINDOW}}` · `חשבונית והזמנת רכש — {{PROCUREMENT_TERMS}}`.
  3. `DecisionChecklist`.
  4. `InclusionsExclusions`.
  5. `MenuSheet` — platter-oriented, with `הוסיפו לתפריט שלי`.
  6. `KitchensBand` (ink band; Herzliya first, its office-district proximity stated as a fact, not a boast).
  7. `TastingBand`.
  8. `ProcessSteps` + `TermsStrip` (invoicing, payment terms, recurring orders, `ספק מאושר` onboarding — all Slots).
  9. `LimitsBlock`.
  10. `PastEvents` (corporate rows only).
  11. `Faq` — procurement-shaped: invoicing, ח.פ., recurring orders, dietary coverage (vegetarian / vegan / gluten), fixed delivery windows.
  12. `QuoteBuilder` — `eventType=corporate` pre-seeded, visible, editable; step 5 adds an optional `מספר הזמנת רכש` field.
  13. `Colophon`.
  14. **Anchor** `#gibush` — a short section linking to `/catering/fun-day` while that page is unbuilt.
- **Unique:** the `OpsFacts` block (only this page and `/urgent` render it), the procurement FAQ set, the PO field, the corporate `og:image`.
- **Links out:** `/kitchens/herzliya-pituach` (primary), `/kitchens/petah-tikva`, `/catering/fun-day`, `/pasta-bar`, `/urgent`, `/menus`, `/quote`.
- **Links in:** `/catering`, home `EventRows` (first row), all three branch pages.
- **Schema:** `Service` (`serviceType: "Catering"`, `provider: {DOMAIN}/#org`, `areaServed`, `audience: BusinessAudience`) + `BreadcrumbList` + `FAQPage` for filled questions only. Note honestly: `Service` markup has **no** corresponding Google rich result — it is emitted for entity disambiguation, not for SERP decoration.

---

### P-08 · `/catering/private-events` — שמחות פרטיות ואירוח בבית

- **Search intent:** transactional, considered, emotionally loaded. Also carries the near-empty **private-dining-in-a-real-restaurant** cluster, which is the cheapest cluster in the map because caterer-vs-caterer bidding does not touch it.
- **Cluster B + home hosting:** `מסעדה לאירוע פרטי`, `סגירת מסעדה לאירוע`, `מסעדה לאירוע קטן`, `חדר פרטי במסעדה`, `מקום לאירוע חברה`, `אירוע במסעדה הרצליה פיתוח`, `ארוחת שף בבית`, `אירוח בבית`, `מסיבת יום הולדת במסעדה`.
- **Title:** `אירוע פרטי במסעדה או קייטרינג בבית | מאמא מיה — הרצליה פיתוח, רעננה, פתח תקווה`
- **H1:** `בר מצווה, אירוסין, ברית — עם התפריט שלנו ועם הצוות שלנו בשטח.`
- **Conversion goal:** `quote_submit`, with the service-format question doing the qualifying work.
- **Section order:** `ArticleHero` → `DecisionChecklist` → `ServiceFormats` (three named options as hairline rows: `משלוח והנחה` / `צוות במקום` / `אירוח אצלנו במסעדה` — the third is a revenue line the site does not currently offer at all and is only sellable because three real venues exist) → `KitchensBand` (ink) → `MenuSheet` → `InclusionsExclusions` → `TastingBand` → `ProcessSteps` + `TermsStrip` → `LimitsBlock` → `PastEvents` → `Faq` (staffing, equipment, porcelain, venue capacity, whether the space can be closed off, parking, accessibility) → `QuoteBuilder` (`serviceFormat` surfaced on step 2) → `Colophon`.
- **Unique:** the `ServiceFormats` block, venue-capacity facts per branch, the private-event `og:image`.
- **Links out:** all three branch pages (venue capacity), `/catering/bar-mitzvah`, `/menus`, `/pasta-bar`, `/quote`.
- **Links in:** `/catering`, home, all three branch pages.
- **Schema:** `Service` + `BreadcrumbList` + `FAQPage`.

---

### P-09 · `/catering/bar-mitzvah` — בר מצווה ובת מצווה

- **Search intent:** transactional but long-cycle (3–9 months out) and heavily price-compared.
- **Cluster G:** `קייטרינג לבר מצווה`, `קייטרינג לבת מצווה`, `קייטרינג לברית`, `מחיר מנה בר מצווה`. **`קייטרינג חתונה` is an account-wide negative keyword, not a target** — wedding searchers are 6–12 months out, compare 5+ vendors, demand kashrut, and a restaurant group without a banquet hall loses them at high cost-per-lead.
- **Title:** `קייטרינג לבר מצווה ולבת מצווה | מאמא מיה — מטבח מסעדה איטלקית`
- **H1:** `בר מצווה ובת מצווה — מהמטבח של המסעדה, עם הצוות שלנו בשטח.`
- **Conversion goal:** `quote_submit` with a **long-lead date capture** (the `התאריך עוד לא נקבע` escape is the important control here) plus retargeting eligibility.
- **Section order:** as P-08, with `ServiceFormats` replaced by a `GuestBands` block and `Faq` extended with the kashrut answer verbatim.
- **Kashrut handling — the whole page hangs on it.** Kashrut is asked as a **requested constraint** on builder step 2 (a chip the buyer selects that routes to a human answer), never asserted as a certification. If `SLOT.FAQ_KOSHER` states no certification, this page ships in an explicitly kashrut-agnostic framing and the `ברית` / `שבת חתן` / `חינה` keyword variants are negative-keyworded out rather than targeted. The honest uncertified formulation (only if factually true, owner-signed) is documentation-shaped: `המטבח אינו מחזיק בתעודת הכשר מגורם מוסמך. חומרי הגלם נרכשים מספקים המחזיקים בתעודת הכשר, ואין במטבח בשר חזיר או פירות ים.` The word `כשר` in any inflection may not appear on this page absent a current certificate.
- **Links out:** `/catering/private-events`, `/menus`, branch pages, `/quote`.
- **Schema:** `Service` + `BreadcrumbList` + `FAQPage`.

---

### P-10 · `/catering/shiva` — אירוח שבעה ואזכרה **(register: operational · HARD-GATED)**

**Do not build this page until the kashrut answer exists in writing.** Every ranking result in this cluster leads with `כשר למהדרין` / `בד״ץ` / `גלאט`. Traffic here carries kosher intent and will bounce at a missing badge; building it anyway wastes the build and risks implying a status that does not exist. If the owner cannot answer, the page is **not built** and the cluster is negative-keyworded out.

If it is built, it is likely the highest-intent, lowest-competition entry point available, and it is uniquely well served by the actual differentiator: shiva catering is same-day or next-day, non-negotiable on reliability, and effectively impossible for a ghost kitchen or a venue-renting event company to serve. Three standing kitchens with daily staff is exactly the capability that wins it.

- **Cluster F:** `קייטרינג לשבעה`, `קייטרינג לאזכרה`, `אוכל לשבעה`, `מגשי אירוח לשבעה`, `סעודת אבלים`. **`שבעה` must run phrase/exact match only** — it is homographic with the number seven and broad match will burn budget.
- **Title:** `אוכל לשבעה — משלוח מהמטבח שלנו | מאמא מיה`
- **H1:** `אוכל לשבעה. אנחנו מסתדרים, אתם לא צריכים.`
- **Conversion goal:** `call_click`. Phone-first, one number, staffed hours stated.
- **Page rules (binding, non-negotiable):** no prices anywhere. No `אירוע` / `חוויה` / `לחגוג` vocabulary. No builder, no calculator, no upsell, no cross-sell, no tasting band, no `PastEvents`, no `og:image` of a celebration. One phone number, one WhatsApp, a stated delivery window, and copy written on the assumption that the reader is in the worst week of their life.
- **Section order:** `ArticleHero` (H1 + two sentences + one phone number as the filled primary) → `OpsFacts` (lead time, delivery window, delivery area, minimum — all Slots) → `MenuSheet` (a single short list, no prices) → `Faq` (kashrut verbatim, delivery, disposables, how to order) → `Colophon`.
- **Geo:** run tight around Herzliya Pituach / Raanana secular catchments where dairy or unsupervised platters are acceptable — never nationally.
- **Schema:** `Service` + `BreadcrumbList`. No `FAQPage` unless every answer is filled.

---

### P-11 · `/catering/holidays` — חגים (seasonal template)

- **Search intent:** seasonal transactional, spiking 4–6 weeks pre-חג.
- **Cluster H:** `קייטרינג ראש השנה`, `קייטרינג סוכות`, `קייטרינג שבועות`, `מגשי גבינות שבועות`, `ארוחת שבועות חלבית`, `קייטרינג חנוכה`, `קייטרינג סילבסטר`.
- **The seasonality inversion is the strategic point of this page.** ראש השנה / סוכות is the market's peak. **פסח is a structural revenue hole for a pasta-and-bread kitchen — spend nothing on פסח keywords.** **שבועות is the one holiday where an Italian dairy kitchen is the best-positioned vendor in the entire market** — own `קייטרינג שבועות` and `מגשי גבינות` hard, where competition is thinnest and fit is perfect.
- **Title pattern:** `קייטרינג ל{חג} {{YEAR}} | מאמא מיה — מטבח מסעדה איטלקית` (appending the current year is a category freshness convention: competitors ship `תפריט 2026` in titles).
- **H1 pattern:** `ארוחת {חג} מהמטבח של המסעדה — ארוזה, מסומנת ומוכנה להגשה.`
- **Conversion goal:** `quote_submit` with a hard order-by date.
- **Architecture requirement:** **one reusable route with a date-driven seasonal slot**, not five thin pages. `SEASON` is a config object in `client/src/content/seasons.ts` keyed by an active-window date range: `{ id, nameHe, orderByDate, menuIds, ogImage, active: [from, to] }`. Outside every active window the route renders a short evergreen `החגים אצלנו` page and **does not** render a stale holiday. This is a route-level architecture decision, not a copy decision.
- **Section order:** `ArticleHero` → `OpsFacts` (order-by date, pickup vs delivery, collection hours) → `MenuSheet` (seasonal menu) → `KitchensBand` (ink) → `InclusionsExclusions` → `ProcessSteps` + `TermsStrip` → `Faq` → `QuoteBuilder` → `Colophon`.
- **Schema:** `Service` + `BreadcrumbList`. Emit `Offer.availabilityEnds` only where `orderByDate` is a real owner-signed date.

---

### P-12 · `/catering/fun-day` — ימי גיבוש וימי כיף

- **Search intent:** transactional, HR/office-manager buyer distinct from general corporate.
- **Cluster I:** `קייטרינג ליום גיבוש`, `אוכל ליום גיבוש`, `קייטרינג לימי כיף`, `קייטרינג לסדנת צוות`, `ארוחת צוות`.
- **Title:** `קייטרינג ליום גיבוש ולימי כיף | עמדת פסטה מהמטבח שלנו — מאמא מיה`
- **H1:** `עמדות חיות שהן חצי אוכל וחצי חוויה — פסטה בר, פיצה מהתנור, אנטיפסטי פתוח.`
- **Conversion goal:** `quote_submit`. The form differs: HR buyers convert on `מספר משתתפים`, `תאריך`, `כתובת`, and whether staff come — not on menu browsing.
- **Promotion rule:** may launch as the `#gibush` anchor section inside P-07 and be promoted to its own route once it has (a) real pasta-station operational limits and (b) a distinct photo set. **Do not ship it as P-07 with the words swapped** — that is the doorway pattern.
- **Section order:** `ArticleHero` → `StationsBlock` (per-station operational facts: guest range, power/water/space, whether a cook travels) → `MenuSheet` → `KitchensBand` (ink) → `InclusionsExclusions` → `ProcessSteps` + `TermsStrip` → `LimitsBlock` → `Faq` → `QuoteBuilder` → `Colophon`.
- **Links out:** `/pasta-bar`, `/catering/business`, `/quote`.
- **Schema:** `Service` + `BreadcrumbList`.

---

### P-13 · `/urgent` — קייטרינג להיום **(register: operational)**

- **Search intent:** urgent transactional. Cheapest CPA in the account, converts by phone not by form.
- **Cluster E:** `קייטרינג להיום`, `קייטרינג דחוף`, `מגשי אירוח להיום`, `מגשי אירוח משלוח מהיר`, `קייטרינג ברגע האחרון`, `אוכל מוכן עכשיו`.
- **Title:** `קייטרינג להיום — משלוח מהיר משלושה מטבחים | מאמא מיה`
- **H1:** `צריכים אוכל להיום? שלושה מטבחים זה שלוש הזדמנויות שזה יסתדר.`
- **Conversion goal:** `call_click`. Phone-first, call-only ad variant, WhatsApp second, form third.
- **Absolute rule:** the cutoff time is a Slot and must be the **conservative** owner-signed figure. Winning this cluster and then missing a promised same-day cutoff is a reputational failure with no recovery in a review-driven local market, with three restaurants' names attached. Never publish a cutoff the kitchens cannot hold.
- **Section order:** `ArticleHero` (phone as filled primary, WhatsApp as second, no photo) → `OpsFacts` (cutoff per branch, delivery radius per branch, minimum, delivery window) → `ProductionSheet` (three columns, each with its own phone and WhatsApp) → `MenuSheet` (short — what is genuinely available today) → `Faq` (3 items) → `Colophon`.
- **No builder on this page.** A 4-step form is the wrong instrument for a buyer who needs food in four hours.
- **Schema:** `Service` + `BreadcrumbList`.

---

### P-14 · `/pasta-bar` — עמדת פסטה

- **Search intent:** product-specific transactional, high margin, uniquely credible here.
- **Cluster D:** `דוכן פסטה לאירועים`, `עמדת פסטה`, `פסטה בר לאירועים`, `בר פסטה`, `עמדות שף לאירוע`, `דוכן פסטה אל דנטה`.
- **Title:** `עמדת פסטה לאירועים | לא דוכן שנשכר — קו העבודה שלנו — מאמא מיה`
- **H1:** `עמדת פסטה שהיא לא גימיק. זה מה שהמטבח שלנו עושה כל יום.`
- **Angle (the sharpest expression of "authentic, not glitzy" in the whole keyword map):** everyone else's pasta station is an outsourced station rented in for an event; here it is Tuesday-night line work by cooks who make it for paying restaurant guests daily.
- **Conversion goal:** `quote_submit` with `serviceFormat=station`.
- **Section order:** `ArticleHero` (one captioned photo of the station in the restaurant, not at an event) → `StationsBlock` → `MenuSheet` (the pasta section, cross-linked to the live restaurant menu) → `KitchensBand` (ink) → `InclusionsExclusions` → `Faq` → `QuoteBuilder` → `Colophon`.
- **Links in:** `/catering/fun-day`, `/catering/business`, `/catering/private-events`, home `EventRows`.
- **Schema:** `Service` + `BreadcrumbList`.

---

### P-15 · `/catering/dairy` — קייטרינג חלבי איטלקי

- **Search intent:** research → transactional. Mostly SEO/organic plus a cheap always-on ad group; must not carry the account.
- **Cluster C:** `קייטרינג חלבי`, `קייטרינג חלבי לאירועים`, `קייטרינג חלבי לאירועים קטנים`, `קייטרינג איטלקי`, `קייטרינג גבינות`, `מגשי גבינות`, `בר גבינות לאירוע`.
- **H1:** `קייטרינג חלבי איטלקי — אותו תקציב, שולחן עשיר יותר.`
- **Framing:** dairy is not a limitation, it is the reason the same budget buys a richer table — this is already the Israeli market's own argument, so it is pre-validated with buyers.
- **Conversion goal:** `quote_submit`.
- **Section order:** standard article order, `MenuSheet` promoted above `KitchensBand`.
- **Links out:** `/catering/holidays` (שבועות), `/menus`, `/quote`.
- **Schema:** `Service` + `BreadcrumbList`.

---

### P-16 · `/menus` — התפריטים

- **Search intent:** evaluation. `תפריט קייטרינג`, `תפריט קייטרינג איטלקי`, plus dish-name long tail.
- **Title:** `התפריטים | קייטרינג מאמא מיה — בלי אותיות קטנות`
- **H1:** `התפריטים, בלי אותיות קטנות`
- **Conversion goal:** `add_to_brief` — the PII-free dish-level micro-commitment that seeds the builder. This is the best top-of-funnel mechanic in the whole system.
- **Section order:** `ArticleHero` (no photo) → `MenuSheet` ×3 in full (each with `מתאים ל:` footer line and `הוסיפו לתפריט שלי` per row) → `InclusionsExclusions` → `TastingBand` → `LimitsBlock` (dietary and allergen reality) → `Faq` (dietary, allergens, substitutions) → `QuoteBuilder` (pre-seeded with the accumulated brief) → `Colophon`.
- **Price handling.** `SLOT.PRICE_1..3` unfilled ⇒ the price line does not render and the menu ships as an inclusions list — which reads as a legitimate chef's-menu convention, not as an unfinished page. Filled ⇒ the qualifier ships at the **same type size, directly above the number**: `נקודת פתיחה לסועד, בהזמנה מ־{{MIN_GUESTS}} סועדים, כולל מע״מ, לא כולל צוות והובלה.` A grey footnote under a large bold figure fails the reasonable-consumer test. Never a single computed total, never adjacent to any word that could read as acceptance.
- **Cross-linking:** every dish that is also on a live restaurant menu links to its restaurant-menu counterpart. This is what makes `בואו לטעום הערב` a checkable offer rather than a slogan, and it renders only where `SLOT.LIVE_MENU_URL_{branch}` and per-dish catering availability are both confirmed.
- **Print:** sections 1–3 print as a single-colour A4 menu a branch can hand a walk-in. One media query.
- **Deferred:** `/menus/:menu` sub-routes. Not built until there is enough per-menu content to survive the thin-content test.
- **Schema:** `Menu` with `hasMenuSection` → `MenuItem`. Emit `MenuItem.offers.price` **only** where a real owner-signed price exists; otherwise omit `offers` entirely. `BreadcrumbList`.

---

### P-17 · `/quote` — קבלת הצעה

- **Search intent:** navigational/intentional. Also the destination for every "get a quote" link in email, WhatsApp and print.
- **Title:** `בקשת הצעה לקייטרינג | 4 שאלות — מאמא מיה`
- **H1:** `בואו נבנה את האירוע שלכם`
- **Conversion goal:** `quote_submit`. This is the only page whose sole purpose is the builder.
- **Section order:** `ArticleHero` (compressed: H1 + one sentence) → `QuoteBuilder` (full width, step 1 visible immediately) → `TermsStrip` → `TastingBand` → `Colophon`.
- **Pre-seeding:** accepts `?event=`, `?branch=`, `?guests=`, `?menu=` from any inbound link. **A pre-seeded value stays visible and editable, never hidden** — otherwise a forwarded `/quote?event=wedding` link silently writes a wrong lead field.
- **Links in:** every route's primary CTA when the current page has no in-page builder; header CTA; GBP; ads.
- **Schema:** `ContactPage` + `BreadcrumbList`.

---

### P-18 · `/thanks` — אישור פנייה

- **Not a thank-you message. A conversion stage.** The current implementation shows a toast and calls `form.reset()`, leaving the buyer with an empty form and nothing to show anyone.
- **URL:** `/thanks?ref=MM-XXXXXX`. A real URL change is required — without it no analytics platform can record a conversion, no matter which one is later installed.
- **Robots:** `noindex, follow`. Excluded from sitemap.
- **Content, in order:** their brief echoed back verbatim → the reference code (`MM-7F3K2Q`, monospace-adjacent tabular figures, selectable) → who will contact them, through which channel, and within what time (`SLOT.RESPONSE_TIME`) → **which kitchen the enquiry went to**: `הפנייה נשלחה למטבח ב{סניף}` → a dominant `המשך בוואטסאפ` button opening the thread pre-filled with the brief and the ref code → the tasting invitation with that branch's address and hours → `שמרו או שלחו הלאה` → `/summary?ref=`.
- **Conversion goal:** `whatsapp_handoff` **and** `summary_share`. The shareable summary is a conversion feature disguised as a nicety: the person the buyer forwards it to is a second click we would otherwise never get.
- **Schema:** none.

---

### P-19 · `/summary` — סיכום אירוע (forwardable artifact)

- **URL:** `/summary?ref=MM-XXXXXX`. Deliberately a **query param, not a Hebrew path** — the ref code is read aloud on the phone and pasted into WhatsApp. Rendered **client-side from confirmation state** in Phase 1; promoted to a server-rendered persisted route only when lead volume justifies it, and with an ASCII slug when it is.
- **Robots:** `noindex, nofollow`. Excluded from sitemap.
- **Register:** it must read as a **menu card, not an invoice.** A document that looks like a quote invites price negotiation; a document that looks like a menu invites approval. This is the single most important formatting decision on the page.
- **Content:** ref code + date · the buyer's own spec echoed back (event type, guests, date, area) · the selected dishes as a menu card · itemised `מה כלול` and `מה לא כלול` · the commercial-terms strip · **the address of the kitchen that will cook it** · one phone and one WhatsApp.
- **Print:** `@page` A4 margins, grain layer off, nav and sticky bar hidden, `break-inside: avoid` on rows, `print-color-adjust: exact` so hairlines survive, ref code and kitchen address in the top block.
- **Schema:** none.

---

### P-20…P-22 · `/privacy`, `/terms`, `/accessibility`

- **Search intent:** none. These exist for legal reachability, corporate procurement, and regulatory duty.
- **Robots:** `index, follow` (a policy that cannot be reached discharges no disclosure duty), but excluded from every internal CTA path.
- **Links in:** the `Colophon` on **every** route, via wouter `<Link>`, plus a policy link inside the form's collection notice itself — footers are not where a person about to hand over a phone number looks.
- **Architectural requirements owned by this spec** (content is spec `05-*`):
  - Every legal-identity field is a **build-blocking** Slot: `<Slot id="legal-entity" blocking />` renders `[למילוי: שם החברה הרשום ומספר ח.פ.]` in dev and **throws at build time in production**. The same entity string must appear identically in `/terms`, `/privacy` and the collection notice — three different names is itself a finding.
  - The registered-entity address is a **different fact** from any branch address and must not be sourced from `locations.ts`.
  - `/accessibility` must name a real רכז נגישות with a phone, email and postal address, state the standard actually targeted (ת״י 5568 / WCAG 2.1 AA), and openly list what is **not** yet conformant with a target date. Publishing a rewritten statement that still contains an unverified claim is worse than publishing none.
- **Schema:** `WebPage` + `BreadcrumbList`.

---

### P-23 · `/admin/leads` — לידים (protected)

- **Auth:** the existing `requireAdmin` in `server/routes.ts` (bearer `ADMIN_TOKEN`, ≥24 chars, route disabled when unset). The client page prompts for the token, holds it in `sessionStorage` only, and sends `Authorization: Bearer`. Issue **one token per person** so the logged token fingerprint identifies a human.
- **Robots:** `noindex, nofollow` + `Disallow: /admin` in `robots.txt`. Excluded from sitemap. Lazy-loaded; must never appear in the shared chunk.
- **It is a WORKLIST, not a report.** The binding constraint on the whole measurement layer is human data entry: a restaurateur will not log into a dashboard to mark leads. Layout, top to bottom:
  1. `לידים שממתינים לסטטוס` — two-tap `נסגר` / `אבוד` / `נשלחה הצעה` + one ₪ field, and a visible `X לידים לא מסומנים` counter so decay is obvious rather than silent.
  2. `פניות וואטסאפ ללא התאמה — 72 שעות אחרונות` — each showing the prefill summary so a human can attach a real conversation to the time-proximate intent.
  3. One aggregate table: `ערוץ | פניות | איכותיות | הצעות | נסגרו | ₪ שנסגר | ₪ לפנייה | % סגירה`.
- **Statistical discipline (architectural, not cosmetic):** default to a rolling 90-day window, aggregate at **channel** level not campaign level, and **suppress any ratio whose denominator is under 10** — render `—`. Showing "33% close rate" off 3 leads is how an owner makes a bad budget decision.
- **Access must be paginated and `since=`-filterable** so a routine view returns recent leads rather than the entire history, and every access is logged as `timestamp + sha256(token)[0:8] + req.ip + record count` — never field values.
- **Schema:** none.

---

### P-24 · `/404`

- Hebrew, RTL, inside `SiteLayout` (the current page ships English developer copy — "did you forget to add the page to the router" — on an LTR card with no header, footer, or route back in).
- Content: `לא מצאנו את הדף הזה.` + links to `/`, `/menus`, `/kitchens`, plus one phone link and one WhatsApp button. A 404 on a lead-gen site is a recovery page, not a dead end.
- Server returns HTTP 404 for unmatched non-`/api` paths. **Add an `/api`-scoped JSON 404 before the static fallback** — `server/vite.ts:82-84` currently returns `index.html` with HTTP 200 for any unmatched `/api/*`, which will break client error handling as the API grows.

---

### P-25 · `/areas/:city` — service-area pages (demand pages, gated)

- **Distinct page type from a kitchen page and must never be confused with one.** There are exactly three restaurants; a page titled for any other city may **not** imply a local kitchen.
- **Copy contract:** branch pages say `המסעדה שלנו ב{עיר} — {כתובת}`. Area pages say `קייטרינג ל{עיר} — מוגש מהמטבח שלנו ב{סניף}, כ־{{DRIVE_MINUTES}} דקות נסיעה.`
- **Gate — all four required before a city page exists:** owner-signed drive time from the serving branch, that area's minimum order, that area's delivery fee, and one genuinely area-specific fact. Absent any of them, the city is not built. Populating a delivery radius by inference from a map is forbidden.
- **Candidate cities (Phase 4, in order):** Kfar Saba, Hod Hasharon, Ramat Hasharon, Tel Aviv. **Hard cap: no city page may be created solely because a competitor has one.** 5 occasions × 8 cities = 40 pages is the trap; the occasion×city matrix is not built.
- **Head-term expectation setting:** `b144`, `easy`, `rest` and vendor city pages with years of authority hold `קייטרינג + עיר`. Do not measure this page type on the head term. The winnable queries are differentiator-shaped long tail.
- **Section order:** `ArticleHero` → `AreaServed` (serving branch, drive time, minimum, fee, delivery window) → `DriveTimeTable` (this area's row highlighted) → `MenuSheet` (condensed) → `KitchensBand` (ink; the serving branch first) → `InclusionsExclusions` → `Faq` → `QuoteBuilder` (area pre-seeded) → `Colophon`.
- **Schema:** `Service` with `areaServed: City` + `provider` → org `@id` + `BreadcrumbList`. **No `Restaurant` node.** Emitting one would assert a premises that does not exist.

---

### P-26 · `/lp/:campaign` — paid landing pages

- **Separate tree, `noindex, nofollow`, excluded from sitemap, no internal links pointing in.** This is what lets aggressive conversion-focused variants be A/B tested without diluting the crawlable site with near-duplicate thin pages or forcing canonical gymnastics.
- Built from the same components and tokens. Free to reorder sections and drop the article register entirely.
- Every LP still carries INV-6 (collection notice inside the form) and every INV-2 Slot rule. Compliance is not relaxed on paid pages.

---

## 4. Avoiding thin duplicate content

The multi-page requirement is also the largest single risk in this build. Thirteen routes generated from one template with the city or occasion swapped are read as doorway content by Google **and** score badly on Google Ads landing-page experience simultaneously — wiping out the entire multi-page advantage. Uniformity of *design* is the brand asset; uniformity of *content* is the failure.

### 4.1 The shared/unique contract

**Shared across every page — identical bytes, one source, never rewritten per page:**

| Shared | Source of truth |
|---|---|
| Header, `Colophon`, skip link, `<main>` | `SiteLayout` |
| Design tokens, grain, motion primitive | `client/src/index.css` |
| `InclusionsExclusions` rows | `client/src/content/inclusions.ts` |
| `TermsStrip` (deposit, cancellation, headcount deadline) | `client/src/content/legal.ts` |
| `ProcessSteps` (4 steps) | `client/src/content/process.ts` |
| `LimitsBlock` base rows | `client/src/content/limits.ts` |
| Branch facts, addresses, hours, chefs, phones | `client/src/data/locations.ts` |
| Collection notice, marketing-consent label | `client/src/content/legal.ts` |
| Allergen statement, VAT line, price qualifier | `client/src/content/legal.ts` |
| Menu dish data | `client/src/data/menus.ts` |

**Unique per page — mandatory minimum. A page fails review with fewer than five filled:**

1. `<h1>` — never a template with one word substituted
2. standfirst / lede — different argument, not different adjectives
3. hero photograph + its caption (the caption alone carries branch, street, action, hour)
4. `og:image` at 1200×630 — because these links are forwarded on WhatsApp, and a shared link showing the wrong branch undercuts the local claim
5. the `Faq` set — different questions, not reordered ones
6. the `EventRows` / `MenuSheet` ordering and selection
7. `title` + `description`
8. one page-type-exclusive block: `OpsFacts` (P-07, P-10, P-13), `ServiceFormats` (P-08), `StationsBlock` (P-12, P-14), `AreaServed` (P-25), `BranchFacts` (P-03…05), `DriveTimeTable` (P-02, P-25)
9. `PastEvents` filtered to that page's event type or branch

### 4.2 Mechanical tests, enforced

- **T-1 · Swap test.** Substitute the city (or occasion, or competitor name) in the page's unique copy. If the page still reads correctly, it is thin. Reject.
- **T-2 · Unique-string ratio.** A route's unique copy must be ≥ 35% of its total rendered Hebrew text. Scripted in CI: render each route to text, diff against the union of shared content modules, fail below threshold.
- **T-3 · Title/description uniqueness.** No two routes may share a `title` or `description`. Derived from `shared/routes.ts`, asserted in a unit test.
- **T-4 · Canonical self-reference.** Every indexable route's canonical points at itself. No cross-canonicals; if two pages need one canonical, one of them should not exist.
- **T-5 · One ink band.** INV-3, asserted per route.
- **T-6 · Photo caption coverage.** Every `<img>` reachable in a route has a non-empty caption. INV-1.

### 4.3 Internal linking — hub-and-spoke, no footer carpet

- Two hubs: `/catering` (occasions) and `/kitchens` (entities). Bidirectional contextual links: hub → spoke → hub.
- **Every event page links to the specific kitchen that would execute it, and every kitchen page links to the occasions it is genuinely suited for** — in body copy, with varied natural Hebrew anchor text, not in a nav block.
- Area pages are linked from **both** parents (`/kitchens/{serving branch}` and `/catering`).
- **The `Colophon` lists the three real branches only.** A footer enumerating every served city on every page is a textbook doorway/keyword-stuffing signal and is exactly what a template will do by default.
- `BreadcrumbList` on every non-home indexable route.

---

## 5. Routing plan (wouter) and component decomposition

### 5.1 Prerequisite — the per-route head layer is a hard blocker

**Do not build a single page in §3 until this exists.** The app is currently a single-HTML SPA: `server/vite.ts` `serveStatic()` ends with `app.use("*", …) res.sendFile(index.html)`, and `client/index.html` hardcodes one `<title>`/`<meta description>`/`og:` block. There is no `react-helmet` or equivalent. Every route in this spec would ship byte-identical head tags and no canonical, Google would treat them as duplicates, and the entire multi-page effort would return nothing.

It is also a **lead-generation** requirement, not just SEO: WhatsApp and Facebook link-preview crawlers do not execute JavaScript, so client-injected `og:` tags produce no preview card. Every WhatsApp-forwarded link to a branch or occasion page would render as a bare grey URL and lose the click.

```
shared/routes.ts            ← single source of truth (plain TS, NO drizzle import)
  export type RouteDef = {
    path: string;                    // wouter pattern, e.g. "/kitchens/:slug"
    id: string;                      // "P-03"
    titleHe: string;
    descriptionHe: string;
    ogImage: string;                 // "/og/kitchens-herzliya.jpg"
    robots: "index" | "noindex";
    inSitemap: boolean;
    changefreq?: string;
    register: "article" | "operational";
    schema: SchemaKind[];            // ["Restaurant","BreadcrumbList"]
    breadcrumb: { labelHe: string; path: string }[];
  };

server/seo/head.ts          ← reads shared/routes.ts, string-injects <title>,
                              <meta name=description>, <link rel=canonical>,
                              og:*, twitter:*, robots and the page's JSON-LD into
                              the index.html template before send.
                              Mirrors the existing template.replace() pattern
                              already used in server/vite.ts.
server/seo/sitemap.ts       ← GET /sitemap.xml generated from shared/routes.ts
client/public/robots.txt    ← Disallow: /admin, /lp, /thanks, /summary
                              Sitemap: {DOMAIN}/sitemap.xml
```

Build-time prerendering is the better end state and should be planned for Phase 3; the string-injection layer is what unblocks Phase 1–2. Without prerendering, all Hebrew copy is invisible to crawlers that do not execute JS.

### 5.2 `App.tsx`

```tsx
import { Switch, Route } from "wouter";
import { DirectionProvider } from "@radix-ui/react-direction";
import { lazy, Suspense } from "react";
import SiteLayout from "@/layouts/site-layout";
import RouteShellSkeleton from "@/layouts/route-shell-skeleton";
import { useHashScroll } from "@/hooks/use-hash-scroll";

const Home            = lazy(() => import("@/pages/home"));
const Kitchens        = lazy(() => import("@/pages/kitchens"));
const KitchenBranch   = lazy(() => import("@/pages/kitchen-branch"));
const CateringHub     = lazy(() => import("@/pages/catering-hub"));
const Business        = lazy(() => import("@/pages/catering-business"));
const PrivateEvents   = lazy(() => import("@/pages/catering-private-events"));
const BarMitzvah      = lazy(() => import("@/pages/catering-bar-mitzvah"));
const Shiva           = lazy(() => import("@/pages/catering-shiva"));
const Holidays        = lazy(() => import("@/pages/catering-holidays"));
const FunDay          = lazy(() => import("@/pages/catering-fun-day"));
const Dairy           = lazy(() => import("@/pages/catering-dairy"));
const Urgent          = lazy(() => import("@/pages/urgent"));
const PastaBar        = lazy(() => import("@/pages/pasta-bar"));
const Menus           = lazy(() => import("@/pages/menus"));
const Quote           = lazy(() => import("@/pages/quote"));
const Thanks          = lazy(() => import("@/pages/thanks"));
const Summary         = lazy(() => import("@/pages/summary"));
const Area            = lazy(() => import("@/pages/area"));
const Lp              = lazy(() => import("@/pages/lp"));
const Privacy         = lazy(() => import("@/pages/privacy"));
const Terms           = lazy(() => import("@/pages/terms"));
const Accessibility   = lazy(() => import("@/pages/accessibility"));
const AdminLeads      = lazy(() => import("@/pages/admin-leads"));
const NotFound        = lazy(() => import("@/pages/not-found"));

export default function App() {
  useHashScroll();                       // §5.4
  return (
    <DirectionProvider dir="rtl">       {/* §5.5 — must land with the left-4→end-4 revert */}
      <SiteLayout>                       {/* Header + Footer OUTSIDE Suspense */}
        <Suspense fallback={<RouteShellSkeleton />}>
          <Switch>
            <Route path="/"                            component={Home} />
            <Route path="/kitchens"                    component={Kitchens} />
            <Route path="/kitchens/:slug"              component={KitchenBranch} />
            <Route path="/catering"                    component={CateringHub} />
            <Route path="/catering/business"           component={Business} />
            <Route path="/catering/private-events"     component={PrivateEvents} />
            <Route path="/catering/bar-mitzvah"        component={BarMitzvah} />
            <Route path="/catering/shiva"              component={Shiva} />
            <Route path="/catering/holidays"           component={Holidays} />
            <Route path="/catering/fun-day"            component={FunDay} />
            <Route path="/catering/dairy"              component={Dairy} />
            <Route path="/urgent"                      component={Urgent} />
            <Route path="/pasta-bar"                   component={PastaBar} />
            <Route path="/menus"                       component={Menus} />
            <Route path="/quote"                       component={Quote} />
            <Route path="/thanks"                      component={Thanks} />
            <Route path="/summary"                     component={Summary} />
            <Route path="/areas/:city"                 component={Area} />
            <Route path="/lp/:campaign"                component={Lp} />
            <Route path="/privacy"                     component={Privacy} />
            <Route path="/terms"                       component={Terms} />
            <Route path="/accessibility"               component={Accessibility} />
            <Route path="/admin/leads"                 component={AdminLeads} />
            <Route                                     component={NotFound} />
          </Switch>
        </Suspense>
      </SiteLayout>
    </DirectionProvider>
  );
}
```

Removed from the current shell: `QueryClientProvider`, `TooltipProvider`, `Toaster`, and the globally mounted `AccessibilityToolbar`. React Query exists solely for one POST; there are no tooltips in the marketing UI; the success message becomes inline form state (better UX — a toast on mobile is easy to miss at the highest-anxiety moment in the funnel); and the accessibility overlay is deleted rather than repaired (§5.6).

`KitchenBranch` and `Area` are **parameterised pages, not templates with substituted words** — each reads its unique copy from `client/src/content/kitchens/{slug}.ts` and `client/src/content/areas/{city}.ts`, which are authored files, not generated ones. That distinction is the difference between three entity pages and three doorway pages.

### 5.3 Chunking and preloading

- `React.lazy` per route with **one** `Suspense`. Header, `Colophon` and the mobile sticky CTA bar stay **outside** the boundary — wouter's `<Switch>` unmounts the outgoing route immediately, so only the body may swap, and the fallback must be a fixed-height skeleton matching the route shell so CLS stays 0.
- wouter has no route preloading. Export each lazy module's loader as a named function and call it from `onPointerEnter` / `onTouchStart` / `onFocus` on `<Link>`; `requestIdleCallback`-prefetch `/quote` and `/catering/business` after LCP fires.
- Pin a `framework` chunk via `build.rollupOptions.output.manualChunks` so the shell hash is stable across content-only deploys — otherwise adding one section rehashes vendor code and evicts it from every returning visitor's cache.
- Set `experimentalMinChunkSize ≈ 4000`. A whole RTT for a 269-byte chunk is a net loss on cellular.
- **Route-level splitting always. Section-level splitting only when a single route chunk exceeds 14 KB gzip**, and then the split point is the fold: header, hero and the primary CTA stay static; gallery, FAQ and `PastEvents` go behind `lazy()` + IntersectionObserver with `rootMargin: 200px`. **Never lazy-load the builder on a landing route** — it is the conversion path.

### 5.4 Hash navigation

Every hash CTA from a non-home route currently fails silently: `header.tsx:40,60,104,127` do `window.location.href = "/#" + id` (a full page reload that also discards the SPA and re-downloads the bundle), there is no hash handler anywhere in `client/src`, and wouter ignores fragments entirely.

`useHashScroll()` must: read `location.hash` on mount and on every route change, wait one `requestAnimationFrame` for layout, scroll the target into view respecting `prefers-reduced-motion`, and move focus to the target for keyboard users. All anchor targets get `scroll-margin-top` clearing the fixed header — otherwise the header covers the heading the user just jumped to.

### 5.5 RTL infrastructure (blocking, and must land as one commit)

- `DirectionProvider dir="rtl"` at the root. Radix primitives read direction from their own `dir` prop or this provider and **do not** read `document.dir` or `<html dir="rtl">`; without it, arrow-key navigation and positioning in Select, DropdownMenu, Tabs, ToggleGroup and Slider all operate LTR while the page is RTL.
- **In the same commit**, revert the hand-flipped physical `left-4` close buttons in `ui/dialog.tsx:41` and `ui/alert-dialog.tsx:37` to logical `end-4`. Landing the provider without reverting them double-flips them.
- Ban `ml-*`, `mr-*`, `pl-*`, `pr-*`, `left-*`, `right-*`, `text-left`, `text-right`, `border-l`, `border-r`, `rounded-l`, `rounded-r`, `float-left`, `float-right`, `space-x-*`, `divide-x-*` in `client/src` via lint. `space-x-*` emits physical margins: in an RTL row there is **no gap between the first two visual items** and a phantom gap at the trailing edge. Use `gap`.
- CI regex `/\d\s*[–—]\s*\d/` over all Hebrew string literals — an en-dashed numeric range **reverses visually** in RTL (`25–200 סועדים` renders as `200–25`), which on a guest-count or budget field is a consumer-facing misstatement, not a cosmetic bug. Ranges ship as `בין X ל־Y` or wrapped in `<span dir="ltr">`. `<bdi>` alone does **not** fix it.
- CI check rejecting U+0600–U+06FF in `client/src` — two Hebrew strings currently contain Arabic-script characters (`sections/blog.tsx:13`, `data/faq-data.ts:11`), which recurs whenever Hebrew is pasted through a mixed-script source.

### 5.6 Component decomposition

```
client/src/
  layouts/
    site-layout.tsx           SkipLink · <header> · <main id="main"> · <footer> · GrainLayer · StickyCtaBar(mobile)
    route-shell-skeleton.tsx  fixed-height Suspense fallback, CLS-safe
  components/
    primitives/
      slot.tsx                <Slot id blocking? unit="clause|row|cell|section">   INV-2
      fact.tsx                <Fact value sourceLabel> → "3 מטבחים · כתובות בסעיף 04"
      photo.tsx               <Photo src? caption(REQUIRED) ratio alt>             INV-1
      ltr.tsx                 <Ltr> for ranges, phones, emails, URLs
      num.tsx                 tabular-nums wrapper; .shekel at 1.15em
      hairline-table.tsx      1px --line rules, no zebra, th{text-align:start},
                              own overflow-x:auto container, collapses to a
                              menu-style list when values are unfilled
      wa-button.tsx           waLink(pageKey, branch, context) — never a bare wa.me href
      cta-pair.tsx            one filled + one ghost                              INV-4
      section-head.tsx        numeral eyebrow (01–13) + serif h2
    sections/
      article-hero.tsx        dateline · h1 · lede · Photo · CtaPair · FactLine
      decision-checklist.tsx  mobile in-page nav; renders only filled targets
      kitchens-band.tsx       THE ink band                                        INV-3
      branch-facts.tsx        single-branch fact table (P-03…05)
      production-sheet.tsx    three-column fact table + per-branch WaButton
      drive-time-table.tsx
      event-rows.tsx          hairline rows, self-routing, one stated limit each
      menu-sheet.tsx          dish rows: grid 1fr auto, 1px dotted leader,
                              desc ≤12 words / 17em, tnum price cell,
                              "הוסיפו לתפריט שלי", live-menu cross-link
      inclusions-exclusions.tsx
      limits-block.tsx        "מה אנחנו לא עושים"
      ops-facts.tsx           cutoff · minimum · delivery window · procurement
      service-formats.tsx
      stations-block.tsx
      tasting-band.tsx
      process-steps.tsx       4 steps + TermsStrip
      terms-strip.tsx         deposit · cancellation · headcount deadline
      past-events.tsx         collapse-when-empty; consentRef required to render
      faq.tsx                 Radix Accordion; FAQPage JSON-LD for filled only
      quote-builder.tsx       §5.7
      colophon.tsx            footer
      area-served.tsx
  content/                    authored copy + slots, one module per page
    slots.ts  legal.ts  inclusions.ts  limits.ts  process.ts  seasons.ts
    kitchens/{herzliya-pituach,raanana,petah-tikva}.ts
    areas/{city}.ts
  data/
    locations.ts              THE NAP source of truth (3 branches)
    menus.ts
  config/
    business.ts               WA_NUMBER · TEL · EMAIL · DOMAIN — build fails if unset
  hooks/
    use-hash-scroll.ts  use-reveal.ts  use-scrolled-past.ts  use-add-to-brief.ts
  lib/
    whatsapp.ts               openWhatsApp() — commit-before-redirect, no await
    schema-jsonld.ts          builders per SchemaKind
    analytics.ts              typed event union; a new page cannot invent event names
shared/
  routes.ts                   route manifest — plain TS, no drizzle
  lead-schema.ts              zod, no drizzle (client-safe)
```

**Deleted, not refactored:** `ui/accessibility-toolbar.tsx` + `hooks/use-accessibility.tsx` (the overlay produces no conformance, inverts every food photograph, makes `html` a containing block that repositions fixed descendants and kills `backdrop-filter`, overrides the user's own browser font size, ships 7 `console.log`s, and is itself the least accessible component in the codebase — it is net-negative, and deleting it must land in the **same** change as the contrast/focus/form fixes so it does not read as a regression). Also deleted: `sections/testimonials.tsx`, `sections/price-calculator.tsx`, `sections/blog.tsx`, `pages/blog-list.tsx`, `pages/blog-post.tsx`, `pages/home-simple.tsx`, `data/blog-data.ts`, `data/gallery-data.ts`, `lib/queryClient.ts`, and the 35–36 unreachable `components/ui/*` files (worth ~7.3 KB gzip of CSS via Tailwind's content globs — **not** JS, which is already tree-shaken).

**Keep:** `ui/button.tsx`, `ui/input.tsx`, `ui/label.tsx`, `ui/textarea.tsx`, `ui/card.tsx`, `ui/accordion.tsx`, `ui/dialog.tsx`, `lib/utils.ts`, `main.tsx`.

### 5.7 `QuoteBuilder` — the one conversion component

Four questions plus contact. PII confined to the final step. It is one component, used on eight routes, pre-seeded per route.

| Step | Question | Control | PII |
|---|---|---|---|
| 1 | `איזה אירוע?` | chips, max 6 | no |
| 2 | `כמה סועדים, בערך?` | bands `פחות מ־25 / 25–50 / 50–100 / 100–200 / 200 ומעלה` (rendered bidi-safe) | no |
| 3 | `מתי?` | RTL-aware date picker + `התאריך עוד לא נקבע` | no |
| 4 | `איפה?` | area chips; the UI answers by **naming the serving kitchen** | no |
| 5 | `לאן נחזור אליכם?` | `שם` (`autoComplete="name"`), `טלפון` (`dir="ltr"` + `text-right`, `inputMode="tel"`, `autoComplete="tel"`), channel toggle, optional collapsed email, one **unchecked optional** marketing consent | yes |

Binding rules:
- **No budget question.** Guests × event type × area predicts budget well enough for the sales call; asking a private host to self-declare a budget before they trust you reads as being qualified-out and is the likeliest abandonment point.
- **Guest bands, not a number input.** The buyer genuinely does not know, and the current client/server mismatch (`max="500"` client, 5000 server) silently tells a 600-guest buyer we cannot help.
- **Zero required checkboxes.** No "I accept the privacy policy" gate — Israeli law does not require one, it is widely mis-sold as a תיקון 13 requirement, and it costs a click for no legal protection. The checkbox that *is* needed is the separate, unchecked, optional marketing opt-in (חוק הספאם exposure — up to ₪1,000 statutory damages per message — dwarfs the privacy-law exposure). Persist `consentMarketing`, `consentMarketingAt`, `noticeVersion`.
- **Collection notice inside the component**, above submit, as a required prop. INV-6.
- **Progress reads `שאלה 2 מתוך 4`**, not a percentage, and any progress bar fills **right-to-left** — a left-filling bar reads as regressing.
- **Answers echo into a visibly growing brief card.** Partial answers persist to `localStorage` and to the server as an anonymous draft keyed by UUID; **no PII may enter a draft payload** and nothing is sent before the consent state is set.
- Pre-seeded values stay **visible and editable**.
- Free-text `פרטים נוספים` moves **after** submission, onto the confirmation view, as optional enrichment. Its current placeholder actively solicits `אלרגיות` — one word that reclassifies a marketing lead table as a health database under תיקון 13's expanded sensitive-data definition. Replace with `ספרו לנו על האירוע — מקום, אופי, מה חשוב לכם` and collect dietary data after booking, over the operational channel, into the event file.
- Errors: focus moves to the first invalid field, a `role="alert"` summary above the form links to each bad field, and the server-failure path renders a **persistent inline** `role="alert"` beside submit — not a transient toast — preserving entered values.
- Terminates in `/thanks?ref=` and a WhatsApp handoff. `openWhatsApp()` fires the lead POST `keepalive` **without awaiting** and navigates in the **same synchronous tick** — an `await` before the open is blocked as a popup on iOS Safari, and `sendBeacon`/`fetch(keepalive)` from `unload`/`pagehide` is documented as unreliable on iOS. Never a bare `wa.me` href; never a computed ₪ figure in the prefill text (a number in a WhatsApp message is a written, timestamped, customer-retained quote).

---

## 6. schema.org modelling

One graph, `@id`-linked, so Google can connect one brand to three verified GBP locations and one catering service. Emitted server-side per route by `server/seo/head.ts` from `shared/routes.ts`.

### 6.1 The graph

```
{DOMAIN}/#org        Organization
  ├ name, legalName (SLOT), taxID (SLOT), url, logo, telephone, email
  ├ sameAs: [ Instagram, Facebook ]        ← only when real URLs exist
  └ subOrganization: [ #kitchen-herzliya, #kitchen-raanana, #kitchen-petah ]

{DOMAIN}/kitchens/herzliya-pituach#kitchen   Restaurant
  ├ parentOrganization: {DOMAIN}/#org
  ├ address (PostalAddress), geo, telephone, openingHoursSpecification
  ├ servesCuisine: "Italian",  hasMenu: {DOMAIN}/menus
  └ sameAs: [ Google Maps URL for THIS branch ]     ← highest-value edge

{DOMAIN}/#website    WebSite  ( publisher → #org )
```

`subOrganization` / `parentOrganization` — **never `department`**. `department` is for departments inside one place (a pharmacy within a supermarket), not sibling branches in different cities. The design reference's JSON-LD uses `department` and types the brand-level entity as `FoodEstablishment` with no address of its own; both are wrong and must not be ported.

### 6.2 Per page type

| Page type | Nodes |
|---|---|
| `/` | `Organization`, `WebSite`, `WebPage` |
| `/kitchens` | `CollectionPage`, `BreadcrumbList` (branch nodes `@id`-referenced only) |
| `/kitchens/:slug` | `Restaurant` (full, canonical here), `BreadcrumbList` |
| `/catering` | `CollectionPage`, `BreadcrumbList` |
| event pages | `Service` (`serviceType: "Catering"`, `provider` → `#org`, `areaServed`, `audience`), `BreadcrumbList`, `FAQPage` (filled questions only) |
| `/menus` | `Menu` → `hasMenuSection` → `MenuItem`, `BreadcrumbList` |
| `/quote` | `ContactPage`, `BreadcrumbList` |
| `/areas/:city` | `Service` with `areaServed: City`, `BreadcrumbList` — **no `Restaurant` node** |
| legal | `WebPage`, `BreadcrumbList` |
| `/thanks`, `/summary`, `/admin/leads`, `/lp/*` | none |

### 6.3 Prohibitions

- **`aggregateRating` and `Review`: never.** No real attributable reviews exist, Google disallows self-serving review snippets for `LocalBusiness`, and the fabricated `4.9/247` and `4.8/189` figures must be deleted, not marked up. Real GBP reviews, linked out to their source, are the only compliant proof.
- **`priceRange`: omitted entirely.** Never `"{{PRICE_RANGE}}"`, never a guess.
- **`Offer.price` only where an owner-signed price exists** with its conditions published alongside.
- **`hasCertification` / kashrut claims: never**, absent a current certificate per branch.
- **Expectation setting for the client:** `Service` markup has no corresponding Google rich result, and `LocalBusiness` markup no longer generates a meaningful visual SERP feature. This work buys entity disambiguation and legibility to AI answer surfaces — not stars. Say so explicitly; do not promise a SERP feature.

---

## 7. Build order, dependencies, and parallel ownership

Waves are sequential. Within a wave, tracks are parallel and **file-disjoint** — the ownership column is the collision-avoidance contract.

### Wave 0 — Foundations (single owner, one branch, no parallelism)

Nothing else may start. Order inside the wave matters.

| # | Task | Files owned |
|---|---|---|
| 0.1 | The §0.1 deletion commit | the files listed in §0.1 |
| 0.2 | Palette + token rewrite (gold removed, paper/ink adopted), `--radius: 3px`, italic reset, motion primitive, `prefers-reduced-motion`, grain layer, high-contrast as token override | `client/src/index.css`, `tailwind.config.ts` |
| 0.3 | `client/src/config/business.ts`, `client/src/data/locations.ts` | new |
| 0.4 | `shared/routes.ts` (all 26 route defs with title/description/og/robots/schema/breadcrumb) | new |
| 0.5 | `server/seo/head.ts`, `server/seo/sitemap.ts`, `client/public/robots.txt`, `/api` JSON 404 before static fallback | `server/vite.ts`, new |
| 0.6 | `shared/lead-schema.ts`; drop `@shared/schema` from the client | new, `contact.tsx` |
| 0.7 | Lead-table attribution columns (`landingPage`, `utm*`, `referrer`, `path`, `branch`, `serviceFormat`, `guestBand`, `contactChannel`, `phoneE164`, `consent*`, `pipelineStatus`, `wonValueIls`, `waRefCode`) + `whatsapp_intents` + `lead_events`. All nullable; **every added column needs a matching `?? null` line in `MemoryStorage.createContactSubmission`**, which builds rows field-by-field, or the default dev path silently drops attribution | `shared/schema.ts`, `server/storage.ts`, `server/routes.ts` |
| 0.8 | Primitives: `Slot`, `Fact`, `Photo`, `Ltr`, `Num`, `HairlineTable`, `WaButton`, `CtaPair`, `SectionHead` | `components/primitives/*` |
| 0.9 | `SiteLayout`, `RouteShellSkeleton`, `Colophon`, header rewrite, `useHashScroll`, `DirectionProvider` + `end-4` revert | `layouts/*`, `layout/*`, `App.tsx` |
| 0.10 | Self-hosted subset fonts, sharp image pipeline + manifest, brotli precompression, `express.static` cache headers | `client/index.html`, `scripts/images.ts`, `server/vite.ts` |
| 0.11 | CI gates: axe-core, T-2/T-3/T-5/T-6, en-dash regex, Arabic-script regex, ban-list grep, per-route KB budget (`size-limit`, **fails** the build), logical-property lint | `.github/workflows/*`, `scripts/checks/*` |

**Why 0.11 lands in Wave 0, not at the end:** a budget or a ban-list that only warns is gone in two weeks, and page six otherwise reintroduces every defect fixed on page one.

### Wave 1 — Reference implementation (single owner)

| # | Task | Owns |
|---|---|---|
| 1.1 | Every shared section component, built against P-01 | `components/sections/*` |
| 1.2 | `QuoteBuilder` + `/api/quote` + `/api/wa-intent` + `openWhatsApp()` | `quote-builder.tsx`, `lib/whatsapp.ts`, `server/routes.ts` |
| 1.3 | **P-01 `/`** | `pages/home.tsx`, `content/home.ts` |
| 1.4 | **P-24 `/404`** | `pages/not-found.tsx` |

P-01 is the reference implementation. **No Wave 2 track may begin until it merges** — every subsequent page composes its components, and a section rewritten in parallel by two owners is the most expensive collision available here.

### Wave 2 — Parallel tracks (six owners, file-disjoint)

| Track | Pages | Owns exclusively | Depends on |
|---|---|---|---|
| **A** | P-02, P-03, P-04, P-05 | `pages/kitchens.tsx`, `pages/kitchen-branch.tsx`, `content/kitchens/*` | 0.3, 1.1 |
| **B** | P-06, P-07 | `pages/catering-hub.tsx`, `pages/catering-business.tsx`, `content/business.ts`, `sections/ops-facts.tsx` | 1.1 |
| **C** | P-08 | `pages/catering-private-events.tsx`, `content/private-events.ts`, `sections/service-formats.tsx` | 1.1 |
| **D** | P-16 | `pages/menus.tsx`, `data/menus.ts`, `sections/menu-sheet.tsx`, print stylesheet | 1.1 |
| **E** | P-17, P-18, P-19 | `pages/quote.tsx`, `pages/thanks.tsx`, `pages/summary.tsx`, `content/summary.ts` | 1.2 |
| **F** | P-20, P-21, P-22, P-23 | `pages/{privacy,terms,accessibility,admin-leads}.tsx`, `content/legal.ts` | 0.7, 0.8 |

Shared-file rule: `sections/ops-facts.tsx`, `service-formats.tsx` and `menu-sheet.tsx` are **created** by tracks B, C and D respectively and **consumed read-only** by everyone else. A consumer needing a change opens a request to the owner; no cross-track edits.

### Wave 3 — Gated pages (parallel, each blocked on a specific owner fact)

| Page | Blocked on | Track |
|---|---|---|
| P-09 `/catering/bar-mitzvah` | kashrut answer, minimum, staffing | G |
| P-10 `/catering/shiva` | **kashrut answer (hard)**, lead time, delivery window, staffed phone hours | G |
| P-11 `/catering/holidays` | per-חג capability, order-by dates, `seasons.ts` | H |
| P-13 `/urgent` | same-day cutoff per branch (conservative, owner-signed) | H |
| P-12 `/catering/fun-day` | pasta-station operational limits | I |
| Prerendering | Wave 2 complete | J |

### Wave 4 — Expansion (only after Wave 2 pages have 30 days of data)

P-14 `/pasta-bar`, P-15 `/catering/dairy`, P-25 `/areas/:city` (one city at a time, each fully gated), P-26 `/lp/*`, `/menus/:menu`.

### 7.1 Dependency graph (critical path)

```
0.1 deletions
  → 0.2 tokens ─┬→ 0.8 primitives → 1.1 sections ─┬→ 1.3 P-01 → Wave 2 (A–F) → Wave 3 → Wave 4
  → 0.3 config ─┤                                 │
  → 0.4 routes → 0.5 head layer ──────────────────┤   (head layer blocks EVERY page)
  → 0.6/0.7 data → 1.2 builder ───────────────────┘   (builder blocks tracks B,C,E)
  → 0.10 images ──────────────────────────────────┘   (blocks any page with a Photo)
  → 0.11 CI gates                                      (blocks merge of everything after)
```

### 7.2 Launch blockers that are not code

These sit outside the build team's control and are the direction's stated weakness. Escalate them on day one, with dates:

1. **Photography** — three captioned kitchen photos + one hero per landing route, at the four fixed ratios, with branch / street / action / **hour** captured **at shoot time** (hour and action are unreconstructable afterwards and cost nothing to request in advance). Without them the direction renders as labelled empty frames.
2. **A named chef per branch**, with consent to be named and photographed.
3. **Three real addresses, three phone numbers, three sets of hours.**
4. **The kashrut answer per branch, verbatim, in writing** — it gates P-09 and P-10 and determines the account-wide negative-keyword list.
5. **The response-time commitment** — it appears on P-01, P-17 and P-18 and is an operational promise, not copy.
6. **Legal entity name + ח.פ.** — build-blocking Slots on P-20 and P-21.
7. **Minimum, lead time, delivery windows, capacity per kitchen** — each is a commercial commitment; ship the conservative figure or ship nothing.

**Degradation contract:** every one of these, unfilled, produces a *shorter honest page* — never a placeholder, never a plausible guess, never a gapped grid. That is the whole architecture, and it is the only version of "authentic" that survives contact with a real business's unfilled facts.
