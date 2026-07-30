# ביקורת שלמות — סבב ראשון

> נכתב על גרסת המפרטים שנבנתה על כיוון עיצובי שגוי (באג ספירה בשקלול השופטים).
> כל הליקויים כאן חייבים להיות מתוקנים בגרסה הנוכחית.

# Completeness review — `docs/spec/01`, `02`, `03`

Verified against the working tree at HEAD (package.json, `server/routes.ts`, `server/storage.ts`, `server/db.ts`, `shared/schema.ts`, `drizzle.config.ts`, `client/src/pages/terms.tsx`, `server/seed.ts`).

---

## A. INVENTED BUSINESS FACTS SHIPPED AS LITERAL COPY (highest priority)

**A1. `מ־25` — the minimum guest count is invented, and it is hardcoded in two specs.**
`01` §3 P-01 §1: `תשובה תוך {{RESPONSE_TIME}} · מ־25 ועד {{MAX_GUESTS}} סועדים · שלושה מטבחים`. `03` §7.15 repeats it verbatim as the canonical `<Slot>` example. `02` §1.2 gets it right (`מ־{{MIN_GUESTS}} ועד {{MAX_GUESTS}}`). 25 is a competitor's published minimum (eden-c), not Mamamia's — nobody has supplied it, and a published minimum is a commercial commitment. **Fix:** `01` §3 P-01 and `03` §7.15 → `מ־{{MIN_GUESTS}} ועד {{MAX_GUESTS}}`, and add `MIN_GUESTS` to the clause-pruning example so the degraded line is demonstrated as `שלושה מטבחים` alone. Add `מ־25|עד 25|25 סועדים` to the `03` §12 honesty grep.

**A2. VAT and exclusions asserted as fact inside the price qualifier.**
`01` §3 P-16: `נקודת פתיחה לסועד, בהזמנה מ־{{MIN_GUESTS}} סועדים, כולל מע״מ, לא כולל צוות והובלה.` Whether published prices include VAT, and whether staff/delivery are excluded at the floor, are both on the owner-ask list. This string is a legally operative representation under `ס' 2` and it is written as fixed copy with only the guest count slotted. **Fix:** the entire qualifier becomes `LEGAL.PRICE_ESTIMATE_NOTE` (already declared `null` in `02` §3.12) and the price line refuses to render without it — which `02` §3.12 already promises ("price components refuse to render without the corresponding note prop") but `01` P-16 contradicts by supplying a default string.

**A3. The builder's area chips publish a delivery area nobody confirmed.**
`02` §3.5 hardcodes `הרצליה / רמת השרון`, `רעננה / כ״ס / הוד השרון`, `פתח תקווה / גוש דן`, `תל אביב`. `faq-data.ts:34-49`'s ~14 invented service cities were flagged as a deletion for exactly this reason; this reintroduces a narrower version of the same claim inside the primary conversion surface, and the inline response `המטבח שלנו ברעננה מבשל את האירוע הזה` promises service. **Fix:** the area list is sourced from `locations.ts[branch].servesAreas` (owner Slot). With no owner data the screen degrades to a free-choice `עיר האירוע` text input plus `נבדוק הובלה ונגיד לכם ישר` — never a published catchment.

**A4. Tasting policy asserted without an owner slot.**
`TastingBand` appears on 7 routes (`01` P-01 §7, P-02, P-03…05, P-07, P-08, P-16, P-17) and the direction's copy is `בלי תיאום מראש, בלי מינימום, בלי פגישת מכירות`. No spec Slot-gates it. "Walk-in or by appointment, free or paid, any minimum, which branches host tastings" is an open owner question. Also: `בואו לטעום הערב` is only true for dishes that are **both** on the live restaurant menu **and** catering-available — `01` P-16 gates the cross-link on `SLOT.LIVE_MENU_URL_{branch}` but does not gate the band itself. **Fix:** `03` gains a `TastingBand` component spec whose copy is `SLOT.TASTING_POLICY`; band does not render unless the policy Slot is filled and at least one branch has hours + address.

**A5. `אירוח אצלנו במסעדה` is sold as a service in two places with no capacity confirmation.**
`02` §3.2 chip, `01` P-08 `ServiceFormats`. Private-event capacity per restaurant (seated/standing, can the space be closed off, parking, accessibility) is an unanswered owner ask. Offering it as a selectable option is a representation that the restaurants host private events. **Fix:** the chip and the `ServiceFormats` row render only where `locations.ts[branch].privateEventCapacity` is filled for ≥1 branch.

