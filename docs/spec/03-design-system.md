# 03 · Design System Spec — מאמא מיה קייטרינג

**Status:** normative. Where this document conflicts with `client/src/index.css`, `tailwind.config.ts`, or any component in `client/src`, this document wins and the code changes.
**Branch:** `claude/catering-landing-page-dbvbbx`
**Direction:** **תפריט / TAFRIT — "the menu is the site."** The page is a restaurant's printed menu that happens to take orders for events. Type carries the page; photography is a ration, not a foundation.
**Substrate:** `docs/design-reference/` is the canonical visual source. This document ports it, corrects its measured defects (contrast of `--ink-3`, bidi-reversing ranges, `font-style:italic` on Hebrew, `text-transform:uppercase` on Hebrew, unqualified `--line` on form borders, `font-weight:300` on Hebrew body), and adds what it lacks (numeral handling, the dish-row grammar, logical properties, focus system, error presentation, component contracts, the print sheet).

**Companion specs.** `01-site-architecture.md` owns routes, page contracts, content modules and build order. `02-lead-machine.md` owns the quote builder logic, schema, WhatsApp handoff and analytics. `04-legal-and-content.md` (to be written — see `00-prior-review.md` C1) owns the privacy policy, `terms.tsx`, the accessibility statement and every legally operative string. **This document owns tokens, typography, components, motion, RTL and accessibility primitives — nothing else.**

> **Filename note.** The authoritative filenames are `01-site-architecture.md`, `02-lead-machine.md`, `03-design-system.md`, `04-legal-and-content.md`. Any cross-reference in another spec to `01-design-system.md`, `03-architecture.md` or `05-*` is stale; fix it when that file is next touched, do not create files under the old names.

---

## 0. Preconditions

### 0.1 The direction correction that produced this revision

The first pass of this document was written against **המטבח כמסמך** (Kitchen as Document), a photography-led direction, because of a tally bug in the judge panel. The corrected winner is **TAFRIT**. The practical consequence is not cosmetic:

- There are **zero photographs of this business in the repo today**, and what eventually arrives will be owner-supplied phone photos of unknown quality, shot in three different restaurants at three different times of day on three different phones.
- A system whose hero is a photograph has a floor of "grey captioned rectangle."
- A system whose hero is **type set as a menu leaf** has a floor of *a menu* — which is a finished artefact, and the one asset the client already owns.

**Therefore the binding requirement on every rule below: the system must be fully convincing at zero photographs, and must improve when real ones land.** §12 is the explicit contract for that. Any component whose empty state is "an empty box" has failed the direction and must be redesigned, not documented.

### 0.2 The token replacement is Wave 0, before any component work

`--golden: hsl(43,74%,49%)` = `#d9a520`. Measured: **2.25:1 on white, 2.12:1 on `--warm-white`, 2.25:1 for white text on gold.** It fails WCAG 1.4.3 (4.5:1 normal text), 1.4.3 large-text (3:1) and 1.4.11 non-text (3:1). It is applied to **every** primary CTA on the site (149 `bg-golden` / `text-golden` / `border-golden` / `hover:bg-dark-golden` occurrences across 23 files) and to every `focus:ring-golden`.

**The palette is replaced at token level in one commit, before any section is restyled.** Restyling a section against the old tokens reproduces the failure in new code. Sequence: §5 (`index.css`) + §6 (`tailwind.config.ts`) + §13 (delete list) land together; component rewrites follow.

Gold cannot be rescued by darkening. The accessible variant `--dark-golden` reaches 5.41:1 but reads as mustard-brown — it stops being the brand colour it was chosen for. The replacement is not "a darker gold"; it is a different system, and it requires **written owner approval before the restyle lands** (§15, O-11).

### 0.3 This document assumes the honesty deletions have shipped

`01` §0.1 and `02` §0 both list them. They are still in the working tree at HEAD. Nothing here may be built on top of `hero.tsx:70` (`כשר בד"ץ` badge), `testimonials.tsx` (fabricated names + hardcoded `Google 4.9/5 · 247 ביקורות`), `price-calculator.tsx` (invented ₪ table) or `footer.tsx:12` (`25 שנות ניסיון`). Restyling them re-endorses them with better typography.

### 0.4 The rule that overrides every other rule in this document

**If a fact is not owner-supplied and not already verified in the repo, it is a `<Slot>`. Never a plausible default.** This applies to examples inside this spec as well as to shipped code: no example in §7 contains a guest minimum, a price, an address, an hour, a kashrut sentence, a delivery area or a response time. Where an example needs one, it carries a token. A spec example is the single most-copied string in a build.

---

## 1. Design law — the invariants the token system exists to enforce

These are not aesthetics. Each one is checkable in CI (§14).

| # | Law | Mechanism |
|---|---|---|
| **L-1** | **Type carries the page.** Every section must be complete and persuasive with no image present. A section that reads as unfinished without a photograph is a design defect, not a content gap. | §12 zero-photo contract; render-test each route with the image manifest empty. |
| **L-2** | **Zero photography above the fold.** No image may render before the first `<h1>`'s CTA pair in DOM order, on any route, at any breakpoint. | CI: first `<img>` in the rendered route appears after `[data-cta-pair]`. |
| **L-3** | **Photo ration: max three per route,** exactly one `priority` (the LCP candidate is text on most routes; see §4.2). | CI: `count(<Photo src>) ≤ 3`, `count(priority) ≤ 1` per route. |
| **L-4** | **Caption Law.** Every photograph that ships carries a visible caption in the fixed format `{n} · {סניף} · {רחוב} · {מה קורה} · {שעה}`. | `<Photo>` has a **required** `caption` prop (§7.26). `tsc --noEmit` fails without it. |
| **L-5** | **Slot-or-nothing.** Unfilled facts prune the **smallest containing unit**: clause → row → cell → section. Never a plausible default; never an empty highlighted box in production. | `<Slot>` + `<SlotGroup>` (§7.30); dev highlight, prod null-render, `blocking` throws at build. |
| **L-6** | **Degrade to a menu, never to a gap.** Any tabular structure whose values are unfilled collapses to a menu-style list, not a gapped grid. An incomplete table reads as an unfinished quote; an incomplete menu reads as a menu. | `<HairlineTable>` `collapse="menu"` (§7.9); `.dish` grid drops to `1fr` (§7.7). |
| **L-7** | **Tomato ration.** The accent occupies ≤ ~2% of any viewport's pixels and never a fill larger than 200×200px. Buttons default to `--ink`. | Review gate; no `bg-accent` on any element with `min-height > 200px`. |
| **L-8** | **No shadows.** Separation is 1px hairlines and `gap:1px` grids whose gutters read as printed rules. Three named exceptions only (§3.5). | CI: `box-shadow` grep with a three-line allowlist. |
| **L-9** | **At most one ink band per route,** and where it exists it is the kitchens band. | CI: `count(data-band="ink") ≤ 1`, and if 1 then `data-band-id="kitchens"`. |
| **L-10** | **One filled primary CTA per viewport**, max two visible CTAs. `הזמינו עכשיו` is banned. **The sticky mobile bar is chrome, not content, and is exempt — but it may contain exactly one filled control** (§7.29). | Review gate + copy grep. |
| **L-11** | **Radius is 3px.** The only pill is the `--fs-2xs` tag chip and the 2px progress bar. | CI: no `rounded-full` / `rounded-2xl` / `rounded-3xl` outside `.tag`. |
| **L-12** | **Logical properties only.** | CI grep bans `ml-`, `mr-`, `pl-`, `pr-`, `left-`, `right-`, `text-left`, `text-right`, `space-x-`, `divide-x-`, `border-l`, `border-r`, `rounded-l`, `rounded-r`, `float-left`, `float-right` in `client/src`. |
| **L-13** | **One motion primitive** (`reveal`), zero infinite animations, no carousel, no rotating headline, no count-up. | CI: no `animation-iteration-count: infinite`, no `infinite` in keyframe shorthand. |
| **L-14** | **No en-dash between digits** in Hebrew copy — it renders **reversed** (§4.9). | CI: `\d\s*[–—]\s*\d` over `client/src`. |
| **L-15** | **Hebrew is never italic.** | Global `font-style:normal` reset (§4.8) + `italic` class banned. |
| **L-16** | **The menu prints.** Sections 01–02 render as a single-colour A4 menu with no CTAs, no nav and no grain. | §11; print snapshot test on the home route. |

---

## 2. Colour

### 2.1 The full token set, with measured contrast

All ratios computed with the WCAG 2.x relative-luminance formula from the literal hex values below. "AA text" = ≥4.5:1 (normal text). "AA large" = ≥3:1 (≥24px, or ≥18.66px bold). "AA non-text" = ≥3:1 (UI component boundaries, focus indicators, meaningful graphics).

**Surfaces**

| Token | Hex | Role |
|---|---|---|
| `--paper` | `#fbf8f3` | default page surface |
| `--paper-2` | `#f4eee4` | alternating band (`.sec--alt`), inline info boxes, estimate box |
| `--paper-3` | `#ece3d5` | the quote-builder band, one per page |
| `--surface-hover` | `#ffffff` | **hover state only.** Pure white is never a resting surface. |
| `--ink` | `#1e1a17` | text, button fill, the single dark band, footer |

**Text on paper**

| Pair | Ratio | Verdict |
|---|---|---|
| `--ink` `#1e1a17` on `--paper` | **16.31:1** | AA + AAA ✅ |
| `--ink` on `--paper-2` | **14.97:1** | ✅ |
| `--ink` on `--paper-3` | **13.59:1** | ✅ |
| `--ink-2` `#4d453d` on `--paper` | **8.87:1** | ✅ body secondary, lede, dish description |
| `--ink-2` on `--paper-2` | **8.14:1** | ✅ |
| `--ink-3` `#6f6459` on `--paper` | **5.44:1** | ✅ AA text — captions, eyebrows, labels, notes |
| `--ink-3` on `--paper-2` | **4.99:1** | ✅ |
| `--ink-3` on `--paper-3` | **4.53:1** | ✅ (margin is thin — do not darken the paper further) |
| `--ink-4` `#877c70` on `--paper` | **3.85:1** | ❌ **not for text.** AA-non-text only. |
| `--ink-4` on `--paper-3` | **3.21:1** | AA-non-text only |

> **This is the first substantive correction to the design reference.** The reference sets `--ink-3: #877c70` and then uses it for `.eyebrow` (0.74rem), `.sec__num`, `.photo::before`, `.trust__item span` (0.82rem), `.menu__for` (0.86rem), `.hero__note` (0.9rem) and `.est__note` (0.8rem) — all **normal-size text at 3.85:1, a 1.4.3 failure across the entire page.** Fix: `--ink-3` is redefined to `#6f6459` (5.44:1) and carries every one of those roles unchanged. The old value survives as `--ink-4`, restricted to non-text (decorative hairline emphasis, disabled-control borders, the frame hairline on `.photo`). A lint rule bans `color: var(--ink-4)` and `text-ink-4`.

**Accent — tomato**

| Pair | Ratio | Verdict |
|---|---|---|
| `--tomato` `#b0392a` on `--paper` | **5.72:1** | ✅ AA text |
| `--tomato` on `--paper-2` | **5.25:1** | ✅ |
| `--tomato` on `--paper-3` | **4.77:1** | ✅ |
| `--paper` on `--tomato` (button hover) | **5.72:1** | ✅ |
| `#ffffff` on `--tomato` | **6.06:1** | ✅ |
| `--tomato-dk` `#8e2c20` on `--paper` | **7.83:1** | ✅ hover/active for tomato text |
| **`--tomato` on `--ink`** | **2.85:1** | ❌ **FORBIDDEN PAIR** |

Where tomato is permitted, exhaustively: `.sec__num` numerals, the `מוגש היום ב…` provenance mark (§7.7), the `.menu__list` bullet at 55% opacity (5px), the `:focus-visible` outline, the FAQ chevron (two rotated 1.6px borders), the builder progress fill (2px tall), link hover, `text-decoration-color` on hover, and button hover fill. **Nowhere else.** Never a section background, never a default button fill, never a badge.

**The ink band palette.** Tomato is illegible on ink at 2.85:1. Inside `[data-band="ink"]` the accent is re-derived and the tokens are overridden wholesale:

| Pair | Ratio | Verdict |
|---|---|---|
| `--paper` on `--ink` (headings) | **16.31:1** | ✅ |
| `--ink-band-body` `#cfc6ba` on `--ink` | **10.24:1** | ✅ body copy |
| `--ink-band-muted` `#a89d90` on `--ink` | **6.49:1** | ✅ captions, meta |
| `--ink-band-accent` `#e0a79c` on `--ink` | **8.37:1** | ✅ replaces tomato for `.sec__num`, focus ring, bullets |
| `--ink-band-danger` `#f0b3a8` on `--ink` | **9.64:1** | ✅ |
| `--ink-band-line` `#3a332c` on `--ink` | 1.39:1 | decorative rules only |
| `--ink-band-line-strong` `#736860` on `--ink` | **3.19:1** | ✅ AA non-text — control borders on ink |

**Hairlines — and the distinction that matters**

| Pair | Ratio | Verdict |
|---|---|---|
| `--line` `#ded3c2` on `--paper` | **1.40:1** | decorative separation only |
| `--line` on `--paper-2` | **1.28:1** | decorative only |
| `--line-strong` `#8e7f66` on `--paper` | **3.69:1** | ✅ AA non-text |
| `--line-strong` on `--paper-2` | **3.38:1** | ✅ |
| `--line-strong` on `--paper-3` | **3.07:1** | ✅ (thin — this is the floor) |

> **Rule.** `--line` is legal for *decorative* separation: section band edges, card-grid gutters, table rules, dish-row leaders, list dividers, the `.step` masthead rule. `--line-strong` is **mandatory** for any boundary that is the only thing identifying an interactive control: text inputs, textareas, selects, radio-card resting borders, checkbox boxes, ghost-button borders, sticky-bar links. WCAG 1.4.11 applies to the second group and not the first. The design reference uses `--line` for both, which is a 1.4.11 failure on every form field. This is the second substantive correction.

**Utility colours**

| Token | Hex | Pair | Ratio | Verdict |
|---|---|---|---|---|
| `--olive` | `#4d5a43` | on `--paper` | **6.93:1** | ✅ confirmed/success text |
| `--olive` | | `#ffffff` on it | **7.35:1** | ✅ |
| `--danger` | `#a3271b` | on `--paper` | **6.92:1** | ✅ form errors |
| `--danger` | | on `--paper-2` | **6.36:1** | ✅ |
| `--danger` | | `#ffffff` on it | **7.33:1** | ✅ |
| `--wa` | `#0f7a3d` | `#ffffff` on it | **5.42:1** | ✅ |
| `--wa-dk` | `#0e6f38` | `#ffffff` on it | **6.27:1** | ✅ hover |
| `--slot-bg` | `#fff5cc` | dev only | — | not shipped to prod |
| `--slot-ring` | `#e8d489` | dev only | — | not shipped to prod |

> **WhatsApp green.** The reference's `--wa: #1faf5a` gives white text **2.86:1** — a failure. WhatsApp's own brand green `#25D366` is worse. We ship `#0f7a3d` (5.42:1). This is a *button background*, not the logo mark; the inline SVG glyph stays recognisable and the platform's brand guidelines do not require a specific button background colour. Do not "fix" this back to brand green.

> **`--danger` is deliberately not `--tomato`.** Tomato is the *accent*; an error must not read as decoration, and a decorative section numeral must not read as an error. They are two steps apart in luminance and distinguishable side by side.

### 2.2 Semantic role map

Write components against these, never against raw surface tokens.

```
--bg               → var(--paper)
--bg-alt           → var(--paper-2)
--bg-form          → var(--paper-3)
--fg               → var(--ink)
--fg-muted         → var(--ink-2)
--fg-subtle        → var(--ink-3)      /* smallest legal text colour */
--fg-decor         → var(--ink-4)      /* NON-TEXT ONLY */
--accent           → var(--tomato)
--accent-strong    → var(--tomato-dk)
--rule             → var(--line)          /* decorative */
--rule-control     → var(--line-strong)   /* interactive boundaries — 1.4.11 */
--focus            → var(--tomato)
--btn-bg           → var(--ink)
--btn-fg           → var(--paper)
```

Inside `[data-band="ink"]` every one of these is overridden in a single block (§5). A component therefore needs **zero** band-awareness: `<Button>` on the ink band inverts automatically and its focus ring becomes `#e0a79c` without a prop. Same for `<Photo>`, `<HairlineTable>`, `<Slot>` and the dish row.

### 2.3 Forbidden pairs — CI-checkable

| Never | Ratio | Instead |
|---|---|---|
| `--tomato` on `--ink` | 2.85:1 | `--ink-band-accent` `#e0a79c` (8.37:1) — automatic inside the band |
| `--ink-4` as a text colour anywhere | 3.85:1 max | `--ink-3` |
| `--line` as an input / radio / ghost-button / sticky-link border | 1.40:1 | `--line-strong` |
| white on any green lighter than `#0f7a3d` | <4.5:1 | `--wa` |
| any gold (`#d9a520`, `hsl(43,74%,*)`, `saddle-brown`, `wine-red`, `cornsilk`) | 2.25:1 | deleted; see §13 |
| `outline: none` without a ≥3:1 replacement | — | §10.1 |

### 2.4 High contrast is a token override, never a filter

`client/src/index.css:221-223` currently ships `.high-contrast { filter: contrast(150%) brightness(120%) }`. On a paper palette this **reduces** effective contrast: it pushes `#fbf8f3` to near-white and blows out `--line`, erasing every hairline — destroying the exact separation system it claims to help. It also promotes `<html>` to a containing block, which re-anchors every `position:fixed` element (the `!important` patch at `index.css:87-98` exists only to paper over this) and kills the header's `backdrop-filter`.

Replacement, shipped in §5:

```css
html[data-contrast="high"]{
  --paper:#ffffff; --paper-2:#f2f2f2; --paper-3:#e9e9e9;
  --line:#8a8079; --line-strong:#5f574f;
  --ink:#000000; --ink-2:#1f1b18; --ink-3:#3d372f; --ink-4:#5f574f;
  --tomato:#8e2c20; --tomato-dk:#71221a;
}
```

Real tokens, hairlines that survive, no filter. Note the dish-row leader is `1px dotted var(--rule)` — under the filter approach it vanished entirely, taking the menu's defining visual device with it.

Same for the invert/dark toggle: **there is no dark theme.** `.dark` in `index.css:38-59` is unused (2 `dark:` usages in the whole codebase, and its `--primary` is still the failing gold). It is deleted with `darkMode` from the Tailwind config (§13).

---

## 3. Spacing, radii, borders, elevation, grain

### 3.1 Spacing scale

Fluid where it carries the "expensive" feeling, fixed where it must be predictable. The ~12:1 ratio between section padding (up to 8.5rem) and paragraph spacing (1.1em) is the entire restraint budget — do not compress it. On a typographic page it is doing more work than it would on a photographic one: whitespace is the only thing separating one list of Hebrew rows from the next.

```css
--w:            1140px;                          /* content max-width */
--pad-sec:      clamp(4.5rem, 9vw, 8.5rem);      /* section block padding */
--pad-sec-tight:clamp(2.75rem, 5.5vw, 4.5rem);   /* thin bands: trust, tasting, checklist */
--pad-gutter:   clamp(1.15rem, 4vw, 2.5rem);     /* inline page gutter */
--gap-head:     clamp(2.5rem, 5vw, 4rem);        /* section header → content */
--gap-grid:     clamp(1rem, 2vw, 1.5rem);        /* card/menu grid gap */
--gap-col:      clamp(2rem, 5vw, 4.5rem);        /* two-column gap (hero, about) */
--gap-course:   clamp(2.2rem, 4vw, 3.2rem);      /* between menu courses (§7.7) */
--pad-card:     clamp(1.6rem, 3vw, 2.3rem);
--pad-form:     clamp(1.4rem, 3.5vw, 2.5rem);

/* fixed steps, for component internals only */
--s-1:.25rem; --s-2:.5rem;  --s-3:.75rem; --s-4:1rem;
--s-5:1.25rem;--s-6:1.5rem; --s-8:2rem;   --s-10:2.5rem; --s-12:3rem;
```

`py-20` (fixed 5rem), currently used across every section, is both too small at desktop and non-responsive. It is replaced by `--pad-sec`.

### 3.2 Radii

```css
--r:      3px;   /* everything: buttons, inputs, cards, photo frames, bands */
--r-pill: 99px;  /* ONLY .tag chips (--fs-2xs) and the 2px progress bar */
```

A 3px radius on a `1.05rem 1.9rem` button reads as printed matter. 99px on the same button reads as a 2016 template. Delete every `rounded-full` (46 occurrences across 14 non-`ui` files), every `rounded-2xl` / `rounded-3xl`, and the `w-20 h-20 rounded-full` icon medallions at `events.tsx:55` and `testimonials.tsx:44` — numerals replace them.

### 3.3 Borders

```css
--bw:       1px;   /* hairline: the house separator */
--bw-rule:  2px;   /* masthead rule: .proof top, .tasting top, brief card top */
--bw-chev:  1.6px; /* the FAQ chevron, drawn from two rotated borders */
--bw-leader:1px;   /* the dish-row dotted leader */
```

### 3.4 Separation without shadows — the five techniques

