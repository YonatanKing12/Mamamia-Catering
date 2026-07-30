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
