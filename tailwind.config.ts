import type { Config } from "tailwindcss";

/* ═══════════════════════════════════════════════════════════════
   מאמא מיה קייטרינג · Tailwind theme
   Normative source: docs/spec/04-visual-reference.md (overrides 03 §2–§6).

   Nothing in this file holds a literal colour. Every value resolves to
   a CSS custom property defined in client/src/index.css, so a component
   written against `bg-bg`, `text-fg-muted` or `border-rule-control`
   re-derives itself inside [data-band="cream"], inside [data-band="ink"]
   and under html[data-contrast="high"] with no band prop and no dark:
   variant. That indirection is the whole reason a palette this different
   from the last one lands without touching a single component.

   darkMode is absent on purpose. The site does not have a light theme
   and a dark theme; it has a dark GROUND and a cream BAND, and which one
   a section gets is an editorial decision (see the alternation policy in
   index.css), not the visitor's OS setting.
   ═══════════════════════════════════════════════════════════════ */

export default {
  content: ["./client/index.html", "./client/src/**/*.{js,jsx,ts,tsx}"],

  // Tailwind tree-shakes hand-written CSS inside @layer utilities exactly like
  // its own classes, so a house class that no component references yet — or one
  // composed at runtime (`sec--${variant}`) — is silently dropped from the
  // bundle. Pin the foundational classes so the system is always available.
  safelist: [
    "wrap", "sec", "sec--alt", "sec--tight",
    "num", "num-inline", "shekel", "nowrap",
    "eyebrow", "sec__num", "lede",
    "em", "em-track", "rule-top", "hairline",
    "skip", "icon-flip", "reveal", "is-in", "shake",
  ],

  theme: {
    extend: {
      // 04 §3 — Assistant only, weights 300–800, no serif pairing.
      // `serif` is retained as a strict ALIAS of the sans stack: 42 live
      // `font-serif` call sites would otherwise fall through to Georgia and
      // reintroduce the pairing the reference explicitly does not have.
      // Those call sites should migrate to a weight (`font-semibold`,
      // `font-bold`) — reported, not owned here.
      fontFamily: {
        sans: ["Assistant", '"Assistant Fallback"', "system-ui", '"Segoe UI"', "Arial", "sans-serif"],
        serif: ["Assistant", '"Assistant Fallback"', "system-ui", '"Segoe UI"', "Arial", "sans-serif"],
      },

      // 04 §3 — "restrained scale, 14–22px, no giant headings".
      // Body floor is 17px (Hebrew). The hero tops out at 44px where the
      // old scale reached 64px; every step below `2xl` now lives in the
      // reference's own 12–24px range.
      fontSize: {
        "3xs": ["var(--fs-3xs)", { lineHeight: "1.55" }], // 12
        "2xs": ["var(--fs-2xs)", { lineHeight: "1.4" }],  // 13
        xs: ["var(--fs-xs)", { lineHeight: "1.6" }],      // 14 → 14.5
        sm: ["var(--fs-sm)", { lineHeight: "1.55" }],     // 15 → 15.5
        base: ["var(--fs-base)", { lineHeight: "var(--lh-body)" }],  // 16.5 → 17
        md: ["var(--fs-md)", { lineHeight: "1.6" }],      // 18 → 19
        lg: ["var(--fs-lg)", { lineHeight: "var(--lh-sub)" }],       // 19 → 21
        xl: ["var(--fs-xl)", { lineHeight: "var(--lh-sub)" }],       // 21 → 24
        "2xl": ["var(--fs-2xl)", { lineHeight: "var(--lh-head)" }],  // 24 → 30
        "3xl": ["var(--fs-3xl)", { lineHeight: "var(--lh-display)" }], // 27 → 36
        "4xl": ["var(--fs-4xl)", { lineHeight: "var(--lh-display)" }], // 30 → 44
      },

      // 04 §3 lists 300–800. 300/400/600/700 are self-hosted; 800 is not on
      // disk yet, so `font-extrabold` would synthesise. Reported.
      fontWeight: {
        light: "300",
        normal: "400",
        medium: "500",
        semibold: "600",
        bold: "700",
        extrabold: "800",
      },

      lineHeight: {
        display: "var(--lh-display)",
        head: "var(--lh-head)",
        sub: "var(--lh-sub)",
        dish: "var(--lh-dish)",
        tight: "var(--lh-tight)",
        body: "var(--lh-body)",
        loose: "var(--lh-loose)",
      },

      // measure is in em, never ch: `ch` over-reports Hebrew by ~24%.
      maxWidth: {
        wrap: "var(--w)",
        body: "var(--measure-body)",
        lede: "var(--measure-lede)",
        answer: "var(--measure-answer)",
        dish: "var(--measure-dish)",
        caption: "var(--measure-caption)",
        confirm: "var(--measure-confirm)",
        measure: "var(--measure-max)",
      },

      colors: {
        /* ── SEMANTIC ROLES · prefer these in every new component ──
           These are the band-relative names. Measured ratios live beside
           the token definitions in index.css; the summary is:
             fg 17.38:1 dark / 16.60:1 cream
             fg-muted 11.44 / 11.07 · fg-subtle 7.05 / 5.70
             fg-decor 4.08 / 3.69 = NON-TEXT ONLY, `text-fg-decor` is banned
             accent 7.49 dark (#F39402) / 6.33 cream (#8A4E00)
             rule = decorative · rule-control = 1.4.11 boundaries        */
        bg: { DEFAULT: "var(--bg)", alt: "var(--bg-alt)", form: "var(--bg-form)" },
        fg: {
          DEFAULT: "var(--fg)",
          muted: "var(--fg-muted)",
          subtle: "var(--fg-subtle)",
          decor: "var(--fg-decor)", // NON-TEXT ONLY
        },
        accent: {
          // Always legal as TEXT on the band it lands in. That is the reason
          // for the split: `text-accent` (33 sites), `decoration-accent` (11)
          // and `border-accent` (7) must not have to know their band.
          DEFAULT: "var(--accent)",
          hover: "var(--accent-hover)",
          active: "var(--accent-active)",
          strong: "var(--accent-strong)",
          // The ONLY legal text colour on an amber fill. #ffffff on #F39402
          // is 2.32:1; unresolved, `text-accent-foreground` would inherit it.
          foreground: "var(--accent-foreground)",
          // 1.4.11 edge for a flat-amber control on a light ground, where the
          // fill itself is only 2.22:1 against cream. transparent on dark.
          edge: "var(--accent-edge)",
        },
        rule: { DEFAULT: "var(--rule)", control: "var(--rule-control)" },
        btn: { bg: "var(--btn-bg)", fg: "var(--btn-fg)" },
        focus: "var(--focus)",
        danger: "var(--danger)",
        ok: "var(--ok)",
        wa: { DEFAULT: "var(--wa)", dk: "var(--wa-hover)" },

        /* ── RAW PALETTE KEYS · kept resolvable, now band-relative ──
           `paper`, `ink`, `line`, `tomato`, `olive` are the names of the
           deleted paper system. Deleting the keys breaks ~30 live call
           sites in files owned by other agents, so every one is aliased
           onto the semantic role that means the same THING it used to:
             paper-3 was "the quote-builder surface"  → --bg-form
             ink-3   was "smallest legal text"        → --fg-subtle
             ink-4   was "non-text only"              → --fg-decor
           Aliasing rather than freezing a hex is what makes `bg-paper-3`
           correct on a dark band instead of a light box on a dark page.
           Nothing new may use these names.                              */
        paper: { DEFAULT: "var(--bg)", 2: "var(--bg-alt)", 3: "var(--bg-form)" },
        ink: {
          DEFAULT: "var(--fg)",
          2: "var(--fg-muted)",
          3: "var(--fg-subtle)",
          4: "var(--fg-decor)", // NON-TEXT ONLY
        },
        line: { DEFAULT: "var(--rule)", strong: "var(--rule-control)" },
        tomato: { DEFAULT: "var(--accent)", dk: "var(--accent-strong)" },
        olive: "var(--ok)",

        /* ── shadcn aliases, re-pointed at the real roles ────────── */
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: { DEFAULT: "var(--card)", foreground: "var(--card-foreground)" },
        popover: { DEFAULT: "var(--popover)", foreground: "var(--popover-foreground)" },
        primary: { DEFAULT: "var(--primary)", foreground: "var(--primary-foreground)" },
        secondary: { DEFAULT: "var(--secondary)", foreground: "var(--secondary-foreground)" },
        muted: { DEFAULT: "var(--muted)", foreground: "var(--muted-foreground)" },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",

        /* ── TRANSITIONAL ALIASES — delete with 03 §13.3 ────────────
           Names from the rejected first palette (gold, brown, wine,
           cornsilk). They exist ONLY so the remaining call sites in files
           owned by other agents keep resolving. Each maps to the role that
           preserves its former CONTRAST relationship, so all of them are
           AA in both bands and none reintroduces a dead hue.             */
        golden: "var(--fg)",              // was a 2.25:1 gold; now the inverted solid
        "dark-golden": "var(--accent)",   // preserves the hover delta, now amber
        "saddle-brown": "var(--fg-muted)",
        "wine-red": "var(--accent-strong)",
        cream: "var(--bg-alt)",           // surface, not the --cream hex
        "warm-white": "var(--bg)",
        "dark-brown": "var(--fg)",
        cornsilk: "var(--bg-form)",

        /* Referenced by ui/sidebar.tsx and ui/chart.tsx, both on the 03
           §13.3 delete list; re-pointed at real roles until the files go. */
        sidebar: {
          DEFAULT: "var(--bg-alt)",
          foreground: "var(--fg)",
          primary: "var(--accent)",
          "primary-foreground": "var(--accent-fg)",
          accent: "var(--bg-form)",
          "accent-foreground": "var(--fg)",
          border: "var(--rule)",
          ring: "var(--focus)",
        },
        chart: {
          "1": "var(--accent)",
          "2": "var(--fg)",
          "3": "var(--fg-muted)",
          "4": "var(--fg-subtle)",
          "5": "var(--ok)",
        },
      },

      // 04 §4 — 8px dominant, 12/16px on cards, 50px pills.
      // `rounded-full` keeps Tailwind's own 9999px; only these are overridden.
      borderRadius: {
        DEFAULT: "var(--r)",       //  8px
        sm: "6px",
        md: "var(--r)",            //  8px
        lg: "var(--r-card)",       // 12px
        xl: "var(--r-card-lg)",    // 16px
        "2xl": "var(--r-card-lg)", // 16px — the scale stops here
        card: "var(--r-card)",
        pill: "var(--r-pill)",     // 50px
      },
      borderWidth: { DEFAULT: "1px", rule: "2px", chev: "1.6px" },

      // 04 §4 — no heavy gradients, no glows. On a near-black ground depth
      // comes from the surface step and a hairline, not from a shadow.
      // sm/md/lg/xl/2xl are intentionally not defined.
      boxShadow: {
        none: "none",
        sticky: "var(--shadow-sticky)", // the sticky mobile CTA bar only
        inset: "var(--ring-inset)",     // photo-frame border substitute
        rule: "var(--rule-double)",     // the doubled hairline on a flagged card
      },

      spacing: {
        sec: "var(--pad-sec)",
        "sec-tight": "var(--pad-sec-tight)",
        gutter: "var(--pad-gutter)",
        head: "var(--gap-head)",
        grid: "var(--gap-grid)",
        col: "var(--gap-col)",
        course: "var(--gap-course)",
        card: "var(--pad-card)",
        form: "var(--pad-form)",
      },

      // one duration set, one easing curve.
      transitionDuration: { state: "180ms", slow: "220ms", reveal: "550ms" },
      transitionTimingFunction: { house: "cubic-bezier(.2,0,.2,1)" },

      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        shake: {
          "25%": { transform: "translateX(5px)" },
          "50%": { transform: "translateX(-4px)" },
          "75%": { transform: "translateX(2px)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 220ms cubic-bezier(.2,0,.2,1)",
        "accordion-up": "accordion-up 220ms cubic-bezier(.2,0,.2,1)",
        shake: "shake 300ms cubic-bezier(.2,0,.2,1)",
        // No float / bounce-gentle / pulse-slow. Zero infinite animations.
      },
    },
  },
  plugins: [
    // @tailwindcss/typography removed: 18.5 KB for one `prose` call site, and
    // it ships maxWidth 65ch (≈80 Hebrew chars) plus a sloped blockquote.
    //
    // tailwindcss-animate is RETAINED for now: twelve ui/* files still ship
    // animate-in / fade-in-0 / zoom-in-95 / slide-in-from-*. Drop this line in
    // the SAME commit as the 03 §13.3 ui/* deletions, not before.
    require("tailwindcss-animate"),
  ],
} satisfies Config;