1. **Hairline border.** `border: var(--bw) solid var(--rule)`.
2. **Gutter-as-rule.** `display:grid; gap:1px; background:var(--rule)` on the container, `background:var(--bg)` on each child. The gutters *are* the rules — a real editorial table. This is the card grid and the branch production sheet.
3. **Interrupted rule.** `border-top: 1px solid var(--ink)` on the block, with the serif numeral absolutely positioned, `translateY(-50%)`, on a `--bg` chip so the number interrupts the rule. This is `.step`.
4. **Band alternation.** `background: var(--bg-alt); border-block: 1px solid var(--rule)`.
5. **Dotted leader.** `border-bottom: var(--bw-leader) dotted var(--rule)` on a `1fr auto` grid row. This is the dish row, and it is the single most-repeated device on the site (§7.7).

### 3.5 Elevation — `box-shadow` is banned, with three exceptions

```css
--shadow-sticky: 0 -6px 24px rgba(30,26,23,.09);  /* sticky mobile CTA bar ONLY */
--ring-inset:    inset 0 0 0 1px var(--line);     /* border substitute on .photo,
                                                     does not affect layout */
--rule-double:   0 1px 0 var(--ink);              /* the doubled hairline on the
                                                     flagged menu card — a RULE, not a glow */
```

Everything else — 56 `shadow-sm|md|lg|xl|2xl` occurrences, `.hover-lift`'s `0 20px 40px`, `.glass-effect`, `.text-shadow-warm` — is deleted (§13).

Text shadow is banned outright. `.text-shadow-warm` casts to the physical right, which is the wrong side in RTL.

### 3.6 Grain

One inline `feTurbulence`, ~400 bytes of data URI, one composited layer, zero network requests. At 2.8% it is imperceptible as texture and reads only as warmth. **On a page with no photographs it is doing more work than anywhere else in the system**: it is the only thing that stops flat `#fbf8f3` from reading as an unstyled document.

```css
body::after{
  content:"";position:fixed;inset:0;z-index:900;pointer-events:none;opacity:.028;
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)'/%3E%3C/svg%3E");
}
@media print { body::after{ display:none } }
html[data-contrast="high"] body::after{ display:none }
```

Four rules that are not negotiable:

- **Never raise the opacity.** Past ~4% it becomes visible noise and fights photographs when they arrive.
- **`z-index:900` must stay the topmost layer.** It sits over shadcn dialogs (`z-50`) — harmless at 2.8% with `pointer-events:none`, and it is what makes the page feel like one surface. Nobody may "fix" this by raising a modal above 900.
- **Print and high-contrast disable it.** Amplified by a contrast filter the grain renders as dirt, in exactly the mode where clarity matters most; on the printed menu (§11) it is a grey wash across an A4 sheet.
- **CSP implication.** The grain is a `data:` URI in a `background-image`, so any Content-Security-Policy written for this site must allow `img-src data:` (and `style-src 'unsafe-inline'` is *not* needed for it, since the rule lives in the stylesheet). Flagged here because `04-legal-and-content.md` owns the CSP and the grain is the one design decision that constrains it. See `00-prior-review.md` C8.

---

## 4. Hebrew typography

**This is the load-bearing section of the whole system.** In a photography-led direction typography supports the images; here it *is* the product. A dish name set badly is the failure of the page, not a detail of it.

### 4.1 Families and roles

| Family | Axis | Role | Never |
|---|---|---|---|
| **Frank Ruhl Libre** | variable `wght 300–900` (verified v23, single axis) | display h1–h3, **dish names**, prices, trust numbers, all numerals, blockquote, `.step__n`, builder `legend` | below 20px; captions; form labels; `.sec__num` eyebrows |
| **Assistant** | variable `wght 200–800` (verified v24, single axis) | body, dish descriptions, UI, forms, eyebrows, labels, buttons, captions, table cells | below `wght 400`; above `wght 600` |

Weights, fixed:

```
FRL 500  → h1, h2, dish names, prices, trust numbers, blockquote, legend   (editorial)
FRL 700  → brand wordmark, h3, .step__n, course headings only              (institutional — rationed)
Assistant 400 → body, dish descriptions, inputs, captions, table cells
Assistant 600 → eyebrows, labels, buttons, tags, table headers, the provenance mark
```

**FRL 500, not 700, for display is the most load-bearing typographic decision in the system.** Hebrew serif at 700 in large sizes reads institutional and heavy; at 500 it reads editorial. FRL is a high-contrast modern Hebrew face: its hairlines go fragile below ~20px, so **FRL is banned below 20px**, and at 20–24px must be `wght ≥ 500`.

> **Consequence for the dish row.** `--fs-lg` (20 → 24px) is therefore the *floor* for a dish name in FRL. A dish list set at `--fs-sm` in FRL would be illegible on a phone; if a denser list is ever needed the correct move is Assistant 600 at `--fs-sm`, not FRL at a smaller size. Written down because "make the menu fit on one screen" is the first thing anyone will ask for.

**`wght 300` is banned for Hebrew text.** The reference sets `.lede{font-weight:300}` with `-webkit-font-smoothing:antialiased`. Hebrew letterforms are uniform-height with no ascender/descender silhouette; at 300 with macOS thin antialiasing the strokes drop below comfortable contrast — the setting that reads "elegant" in Latin reads "faint" in Hebrew. The light-editorial feel comes from `--ink-2` (8.87:1), measure and leading instead. Every `font-weight:300` in the reference becomes 400.

Also remove `text-rendering: optimizeLegibility` (a known first-paint regression in Blink/Gecko on large text blocks; it buys nothing, since kerning and `ccmp` are on by default for woff2 with GPOS), and test with `-webkit-font-smoothing: antialiased` **removed** — for Hebrew it is a net loss.

### 4.2 Loading — self-hosted, Hebrew-subset, variable

Current cost, measured live from `fonts.gstatic.com` via the `<link>` at `client/index.html:28-31`: FRL hebrew 18,760 B + FRL **latin 44,272 B** + Assistant hebrew 7,336 B + Assistant latin 22,056 B + 7,192 B of CSS = **92,488 B across 4 requests on 2 hosts**, behind a 4-hop chain (DNS → TLS → CSS parse → font fetch).

**Digits do not exist in the Google Hebrew subsets.** Verified by reading the served woff2 cmaps: FRL hebrew = 114 glyphs, **0/10 digits**; Assistant hebrew = 95 glyphs, **0/10 digits**. Em-dash, en-dash and curly quotes are likewise latin-only. So *any* number on the page — a price, a phone number, a guest count — forces the 44 KB FRL Latin file to download. FRL will never render a Latin word on this site; that 44 KB is pure waste.

Ship one hand-subset variable woff2 per family:

```bash
pyftsubset "FrankRuhlLibre[wght].ttf" --flavor=woff2 \
  --output-file=client/public/fonts/frank-ruhl-libre-he.woff2 \
  --layout-features='kern,mark,mkmk,ccmp,tnum,pnum,liga' \
  --unicodes='U+0020-002F,U+0030-0039,U+003A-0040,U+00A0,U+00B7,U+05BE,U+05D0-05EA,U+05F3-05F4,U+0590-05FF,U+20AA,U+200C-200F,U+2013-2014,U+2018-201D,U+2026,U+FB1D-FB4F' \
  --drop-tables+=DSIG

pyftsubset "Assistant[wght].ttf" --flavor=woff2 \
  --output-file=client/public/fonts/assistant-he.woff2 \
  --layout-features='kern,mark,mkmk,ccmp,frac,liga' \
  --unicodes='<same as above>,U+0041-005A,U+0061-007A'   # Assistant carries Latin runs; FRL does not
```

Keep the `wght` axis — do **not** instance. Expected ≈ 20–26 KB total for both families, one origin, no `fonts.googleapis.com` CSS hop.

```css
@font-face{
  font-family:'Frank Ruhl Libre';
  src:url('/fonts/frank-ruhl-libre-he.woff2') format('woff2-variations');
  font-weight:300 900;              /* omit this and the browser assumes 400 and stops varying */
  font-style:normal;font-display:swap;
  unicode-range:U+0590-05FF,U+200C-200F,U+20AA,U+FB1D-FB4F,U+0020-0040,U+00A0;
}
@font-face{
  font-family:'Assistant';
  src:url('/fonts/assistant-he.woff2') format('woff2-variations');
  font-weight:200 800;              /* Assistant's fvar DEFAULT is 200 — omitting this ships ExtraLight */
  font-style:normal;font-display:swap;
}

/* metric-matched fallbacks — values computed from the font binaries, upm 1000 */
@font-face{                          /* FRL: hhea asc 957, desc −334, lineGap 0 */
  font-family:'FRL Fallback';src:local('Times New Roman'),local('Georgia');
  ascent-override:95.7%;descent-override:33.4%;line-gap-override:0%;
}
@font-face{                          /* Assistant: hhea asc 1021, desc −287, lineGap 0 */
  font-family:'Assistant Fallback';src:local('Arial Hebrew'),local('Arial');
  ascent-override:102.1%;descent-override:28.7%;line-gap-override:0%;
}
```

**Preload exactly two files** (`<link rel="preload" as="font" type="font/woff2" crossorigin>`), FRL first. Preloading more costs LCP.

> **The typographic hero makes the font the LCP resource — this is an advantage, and it changes the loading priority.** With no image above the fold (L-2), the LCP element on almost every route is the `<h1>`, set in FRL. A text LCP paints far earlier than an image LCP and needs no `srcset`, no sharp pipeline and no owner dependency — which is precisely why this direction survives an empty photo manifest. But it means **the FRL file is now the critical path**: preload it, keep it under ~15 KB, and never let a build add a Latin subset back into it. The metric-matched fallback is what makes `font-display:swap` cost 0 CLS on the headline; without it, the h1 reflows and shifts every dish row below it.

> **`size-adjust` is deliberately omitted.** The commonly-quoted `93%` is derived from Noto Sans Hebrew (correct for Android) and is wrong for macOS `Arial Hebrew` and for Windows. Shipping an unverified `size-adjust` **creates** CLS rather than removing it. Ship a one-off measurement page (webfont `xAvgCharWidth` ÷ fallback `xAvgCharWidth` at equal upm — FRL 522, Assistant 458), measure on real iOS/Android/Windows, then add the value. Until then the `ascent`/`descent` overrides alone remove the line-box shift, which is the larger component.

> **`font-display`.** Ship `swap` first. Once self-hosting is verified and the files are ≈3–6 KB, consider `optional` on the body face plus preload. Verify the miss rate under CPU+network throttling before switching — `optional` shows the fallback for the whole first paint when it misses, and on a type-led page that is the whole page.

### 4.3 Modular scale — literal clamps

Hebrew-calibrated: nominal sizes at the top of the scale are deliberately ~one step smaller than a Latin equivalent, because Hebrew letters occupy 20–25% more of the em than Latin lowercase (measured: FRL Hebrew letter height **0.586em** vs Latin x-height 0.468em; Assistant **0.545** vs 0.500). Fluid between 360px and 1440px viewports; min and max in `rem`, so browser zoom is safe.

```css
--fs-3xs: clamp(0.75rem,   0.7396rem + 0.0463vw, 0.7813rem);  /* 12 → 12.5  legal fine print */
--fs-2xs: clamp(0.8125rem, 0.8021rem + 0.0463vw, 0.8438rem);  /* 13 → 13.5  eyebrow, sec__num, tag, provenance mark */
--fs-xs:  clamp(0.875rem,  0.8542rem + 0.0926vw, 0.9375rem);  /* 14 → 15    caption, meta, note, dish description */
--fs-sm:  clamp(0.9688rem, 0.9479rem + 0.0926vw, 1.0313rem);  /* 15.5 → 16.5 UI, labels, table cells */
--fs-base:clamp(1.0625rem, 1.0417rem + 0.0926vw, 1.125rem);   /* 17 → 18    BODY */
--fs-md:  clamp(1.1563rem, 1.1042rem + 0.2315vw, 1.3125rem);  /* 18.5 → 21  lede, standfirst */
--fs-lg:  clamp(1.25rem,   1.1667rem + 0.3704vw, 1.5rem);     /* 20 → 24    h3, FAQ summary, DISH NAME */
--fs-xl:  clamp(1.4375rem, 1.2917rem + 0.6481vw, 1.875rem);   /* 23 → 30    card title, legend, course heading */
--fs-2xl: clamp(1.625rem,  1.375rem  + 1.1111vw, 2.375rem);   /* 26 → 38    h2 */
--fs-3xl: clamp(1.9375rem, 1.5417rem + 1.7593vw, 3.125rem);   /* 31 → 50    h1 on inner routes */
--fs-4xl: clamp(2.25rem,   1.6667rem + 2.5926vw, 4rem);       /* 36 → 64    hero h1 */
```

Ratios run ≈1.09 in the small steps (UI text stays stable) and 1.25–1.32 in the display steps. **Body floor is 17px, not 16px** — Hebrew needs the extra pixel because ב/כ, ד/ר, ה/ח and ו/ז/ן differ by details that disappear at 16px with no ascender/descender silhouette to help.

> **Resolution against the reference.** `style.css` sets `h1: clamp(2.4rem, 1.35rem + 4.6vw, 4.4rem)` (38.4 → 70.4px). We cap the hero at `--fs-4xl` (36 → 64px). 70px of Hebrew at `lh 1.08` overflows three lines on a 390px screen, and on this direction the h1 sits directly above four dish rows that must also be visible in the first viewport. Everything else in the reference maps 1:1 onto the tokens above.

Assignments:

| Element | Size | Family / weight | Line-height |
|---|---|---|---|
| hero `h1` | `--fs-4xl` | FRL 500 | `--lh-display` 1.08 |
| route `h1` | `--fs-3xl` | FRL 500 | 1.08 |
| `h2` | `--fs-2xl` | FRL 500 | `--lh-head` 1.14 |
| course heading (`אנטיפסטי`, `פסטות`…) | `--fs-xl` | FRL 700 | `--lh-sub` 1.24 |
| **dish name** | `--fs-lg` | **FRL 500** | 1.3 |
| `h3` / card title | `--fs-lg` | FRL 700 | 1.24 |
| builder `legend` | `--fs-xl` | FRL 500 | 1.24 |
| lede / standfirst | `--fs-md` | Assistant 400, `--fg-muted` | 1.6 |
| body | `--fs-base` | Assistant 400 | `--lh-body` 1.75 |
| **dish description** | `--fs-xs` | Assistant 400, `--fg-muted` | 1.5 |
| UI / labels / buttons | `--fs-sm` | Assistant 600 | 1 (buttons) / 1.5 |
| caption, meta, note | `--fs-xs` | Assistant 400/600, `--fg-subtle` | 1.6 |
| eyebrow, `.sec__num`, tag, provenance mark | `--fs-2xs` | Assistant 600, `+0.09em` tracking | 1.4 |
| legal fine print | `--fs-3xs` | Assistant 400, `--fg-subtle` | 1.55 |

### 4.4 Line-height, derived from measured Hebrew ink extent

Not from Latin habit. Measured ink extent (ל top → ק bottom): **Frank Ruhl Libre 0.960em** (0.800 to −0.160); **Assistant 0.917em** (0.717 to −0.200).

```css
--lh-display: 1.08;   /* FRL hero/h1 — 0.12em clearance */
--lh-head:    1.14;   /* h2 */
--lh-sub:     1.24;   /* h3, legend, course heading */
--lh-dish:    1.30;   /* dish name — needs a hair more than h3 because it sits on a leader rule */
--lh-tight:   1.35;   /* table cells, tags, sticky bar */
--lh-body:    1.75;   /* body — the reference's value is correct, keep it */
--lh-loose:   1.80;   /* any block over ~400 words */
```

Floors: **never below 1.05 for FRL** (0.96em ink extent). Hebrew tolerates tight display leading far better than Latin because only lamed ascends. Hebrew *body* needs **more** leading than Latin, not less: every letter fills the full x-height band, so the block has no ascender/descender channels and reads as a denser grey. `leading-none` and `leading-tight` are banned on Hebrew display type.

> If the design ever substitutes **Noto Serif Hebrew**, its ink extent is **1.113em** — above one em — and any line-height below 1.20 causes real glyph collision. FRL and Assistant are the shipped pair; noted so a substitution is not made casually.

### 4.5 Measure — in `em`, never `ch`

Assistant's `1ch` = 0.472em, but Hebrew averages **0.382em per character** (measured over four real strings from the project copy, 389 chars). So `ch` over-reports Hebrew character count by **24%**: `max-width: 65ch` yields ~80 Hebrew characters, and Tailwind Typography's `prose` default of `65ch` is an 80-character Hebrew line.

```css
--measure-body:    26em;  /* ~68 Hebrew chars — 442px @17px, 468px @18px */
--measure-lede:    23em;  /* ~60 chars */
--measure-answer:  26em;  /* FAQ answer */
--measure-dish:    17em;  /* ~44 chars — the dish description, hard cap (§7.7) */
--measure-caption: 18em;  /* ~47 chars — the photo caption */
--measure-confirm: 22em;  /* confirmation view body */
--measure-max:     29em;  /* ~76 chars — hard ceiling, nothing exceeds this */
```

Hebrew runs at a slightly *lower* character count than Latin's 45–75: Hebrew words average ~4.6 letters (verified on the project copy: 123 chars ≈ 22 words), so 60 Hebrew chars already carries ~11 words — the same saccade load as 65 Latin chars.

Fixes: `blog-post.tsx:86` uses `prose prose-lg max-w-none`, removing the measure limit entirely → `max-w-[26em]` (and `text-right` → `text-start`). The reference's `.lede{max-width:46ch}` ≈ 57 Hebrew chars → `--measure-lede`.

### 4.6 Numerals and tabular figures

**`tabular-nums` is a silent no-op in Assistant.** Verified GSUB feature lists: FRL = `ccmp dnom frac kern liga locl mark mkmk numr pnum tnum`; **Assistant = `ccmp frac kern liga mark mkmk` — no `tnum`.** Neither do Heebo, Noto Sans/Serif Hebrew, Alef, Suez One or David Libre. Among Hebrew-supporting Google families only **Frank Ruhl Libre, Rubik, Miriam Libre and Varela Round** have it.

Worse than a no-op: Assistant's default figures are *almost* tabular (all digits 0.472em) **except `1` at 0.434em**, so any column containing a 1 misaligns by 0.038em per digit and there is no CSS fix. FRL's defaults are worse — proportional with a 20% spread (`1` = 0.470em vs `0` = 0.563em) — so FRL headings with numbers jitter unless `tnum` is opted in.

**Decision: Frank Ruhl Libre is the numeral carrier.**

```css
.num{
  font-family:var(--serif);
  font-feature-settings:"tnum" 1;
  font-variant-numeric:tabular-nums;   /* forward-compat; the feature setting is what works today */
}
```

Mandatory on: every price, the phone number, guest counts, capacity figures, drive-time minutes, the estimate value, every numeric table cell, the reference code, dates, hours.

Two optical corrections. Latin digits stand **20–26% taller** than Hebrew letters in every candidate face — they are cap-height glyphs beside x-height-band letters (measured digit ink height vs Hebrew letter height: FRL 0.705/0.586 = ×1.20; Assistant 0.664/0.545 = ×1.22). And the shekel sign is drawn to the **Hebrew** band (FRL 0.000–0.587), so `120 ₪` shows tall digits beside a visibly shorter currency mark.

```css
.num-inline{ font-size:.94em; font-feature-settings:"tnum" 1 }  /* digits inside running Hebrew prose */
.shekel    { font-size:1.15em; line-height:1 }                  /* the ₪ glyph, so it matches the figures */
```

Do **not** apply `.num-inline` to a price in a dish row or to the estimate value — there the full-height figures are wanted, and the whole point of a menu's price column is that it is scannable.

### 4.7 Currency, phone numbers, dates

**Currency is number-first with a hard NBSP.** CLDR's canonical Israeli format is number-first: `Intl.NumberFormat('he-IL',{style:'currency',currency:'ILS'}).format(15000)` returns `U+200F 15,000 U+00A0 U+200F ₪`. The codebase writes symbol-first (`₪{item.price}` at `menu.tsx:55`, `₪120` in `events.tsx`, `₪{total}` at `price-calculator.tsx:219`). Ship `120&nbsp;₪` so number and symbol never break across lines, and route every figure through one shared formatter:

```ts
// client/src/lib/format.ts
export const ils = new Intl.NumberFormat('he-IL',
  { style:'currency', currency:'ILS', maximumFractionDigits:0 });
export const num = new Intl.NumberFormat('he-IL');
```

`priceResult.total.toLocaleString()` (`price-calculator.tsx:219`) resolves to the **runtime** locale — it returned `en-US` in this container — so grouping is non-deterministic across environments. Never call `toLocaleString()` without a locale argument.

**No number renders from a literal in a component.** Every ₪ figure on the site comes from a content module via `<Slot>` (§7.30). The CI gate in §14 enforces this in both directions of the format.

**Phone numbers.** Plain local form `05X-XXXXXXX` renders correctly in RTL with no markup. The moment a `+`, parentheses or a space is introduced it breaks: `+972-XX-XXXXXXX` renders with the plus sign on the wrong end, and `(0X) XXXXXXX` swaps the area code to the wrong side. So:

- **Display:** bare local form, `.num`, `white-space:nowrap`.
- **`href`:** always E.164 — `tel:+9725XXXXXXXX`. Every `tel:` in the repo is currently non-E.164 (`contact.tsx:301,348`; `hero.tsx:101`; `footer.tsx:56`; `price-calculator.tsx:232`; `terms.tsx:190`) and every one of them points at a placeholder number.
- Anything with a `+` or parentheses goes inside `<Ltr>` (§7.32).

