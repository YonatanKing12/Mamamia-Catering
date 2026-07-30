# 03 · Design System Spec — מאמא מיה קייטרינג

**Status:** normative. Where this document conflicts with `client/src/index.css`, `tailwind.config.ts`, or any component in `client/src`, this document wins and the code changes.
**Branch:** `claude/catering-landing-page-dbvbbx`
**Direction:** `המטבח כמסמך` (Kitchen as Document) as the base system, with the TAFRIT and Decision-Sheet grafts adopted per `01-site-architecture.md` §0.2.
**Substrate:** `docs/design-reference/` is the canonical visual source. This document ports it, corrects its measured defects (contrast of `--ink-3`, bidi-reversing ranges, `font-style:italic` on Hebrew, `text-transform:uppercase` on Hebrew, unqualified `--line` on form borders), and adds the parts it lacks (numeral handling, logical properties, focus system, error presentation, component contracts).

**Companion specs.** `01-site-architecture.md` owns routes, page contracts and build order. `02-lead-machine.md` owns the quote builder logic, schema, WhatsApp handoff and analytics. This document owns **tokens, typography, components, motion, RTL and accessibility primitives** — nothing else.

> **Cross-reference note.** `02-lead-machine.md` refers to the design system as `01-design-system.md` and to architecture as `03-architecture.md`. Those names are stale. The authoritative filenames are `01-site-architecture.md`, `02-lead-machine.md`, `03-design-system.md`. Fix the references in `02` when it is next touched; do not create files under the old names.

---

## 0. Preconditions

### 0.1 The token replacement is Wave 0, before any component work

`--golden: hsl(43,74%,49%)` = `#d9a520`. Measured: **2.25:1 on white, 2.12:1 on `--warm-white`, 2.25:1 for white text on gold.** It fails WCAG 1.4.3 (4.5:1 normal text), 1.4.3 large-text (3:1) and 1.4.11 non-text (3:1). It is applied to **every** primary CTA on the site (149 `bg-golden` / `text-golden` / `border-golden` / `hover:bg-dark-golden` occurrences across 23 files) and to every `focus:ring-golden`.

**Therefore the palette is replaced at token level in one commit, before any section is restyled.** Restyling a section against the old tokens reproduces the failure in new code. Sequence: §5 (`index.css`) + §6 (`tailwind.config.ts`) + §11 (delete list) land together; component rewrites follow.

Gold cannot be rescued by darkening. The accessible variant `--dark-golden` reaches 5.41:1 but reads as mustard-brown, not gold — it stops being the brand colour it was chosen for. The replacement is not "a darker gold"; it is a different system (paper-and-ink with a rationed tomato accent), and it requires **written owner approval before the restyle lands** (§13, item O-11).

### 0.2 This document assumes the honesty deletions have shipped

`01-site-architecture.md` §0.1 and `02-lead-machine.md` §0 both list them. They are still in the working tree at HEAD. Nothing in this document may be built on top of `hero.tsx:70` (`כשר בד"ץ` badge), `testimonials.tsx` (fabricated names + hardcoded `Google 4.9/5 · 247 ביקורות`), `price-calculator.tsx` (invented ₪ table) or `footer.tsx:12` (`25 שנות ניסיון`). Restyling them re-endorses them with better typography.

---

## 1. Design law — the invariants the token system exists to enforce

These are not aesthetics. Each one is checkable in CI (§12).

| # | Law | Mechanism |
|---|---|---|
| **L-1** | **Caption Law.** Every photograph ships a visible caption in the fixed format `{n} · {סניף} · {רחוב} · {מה קורה} · {שעה}`. | `<Photo>` has a **required** `caption` prop (§7.11). Build fails on an uncaptioned image. |
| **L-2** | **No claim without adjacent evidence.** A factual claim renders only beside a captioned photograph or a typeset fact row. | `<Fact>` (§7.16) requires a `source` label. `<Slot>` (§7.15) prunes unfilled facts. |
| **L-3** | **Slot-or-nothing.** Unfilled facts prune the **smallest containing unit**: clause → row → cell → section. Never a plausible default; never an empty highlighted box in production. | `<Slot>` + `<SlotGroup>`; dev highlight, prod null-render. |
| **L-4** | **Tomato ration.** The accent occupies ≤ ~2% of any viewport's pixels and never a fill larger than 200×200px. Buttons default to `--ink`. | Review gate; no `bg-tomato` on any element with `min-height > 200px`. |
| **L-5** | **No shadows.** Separation comes from 1px hairlines and `gap:1px` grids whose gutters read as printed rules. Two named exceptions only (§3.5). | CI: `box-shadow` grep with a two-line allowlist. |
| **L-6** | **One ink band per route,** and it is always the kitchens band. | CI: `count(data-band="ink") === 1` per rendered route. |
| **L-7** | **One filled primary CTA per viewport**, max two visible CTAs. `הזמינו עכשיו` is banned. | Review gate + copy grep. |
| **L-8** | **Radius is 3px.** The only pill is the `0.78rem` tag chip. | CI: no `rounded-full` / `rounded-2xl` / `rounded-3xl` outside `.tag`. |
| **L-9** | **Logical properties only.** | CI grep bans `ml-`, `mr-`, `pl-`, `pr-`, `left-`, `right-`, `text-left`, `text-right`, `space-x-`, `divide-x-`, `border-l`, `border-r`, `rounded-l`, `rounded-r`, `float-left`, `float-right` in `client/src`. |
| **L-10** | **One motion primitive** (`reveal`), zero infinite animations. | CI: no `animation-iteration-count: infinite`, no `infinite` in keyframe shorthand. |
| **L-11** | **No en-dash between digits** in Hebrew copy. | CI: `/\d\s*[–—]\s*\d/` over `client/src`. It renders **reversed** (§4.9). |
| **L-12** | **Hebrew is never italic.** | Global `font-style:normal` reset (§4.8) + `italic` class banned. |

---

## 2. Colour

### 2.1 The full token set, with measured contrast

All ratios computed with the WCAG 2.x relative-luminance formula from the literal hex values below. "AA text" = ≥4.5:1 (normal text). "AA large" = ≥3:1 (≥24px, or ≥18.66px bold). "AA non-text" = ≥3:1 (UI component boundaries, focus indicators, meaningful graphics).

**Surfaces**

| Token | Hex | Role |
|---|---|---|
| `--paper` | `#fbf8f3` | default page surface |
| `--paper-2` | `#f4eee4` | alternating band (`.sec--alt`), inline info boxes |
| `--paper-3` | `#ece3d5` | the quote-builder band, one per page |
| `--surface-hover` | `#ffffff` | **hover state only.** Pure white is never a resting surface. |
| `--ink` | `#1e1a17` | text, button fill, the single dark band |

**Text on paper**

| Pair | Ratio | Verdict |
|---|---|---|
| `--ink` `#1e1a17` on `--paper` | **16.31:1** | AA + AAA ✅ |
| `--ink` on `--paper-2` | **14.97:1** | ✅ |
| `--ink` on `--paper-3` | **13.59:1** | ✅ |
| `--ink-2` `#4d453d` on `--paper` | **8.87:1** | ✅ body secondary, lede |
| `--ink-2` on `--paper-2` | **8.14:1** | ✅ |
| `--ink-3` `#6f6459` on `--paper` | **5.44:1** | ✅ AA text — captions, eyebrows, labels |
| `--ink-3` on `--paper-2` | **4.99:1** | ✅ |
| `--ink-3` on `--paper-3` | **4.53:1** | ✅ (margin is thin — do not darken the paper further) |
| `--ink-4` `#877c70` on `--paper` | **3.85:1** | ❌ **not for text.** AA-non-text only. |
| `--ink-4` on `--paper-3` | **3.21:1** | AA-non-text only |

> **This is the one substantive correction to the design reference.** The reference sets `--ink-3: #877c70` and then uses it for `.eyebrow` (0.74rem), `.sec__num`, `.photo::before`, `.trust__item span` (0.82rem), `.menu__for` (0.86rem), `.hero__note` (0.9rem) and `.est__note` (0.8rem) — all **normal-size text at 3.85:1, a 1.4.3 failure across the entire page.** Fix: `--ink-3` is redefined to `#6f6459` (5.44:1) and carries every one of those roles unchanged. The old value survives as `--ink-4`, restricted to non-text (decorative hairline emphasis, disabled-control borders, the grain-adjacent hairline on photo frames). A lint rule bans `color: var(--ink-4)` and `text-ink-4`.

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

> **Rule.** `--line` is legal for *decorative* separation: section band edges, card-grid gutters, table rules, list dividers, the `.step` masthead rule. `--line-strong` is **mandatory** for any boundary that is the only thing identifying an interactive control: text inputs, textareas, selects, radio-card resting borders, checkbox boxes, ghost-button borders. WCAG 1.4.11 applies to the second group and not the first. The design reference uses `--line` for both, which is a 1.4.11 failure on every form field. This is the second substantive correction.

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

> **WhatsApp green.** The reference's `--wa: #1faf5a` gives white text **2.86:1** — a failure. WhatsApp's own brand green `#25D366` is worse. We ship `#0f7a3d` (5.42:1). This is a background colour, not the logo mark; the inline SVG glyph stays recognisable and the platform's brand guidelines do not require a specific button background. Do not "fix" this back to brand green.

> **`--danger` is deliberately not `--tomato`.** Tomato is the *accent*; an error must not read as decoration, and a decorative numeral must not read as an error. They are 2 steps apart in luminance and distinguishable side by side.

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
--rule-control     → var(--line-strong)   /* interactive boundaries */
--focus            → var(--tomato)
--btn-bg           → var(--ink)
--btn-fg           → var(--paper)
```

Inside `[data-band="ink"]` every one of these is overridden in a single block (§5). A component therefore needs **zero** band-awareness: `<Button>` on the ink band inverts automatically and its focus ring becomes `#e0a79c` without a prop.

### 2.3 Forbidden pairs — CI-checkable

| Never | Ratio | Instead |
|---|---|---|
| `--tomato` on `--ink` | 2.85:1 | `--ink-band-accent` `#e0a79c` (8.37:1) |
| `--ink-4` as text colour anywhere | 3.85:1 max | `--ink-3` |
| `--line` as an input/radio/ghost-button border | 1.40:1 | `--line-strong` |
| white on any green lighter than `#0f7a3d` | <4.5:1 | `--wa` |
| any gold (`#d9a520`, `hsl(43,74%,*)`) anywhere | 2.25:1 | deleted; see §11 |
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

Real tokens, hairlines that survive, no filter. The literal block ships in §5.

Same for the invert/dark toggle: there is no dark theme. `.dark` in `index.css:38-59` is unused (2 `dark:` usages in the whole codebase, and its `--primary` is still the failing gold). It is deleted with `darkMode` from the Tailwind config (§11).

---

## 3. Spacing, radii, borders, elevation, grain

### 3.1 Spacing scale

Fluid where it carries the "expensive" feeling, fixed where it must be predictable. The 12:1 ratio between section padding (up to 8.5rem) and paragraph spacing (1.1em) is the entire restraint budget — do not compress it.