**A6. The photo-caption example hardcodes an unverified address.**
`03` §7.11: `1 · הרצליה פיתוח · מדינת היהודים 85 · הכנת אנטיפסטי לפני הפתיחה · 07:40`. `מדינת היהודים 85` is the placeholder currently in `contact.tsx` and is explicitly on the "confirm this is correct and current" list. A spec example is the single most-copied string in a build. **Fix:** write the example with tokens only.

**A7. The kashrut-negative formulation is given as ready copy, not a slot.**
`01` P-09: `המטבח אינו מחזיק בתעודת הכשר מגורם מוסמך. חומרי הגלם נרכשים מספקים המחזיקים בתעודת הכשר, ואין במטבח בשר חזיר או פירות ים.` The hedge "(only if factually true, owner-signed)" is prose; the string is copy-pasteable. The supplier claim and the pork/shellfish claim are per-branch facts. **Fix:** one Slot, `LEGAL.KASHRUT_BY_BRANCH[branch]`, rendered verbatim as the owner wrote it — which `02` §3.12 already declares. Delete the sample sentence from `01`.

**A8. `{{TODAY_HE}}` dateline is a manufactured freshness signal.**
`01` P-01 §1 renders a dateline with today's date on a static marketing page. It is not an owner fact and not a publication date — it implies the page was updated today. It also breaks the server head layer's cacheability and creates an SSR/CSR mismatch. **Fix:** delete, or replace with a real `dateModified` sourced from the content module's last edit.

---

## B. CONTRADICTIONS BETWEEN THE THREE SPECS

**B1. `whatsapp_intents`: one spec creates the table, the other forbids it.**
`01` §7 task 0.7: "Lead-table attribution columns … **+ `whatsapp_intents` + `lead_events`**". `02` §1.1: "this is why we do **not** use a separate `whatsapp_intents` table", and §6.1 restates it as a decision. Wave 0 is a single-owner commit that would create a table `02` explicitly rejects. **Fix:** `01` 0.7 drops `whatsapp_intents`, adds `quote_drafts` and `call_events` (both defined in `02` §6.2 and absent from `01`).