**Dates and hours are computed in `Asia/Jerusalem`, explicitly.** `new Date(x).getDay()` parses as UTC and misclassifies Friday/Saturday near midnight — a live bug in `price-calculator.tsx:75`. Every rendered day name, hour, cutoff and "open now" state uses `Intl.DateTimeFormat` with `{ timeZone: 'Asia/Jerusalem' }`. **The client's device clock is never trusted** for a cutoff or an opening-hours state. (Shared rule with `02` §3.4 / §8.4; stated here because the design system renders the strings.)

**Hebrew-letter numerals** (א׳, ב׳) are for dates and enumerations only, never cardinals.

**Three-branch string:** `Intl.ListFormat('he-IL')` correctly yields the Hebrew list form with no serial comma and `ו־` prefixed to the last item. Use it rather than hardcoding a comma-and — and drive it from `locations.ts`, so a branch that is not yet confirmed simply does not appear in the sentence.

### 4.8 No italic — a global reset

Hebrew has no italic tradition, and neither shipped family has one (`fvar` axes = `[wght]` only; Google serves `font-style: normal` exclusively). Every `italic` renders as a browser-synthesised oblique, which degrades Hebrew letterforms and reads as a rendering fault.

```css
em, i, cite, dfn, address, blockquote, q, var,
.prose em, .prose blockquote, [lang="he"] em, [lang="he"] i{
  font-style: normal;
}
.em       { font-weight:600 }         /* the Hebrew emphasis device */
.em-track { letter-spacing:.06em }    /* the Hebrew-native alternative: expanded tracking */
```

Removals: `testimonials.tsx:52` and `blog-post.tsx:210` (`italic` class); the reference's own `.step em{font-style:italic}` at `style.css:226` — **do not inherit that**, it italicises a Hebrew word. Tailwind Typography v0.5.20 sets `fontStyle:'italic'` on `blockquote` (`styles.js:1487`) — moot, since the plugin is removed (§6).

Emphasis toolkit for Hebrew: weight (400→600), size, colour (`--fg-muted`→`--fg`), positive letter-spacing, and a rule or indent. Blockquotes get FRL 500 at `--fs-lg` plus a `--bw-rule` ink rule above — that is what makes them read as quotes.

**`text-transform: uppercase` is a no-op on Hebrew** (unicase script) but **will** uppercase embedded Latin, producing an inconsistent mixed-case eyebrow. The reference's `.eyebrow{text-transform:uppercase; letter-spacing:.18em}` drops `uppercase` entirely (or scopes it `:lang(en)`), and tracking reduces to **0.09em** — 0.18em on Hebrew starts reading as spaced-out individual letters.

### 4.9 Bidi rules — the corrections that are invisible in code review

**Numeric ranges joined by en-dash reverse visually in RTL.** Verified with FriBidi 1.0.13 and python-bidi (both faithful UAX#9 implementations, in agreement):

| Written | Renders as | Why |
|---|---|---|
| `25–200 סועדים` | **`200–25 סועדים`** ❌ | U+2013 is class ON → N1 applies → EN counts as R → the runs swap |
| `₪5,000 - ₪15,000` | **`₪15,000 - ₪5,000`** ❌ | same |
| `8:00–17:00` | **`17:00–8:00`** ❌ | same |
| `25-200` (ASCII hyphen) | `25-200` ✅ | W4: a single ES/CS between two EN becomes EN, keeping one LTR run |

`<bdi>` / `unicode-bidi:isolate` **does not fix this** — an isolate is substituted by U+FFFC (class ON), so isolating each number leaves `[ON][dash][ON]` and the order still mirrors. Only an LTR **container** around the *entire* range works. `Intl.NumberFormat('he-IL').formatRange()` also renders reversed — do not trust it.

**Rules:**

1. Preferred — Hebrew connector prose, bidi-safe with zero markup: `מ־{{MIN}} ועד {{MAX}} סועדים`, `בין {{A}} ל־{{B}} ₪`, `בין {{FROM}} ל־{{TO}}` for hours.
2. Where a literal range is unavoidable, wrap the **whole** range in `<Ltr>` (§7.32).
3. CI bans `/\d\s*[–—]\s*\d/` over `client/src` (§14).

**Live instances to fix.** `contact.tsx:230-233` displays inverted budget ranges to every lead — a consumer-facing misstatement on a lead-gen form, not a cosmetic bug; the whole selector is deleted anyway (§13). The design reference's own builder markup at `index.html:369-372` ships `25–50`, `50–100`, `100–200` — **all of its guest bands are currently wrong** and must be rewritten to connector form, with the numbers themselves coming from Slots. The reference's hero note at `index.html:66` uses the connector form correctly, so the file is internally inconsistent.

**Hebrew punctuation — use the Hebrew codepoints.** They are in the Hebrew subset; the Latin substitutes are typographically and mechanically wrong. Measured in FRL: hyphen-minus/en-dash sit centred at y=+0.248em, **0.044em below** the Hebrew optical centre (+0.293em); the maqaf ־ (U+05BE) sits at 0.442–0.546em, at the top of the Hebrew band where readers expect it. Geresh ׳ (U+05F3) and gershayim ״ (U+05F4) are in the Hebrew subset; ASCII `"` / `'` and curly `“ ”` are latin-subset-only and sit above the Hebrew band.

| Use | Not |
|---|---|
| ־ (U+05BE maqaf) for word-joining: `מ־`, `רב־קווי`, `ב־Instagram` | `-` |
| ״ (U+05F4) for abbreviations: `ש״ח`, `בע״מ` | `"` |
| ׳ (U+05F3) for `ש׳` | `'` |

Bonus: this keeps the copy inside the Hebrew subset. `–`, `—`, `"`, `“`, `’`, `…` are all latin-subset-only and each one drags in the FRL Latin file.

**Never end a Hebrew sentence with a Latin email, URL or brand name.** The terminal period lands at the far left, immediately before the Latin string, and reads as a leading dot on the address. This is spec-correct RTL behaviour that no markup fixes (`<bdi>` does not help; the period is still logically last and therefore leftmost). Either follow it with a Hebrew word or put the address on its own line with no terminal punctuation. Copy rule for `04-legal-and-content.md`.

**The dish row is the highest-risk bidi surface on the site** because it puts a Hebrew name and an LTR price on the same baseline, separated by a leader. §7.7 specifies it as a grid rather than a text run precisely so no bidi reordering is possible between the two cells.

---

## 5. The literal `client/src/index.css`

Replaces the file entirely. Every deletion in §13 that touches `index.css` is already reflected here.

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* ═══════════════════════════════════════════════════════════════
   מאמא מיה קייטרינג · design tokens
   Direction: תפריט — the menu is the site. Editorial, paper, restrained.
   Contrast ratios are stated in docs/spec/03-design-system.md §2.
   ═══════════════════════════════════════════════════════════════ */

:root{
  /* ── surfaces ───────────────────────────────────────────── */
  --paper:      #fbf8f3;
  --paper-2:    #f4eee4;
  --paper-3:    #ece3d5;
  --surface-hover:#ffffff;   /* hover only — never a resting surface */

  /* ── ink ────────────────────────────────────────────────── */
  --ink:        #1e1a17;     /* 16.31:1 on paper */
  --ink-2:      #4d453d;     /*  8.87:1 */
  --ink-3:      #6f6459;     /*  5.44:1 — smallest legal text colour */
  --ink-4:      #877c70;     /*  3.85:1 — NON-TEXT ONLY */

  /* ── rules ──────────────────────────────────────────────── */
  --line:        #ded3c2;    /* 1.40:1 — decorative separation only */
  --line-strong: #8e7f66;    /* 3.69:1 — interactive boundaries (1.4.11) */

  /* ── accent, rationed to ~2% of pixels ──────────────────── */
  --tomato:     #b0392a;     /* 5.72:1 on paper */
  --tomato-dk:  #8e2c20;     /* 7.83:1 */
  --olive:      #4d5a43;     /* 6.93:1 — confirmed / success */
  --danger:     #a3271b;     /* 6.92:1 — form errors, deliberately ≠ tomato */
  --wa:         #0f7a3d;     /* white on it: 5.42:1 */
  --wa-dk:      #0e6f38;     /* 6.27:1 */

  /* ── semantic roles — write components against these ────── */
  --bg:            var(--paper);
  --bg-alt:        var(--paper-2);
  --bg-form:       var(--paper-3);
  --fg:            var(--ink);
  --fg-muted:      var(--ink-2);
  --fg-subtle:     var(--ink-3);
  --fg-decor:      var(--ink-4);
  --accent:        var(--tomato);
  --accent-strong: var(--tomato-dk);
  --rule:          var(--line);
  --rule-control:  var(--line-strong);
  --focus:         var(--tomato);
  --btn-bg:        var(--ink);
  --btn-fg:        var(--paper);

  /* ── families ───────────────────────────────────────────── */
  --serif:'Frank Ruhl Libre','FRL Fallback',Georgia,serif;
  --sans: 'Assistant','Assistant Fallback',system-ui,Arial,sans-serif;

  /* ── type scale (§4.3) ──────────────────────────────────── */
  --fs-3xs: clamp(0.75rem,   0.7396rem + 0.0463vw, 0.7813rem);
  --fs-2xs: clamp(0.8125rem, 0.8021rem + 0.0463vw, 0.8438rem);
  --fs-xs:  clamp(0.875rem,  0.8542rem + 0.0926vw, 0.9375rem);
  --fs-sm:  clamp(0.9688rem, 0.9479rem + 0.0926vw, 1.0313rem);
  --fs-base:clamp(1.0625rem, 1.0417rem + 0.0926vw, 1.125rem);
  --fs-md:  clamp(1.1563rem, 1.1042rem + 0.2315vw, 1.3125rem);
  --fs-lg:  clamp(1.25rem,   1.1667rem + 0.3704vw, 1.5rem);
  --fs-xl:  clamp(1.4375rem, 1.2917rem + 0.6481vw, 1.875rem);
  --fs-2xl: clamp(1.625rem,  1.375rem  + 1.1111vw, 2.375rem);
  --fs-3xl: clamp(1.9375rem, 1.5417rem + 1.7593vw, 3.125rem);
  --fs-4xl: clamp(2.25rem,   1.6667rem + 2.5926vw, 4rem);

  /* ── leading (§4.4) ─────────────────────────────────────── */
  --lh-display:1.08; --lh-head:1.14; --lh-sub:1.24; --lh-dish:1.3;
  --lh-tight:1.35;   --lh-body:1.75; --lh-loose:1.8;

  /* ── measure, in em not ch (§4.5) ───────────────────────── */
  --measure-body:26em;   --measure-lede:23em;    --measure-answer:26em;
  --measure-dish:17em;   --measure-caption:18em; --measure-confirm:22em;
  --measure-max:29em;

  /* ── space (§3.1) ───────────────────────────────────────── */
  --w:1140px;
  --pad-sec:      clamp(4.5rem, 9vw, 8.5rem);
  --pad-sec-tight:clamp(2.75rem, 5.5vw, 4.5rem);
  --pad-gutter:   clamp(1.15rem, 4vw, 2.5rem);
  --gap-head:     clamp(2.5rem, 5vw, 4rem);
  --gap-grid:     clamp(1rem, 2vw, 1.5rem);
  --gap-col:      clamp(2rem, 5vw, 4.5rem);
  --gap-course:   clamp(2.2rem, 4vw, 3.2rem);
  --pad-card:     clamp(1.6rem, 3vw, 2.3rem);
  --pad-form:     clamp(1.4rem, 3.5vw, 2.5rem);

  /* ── radii, borders, the three permitted shadows ────────── */
  --r:3px; --r-pill:99px; --radius:3px;   /* --radius kept for shadcn derivation */
  --bw:1px; --bw-rule:2px; --bw-chev:1.6px; --bw-leader:1px;
  --shadow-sticky:0 -6px 24px rgba(30,26,23,.09);
  --ring-inset:inset 0 0 0 1px var(--line);
  --rule-double:0 1px 0 var(--ink);

  /* ── motion (§8) ────────────────────────────────────────── */
  --dur-state:180ms; --dur-state-slow:220ms; --dur-reveal:550ms; --dur-shake:300ms;
  --ease:cubic-bezier(.2,0,.2,1);
  --dir:1;                                /* direction sign for physical-only props */

  /* ── editing affordance — dev only (§7.30) ──────────────── */
  --slot-bg:#fff5cc; --slot-ring:#e8d489;

  /* ── shadcn aliases, re-pointed at the real tokens ──────── */
  --background:var(--paper);
  --foreground:var(--ink);
  --card:var(--paper);
  --card-foreground:var(--ink);
  --popover:var(--paper);
  --popover-foreground:var(--ink);
  --muted:var(--paper-2);
  --muted-foreground:var(--ink-2);
  --primary:var(--ink);
  --primary-foreground:var(--paper);
  --secondary:var(--paper-2);
  --secondary-foreground:var(--ink);
  --border:var(--line);
  --input:var(--line-strong);              /* 1.4.11: inputs need the strong rule */
  --ring:var(--tomato);
  --destructive:var(--danger);
  --destructive-foreground:#ffffff;
}

/* ── the ink band: at most one per route, always the kitchens band ── */
[data-band="ink"]{
  --bg:var(--ink); --bg-alt:#2c2622; --bg-form:#2c2622;
  --fg:var(--paper);
  --fg-muted:#cfc6ba;        /* 10.24:1 on ink */
  --fg-subtle:#a89d90;       /*  6.49:1 */
  --fg-decor:#7a6f65;
  --accent:#e0a79c;          /*  8.37:1 — tomato is 2.85:1 here and forbidden */
  --accent-strong:#f0b3a8;
  --rule:#3a332c;
  --rule-control:#736860;    /*  3.19:1 */
  --focus:#e0a79c;
  --btn-bg:var(--paper); --btn-fg:var(--ink);
  --danger:#f0b3a8;          /*  9.64:1 */
  --slot-bg:#4a3c1f; --slot-ring:#6d5a2e;
  --surface-hover:#2c2622;
  background:var(--ink); color:var(--fg-muted);
}

/* ── high contrast: token override, NEVER a filter (§2.4) ─── */
html[data-contrast="high"]{
  --paper:#ffffff; --paper-2:#f2f2f2; --paper-3:#e9e9e9;
  --line:#8a8079; --line-strong:#5f574f;
  --ink:#000000; --ink-2:#1f1b18; --ink-3:#3d372f; --ink-4:#5f574f;
  --tomato:#8e2c20; --tomato-dk:#71221a;
}
html[data-contrast="high"] body::after{display:none}

@layer base{
  *,*::before,*::after{box-sizing:border-box}
  *{ border-color:var(--rule) }

  html{
    scroll-behavior:smooth;
    /* NOTE: no font-size is ever set here. Setting it overrides the user's
       browser text-size preference — see §10.4. */
  }
  @media (prefers-reduced-motion:reduce){ html{scroll-behavior:auto} }

  body{
    margin:0;
    background:var(--bg); color:var(--fg);
    font-family:var(--sans); font-weight:400;
    font-size:var(--fs-base); line-height:var(--lh-body);
    direction:rtl;
  }

  /* paper grain — one fixed composited layer, ~400 bytes (§3.6) */
  body::after{
    content:"";position:fixed;inset:0;z-index:900;pointer-events:none;opacity:.028;
    background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)'/%3E%3C/svg%3E");
  }

  img,svg,video{max-width:100%;height:auto;display:block}

  h1,h2,h3,h4{font-family:var(--serif);margin:0;letter-spacing:-.01em}
  h1{font-size:var(--fs-3xl);font-weight:500;line-height:var(--lh-display)}
  h2{font-size:var(--fs-2xl);font-weight:500;line-height:var(--lh-head)}
  h3{font-size:var(--fs-lg); font-weight:700;line-height:var(--lh-sub)}
  h4{font-size:var(--fs-sm); font-weight:600;line-height:var(--lh-sub);font-family:var(--sans)}
  p{margin:0 0 1.1em;max-width:var(--measure-body)}
  p:last-child{margin-bottom:0}

  /* Hebrew has no italic (§4.8) */
  em,i,cite,dfn,address,blockquote,q,var{font-style:normal}
  em,strong,b{font-weight:600}

  a{color:inherit;text-decoration-color:var(--rule);text-underline-offset:.22em}
  a:hover{text-decoration-color:var(--accent)}

  /* the single focus treatment (§10.1) */
  :focus-visible{outline:2px solid var(--focus);outline-offset:3px;border-radius:2px}
  :focus:not(:focus-visible){outline:none}

  ::selection{background:var(--paper-3);color:var(--ink)}

  /* RTL-correct inputs: dir=ltr for the caret, Hebrew placeholder stays right */
  input[dir="ltr"]::placeholder,
  textarea[dir="ltr"]::placeholder{direction:rtl;text-align:right}
}

@layer utilities{
  .wrap{width:100%;max-width:var(--w);margin-inline:auto;padding-inline:var(--pad-gutter)}
  .sec{padding-block:var(--pad-sec)}
  .sec--alt{background:var(--bg-alt);border-block:var(--bw) solid var(--rule)}
  .sec--tight{padding-block:var(--pad-sec-tight)}

  .num{font-family:var(--serif);font-feature-settings:"tnum" 1;font-variant-numeric:tabular-nums}
  .num-inline{font-size:.94em;font-feature-settings:"tnum" 1}
  .shekel{font-size:1.15em;line-height:1}

  .eyebrow{font-size:var(--fs-2xs);font-weight:600;letter-spacing:.09em;color:var(--fg-subtle)}
  .sec__num{font-size:var(--fs-2xs);font-weight:600;letter-spacing:.09em;color:var(--accent)}
  .lede{font-size:var(--fs-md);color:var(--fg-muted);max-width:var(--measure-lede);line-height:1.6}

  .em-track{letter-spacing:.06em}
  .rule-top{border-top:var(--bw-rule) solid var(--fg)}
  .hairline{border-top:var(--bw) solid var(--rule)}

  .skip{position:absolute;inset-inline-start:-9999px}
  .skip:focus{inset-inline-start:1rem;top:1rem;z-index:999;
    background:var(--ink);color:var(--paper);padding:.6rem 1rem}

  /* icon mirroring policy (§9.2) */
  [dir="rtl"] .icon-flip{transform:scaleX(-1)}

  /* the one motion primitive (§8) */
  .reveal{opacity:0;transform:translateY(10px);
    transition:opacity var(--dur-reveal) var(--ease),transform var(--dur-reveal) var(--ease)}
  .reveal.is-in{opacity:1;transform:none}

  /* every in-page anchor target clears the sticky header */
  [id]{scroll-margin-top:88px}
}

@keyframes shake{25%{transform:translateX(5px)}50%{transform:translateX(-4px)}75%{transform:translateX(2px)}}
@keyframes accordion-down{from{height:0}to{height:var(--radix-accordion-content-height)}}
@keyframes accordion-up{from{height:var(--radix-accordion-content-height)}to{height:0}}

@media (prefers-reduced-motion:reduce){
  .reveal{opacity:1;transform:none;transition:none}
  .shake{animation:none}
  *,*::before,*::after{
    animation-duration:.01ms!important;animation-iteration-count:1!important;
    transition-duration:.01ms!important;
  }
}
```

The `@media print` block is **not** in this file — it is large enough to own a section and is specified in full in §11, but it lives in `index.css` immediately after the reduced-motion block.

---

## 6. The literal `tailwind.config.ts`

```ts
import type { Config } from "tailwindcss";