```css
--w:            1140px;                          /* content max-width */
--pad-sec:      clamp(4.5rem, 9vw, 8.5rem);      /* section block padding */
--pad-sec-tight:clamp(2.75rem, 5.5vw, 4.5rem);   /* thin bands: trust, tasting */
--pad-gutter:   clamp(1.15rem, 4vw, 2.5rem);     /* inline page gutter */
--gap-head:     clamp(2.5rem, 5vw, 4rem);        /* section header → content */
--gap-grid:     clamp(1rem, 2vw, 1.5rem);        /* card/menu grid gap */
--gap-col:      clamp(2rem, 5vw, 4.5rem);        /* two-column gap (hero, about) */
--pad-card:     clamp(1.6rem, 3vw, 2.3rem);
--pad-form:     clamp(1.4rem, 3.5vw, 2.5rem);

/* fixed steps, for component internals only */
--s-1: .25rem; --s-2: .5rem;  --s-3: .75rem; --s-4: 1rem;
--s-5: 1.25rem; --s-6: 1.5rem; --s-8: 2rem;  --s-10: 2.5rem; --s-12: 3rem;
```

`py-20` (fixed 5rem) currently used across every section is both too small at desktop and non-responsive. It is replaced by `--pad-sec`.

### 3.2 Radii

```css
--r:      3px;   /* everything: buttons, inputs, cards, photo frames, bands */
--r-pill: 99px;  /* ONLY .tag (0.78rem chips) and the 2px progress bar */
```

A 3px radius on a `1.05rem 1.9rem` button reads as printed matter. 99px on the same button reads as a 2016 template. Delete every `rounded-full` (46 occurrences across 14 non-`ui` files) and every `rounded-2xl` / `rounded-3xl`, and delete the `w-20 h-20 rounded-full` icon medallions at `events.tsx:55` and `testimonials.tsx:44` — numerals replace them.

### 3.3 Borders

```css
--bw:       1px;   /* hairline: the house separator */
--bw-rule:  2px;   /* masthead rule: .proof top, .tasting top, .step group */
--bw-chev:  1.6px; /* the FAQ chevron, drawn from two rotated borders */
```

### 3.4 Separation without shadows — the four techniques

1. **Hairline border.** `border: var(--bw) solid var(--rule)`.
2. **Gutter-as-rule.** `display:grid; gap:1px; background:var(--rule)` on the container, `background:var(--paper)` on each child. The gutters *are* the rules — a real editorial table. This is the card grid and the branch production sheet.
3. **Interrupted rule.** `border-top: 1px solid var(--ink)` on the block, with the serif numeral absolutely positioned, `translateY(-50%)`, on a `--paper` chip so it interrupts the rule. This is `.step`.
4. **Band alternation.** `background: var(--paper-2); border-block: 1px solid var(--line)`.

### 3.5 Elevation — `box-shadow` is banned, with two exceptions

```css
--shadow-sticky: 0 -6px 24px rgba(30,26,23,.09);  /* sticky mobile CTA bar ONLY */
--ring-inset:    inset 0 0 0 1px var(--line);     /* border substitute on .photo,
                                                     does not affect layout */
```

Everything else — 56 `shadow-sm|md|lg|xl|2xl` occurrences, `.hover-lift`'s `0 20px 40px`, `.glass-effect`, `.text-shadow-warm` — is deleted (§11). The one doubled-rule trick from the reference (`.menu--flag { box-shadow: 0 1px 0 var(--ink) }`) is permitted as a **rule**, not a glow, and is spelled `--rule-double` for clarity.

Text shadow is banned outright. `.text-shadow-warm` casts to the physical right, which is the wrong side in RTL.

### 3.6 Grain

One inline `feTurbulence`, ~400 bytes of data URI, one composited layer, zero network requests. At 2.8% it is imperceptible as texture and reads only as warmth; it is what stops flat `#fbf8f3` looking like an unstyled page.

```css
body::after{
  content:"";position:fixed;inset:0;z-index:900;pointer-events:none;opacity:.028;
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)'/%3E%3C/svg%3E");
}
@media print { body::after{ display:none } }
html[data-contrast="high"] body::after{ display:none }
```

Three rules that are not negotiable:

- **Never raise the opacity.** Past ~4% it becomes visible noise and fights photographs.
- **`z-index:900` must stay the topmost layer.** It sits over shadcn dialogs (`z-50`) — harmless at 2.8% with `pointer-events:none`, and it is what makes the page feel like one surface. Nobody may "fix" this by raising a modal above 900.
- **Print and high-contrast disable it.** Amplified by a contrast filter the grain renders as dirt, in exactly the mode where clarity matters most. (This is the third independent reason the filter-based accessibility mode must die.)

---

## 4. Hebrew typography

### 4.1 Families and roles

| Family | Axis | Role | Never |
|---|---|---|---|
| **Frank Ruhl Libre** | variable `wght 300–900` (verified v23, single axis) | display h1–h3, `.menu__price`, `.trust b`, all numerals, blockquote, `.step__n` | below 20px; captions; form labels; `.sec__num` eyebrows |
| **Assistant** | variable `wght 200–800` (verified v24, single axis) | body, UI, forms, eyebrows, labels, buttons, captions | below `wght 400`; above `wght 600` |

Weights, fixed:

```
FRL 500  → h1, h2, menu prices, trust numbers, blockquote, legend  (editorial)
FRL 700  → brand wordmark, h3, .step__n only                        (institutional — rationed)
Assistant 400 → body, inputs, captions
Assistant 600 → eyebrows, labels, buttons, tags, table headers
```

**FRL 500, not 700, for display is the most load-bearing typographic decision in the system.** Hebrew serif at 700 in large sizes reads institutional and heavy; at 500 it reads editorial. FRL is a high-contrast modern Hebrew face: its hairlines go fragile below ~20px, so **FRL is banned below 20px**, and at 20–24px must be `wght ≥ 500`.

**`wght 300` is banned for Hebrew text.** The reference sets `.lede{font-weight:300}` with `-webkit-font-smoothing:antialiased`. Hebrew letterforms are uniform-height with no ascender/descender silhouette; at 300 with macOS thin antialiasing the strokes drop below comfortable contrast — the setting that reads "elegant" in Latin reads "faint" in Hebrew. The light-editorial feel comes from `--ink-2` (8.87:1), measure and leading instead. Every `font-weight:300` in the reference becomes 400.

Also remove `text-rendering: optimizeLegibility` (a known first-paint regression in Blink/Gecko on large text blocks, and it buys nothing — kerning and `ccmp` are on by default for woff2 with GPOS), and test with `-webkit-font-smoothing: antialiased` **removed** — for Hebrew it is a net loss.

### 4.2 Loading — self-hosted, Hebrew-subset, variable

Current cost, measured live from `fonts.gstatic.com` via the `<link>` at `client/index.html:28-31`: FRL hebrew 18,760 B + FRL **latin 44,272 B** + Assistant hebrew 7,336 B + Assistant latin 22,056 B + 7,192 B of CSS = **92,488 B across 4 requests on 2 hosts**, behind a 4-hop chain (DNS → TLS → CSS parse → font fetch).

**Digits do not exist in the Google Hebrew subsets.** Verified by reading the served woff2 cmaps: FRL hebrew = 114 glyphs, **0/10 digits**; Assistant hebrew = 95 glyphs, **0/10 digits**. Em-dash, en-dash and curly quotes are likewise latin-only. So *any* number on the page — a price, a phone number, `3 מסעדות`, `24 שעות` — forces the 44 KB FRL Latin file to download. FRL will never render a Latin word on this site; that 44 KB is pure waste.

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
  --unicodes='<same>,U+0041-005A,U+0061-007A'   # Assistant carries Latin runs; FRL does not
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

Preload **exactly two** files (`<link rel="preload" as="font" type="font/woff2" crossorigin>`); preloading more costs LCP.

> **`size-adjust` is deliberately omitted.** The commonly-quoted `93%` is derived from Noto Sans Hebrew (correct for Android) and is wrong for macOS `Arial Hebrew` and for Windows. Shipping an unverified `size-adjust` **creates** CLS rather than removing it. Ship a one-off measurement page (webfont `xAvgCharWidth` ÷ fallback `xAvgCharWidth` at equal upm — FRL 522, Assistant 458), measure on real iOS/Android/Windows, then add the value. Until then the `ascent/descent` overrides alone remove the line-box shift, which is the larger component.

> **`font-display`.** Ship `swap` first. Once self-hosting is verified and the files are ≈3–6 KB, consider `optional` on the body face plus preload: at that size the font almost always wins the first-paint race, and `optional` makes the browser skip the swap entirely if it loses. Verify the miss rate under CPU+network throttling before switching — `optional` shows the fallback for the whole first paint when it misses.

### 4.3 Modular scale — literal clamps

Hebrew-calibrated: nominal sizes at the top of the scale are deliberately ~one step smaller than a Latin equivalent, because Hebrew letters occupy 20–25% more of the em than Latin lowercase (measured: FRL Hebrew letter height **0.586em** vs Latin x-height 0.468em; Assistant **0.545** vs 0.500). Fluid between 360px and 1440px viewports; min and max in `rem`, so browser zoom is safe.

```css
--fs-3xs: clamp(0.75rem,   0.7396rem + 0.0463vw, 0.7813rem);  /* 12 → 12.5  legal fine print */
--fs-2xs: clamp(0.8125rem, 0.8021rem + 0.0463vw, 0.8438rem);  /* 13 → 13.5  eyebrow, sec__num, tag */
--fs-xs:  clamp(0.875rem,  0.8542rem + 0.0926vw, 0.9375rem);  /* 14 → 15    caption, meta, note */
--fs-sm:  clamp(0.9688rem, 0.9479rem + 0.0926vw, 1.0313rem);  /* 15.5 → 16.5 UI, labels, tags */
--fs-base:clamp(1.0625rem, 1.0417rem + 0.0926vw, 1.125rem);   /* 17 → 18    BODY */
--fs-md:  clamp(1.1563rem, 1.1042rem + 0.2315vw, 1.3125rem);  /* 18.5 → 21  lede, standfirst */
--fs-lg:  clamp(1.25rem,   1.1667rem + 0.3704vw, 1.5rem);     /* 20 → 24    h3, FAQ summary */
--fs-xl:  clamp(1.4375rem, 1.2917rem + 0.6481vw, 1.875rem);   /* 23 → 30    card title, legend */
--fs-2xl: clamp(1.625rem,  1.375rem  + 1.1111vw, 2.375rem);   /* 26 → 38    h2 */
--fs-3xl: clamp(1.9375rem, 1.5417rem + 1.7593vw, 3.125rem);   /* 31 → 50    h1 on inner routes */
--fs-4xl: clamp(2.25rem,   1.6667rem + 2.5926vw, 4rem);       /* 36 → 64    hero h1 */
```

Ratios run ≈1.09 in the small steps (UI text stays stable) and 1.25–1.32 in the display steps (headlines scale). **Body floor is 17px, not 16px** — Hebrew needs the extra pixel because ב/כ, ד/ר, ה/ח and ו/ז/ן differ by details that disappear at 16px with no ascender/descender silhouette to help.

> **Resolution against the reference.** `style.css` sets `h1: clamp(2.4rem, 1.35rem + 4.6vw, 4.4rem)` (38.4 → 70.4px). We cap the hero at `--fs-4xl` (36 → 64px) instead. 70px of Hebrew at `lh 1.08` overflows three lines on a 390px screen and the extra 6px buys nothing — Hebrew already fills more of the em. Everything else in the reference maps 1:1 onto the tokens above.

Assignments:

| Element | Size | Family / weight | Line-height |
|---|---|---|---|
| hero `h1` | `--fs-4xl` | FRL 500 | `--lh-display` 1.08 |
| route `h1` | `--fs-3xl` | FRL 500 | 1.08 |
| `h2` | `--fs-2xl` | FRL 500 | `--lh-head` 1.14 |
| `h3` / card title | `--fs-lg` | FRL 700 | `--lh-sub` 1.24 |
| builder `legend` | `--fs-xl` | FRL 500 | 1.24 |
| lede / standfirst | `--fs-md` | Assistant 400, `--ink-2` | 1.6 |
| body | `--fs-base` | Assistant 400 | `--lh-body` 1.75 |
| UI / labels / buttons | `--fs-sm` | Assistant 600 | 1 (buttons) / 1.5 |
| caption, meta, note | `--fs-xs` | Assistant 400/600, `--ink-3` | 1.6 |
| eyebrow, `.sec__num`, tag | `--fs-2xs` | Assistant 600, `+0.09em` tracking | 1.4 |
| legal fine print | `--fs-3xs` | Assistant 400, `--ink-3` | 1.55 |

### 4.4 Line-height, derived from measured Hebrew ink extent

Not from Latin habit. Measured ink extent (ל top → ק bottom): **Frank Ruhl Libre 0.960em** (0.800 to −0.160); **Assistant 0.917em** (0.717 to −0.200).

```css
--lh-display: 1.08;   /* FRL hero/h1 — 0.12em clearance */
--lh-head:    1.14;   /* h2 */
--lh-sub:     1.24;   /* h3, legend */
--lh-tight:   1.35;   /* table cells, tags, sticky bar */
--lh-body:    1.75;   /* body — the reference's value is correct, keep it */
--lh-loose:   1.80;   /* any block over ~400 words */
```

Floors: **never below 1.05 for FRL** (0.96em ink extent). Hebrew tolerates tight display leading far better than Latin because only lamed ascends. Hebrew *body* needs **more** leading than Latin, not less: every letter fills the full x-height band, so the block has no ascender/descender channels and reads as a denser grey. `leading-none` and `leading-tight` are banned on Hebrew display type.

> If the design ever substitutes **Noto Serif Hebrew**, its ink extent is **1.113em** — above one em — and any line-height below 1.20 causes real glyph collision. FRL and Assistant are the shipped pair; this is noted so a substitution is not made casually.

### 4.5 Measure — in `em`, never `ch`

Assistant's `1ch` = 0.472em, but Hebrew averages **0.382em per character** (measured over four real strings from the project copy, 389 chars). So `ch` over-reports Hebrew character count by **24%**: `max-width: 65ch` yields ~80 Hebrew characters, and Tailwind Typography's `prose` default of `65ch` is an 80-character Hebrew line.

```css
--measure-body:    26em;  /* ~68 Hebrew chars — 442px @17px, 468px @18px */
--measure-lede:    23em;  /* ~60 chars */
--measure-answer:  26em;  /* FAQ answer */
--measure-caption: 18em;  /* ~47 chars — the photo caption */
--measure-confirm: 22em;  /* confirmation view body */
--measure-max:     29em;  /* ~76 chars — hard ceiling, nothing exceeds this */
```

Hebrew runs at a slightly *lower* character count than Latin's 45–75: Hebrew words average ~4.6 letters (verified on the project copy: 123 chars ≈ 22 words), so 60 Hebrew chars already carries ~11 words — the same saccade load as 65 Latin chars.

Fixes: `blog-post.tsx:86` uses `prose prose-lg max-w-none`, removing the measure limit entirely → `max-w-[26em]` (and `text-right` → `text-start`). The reference's `.lede{max-width:46ch}` ≈ 57 Hebrew chars, acceptable but slightly tight → `--measure-lede`.

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

Mandatory on: every price, the phone number, guest counts, capacity figures, drive-time minutes, the estimate value, table numeric cells, the reference code, dates.

Two optical corrections. Latin digits stand **20–26% taller** than Hebrew letters in every candidate face — they are cap-height glyphs beside x-height-band letters (measured digit ink height vs Hebrew letter height: FRL 0.705/0.586 = ×1.20; Assistant 0.664/0.545 = ×1.22). And the shekel sign is drawn to the **Hebrew** band (FRL 0.000–0.587), so `120 ₪` shows tall digits beside a visibly shorter currency mark.

```css
.num-inline{ font-size:.94em; font-feature-settings:"tnum" 1 }  /* digits inside running Hebrew prose:
                                                                   "3 מסעדות", "24 שעות", trust counts */
.shekel    { font-size:1.15em; line-height:1 }                  /* the ₪ glyph, so it matches the figures */
```

Do **not** apply `.num-inline` to the large price display — there the tall figures are wanted.

### 4.7 Currency, phone numbers, dates

**Currency is number-first with a hard NBSP.** CLDR's canonical Israeli format is number-first: `Intl.NumberFormat('he-IL',{style:'currency',currency:'ILS'}).format(15000)` returns `U+200F 15,000 U+00A0 U+200F ₪`. The codebase writes symbol-first (`₪{item.price}` at `menu.tsx:55`, `₪120` in `events.tsx`, `₪{total}` at `price-calculator.tsx:219`). Ship `120&nbsp;₪` so number and symbol never break across lines, and route every figure through one shared formatter:

```ts
// client/src/lib/format.ts
export const ils = new Intl.NumberFormat('he-IL',
  { style:'currency', currency:'ILS', maximumFractionDigits:0 });
export const num = new Intl.NumberFormat('he-IL');
```

`priceResult.total.toLocaleString()` (`price-calculator.tsx:219`) resolves to the **runtime** locale — it returned `en-US` in this container — so grouping is non-deterministic across environments. Never call `toLocaleString()` without a locale argument.

**Phone numbers.** Plain local form `052-1234567` renders correctly in RTL with no markup. The moment a `+`, parentheses or a space is introduced it breaks: `+972-52-1234567` renders as `972-52-1234567+` and `(03) 5551234` renders as `5551234 (03)`. So:

- **Display:** bare local form, `.num`, `white-space:nowrap`.
- **`href`:** always E.164 — `tel:+972521234567`. Every `tel:` in the repo is currently non-E.164 (`contact.tsx:301,348`; `hero.tsx:101`; `footer.tsx:56`; `price-calculator.tsx:232`; `terms.tsx:190`).
- Anything with a `+` or parentheses goes inside `<span dir="ltr">`.

**Hebrew-letter numerals** (א׳, ב׳) are for dates and enumerations only, never cardinals.

**Three-branch string:** `Intl.ListFormat('he-IL')` correctly yields `הרצליה פיתוח, רעננה ופתח תקווה` (no serial comma, ו- prefixed to the last item). Use it rather than hardcoding a comma-and.

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

Removals: `testimonials.tsx:52` and `blog-post.tsx:210` (`italic` class); the reference's own `.step em{font-style:italic}` at `style.css:226` — **do not inherit that**, it italicises the Hebrew word `לא`. Tailwind Typography v0.5.20 sets `fontStyle:'italic'` on `blockquote` (`styles.js:1487`) — overridden in §6 or removed with the plugin.

Emphasis toolkit for Hebrew: weight (400→600), size, colour (`--ink-2`→`--ink`), positive letter-spacing, and a rule or indent. Blockquotes get FRL 500 at `--fs-lg` plus a `2px` ink rule above — that is what makes them read as quotes.

**`text-transform: uppercase` is a no-op on Hebrew** (unicase script) but **will** uppercase embedded Latin, producing an inconsistent mixed-case eyebrow. The reference's `.eyebrow{text-transform:uppercase; letter-spacing:.18em}` drops `uppercase` entirely (or scopes it `:lang(en)`), and tracking reduces to **0.09em** — 0.18em on Hebrew starts reading as spaced-out individual letters.

### 4.9 Bidi rules — the corrections that are invisible in code review

