# ביקורת שלמות — סבב שני (נוכחי)

> נכתב על המפרטים אחרי תיקון הכיוון העיצובי.
> זהו הדוח הפעיל. `00-prior-review.md` הוא רשומת הסבב הראשון ונשמר כהיסטוריה.

# Completeness review — second pass (`01`, `02`, `03`)

Verified against the working tree at HEAD (`package.json`, `tsconfig.json`, `server/vite.ts`, `client/src/components/ui/`) and against `docs/spec/00-prior-review.md`.

The eight A-class defects from the prior review are fixed. A new set has been introduced, and the three specs have drifted apart in ~14 places — several of them load-bearing (two incompatible definitions of the same data file, three different answers for the mourning page's sticky bar).

---

## A. INVENTED BUSINESS FACTS SHIPPED AS LITERAL COPY

**A1. Two H1s assert a staffing service the specs elsewhere say is unconfirmed.**
`01` P-09: `בר מצווה, אירוסין, יום הולדת — עם התפריט שלנו ועם הצוות שלנו בשטח.` and P-10: `בר מצווה ובת מצווה — מהמטבח של המסעדה, עם הצוות שלנו בשטח.` Meanwhile `02` §3.4 gates the `plated_staffed` format on `offered === true` and states "`plated_staffed` in particular asserts that waiters, service equipment and porcelain are available — an open owner question." An H1 is the least prunable string on a page. **Fix (`01`):** H1s become `— מהמטבח של המסעדה, אצלכם.`; the staffed-service claim lives only in `<ServiceMenus>` behind its gate. Add `הצוות שלנו בשטח|עם מלצרים` to the honesty grep until `SERVICE_FORMATS.plated_staffed.offered === true`.

**A2. `/catering/dairy` H1 makes an unsubstantiated price-comparison claim.**
`01` P-14: `קייטרינג חלבי איטלקי — אותו תקציב, שולחן עשיר יותר.` "Same budget, richer table" is a comparative claim about price-to-value with zero price data on the site and `PRICING` empty by construction. This is exactly the `ס' 2(א)` comparative-claim class the consumer-law research says must be substantiable. **Fix:** `קייטרינג חלבי איטלקי — מהמטבח של המסעדה.` The dairy argument belongs in body copy as a category fact ("the Israeli market's own argument"), attributed, not as a claim about our pricing.

**A3. The home lede claims every listed dish is cooked daily at all three kitchens.**
`01` P-01: `…שלושה מטבחים פעילים: הרצליה פיתוח, רעננה ופתח תקווה. מה שכתוב כאן מתבשל שם כל יום.` This directly contradicts `01` §3.2, which gates the provenance mark per branch precisely because a dish is not necessarily on every branch's live menu (`dish.branches` may be a subset, `liveMenuUrl` may be absent). The lede asserts blanket what the dish row is forbidden from asserting per-row. **Fix:** `…מה שכתוב כאן מתבשל במטבחי המסעדה.` — drop `שם` and `כל יום`, or make the sentence a `<Slot>`.

**A4. `/catering/holidays` H1 asserts an unconfirmed packing/labelling practice.**
`01` P-12: `ארוחת {חג} מהמטבח של המסעדה — ארוזה, מסומנת ומוכנה להגשה.` Whether food is packed and labelled for holiday collection is an operational fact nobody has supplied (it is not in the owner list at all). **Fix:** drop the three adjectives or route them through `content/seasons.ts` Slots.

**A5. `/catering/business` H1 makes a punctuality promise with no backing Slot.**
`01` P-08: `ארוחת צוות שמגיעה בשעה שאמרנו…` while `OpsFacts.DELIVERY_WINDOW` is a Slot that may be empty on that very page. A delivery-time promise in an H1 is an operational commitment. **Fix:** either gate the H1 variant on `DELIVERY_WINDOW` being filled, or use `ארוחת צוות מהמטבח של המסעדה, בהרצליה פיתוח.`

**A6. Invented dish names are used as ready-to-copy examples, twice.**
`02` §4.1 and §6.4: `מהתפריט: פפרדלה רגו · קרפצ׳ו · טירמיסו`. Which dishes exist and are catering-available is **O-0, the single blocking owner fact of the entire direction**. Three plausible Italian dish names in a code-adjacent example is exactly the "spec example is the most-copied string in a build" failure the prior review named (A6). **Fix (`02`):** `מהתפריט: {{DISH_1}} · {{DISH_2}} · {{DISH_3}}`.

**A7. `02` §2.3 prints a worked price example.**
`‹span dir="ltr"›8,000 – 14,000 ₪‹/span›`. `03` §0.4 states the rule this violates: "no example in §7 contains a … price." A five-figure event total in a spec is a number someone will paste. It also contains an en-dash between digits, which `03` L-14's own CI gate would reject if copied verbatim. **Fix:** `‹span dir="ltr"›{{LO}} – {{HI}} ₪‹/span›`.

**A8. The reassurance line is false by construction, not merely unconfirmed.**
`02` §3.10 ships `לא שולחים ניוזלטר ולא מעבירים את הפרטים לאף אחד.` and hedges it on an owner answer. But `02` §11.2 **specifies** that every lead's first name and raw dialable phone are POSTed to a third-party automation vendor (`NOTIFY_WEBHOOK_URL` → Zapier/Make/n8n), described in the same document as "a `מחזיק` and almost certainly a cross-border transfer." The sentence is untrue given this spec's own architecture. **Fix:** delete the second clause outright; keep `לא שולחים ניוזלטר` (enforceable by the consent column) and let the collection notice name the software provider, which it already does (`וספק התוכנה שמאחסן את האתר`) — extend that phrase to cover the notification vendor.

**A9. Guest bands are built on the competitor figure the prior review flagged.**
`02` §3.3 renders `עד 25` and `בין 25 ל־50` as visible options. §2.7 argues bands "carry no commercial meaning" — a real argument, but a buyer reading `עד 25` as the first tier reads a threshold, and 25 is eden-c's published minimum (prior review A1). It is also self-defeating: `03` §14's gate `'מ־?\s*25\b|\b25 סועדים|עד 25\b'` exists specifically to block that number. **Fix:** use boundaries with no competitor provenance (e.g. `עד 30 / 30–60 / 60–120 / 120–250 / 250+`, written in connector form) and state in §2.7 why the boundaries were chosen, or make the band list itself a `config/quote.ts` value the owner signs off.

**A10. §2.5's downgrade fires on the wrong bands.**
`02` §2.5: "if the visitor's band **floor** is below `MIN_GUESTS`". With `MIN_GUESTS = 40`, the band `בין 25 ל־50` has floor 25 and triggers `מתחת ל־40 סועדים קייטרינג מלא פשוט לא משתלם לכם` for a buyer with 45 guests — turning away a qualified lead. **Fix:** trigger on band **ceiling** `< MIN_GUESTS`; for a straddling band show nothing.

**A11. The `/thanks` unknown-ref copy echoes the raw URL parameter into the DOM.**
`01` P-18: `לא הצלחנו לטעון את סיכום הפנייה. שמרו את הקוד {ref} ודברו איתנו.` — while `02` §5.2 says of the malformed case "**Never echo the raw param back into the DOM.**" `01` is both the contradiction and the injection surface. **Fix:** `01` adopts `02`'s copy verbatim; ref is only rendered after matching `/^MM-[2-9A-HJ-NP-Z]{6}$/`.

---

## B. CONTRADICTIONS BETWEEN THE THREE SPECS

**B1. `client/src/data/locations.ts` is defined twice, incompatibly.**
`01` §6.1: `street`, `phoneE164`/`phoneDisplay`, `whatsappE164`, `hours: {days,opens,closes}[]`, `chef:{nameHe,roleHe,consent}`, `servesAreas: {cityHe,driveMinutes,minimum,fee}[]`, `accessibility`, `mapImage`, `photos`, `cutoff`, `capacityPerDay`.
`02` §3.7: `address`, `telE164`/`telDisplay`, `waNumber`, `hours: OpeningHours`, `chefName: string|null`, `servesAreas: string[]`, `liveMenuUrl` (on the *branch*, not the dish). Neither is a subset of the other. `01` §6 claims ownership of data contracts. **Fix:** delete the interface from `02` §3.7 and replace with a one-line pointer to `01` §6.1; then `02` §9.1 step 6 and §6.5 `waNumberFor()` must be rewritten against `phoneE164`/`whatsappE164`. Do the same for **`data/menus.ts`**, defined twice (`01` §6.2 `branches` / `cateringAvailable: boolean` / `"gluten-free-ingredients"` / course `"platters"` vs `02` §4.2 `servedAtBranches` / `cateringAvailable: boolean|null` / `gluten_free_ingredients` / no `platters`, plus `serviceFormats` which `01` omits).

**B2. Branch identifiers exist in three forms with no stated mapping.**
`herzliya-pituach` (`01` `BranchSlug`, `02` `Branch.slug`, `LEGAL.KASHRUT_BY_BRANCH` keys), `herzliya_pituach` (`02` `branchEnum`, `BRANCHES` in `shared/lead-schema.ts`), `herzliya` (`03` §7.2 `<WaButton branch="herzliya">`, §7.19 `<GoogleReviews branch="herzliya">`). **Fix:** one canonical `BranchSlug` in `shared/`, hyphenated; the pg enum values match it; `03`'s examples updated. Add a unit test asserting `Object.keys(LEGAL.KASHRUT_BY_BRANCH) === BRANCHES`.

**B3. `/catering/shiva`'s sticky bar has three different values.**
`01` §2 table and `01` P-11 body: `stickyBar: 'phone'`. `02` §1.2: "**Required on `/catering/shiva`**" = `none`. `02` §1.7 table: `none`. `03` §7.29: `none` used on `/catering/shiva`. This is the exact item prior review B10 raised, and it is now wrong in the *architecture* spec, which is authoritative for `RouteDef`. **Fix:** `01` §2 and P-11 → `none`. (Note `01` P-11 then also loses its "the bar carries a phone link and WhatsApp only" sentence.)

**B4. `/quote`'s sticky bar contradicts too.** `01` §2: `none`. `02` §1.7: `quote`. `02` is right (the builder page still wants a WhatsApp escape). Fix in `01` §2.

**B5. The builder-render rule is coupled to the wrong field and produces a builder on `/thanks`.**
`01` §3.1: "`QuoteBuilder` renders when route's `stickyBar !== 'phone'` and route is not `/catering/shiva`." `/thanks`, `/summary`, `/unsubscribe`, `/privacy`, `/terms`, `/accessibility`, `/404` all carry `stickyBar: 'none'` and therefore satisfy that predicate. **Fix:** add `hasBuilder: boolean` to `RouteDef` (`01` §5.1) and drive the spine from it. While there, add the two other fields `03` already references and `01` does not define: `ctaMode: 'quote'|'phone'` (`03` §7.1, §7.29) and a `preseed` map (`02` §1.7 requires per-route pre-seeding "from `RouteDef`" for `/lp/:campaign`).

**B6. Section numbering disagrees three ways, while `01` forbids hardcoded numerals.**
`01` §3.1 assigns numerals "**at render time by position**". Yet `02` §3 hardcodes `05 · התפריט שלכם` and §3.5 places limits in "page section 03"; `03` §12.1 numbers `03 · inclusions/exclusions/limits`, `04 · kitchens`, `05 · builder`, `06 · FAQ`, `07 · contact` — collapsing `<LimitsBlock>` (G9, `01`'s section 04) into inclusions and shifting everything after it. **Fix:** strip every literal section number from `02` and `03` prose; refer to sections by component name only. `01` §3.1's table is the single source.

**B7. The builder is "4 questions" in `02` and "5" in `03`.**
`02` §3.1: `שאלה {n} מתוך 4`, screen 5 labelled `פרטים ליצירת קשר`; `01` P-17 title `4 שאלות`. `03` §7.24: `/* "שאלה 2 מתוך 5" */`. Fix `03`.

**B8. `/unsubscribe` uses two different tokens, and `01`'s is a security defect.**
`01` P-20: `/unsubscribe?ref=MM-XXXXXX`, "No auth beyond the ref." `02` §9.7: `?t={unsubscribe_token}`, a 32-char random string "unrelated to `ref`". `01`'s version lets anyone holding a ref code — which is printed in a WhatsApp message, read aloud on the phone, and appears on a forwardable `/summary` link — unsubscribe that person, and the ref space is small enough to probe. `02` is correct; fix `01`.

**B9. The dish-selection state has two homes.**
`01` §6.3: `localStorage.mm_brief_v1`, cap 20, 14-day expiry, `useBrief()`. `02` §4.1/§7.1: "Selections persist in `localStorage` **under the builder draft**" (`mm_quote_draft`, 7-day restore), and `quoteLeadSchema.selectedDishes` caps at 40. Three different caps/lifetimes for one list. **Fix:** one key, `useBrief()` owns it, the draft references it; cap once (40, matching the zod schema) in `config/quote.ts`.

**B10. `01` says a column is missing that `02` already defines, under a different name.**
`01` §6.3: "Persisted to the lead as `leads.selected_dish_ids text[]` — a column `02` does not currently define and must add." `02` §8.2 defines `selectedDishes: text("selected_dishes")`. `01` Wave 0 task 0.7 also lists `wa_ref_code`, which does not exist in `02`'s schema (it is `ref` + `ref_aliases`). Fix `01` §6.3 and 0.7 to match `02` §8.2 exactly, column-for-column.

**B11. Analytics event names still diverge after the prior review closed B9.**
`01` §6.4 demands `branch_click` and `brief_to_builder` and states "`kitchen_page_click` from the first pass does not exist; the correct name is `branch_click`." `02` §14.2 ships `kitchen_page_click` and has no `brief_to_builder` at all — while `01` P-02's stated conversion goal is `add_to_brief → brief_to_builder`. `event_page_click` params also differ (`source_page, event_type` vs `target_route, source_page`). **Fix:** `02` §14.2 is the closed union; add `brief_to_builder`, rename to `branch_click`, reconcile params; `01` §6.4 becomes a pointer, not a second table.

**B12. Stale cross-references, four kinds.**
- `01` §5.7 and `02` §0.5 both cite "`03` §11.3" for the `ui/` retention list and package removals. `03` §11 is the print sheet; the delete list is **§13.3**.
- `01` §0.1 cites `PastEvents` (§4.4) and `GoogleReviews` (§4.5); `01` §3.4 and §5.7 repeat §4.5. `01` §4 is page contracts P-01…P-27; neither section exists.
- `01` §5.7 cites "`tasting-band.tsx` … §6.2" — §6.2 is `menus.ts`.
- `02` cites "§13" for the CI gates in §2.2 and §3.11; the gates are **§16** (§13 is the admin view). `02` §0.3 cites "`01` E3" — that is a *prior-review* section, not a section of `01`.

**B13. The `<Photo>` empty state is forbidden by `01` and specified by `03`.**
`01` §0.2: "every `<Photo>` call site sits inside a block that renders correctly with the photo omitted entirely (**not with a placeholder frame in its place**)." `03` §7.26 renders the labelled paper frame as the standard no-`src` state, and `03` §12.2 half-retracts it ("legitimate only where a specific photograph is briefed"). **Fix:** one rule. Recommended: `<Photo>` renders `null` unless `expect={true}` is passed, and `expect` is only set on the ≤3 briefed slots in the kitchens band. Then `03` §14's "no route produces an empty `<figure>`" gate becomes meaningful.

**B14. `03` §14's honesty grep will fail the build on legitimate CSS.**
`g "hardcoded guest minimum" 'מ־?\s*25\b|\b25 סועדים|עד 25\b|מינימום\s*\d'` — the first alternative has no leading anchor, so it matches a bare `25` followed by a word boundary: `opacity:.25;`, `gap: 25px` is safe but `flex:.25` , `translateY(-25%)`, `width:25%` all match. A blocking gate that fires on `opacity:.25` is a gate someone deletes in week two — which `03` §16.5 itself warns about. **Fix:** `(מ־|מ-)\s*25\b|\b25\s*סועדים|עד\s*25\s*סועדים`.

---

## C. RESEARCH OBLIGATIONS STILL UNIMPLEMENTED

**C1. `04-legal-and-content.md` still does not exist.** It is now correctly assigned (`01` task 0.14, blocking Wave 2 track E) but it owns: the rewritten `/privacy`, the rewritten `/terms` including the two-tier distance-selling cancellation clause, the honest accessibility statement, the allergen statement, the marketing-consent wording, the collection-notice final wording, `LEGAL.PRICE_ESTIMATE_NOTE`, the kashrut sentence's frame, and the `docs/privacy/*` set. Three specs defer to it 20+ times. It is the largest remaining hole and nothing in this pass reduced it.

**C2. The WhatsApp path — the site's primary channel — has no `סעיף 11` notice.**
INV-6 (`01` §0.4): "Every collection point carries the `סעיף 11` notice, **inside the form component**." `POST /api/wa-intent` writes a `leads` row (attribution, area, event type, and in Phase 2 the visitor's phone via `wa_id`) with **no form and therefore no notice anywhere**. The sticky bar's WhatsApp button on every route is an unnoticed collection point. **Fix (`02` §4/§6.7, `03` §7.2):** a one-line notice + policy link adjacent to every `<WaButton>` (`בלחיצה נשמרת פנייה עם פרטי האירוע. [מדיניות הפרטיות]`), and the same line in `<WaReturnPanel>`. Extend the CI "notice presence" gate to any route rendering a `<WaButton>`.

**C3. The `/thanks` enrichment field contradicts `02`'s own medical-data rule and has no notice.**
`02` §3.8 forbids allergen/dietary data entering `leads` ("Dietary and allergen data is collected **after booking**, over the operational channel, into the event file — never into `leads`"). `02` §5.2 + §9.5 then put a free textarea on `/thanks` whose placeholder is `טבעונים, שעת הגשה מדויקת, חניה` and `PATCH`es it into **`leads.notes`**. `טבעונים` is an invitation to describe diners' diets; the next word a real user types is `אלרגיות`. It also carries no collection notice. **Fix:** placeholder becomes `שעת הגשה מדויקת, חניה, גישה לאתר` with an explicit `אין למסור כאן מידע רפואי`, and add the same 18+/no-medical line that screen 5 carries.

**C4. No spec makes an outgoing marketing message lawful.**
`ס' 30א` requires every advertising message to carry the word **`פרסומת`**, the sender's name and contact details, and a working refusal mechanism. `02` §9.7 builds the refusal mechanism and the send filter, and stops there. `02` §6.6 approves a MARKETING template with no content requirements. **Fix (`02` §9.7 or `04`):** a stated message contract — `פרסומת` in the first line, sender legal name, the `/unsubscribe?t=` link — plus a CI/test assertion on the template body, since the templates are pre-approved artefacts.

**C5. Retention deletes leads but not the two tables that mirror them.**
`02` §7.4 purges `leads` and `quote_drafts`. `lead_events.payload` is a `jsonb` blob written on every status transition and every failed upload, and `call_events` stores `from_e164` — a phone number, i.e. personal data — with **no retention at all** and no `matched_lead_id` cascade. Hard-deleting the lead leaves both. **Fix:** `ON DELETE CASCADE` from `lead_events.lead_id`, an independent `call_events` retention (owner-supplied, same Slot pattern), and a rule that `lead_events.payload` may never contain a lead field value (assert it in the existing "No PII in logs" test).

**C6. Photo and testimonial consent is still asserted and never persisted.**
Prior review C4 is only half fixed: `01` §0.1 correctly deletes the three orphaned tables and the `seed.ts` block that strips `consentGiven`. But `<PastEvents>` (`01` G16, `03` §7.20) is the replacement, and **no spec defines its record**, unlike `Dish` and `Branch`. `03` §7.20 says a quote and a first name are added "where the owner supplies documented written consent" with no field to store the documentation. **Fix (`01` §6):** a `PastEvent` type — `eventType, guests, cityHe, month, quoteHe?, firstNameHe?, consentSource, consentedAt` — with the component refusing to render `quoteHe`/`firstNameHe` unless both consent fields are set. Same two fields on `Branch.photos[]`.

**C7. The Israeli consent notice has no component, no copy and no owner.**
`02` §10.3 requires, for Israeli traffic, "a prominent, non-dark-pattern notice and a one-tap opt-out" the moment GA4 or Meta Pixel ships. `03` §7 specifies no such component; `01` §5.9 specifies only the injection gate. Nobody owns its layout, its persistence key, its interaction with `mm_attr`, or its Hebrew text. **Fix:** name it (`<MeasurementNotice>`), put the visual contract in `03` §7, the state and the storage key in `02` §12.3, and the copy in `04`.

**C8. `<Photo alt>` is optional; `caption` is required.**
`03` §7.26: `caption: string;` (required) but `alt?: string`. An `<img>` rendered without `alt` fails 1.1.1 outright; with an adjacent `<figcaption>`, `alt=""` is the correct value but it must be **present**. **Fix:** `alt: string` required (empty string permitted and documented as the default for caption-adjacent images), and a CI assertion that every `<img>` in a rendered route has an `alt` attribute.

**C9. Only Google Business Profile links ship as social proof.** The research names `rest.co.il`, `easy.co.il` and `mit4mit` listings as existing, legitimate, reusable credibility the restaurants may already hold. `<GoogleReviews>` is single-vendor. Cheap fix: rename to `<ExternalProfiles>` and take `Branch.profiles: {label, url}[]`, still rendering zero numbers.

---

## D. UNBUILDABLE OR BROKEN AS WRITTEN

**D1. The per-route byte budget fails on day one and will be the first gate disabled.**
`03` §14: "shell JS ≤45 KB gzip (≤16 KB if the preact path is taken) … landing-route JS ≤14 KB", *failing the build*. The measured entry chunk for react + react-dom + wouter + App with react-query already removed is **49.2 KB gzip** — over budget before a line of app code. And `shared/lead-schema.ts` is zod, "imported by both client and server" (`02` §8.3); zod alone is ~17 KB gzip and lands in the builder's chunk, exceeding the 14 KB route budget by itself, before react-hook-form (~14.5 KB), which `03` §13.3 retains via `ui/form.tsx`. **Fix:** decide the preact question explicitly in `01` Wave 0 (it is currently mentioned only as a parenthesis in a budget line); or set the React-path budgets from a measured baseline (shell ≤52 KB, route ≤34 KB with the builder) and state that the tight numbers are the preact target. Alternatively make the client validator hand-written (~12 lines, per the perf research) and keep zod server-only — which also removes the `.strict()` client dependency.

**D2. `useReveal()` as written leaves lazily-loaded route content permanently invisible.**
`03` §5 ships `.reveal{opacity:0}` as a base rule; `03` §8's hook is `useEffect(..., [])` and queries `document.querySelectorAll('.reveal')` once. `01` §5.2 mounts routes behind `React.lazy` **inside** `SiteLayout`, which mounts once. Every element rendered by a route that mounts after the layout — i.e. every route — is never observed and stays at `opacity:0`. **Fix:** either re-run on `location` change (`useEffect(..., [location])` from `wouter`'s `useLocation`) plus a `MutationObserver`, or make `.reveal` opt-in via a component that self-observes on mount. Also add a CI assertion that every route renders visible content with JS disabled or IO unavailable — right now a single JS failure yields a blank white page on a lead-gen site.

**D3. The server cannot import the content it needs.**
`server/seo/head.ts` needs addresses, geo, hours and chef names for JSON-LD; `GET /api/quote/:ref` must return "the rendered inclusions / exclusions / terms strings **resolved from config**" (`02` §9.3); `POST /api/quote` step 6 must "resolve `branch` from `area` via `locations.ts`"; `11.4` gates on `LEGAL.ANSWERING_HOURS` server-side. All of those modules are specified under `client/src/{data,config,content}/`. `tsconfig` maps `@/*` → `client/src/*`, but the server build is `esbuild server/index.ts --packages=external --bundle` with **no alias configuration**, so `@/…` will not resolve. **Fix:** move `locations.ts`, `menus.ts`, `legal.ts`, `service-formats.ts` and `pricing.ts` to `shared/` (they are plain data with no React), keep `client/src/content/*` for page copy, and update `01` §5.7's tree and every import path in `02`.

**D4. The head layer is specified only for the production path.**
`01` §5.1 targets `serveStatic()` and says it "mirrors the existing `template.replace()` pattern in `server/vite.ts`" — but that pattern lives in `setupVite()` (the dev path, `server/vite.ts:44-59`), and `serveStatic()` (`:82`) does a bare `sendFile`. If injection lands in only one, the whole team develops against wrong titles, wrong canonicals and no JSON-LD, and the difference surfaces at launch. **Fix:** one `renderHead(html, routeDef, params)` function called from both branches, plus a test that dev and prod emit identical head blocks for three sample routes.

**D5. The CSP as written breaks the dev server.**
`01` §5.9 / `02` §14.8: `script-src 'self' 'nonce-{N}'; connect-src 'self'`. Vite dev injects inline scripts and `@vite/client` opens an HMR WebSocket; both are blocked. **Fix:** state that the CSP is emitted only when `NODE_ENV === 'production'`, or add a dev variant with `'unsafe-inline' 'unsafe-eval'` and `connect-src 'self' ws:`. Also: `frame-src 'none'` plus `<iframe>` banned in `03` §14 is consistent — good — but note `img-src 'self' data:` must gain `blob:` if the sharp manifest ever produces client-side previews.

**D6. `robots.txt` disallows the pages whose whole value is being forwarded on WhatsApp.**
`01` §5.1: `Disallow: /admin, /lp, /thanks, /summary, /unsubscribe`. `/summary` and `/thanks` are already `noindex`; adding a `Disallow` means a crawler cannot read the `noindex` (the classic conflict), and link-preview fetchers that honour robots.txt will not generate the preview card — on the exact forwarding mechanic the direction's terminal artefact depends on. **Fix:** `Disallow: /admin, /lp` only; rely on `noindex` for the rest.

**D7. `<BranchMap>`'s static image has no licence story and an impossible caption.**
`01` P-04 / `02` §10.3 / `03` §7.17 all specify a build-generated static map committed to `client/public/maps/{slug}.png`. Google's Static Maps terms prohibit storing/caching tiles; an OSM-based generator carries mandatory attribution that no spec renders. And `03` §7.17 puts the map "inside a `.photo` frame", where the Caption Law demands `{n} · {סניף} · {רחוב} · {מה קורה} · {שעה}` — meaningless for a map. **Fix:** name the tile source and its attribution string in `01` 0.11 (`scripts/maps.ts`), render the attribution under the image, and exempt `<BranchMap>` from the caption format (it takes `alt` = the address and no `figcaption`).

**D8. Client-side title updates are unspecified.** `01` §5.1 injects the head server-side; nothing updates `document.title`, the canonical or `og:` on a wouter client-side navigation. Every SPA navigation keeps the previous title in history, in the browser tab, and in any analytics `page_view`. **Fix:** a `useRouteHead(routeDef, params)` hook in `SiteLayout` that sets `document.title` and the canonical link on `location` change, reading the same `HeadDef` resolver.

**D9. `02` §2.2's `estimateEnabled` references `LEGAL` with no import**, and its default parameter `legal = LEGAL` creates a circular dependency between `config/pricing.ts` and `content/legal.ts` if `legal.ts` ever imports pricing types. Trivial, but it is presented as literal code.

---

## E. MISSING STATES, PAGES AND EDGE CASES

**E1. No error boundary and no chunk-load-failure state.** `01` §5.4 specifies `RouteShellSkeleton` for pending; nothing covers rejected. A `React.lazy` import fails routinely when a user has an old tab open across a deploy — the result today is a blank page on a conversion route. **Fix:** an error boundary inside `SiteLayout` rendering the `/404`-style recovery block (phone + WhatsApp + `רעננו את הדף`), plus a `window.addEventListener('vite:preloadError')` reload-once handler.

**E2. Draft restore versus route pre-seed is undefined.** `02` §7.1 restores a 7-day-old draft on mount; `02` §1.7 pre-seeds `eventType` from the route. A visitor with a saved `שמחה פרטית` draft landing on `/catering/business` gets an undefined outcome — and whichever wins silently mislabels a lead, the failure mode §1.7 calls "worse than a missing one." **Fix:** the route pre-seed wins for its own field, the restore banner names the conflict (`המשכנו מאיפה שעצרתם — שינינו את סוג האירוע לפי הדף`), and the value stays visible and editable.

**E3. Stale dish ids in a restored brief.** `useBrief` persists dish ids for 14 days; `menus.ts` is owner-edited. Ids that disappear or lose `cateringAvailable` will render as blanks in the brief card, travel into the WhatsApp prefill, and land in `selected_dishes`. **Fix:** filter the restored brief against the current module on hydration and drop unknown ids silently; the server does the same before insert.

**E4. `/summary` has no network-failure state and no `og:` definition.** `02` §5.2 defines absent/unknown/malformed `ref`; it does not define `GET /api/quote/:ref` timing out or returning 5xx (the page is client-rendered from it). And since the page's entire purpose is being forwarded on WhatsApp, its `og:title`/`og:image` matter — but `01` §5.6's generated card is keyed on `routeId`, so every forwarded summary shows an identical generic card. **Fix:** a `שגיאת רשת` state with the phone number; and state explicitly that `/summary` uses the site-default `og:image` and a generic `og:title` (never the buyer's event details, which would leak into a link preview in a group chat).

**E5. Overlapping holiday seasons are undefined.** `01` P-12's `Season.active` ranges are owner-signed; two can overlap (Sukkot/Rosh Hashana). No precedence rule. **Fix:** first match in array order, asserted by a unit test that no two active windows overlap.

**E6. `/admin/leads` has no empty state, no invalid-token state and no logout.** `01` P-24 specifies five panels and the statistical discipline; nothing says what renders on a 401, on zero leads, or how a token is cleared from `sessionStorage`.

**E7. Two Slot registries with different names for the same fact.** `01` uses `SLOT.TASTING_POLICY`, `SLOT.STATIONS`, `SLOT.CHEF_{BRANCH}`; `02` puts the first in `LEGAL.TASTING_POLICY` (`content/legal.ts`) and `01` §6.1 puts the chef in `locations[branch].chef`. `03` uses `SLOT.TASTING_POLICY`. **Fix:** one registry — `content/slots.ts` re-exporting from the typed sources — and a single naming convention stated in `01` §6.

**E8. `/catering/fun-day`'s `#gibush` anchor is incoherent.** `01` P-08: "anchor `#gibush` **linking to** `/catering/fun-day` while that page is unbuilt." An in-page anchor and a cross-page link are different things, and `useHashScroll` handles only the former. State which it is.

---

## F. GENUINELY COMPLETE — no padding

- **`03` §2 (colour)** remains the strongest section in the set; the `--ink-3` correction to 5.44:1 and the `--line` / `--line-strong` split are real defects in the design reference, correctly measured and correctly fixed. Nothing to add.
- **`03` §4.9 (bidi) and §4.6–4.7 (numerals, currency, phone)** are complete and correct, including the `<bdi>`-does-not-help and `formatRange` findings.
- **`02` §6.3 (the same-tick WhatsApp handoff)** and **§6.8 (ref collisions, dedup, escalation exclusion)** close prior review D11 completely; the four "will be optimised away" comment rules are the right artefact.
- **`02` §10.1–10.2 (attribution capture and the server-side merge)** closes D4; the precedence rule and the `secure`-from-`NODE_ENV` note are exactly right.
- **`02` §14.4–14.6 (Ads mapping)** — the June-2026 API cutoff, the 90/63-day windows, and the closed-won-cannot-be-the-bid-target argument are all correct and need nothing.
- **`03` §11 (print) and §12 (the zero-photograph contract)** are the two sections that make the direction rebase real rather than declared, and §12.4 states the cost honestly.
- **`01` §0.1 / `02` §0.2 / `03` §13** — the deletion lists are now consistent with each other and with the tree at HEAD, including the four unlawful `terms.tsx` clauses the prior review added (C7).