export default {
  // darkMode removed: there is no dark theme. See 03-design-system.md §2.4.
  content: ["./client/index.html", "./client/src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Frank Ruhl Libre"', '"FRL Fallback"', "Georgia", "serif"],
        sans:  ["Assistant", '"Assistant Fallback"', "system-ui", "Arial", "sans-serif"],
      },

      fontSize: {
        "3xs":  ["var(--fs-3xs)",  { lineHeight: "1.55" }],
        "2xs":  ["var(--fs-2xs)",  { lineHeight: "1.4"  }],
        xs:     ["var(--fs-xs)",   { lineHeight: "1.6"  }],
        sm:     ["var(--fs-sm)",   { lineHeight: "1.5"  }],
        base:   ["var(--fs-base)", { lineHeight: "var(--lh-body)" }],
        md:     ["var(--fs-md)",   { lineHeight: "1.6"  }],
        lg:     ["var(--fs-lg)",   { lineHeight: "var(--lh-sub)"    }],
        xl:     ["var(--fs-xl)",   { lineHeight: "var(--lh-sub)"    }],
        "2xl":  ["var(--fs-2xl)",  { lineHeight: "var(--lh-head)"   }],
        "3xl":  ["var(--fs-3xl)",  { lineHeight: "var(--lh-display)"}],
        "4xl":  ["var(--fs-4xl)",  { lineHeight: "var(--lh-display)"}],
      },

      lineHeight: {
        display: "var(--lh-display)", head: "var(--lh-head)", sub: "var(--lh-sub)",
        dish:    "var(--lh-dish)",    tight: "var(--lh-tight)",
        body:    "var(--lh-body)",    loose: "var(--lh-loose)",
      },

      maxWidth: {
        wrap:    "var(--w)",
        body:    "var(--measure-body)",
        lede:    "var(--measure-lede)",
        answer:  "var(--measure-answer)",
        dish:    "var(--measure-dish)",
        caption: "var(--measure-caption)",
        confirm: "var(--measure-confirm)",
        measure: "var(--measure-max)",
      },

      colors: {
        // real tokens
        paper:   { DEFAULT: "var(--paper)", 2: "var(--paper-2)", 3: "var(--paper-3)" },
        ink:     { DEFAULT: "var(--ink)", 2: "var(--ink-2)", 3: "var(--ink-3)", 4: "var(--ink-4)" },
        line:    { DEFAULT: "var(--line)", strong: "var(--line-strong)" },
        tomato:  { DEFAULT: "var(--tomato)", dk: "var(--tomato-dk)" },
        olive:   "var(--olive)",
        danger:  "var(--danger)",
        wa:      { DEFAULT: "var(--wa)", dk: "var(--wa-dk)" },

        // semantic roles — prefer these in components
        bg:        { DEFAULT: "var(--bg)", alt: "var(--bg-alt)", form: "var(--bg-form)" },
        fg:        { DEFAULT: "var(--fg)", muted: "var(--fg-muted)", subtle: "var(--fg-subtle)" },
        accent:    { DEFAULT: "var(--accent)", strong: "var(--accent-strong)" },
        rule:      { DEFAULT: "var(--rule)", control: "var(--rule-control)" },

        // shadcn aliases, re-pointed
        background: "var(--background)",
        foreground: "var(--foreground)",
        card:       { DEFAULT: "var(--card)", foreground: "var(--card-foreground)" },
        popover:    { DEFAULT: "var(--popover)", foreground: "var(--popover-foreground)" },
        primary:    { DEFAULT: "var(--primary)", foreground: "var(--primary-foreground)" },
        secondary:  { DEFAULT: "var(--secondary)", foreground: "var(--secondary-foreground)" },
        muted:      { DEFAULT: "var(--muted)", foreground: "var(--muted-foreground)" },
        destructive:{ DEFAULT: "var(--destructive)", foreground: "var(--destructive-foreground)" },
        border: "var(--border)", input: "var(--input)", ring: "var(--ring)",
        // NOTE: no `golden`, `saddle-brown`, `wine-red`, `cream`, `cornsilk`,
        // `dark-brown`, `chart-*`, `sidebar-*`. All deleted — see §13.
      },

      borderRadius: { DEFAULT: "var(--r)", sm: "2px", md: "var(--r)", lg: "var(--r)", pill: "var(--r-pill)" },
      borderWidth:  { DEFAULT: "1px", rule: "2px", chev: "1.6px" },

      boxShadow: {
        none:   "none",
        sticky: "var(--shadow-sticky)",   // the sticky mobile CTA bar only
        inset:  "var(--ring-inset)",      // photo frame border substitute
        rule:   "var(--rule-double)",     // the doubled hairline on the flagged menu card
        // NOTE: sm/md/lg/xl/2xl are intentionally NOT defined. §3.5.
      },

      spacing: {
        sec: "var(--pad-sec)", "sec-tight": "var(--pad-sec-tight)",
        gutter: "var(--pad-gutter)", head: "var(--gap-head)",
        grid: "var(--gap-grid)", col: "var(--gap-col)", course: "var(--gap-course)",
        card: "var(--pad-card)", form: "var(--pad-form)",
      },

      transitionDuration: { state: "180ms", slow: "220ms", reveal: "550ms" },
      transitionTimingFunction: { house: "cubic-bezier(.2,0,.2,1)" },

      keyframes: {
        "accordion-down": { from: { height: "0" }, to: { height: "var(--radix-accordion-content-height)" } },
        "accordion-up":   { from: { height: "var(--radix-accordion-content-height)" }, to: { height: "0" } },
        shake: { "25%": { transform: "translateX(5px)" }, "50%": { transform: "translateX(-4px)" }, "75%": { transform: "translateX(2px)" } },
      },
      animation: {
        "accordion-down": "accordion-down 220ms cubic-bezier(.2,0,.2,1)",
        "accordion-up":   "accordion-up 220ms cubic-bezier(.2,0,.2,1)",
        shake:            "shake 300ms cubic-bezier(.2,0,.2,1)",
        // NOTE: no float / bounce-gentle / pulse-slow. Zero infinite animations. §8.
      },
    },
  },
  plugins: [],
} satisfies Config;
```

**Two plugins removed, with the sequencing they require:**

- **`@tailwindcss/typography`** — 18,522 B raw / 2,215 B gzip of CSS (measured: 88.91 KB → 70.39 KB) for exactly one usage, `prose prose-lg` at `blog-post.tsx:86`, where the content is already hand-styled JSX so `prose` contributes nothing and fights the explicit classes. It also ships `maxWidth: 65ch` (≈80 Hebrew chars) and `blockquote{fontStyle:italic}` (fake oblique Hebrew). `blog-post.tsx` is deleted, so the plugin goes with it.
- **`tailwindcss-animate`** — only the `ui/*` files listed in §13.3 use `animate-in`/`animate-out`. Remove the plugin **in the same commit as those files**, not before. The accordion's `accordion-up`/`accordion-down` come from this config's own `keyframes`, not from the plugin, so the retained Accordion is unaffected.

Deleting the 35 unreferenced `ui/*` files is worth **CSS −52,614 B raw / −7,344 B gzip** (measured 88,945/14,688 → 54,853/9,430, then → 36,331/7,344 with the typography plugin dropped) — a 59% cut with zero visual change. They contribute **0 bytes of JS** (Rollup already tree-shakes them); the saving is entirely Tailwind's content-glob scanning them for class names.

> **`cn()` must be rewritten in the same commit.** §13.3 removes `tailwind-merge` (20,328 B raw / 6,817 B gzip for a conflict-resolution feature no retained component needs). `client/src/lib/utils.ts` currently imports it, so the file is a **rewrite, not a keep** — `export const cn = (...a: ClassValue[]) => clsx(a)`. Measured: that chunk drops to 410 B raw / 269 B gzip. If one primitive later genuinely needs merge semantics, import `twMerge` locally in that one file so it lands in that route's chunk rather than the shared graph. (Reconciles `00-prior-review.md` B8.)

---

## 7. Component inventory

Every component is written against the **semantic role** tokens (§2.2), so each works unchanged on paper, on `paper-2`, on `paper-3` and inside `[data-band="ink"]` with no band prop.

**Three contracts every component in this section obeys:**

1. **Empty is a designed state, not a fallback.** Each spec below states what the component renders when its Slots are unfilled. "Renders nothing" and "collapses to a shorter list" are valid; "renders an empty box" is a defect.
2. **No literal facts.** Numbers, addresses, hours, prices, areas and policies arrive as `<Slot>` children from a content module owned by `01`. Nothing in this section contains one.
3. **Tables degrade to menus** (L-6), not to gapped grids.

### 7.1 Button and `<CtaPair>`

Dimensionally different from shadcn's default (`h-10`, `rounded-md`, `shadow-sm`) — taller and flatter, so it reads as printed matter.

```
base      font: 600 var(--fs-sm)/1 var(--sans); padding: 1.05rem 1.9rem;
          border: 1px solid currentBg; border-radius: var(--r);
          display:inline-flex; align-items:center; justify-content:center; gap:.5rem;
          min-height: 48px; transition: background/color/transform var(--dur-state) var(--ease)
```

| Variant | Resting | Hover | Contrast |
|---|---|---|---|
| `primary` (default) | `bg:var(--btn-bg)` `fg:var(--btn-fg)` | `bg:var(--accent)` + `translateY(-1px)` | 16.31:1 resting, 5.72:1 hover ✅ |
| `ghost` | transparent, `fg:var(--fg)`, `border:var(--rule-control)` | `fg:var(--accent)`, `border:var(--accent)` | 16.31:1; border 3.69:1 ✅ |
| `wa` | `bg:var(--wa)` `fg:#fff` + inline brand SVG | `bg:var(--wa-dk)` | 5.42 → 6.27:1 ✅ |
| `sm` (modifier) | `padding:.7rem 1.3rem`, `min-height:44px` | — | — |
| `link` | no fill, `--fg-subtle`, underline `--rule` | `--fg`, underline `--accent` | 5.44:1 ✅ |

States: `:focus-visible` → the global 2px `--focus` outline at 3px offset (never a ring, never `outline:none`). `:disabled` → `opacity:.55; cursor:not-allowed; pointer-events:none`, **and** `aria-disabled` rather than the `disabled` attribute on submit buttons so the control stays focusable and screen-reader-discoverable. `[data-loading]` → label swaps to `שולחים…`, width locked via `min-width` so nothing reflows, `aria-busy="true"`.

**`<CtaPair>`** is the only sanctioned way to render more than one CTA together, and it is what enforces L-10:

```tsx
<CtaPair
  primary={{ label:'בנו תפריט לאירוע', href:'#quote' }}
  secondary={{ label:'בואו לטעום הערב', href:'#kitchens', variant:'link' }}
/>
```

It renders **exactly one** `primary` and at most one `secondary`, and it throws in dev if handed two `primary` children. `display:flex; flex-wrap:wrap; gap:.85rem`. Marked `data-cta-pair` so the L-2 test can assert no image precedes it. The phone is a `link`, never a `primary`, except on `/urgent` and `/catering/shiva` where `01` sets `ctaMode:'phone'` and the pair inverts.

**Banned labels:** `הזמינו עכשיו`, `הזמינו אירוע עכשיו`, `הזמן`. Transactional verbs on a considered purchase whose buyer's largest fear is being locked in. **House labels:** `בנו תפריט לאירוע`, `קבלו הצעה`, `בדקו זמינות לתאריך שלכם`, `בואו לטעום`, `שלחו לי הצעה`, `עדיף לי בוואטסאפ`.

### 7.2 `<WaButton>` — branch-routed, never a bare `wa.me` link

```tsx
<WaButton branch="herzliya" context="menu-hero" />   // branch optional; omit for the central line
```

Visual contract only (the click behaviour, the ref code and the same-tick POST are owned by `02` §4): variant `wa`, inline hand-authored WhatsApp SVG at `1.1em` with `aria-hidden="true" focusable="false"`, label from the content module. **The component refuses to render if `WA_NUMBER` is unset or still equals a placeholder** — the same guard `02` §4 puts on the build. A visible WhatsApp button pointing at a stranger's number is worse than no button.

Where a `branch` is passed, the accessible name includes it (`וואטסאפ · המטבח ב<Slot BRANCH_NAME>`), because three identically-named buttons on the kitchens band are a 2.4.4 failure.

### 7.3 Text field / textarea

```
label    font:600 var(--fs-xs) var(--sans); color:var(--fg-muted); margin-block-end:.4rem
control  width:100%; font:400 var(--fs-sm) var(--sans); color:var(--fg);
         background:var(--bg);                      /* paper, NOT white */
         border:1px solid var(--rule-control);      /* 3.69:1 — 1.4.11 */
         border-radius:var(--r); padding:.85rem 1rem; min-height:48px
focus    border-color:var(--fg); + global focus-visible outline; outline is NEVER removed
invalid  border-color:var(--danger); border-width:2px; aria-invalid="true"
disabled background:var(--bg-alt); border-color:var(--ink-4); color:var(--ink-3)
```

The resting background is `--paper`, not `#fff` — white is a hover/active surface only (§2.1).

**Required per field type** (all four are currently missing, and each silently costs mobile completions):

| Field | Attributes |
|---|---|
| name | `autocomplete="name"` `dir="auto"` |
| phone | `type="tel"` `inputmode="tel"` `autocomplete="tel"` `dir="ltr"` `class="text-end num"` |
| email | `type="email"` `inputmode="email"` `autocomplete="email"` `dir="ltr"` `class="text-end"` |
| free text | `dir="auto"` (a lead who types English gets correct alignment) |

`dir="ltr"` fixes the caret and selection behaviour while typing digits, and the base rule in §5 keeps the Hebrew placeholder right-aligned so the field does not look left-aligned inside an RTL form.

**Guest count is never `type="number"`** — it summons the wrong keyboard and allows scroll-wheel mutation. It is a radio-card band (§7.4).

**Date is never native `type="date"`** — it renders LTR with device-dependent locale formatting. Use an RTL-aware picker or three `inputmode="numeric"` selects, always paired with the checkbox `התאריך עוד לא נקבע`, and always resolved in `Asia/Jerusalem` (§4.7).

**No placeholder may solicit medical data.** `contact.tsx:252`'s `אלרגיות` prompt reclassifies the lead table as a health database (see `02`/`04`). The free-text placeholder asks about the event, not about people.

### 7.4 Radio-card option and chips

The primary input of the whole site: full-width bordered blocks, one tap, zero typing.

```
container display:grid; gap:.6rem                (never <select>: costs a tap, reads bureaucratic)
input     position:absolute; opacity:0; width:0; height:0   (visually hidden, still focusable)
span      display:block; padding:1rem 1.2rem; min-height:48px;
          border:1px solid var(--rule-control); border-radius:var(--r); font-size:var(--fs-sm);
          transition:border-color/background var(--dur-state) var(--ease)
:hover    border-color:var(--fg-subtle)
:focus-visible + span   outline:2px solid var(--focus); outline-offset:2px
:checked  + span        border-color:var(--fg); background:var(--fg); color:var(--bg); font-weight:600
```

Checked state is a **full inversion** (16.31:1) — unmistakable at a glance, needs no colour to read, survives greyscale and high-contrast. Selection is never signalled by colour alone.

**Chips variant** (`.chips`): same semantics, `display:flex; flex-wrap:wrap`, `--r-pill` radius, `--fs-2xs`, `min-height:44px` — used for dietary constraints multi-select and event-type tiles.

**Option labels are Slot-driven.** A guest band, an area, a service format: every one of these is a published commercial statement. The component renders the options it is given and renders *nothing* if the list is empty; it never supplies a default band, a default area or a default minimum. Where the area list is unavailable the builder degrades to a free-text `עיר האירוע` field (owned by `02` §3.5) — never to a published catchment.

### 7.5 Checkbox and the consent control

```
.check      display:flex; align-items:flex-start; gap:.6rem; cursor:pointer;
            padding-block:.5rem                    /* brings the hit area to 44px */
.check input width:1.15rem; height:1.15rem; accent-color:var(--accent);
            flex:0 0 auto; margin-block-start:.2rem
.check span font-size:var(--fs-xs); color:var(--fg-muted); line-height:1.55
```

**Exactly one checkbox pattern in the whole product, and it is never required.** The marketing opt-in is unchecked by default, non-blocking, and never a condition of submitting. Its exact Hebrew wording is a legally operative string owned by `04-legal-and-content.md` and stored per-submission with a version tag (`02` §3.10) — this document specifies only its visual contract, never its text.

There is **no** `אני מאשר/ת את מדיניות הפרטיות` gate: Israeli law does not require one, it costs a click, and it buys nothing. The lawful basis is voluntary submission plus the collection notice — which is a **static text block inside the form component**, not a checkbox and not a modal:

```
.notice  font-size:var(--fs-3xs); color:var(--fg-subtle); line-height:1.55;
         max-width:var(--measure-body); margin-block:1rem;
         border-inline-start:1px solid var(--rule); padding-inline-start:.9rem
```

The form component takes the notice as a **required prop**, so a new landing page physically cannot ship a form without it.

### 7.6 Section header

```tsx
<header className="sec__head max-w-[54ch] mb-head reveal">
  <p className="sec__num">01</p>            {/* accent, 0.09em tracking, no uppercase */}
  <h2>מהתפריט של המסעדה</h2>
  <p className="sec__lede">…</p>            {/* --fg-muted, --fs-md, --measure-lede */}
</header>
```

Numerals carry the rhythm — they are what replaces the icon medallions and the photography a conventional catering page would use here. **Zero icons inside headings, zero icon medallions anywhere.** No `text-transform:uppercase` (§4.8).

### 7.7 The dish row and the menu leaf — the spine of the system

This is the most-repeated component on the site and the one the direction is named after. It appears in the hero, in section 01, inside every service menu, on the printed sheet, and inside the confirmation card.

```
.menu-leaf   display:grid; gap:var(--gap-course)
.course      /* one course group */
.course > h3 font-family:var(--serif); font-weight:700; font-size:var(--fs-xl);
             padding-block-end:.5rem; border-bottom:1px solid var(--fg); margin-block-end:.9rem

.dish        display:grid; grid-template-columns:1fr auto; align-items:baseline;
             column-gap:.9rem; padding-block:.7rem;
             border-bottom:var(--bw-leader) dotted var(--rule)   /* the dotted rule IS the leader */
.dish:last-child{border-bottom:0}
.dish__name  grid-column:1; font-family:var(--serif); font-weight:500;
             font-size:var(--fs-lg); line-height:var(--lh-dish)
.dish__desc  grid-column:1; font-size:var(--fs-xs); color:var(--fg-muted);
             max-width:var(--measure-dish); line-height:1.5; margin-block-start:.15rem
.dish__mark  grid-column:1; font-size:var(--fs-2xs); font-weight:600; letter-spacing:.09em;
             color:var(--accent); margin-block-start:.35rem     /* «מוגש היום ב…» */
.dish__price grid-column:2; grid-row:1; font-family:var(--serif); font-weight:500;
             font-size:var(--fs-lg); white-space:nowrap;
             font-feature-settings:"tnum" 1
```

**Never repeated period characters as a leader.** A run of `.` characters breaks under RTL reordering, is announced as noise by a screen reader, and cannot be centred against a Hebrew baseline. A `border-bottom: 1px dotted` gives the same printed-menu effect, is direction-agnostic, and is announced as nothing.

**Why a grid and not a text run.** Name and price are separate grid cells, so no bidi algorithm ever sees them as one paragraph and no reordering is possible between them (§4.9). This is not a layout convenience; it is the bidi fix.

**The description is hard-capped at 12 words and `--measure-dish` (17em ≈ 44 Hebrew chars).** Enforced in the copy spec and by the max-width here. A dish description that wraps to three lines destroys the scan rhythm that makes a menu readable, and on a 390px screen it is the difference between four visible dishes and two.

**The provenance mark `מוגש היום ב{סניף}` is a claim, and it is gated.** It renders **only** where the dish record carries both (a) confirmed catering availability and (b) a live restaurant-menu URL for that branch. Where either is missing the mark is **omitted, never softened** — no `זמין ברוב הסניפים`, no `בדרך כלל`. Where the cross-link exists the branch name inside the mark is a link to that branch's live menu, which is what makes "come eat it tonight" checkable rather than a slogan. This is the proof/assertion rule applied to type instead of images.

**Degradation, in order (L-6):**

| Missing | Result |
|---|---|
| price | `.dish__price` does not render; the grid collapses to `1fr`. The row reads as a **chef's-menu line**, a legitimate restaurant convention. |
| description | the name and price sit alone on the leader — the densest and arguably best form of the row. |
| provenance mark | omitted silently. |
| the whole dish list | the section does not render, heading included (L-5). |

That first row is the direction's single most important property: **an incomplete table reads as an unfinished quote; an incomplete menu reads as a menu.** No other layout in the system degrades this well, which is why the menu — not a photograph and not a price table — is the hero.

**Dish record fields the component consumes** (the module itself is owned by `01`; listed here so the render contract is unambiguous): `id`, `name`, `desc?` (≤12 words), `course`, `priceSlot?`, `branches: Branch[]` (catering-available), `liveMenuUrl?: Record<Branch,string>`, `dietary?: string[]`, `season?`. The component never invents a course, never re-orders dishes, and renders courses in the order the module supplies.

**`הוסיפו לתפריט שלי`** — the PII-free micro-commitment (`02` owns the state and the `add_to_brief` event). Visual contract: a `link`-variant control at `--fs-2xs` in the price cell's row, appearing on `:hover`/`:focus-within` on pointer devices and **always visible on touch** (`@media (hover:none)`), because hover-only affordances are unreachable on the device where most of this traffic lands. Selected state is a filled `check` glyph plus a text change to `בתפריט שלכם`, `aria-pressed` on the control — never colour alone.

### 7.8 Hero (the menu leaf as headline)

The one place the direction is either obvious or lost.

```
.hero__in    display:grid; grid-template-columns:1.08fr .92fr; gap:var(--gap-col);
             align-items:start; padding-block:clamp(3rem,7vw,6rem) clamp(3rem,6vw,5rem)
@media(max-width:860px){ .hero__in{grid-template-columns:1fr} }
```

Order, fixed:

1. `.eyebrow` — brand + category + the branch list from `Intl.ListFormat` over `locations.ts` (§4.7). Branches that are unconfirmed do not appear.
2. `h1`, **three typographic lines**, FRL 500 at `--fs-4xl`, `--lh-display`. Static. No rotation, ever (§8).
3. `.lede`, one paragraph, `--measure-lede`.
4. **Four dish rows** in `.menu-leaf` form, taken from the same module as section 01 — real dish names, with the provenance mark where it is earned. This is the qualifying hook and it costs zero invented facts.
5. `<CtaPair>` — one filled primary, one text link.
6. The self-pruning note line (`<SlotGroup>`, §7.30).
7. **Optional**, and only in the second grid column: one still `<Photo>`.

**The photo rule for the hero, which is a change from the design reference.** The reference sets `.hero__photo{order:-1}` at 860px, moving the image *above* the text on mobile. **That is inverted here**: on mobile the photo renders **after** the CTA pair, or not at all. L-2 forbids an image above the fold on any breakpoint, and on this direction the first thing a visitor must see is a dish name, not a plate. With no photo the hero is a single column at `--measure-lede`-ish width with the dish rows carrying the right-hand weight; it does not look like a two-column layout missing a column, because the grid collapses rather than leaving a hole.

### 7.9 `<HairlineTable>` — and the `<dl>` stack under 640px

Used by inclusions/exclusions, the branch sheet, drive times, ops facts.

```
wrapper  overflow-x:auto; -webkit-overflow-scrolling:touch   /* the PAGE never scrolls sideways */
table    width:100%; border-collapse:collapse; font-size:var(--fs-sm)
th       text-align:start;                                   /* logical, never text-right */
         font:600 var(--fs-2xs) var(--sans); letter-spacing:.09em; color:var(--fg-subtle);
         padding-block:.7rem; border-bottom:1px solid var(--fg)
td       padding-block:.75rem; border-bottom:1px solid var(--rule); vertical-align:baseline
td.num   class="num"                                          /* every numeric cell */
```