**B2. The confirmation is simultaneously a route change and an in-place swap.**
`01` P-18: "`/thanks?ref=…`. **A real URL change is required** — without it no analytics platform can record a conversion." `02` §3.9: "Replace with a full view that **swaps out the builder**" — no navigation. Both cannot be true. **Fix:** pick the route (`01` is right on the analytics argument, and `02`'s post-submit enrichment textarea works fine on `/thanks`), and delete `02`'s in-place swap. Then define what `/thanks` renders when hit with no `ref` or an unknown `ref` (currently undefined in both).

**B3. `/urgent` has a builder in one spec and not in the other.**
`01` P-13: "**No builder on this page.**" `02` §1.5 table: "`/urgent` … builder collapsed below fold". Also `02` §1.1 says the builder is primary "on every route except `/urgent`, `/shiva`" while `01` gives `/kitchens`, `/catering`, `/menus` (P-16 has one), legal, `/thanks`, `/summary` no builder either.

**B4. `02` addresses routes that do not exist.**
`02` §1.5 and §15 step 9 reference `/venue/{branch}`, `/catering/{city}`, `/shiva`. `01`'s inventory has `/kitchens/{slug}`, `/areas/:city`, `/catering/shiva`. `02` §1.1 and §14 also use `/shiva`. Every route string in `02` must be regenerated from `01` §2, or `shared/routes.ts` and the analytics `source_page` dimension will not match the built site.

**B5. The config file has two names.**
`01` §5.6 and 0.3: `client/src/config/business.ts` (`WA_NUMBER · TEL · EMAIL · DOMAIN`). `02` §4.3: `import { WA_NUMBER } from "@/config/contact"`, and §15 step 3 says `config/contact.ts`. Also `02` §2.2 introduces `client/src/config/pricing.ts`, which appears nowhere in `01`'s component tree or Wave 0 task list.

**B6. `<Slot>` has three incompatible APIs.**
`01` §5.6: `<Slot id blocking? unit="clause|row|cell|section">`. `02` §7: `<Slot id blocking />` + `<SlotRow>` + `<SlotSection>`. `03` §7.15 — which *owns* components — defines `{ id, children, prune }` with **no `blocking` prop at all**, and then references an undefined `<SlotGroup>` in the next paragraph. `blocking` is the mechanism that fails the production build on an unfilled `LEGAL_ENTITY`; the owning spec omits it. Same problem, smaller, for `<Fact>` (`sourceLabel` vs `source` vs `source+unit+href`) and `<Photo>` (`01` omits `spec`, `index`, `priority`, `width/height`; `03`'s `Ratio` union omits the `4/3` mobile collapse it describes in prose).

**B7. The Google Maps embed destroys `02`'s zero-third-party argument.**
`01` P-03 lists "street address + `PostalAddress` + `geo` + **embedded map**" as a required branch fact. `02` §10.2 concludes: "self-host the fonts, drop Font Awesome for lucide. **Result: zero third-party requests, no banner, no disclosure paragraph.**" A Google Maps iframe on three branch pages transmits every visitor's IP to Google and sets Google cookies — reinstating exactly the disclosure/consent obligation `02` just eliminated. **Fix:** decide once. Recommended: a static map image (self-hosted, generated at build) plus a text `הוראות הגעה` link to Google Maps — keeps the local-verification value, keeps zero third-party requests.

**B8. `ui/` retention lists disagree.**
`01` §5.6 keeps `button, input, label, textarea, card, accordion, dialog, lib/utils`. `03` §11.3 keeps `button, input, label, textarea, card, accordion, form` and keeps `dialog`/`sheet` as a separate exception. `01` keeps `lib/utils.ts` unchanged while `03` §11.3 deletes `tailwind-merge`, which `cn()` imports — so `lib/utils.ts` must be rewritten, and `01` says "Keep".

**B9. Analytics event names in `01` do not exist in `02`'s closed taxonomy.**
`01` names these page conversion goals: `kitchen_page_click` (P-02), `event_page_click` (P-06), `add_to_brief` (P-16), `quote_submit` (P-07/08/09/11/12/14/15/17), `summary_share` (P-18). `02` §11.2 is a discriminated union that "a new landing page cannot invent its own event names" and contains none of them (`quote_submit` is `generate_lead`). **Fix:** either add the five to `02` §11.2 with parameters and Ads tier, or rewrite `01`'s goals to the `02` names. `add_to_brief` is the more serious of the two: `01` calls it "the best top-of-funnel mechanic in the whole system" and `02` implements neither the event, the state, nor a column for the accumulated dish list.

**B10. Sticky bar vs. `INV-4` / `L-7`.**
`03` §7.10 says "Exactly two actions plus one, and **only one filled**" then specifies three: `וואטסאפ` (`--wa` background = filled), `הצעה` (`--btn-bg` = filled), `התקשרו` (ghost). Two filled buttons. Worse, the bar is `position:fixed` on every route below 760px, so it is in the same viewport as every section's primary CTA — a permanent violation of "one filled primary per viewport", which `01` INV-4 and `03` L-7 both declare a review gate. And on `/catering/shiva`, which forbids upsell and has no builder, the bar still renders `הצעה`. **Fix:** state the exception explicitly (bar is chrome, not content), make WhatsApp the only filled control in it, and add a per-route `stickyBar: 'quote'|'phone'|'none'` field to `RouteDef` with `none` on `/catering/shiva`.

---

## C. RESEARCH OBLIGATIONS NO SPEC IMPLEMENTS

**C1. Specs `04-*` and `05-*` are referenced repeatedly and do not exist.**
`01` line 6 declares companion specs under a completely different numbering than the files that exist: "`02-*` (design tokens & components), `03-*` (copy & slots), `04-*` (data model & measurement), `05-*` (legal/a11y)". `01` P-20…P-22 defers all legal *content* to `05-*`; `03` §10.10 and §7.4 defer to `05-*`. **Nothing owns:** the rewritten privacy policy, the rewritten `terms.tsx`, the honest accessibility statement, the רכז נגישות block, the two-tier cancellation clause text, the allergen statement text, the age/medical-data notice placement outside the builder. This is the single largest hole in the set — the three highest-liability pages in the repo have an architecture and zero content spec. **Fix:** write `04-legal-and-content.md` and renumber the cross-references in all three files.

**C2. No unsubscribe mechanism.**
`02` §3.10 stores `consent_marketing` and the checkbox text promises `ניתן להסיר את ההסכמה בכל הודעה`. `ס' 30א` requires every advertising message to carry a working refusal mechanism, and `01`'s route table has no unsubscribe route, `02` has no endpoint, and the schema has no `unsubscribed_at`. The checkbox copy is therefore a promise the system cannot keep. **Fix:** `/unsubscribe?ref=` route (noindex, no auth beyond the ref, single POST), `unsubscribed_at` column, and a rule that the marketing-send path filters on `consent_marketing = true AND unsubscribed_at IS NULL`.

**C3. The `docs/privacy/` artefact set is missing except one file.**
`02` §9.5 mentions `docs/privacy/dsr-runbook.md` once. The research names five documents as the cheapest available compliance evidence and one of them is legally load-bearing: `מסמך הגדרות המאגר` (required at every security level, independent of registration), `processors.md` (the cross-border undertaking for the Postgres host and the `NOTIFY_WEBHOOK_URL` vendor — `תקנות העברת מידע לחו"ל` requires a written undertaking), `retention.md`, `incident-runbook.md` (the PPA's first Amendment-13 fine was for *failure to report*, not misuse), `consent-log.md`. **Fix:** add them to `01` Wave 0 as owned deliverables, not to a future spec.

**C4. No photo-takedown route and no photo/testimonial consent persistence.**
`server/seed.ts:110` still strips `consentGiven` before insert — consent asserted then discarded, leaving no evidence. No spec touches it, and no spec touches the `testimonials` / `gallery_items` / `blog_posts` tables, their `IStorage` methods, or `server/seed.ts` at all, even though the components consuming them are all deleted. **Fix:** add `consent_source` + `consented_at` columns to whatever backs `PastEvents`; add a takedown line (`צולמתם באירוע ולא רוצים שהתמונה תופיע? …`) to the colophon; and add "delete the three orphaned tables, their storage methods and `seed.ts` blocks" to `01` Wave 0.

**C5. Google Business Profile review links — the only compliant social proof — have no component.**
`02` §11 and `01` §6.3 both correctly forbid `aggregateRating`/`Review` markup. The research's replacement is outbound links to the three real GBP profiles ("the rating then lives at its source, always current, and needs no claim from you"). `01` P-01 §11 has `PastEvents` (collapses when empty, which it will be at launch) and nothing else. Result: the site launches with **zero** proof of any kind. **Fix:** `03` gains a `GoogleReviews` block — three outbound links, no scraped ratings, no numbers, renders per branch only where `locations.ts[branch].gbpUrl` is filled.

**C6. Per-branch physical accessibility has no data field and no render target.**
`01` P-22 lists it as a page gate; the regulation requires it in the statement; `contact.tsx:377`'s baseless `נגיש לנכים` is correctly deleted. But `locations.ts` (`01` §5.6) has no accessibility fields and `ProductionSheet` (`03` §7.14) has no row for it. Same for the mandatory **alternative human service channel** (a staffed phone with hours, for people who cannot use the site) — named nowhere.

**C7. Terms clauses that are `תנאי מקפח` or unlawful survive both delete lists.**
`01` §0.1 covers `terms.tsx` lines 24, 40, 57, 59, 64-67, 77-80, 156, 188, 198; `02` P5 adds `:98`. Verified still present and covered by neither: **`:135-138`** general liability cap (cannot exclude bodily injury / food-safety negligence against a consumer), **`:155`** marketing use of event photography on an *opt-out* buried in a תקנון, **`:167`** mandatory `בוררות`, **`:168`** exclusive Tel Aviv forum. **Fix:** add all four to `01` §0.1 with the replacement language (`אין באמור כדי לגרוע מאחריות החברה לפי כל דין, לרבות בגין נזק גוף`; photo use becomes explicit opt-in in the booking document; arbitration deleted outright).

**C8. No CSP, and no spec for how any analytics script is loaded.**
`server/index.ts:31-40` sets four security headers and no `Content-Security-Policy`. `02` §10.2 says "build pixels so they can only be injected through a single consent-gated module, never a raw script tag" — no module is specified, no host, no GTM-vs-gtag decision, and no statement of how a `googletagmanager.com` script reconciles with the "zero third-party requests" conclusion of the same section. Given the page will carry inline JSON-LD and an inline `data:` SVG grain layer, the CSP must be written deliberately or it will be omitted forever.

---

## D. UNBUILDABLE OR BROKEN AS WRITTEN

**D1. `RouteDef` cannot express per-branch titles — this defeats the entire head layer.**
`01` §5.1 defines `RouteDef` with a single `titleHe`, `descriptionHe`, `ogImage`, `breadcrumb`, keyed on a wouter *pattern* (`"/kitchens/:slug"`). Three branch pages, four area pages and every `/lp/:campaign` therefore receive **byte-identical `<title>`, description, canonical and `og:image`** — the exact duplicate-content failure `01` §5.1 exists to prevent, and it fails `01`'s own T-3 by construction. **Fix:** `RouteDef.head` becomes `HeadDef | ((params) => HeadDef)`, resolved server-side against `content/kitchens/{slug}.ts` and `content/areas/{city}.ts`; sitemap generation expands parameterised routes from the same source.

**D2. `INV-3` / `L-6` / `T-5` assert exactly one ink band per route, and at least eight routes have zero.**
`03` L-6: "CI: `count(data-band="ink") === 1` per rendered route." Routes with no `KitchensBand` in their `01` §3 section order: `/kitchens` (P-02), `/catering` (P-06), `/catering/shiva` (P-10), `/urgent` (P-13), `/menus` (P-16), `/quote` (P-17), `/thanks`, `/summary`, all three legal pages, `/404`. The gate fails every one of them on day one. **Fix:** `count ≤ 1`, plus a separate assertion that where the band exists it is `KitchensBand`.

**D3. `T-2` (unique copy ≥ 35% of rendered Hebrew text) blocks the honest degraded page.**
`01` §4.2 T-2 fails a route below the threshold. A page whose Slots are unfilled has *less* unique copy while the shared modules (`inclusions.ts`, `limits.ts`, `process.ts`, `legal.ts`, colophon) stay constant — so the degradation contract in `01` §7.2 ("every one of these, unfilled, produces a *shorter honest page*") mechanically produces a CI failure. Same for `T-6`/`L-1` on any route whose photos have not arrived. **Fix:** T-2 and T-6 are warnings until a route is marked `launchReady: true` in `RouteDef`, and blocking after that. State it, or the first gated page will get the gate disabled instead.

**D4. The click IDs never reach the lead row.**
`02` §10.1 writes `gclid`/`gbraid`/`wbraid` into an **`httpOnly`** cookie (correctly — it survives consent tooling). `02` §4.3 and §6.2 then have the *client* send `attributionSnapshot()` in the POST body. JavaScript cannot read an `httpOnly` cookie. No spec states that `POST /api/quote` and `POST /api/wa-intent` merge `req.cookies.mm_attr` server-side into the row. As written, `gclid` is captured and then discarded, and §9.6's `ads-export.csv` returns zero rows forever. **Fix:** state the merge explicitly, with precedence (server cookie wins over client-supplied for click IDs; client wins for `ga_client_id`, which it must read from the `_ga` cookie).

**D5. `cookie-parser` is not installed and is not on any dependency list.**
`02` §10.1 uses `req.cookies?.mm_attr_first`. Verified missing from `package.json`. Also missing and required by the specs but listed nowhere as an addition: `@radix-ui/react-direction` (`01` §5.5, `03` §9.3 — the app root import), `sharp` (`01` 0.10 image pipeline), a brotli precompressor (`01` 0.10), `size-limit` (`01` 0.11 / `03` §12), an axe CI runner, and a Hebrew-calendar package for D7. `03` §11.3 is the only place packages are managed and it lists only removals plus `nanoid`. **Fix:** one additive dependency table in `01` Wave 0. Also note `secure: true` on `res.cookie` means attribution silently never persists in local dev over http.

**D6. `drizzle-kit push` cannot perform the migration `02` §6.1 describes.**
`02` §6.1: "Rename `contact_submissions` → `leads` **with a Drizzle migration**, keeping the old table as a view for one release." There is no `migrations/` directory, no `db:generate`, no `db:migrate` — `package.json` has only `db:push`, which will drop and recreate, destroying existing rows, and cannot create a compatibility view. Additionally `MemoryStorage.createContactSubmission` (verified, `server/storage.ts`) builds ten fields by hand; `02` §6.2 adds ~60 columns, so `02` §6.3's `?? null` obligation is ~60 hand-written lines with a parity test — worth stating as an explicit task with an hour estimate rather than a footnote. **Fix:** add `db:generate`/`db:migrate` scripts and a hand-written SQL migration to `01` Wave 0 task 0.7.

**D7. `date_flag = 'chag_adjacent'` is unimplementable, and nothing pins Asia/Jerusalem.**
`02` §3.4 stores `'friday' | 'shabbat' | 'chag_adjacent'`. Chag adjacency requires a Hebrew calendar; `03` §11.3 *deletes* `date-fns` and adds no calendar dependency. Separately, and more damaging: no spec anywhere states that Israeli day/hour logic must be computed in `Asia/Jerusalem` via `Intl.DateTimeFormat` with an explicit `timeZone` — even though the research flagged the exact bug (`new Date(x).getDay()` parses as UTC and misclassifies Friday/Saturday near midnight). This affects `date_flag`, `ANSWERING_HOURS` gating (`02` §8.4), the `is_business_hours` analytics param (§11.2), the escalation window (§8.5), and `/urgent`'s cutoff display. **Fix:** one rule in `03` or `02` — "all calendar and clock logic uses `Asia/Jerusalem` explicitly; the client's device clock is never trusted for cutoff or hours" — plus a named Hebrew-calendar source or the deletion of `chag_adjacent`.

**D8. `GET /api/quote/:ref` is referenced and never specified.**
`02` §3.9: "reading from `GET /api/quote/:ref` (see §5.4)" — §5.4 is *Draft retention* and does not contain it. The endpoint appears in no route list, no rate-limit table (§12.3), no auth rule, and no field allowlist. As implied it is a **public, unauthenticated endpoint that returns a lead record keyed on a 6-character code** printed in a WhatsApp message. **Fix:** specify it — response field allowlist (event spec, dishes, inclusions, terms, branch address; **never** name, phone, email, notes, attribution), rate limit, a 404 state for unknown/purged refs, and `Cache-Control: no-store`.

**D9. The `₪` CI gate cannot catch a correctly-formatted price.**
`02` §0 and §13, and `03` §12: `rg '₪\s*[0-9]'`. `03` §4.7 decides currency is **number-first** (`120 ₪`). So the gate matches only the format the spec bans and misses every hardcoded price written in house style. **Fix:** `[0-9][\s\u00A0]*₪|₪[\s\u00A0]*[0-9]`.

**D10. The `03` §12 gate script is broken.**
`g(){ ... rg -n ... $3 >/dev/tty 2>&1; }` — `/dev/tty` does not exist in CI (GitHub Actions runners have no controlling terminal), so every invocation errors; and unquoted `$3` cannot carry `client/src --glob '!client/src/config/**'` as written. Also `rg 'כשר'` has no word boundary and will false-positive on `הכשרה`, `מכשיר`, and any legitimate root — which matters because this is a *blocking* gate someone will disable. **Fix:** write to stdout, quote/array the args, and anchor the Hebrew patterns.

**D11. Ref-code collisions and WhatsApp double-counting are unhandled.**
`leads.ref` is `varchar(12) notNull unique` (`02` §6.2) and generated **client-side** (§4.3). Three consequences none of the specs address: (a) a collision or a hostile POST reusing an existing ref returns a unique-violation 500 — but the client "ignores the response entirely" and *displays the ref to the customer*, who then holds a code matching no row; (b) `02` §12.3 claims `/api/wa-intent` is "deduped by unique `ref`" — every click mints a *new* ref, so there is no dedup at all, and three taps on the sticky bar create three `leads` rows with `status='new'`; (c) those rows then trip `02` §8.5's 20-minute escalation webhook and inflate the channel report and the "Lead — WhatsApp handoff" Ads conversion. **Fix:** server-side collision retry; dedup `wa-intent` on `(landing session id, wa_location)` within 30 minutes; exclude `path='whatsapp'` rows with no inbound match from escalation.

---

## E. MISSING STATES, PAGES AND EDGE CASES

**E1. Invalid `:slug` / `:city` params.** `wouter`'s `/kitchens/:slug` matches `/kitchens/anything`, and the server head layer keyed on the pattern will emit a 200 with a canonical for a nonexistent branch. No spec defines the not-found state for a parameterised route. **Fix:** validate against `locations.ts` / `content/areas/*` at both the server head layer and the component; unknown param → HTTP 404 + `NotFound`.

**E2. Return-from-WhatsApp state.** `02` §4.3 `openWhatsApp()` navigates the tab away and "returns the ref — shown on screen immediately". On mobile the tab is backgrounded; on return the page is exactly as it was. No component, no persisted panel, no "your reference is MM-…" state is specified anywhere. For the path `01` and `02` both call the dominant Israeli channel, this is the entire post-conversion experience and it is undefined.

**E3. `og:image` has no fallback and no pipeline.** `01` INV-5 requires a per-route `og:image`; `03` O-6 asks the owner for one per landing page. With ~20 indexable routes and an owner supplying maybe four images, most routes emit a 404 `og:image` — a blank WhatsApp card on the exact forwarding mechanic the whole thesis depends on. **Fix:** one default `og` plus a build-time generator (route title typeset on `--paper` with the wordmark) and a rule that the default is used until a real photo exists.

**E4. `/summary` with an expired or purged ref.** `02` §5.4 hard-deletes leads at `LEAD_RETENTION_MONTHS`; a forwarded summary link then breaks with no defined state. Also unspecified: whether `/summary` reflects later edits, and what the buyer's committee sees six weeks after the quote changed.

**E5. Header/nav information architecture for 13+ routes is unspecified.** `01` 0.9 says "header rewrite"; `03` §7.12 specifies the sticky treatment, the drawer primitive and the CTA position — neither says what is *in* the nav, how two hubs plus eight occasion pages are grouped, or where the breadcrumb renders. This is the one piece of IA a 13-route build cannot be started without.

**E6. Ten named components have no design spec.** `03` §7 covers Button, field, radio-card, checkbox, section header, card, menu row, table, accordion, sticky bar, Photo, header, footer, production sheet, Slot, Fact, builder chrome, brief card, icons. `01` §5.6 and §3 additionally require: `DecisionChecklist`, `EventRows`, `TastingBand`, `LimitsBlock`, `InclusionsExclusions`, `ProcessSteps`, `TermsStrip`, `OpsFacts`, `ServiceFormats`, `StationsBlock`, `AreaServed`, `DriveTimeTable`, `CtaPair`, `HairlineTable`, `WaButton`, `Ltr`, `Num`. `DecisionChecklist` and `OpsFacts` in particular carry the mobile anti-bounce mechanic and the entire corporate/urgent value proposition, and `03` is the spec that owns components.

**E7. `data/menus.ts` has no schema.** `01` P-16 requires per-dish catering availability and a per-branch live-menu cross-link; P-11 requires `seasons.ts.menuIds`; `02` requires `add_to_brief` to accumulate dishes into the builder. No spec defines the dish record (id, name, description ≤12 words, price slot, branches available, live-menu URL, dietary tags, season). Three tracks (D, H, E) depend on it.

**E8. Two broken internal cross-references in `01`, one in `02`.** `01` §0.1 → "replaced by `PastEvents` (**§4.10**)" and P-01 → "entering the builder at **§4.12**" — `01` §4 has only §4.1–4.3, and the builder is §5.7. `02` §3.9 → "(see §5.4)" for an endpoint that is not in §5.4. These are leftovers from an earlier outline and suggest P-01's section list was written against a document structure that no longer exists — re-derive it.

---

## F. Genuinely complete — no padding needed

- **`03` §2 (colour) is the strongest section in the set.** Every pair is measured, the two corrections to the design reference (`--ink-3` at 3.85:1 → 5.44:1; `--line-strong` introduced for 1.4.11 control boundaries) are correct and are things the reference genuinely got wrong, and the `[data-band="ink"]` wholesale override means components need no band awareness. Nothing to add.
- **`03` §4.9 (bidi) and §4.6 (numerals)** are complete and correct, including the `<bdi>`-does-not-help finding and the `formatRange` trap.
- **`02` §4 (the WhatsApp same-tick handoff)** is complete: the two failure modes are named, the fix is exact, and the four "will be optimised away" rules are the right artefact.
- **`02` §11.4–11.6 (Ads mapping)** correctly handles the June-2026 API cutoff, the 90/63-day upload windows, and the closed-won-cannot-be-the-bid-target argument. No gaps found.
- **`03` §10.4 (deleting the accessibility toolbar)** is airtight and correctly insists the deletion ship in the same commit as the base remediation.