**Numeric ranges joined by en-dash reverse visually in RTL.** Verified with FriBidi 1.0.13 and python-bidi (both faithful UAX#9 implementations, in agreement):

| Written | Renders as | Why |
|---|---|---|
| `25–200 סועדים` | **`200–25 סועדים`** ❌ | U+2013 is class ON → N1 applies → EN counts as R → the runs swap |
| `₪5,000 - ₪15,000` | **`₪15,000 - ₪5,000`** ❌ | same |
| `8:00–17:00` | **`17:00–8:00`** ❌ | same |
| `25-200` (ASCII hyphen) | `25-200` ✅ | W4: a single ES/CS between two EN becomes EN, keeping one LTR run |

`<bdi>` / `unicode-bidi:isolate` **does not fix this** — an isolate is substituted by U+FFFC (class ON), so isolating each number leaves `[ON][dash][ON]` and the order still mirrors. Only an LTR **container** around the *entire* range works. `Intl.NumberFormat('he-IL').formatRange(5000,15000)` also renders reversed — do not trust it.

**Rules:**

1. Preferred — Hebrew connector prose, bidi-safe with zero markup: `בין 5,000 ל־15,000 ₪`, `מ־25 ועד 200 סועדים`, `בין 08:00 ל־17:00`.
2. Where a literal range is required, one component:

```tsx
// client/src/components/primitives/ltr.tsx
export const Ltr = ({children}:{children:React.ReactNode}) =>
  <span dir="ltr" style={{unicodeBidi:'isolate'}}>{children}</span>;
```

Required for: price ranges, hour ranges, guest ranges, `+972…` numbers, parenthesised area codes, date ranges, version strings.

3. CI bans `/\d\s*[–—]\s*\d/` over `client/src` (§12).

**Live instances to fix.** `contact.tsx:230-233` displays inverted budget ranges to every lead (`עד ₪5,000` / `₪5,000 - ₪15,000` …) — that is a consumer-facing misstatement on a lead-gen form, not a cosmetic bug, and the whole selector is deleted anyway (§11). The design reference's own builder markup at `index.html:369-372` ships `25–50`, `50–100`, `100–200` — **all four guest bands are currently wrong** and must be rewritten to connector form. The reference's hero note at `index.html:66` already does it correctly (`מ־25 ועד`), so the file is internally inconsistent.

**Hebrew punctuation — use the Hebrew codepoints.** They are in the Hebrew subset; the Latin substitutes are both typographically and mechanically wrong. Measured in FRL: hyphen-minus/en-dash sit centred at y=+0.248em, **0.044em below** the Hebrew optical centre (+0.293em); the maqaf ־ (U+05BE) sits at 0.442–0.546em, at the top of the Hebrew band where readers expect it. Geresh ׳ (U+05F3) and gershayim ״ (U+05F4) are in the Hebrew subset; ASCII `"` / `'` and curly `“ ”` are latin-subset-only and sit above the Hebrew band.

| Use | Not |
|---|---|
| ־ (U+05BE maqaf) for word-joining: `מ־25`, `רב־קווי`, `ב־Instagram` | `-` |
| ״ (U+05F4) for abbreviations: `ש״ח`, `בע״מ` | `"` |
| ׳ (U+05F3) for `24 ש׳` | `'` |

Bonus: this keeps the copy inside the Hebrew subset. `–`, `—`, `"`, `“`, `’`, `…` are all latin-subset-only and each one drags in the FRL Latin file.

**Never end a Hebrew sentence with a Latin email, URL or brand name.** `כתבו לנו אל info@mamamia.co.il.` renders the terminal period at the far left, immediately before the Latin string — it looks like a leading dot on the address. This is spec-correct RTL behaviour that no markup fixes (`<bdi>` does not help; the period is still logically last and therefore leftmost). Either follow it with a Hebrew word (`…info@mamamia.co.il ונחזור אליכם` — renders cleanly) or put the address on its own line with no terminal punctuation. This is a copy rule for the content spec.

---

## 5. The literal `client/src/index.css`

Replaces the file entirely. Every deletion in §11 that touches `index.css` is already reflected here.

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* ═══════════════════════════════════════════════════════════════
   מאמא מיה קייטרינג · design tokens
   Direction: editorial, paper, restrained. Not glitzy.
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

  /* ── type scale (see §4.3) ──────────────────────────────── */
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
  --lh-display:1.08; --lh-head:1.14; --lh-sub:1.24;
  --lh-tight:1.35;   --lh-body:1.75; --lh-loose:1.8;

  /* ── measure, in em not ch (§4.5) ───────────────────────── */
  --measure-body:26em;   --measure-lede:23em;    --measure-answer:26em;
  --measure-caption:18em;--measure-confirm:22em; --measure-max:29em;

  /* ── space (§3.1) ───────────────────────────────────────── */
  --w:1140px;
  --pad-sec:      clamp(4.5rem, 9vw, 8.5rem);
  --pad-sec-tight:clamp(2.75rem, 5.5vw, 4.5rem);
  --pad-gutter:   clamp(1.15rem, 4vw, 2.5rem);
  --gap-head:     clamp(2.5rem, 5vw, 4rem);
  --gap-grid:     clamp(1rem, 2vw, 1.5rem);
  --gap-col:      clamp(2rem, 5vw, 4.5rem);
  --pad-card:     clamp(1.6rem, 3vw, 2.3rem);
  --pad-form:     clamp(1.4rem, 3.5vw, 2.5rem);

  /* ── radii, borders, the two permitted shadows ──────────── */
  --r:3px; --r-pill:99px; --radius:3px;   /* --radius kept for shadcn derivation */
  --bw:1px; --bw-rule:2px; --bw-chev:1.6px;
  --shadow-sticky:0 -6px 24px rgba(30,26,23,.09);
  --ring-inset:inset 0 0 0 1px var(--line);
  --rule-double:0 1px 0 var(--ink);

  /* ── motion (§8) ────────────────────────────────────────── */
  --dur-state:180ms; --dur-state-slow:220ms; --dur-reveal:550ms; --dur-shake:300ms;
  --ease:cubic-bezier(.2,0,.2,1);
  --dir:1;                                /* direction sign for physical-only props */

  /* ── editing affordance — dev only (§7.15) ──────────────── */
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
  --accent-bg:var(--paper-2);
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

/* ── the ink band: one per route, always the kitchens band ── */
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
  .rule-top{border-top:var(--bw-rule) solid var(--ink)}
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

@media print{
  body::after{display:none}
  body{background:#fff;color:#000;padding-bottom:0}
  .head,.sticky,.skip,.calc__nav,[data-print="hide"]{display:none!important}
  @page{margin:14mm}
  table,tr,td,th,.menu,.step,.qa{break-inside:avoid}
  *{print-color-adjust:exact;-webkit-print-color-adjust:exact}
}
```

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
        tight:   "var(--lh-tight)",   body: "var(--lh-body)", loose: "var(--lh-loose)",
      },

      maxWidth: {
        wrap:    "var(--w)",
        body:    "var(--measure-body)",
        lede:    "var(--measure-lede)",
        answer:  "var(--measure-answer)",
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
        // `dark-brown`, `chart-*`, `sidebar-*`. All deleted — see §11.
      },

      borderRadius: { DEFAULT: "var(--r)", sm: "2px", md: "var(--r)", lg: "var(--r)", pill: "var(--r-pill)" },
      borderWidth:  { DEFAULT: "1px", rule: "2px", chev: "1.6px" },

      boxShadow: {
        none: "none",
        sticky: "var(--shadow-sticky)",   // the sticky mobile CTA bar only
        inset:  "var(--ring-inset)",      // photo frame border substitute
        rule:   "var(--rule-double)",     // the doubled hairline on .menu--flag
        // NOTE: sm/md/lg/xl/2xl are intentionally NOT defined. §3.5.
      },

      spacing: {
        sec: "var(--pad-sec)", "sec-tight": "var(--pad-sec-tight)",
        gutter: "var(--pad-gutter)", head: "var(--gap-head)",
        grid: "var(--gap-grid)", col: "var(--gap-col)",
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

- **`@tailwindcss/typography`** — 18,522 B raw / 2,215 B gzip of CSS (measured: 88.91 KB → 70.39 KB) for exactly one usage, `prose prose-lg` at `blog-post.tsx:86`, where the content is already hand-styled JSX so `prose` contributes nothing and fights the explicit classes. It also ships `maxWidth: 65ch` (= ~80 Hebrew chars) and `blockquote{fontStyle:italic}` (fake oblique Hebrew). `blog-post.tsx` is deleted, so the plugin goes with it.
- **`tailwindcss-animate`** — only the 12 `ui/*` files listed in §11.3 use `animate-in`/`animate-out`. Remove the plugin **in the same commit as those files**, not before. The accordion's `accordion-up`/`accordion-down` come from this config's own `keyframes`, not from the plugin, so the retained Accordion is unaffected.

Deleting the 35 unreferenced `ui/*` files is worth **CSS −52,614 B raw / −7,344 B gzip** (measured 88,945/14,688 → 54,853/9,430, then → 36,331/7,344 with the typography plugin dropped) — a 59% cut with zero visual change. They contribute **0 bytes of JS** (Rollup already tree-shakes them); the saving is entirely Tailwind's content-glob scanning them for class names.

---

## 7. Component inventory

Every component is written against the **semantic role** tokens, so each one works unchanged on paper, on `paper-2`, on `paper-3` and inside `[data-band="ink"]` with no band prop.

### 7.1 Button

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
| `wa` | `bg:var(--wa)` `fg:#fff` + inline WhatsApp SVG | `bg:var(--wa-dk)` | 5.42 → 6.27:1 ✅ |
| `sm` (modifier) | `padding:.7rem 1.3rem`, `min-height:44px` | — | — |
| `link` | no fill, `--fg-subtle`, underline `--rule` | `--fg`, underline `--accent` | 5.44:1 ✅ |

States: `:focus-visible` → the global 2px `--focus` outline at 3px offset (never a ring, never `outline:none`). `:disabled` → `opacity:.55; cursor:not-allowed; pointer-events:none`, **and** `aria-disabled` rather than the `disabled` attribute on submit buttons so the control stays focusable and screen-reader-discoverable. `[data-loading]` → label swaps to `שולחים…`, width locked via `min-width` so nothing reflows, `aria-busy="true"`.

**Rules.** One `primary` per viewport (L-7). Phone is `link`, never `primary`, except on `/urgent` and `/catering/shiva`. Banned labels: `הזמינו עכשיו`, `הזמינו אירוע עכשיו`, `הזמן`. House labels: `קבלו הצעה ב־4 שאלות`, `בדקו זמינות לתאריך שלכם`, `בואו לטעום`, `שלחו לי הצעה`, `עדיף לי בוואטסאפ`.

### 7.2 Text field / textarea

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

**Required per field type** (all four are currently missing, and each one silently costs mobile completions):

| Field | Attributes |
|---|---|
| name | `autocomplete="name"` `dir="auto"` |
| phone | `type="tel"` `inputmode="tel"` `autocomplete="tel"` `dir="ltr"` `class="text-end num"` |
| email | `type="email"` `inputmode="email"` `autocomplete="email"` `dir="ltr"` `class="text-end"` |
| free text | `dir="auto"` (a lead who types English gets correct alignment) |

`dir="ltr"` fixes the caret and selection behaviour while typing digits, and the base rule in §5 keeps the Hebrew placeholder right-aligned so the field does not look left-aligned inside an RTL form.

**Guest count is never `type="number"`** — it summons the wrong keyboard and allows scroll-wheel mutation. It is a radio-card band (§7.3).

**Date is never native `type="date"`** — it renders LTR with device-dependent locale formatting. Use an RTL-aware picker, or three `inputmode="numeric"` selects, and always pair with the checkbox `התאריך עוד לא נקבע`.

### 7.3 Radio-card option (`.opts`)

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

Checked state is a full inversion (16.31:1) — unmistakable at a glance and it needs no colour to read, so it survives greyscale and high-contrast. Selection is **never** signalled by colour alone.

Chips variant (`.chips`): same semantics, `display:flex; flex-wrap:wrap`, `--r-pill` radius, `--fs-2xs` — used for dietary constraints multi-select and event-type tiles.

### 7.4 Checkbox and the consent control

```
.check      display:flex; align-items:flex-start; gap:.6rem; cursor:pointer
.check input width:1.15rem; height:1.15rem; accent-color:var(--accent);
            flex:0 0 auto; margin-block-start:.2rem
            /* hit area extended to 44×44 via the label's padding-block */
.check span font-size:var(--fs-xs); color:var(--fg-muted); line-height:1.55
```

**Exactly one checkbox pattern in the whole product, and it is never required.** The marketing opt-in:

```
☐ אני מאשר/ת שמאמא מיה תשלח לי הצעות ועדכונים על קייטרינג בוואטסאפ, ב-SMS או במייל.
  ניתן להסיר את ההסכמה בכל הודעה.
```

Unchecked by default, non-blocking, never a condition of submitting. There is **no** `אני מאשר/ת את מדיניות הפרטיות` gate: Israeli law does not require it, it costs a click, and it buys nothing. The lawful basis for handling the enquiry is the voluntary submission plus the collection notice — which is a *static text block inside the form component*, not a checkbox and not a modal (see `05-*`).

### 7.5 Section header

```tsx
<header className="sec__head max-w-[54ch] mb-head reveal">
  <p className="sec__num">01</p>            {/* accent, 0.09em tracking, no uppercase */}
  <h2>לאיזה אירועים אנחנו נכנסים</h2>
  <p className="sec__lede">…</p>            {/* --fg-muted, --fs-md, --measure-lede */}
</header>
```

Numerals carry the rhythm. **Zero icons inside headings, zero icon medallions anywhere.** No `text-transform:uppercase` (§4.8).

### 7.6 Card and the card grid

```
.cards  display:grid; grid-template-columns:repeat(auto-fit,minmax(270px,1fr));
        gap:1px; background:var(--rule); border:1px solid var(--rule);
        border-radius:var(--r); overflow:hidden       /* the gutters ARE the rules */
.card   background:var(--bg); padding:var(--pad-card); transition:background var(--dur-state-slow)
.card:hover  background:var(--surface-hover)          /* white is a hover state */
.tags li     font-size:var(--fs-2xs); color:var(--fg-subtle);
             border:1px solid var(--rule); border-radius:var(--r-pill); padding:.2rem .7rem
```

`.tags li` is the **only** pill in the system (L-8).

### 7.7 Menu row (the TAFRIT graft)

```
.dish       display:grid; grid-template-columns:1fr auto; align-items:baseline;
            column-gap:.75rem; padding-block:.6rem;
            border-bottom:1px dotted var(--rule)      /* dotted border IS the leader */
.dish__name font-size:var(--fs-sm)
.dish__desc font-size:var(--fs-xs); color:var(--fg-subtle);
            max-width:17em; /* ≤12 words — enforced in the copy spec */
.dish__price class="num"; font-family:var(--serif); font-weight:500
```

**Never repeated period characters as a leader** — they break RTL and read as noise to a screen reader. A `border-bottom: 1px dotted` gives the same printed-menu effect, is direction-agnostic and is announced as nothing.

`.menu__list li::before` bullets: `5px` circle, `background:var(--accent)`, `opacity:.55`, positioned with `inset-inline-start:0`.

**Degradation (L-3):** when `{{PRICE_n}}` is unfilled the `.dish__price` cell does not render and the grid collapses to `1fr` — the row reads as a chef's-menu line, which is a legitimate convention, not a gap. This is the direct mitigation for the direction's largest risk: an incomplete *table* reads as an unfinished quote; an incomplete *menu* reads as a menu.

### 7.8 Table (inclusions/exclusions, branch sheet, drive times)

```
wrapper  overflow-x:auto; -webkit-overflow-scrolling:touch   /* the PAGE never scrolls sideways */
table    width:100%; border-collapse:collapse; font-size:var(--fs-sm)
th       text-align:start;                                   /* logical, never text-right */
         font:600 var(--fs-2xs) var(--sans); letter-spacing:.09em; color:var(--fg-subtle);
         padding-block:.7rem; border-bottom:1px solid var(--ink)
td       padding-block:.75rem; border-bottom:1px solid var(--rule); vertical-align:baseline
td.num   class="num"                                          /* every numeric cell */
```

No zebra striping, no shadow, no vertical borders. **Under 640px every table stacks to a definition list** (`<dl>` with `dt` at `--fs-2xs` / 600 / `--fg-subtle` and `dd` at `--fs-sm`) rather than scrolling horizontally — a horizontally scrolling table on a 390px Hebrew screen is where the conversion lens's own winner leaked. The stacking is a CSS-only `@media` swap over the same DOM, using `display:block` on the parts; do not render two DOM trees.

### 7.9 Accordion (FAQ)

**Use the Radix Accordion already in the repo** (`ui/accordion.tsx`), not a hand-rolled one. It gives `aria-expanded`, `aria-controls`, the labelled region and correct keyboard handling for free. The current hand-rolled `sections/faq.tsx:52-66` has none of them, and `index.css:225-228` caps the expanded panel at `max-height:500px` with `overflow:hidden` — which **silently truncates** the 12-item main-dishes category (~950px at mobile single-column) and will truncate any long Hebrew FAQ answer. Never a magic `max-height`.

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

Anchor targets inside the FAQ need `scroll-margin-top: 88px` — the sticky header currently covers the heading a user just jumped to.

### 7.10 Sticky mobile CTA bar

```
.sticky  position:fixed; inset-inline:0; bottom:0; z-index:85; display:none;
         background:var(--bg); border-top:1px solid var(--rule);
         padding:.6rem .8rem calc(.6rem + env(safe-area-inset-bottom));
         gap:.5rem; box-shadow:var(--shadow-sticky)
.sticky a{flex:1; text-align:center; min-height:48px; padding:.85rem .4rem;
          border-radius:var(--r); font:600 var(--fs-sm)/1.35 var(--sans);
          border:1px solid var(--rule-control)}
@media(max-width:760px){ .sticky{display:flex} body{padding-bottom:5rem} }
```

Exactly **two** actions plus one, and only one filled: `וואטסאפ` (`--wa`), `הצעה` (`--btn-bg`, the single primary), `התקשרו` (ghost). This is the one permitted `box-shadow` besides the photo-frame inset — it is functional separation from scrolling content, not decoration.

`env(safe-area-inset-bottom)` is mandatory or the bar sits under the iOS home indicator. `body{padding-bottom:5rem}` is mandatory or the bar covers the last section's content — and it must be undone in print.

### 7.11 `<Photo>` — the Caption Law as a component contract

```tsx
type Ratio = '4/5' | '3/4' | '3/2' | '9/7' | '1200/630';

interface PhotoProps {
  ratio: Ratio;                 // REQUIRED — hard-coded ratios, see below
  caption: string;              // REQUIRED — build fails without it (L-1)
  spec: string;                 // shown inside the frame when src is absent
  src?: string; alt?: string;
  width?: number; height?: number;   // from the sharp manifest; required when src is set
  index?: number;                    // the {n} of the caption format
  priority?: boolean;                // exactly one per route → fetchpriority=high
}
```

Renders, in order of preference:

1. **With `src`:** `<figure>` → `<img>` with explicit `width`/`height` from the build-time sharp manifest (never hand-typed — they drift the moment the owner sends a replacement crop), `object-fit:cover`, `loading={priority?'eager':'lazy'}`, `decoding={priority?'sync':'async'}`, `fetchpriority={priority?'high':'auto'}`; then `<figcaption>`.
2. **Without `src`:** the labelled paper frame — `background:linear-gradient(135deg,var(--paper-2),var(--paper-3))`, `box-shadow:var(--ring-inset)`, `display:grid;place-items:center`, with `spec` centred in `font:600 var(--fs-xs)/1.6 var(--sans)`, `letter-spacing:.06em`, `color:var(--fg-subtle)`, `max-width:22ch`. It looks deliberate in production and shows the owner exactly what to shoot. **This is a valid shipping state.**

```
figcaption  margin-block-start:.7rem; padding-block-start:.7rem;
            border-top:1px solid var(--rule);
            font-size:var(--fs-xs); color:var(--fg-subtle);
            max-width:var(--measure-caption); line-height:1.6
            /* branch name inside the caption links to /kitchens/{branch} */
```

**Caption format, fixed:** `{n} · {סניף} · {רחוב} · {מה קורה} · {שעה}` — e.g. `1 · הרצליה פיתוח · מדינת היהודים 85 · הכנת אנטיפסטי לפני הפתיחה · 07:40`. An uncaptioned image cannot be committed. This is the direction expressed as a lint rule, and it is what permanently blocks stock imagery and SVG stand-ins from re-entering.

**The four ratios are hard-coded in CSS**, so a photo shot at the wrong ratio gets `object-fit`-cropped and the composition is destroyed. Brief the owner **before** the shoot: hero `4:5` 1400×1750 · kitchen `3:4` 900×1200 · hands `9:7` 900×700 · branch spread `3:2` · `og` 1200×630 per route. On the ink band the frame recolours automatically (`linear-gradient(135deg,#2c2622,#3a332c)`, `box-shadow:inset 0 0 0 1px #453d35`, spec text `var(--fg-subtle)` = 6.49:1).

**Owner phone photos — normalise at export, never in CSS.** CSS filters cost a compositing pass per image, break in print, and were amplified by the old high-contrast filter. Bake it into the file:

```bash
magick in.jpg -auto-orient -resize 1400x1750^ -gravity center -extent 1400x1750 \
  -modulate 100,92 -level 2%,98% -unsharp 0x0.75+0.6+0.008 out.jpg
cwebp -q 82 out.jpg -o out.webp      # plus AVIF at 480/800/1200/1600
```

Hold saturation ~8% back so nothing out-shouts `#b0392a`; lift pure black toward `#1e1a17`; no vignette, no clarity/HDR; every file under ~300 KB. Art direction for the owner: window light from the side, flash off, HDR off, no filter, no in-app "food" preset; plate height or 30–45° above — never overhead flat-lay, the most stock-coded food angle there is; **one dish in focus, not a buffet spread** (a spread photographs as a wedding-hall banner, one plate photographs as a restaurant); include a hand, an arm, a towel or flour on the counter — the mess is the proof.

**Delete the SVG stand-ins** (`client/src/assets/images/**/*.svg`, 12 files). Vector illustration standing in for photography reads as "template not yet filled in", which is worse than an honest empty frame — and none of them are even emitted by the production build (`dist/public/assets` contains only hashed JS and CSS, so all 20 image references currently **404 in production**).

`sizes` is authored **per layout slot**, never globally: hero full-bleed `sizes="100vw"`; the three-up branch grid `sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 33vw"`. A wrong `sizes` is the most common cause of a 1600w download onto a 390px phone and is invisible in a desktop Lighthouse run.

### 7.12 Header

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

Mobile drawer: **use the Radix `Sheet`/`Dialog` already in the repo**, not the hand-rolled `translate-x-full` panel at `header.tsx:83-141`. That panel stays mounted and focusable when "closed" — every nav item remains in the tab order — and the hamburger at `header.tsx:77` and close at `:94` are icon-only with **no accessible name at all**, so on mobile a screen-reader user hits a dead end at the only route to navigation. **The primary CTA goes at the TOP of the drawer**, not below six nav items outside thumb reach.

### 7.13 Footer / colophon

`background:var(--ink)`, body `#a89d90` (6.49:1), headings `--paper`, column labels `Assistant 600 --fs-2xs` with `.09em` tracking. `border-top:1px solid #332c26` on the legal strip. The footer's ink does **not** count against the one-ink-band-per-route rule (L-6).

Three links must be live `wouter <Link>` — `/privacy`, `/terms`, `/accessibility`. They are currently `href="#"` (`footer.tsx:80-82`) while the routes exist in `App.tsx:21-23`, which makes the accessibility statement unreachable — a compliance failure on its own and a straight 2.4.4 failure. All 14 `href="#"` in that file are dead; the two social icons are deleted until real URLs exist rather than aimed at `#`.

### 7.14 Production sheet (`מי מבשל, ואיפה`)

Three columns in a `gap:1px` grid on `--bg-alt`, each a hairline table of rows: `כתובת` / `שעות המטבח` / `מי מנהל` / `איסוף עצמי` / `אזור חלוקה` / `קיבולת ליום`. `.num` throughout. Phone in local display form, E.164 in the `href`. Ranges in connector form, never en-dash. Each column ends with its own WhatsApp button whose prefill names that kitchen.

A column whose chef-name Slot is empty collapses to a shorter honest column rather than rendering an anonymous cell (L-3). Below 640px the three columns stack; each becomes the `<dl>` form from §7.8.

### 7.15 `<Slot>` — the honesty mechanism

```tsx
interface SlotProps {
  id: string;                        // 'FAQ_KOSHER', 'MIN_GUESTS', 'ADDR_HERZLIYA'
  children?: React.ReactNode;        // the filled value, if any
  prune?: 'clause'|'row'|'cell'|'section';   // default 'clause'
}
```

- **dev** (`import.meta.env.DEV`): renders `background:var(--slot-bg); box-shadow:0 0 0 1px var(--slot-ring); padding:0 .3em; border-radius:2px` with the token name visible. On the ink band the highlight recolours to `#4a3c1f`/`#6d5a2e` so slots stay visible.
- **production, filled:** renders the value with no decoration.
- **production, unfilled:** renders `null` **and prunes the smallest containing unit** — clause, then row, then cell, then section. Never a plausible default. Never an empty highlighted box.

Clause-level pruning is the default because it is strictly better than section-level collapse. The hero note line is the canonical example:

```
תשובה תוך {{RESPONSE_TIME}} · מ־25 ועד {{MAX_GUESTS}} סועדים · שלושה מטבחים
```

Each unfilled token removes **only its own clause and its own separator**, so the line degrades to `שלושה מטבחים` rather than disappearing or showing a gap. `<SlotGroup>` wraps the line and re-joins surviving clauses with ` · `.

A section whose every Slot is empty does not render — heading included. The empty state is a shorter honest page, never a placeholder. Wire the dev/prod switch to the same env flag as the reference's `body.live` class.

### 7.16 `<Fact>` — the Caption Law applied to numerals

```tsx
<Fact value="3" unit="מטבחים" source="כתובות בסעיף 04" href="#kitchens" />
```

Renders the value in `.num` (FRL 500, `tnum`) with a visible source label at `--fs-2xs` / `--fg-subtle`. Every figure on the site either cites where it can be checked or does not render. This is what gives the tabular-figure discipline a semantic reason to exist rather than a typographic one, and it is why the trust bar has **no count-up animation** — banned twice over, as attention-seeking motion and because it dramatises numbers we cannot yet stand behind.

Trust bar form: four cells divided by `border-inline-start:1px solid var(--rule)` on a `--bg-alt` band with `border-block`, numbers in FRL 500 at `clamp(1.5rem,1.2rem + 1vw,2.05rem)`, labels `--fs-xs` `--fg-subtle`, collapsing to 2×2 at 680px with the odd cells' inline border removed. Of the four reference values only `3 מסעדות פעילות` is a fact we hold; the bar renders with two or three cells rather than showing an unverified number.

### 7.17 Quote-builder chrome

```
.calc        background:var(--bg); border:1px solid var(--rule);
             border-radius:var(--r); padding:var(--pad-form)
.calc__bar   height:2px; background:var(--rule); border-radius:var(--r-pill); overflow:hidden
.calc__bar i display:block; height:100%; background:var(--accent);
             transition:width .3s var(--ease);
             /* RTL: the fill must grow from the INLINE-START edge. Use a flex/grid
                child sized by width, NOT transform:scaleX — a left-filling bar reads
                as regressing in Hebrew. Verify visually at 2/4 and 3/4. */
.calc__count font:600 var(--fs-3xs) var(--sans); letter-spacing:.09em; color:var(--fg-subtle)
             /* "שאלה 2 מתוך 4" — discrete steps, never a percentage */
legend       font-family:var(--serif); font-size:var(--fs-xl); font-weight:500
.est         background:var(--bg-alt); border:1px solid var(--rule);
             border-radius:var(--r); padding:1.3rem 1.4rem
.est__val    class="num"; font-size:clamp(1.5rem,1.25rem + 1vw,2rem); font-weight:500
.est__note   font-size:var(--fs-xs); color:var(--fg-subtle)
             /* SAME type size as the number it qualifies — a grey 11px footnote under a
                4xl bold ₪ figure is exactly the pattern that fails the reasonable-consumer
                test. And .est renders null when the price Slots are empty. */
.hp          position:absolute; inset-inline-start:-9999px   /* honeypot */
```

`.calc__count` uses `aria-live="polite"`. Progress is announced as `שאלה 2 מתוך 4`, never a percentage.

### 7.18 Brief card / confirmation view

`background:var(--bg-alt)`, `border-top:var(--bw-rule) solid var(--ink)`, rows as `<dl>` at `--fs-sm`, the reference code in `.num` at `--fs-lg`. Set as a **menu card, not an invoice** — a document that looks like a quote invites price negotiation; a document that looks like a menu invites approval. Body capped at `--measure-confirm`. Printable via the §5 `@media print` block: grain off, nav and sticky bar hidden, `break-inside:avoid` on rows, `print-color-adjust:exact` so the hairlines survive.

### 7.19 Icons

**Six lucide glyphs maximum, plus four hand-authored brand SVGs.** Delete the Font Awesome cdnjs `<link>` (`client/index.html:37-43`): 102,025 B of render-blocking CSS + 150,124 B `fa-solid-900.woff2` + 108,020 B `fa-brands-400.woff2` ≈ **280 KB from a third-party origin behind a 4-hop chain, for 41 distinct classes** — versus lucide at ~190 B gzip per icon (35 icons measured at 25,363 B raw / 6,602 B gzip). If cdnjs is blocked by a content blocker or a corporate proxy, the mobile hamburger renders as an empty ghost button and the WhatsApp and phone CTAs lose their glyphs.

Permitted: `phone`, `chevron-down`, `check`, `x`, `map-pin`, `arrow-left`/`arrow-right` (mirrored). Brand marks (`whatsapp`, `instagram`, `facebook`, `google`) are hand-authored inline SVGs (~500 B each) in one `brand-icons.tsx` — lucide has no brand set, and **do not** add `react-icons` (already an unused dependency; delete it).

**Zero icons inside headings. Zero decorative icons at all.** Every icon gets `aria-hidden="true" focusable="false"`; every icon-only control gets an `aria-label`. Prefer inline SVG over an icon font: icon fonts also break when a user forces their own font, and they announce as junk glyphs.

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
- **No carousel, no auto-rotating headline, no count-up.** The hero's 5s image crossfade triples LCP byte cost and makes LCP non-deterministic (each opacity swap can register a new LCP candidate, so p75 becomes a function of how long the user stares). The 4s slogan rotation is four defects at once: it puts mutating text inside `<h1>` so the strongest SEO signal is non-deterministic per crawl; it re-announces to screen readers every 4s with no `aria-live` control and no pause affordance (**2.2.2 failure**); each slogan is a different length so the `h1` reflows and shifts everything below it; and it dilutes the one message that converts.
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

`DirectionProvider` appears **nowhere** in `client/src`. Radix primitives read direction from their own `dir` prop or from `DirectionProvider` context — they do **not** read `document.dir` or `<html dir="rtl">`, and default to `ltr`. So arrow-key navigation and positioning logic in Select, DropdownMenu, ContextMenu, Menubar, NavigationMenu, Tabs, ToggleGroup and (worst) Slider all operate LTR while the page is RTL.

```tsx
// client/src/App.tsx
import { DirectionProvider } from '@radix-ui/react-direction';
<DirectionProvider dir="rtl">{/* app */}</DirectionProvider>
```

Land this **in the same commit** as the §9.1 revert of the hand-flipped `left-*` close buttons, or they double-flip.

### 9.4 Physical-only CSS properties — the residual trap

`transform: translateX()`, `box-shadow` x-offset, `background-position: left/right` (Tailwind `bg-left`/`bg-right`), `clip-path: polygon()` percentages, `text-shadow` x-offset, and `@keyframes` using `translateX` are all physical and ignore `dir`.

Use the direction sign token: `:root{--dir:1}` / `[dir="rtl"]{--dir:-1}` (§5), then `transform: translateX(calc(var(--dir) * -100px))`.

Live instances: `@keyframes slideRight{transform:translateX(-100px)}` animates in from the *end* side in RTL; `.organic-shape`, `.diagonal-section`, `.wave-shape` put the cut on the same physical side regardless of direction; `.text-shadow-warm{text-shadow:2px 2px 4px}` casts to the physical right. All four are deleted (§11). Prefer vertical-only shadows for the paper aesthetic anyway.

### 9.5 Mixed LTR content

- **Mark Latin runs:** `<span lang="en">WhatsApp</span>`, `<span lang="en">WCAG 2.1</span>`. 3.1.2 Language of Parts is AA and is the single most commonly missed criterion on Hebrew sites — an unmarked Latin run is mispronounced by a Hebrew screen-reader voice.
- **Inputs:** `dir="ltr"` + `text-end` + the placeholder rule from §5 (§7.2).
- **Ranges and signed numbers:** `<Ltr>` (§4.9).
- **`scrollLeft` runs 0 → negative** in RTL as you scroll toward the end, in all current browsers. Any custom scroll-progress maths must use `Math.abs()`.
- **Embla carousel** needs `direction:'rtl'` in its options and its key handler swapped (`ArrowRight → scrollPrev`, `ArrowLeft → scrollNext`) — `ui/carousel.tsx:59` passes no direction and hardcodes LTR semantics at `:86`. If the gallery ships without a carousel (it should), delete the file instead.

---

## 10. Accessibility, baked into the system

Not a statement page. These are merge gates, and they land in shared code **before** the second landing page ships — otherwise page 6 reintroduces every defect fixed on page 1 and the audit surface multiplies by the route count.

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

Plus `scroll-margin-top: 88px` on every in-page anchor target — the fixed header currently covers the heading a user just jumped to.

### 10.3 Dialogs and drawers — the always-mounted-and-focusable bug

Two places ship the same defect. `ui/accessibility-toolbar.tsx:102-123` renders `role="dialog" aria-modal="true"` **unconditionally** and only moves the panel with an inline `transform: translateX(320px)` — so its ~8 buttons stay in the tab order permanently, and the permanent `aria-modal` can make assistive tech treat the rest of the page as inert. `layout/header.tsx:83-141` repeats it with `translate-x-full`.

Fix pattern for every drawer/dialog on every route: **conditionally render, or keep mounted with `inert` + `hidden` when closed**; set `aria-modal` only while open; move focus into the panel on open; trap Tab inside it; close on Escape; return focus to the trigger; put `aria-expanded` on the trigger. **Prefer the Radix `Dialog`/`Sheet` already in the repo** — they do all of this — over any hand-rolled drawer.

### 10.4 The accessibility toolbar is deleted, not repaired

Overlays do not produce conformance: they address only ~30–40% of WCAG criteria, the US FTC fined accessiBe $1M in April 2025 for misrepresenting that its widget makes sites WCAG-compliant, and 22.6% of H1-2025 US web-accessibility suits targeted sites that had an overlay installed. Nothing this widget does maps to a ת"י 5568 criterion — the standard requires the *delivered page* to meet contrast, focus, name/role/value and reflow.

It is also net-**negative**, not neutral:

- `use-accessibility.tsx:67-82` injects `html{filter:invert(1) hue-rotate(180deg)}`, which turns every food photograph into a negative — on a catering site that destroys the only persuasive content — makes `html` a containing block so `position:fixed` descendants reposition, and kills `backdrop-filter`. The `!important` patch at `index.css:87-98` exists solely to paper over that; it is proof the approach is unsound and must not be ported forward.
- `.high-contrast{filter:contrast(150%) brightness(120%)}` mathematically *reduces* contrast for the dominant pairing (§2.4), while `use-accessibility.tsx:46-49` simultaneously sets CSS variables — two conflicting mechanisms fighting each other, and only components using the variables respond at all.
- `use-accessibility.tsx:36,149` writes `document.documentElement.style.fontSize` in percent and persists it, **overriding the browser's own font-size preference**: a low-vision user who set their browser default to 150% is forcibly reset to 100% on arrival. WCAG 1.4.4 is satisfied by the page surviving native zoom, not by a bespoke control. Never set an absolute root font-size; leave `html` at the UA default and size everything in `rem`.
- Its open button has both `onClick` and an `onMouseDown` calling `preventDefault()` then the same handler (`:56-61`), so a mouse click toggles twice and the `preventDefault` suppresses focus on the button; its toggles convey state only via a visual checkmark with no `aria-pressed`; there is no Escape handler; and five `console.log` calls ship to production (`:20,24,28,33-36`, line 20 on every render).

Replacement: the base remediation in this document, plus a single `data-contrast="high"` token override (§2.4) exposed as one honest control if the owner wants it. **Frame the deletion as inseparable from the contrast/focus/form fixes and land them in the same change** — removing the widget alone reduces the *appearance* of compliance while leaving exposure unchanged, and the owner will read it as a regression.

### 10.5 Contrast, verified

Every pair in §2.1 is measured and labelled. The three structural fixes: `--ink-3` raised from 3.85:1 to 5.44:1; `--line-strong` introduced at 3.69:1 for control boundaries; `--wa` darkened to give 5.42:1 with white text. **Selection, state and meaning are never conveyed by colour alone** — the radio-card checked state is a full inversion, errors carry an icon + text + `aria-invalid`, and the FAQ chevron rotates.

### 10.6 Target sizes

Minimum **44×44 CSS px** for every interactive control (WCAG 2.5.5 / iOS HIG). Absolute floor 24×24 with adequate spacing (2.5.8 AA), used nowhere in this system. Delivered by: buttons `min-height:48px`; `.btn--sm` 44px; inputs 48px; radio-card spans 48px; accordion triggers 56px; sticky-bar links 48px; the checkbox input is 1.15rem but its label carries `padding-block` to reach 44px.

### 10.7 Zoom and reflow — a merge gate

**200% zoom and a 320px CSS viewport with no horizontal scrolling** are checked on every route before merge (1.4.4, 1.4.10). Wide content — tables, the production sheet, code — scrolls inside its own `overflow-x:auto` container; the page body never scrolls sideways.

Fixed dimensions that trap text when text scales are banned: `h-64` image tiles (`gallery.tsx:53`), `w-80` drawer (`header.tsx:86`), `max-height:500px` collapsibles (`index.css:225-228` — use grid rows or unmount), and decorative `clip-path` on any box containing text (`.organic-shape`, `.diagonal-section` cut 15% off section edges and are disabled only below 768px, which means **the mobile layout is the honest one and desktop is the costume**).

### 10.8 Screen-reader hygiene

- Inactive carousel slides get `hidden`/`aria-hidden`, not just `opacity-0`. All three hero slides currently stay in the DOM with only opacity toggled (`hero.tsx:52-60`), so a screen reader announces all three alt texts as page content. (Moot once the carousel is deleted.)
- Anything revealed on hover must also reveal on `:focus-within` and satisfy 1.4.13. Gallery overlay titles are `opacity-0 group-hover:opacity-100` (`gallery.tsx:54-59`) — always announced, never reachable by keyboard.
- `aria-hidden="true" focusable="false"` on every decorative glyph. 61 decorative Font Awesome `<i>` elements currently carry none.
- `aria-label` on every icon-only control. The hamburger (`header.tsx:77`) and close (`header.tsx:94`) have **no accessible name at all** — 4.1.2, and the most severe defect in the codebase because on mobile the hamburger is the only route to navigation.

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
7. `autocomplete` per §7.2.

**House error strings** (short, specific, second person, never blaming):

| Case | String |
|---|---|
| missing name | `צריך שם, כדי שנדע למי לחזור.` |
| bad phone | `המספר לא נראה תקין — בדקו שוב.` |
| missing event type | `בחרו סוג אירוע כדי להמשיך.` |
| missing guest band | `בחרו טווח סועדים — אפשר לשנות אחר כך.` |
| missing area | `בחרו אזור, כדי שנדע איזה מטבח מבשל.` |
| submit failed | `השליחה לא עברה. נסו שוב, או פשוט התקשרו — {{PHONE}}.` |

The submit-failure message renders as a **persistent inline `role="alert"` beside the submit button**, in addition to any toast, and **the user's entered values are preserved**. The success path is a confirmation **view**, not a toast + `form.reset()` — resetting returns the buyer to an empty form holding nothing they can show anyone (§7.18).

Phone normalisation is server-side (strip everything except digits and a leading `+`, then shape-check) — the current regex rejects real input including `+972-054-1234567`, parenthesised forms, and, critically in an RTL page, pasted numbers carrying directional marks (U+200E/U+200F) or non-breaking spaces.

### 10.10 The accessibility statement is content, not system

Covered by `05-*`. Two notes that bind this document: the current statement claims `4.5:1` minimum contrast, full keyboard operability, and regular NVDA/JAWS/VoiceOver + axe/WAVE audits — all false today, and a false statement is a formal declaration a plaintiff can use as an admission of the standard the business set for itself. And the footer link to it is `href="#"`, so it is unreachable — fix in §7.13. Add **axe-core to CI now**, while the base is being fixed, so new landing pages cannot regress.

---

## 11. DELETE list — file by file

Nothing in §5–§10 may be built until this list is empty. Land it as its own commit (or two: honesty deletions first, then tokens).

### 11.1 `client/src/index.css` — delete by line

| Lines | What | Why |
|---|---|---|
| 28–35 | `--golden`, `--dark-golden`, `--saddle-brown`, `--wine-red`, `--cream`, `--warm-white`, `--dark-brown`, `--cornsilk` | 2.25:1; the glitzy direction the client rejected |
| 38–59 | the entire `.dark` block | no theme provider exists; 2 `dark:` usages site-wide; its `--primary` is still the failing gold |
| 76–109 | the `!important` accessibility-exemption and fixed-position patches | exist only to paper over the `filter`-based toolbar (§10.4) |
| 113–128 | the 8 gold/brown/wine/cornsilk colour utilities | 149 call sites, all replaced |
| 130–140 | `.organic-shape`, `.diagonal-section`, `.wave-shape` | loudest "template" signal; physical `clip-path`; already self-disabled below 768px |
| 142–144 | `.hero-gradient` | three-stop brown/gold/wine diagonal |
| 146–150 | `.glass-effect` | 14 files; expensive `backdrop-filter` on large panels on mid-tier GPUs |
| 152–154 | `.text-shadow-warm` | text shadow banned; casts to the physical right |
| 156–163 | `.hover-lift` | `translateY(-10px)` + 40px shadow |
| 165–187 | `.animate-float`, `.animate-bounce-gentle`, `.animate-pulse-slow` (+ `slide-up`, `slide-right`, `fade-in`) | infinite animations; physical `translateX` |
| 196–219 | `@keyframes float`, `slideUp`, `slideRight`, `fadeIn`, `bounceGentle` | orphaned by the above |
| 221–223 | `.high-contrast{filter:…}` | reduces contrast; breaks hairlines, `backdrop-filter`, `position:fixed` (§2.4) |
| 225–234 | `.menu-item-expanded{max-height:500px}` / `.menu-item-collapsed` | silently truncates the 12-item main-dishes category on mobile |
| 236–243 | `.accessibility-toolbar` transform rules | overridden by the inline transform at `accessibility-toolbar.tsx:110`; `.open` is never applied by any code |
| 72 | `'Rubik'` in the body font stack | never loaded |
| 66–68 | unconditional `scroll-behavior:smooth` | must be inside `prefers-reduced-motion: no-preference` |

Replace the whole file with §5.

### 11.2 `tailwind.config.ts`

Delete `darkMode:["class"]`; the `chart-*` and `sidebar-*` colour groups (tokens never defined); `require("@tailwindcss/typography")`; `require("tailwindcss-animate")` (same commit as §11.3). Replace with §6.

### 11.3 Components and pages

**Delete entirely (11 files + 35 dead `ui/*`):**

`pages/home-simple.tsx` (unrouted, second `Home` export, asserts kosher) · `pages/blog-post.tsx` (per-id hardcoded JSX + fabricated customer story + `italic` + `prose max-w-none`) · `sections/testimonials.tsx` (3 fabricated named people, `Google 4.9/5 · 247 ביקורות`, `Facebook 4.8/5 · 189`, `אלפי לקוחות מרוצים`, decorative 5-star rows for quotes that carried no rating) · `sections/blog.tsx` (also contains ARABIC LETTER AIN U+0639 at `:13`) · `sections/price-calculator.tsx` (entirely invented ₪ table; also the single heaviest section — its Radix Select + Checkbox are ~32.5 KB gzip) · `sections/gallery.tsx` (a CTA that lies: "more images in the full gallery" scrolls to the top) · `data/blog-data.ts` · `data/gallery-data.ts` · `lib/queryClient.ts` · `hooks/use-mobile.tsx` · `client/src/assets/images/**/*.svg` (12 files) · the 35 unreferenced `ui/*.tsx` (4,022 LOC; CSS −7,344 B gzip, JS 0 B).

**Retain in `ui/`:** `button`, `input`, `label`, `textarea`, `card`, `accordion`, `form` (rewire per §10.9). Everything else goes. The 12 files using `animate-in`/`animate-out` (`select`, `dialog`, `sheet`, `popover`, `toast`, `tooltip`, `dropdown-menu`, `context-menu`, `menubar`, `navigation-menu`, `hover-card`, `alert-dialog`) leave with `tailwindcss-animate` — except `dialog`/`sheet`, which §7.12 and §10.3 keep for the mobile drawer and which then need their `animate-*` classes rewritten to this config's own keyframes.

**`sections/hero.tsx` — a rewrite, not an edit. Delete:**

| Lines | What |
|---|---|
| 5–18, 32–36, 50–61 | the 3-image crossfade carousel on a 5000ms interval (and its runtime `/src/assets/...` URLs, which 404 in production) |
| 20–25, 37–40, 78–80 | the 4-slogan rotation on a 4000ms interval — including `'כשר, ביתי, וטעים מהלב'` at `:24` |
| 63 | `.hero-gradient` overlay |
| 66–73 | the `כשר בד"ץ` badge (glass-effect pill wrapped in `animate-bounce-gentle`) |
| 76 | `text-shadow-warm` on the `h1` |
| 84 | `קייטרינג כשר וביתי` + `ניחוחות משכרים` in the lede |
| 89–114 | three equal-weight `rounded-full hover-lift` CTAs (order / call / WhatsApp) — reduce to one filled primary + one ghost + a phone text link |
| 101, 110 | placeholder `tel:052-1234567` and `wa.me/972521234567` |
| 118–124 | floating `fa-heart` and `fa-star` at `opacity-20` with `animate-float` |
| 126–134 | the `animate-bounce-gentle` scroll chevron |

Replacement: fixed three-line `h1` (FRL 500, `--fs-4xl`, `--lh-display`), a static lede naming the three cities, one `4:5` `<Photo>` in a `1.08fr/0.92fr` grid collapsing to one column with the photo ordered first at 860px, and the self-pruning fact line (§7.15).

**Per-file deletions elsewhere:**

- `layout/footer.tsx` — `:12` `25 שנות ניסיון ואלפי לקוחות מרוצים`; `:68` `כשר בד"ץ מהדרין`; `:15,18` social `href="#"`; `:30-35` six dead service links; `:46` dead testimonials link; `:77` hardcoded `2024`; wire `:80-82` to the real routes.
- `sections/story.tsx` — `:24` `כשרות מהודרת של בד"ץ מהדרין`; `:34-53` the fabricated 1995/2005/2020 timeline + "leading caterer in the region"; `:67-74` `25+ שנות ניסיון` and `10,000+ לקוחות מרוצים`; `:61` the runtime SVG path.
- `sections/events.tsx` — `:9,16,23,30` `החל מ-₪120/₪110/₪85/₪65/₪95` (also ASCII hyphen where a maqaf belongs); `:22,47` kosher + `הקסם והאווירה`; `:55` the `w-20 h-20 rounded-full` icon medallion.
- `sections/menu.tsx` — `:15` gradient-dark band; `:42-44` `max-height:0` collapse that keeps all 27 items in the tab order; `:55` `₪{price}` symbol-first.
- `sections/contact.tsx` — `:14` the `@shared/schema` import (drizzle in the browser: **−45,481 B raw / −13,234 B gzip**, and it publishes your Postgres table and column names in a public JS file); `:230-233` the four invented budget brackets with bidi-reversed ranges; `:252` the `אלרגיות` placeholder (solicits medical data and reclassifies the lead table as a health database); `:283` `תוך 24 שעות`; `:302` `זמינים 24/7`; `:377` the unsubstantiated `נגיש לנכים`.
- `sections/faq.tsx` — keep the shell, rewrite as Radix Accordion; `data/faq-data.ts:21-29` (invented `בד"ץ מהדרין מהרב הראשי לישראל`), `:12` (`24/7` + ARABIC YEH U+064A / NOON U+0646 inside the word for catering), `:34-49` (~14 invented service cities + free delivery), `:54-61` (invented allergen protocol), `:66-72` (invented cancellation ladder that contradicts `terms.tsx:77-79`).
- `ui/accessibility-toolbar.tsx` + `hooks/use-accessibility.tsx` — delete both (§10.4).
- `ui/back-to-top.tsx` — delete `bg-golden` and `rounded-full`; keep the control.
- `hooks/use-scroll.tsx` — split into a stateless `scrollToSection` helper and a separate `useScrolledPast(threshold)`. Seven components subscribe and five never read `scrollY`, so the hero re-renders on every scroll pixel (~14 setState + 7 root re-renders per frame).
- `hooks/use-toast.ts:8-9` — `TOAST_REMOVE_DELAY: 1000000` (16.7 minutes) → `5000`.
- `client/index.html:37-43` — the Font Awesome cdnjs `<link>`; `:28-31` the Google Fonts `<link>` and both `preconnect`s (self-host per §4.2).
- `package.json` — `@tailwindcss/typography`, `tailwindcss-animate`, `framer-motion`, `react-icons`, `next-themes`, `date-fns`, `@tanstack/react-query` (~18.4 KB gzip for one POST), `tailwind-merge` (20,328 B raw / 6,817 B gzip chunk for a `cn()` no retained component needs conflict-resolution from — keep `clsx`), `recharts`, `embla-carousel-react`, `cmdk`, `vaul`, `react-day-picker`, `input-otp`, `react-resizable-panels`, `tw-animate-css`, `@tailwindcss/vite` (v4, conflicting with the v3 config), plus the five auth/session packages that no code imports (`passport`, `passport-local`, `express-session`, `connect-pg-simple`, `memorystore`) and ~22 unused `@radix-ui/*`. **Add** `nanoid` — `server/vite.ts:7` imports it and it resolves only as a transitive dependency, so any `npm prune` or lockfile regeneration breaks the dev server.
- `vite.config.ts` — add `esbuild:{ drop:['console','debugger'] }` so the seven production `console.log`s cannot recur.

**Also delete the runtime string image paths.** 20 references use literal `/src/assets/images/...` as runtime URLs (`hero.tsx:7,11,15`; `story.tsx:61`; `gallery-data.ts:13-53`; `blog-data.ts:20-40`) and `dist/public/` contains **zero image files** — every image on the site 404s in production today, so no LCP or CLS measurement against the current build is meaningful. Import assets through Vite (so they are content-hashed and the 1-year immutable cache header is safe) or serve owner photos from `client/public/img/` with a version query.

---

## 12. CI gates — the system will not survive three months without them

Restraint degrades faster than decoration under later edits: one added drop shadow, pill button or gold highlight reads as a mistake precisely because everything else is disciplined. Ship the bans as machine-checkable gates in the same commit as the tokens.

```bash
#!/usr/bin/env bash
# scripts/check-design-system.sh — exits non-zero on any hit
set -u; fail=0
g(){ if rg -n --glob '!**/node_modules/**' "$2" $3 >/dev/tty 2>&1; then echo "✗ $1"; fail=1; fi }

# ── palette ────────────────────────────────────────────────────────────
g "gold palette resurrected"        'golden|hsl\(43,\s*7[45]%|#d9a520|saddle-brown|wine-red|cornsilk|dark-brown' 'client/src'
g "--ink-4 used as text colour"     'text-ink-4|color:\s*var\(--ink-4\)'                                          'client/src'
g "--line on an interactive border" 'border-line(?!-strong).*(input|textarea|select|opts)'                         'client/src'

# ── elevation, radius, motion ──────────────────────────────────────────
g "box-shadow outside the allowlist" 'shadow-(sm|md|lg|xl|2xl)|box-shadow:\s*(?!none|var\(--shadow-sticky\)|var\(--ring-inset\)|var\(--rule-double\)|inset)' 'client/src'
g "pill radius outside .tag"         'rounded-full|rounded-2xl|rounded-3xl'                                        'client/src'
g "infinite animation"               'iteration-count:\s*infinite|animation:[^;]*\binfinite\b'                     'client/src'
g "framer-motion"                    "from ['\"]framer-motion"                                                     'client/src'

# ── RTL ────────────────────────────────────────────────────────────────
g "physical direction utility"       '\b(ml|mr|pl|pr)-|\b(left|right)-[0-9]|text-left|text-right|space-x-|divide-x-|border-l\b|border-r\b|rounded-l|rounded-r|float-(left|right)' 'client/src'
g "bidi-reversing numeric range"     '\d\s*[–—]\s*\d'                                                              'client/src'
g "Arabic-script char in Hebrew"     '[\x{0600}-\x{06FF}]'                                                         'client/src'
g "synthesised Hebrew oblique"       '\bitalic\b'                                                                  'client/src'
g "uppercase on Hebrew"              'text-transform:\s*uppercase|\buppercase\b'                                   'client/src'

# ── icons, fonts, third parties ────────────────────────────────────────
g "Font Awesome"                     'fa[sbr]?\s+fa-|font-awesome|cdnjs\.cloudflare'                               'client'
g "third-party font host"            'fonts\.(googleapis|gstatic)\.com'                                            'client'

# ── honesty (mirrors 01 §0.1 / 02 §0) ──────────────────────────────────
g "kashrut / invented stats"         'בד"ץ|מהדרין|כשר|25 שנות|אלפי לקוחות|4\.9|4\.8|247 ביקורות|189 ביקורות'      'client/src'
g "hardcoded shekel figure"          '₪\s*[0-9]'                                                                   "client/src --glob '!client/src/config/**'"
g "banned emotional adjective"       'בלתי נשכח|חוויה קולינרית|קסום|מרגש|ניחוחות|מהלב|באהבה|עם חיוך|יוקרה'        'client/src'
g "banned CTA verb"                  'הזמינו עכשיו|הזמינו אירוע עכשיו'                                             'client/src'

# ── placeholders ───────────────────────────────────────────────────────
g "placeholder phone"                '052-?123-?4567|972521234567'                                                 'client/src'
g "unresolved template token"        '\{\{[A-Z_]+\}\}'                                                              'client/src'

exit $fail
```

Plus, as separate jobs:

- **`axe-core`** on every route in the sitemap, failing on any serious/critical violation.
- **`<Photo>` caption check** — an AST rule (or a typed required prop plus `tsc --noEmit` in CI, which is sufficient) asserting no `<Photo>` renders without `caption`.
- **One ink band per route** — `count(data-band="ink") === 1` in a render snapshot test.
- **Per-route byte budget**, failing the build (a budget that only warns is gone in two weeks): shell JS ≤45 KB gzip, CSS ≤8 KB total site-wide, fonts ≤14 KB, landing-route JS ≤14 KB, legal routes ≤4 KB.
- **200% zoom / 320px reflow** screenshot check on the home route and one inner route.
- **Bidi screenshot test** on the guest-band selector — the reversal is invisible in code review because `₪5,000 - ₪15,000` looks correct in the editor and only mirrors at render time.

---

## 13. Owner dependencies that block this system specifically

Everything in the aggregated owner list matters, but these are the ones that block **the design system** rather than the copy or the legal pages.

| # | Ask | Blocks |
|---|---|---|
| **O-1** | `hero.jpg` — 1400×1750 (4:5) vertical, one plated dish or the kitchen mid-service, window light, no flash, no filter | the single highest-impact asset; the LCP element on every route |
| **O-2** | `kitchen.jpg` — 900×1200 (3:4), a real kitchen in the morning, **with the branch named** | the ink band; pairs to the right city page |
| **O-3** | `hands.jpg` — 900×700 (9:7), hands mid-prep. Mess and flour are wanted, not faults | the about/provenance block |
| **O-4** | Branch spread — one `3:2` per kitchen (Herzliya Pituach / Raanana / Petah Tikva) | the one ink band; the Caption Law has nothing to caption without these |
| **O-5** | A photo of the owner and/or head chef, **face visible** | faces outrank food photos for trust; there is currently no image of any person in the repo |
| **O-6** | `og.jpg` — 1200×630 per route, business name legible | these links are forwarded on WhatsApp; a shared link showing the wrong branch undercuts the local claim |
| **O-7** | **Caption metadata captured at shoot time:** branch + street + what is happening + the hour | hour and action are unreconstructable afterwards and cost nothing to ask for in advance. Without them the Caption Law cannot be satisfied by any photo, however good |
| **O-8** | Photos at **original camera resolution** (≥2400px long edge), unedited and uncropped, one hero per landing route | the sharp pipeline, the srcset widths and the LCP preload cannot be built or measured against placeholder SVGs |
| **O-9** | Existing brand assets: logotype/wordmark file, real menu PDF, printed materials, signage photos | decides whether the wordmark is typeset in FRL 700 or an existing mark is reproduced |
| **O-10** | Is the brand ever set in Latin letters (`Mama Mia` / `Mamamia`) — in the logotype, an on-screen domain, or an English page? | whether the Latin subset ships at all. FRL's Latin subset alone is 44 KB |
| **O-11** | **Written approval of the paper-and-ink palette over the current gold, before the restyle lands** | the one decision that cannot be reversed cheaply later |
| **O-12** | Which branch is the flagship for photography, and whether all three kitchens may be photographed | shoot planning; determines whether the ink band can carry three real captions or degrades to one |
| **O-13** | A named chef or kitchen manager per branch, with consent to be named and photographed | the production sheet's `מי מנהל` row; the cheapest E-E-A-T lever available and the thing that breaks the category's anonymity |
| **O-14** | Whether prices will ever be displayed at all, and if so the figures and units | if no: the tabular-figure and shekel-glyph work scopes down to phone numbers and counts, and the menu ships as a chef's menu (§7.7) |
| **O-15** | Whether any vocalised Hebrew (niqqud) will appear — a blessing, a menu flourish, a religious-event page | niqqud needs a larger subset, ~0.2 more line-height, and a font whose mark positioning is tested |
| **O-16** | Whether a second language version is planned (English / Russian / Arabic) | Arabic changes the bidi and font work substantially; English promotes logical-property discipline from good practice to load-bearing |

---

## 14. Known weaknesses of this system, stated plainly

1. **It is photo-dependent by design, and that dependency sits outside the build team's control.** With no photographs the page ships as labelled empty frames and collapsed sections — honest, disciplined, and visibly unfinished, on a lead-generation site whose competitors all look complete. A brochure system degrades gracefully on stock imagery; this one does not. O-1 through O-8 are launch blockers with a date attached, not nice-to-haves. The `<Photo>` placeholder frame (§7.11) is the mitigation — it looks deliberate rather than broken — but it is a mitigation, not a substitute.

2. **The client may read paper-and-ink as "unfinished" or "not festive enough"** on first look, especially next to the gold-heavy competitor sites they will compare it against. Present it on a phone with at least one real photograph in the hero — the palette only reads as expensive once a photograph carries the colour. **Never present it as a swatch sheet.** And settle the section-padding scale in the same conversation as the palette: fluid `--pad-sec` and `em`-capped measures make the page noticeably longer on desktop, and if the client equates "shorter" with "better converting" that argument is cheaper to have once, before build.

3. **Restraint degrades faster than decoration under later edits.** One added shadow, pill or gold highlight reads as a mistake precisely because everything else is disciplined. §12 is not optional hygiene; it is the only thing that makes the system survive three months of other people's commits.

4. **Grain + `backdrop-filter` + a fixed sticky bar is three compositing layers on low-end Android.** Verify on a real mid-range device, not a throttled desktop. If paint cost shows up, drop `backdrop-filter` — not the grain.

5. **Removing `darkMode` and the `.dark` block, and deleting the toolbar, must be one coordinated change.** Any retained shadcn component assuming both themes exist will break, and the toolbar ties its invert feature to the same body-filter mechanism. Two independent commits produce a broken intermediate state.

6. **The `size-adjust` fallback value is deliberately unset** (§4.2). Until it is measured on real iOS/Android/Windows devices, a small residual font-swap shift remains. Shipping a guessed value would create CLS rather than remove it, so this is the correct trade — but it is an open item, not a solved one.

7. **Removing `italic` costs blockquotes and testimonial copy their conventional differentiator.** The replacement (FRL 500 at `--fs-lg` plus a 2px ink rule above) has to be designed deliberately, or quoted copy reads as ordinary body text — and the proof section, already stripped of fabricated names, loses what little visual identity it has.

8. **A 26em measure (~442px at 17px) is correct typographically but will read as unexpectedly narrow** to a client used to full-width Hebrew text. Present it with pixel numbers and a side-by-side comparison, or it gets overridden back to 900px lines.