No zebra striping, no shadow, no vertical borders.

**Under 640px every table stacks to a definition list** — `<dl>` with `dt` at `--fs-2xs`/600/`--fg-subtle` and `dd` at `--fs-sm` — rather than scrolling horizontally. A horizontally scrolling table on a 390px Hebrew screen is where the conversion lens's own winner leaked. The stacking is a CSS-only `@media` swap over the same DOM using `display:block` on the parts; **do not render two DOM trees.**

**`collapse="menu"` (L-6).** When more than half a table's value cells are unfilled Slots, the component renders the surviving rows as a `.menu-leaf` list instead of a grid — label as `.dish__name`, value as `.dish__price`, no header row. A two-column table with four empty cells looks broken; the same four facts as a menu list look complete. This prop is the default for `<InclusionsExclusions>`, `<OpsFacts>` and `<DriveTimeTable>`.

### 7.10 `<InclusionsExclusions>` — two columns of equal weight

The device that wins the comparison against a competitor's naked per-portion price without publishing a price of our own.

```
.incex        display:grid; grid-template-columns:1fr 1fr; gap:1px; background:var(--rule);
              border:1px solid var(--rule); border-radius:var(--r); overflow:hidden
.incex > div  background:var(--bg); padding:var(--pad-card)
@media(max-width:640px){ .incex{grid-template-columns:1fr} }
.incex h3     font-size:var(--fs-lg)     /* «מה כלול» / «מה לא כלול» */
.incex li     padding-inline-start:1.15rem; position:relative; margin-block-end:.5rem;
              font-size:var(--fs-sm); color:var(--fg-muted)
.incex li::before{content:"";position:absolute;inset-inline-start:0;top:.72em;
              width:5px;height:5px;border-radius:50%;background:var(--accent);opacity:.55}
.incex--out li::before{background:none;border:1px solid var(--fg-decor);opacity:1}
```

**The exclusions column is typeset at the same weight as the inclusions column** — same heading size, same list treatment, same column width. It is not a footnote. Exclusions are what pre-empt the objection that kills a deal in week two, and burying them is exactly the category behaviour this site is differentiating against.

The two lists are Slot-driven and independent: an empty exclusions list collapses that column and the grid becomes one column; an empty inclusions list collapses the whole component. **The component never supplies a default inclusion or exclusion** — whether staff, delivery, disposables, setup, teardown or VAT sit on one side or the other is an owner fact and a legally operative representation.

### 7.11 `<LimitsBlock>` — `מה אנחנו לא עושים`

Its own section, not a paragraph inside inclusions. No competitor in the category publishes a limit of any kind; this is the cheapest credibility on the site and the reason every other number on the page is believable.

```
.limits      display:grid; grid-template-columns:repeat(auto-fit,minmax(240px,1fr));
             gap:var(--gap-grid)
.limit       border-top:var(--bw-rule) solid var(--fg); padding-block-start:1.1rem
.limit h3    font-size:var(--fs-lg); margin-block-end:.4rem
.limit p     font-size:var(--fs-sm); color:var(--fg-muted); max-width:var(--measure-dish)
```

Each limit is one `<Slot>` and prunes independently (`prune="cell"`). A block with one surviving limit renders one column and still reads correctly — the `border-top` masthead rule is what makes a single item look intentional rather than orphaned.

**Every figure inside a limit is an operational commitment.** Capacity, cutoff, minimum, maximum, lead time: none has a default, none is inferred from a competitor, and `blocking` is set on any limit that `01` marks as required for that route to publish.

### 7.12 `<OpsFacts>` — the operational strip

Minimum, lead time, delivery window, self-pickup, delivery area, response time. A `<HairlineTable collapse="menu">` with `label` / `value` / optional `note` per row, `.num` on every value.

Two placements, set by `01` per route: below the money block on menu-led routes; **above the fold, immediately under the hero, on `/urgent`, `/catering/business` and `/catering/shiva`** (§7.13 and the route-register inversion). Same component, same DOM, different section order.

Rows render only where their Slot is filled. **A route on which every ops Slot is empty renders no strip at all** rather than a table of dashes.

### 7.13 `<DecisionChecklist>` — the mobile anti-bounce device

A compact checklist of what the visitor has to decide, doubling as in-page navigation. It is the direct mitigation for the direction's stated weakness: a wall of Hebrew dish rows on a 390px screen is where scroll depth dies.

```
.checklist        border-block:1px solid var(--rule); background:var(--bg-alt);
                  padding-block:var(--pad-sec-tight)
.checklist ol     list-style:none; display:grid;
                  grid-template-columns:repeat(auto-fit,minmax(200px,1fr)); gap:.6rem 1.4rem
.checklist a      display:flex; gap:.6rem; align-items:baseline; min-height:44px;
                  font-size:var(--fs-sm); text-decoration:none
.checklist a b    font-family:var(--serif); color:var(--accent); font-feature-settings:"tnum" 1
.checklist a:hover{color:var(--accent)}
```

**Two rules that make it honest.** It renders **only items whose target section will actually render** — an entry pointing at a section whose Slots are empty is a promise the page cannot keep, and the losing direction's version of this block made exactly that promise. And it carries **no framing sentence claiming the answers are all here**; it is a list of jump links, nothing more.

Marked `nav` with `aria-label`, and it is the reason the mobile header needs no expanded menu on content routes (§7.28).

### 7.14 `<ProcessSteps>` — `מהשיחה ועד הפינוי`

The reference's `.step` pattern, which is the best thing in `style.css` and is ported nearly verbatim — minus the italic.

```
.steps   list-style:none; display:grid;
         grid-template-columns:repeat(auto-fit,minmax(230px,1fr)); gap:clamp(1.6rem,3vw,2.5rem)
.step    position:relative; padding-block-start:2.6rem; border-top:1px solid var(--fg)
.step__n position:absolute; top:0; inset-inline-start:0; transform:translateY(-50%);
         background:var(--bg); padding-inline-end:.7rem;
         font-family:var(--serif); font-size:1.05rem; font-weight:700; color:var(--accent)
.step h3 margin-block-end:.55rem
.step p  font-size:var(--fs-sm); color:var(--fg-muted)
.step em { font-style:normal; font-weight:600; color:var(--fg) }   /* NOT italic — §4.8 */
```

The numeral interrupting the rule (technique 3, §3.4) is what carries the "printed matter" reading with no imagery at all.

### 7.15 Card, card grid, and `<EventRows>`

```
.cards  display:grid; grid-template-columns:repeat(auto-fit,minmax(270px,1fr));
        gap:1px; background:var(--rule); border:1px solid var(--rule);
        border-radius:var(--r); overflow:hidden       /* the gutters ARE the rules */
.card   background:var(--bg); padding:var(--pad-card); transition:background var(--dur-state-slow)
.card:hover  background:var(--surface-hover)          /* white is a hover state */
.tag    font-size:var(--fs-2xs); color:var(--fg-subtle);
        border:1px solid var(--rule); border-radius:var(--r-pill); padding:.2rem .7rem
```

`.tag` is the **only** pill in the system (L-11).

**`<EventRows>`** is the occasion list (`לאיזה אירועים אנחנו נכנסים`) rendered in the card grid, one card per occasion, each with a title, a two-line description and up to three `.tag` chips. Occasions come from a content module; **the component renders the occasions it is given.** It does not carry the category's default occasion set, and an occasion whose page does not exist does not get a card.

### 7.16 Accordion (FAQ)

**Use the Radix Accordion already in the repo** (`ui/accordion.tsx`), not a hand-rolled one. It gives `aria-expanded`, `aria-controls`, the labelled region and correct keyboard handling for free. The current hand-rolled `sections/faq.tsx:52-66` has none of them, and `index.css:225-228` caps the expanded panel at `max-height:500px` with `overflow:hidden` — which **silently truncates** the 12-item main-dishes category (~950px at mobile single-column) and will truncate any long Hebrew answer. **Never a magic `max-height`.**

```
item     border-bottom:1px solid var(--rule)
trigger  padding-block:1.3rem; padding-inline-end:2.4rem; min-height:56px;
         font-family:var(--serif); font-size:var(--fs-lg); font-weight:500; text-align:start
:hover   color:var(--accent)
chevron  drawn from two rotated 1.6px borders in var(--accent) — NOT an icon font:
         width:9px;height:9px;border-inline-end:var(--bw-chev) solid var(--accent);
         border-bottom:var(--bw-chev) solid var(--accent);transform:rotate(45deg)
[open]   transform:rotate(-135deg); transition:transform var(--dur-state-slow) var(--ease)
answer   max-width:var(--measure-answer); font-size:var(--fs-sm); color:var(--fg-muted)
```

**A question whose answer Slot is empty is not shipped as a question.** An accordion of unanswerable questions is worse than a shorter FAQ — it advertises exactly the facts the business has not settled.

### 7.17 `<ProductionSheet>` — the kitchens band

The one `[data-band="ink"]` on the route (L-9), and the place the differentiator stops being a claim.

```
.sheet      display:grid; grid-template-columns:repeat(3,1fr); gap:1px; background:var(--rule)
.sheet > *  background:var(--bg); padding:var(--pad-card)
@media(max-width:860px){ .sheet{grid-template-columns:1fr} }
```

Each branch column is a `<HairlineTable collapse="menu">` of rows, every one Slot-driven: `כתובת` · `שעות המטבח` · `מי מנהל את המטבח` · `איסוף עצמי` · `אזור חלוקה` · `קיבולת ליום` · `נגישות פיזית` · `כשרות`. `.num` throughout. Phone in local display form with E.164 in the `href`. Ranges in connector form, never en-dash.

Then, per column: a `<GoogleReviews>` link (§7.19), a `<WaButton branch>` whose prefill names that kitchen, and — where the owner supplies them — up to one `<Photo>` under the Caption Law.

**Four rules specific to this component:**

- **A column whose chef-name Slot is empty collapses to a shorter honest column,** never an anonymous `—`. The row disappears; the column stays.
- **The `נגישות פיזית` row is per-branch and Slot-driven.** `contact.tsx:377`'s baseless `נגיש לנכים` is deleted. The regulation requires the accessibility statement to describe each branch separately, and this row is the render target for that data — it is why `locations.ts` needs the fields (`00-prior-review.md` C6).
- **The `כשרות` row renders the owner's own sentence verbatim, from one Slot, and only here.** Never a badge, never a seal, never a graphic, never site-wide, never in the hero, never as an inferred formulation. If the Slot is empty the row does not exist and the site says nothing about kashrut anywhere. This document specifies no kashrut wording of any kind; the string is owned by `04-legal-and-content.md` and comes from the owner.
- **Maps: a static image plus a text link, never an embedded iframe.** A Google Maps iframe transmits every visitor's IP to Google and sets Google cookies on three branch pages, reinstating the disclosure and consent obligation that self-hosting the fonts eliminated (`00-prior-review.md` B7). `<BranchMap>` renders a build-time-generated static image inside a `.photo` frame at `3:2` with the branch address as its accessible name, plus a plain `הוראות הגעה` link that opens the maps app. With no map asset it renders the address alone — which loses nothing, because the address is the fact that matters.

### 7.18 `<TastingBand>` — Slot-gated, and it does not exist until it is confirmed

Placed **immediately after the money/inclusions section**, where doubt peaks — not as a hero link.

```
.tasting  border-top:var(--bw-rule) solid var(--fg); background:var(--bg-alt);
          padding-block:var(--pad-sec-tight)
.tasting h2   font-size:var(--fs-xl)
.tasting p    max-width:var(--measure-body)
.tasting ul   display:grid; grid-template-columns:repeat(auto-fit,minmax(220px,1fr));
              gap:var(--gap-grid); margin-block-start:1.6rem
```

**The band renders only when both conditions hold:** (a) `SLOT.TASTING_POLICY` is filled, and (b) at least one branch has a confirmed address and hours. It then renders **the owner's policy sentence verbatim** followed by the qualifying branches' addresses and hours.

**This component contains no policy text of its own.** Whether a tasting needs coordination, whether there is a minimum, whether it is free, and which branches host one are all open owner questions. A band that asserts a walk-in policy the business has not agreed to is exactly the class of invented fact this project exists to purge — and it would be asserted on the highest-traffic band on the page.

Tracked as its own conversion action (`02`), so it is never judged against quote volume: it exists to convert the majority who are not ready to request a quote.

### 7.19 `<GoogleReviews>` — the only social proof that survives the honesty constraint

```tsx
<GoogleReviews branch="herzliya" />   // renders only where locations[branch].gbpUrl is filled
```

An outbound link per branch, styled as a `link`-variant control with the hand-authored Google mark at `1em`, `aria-hidden`, and an accessible name naming the branch. **No rating, no star row, no review count, no scraped text, no `aggregateRating` and no `Review` JSON-LD.** The rating lives at its source, is always current, and requires no claim from us — which is the entire point. Hardcoded `4.9/5 · 247 ביקורות` and `4.8/5 · 189 ביקורות` in `testimonials.tsx:63-95` are deleted with the file (§13.3): fabricated aggregate ratings attributed to named third parties are the sharpest consumer-protection exposure in the repo and misappropriate two companies' marks.

Renders nothing when the profile URL Slot is empty. At launch that may mean the site ships with no on-page proof at all — which is correct, and is why §7.20 exists.

### 7.20 `<PastEvents>` — a reference table that collapses to nothing

"Who else have you done this for, at my size" is the second question every accountable buyer is asked. The only form of answer that survives both the honesty constraint and the review-publication rules is a factual table of comparable jobs: **type · guest count · city · month**. No names, no logos, no quotes, no photographs of guests — unless the owner supplies documented written consent, in which case a `blockquote` (FRL 500 at `--fs-lg` over a `--bw-rule` ink rule) and a first name are added per entry.

`<HairlineTable collapse="menu">`, `.num` on the guest count. **Empty is the expected launch state and renders nothing — heading included.** The component has no placeholder rows and no sample entries.

### 7.21 `<AreaServed>` and `<DriveTimeTable>`

The only honest basis for a page about a city with no kitchen in it.

`<AreaServed>` renders one sentence per served area in the form `מוגש מהמטבח שלנו ב<Slot BRANCH>` plus, where supplied, a drive-time figure. `<DriveTimeTable>` is a `<HairlineTable collapse="menu">` of `עיר` / `מטבח` / `זמן נסיעה`, `.num` on the minutes.

**Every row is owner-signed.** Drive times are not computed from a map, areas are not inferred from a radius, and a city with no confirmed serving branch gets no row — and therefore its area page does not build. This is the structural difference between a legitimate area page and a doorway page.

### 7.22 `<StationsBlock>` — live stations, entirely conditional

Pasta bar, pizza oven, open antipasti. Rendered as `<EventRows>`-style cards with an operational sub-list (guest-count range, space, power, whether a cook travels to the site) as a `<HairlineTable collapse="menu">`.

**The whole block is gated on `SLOT.STATIONS`.** Whether on-site cooking is offered at all is an open owner question; a station is an operational commitment involving staff travelling to a venue. No station, no block, no mention.

### 7.23 `<TermsStrip>` — commercial terms adjacent to the CTA

A compact strip directly under the final builder step: deposit, cancellation policy, final-headcount deadline, quote validity. `--fs-3xs`, `--fg-subtle`, `border-top:1px solid var(--rule)`, `max-width:var(--measure-body)`, each item a `<Slot prune="clause">` joined by ` · `.

Nothing raises an accountable buyer's confidence faster than seeing these **before** they commit — they are precisely the facts the buyer will be asked to defend. **Every value is owner-supplied and the strip collapses entirely if none is.** It links to the real `תקנון`; it does not summarise or paraphrase it, because a summary that diverges from the terms page is worse evidentially than no summary. Wording owned by `04-legal-and-content.md`.

### 7.24 Quote-builder chrome

```
.calc        background:var(--bg); border:1px solid var(--rule);
             border-radius:var(--r); padding:var(--pad-form)
.calc__bar   height:2px; background:var(--rule); border-radius:var(--r-pill); overflow:hidden
.calc__bar i display:block; height:100%; background:var(--accent);
             transition:width .3s var(--ease);
             /* RTL: the fill grows from the INLINE-START edge. Use a flex/grid child
                sized by width, NOT transform:scaleX — a left-filling bar reads as
                REGRESSING in Hebrew. Verify visually at 2/5 and 4/5. */
.calc__count font:600 var(--fs-3xs) var(--sans); letter-spacing:.09em; color:var(--fg-subtle)
             /* "שאלה 2 מתוך 5" — discrete steps, never a percentage */
legend       font-family:var(--serif); font-size:var(--fs-xl); font-weight:500
.est         background:var(--bg-alt); border:1px solid var(--rule);
             border-radius:var(--r); padding:1.3rem 1.4rem
.est__val    class="num"; font-size:clamp(1.5rem,1.25rem + 1vw,2rem); font-weight:500
.est__note   font-size:var(--fs-xs); color:var(--fg-subtle)
.hp          position:absolute; inset-inline-start:-9999px   /* honeypot */
```

`.calc__count` carries `aria-live="polite"`.

**Three hard rules on the estimate box.**

1. `.est` renders **null** when the price Slots are empty. No range, no placeholder, no `החל מ־`.
2. `.est__note` is the **same type size** as the number it qualifies. A grey 11px footnote under a 4xl figure is exactly the pattern that fails the reasonable-consumer test.
3. The estimate output is **never adjacent to an action that could read as acceptance**. No `הזמינו`, no payment field, no confirm control in the same view as a computed figure. The qualifier string is `LEGAL.PRICE_ESTIMATE_NOTE`, a **required prop** — the component refuses to render a number without it. It has no default value, in this document or in code.

### 7.25 Brief card, confirmation, and the shareable summary

**Set as a menu card, not an invoice.** A document that looks like a quote invites price negotiation; a document that looks like a menu invites approval. This is the direction's terminal artefact and the thing the second decision-maker actually reads.

```
.brief       background:var(--bg-alt); border-top:var(--bw-rule) solid var(--fg);
             padding:var(--pad-card); max-width:var(--measure-confirm)
.brief dl    display:grid; grid-template-columns:auto 1fr; column-gap:1rem; row-gap:.5rem
.brief dt    font-size:var(--fs-2xs); font-weight:600; letter-spacing:.09em; color:var(--fg-subtle)
.brief dd    font-size:var(--fs-sm); margin:0
.brief__ref  class="num"; font-size:var(--fs-lg)
.brief__menu /* the selected dishes rendered as .menu-leaf — same grammar as §7.7 */
```

The card grows as the builder is answered (each answer echoed back in the same typography as the printed menu — visible accumulated investment), and it is the same component that renders on the confirmation route and on the shareable summary. Sections: the buyer's spec, the selected dishes as a menu leaf, the inclusions, the terms strip, the reference code, and the address of the kitchen that will cook it.

Print behaviour is specified in §11; the summary route, its ref lookup, its field allowlist and its expired-ref state are owned by `02`.

### 7.26 `<Photo>` — the Caption Law as a component contract

```tsx
type Ratio = '4/5' | '4/3' | '3/4' | '3/2' | '9/7' | '1200/630';

interface PhotoProps {
  ratio: Ratio;                 // REQUIRED — hard-coded ratios, see below
  caption: string;              // REQUIRED — tsc fails without it (L-4)
  spec: string;                 // shown inside the frame when src is absent
  src?: string; alt?: string;
  width?: number; height?: number;   // from the sharp manifest; required when src is set
  index?: number;                    // the {n} of the caption format
  priority?: boolean;                // at most one per route → fetchpriority=high
}
```

Renders, in order of preference:

1. **With `src`:** `<figure>` → `<img>` with explicit `width`/`height` from the build-time sharp manifest (never hand-typed — they drift the moment the owner sends a replacement crop), `object-fit:cover`, `loading={priority?'eager':'lazy'}`, `decoding={priority?'sync':'async'}`, `fetchpriority={priority?'high':'auto'}`; then `<figcaption>`.
2. **Without `src`:** the labelled paper frame — `background:linear-gradient(135deg,var(--paper-2),var(--paper-3))`, `box-shadow:var(--ring-inset)`, `display:grid;place-items:center`, with `spec` centred in `font:600 var(--fs-xs)/1.6 var(--sans)`, `letter-spacing:.06em`, `color:var(--fg-subtle)`, `max-width:22ch`.

```
figcaption  margin-block-start:.7rem; padding-block-start:.7rem;
            border-top:1px solid var(--rule);
            font-size:var(--fs-xs); color:var(--fg-subtle);
            max-width:var(--measure-caption); line-height:1.6
            /* the branch name inside the caption links to that branch's page */
```

**Caption format, fixed:** `{n} · {סניף} · {רחוב} · {מה קורה} · {שעה}` — i.e. `{{INDEX}} · {{BRANCH_NAME}} · {{STREET}} · {{WHAT_IS_HAPPENING}} · {{TIME}}`. Every one of those is owner-supplied at shoot time; **no example in this document fills them in**, because a spec example is the most-copied string in a build and none of these facts is confirmed. An uncaptioned image cannot be committed. This is what permanently blocks stock imagery and SVG stand-ins from re-entering.

**The ration is three per route, zero above the fold, at most one `priority`** (L-2, L-3). On most routes the LCP element is text, so `priority` is often unused — set it only on a route that genuinely leads with an image, and never on a route whose hero is a menu leaf.

**The ratios are hard-coded in CSS**, so a photo shot at the wrong ratio gets `object-fit`-cropped and the composition is destroyed. Brief the owner **before** the shoot: hero `4:5` 1400×1750 (collapsing to `4:3` under 860px) · kitchen `3:4` 900×1200 · hands `9:7` 900×700 · branch spread `3:2` · `og` 1200×630 per route. On the ink band the frame recolours automatically (`linear-gradient(135deg,#2c2622,#3a332c)`, `box-shadow:inset 0 0 0 1px #453d35`, spec text at 6.49:1).

**Owner phone photos — normalise at export, never in CSS.** CSS filters cost a compositing pass per image, break in print, and were amplified by the old high-contrast filter. Bake it into the file:

```bash
magick in.jpg -auto-orient -resize 1400x1750^ -gravity center -extent 1400x1750 \
  -modulate 100,92 -level 2%,98% -unsharp 0x0.75+0.6+0.008 out.jpg
cwebp -q 82 out.jpg -o out.webp      # plus AVIF at 480/800/1200/1600
```

Hold saturation ~8% back so nothing out-shouts the accent; lift pure black toward `#1e1a17`; no vignette, no clarity/HDR; every file under ~300 KB. Art direction for the owner: window light from the side, flash off, HDR off, no filter, no in-app "food" preset; plate height or 30–45° above — never overhead flat-lay, the most stock-coded food angle there is; **one dish in focus, not a buffet spread** (a spread photographs as a wedding-hall banner, one plate photographs as a restaurant); include a hand, an arm, a towel or flour on the counter.

**Delete the SVG stand-ins** (`client/src/assets/images/**/*.svg`, 12 files). Vector illustration standing in for photography reads as "template not yet filled in" — and none of them is even emitted by the production build (`dist/public/assets` contains only hashed JS and CSS, so all 20 image references currently **404 in production**).

`sizes` is authored **per layout slot**, never globally: hero `sizes="100vw"`; the three-up branch grid `sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 33vw"`. A wrong `sizes` is the most common cause of a 1600w download onto a 390px phone and is invisible in a desktop Lighthouse run.

### 7.27 `<Photo>` metadata capture — the shoot brief

Not a component, but the contract that makes the component satisfiable. Ask the owner for **branch + street + what is happening + the hour** *at shoot time*, alongside the four ratios. Hour and action are unreconstructable afterwards and cost nothing to request in advance. Even at a three-photo ration, captured metadata is what makes future branch pages possible without a reshoot.

### 7.28 Header

The one place a modern effect is warranted, used with restraint.

```
.head    position:sticky; top:0; z-index:80;
         background:color-mix(in srgb, var(--paper) 88%, transparent);
         backdrop-filter:saturate(1.4) blur(10px);
         border-bottom:1px solid transparent;
         transition:border-color var(--dur-state-slow) var(--ease)
.head.is-stuck  border-bottom-color:var(--rule)     /* fires once scrollY > 8 */
```

No shadow, no shrinking logo, no colour inversion. **The `is-stuck` hairline is the entire scroll feedback** — do not add a shadow "so it separates". Note the coupling with §2.4: a CSS `filter` on `html`/`body` creates a containing block that breaks `backdrop-filter`, which is the second independent reason the filter-based accessibility mode must become token overrides.

Contents: wordmark (FRL 700) + a short nav + the phone as a `link` + one `sm` primary. On content routes the in-page `<DecisionChecklist>` (§7.13) does the section-level navigation, so the header nav carries **route-level** links only.

Mobile drawer: **use the Radix `Sheet`/`Dialog` already in the repo**, not the hand-rolled `translate-x-full` panel at `header.tsx:83-141`. That panel stays mounted and focusable when "closed" — every nav item remains in the tab order — and the hamburger at `header.tsx:77` and close at `:94` are icon-only with **no accessible name at all**, so on mobile a screen-reader user hits a dead end at the only route to navigation. **The primary CTA goes at the TOP of the drawer**, not below six nav items outside thumb reach.

### 7.29 Sticky mobile CTA bar

```
.sticky  position:fixed; inset-inline:0; bottom:0; z-index:85; display:none;
         background:var(--bg); border-top:1px solid var(--rule);
         padding:.6rem .8rem calc(.6rem + env(safe-area-inset-bottom));
         gap:.5rem; box-shadow:var(--shadow-sticky)
.sticky a{flex:1; text-align:center; min-height:48px; padding:.85rem .4rem;
          border-radius:var(--r); font:600 var(--fs-sm)/var(--lh-tight) var(--sans);
          border:1px solid var(--rule-control)}
@media(max-width:760px){ .sticky{display:flex} body{padding-bottom:5rem} }
```

**Exactly two controls, and exactly one of them is filled.** `וואטסאפ` is the filled control (`--wa`); the second control is a **ghost**. This corrects the first pass, which specified two filled buttons and therefore violated its own L-10 in the one component that appears in every viewport on every route.

**The bar is chrome, not content, and is the single stated exception to L-10** — it necessarily shares a viewport with each section's own primary CTA. That exception is bounded by the one-filled-control rule above; without it the rule is unenforceable and the gate gets disabled.

**Per-route configuration.** `RouteDef` carries `stickyBar: 'quote' | 'phone' | 'none'` (owned by `01`):

| Value | Filled | Ghost | Used on |
|---|---|---|---|
| `quote` | `וואטסאפ` | `התפריט שלכם` | menu-led routes |
| `phone` | `וואטסאפ` | `התקשרו` | `/urgent`, and any route where `01` sets `ctaMode:'phone'` |
| `none` | — | — | `/catering/shiva`, legal routes, the confirmation and summary routes |

`none` exists because a mourning-intent route forbids upsell: a persistent `הצעה` button on that page is the exact tonal failure the route is designed to avoid.

`env(safe-area-inset-bottom)` is mandatory or the bar sits under the iOS home indicator. `body{padding-bottom:5rem}` is mandatory or the bar covers the last section — and both are undone in print (§11).

### 7.30 `<Slot>` and `<SlotGroup>` — the honesty mechanism

```tsx
type Prune = 'clause' | 'row' | 'cell' | 'section';

interface SlotProps {
  id: string;                  // 'MIN_GUESTS', 'ADDR_HERZLIYA', 'FAQ_KASHRUT'
  children?: React.ReactNode;  // the filled value, if any
  prune?: Prune;               // default 'clause'
  blocking?: boolean;          // default false — see below
}

interface SlotGroupProps {
  join?: string;               // default ' · '
  children: React.ReactNode;   // <Slot prune="clause"> children
}
```

Behaviour:

- **dev** (`import.meta.env.DEV`): renders `background:var(--slot-bg); box-shadow:0 0 0 1px var(--slot-ring); padding:0 .3em; border-radius:2px` with the token id visible. On the ink band the highlight recolours to `#4a3c1f`/`#6d5a2e` so slots stay visible.
- **production, filled:** renders the value with no decoration.
- **production, unfilled, `blocking:false`:** renders `null` and prunes the smallest containing unit.
- **production, unfilled, `blocking:true`: the production build FAILS.** This is the mechanism for facts a page may not ship without — the registered legal entity and ח.פ., the privacy contact, the accessibility coordinator, and any figure `01` marks as required for that route. A blocking Slot cannot be satisfied by a plausible guess, which is the entire point. (This prop was missing from the first pass and is restored per `00-prior-review.md` B6; `01` and `02` both already assume it exists.)

**Clause-level pruning is the default** because it is strictly better than section-level collapse. The hero note line is the canonical example, and it contains **no literal numbers**:

```tsx
<SlotGroup join=" · ">
  <Slot id="RESPONSE_TIME">תשובה תוך {…}</Slot>
  <Slot id="GUEST_RANGE">מ־{…} ועד {…} סועדים</Slot>
  <span>שלושה מטבחים</span>
</SlotGroup>
```

With both facts unfilled the line degrades to `שלושה מטבחים` — the one clause that is verifiable from the page itself — with no dangling separator. **The first pass hardcoded a guest minimum here, taken from a competitor's published figure; that is deleted and the grep in §14 blocks its return.** A published minimum is a commercial commitment.

A section whose every Slot is empty does not render, heading included. Wire the dev/prod switch to the same env flag as the reference's `body.live` class.

### 7.31 `<Fact>` — the Caption Law applied to numerals

```tsx
interface FactProps {
  value: React.ReactNode;   // usually a <Slot>
  unit?: string;            // 'מטבחים', 'דקות', 'סועדים'
  source: string;           // REQUIRED — where the reader can check it
  href?: string;            // optional in-page or outbound target for `source`
}
```

Renders `value` in `.num` (FRL 500, `tnum`) with the source label at `--fs-2xs` / `--fg-subtle`, linked when `href` is present. **Every figure on the site either cites where it can be checked or does not render.** `source` is required and has no default — this reconciles the three conflicting signatures across the specs (`00-prior-review.md` B6).

The one fact that always passes: `3` / `מטבחים` / source = the kitchens section, because the addresses are on the same page. Anything else needs an owner.

Trust-bar form: cells divided by `border-inline-start:1px solid var(--rule)` on a `--bg-alt` band with `border-block`, numbers in FRL 500 at `clamp(1.5rem,1.2rem + 1vw,2.05rem)`, labels `--fs-xs` `--fg-subtle`, collapsing to 2×2 at 680px with the odd cells' inline border removed. **The bar renders however many cells it has facts for** — two or three is a correct and common state — and has **no count-up animation**, banned twice over as attention-seeking motion and because it dramatises numbers we cannot yet stand behind.

### 7.32 Primitives: `<Ltr>`, `<Num>`, `<Money>`

```tsx
// client/src/components/primitives/ltr.tsx
export const Ltr = ({children}:{children:React.ReactNode}) =>
  <span dir="ltr" style={{unicodeBidi:'isolate'}}>{children}</span>;

// <Num> — .num + tabular figures, nothing else
// <Money> — <Num>{ils.format(v)}</Money> with the ₪ wrapped in .shekel and an NBSP
```

`<Ltr>` is required for: price ranges, hour ranges, guest ranges, `+972…` numbers, parenthesised area codes, date ranges, version strings — anything where a literal range or a signed number is unavoidable (§4.9). `<Money>` is the only sanctioned way a ₪ figure reaches the DOM.

### 7.33 Icons

**Six lucide glyphs maximum, plus four hand-authored brand SVGs.** Delete the Font Awesome cdnjs `<link>` (`client/index.html:37-43`): 102,025 B of render-blocking CSS + 150,124 B `fa-solid-900.woff2` + 108,020 B `fa-brands-400.woff2` ≈ **280 KB from a third-party origin behind a 4-hop chain, for 41 distinct classes** — versus lucide at ~190 B gzip per icon. If cdnjs is blocked by a content blocker or a corporate proxy, the mobile hamburger renders as an empty ghost button and the WhatsApp and phone CTAs lose their glyphs.

Permitted: `phone`, `chevron-down`, `check`, `x`, `map-pin`, `arrow-left`/`arrow-right` (mirrored per §9.2). Brand marks (`whatsapp`, `instagram`, `facebook`, `google`) are hand-authored inline SVGs (~500 B each) in one `brand-icons.tsx` — lucide has no brand set, and **do not** add `react-icons` (already an unused dependency; delete it).

**Zero icons inside headings. Zero decorative icons at all.** On a type-led page an icon is almost always a symptom that a heading is not doing its job. Every icon gets `aria-hidden="true" focusable="false"`; every icon-only control gets an `aria-label`. Prefer inline SVG over an icon font: icon fonts break when a user forces their own font and announce as junk glyphs.

---

## 8. Motion

**One primitive, one duration set, zero loops.**

```
reveal        opacity 0→1, translateY(10px)→0, 550ms var(--ease),
              IntersectionObserver, fires ONCE, stagger 60–80ms, chain capped at 6 items
state change  150–220ms  (buttons 180ms, radio options 150ms, chevron 220ms, header border 220ms)
error         one 300ms shake, on validation failure only
```

Rules:

- **No animation with `iteration-count > 1`.** `animate-float` (6s infinite), `animate-bounce-gentle` (2s infinite) and `animate-pulse-slow` (3s infinite) are deleted. Infinite animations keep the compositor awake permanently — that is INP and battery, and it does not show up in a synthetic Lighthouse run.
- **Hover is a colour/border change plus at most `translateY(-1px)`.** Never `scale`.
- **No carousel, no auto-rotating headline, no count-up.** The hero's 5s image crossfade triples LCP byte cost and makes LCP non-deterministic (each opacity swap can register a new LCP candidate, so p75 becomes a function of how long the user stares). The 4s slogan rotation is four defects at once: it puts mutating text inside `<h1>` so the strongest SEO signal is non-deterministic per crawl; it re-announces to screen readers every 4s with no `aria-live` control and no pause affordance (**2.2.2 failure**); each slogan is a different length so the `h1` reflows and shifts every dish row below it; and it dilutes the one message that converts.
- **Stagger the dish rows, but cap the chain.** The `reveal` stagger is capped at 6 items precisely because a menu section can hold 40 rows; an uncapped stagger would take 3 seconds to finish revealing a menu and would read as the page loading slowly.
- **`framer-motion` is not needed and is deleted.** A ~20-line IntersectionObserver hook plus CSS transitions is smaller and cannot be abused into spring physics.

```ts
// client/src/hooks/use-reveal.ts — the entire motion system
export function useReveal() {
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.querySelectorAll('.reveal').forEach(el => el.classList.add('is-in'));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e, i) => {
        if (!e.isIntersecting) return;
        const el = e.target as HTMLElement;
        el.style.transitionDelay = `${Math.min(i, 5) * 70}ms`;
        el.classList.add('is-in');
        io.unobserve(el);
      });
    }, { rootMargin: '0px 0px -10% 0px' });
    document.querySelectorAll('.reveal:not(.is-in)').forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);
}
```

**`prefers-reduced-motion: reduce`** (currently **zero** occurrences in the repo) disables: `reveal`, the button's 1px lift, the error shake, `scroll-behavior:smooth`, and every remaining transition — via the blanket `@media` block in §5. The `reveal` fallback is `opacity:1; transform:none`, so content is never hidden from a reduced-motion user.

Also: gate any remaining timers on `document.visibilityState` so nothing animates in a hidden tab; and **never** set `overflow:hidden` on `body` without restoring the exact prior value (`accessibility-toolbar.tsx:42` sets it to `hidden` and its cleanup writes `unset`, so at 200% zoom the panel exceeds the viewport and its own controls become unreachable).

---

## 9. RTL rules

### 9.1 Logical properties only

Tailwind 3.4.19 supports `ms-*`/`me-*`, `ps-*`/`pe-*`, `start-*`/`end-*`, `text-start`/`text-end`, `border-s`/`border-e`, `rounded-s`/`rounded-e`, `float-start`/`float-end`. Use them. **152 physical-direction utilities** are currently live in `client/src`.

**`space-x-*` and `divide-x-*` are banned outright.** Verified in Tailwind's source: `space-x` emits `margin-right: calc(v * var(--tw-space-x-reverse))` and `margin-left: calc(v * (1 - var(--tw-space-x-reverse)))` with selector `> :not([hidden]) ~ :not([hidden])`. In an RTL row of A,B,C the margin lands on each element's *physical left*, so there is **no gap between the first two visual items** and a phantom gap of dead space at the trailing edge. There are ~24 occurrences (`header.tsx:26,33`, `footer.tsx:14`, `accessibility.tsx:46-66`, `blog-post.tsx:41`, …), all with `space-x-reverse` bolted on. Replace with `gap-*` on a flex/grid parent — `gap` is inline-direction aware and needs no variant. Adding `space-x-reverse` also "works" but leaves a physical-property landmine.

**Fix the hand-flipped shadcn primitives in the same commit as the `DirectionProvider`.** `ui/dialog.tsx:41` and `ui/alert-dialog.tsx:37` have `right-4` hand-flipped to a physical `left-4`. The codebase therefore mixes hand-flipped and un-flipped physical properties — the worst possible state. Convert both to `end-4` and revert the manual flip. Same treatment: `ui/toast.tsx:26,78` (`pr-*`, `right-0` → `pe-*`, `end-0`), `ui/sidebar.tsx:247,248,311,334`, `ui/navigation-menu.tsx:72`, `ui/tooltip.tsx:22`, `ui/resizable.tsx:32`.

### 9.2 Direction-sensitive icons — a policy, not a blanket flip

**Mirror:** `ArrowLeft`/`ArrowRight`, `ChevronLeft`/`ChevronRight`, `ChevronsLeft`/`ChevronsRight`, `Undo`/`Redo`, `Reply`, `Send` (paper plane), `Search` (magnifier), `PanelLeft`, list-indent, breadcrumb and pagination separators.

**Do not mirror:** `Play`/`Pause`/`FastForward` and all media transport (universally LTR), `Clock` and clock faces (clocks run clockwise in Israel), progress spinners, checkmarks, logos, and any glyph containing Latin letters or digits.

Mechanism: `.icon-flip` (§5) or Tailwind's `rtl:` variant (present in 3.4.19 as `addVariant('rtl','&:where([dir="rtl"], [dir="rtl"] *)')`). **Caveat:** `:where()` has zero specificity, so `rtl:me-2` beats `me-2` only on source order — safe within one plugin family, unreliable across families. Prefer logical utilities and reserve `rtl:` for properties with no logical form.

Repo targets: `ui/pagination.tsx:72,89`, `ui/breadcrumb.tsx:86`, `ui/carousel.tsx:88,91`, `ui/calendar.tsx:56,59`, `ui/sidebar.tsx:289`, `ui/dropdown-menu.tsx:35`, `ui/context-menu.tsx:35`, `ui/menubar.tsx:85` (the last three use `ChevronRight` for `SubTrigger`, but submenus open leftward in RTL).

### 9.3 Radix needs a `DirectionProvider`

`DirectionProvider` appears **nowhere** in `client/src`. Radix primitives read direction from their own `dir` prop or from `DirectionProvider` context — they do **not** read `document.dir` or `<html dir="rtl">`, and default to `ltr`. So arrow-key navigation and positioning logic in every retained primitive operate LTR while the page is RTL.

```tsx
// client/src/App.tsx
import { DirectionProvider } from '@radix-ui/react-direction';
<DirectionProvider dir="rtl">{/* app */}</DirectionProvider>
```

`@radix-ui/react-direction` is **not currently in `package.json`** and must be added (`00-prior-review.md` D5). Land this **in the same commit** as the §9.1 revert of the hand-flipped `left-*` close buttons, or they double-flip.

### 9.4 Physical-only CSS properties — the residual trap

`transform: translateX()`, `box-shadow` x-offset, `background-position: left/right`, `clip-path: polygon()` percentages, `text-shadow` x-offset, and `@keyframes` using `translateX` are all physical and ignore `dir`.

Use the direction sign token: `:root{--dir:1}` / `[dir="rtl"]{--dir:-1}` (§5), then `transform: translateX(calc(var(--dir) * -100px))`.

Live instances: `@keyframes slideRight{transform:translateX(-100px)}` animates in from the *end* side in RTL; `.organic-shape`, `.diagonal-section`, `.wave-shape` put the cut on the same physical side regardless of direction; `.text-shadow-warm{text-shadow:2px 2px 4px}` casts to the physical right. All four are deleted (§13). The two survivors that use `translateX` legitimately — the `shake` keyframe and the builder progress fill — are symmetric and direction-independent respectively (§7.24).

### 9.5 Mixed LTR content

- **Mark Latin runs:** `<span lang="en">WhatsApp</span>`, `<span lang="en">WCAG 2.1</span>`. 3.1.2 Language of Parts is AA and is the single most commonly missed criterion on Hebrew sites — an unmarked Latin run is mispronounced by a Hebrew screen-reader voice. On this site the recurring cases are the brand marks, an email address, and any Italian dish name written in Latin script.
- **Italian dish names** are a real case here and need a decision per dish: if the module supplies a Latin-script name it is wrapped `lang="it"`; the Hebrew transliteration is the default and needs no marking. Do not mix scripts inside one `.dish__name` — put the Latin form in `.dish__desc` if both are wanted.
- **Inputs:** `dir="ltr"` + `text-end` + the placeholder rule from §5 (§7.3).
- **Ranges and signed numbers:** `<Ltr>` (§7.32).
- **`scrollLeft` runs 0 → negative** in RTL as you scroll toward the end, in all current browsers. Any custom scroll-progress maths must use `Math.abs()`.
- **Embla carousel** is deleted with the gallery (§13). If any carousel is ever reintroduced it needs `direction:'rtl'` in its options and its key handler swapped (`ArrowRight → scrollPrev`, `ArrowLeft → scrollNext`) — `ui/carousel.tsx:59` passes no direction and hardcodes LTR semantics at `:86`.

---

## 10. Accessibility, baked into the system

Not a statement page. These are merge gates, and they land in shared code **before** the second landing page ships — otherwise page 6 reintroduces every defect fixed on page 1 and the audit surface multiplies by the route count.

The legal framing: תקנה 35 requires conformance to ת"י 5568 at level AA, in force since 26.10.2017 with no grace period. We build to **WCAG 2.1 AA**, which is safe under either edition of the standard. Enforcement is by private litigation with statutory damages requiring no proof of loss, and **the highest-value target on a lead-generation site is the form** — a keyboard user who cannot complete it has a clean, demonstrable claim. Prioritise the form and the CTAs above cosmetic issues.

### 10.1 Focus

```css
:focus-visible{outline:2px solid var(--focus);outline-offset:3px;border-radius:2px}
:focus:not(:focus-visible){outline:none}
```

One treatment, everywhere, on paper and on the ink band (where `--focus` becomes `#e0a79c` at 8.37:1 automatically). `--tomato` on `--paper` is **5.72:1**, far above the 3:1 required by 1.4.11.

**`outline:none` may never appear without a ≥3:1 replacement.** `focus:ring-golden` paired with `focus:outline-none` appears in 11 places; a 2.25:1 focus ring is a 1.4.11 failure, and the pairing is deleted with the palette.

### 10.2 Landmarks, bypass, and the shared layout

`pages/home-full.tsx` has **no `<main>` element at all** (the legal pages do), and there is **no skip link anywhere** in the codebase. Both go into **one shared layout component** so every new route inherits them:

```tsx
<a className="skip" href="#main">דלגו לתוכן הראשי</a>
<header>…</header>
<main id="main">{children}</main>
<footer>…</footer>
```

Plus `scroll-margin-top: 88px` on every element with an `id` (shipped as a base rule in §5) — the fixed header currently covers the heading a user just jumped to, which matters more here than usual because `<DecisionChecklist>` makes in-page jumping the primary mobile navigation.

### 10.3 Dialogs and drawers — the always-mounted-and-focusable bug

Two places ship the same defect. `ui/accessibility-toolbar.tsx:102-123` renders `role="dialog" aria-modal="true"` **unconditionally** and only moves the panel with an inline `transform: translateX(320px)` — so its ~8 buttons stay in the tab order permanently, and the permanent `aria-modal` can make assistive tech treat the rest of the page as inert. `layout/header.tsx:83-141` repeats it with `translate-x-full`.

Fix pattern for every drawer/dialog on every route: **conditionally render, or keep mounted with `inert` + `hidden` when closed**; set `aria-modal` only while open; move focus into the panel on open; trap Tab inside it; close on Escape; return focus to the trigger; put `aria-expanded` on the trigger. **Prefer the Radix `Dialog`/`Sheet` already in the repo.**

### 10.4 The accessibility toolbar is deleted, not repaired

Overlays do not produce conformance: they address only ~30–40% of WCAG criteria, the US FTC fined accessiBe $1M in April 2025 for misrepresenting that its widget makes sites WCAG-compliant, and 22.6% of H1-2025 US web-accessibility suits targeted sites that had an overlay installed. Nothing this widget does maps to a ת"י 5568 criterion — the standard requires the *delivered page* to meet contrast, focus, name/role/value and reflow.

It is also net-**negative**:

- `use-accessibility.tsx:67-82` injects `html{filter:invert(1) hue-rotate(180deg)}`, which makes `html` a containing block so `position:fixed` descendants reposition, kills `backdrop-filter`, and — once photographs exist — turns every food photo into a negative. The `!important` patch at `index.css:87-98` exists solely to paper over that; it is proof the approach is unsound.
- `.high-contrast{filter:contrast(150%) brightness(120%)}` mathematically *reduces* contrast for the dominant pairing (§2.4) and erases the dotted dish-row leader entirely, while `use-accessibility.tsx:46-49` simultaneously sets CSS variables — two conflicting mechanisms, and only components using the variables respond at all.
- `use-accessibility.tsx:36,149` writes `document.documentElement.style.fontSize` in percent and persists it, **overriding the browser's own font-size preference**: a low-vision user who set their browser default to 150% is forcibly reset to 100% on arrival. WCAG 1.4.4 is satisfied by the page surviving native zoom, not by a bespoke control. Never set an absolute root font-size; leave `html` at the UA default and size everything in `rem`.
- Its open button has both `onClick` and an `onMouseDown` calling `preventDefault()` then the same handler (`:56-61`), so a mouse click toggles twice and the `preventDefault` suppresses focus on the button; its toggles convey state only via a visual checkmark with no `aria-pressed`; there is no Escape handler; and five `console.log` calls ship to production.

Replacement: the base remediation in this document, plus a single `data-contrast="high"` token override (§2.4) exposed as one honest control if the owner wants it. **Frame the deletion as inseparable from the contrast/focus/form fixes and land them in the same change** — removing the widget alone reduces the *appearance* of compliance while leaving exposure unchanged, and the owner will read it as a regression.

### 10.5 Contrast, verified

Every pair in §2.1 is measured and labelled. The three structural fixes: `--ink-3` raised from 3.85:1 to 5.44:1; `--line-strong` introduced at 3.69:1 for control boundaries; `--wa` darkened to give 5.42:1 with white text. **Selection, state and meaning are never conveyed by colour alone** — the radio-card checked state is a full inversion, errors carry an icon + text + `aria-invalid`, the `add_to_brief` control changes its label as well as its fill, and the FAQ chevron rotates.

### 10.6 Target sizes

Minimum **44×44 CSS px** for every interactive control (WCAG 2.5.5 / iOS HIG). Delivered by: buttons `min-height:48px`; `.btn--sm` 44px; inputs 48px; radio-card spans 48px; chips 44px; accordion triggers 56px; sticky-bar links 48px; checklist links 44px; the checkbox input is 1.15rem but its label carries `padding-block` to reach 44px.

**The `הוסיפו לתפריט שלי` control is the one at risk** — it sits inside a dense dish row and will be drawn small. It gets its own `min-height:44px` and, on touch, its own row rather than sharing the price cell's line.

### 10.7 Zoom and reflow — a merge gate

**200% zoom and a 320px CSS viewport with no horizontal scrolling** are checked on every route before merge (1.4.4, 1.4.10). Wide content — tables, the production sheet — scrolls inside its own `overflow-x:auto` container, or stacks to a `<dl>` (§7.9); the page body never scrolls sideways.

Fixed dimensions that trap text when text scales are banned: `h-64` image tiles (`gallery.tsx:53`), `w-80` drawer (`header.tsx:86`), `max-height:500px` collapsibles (`index.css:225-228` — use grid rows or unmount), and decorative `clip-path` on any box containing text (`.organic-shape`, `.diagonal-section` cut 15% off section edges and are disabled only below 768px, which means **the mobile layout is the honest one and desktop is the costume**).

**The dish row needs an explicit reflow check** at 200%: `1fr auto` with a long Hebrew name and a price is the layout most likely to collide. The name cell wraps; the price cell is `white-space:nowrap` and must never be allowed to shrink below its content — verify at 320px with the longest dish name in the module.

### 10.8 Screen-reader hygiene

- `aria-hidden="true" focusable="false"` on every decorative glyph. 61 decorative Font Awesome `<i>` elements currently carry none.
- `aria-label` on every icon-only control. The hamburger (`header.tsx:77`) and close (`header.tsx:94`) have **no accessible name at all** — 4.1.2, and the most severe defect in the codebase because on mobile the hamburger is the only route to navigation.
- Anything revealed on hover must also reveal on `:focus-within` and satisfy 1.4.13. Gallery overlay titles are `opacity-0 group-hover:opacity-100` (`gallery.tsx:54-59`) — always announced, never reachable by keyboard. Same rule governs the `add_to_brief` control (§7.7).
- **The dotted leader announces as nothing** — that is why it is a border and not a run of periods. Verify with a Hebrew voice that a dish row reads as "name, description, price" and not as forty dots.
- The `.menu-leaf` is a `<ul>`/`<li>` structure, not a `<table>`: it is a list of dishes, not tabular data, and NVDA's table mode on a 40-row menu is a worse experience than list navigation.

### 10.9 Form error presentation, in Hebrew

Current state is half-right: the shadcn wrapper wires `aria-describedby` and `aria-invalid` (`ui/form.tsx:116,121`) and the messages are Hebrew. Missing: focus movement, an error summary, a live announcement, `aria-required`, `autocomplete`, and a durable server-failure path (a transient Radix toast is a poor sole carrier for "your lead was not submitted").

**The pattern, in full:**

1. Validate on submit (and on blur after first submit), never on every keystroke.
2. Render an **error summary** above the form, `role="alert"`, `tabIndex={-1}`, focused programmatically:

```tsx
<div role="alert" tabIndex={-1} ref={summaryRef}
     className="mb-6 border-s-2 border-danger ps-4 text-danger">
  <p className="font-semibold">יש {n} שדות שצריך להשלים:</p>
  <ul>{errors.map(e => <li key={e.id}><a href={`#${e.id}`}>{e.label}</a></li>)}</ul>
</div>
```

3. `form.setFocus()` on the first invalid field after the summary is announced.
4. Per-field: `aria-invalid="true"`, `aria-describedby="{id}-err"`, `aria-required="true"`, 2px `--danger` border (6.92:1), and the message at `--fs-xs` in `--danger` with a small inline `x` icon — **never colour alone**.
5. Required fields carry `required`/`aria-required`, not just a literal `*` inside the label text.
6. One 300ms `shake` on the form container, disabled under reduced motion.
7. `autocomplete` per §7.3.

**House error strings** (short, specific, second person, never blaming):

| Case | String |
|---|---|
| missing name | `צריך שם, כדי שנדע למי לחזור.` |
| bad phone | `המספר לא נראה תקין — בדקו שוב.` |
| missing event type | `בחרו סוג אירוע כדי להמשיך.` |
| missing guest band | `בחרו טווח סועדים — אפשר לשנות אחר כך.` |
| missing area | `בחרו אזור, כדי שנדע איזה מטבח מבשל.` |
| submit failed | `השליחה לא עברה. נסו שוב, או פשוט התקשרו — {{PHONE}}.` |

The submit-failure message renders as a **persistent inline `role="alert"` beside the submit button**, in addition to any toast, and **the user's entered values are preserved**. The success path is a confirmation **view**, not a toast + `form.reset()` — resetting returns the buyer to an empty form holding nothing they can show anyone (§7.25).

Phone normalisation is server-side (strip everything except digits and a leading `+`, then shape-check) — the current regex rejects real input including parenthesised forms and, critically in an RTL page, pasted numbers carrying directional marks (U+200E/U+200F) or non-breaking spaces.

### 10.10 The accessibility statement, and the alternative service channel

The statement's **content** is owned by `04-legal-and-content.md`. Three things bind this document:

1. The current statement claims 4.5:1 minimum contrast, full keyboard operability, and regular NVDA/JAWS/VoiceOver + axe/WAVE audits — all false today. A false statement is a formal declaration a plaintiff can use as an admission of the standard the business set for itself. Every factual line becomes a Slot; unaudited claims are not made.
2. The footer link to it is `href="#"`, so it is unreachable — a compliance failure on its own. Fixed in §10.11 (footer).
3. The regulation requires an **alternative human service channel** for anyone who cannot use the site — a staffed phone number with stated hours. That is a render target, and it lives in the footer colophon and on the statement page, both Slot-driven. It has no default.

Add **axe-core to CI now**, while the base is being fixed, so new landing pages cannot regress.

### 10.11 Footer / colophon

*(the component spec lives here rather than in §7 because the footer is primarily an accessibility, legitimacy and legal-disclosure surface)*

`background:var(--ink)`, body `#a89d90` (6.49:1), headings `--paper`, column labels Assistant 600 `--fs-2xs` with `.09em` tracking, `border-top:1px solid #332c26` on the legal strip. **The footer's ink does not count against L-9.**

Contents, all Slot-driven: the three branches (name, address, phone, hours), the registered legal entity and ח.פ. (`blocking`), the privacy contact channel, the accessibility coordinator and the alternative service channel, and three live `wouter <Link>`s to `/privacy`, `/terms`, `/accessibility`.

All 14 `href="#"` in `footer.tsx` are dead, including those three, whose routes already exist in `App.tsx:21-23`. The two social icons are **deleted until real URLs exist** rather than aimed at `#`. The six dead service links are a straight lead leak on a page whose only job is conversion.

Also in the colophon: a photo-takedown line (`צולמתם באירוע ולא רוצים שהתמונה תופיע? …`), which converts a latent claim into a support ticket and costs one sentence. Wording owned by `04`.

---

## 11. The print sheet — the menu is a document

L-16. This is not a courtesy stylesheet; it is the direction stated as a fact. The site's central artefact is a menu, and a menu that cannot be handed to a walk-in customer or forwarded as a PDF is a picture of a menu.

Two print targets, one stylesheet:

**A. The menu (home and `/menus`).** Sections 01 (`מהתפריט של המסעדה`) and 02 (the service menus) print as a single-colour A4 menu. Everything else is hidden.

**B. The summary/confirmation.** The brief card prints as a one-page order sheet with the reference code and the cooking kitchen's address in the top block.

```css
@media print{
  @page{ margin:14mm }

  /* the paper page becomes paper */
  body{ background:#fff; color:#000; padding-bottom:0; font-size:11pt }
  body::after{ display:none }                    /* grain off — it prints as a grey wash */

  /* chrome, conversion and navigation are not part of a menu */
  .head,.sticky,.skip,.checklist,.calc__nav,.cta-pair,.reveal-only,
  [data-print="hide"]{ display:none!important }
  .reveal{ opacity:1!important; transform:none!important }

  /* dark bands invert to paper — an A4 sheet of ink is unprintable */
  [data-band="ink"]{
    background:#fff!important; color:#000!important;
    --fg:#000; --fg-muted:#222; --fg-subtle:#444; --rule:#bbb; --accent:#000;
  }

  /* the menu keeps its structure */
  .menu-leaf{ break-inside:auto }
  .course{ break-inside:avoid-page }
  .dish{ break-inside:avoid; border-bottom:1px dotted #999 }
  .dish__mark{ display:none }        /* «מוגש היום ב…» is a web affordance, not menu copy */
  h1,h2,h3{ break-after:avoid }
  table,tr,td,th,.step,.qa,.brief dl{ break-inside:avoid }

  /* links: print the destination for anything that leaves the page */
  a[href^="http"]::after{ content:" (" attr(href) ")"; font-size:9pt; color:#555 }
  a[href^="#"]::after,a[href^="tel"]::after,a[href^="mailto"]::after{ content:"" }

  *{ print-color-adjust:exact; -webkit-print-color-adjust:exact }
}
```

`print-color-adjust:exact` is what keeps the hairlines and the dotted leaders — without it the browser drops light borders and the menu prints as an unstructured list of words.

**Photos print.** They are already ≤3 per route, and a captioned photograph on a printed sheet is the one place the Caption Law's `{שעה}` field earns its keep. If a route's photos are absent, the printed sheet is simply a menu — which is the whole argument.

**Print snapshot test** on the home route in CI: assert the rendered print stylesheet hides `.head`, `.sticky` and `.cta-pair`, and that `.menu-leaf` is present. A print sheet nobody tests regresses on the first layout change.

---

## 12. The zero-photograph contract

**The binding requirement of this revision** (§0.1). Every claim below is checkable by rendering each route with the image manifest empty.

### 12.1 What carries each section when no photograph exists

| Section | What carries it | Why it is sufficient |
|---|---|---|
| Hero | `h1` (FRL 500, `--fs-4xl`) + four real dish rows | The strongest asset in the project is a list of dishes the client already owns. Reading a dish name is a lower-friction micro-commitment than looking at a plate, and it qualifies as well as it seduces. |
| 01 · the menu | `.menu-leaf` — course headings, dotted leaders, price column | A menu with no photographs is the normal state of every printed restaurant menu on earth. Nothing is missing. |
| 02 · service menus | Three `.menu` cards, one flagged with `--rule-double` | Three chef's menus with inclusions columns. A photo would add nothing a dish list does not. |
| 03 · inclusions/exclusions/limits | Two-column hairline grid + `<LimitsBlock>` masthead rules | This section has never wanted a photograph. |
| 04 · kitchens (ink band) | Three `<HairlineTable>` columns of real addresses, hours, names + `<BranchMap>` | Photos improve it; addresses and named chefs are what make it *evidence*, and both are text. |
| 05 · builder | `.calc` chrome + the growing brief card | Forms do not want photographs. |
| 06 · FAQ | Radix accordion, FRL 500 triggers | — |
| 07 · contact/colophon | Ink footer, `.num` phone rows | — |

**The one section that genuinely loses without images is 04.** The mitigation is that its content — street addresses, opening hours, a named chef per kitchen, live Google review links — is *stronger* evidence than a photograph and is entirely text. The photo ration (up to three) is spent here first when photos arrive.

### 12.2 What must never be used to fill the gap

- No stock photography, ever. Not "temporarily", not "just for the pitch deck".
- No SVG or vector illustration standing in for a photograph (the 12 files in `client/src/assets/images/` are deleted, §13).
- No decorative pattern, no hero gradient, no clip-path band edge, no icon medallion. These are the moves a template makes when it has nothing to say, and they are exactly what the client rejected.
- No empty `<Photo>` frame **used as decoration**. The labelled frame is legitimate only where a specific photograph is briefed and expected; a page sprinkled with grey rectangles reads as unfinished, which is the failure mode of the losing direction.
- No filler section. A shorter page is the correct output of an empty content module.

### 12.3 The upgrade path when photos arrive

The system improves monotonically and requires no redesign:

1. First photo → the kitchens band gains one captioned image; nothing else changes.
2. Second and third → one per additional branch column.
3. A hero photo, if it is good, occupies the hero's second grid column on desktop and renders **after** the CTA pair on mobile (L-2 still holds).
4. `og:image` per route replaces the generated default (§15, O-6).

At no point does a section's layout change shape, because every photo slot is a `<Photo>` with a fixed ratio inside an existing grid cell.

### 12.4 The honest cost, stated

A page with no photographs of food, on a food site, converts worse than the same page with three good ones. This system does not pretend otherwise. What it claims is narrower and defensible: **its floor is a finished artefact rather than an unfinished one**, and its ceiling rises with every photo the owner sends. The photography asks in §15 are real launch dependencies with dates — they are just not *blocking* ones, which is the entire reason this direction won the buildability lens.

---

## 13. DELETE list — file by file

Nothing in §5–§12 may be built until this list is empty. Land it as two commits: **honesty deletions first, then tokens.**

### 13.1 `client/src/index.css` — delete by line

| Lines | What | Why |
|---|---|---|
| 28–35 | `--golden`, `--dark-golden`, `--saddle-brown`, `--wine-red`, `--cream`, `--warm-white`, `--dark-brown`, `--cornsilk` | 2.25:1; the glitzy direction the client rejected |
| 38–59 | the entire `.dark` block | no theme provider exists; 2 `dark:` usages site-wide; its `--primary` is still the failing gold |
| 66–68 | unconditional `scroll-behavior:smooth` | must be paired with a `prefers-reduced-motion` reset |
| 72 | `'Rubik'` in the body font stack | never loaded |
| 76–109 | the `!important` accessibility-exemption and fixed-position patches | exist only to paper over the `filter`-based toolbar (§10.4) |
| 113–128 | the 8 gold/brown/wine/cornsilk colour utilities | 149 call sites, all replaced |
| 130–140 | `.organic-shape`, `.diagonal-section`, `.wave-shape` | loudest "template" signal; physical `clip-path`; already self-disabled below 768px |
| 142–144 | `.hero-gradient` | three-stop brown/gold/wine diagonal |
| 146–150 | `.glass-effect` | 14 files; expensive `backdrop-filter` on large panels on mid-tier GPUs |
| 152–154 | `.text-shadow-warm` | text shadow banned; casts to the physical right |
| 156–163 | `.hover-lift` | `translateY(-10px)` + 40px shadow |
| 165–187 | `.animate-float`, `.animate-bounce-gentle`, `.animate-pulse-slow`, `.animate-slide-up`, `.animate-slide-right`, `.animate-fade-in` | infinite animations; physical `translateX` |
| 196–219 | `@keyframes float`, `slideUp`, `slideRight`, `fadeIn`, `bounceGentle` | orphaned by the above |
| 221–223 | `.high-contrast{filter:…}` | reduces contrast; erases hairlines and the dish-row leader; breaks `backdrop-filter` and `position:fixed` (§2.4) |
| 225–234 | `.menu-item-expanded{max-height:500px}` / `.menu-item-collapsed` | silently truncates the 12-item main-dishes category on mobile |
| 236–243 | `.accessibility-toolbar` transform rules | overridden by the inline transform at `accessibility-toolbar.tsx:110`; `.open` is never applied by any code |

Replace the whole file with §5 (plus the §11 print block).

### 13.2 `tailwind.config.ts`

Delete `darkMode:["class"]`; the `chart-*` and `sidebar-*` colour groups (tokens never defined anywhere); `require("@tailwindcss/typography")`; `require("tailwindcss-animate")` (same commit as §13.3). Replace with §6.

### 13.3 Components and pages

**Delete entirely (11 files + 35 dead `ui/*`):**

`pages/home-simple.tsx` (unrouted, second `Home` export, asserts kosher) · `pages/blog-post.tsx` (per-id hardcoded JSX + fabricated customer story + `italic` + `prose max-w-none`) · `sections/testimonials.tsx` (3 fabricated named people, `Google 4.9/5 · 247 ביקורות`, `Facebook 4.8/5 · 189`, `אלפי לקוחות מרוצים`, decorative 5-star rows for quotes that carried no rating) · `sections/blog.tsx` (also contains ARABIC LETTER AIN U+0639 at `:13`) · `sections/price-calculator.tsx` (entirely invented ₪ table; also the single heaviest section — its Radix Select + Checkbox are ~32.5 KB gzip) · `sections/gallery.tsx` (a CTA that lies: "more images in the full gallery" scrolls to the top) · `data/blog-data.ts` · `data/gallery-data.ts` · `lib/queryClient.ts` · `hooks/use-mobile.tsx` · `client/src/assets/images/**/*.svg` (12 files) · the 35 unreferenced `ui/*.tsx` (4,022 LOC; CSS −7,344 B gzip, JS 0 B).

**Retain in `ui/`:** `button`, `input`, `label`, `textarea`, `card`, `accordion`, `form` (rewire per §10.9), plus `dialog` and `sheet` for the mobile drawer (§7.28, §10.3). Everything else goes. The `animate-in`/`animate-out` classes in `dialog` and `sheet` are rewritten to this config's own keyframes when `tailwindcss-animate` is removed. **`lib/utils.ts` is a rewrite, not a keep** — see the `cn()` note at the end of §6. (This reconciles the two conflicting retention lists; `00-prior-review.md` B8.)

**`sections/hero.tsx` — a rewrite, not an edit. Delete:**

| Lines | What |
|---|---|
| 5–18, 32–36, 50–61 | the 3-image crossfade carousel on a 5000ms interval (and its runtime `/src/assets/...` URLs, which 404 in production) |
| 20–25, 37–40, 78–80 | the 4-slogan rotation on a 4000ms interval — including the kosher slogan at `:24` |
| 63 | `.hero-gradient` overlay |
| 66–73 | the `כשר בד"ץ` badge (glass-effect pill wrapped in `animate-bounce-gentle`) |
| 76 | `text-shadow-warm` on the `h1` |
| 84 | the kosher + `ניחוחות משכרים` lede |
| 89–114 | three equal-weight `rounded-full hover-lift` CTAs (order / call / WhatsApp) |
| 101, 110 | the placeholder `tel:` and `wa.me` numbers |
| 118–124 | floating `fa-heart` and `fa-star` at `opacity-20` with `animate-float` |
| 126–134 | the `animate-bounce-gentle` scroll chevron |

Replacement: §7.8 — eyebrow, fixed three-line `h1`, static lede, **four real dish rows**, `<CtaPair>`, the self-pruning note line, and an optional `<Photo>` in the second column that never precedes the CTA pair.

**Per-file deletions elsewhere:**

- `layout/footer.tsx` — `:12` `25 שנות ניסיון ואלפי לקוחות מרוצים`; `:68` the kosher line; `:15,18` social `href="#"`; `:30-35` six dead service links; `:46` dead testimonials link; `:77` hardcoded year; wire `:80-82` to the real routes (§10.11).
- `sections/story.tsx` — `:24` the kosher line; `:34-53` the fabricated 1995/2005/2020 timeline + "leading caterer in the region"; `:67-74` `25+ שנות ניסיון` and `10,000+ לקוחות מרוצים`; `:61` the runtime SVG path.
- `sections/events.tsx` — `:9,16,23,30` the invented per-portion prices (also ASCII hyphen where a maqaf belongs); `:22,47` kosher + `הקסם והאווירה`; `:55` the `w-20 h-20 rounded-full` icon medallion. Rebuild as `<EventRows>` (§7.15).
- `sections/menu.tsx` — `:15` gradient-dark band; `:42-44` the `max-height:0` collapse that keeps all 27 items in the tab order; `:55` `₪{price}` symbol-first. Rebuild as `.menu-leaf` (§7.7) — this file becomes the spine of the site rather than a section of it.
- `sections/contact.tsx` — `:14` the `@shared/schema` import (drizzle in the browser: **−45,481 B raw / −13,234 B gzip**, and it publishes your Postgres table and column names in a public JS file); `:230-233` the four invented budget brackets with bidi-reversed ranges; `:252` the `אלרגיות` placeholder (solicits medical data and reclassifies the lead table as a health database); `:283` the 24-hour response promise; `:302` `זמינים 24/7`; `:324` the shopping-mall address line; `:377` the unsubstantiated `נגיש לנכים`.
- `sections/faq.tsx` — keep the shell, rewrite as Radix Accordion (§7.16); `data/faq-data.ts:21-29` (invented kashrut certification naming a specific authority), `:12` (`24/7` + ARABIC YEH U+064A / NOON U+0646 inside the word for catering), `:34-49` (~14 invented service cities + free delivery), `:54-61` (invented allergen protocol), `:66-72` (invented cancellation ladder that contradicts `terms.tsx:77-79`).
- `ui/accessibility-toolbar.tsx` + `hooks/use-accessibility.tsx` — delete both (§10.4).
- `ui/back-to-top.tsx` — delete `bg-golden` and `rounded-full`; keep the control.
- `hooks/use-scroll.tsx` — split into a stateless `scrollToSection` helper and a separate `useScrolledPast(threshold)`. Seven components subscribe and five never read `scrollY`, so the hero re-renders on every scroll pixel (~14 setState + 7 root re-renders per frame).
- `hooks/use-toast.ts:8-9` — `TOAST_REMOVE_DELAY: 1000000` (16.7 minutes) → `5000`.
- `client/index.html:37-43` — the Font Awesome cdnjs `<link>`; `:28-31` the Google Fonts `<link>` and both `preconnect`s (self-host per §4.2).
- `vite.config.ts` — add `esbuild:{ drop:['console','debugger'] }` so the seven production `console.log`s cannot recur.

**Dependency changes** (the additive half is usually forgotten — `00-prior-review.md` D5):

*Remove:* `@tailwindcss/typography`, `tailwindcss-animate`, `framer-motion`, `react-icons`, `next-themes`, `date-fns`, `@tanstack/react-query` (~18.4 KB gzip for one POST), `tailwind-merge`, `recharts`, `embla-carousel-react`, `cmdk`, `vaul`, `react-day-picker`, `input-otp`, `react-resizable-panels`, `tw-animate-css`, `@tailwindcss/vite` (v4, conflicting with the v3 config), the five auth/session packages no code imports (`passport`, `passport-local`, `express-session`, `connect-pg-simple`, `memorystore`), and ~22 unused `@radix-ui/*`.

*Add, required by this document:* `@radix-ui/react-direction` (§9.3), `sharp` (the image manifest, §7.26), and `nanoid` — `server/vite.ts:7` imports it and it currently resolves only as a transitive dependency, so any `npm prune` or lockfile regeneration breaks the dev server. *(Also required by `01`/`02` and listed there: a brotli precompressor, `size-limit`, an axe CI runner, `cookie-parser`.)*

**Also delete the runtime string image paths.** 20 references use literal `/src/assets/images/...` as runtime URLs (`hero.tsx:7,11,15`; `story.tsx:61`; `gallery-data.ts:13-53`; `blog-data.ts:20-40`) and `dist/public/` contains **zero image files** — every image on the site 404s in production today, so no LCP or CLS measurement against the current build is meaningful. Import assets through Vite (content-hashed, so the 1-year immutable cache header is safe) or serve owner photos from `client/public/img/` with a version query.

---

## 14. CI gates — the system will not survive three months without them

Restraint degrades faster than decoration under later edits: one added drop shadow, pill button or gold highlight reads as a mistake precisely because everything else is disciplined. Ship the bans as machine-checkable gates in the same commit as the tokens.

```bash
#!/usr/bin/env bash
# scripts/check-design-system.sh — exits non-zero on any hit.
# Writes to stdout (CI runners have no controlling terminal — never /dev/tty).
set -uo pipefail
fail=0

# g <label> <pattern> [rg args…]
g(){
  local label="$1" pat="$2"; shift 2
  if rg -n --pcre2 --glob '!**/node_modules/**' -- "$pat" "$@"; then
    printf '✗ %s\n' "$label"; fail=1
  fi
}

SRC=(client/src)
CLIENT=(client)
SRC_NO_CONFIG=(client/src --glob '!client/src/config/**' --glob '!client/src/content/**')

# ── palette ────────────────────────────────────────────────────────────
g "gold palette resurrected"        'golden|hsl\(43,\s*7[45]%|#d9a520|saddle-brown|wine-red|cornsilk|dark-brown' "${SRC[@]}"
g "--ink-4 used as a text colour"   'text-ink-4|color:\s*var\(--ink-4\)'                                          "${SRC[@]}"
g "--line on an interactive border" 'border-line(?!-strong)[^;]*(input|textarea|select|opts|sticky)'               "${SRC[@]}"

# ── elevation, radius, motion ──────────────────────────────────────────
g "box-shadow outside the allowlist" 'shadow-(sm|md|lg|xl|2xl)|box-shadow:\s*(?!none|var\(--shadow-sticky\)|var\(--ring-inset\)|var\(--rule-double\)|inset)' "${SRC[@]}"
g "pill radius outside .tag"         'rounded-full|rounded-2xl|rounded-3xl'                                        "${SRC[@]}"
g "infinite animation"               'iteration-count:\s*infinite|animation:[^;]*\binfinite\b'                     "${SRC[@]}"
g "framer-motion"                    "from ['\"]framer-motion"                                                     "${SRC[@]}"

# ── RTL ────────────────────────────────────────────────────────────────
g "physical direction utility"       '\b(ml|mr|pl|pr)-|\b(left|right)-[0-9]|text-left|text-right|space-x-|divide-x-|border-l\b|border-r\b|rounded-l|rounded-r|float-(left|right)' "${SRC[@]}"
g "bidi-reversing numeric range"     '\d\s*[–—]\s*\d'                                                              "${SRC[@]}"
g "Arabic-script char in Hebrew"     '[\x{0600}-\x{06FF}]'                                                         "${SRC[@]}"
g "synthesised Hebrew oblique"       '\bitalic\b'                                                                  "${SRC[@]}"
g "uppercase on Hebrew"              'text-transform:\s*uppercase|\buppercase\b'                                   "${SRC[@]}"

# ── icons, fonts, third parties ────────────────────────────────────────
g "Font Awesome"                     'fa[sbr]?\s+fa-|font-awesome|cdnjs\.cloudflare'                               "${CLIENT[@]}"
g "third-party font host"            'fonts\.(googleapis|gstatic)\.com'                                            "${CLIENT[@]}"
g "third-party map/script embed"     'maps\.google|google\.com/maps/embed|<iframe'                                 "${SRC[@]}"

# ── honesty (mirrors 01 §0.1 / 02 §0) ──────────────────────────────────
# Hebrew word boundaries: \b works because Hebrew letters are word chars in
# Unicode mode, so \bכשר\b does NOT match הכשרה / מכשיר / הכשרת.
g "kashrut claim"                    '\bבד״ץ\b|\bבד"ץ\b|\bמהדרין\b|\bכשר\b|\bכשרות\b|\bגלאט\b'                     "${SRC_NO_CONFIG[@]}"
g "invented statistic"               '25 שנות|אלפי לקוחות|10,?000\+|\b4\.9\b|\b4\.8\b|247 ביקורות|189 ביקורות'      "${SRC[@]}"
# both currency orders — house style is number-first, so a ₪-first-only gate
# would miss every correctly formatted hardcoded price (prior review D9)
g "hardcoded shekel figure"          '[0-9][\s\x{00A0}]*₪|₪[\s\x{00A0}]*[0-9]'                                     "${SRC_NO_CONFIG[@]}"
# the competitor-derived minimum the first pass shipped as literal copy (prior review A1)
g "hardcoded guest minimum"          'מ־?\s*25\b|\b25 סועדים|עד 25\b|מינימום\s*\d'                                  "${SRC_NO_CONFIG[@]}"
g "unsourced response-time promise"  'תוך 24 שעות|24/7|זמינים 24'                                                   "${SRC_NO_CONFIG[@]}"
g "banned emotional adjective"       'בלתי נשכח|חוויה קולינרית|קסום|מרגש|ניחוחות|מהלב|באהבה|עם חיוך|יוקרה'         "${SRC[@]}"
g "banned CTA verb"                  'הזמינו עכשיו|הזמינו אירוע עכשיו'                                              "${SRC[@]}"

# ── placeholders ───────────────────────────────────────────────────────
g "placeholder phone"                '052-?123-?4567|972521234567'                                                 "${CLIENT[@]}"
g "unresolved template token"        '\{\{[A-Z_]+\}\}'                                                              "${SRC_NO_CONFIG[@]}"

exit $fail
```

Notes on the gate itself, because a blocking gate that misfires gets disabled:

- **`--pcre2`** is required for the lookahead in the `box-shadow` and `border-line` patterns and for `\x{…}` escapes.
- **`client/src/config/**` and `client/src/content/**` are excluded** from the honesty greps. That is where owner-supplied facts legitimately live — a real price, a real kashrut sentence, a real minimum. The exclusion is the whole design: facts live in one auditable place, components never hold literals.
- **The Hebrew patterns are anchored with `\b`.** Unanchored `כשר` false-positives on `הכשרה`, `מכשיר` and `הכשרת` — and a gate that cries wolf on a legitimate word is a gate someone deletes.

Plus, as separate jobs:

- **`axe-core`** on every route in the sitemap, failing on any serious/critical violation.
- **`<Photo>` caption check** — a typed required `caption` prop plus `tsc --noEmit` in CI is sufficient; add an AST rule only if someone starts spreading props.
- **Photo ration** (L-2, L-3): per rendered route, assert `count(<img>) ≤ 3`, `count(fetchpriority="high") ≤ 1`, and that the first `<img>` in document order appears **after** the element carrying `data-cta-pair`.
- **Ink band** (L-9): `count([data-band="ink"]) ≤ 1` per rendered route, and where it is 1, `data-band-id === "kitchens"`. **`≤`, not `===`** — at least eight routes legitimately have none, and an `=== 1` gate fails every one of them on day one (`00-prior-review.md` D2).
- **Zero-photo render** (§12): render every route with an empty image manifest and assert no route produces an empty `<figure>` without a `spec`, and that no section renders a heading with no body.
- **Per-route byte budget**, failing the build (a budget that only warns is gone in two weeks): shell JS ≤45 KB gzip (≤16 KB if the preact path is taken), CSS ≤8 KB site-wide, fonts ≤14 KB, landing-route JS ≤14 KB, legal routes ≤4 KB.
- **200% zoom / 320px reflow** screenshot check on the home route and one inner route, including the longest dish row in the module.
- **Bidi screenshot test** on any guest-band or hour range — the reversal is invisible in code review because the string looks correct in the editor and only mirrors at render time.
- **Print snapshot** on the home route (§11).

---

## 15. Owner dependencies that block this system specifically

Everything in the aggregated owner list matters; these are the ones that block **the design system** rather than the copy, the legal pages or the lead machine.

**The direction correction changes the priority of this table.** Under a photography-led system O-1…O-8 were launch blockers. Under TAFRIT the single blocking item is **O-0** — the dish list — and the photography asks are upgrades with dates.

| # | Ask | Blocks | Severity |
|---|---|---|---|
| **O-0** | **The list of restaurant dishes actually available for catering** — name, one-line description (≤12 words), course, and per branch whether it is available. A photograph of the printed menu is an acceptable starting form. | The hero, section 01, the service menus, the brief card, the print sheet. **This is the spine of the direction and the only true launch blocker in this document.** | **Blocking** |
| **O-0b** | Per dish, the URL of its counterpart on each branch's live restaurant menu (if such pages exist) | The `מוגש היום ב…` provenance mark, which is gated on it and is omitted rather than softened without it | High |
| **O-11** | **Written approval of the paper-and-ink palette over the current gold, before the restyle lands** | The one decision that cannot be reversed cheaply later | **Blocking** |
| **O-13** | A named chef or kitchen manager per branch, with consent to be named | The `מי מנהל את המטבח` row — the cheapest E-E-A-T lever available and the thing that breaks the category's anonymity | High |
| **O-1** | `hero.jpg` — 1400×1750 (4:5) vertical, one plated dish or the kitchen mid-service, window light, no flash, no filter | The hero's optional second column. Not the LCP element (§4.2) and not blocking | Medium |
| **O-2** | `kitchen.jpg` — 900×1200 (3:4), a real kitchen in the morning, **with the branch named** | The kitchens band's first photo | Medium |
| **O-3** | `hands.jpg` — 900×700 (9:7), hands mid-prep. Mess and flour are wanted, not faults | The provenance block | Medium |
| **O-4** | Branch spread — one `3:2` per kitchen | The kitchens band's remaining two photos | Medium |
| **O-5** | A photo of the owner and/or head chef, **face visible** | Faces outrank food photos for trust; there is currently no image of any person in the repo | Medium |
| **O-6** | `og.jpg` — 1200×630 per route, business name legible | These links are forwarded on WhatsApp. **Until they exist, ship a build-time generated default** (route title typeset on `--paper` with the wordmark) — a 404 og:image renders a blank card on the exact forwarding mechanic the thesis depends on | High |
| **O-7** | **Caption metadata captured at shoot time:** branch + street + what is happening + the hour | Hour and action are unreconstructable afterwards and cost nothing to ask for in advance. Without them the Caption Law cannot be satisfied by any photo, however good | High (paired with O-1…O-5) |
| **O-8** | Photos at **original camera resolution** (≥2400px long edge), unedited and uncropped | The sharp pipeline, the srcset widths, the manifest dimensions | Medium |
| **O-9** | Existing brand assets: logotype/wordmark file, **the real menu PDF or printed menu**, signage photos | Decides whether the wordmark is typeset in FRL 700 or an existing mark is reproduced — and the printed menu is the fastest possible route to O-0 | High |
| **O-10** | Is the brand ever set in Latin letters, and do any dish names appear in Latin script? | Whether the Latin subset ships at all (FRL's Latin subset alone is 44 KB), and the `lang="it"` handling in §9.5 | Medium |
| **O-12** | Which branch is the flagship for photography, and whether all three kitchens may be photographed | Shoot planning; whether the ink band carries three captions or one | Medium |
| **O-14** | Whether prices will ever be displayed at all, and if so the figures, units and their conditions | If no: the menu ships as a chef's menu (§7.7), `.est` never renders, and the tabular-figure work scopes down to phone numbers and counts | High |
| **O-15** | Per-branch physical accessibility (parking, accessible entrance, accessible WC, seating, lift/ramp) and the **staffed alternative service channel** with its hours | The `נגישות פיזית` row (§7.17) and the statutory alternative channel (§10.10). Currently asserted with no basis at `contact.tsx:377` | High |
| **O-16** | Whether any vocalised Hebrew (niqqud) will appear | Niqqud needs a larger subset, ~0.2 more line-height, and a font whose mark positioning is tested | Low |
| **O-17** | Whether a second language version is planned (English / Russian / Arabic) | Arabic changes the bidi and font work substantially; English promotes logical-property discipline from good practice to load-bearing | Low |

---

## 16. Known weaknesses of this system, stated plainly

1. **The menu answers the buyer's fourth question, not the first three.** A visitor arriving on `קייטרינג להיום` or `מגשי אירוח <עיר>` wants a cutoff time, a minimum and a phone number in thirty seconds, and a wall of Hebrew dish rows on a 390px screen is exactly where their scroll depth dies. The mitigations are real but they are hedges, and they should be understood as such: `<DecisionChecklist>` (§7.13) gives an immediate jump to the operational facts, `<OpsFacts>` (§7.12) moves above the fold on those routes, and `stickyBar:'phone'` (§7.29) puts a call one tap away. On `/urgent` and `/catering/business` the menu is **not** the hero, and the direction concedes that.

2. **The whole system rests on one owner asset nobody has yet confirmed exists.** If the catering-available dish list (O-0) comes back at eight items, the hero of the site is a short list and menu-as-hero collapses into menu-as-widget — at which point the page has spent its restraint budget on browsing with no compensating urgency mechanic. The fallback is not another design; it is to promote `<OpsFacts>`, `<InclusionsExclusions>` and `<LimitsBlock>` to the top of every route and let the menu sit below them. That is a section-order change, which is the cheapest thing in this architecture — but it is a genuinely weaker page.

3. **A menu is a list of dishes and contains no people.** The differentiator is "three real kitchens with *standing teams* and suppliers", and half of that is invisible in a menu. It lives entirely in the kitchens band (§7.17) — the named chef row, the addresses, the review links — which is therefore carrying more weight than any single section should. If O-13 comes back empty, the band degrades to three addresses, and the "standing team" half of the differentiator does not ship at all.

4. **The client may read paper-and-ink as "unfinished" or "not festive enough"** on first look, next to the gold-heavy competitor sites they will compare it against — and with no photographs the risk is higher, not lower. Present it on a phone, scrolled, with the menu section on screen. **Never present it as a swatch sheet.** Settle the section-padding scale in the same conversation: fluid `--pad-sec` and `em`-capped measures make the page noticeably longer on desktop, and if the client equates "shorter" with "better converting" that argument is cheaper to have once, before build.

5. **Restraint degrades faster than decoration under later edits.** One added shadow, pill or gold highlight reads as a mistake precisely because everything else is disciplined. §14 is not optional hygiene; it is the only thing that makes the system survive three months of other people's commits — and its honesty greps are the only thing standing between this project and a second round of invented facts.

6. **Grain + `backdrop-filter` + a fixed sticky bar is three compositing layers on low-end Android.** Verify on a real mid-range device, not a throttled desktop. If paint cost shows up, drop `backdrop-filter` — not the grain, which is doing more work on a photograph-free page than anywhere else in the system.

7. **Removing `darkMode` and the `.dark` block, and deleting the toolbar, must be one coordinated change.** Any retained shadcn component assuming both themes exist will break, and the toolbar ties its invert feature to the same body-filter mechanism. Two independent commits produce a broken intermediate state.

8. **The `size-adjust` fallback value is deliberately unset** (§4.2). Until it is measured on real iOS/Android/Windows devices a small residual font-swap shift remains — and on this direction the swapping element is the `<h1>`, the LCP candidate, with the menu directly beneath it. The `ascent`/`descent` overrides remove the line-box component, which is the larger one, but this is an open item rather than a solved one.

9. **A 26em measure (~442px at 17px) and a 17em dish description will read as unexpectedly narrow** to a client used to full-width Hebrew text. Present them with pixel numbers and a side-by-side, or they get overridden back to 900px lines and the menu stops scanning.

10. **Removing `italic` costs blockquotes their conventional differentiator.** The replacement (FRL 500 at `--fs-lg` over a 2px ink rule) has to be designed deliberately, or the `<PastEvents>` quotes — if any real ones ever arrive — read as ordinary body text.
