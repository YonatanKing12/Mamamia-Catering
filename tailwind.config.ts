import type { Config } from "tailwindcss";

/* ═══════════════════════════════════════════════════════════════
   מאמא מיה קייטרינג · Tailwind theme
   Normative source: docs/spec/03-design-system.md §6.

   Every value here resolves to a CSS custom property defined in
   client/src/index.css, so a component written against `bg-bg`,
   `text-fg-muted` or `border-rule-control` automatically re-derives
   itself inside [data-band="ink"] and under html[data-contrast="high"]
   with no band prop and no dark: variant.

   darkMode is removed: there is no dark theme (§2.4).
   ═══════════════════════════════════════════════════════════════ */

export default {
  content: ["./client/index.html", "./client/src/**/*.{js,jsx,ts,tsx}"],

  // Tailwind tree-shakes hand-written CSS inside @layer utilities exactly like
  // its own classes, so a house class that no component references yet — or one
  // composed at runtime (`sec--${variant}`) — is silently dropped from the
  // bundle. These are the foundational classes from index.css §5; pin them so
  // the system is always available to the components being written against it.
  safelist: [
    "wrap", "sec", "sec--alt", "sec--tight",
    "num", "num-inline", "shekel", "nowrap",
    "eyebrow", "sec__num", "lede",
    "em", "em-track", "rule-top", "hairline",
    "skip", "icon-flip", "reveal", "is-in", "shake",
  ],

  theme: {
    extend: {
      fontFamily: {
        serif: ['"Frank Ruhl Libre"', '"FRL Fallback"', "Georgia", "serif"],
        sans: ["Assistant", '"Assistant Fallback"', "system-ui", "Arial", "sans-serif"],
      },

      // §4.3 — Hebrew-calibrated fluid scale. Body floor is 17px, not 16px.
      fontSize: {
        "3xs": ["var(--fs-3xs)", { lineHeight: "1.55" }],
        "2xs": ["var(--fs-2xs)", { lineHeight: "1.4" }],
        xs: ["var(--fs-xs)", { lineHeight: "1.6" }],
        sm: ["var(--fs-sm)", { lineHeight: "1.5" }],
        base: ["var(--fs-base)", { lineHeight: "var(--lh-body)" }],
        md: ["var(--fs-md)", { lineHeight: "1.6" }],
        lg: ["var(--fs-lg)", { lineHeight: "var(--lh-sub)" }],
        xl: ["var(--fs-xl)", { lineHeight: "var(--lh-sub)" }],
        "2xl": ["var(--fs-2xl)", { lineHeight: "var(--lh-head)" }],
        "3xl": ["var(--fs-3xl)", { lineHeight: "var(--lh-display)" }],
        "4xl": ["var(--fs-4xl)", { lineHeight: "var(--lh-display)" }],
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

      // §4.5 — measure is in em, never ch: `ch` over-reports Hebrew by 24%.
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
        /* ── real tokens (§2.1) ───────────────────────────────
           paper/ink 16.31:1 · ink-2 8.87:1 · ink-3 5.44:1
           ink-4 3.85:1 = NON-TEXT ONLY, `text-ink-4` is banned by CI
           line 1.40:1 = decorative · line-strong 3.69:1 = 1.4.11 boundaries
           tomato 5.72:1 on paper, white-on-it 6.06:1
           NEVER tomato on ink (2.85:1) — the ink band re-derives it        */
        paper: { DEFAULT: "var(--paper)", 2: "var(--paper-2)", 3: "var(--paper-3)" },
        ink: {
          DEFAULT: "var(--ink)",
          2: "var(--ink-2)",
          3: "var(--ink-3)",
          4: "var(--ink-4)",
        },
        line: { DEFAULT: "var(--line)", strong: "var(--line-strong)" },
        tomato: { DEFAULT: "var(--tomato)", dk: "var(--tomato-dk)" },
        olive: "var(--olive)",
        danger: "var(--danger)",
        wa: { DEFAULT: "var(--wa)", dk: "var(--wa-dk)" },

        /* ── semantic roles — prefer these in components (§2.2) ── */
        bg: { DEFAULT: "var(--bg)", alt: "var(--bg-alt)", form: "var(--bg-form)" },
        fg: {
          DEFAULT: "var(--fg)",
          muted: "var(--fg-muted)",
          subtle: "var(--fg-subtle)",
          decor: "var(--fg-decor)", // NON-TEXT ONLY
        },
        accent: {
          DEFAULT: "var(--accent)",
          strong: "var(--accent-strong)",
          // kept beyond §6: 26 live `text-accent-foreground` call sites pair
          // with `bg-accent`. Unresolved it inherits ink on tomato = 2.85:1,
          // the one forbidden pair. #ffffff on --accent is 6.06:1.
          foreground: "var(--accent-foreground)",
        },
        rule: { DEFAULT: "var(--rule)", control: "var(--rule-control)" },
        btn: { bg: "var(--btn-bg)", fg: "var(--btn-fg)" },
        focus: "var(--focus)",

        /* ── shadcn aliases, re-pointed at the real tokens ────── */
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

        /* ── TRANSITIONAL ALIASES — delete with §13.3 ────────────
           The rejected palette (2.25:1 gold, brown, wine, cornsilk) is gone
           from index.css. These keys exist ONLY so the ~250 live call sites
           in files owned by other agents keep resolving to a legible colour
           until those files are rewritten. Every mapping below is AA in both
           directions; none of them reintroduces a hue from the old system.
           Nothing new may use these names — CI (§14) fails on them in
           client/src, which is exactly the pressure that retires this block. */
        "golden": "var(--ink)",           // was #d9a520 (2.25:1). fill+paper 16.31:1
        "dark-golden": "var(--tomato)",   // preserves the hover delta; 5.72 / 6.06:1
        "saddle-brown": "var(--ink-2)",   // 8.87:1 on paper, white-on-it 9.40:1
        "wine-red": "var(--tomato-dk)",   // 7.83:1 on paper, white-on-it 8.30:1
        "cream": "var(--paper-2)",        // surface; ink on it 14.97:1
        "warm-white": "var(--paper)",     // surface; ink on it 16.31:1
        "dark-brown": "var(--ink)",       // 16.31:1 on paper
        "cornsilk": "var(--paper-3)",     // surface; ink on it 13.59:1, on ink 11.7:1

        /* Referenced by ui/sidebar.tsx and ui/chart.tsx, both on the §13.3
           delete list. They previously pointed at CSS variables that were
           never defined anywhere, so every one of these classes resolved to
           an invalid colour. Re-pointed at real tokens until the files go. */
        sidebar: {
          DEFAULT: "var(--bg-alt)",
          foreground: "var(--fg)",
          primary: "var(--ink)",
          "primary-foreground": "var(--paper)",
          accent: "var(--paper-3)",
          "accent-foreground": "var(--ink)",
          border: "var(--line)",
          ring: "var(--focus)",
        },
        chart: {
          "1": "var(--ink)",
          "2": "var(--ink-2)",
          "3": "var(--ink-3)",
          "4": "var(--olive)",
          "5": "var(--tomato-dk)",
        },
      },

      // §3.2 — radius is 3px. The only pill is the .tag chip and the 2px bar.
      borderRadius: {
        DEFAULT: "var(--r)",
        sm: "2px",
        md: "var(--r)",
        lg: "var(--r)",
        pill: "var(--r-pill)",
      },
      borderWidth: { DEFAULT: "1px", rule: "2px", chev: "1.6px" },

      // §3.5 — box-shadow is banned; these three are the whole allowlist.
      // sm/md/lg/xl/2xl are intentionally not defined here.
      boxShadow: {
        none: "none",
        sticky: "var(--shadow-sticky)", // the sticky mobile CTA bar only
        inset: "var(--ring-inset)",     // photo frame border substitute
        rule: "var(--rule-double)",     // the doubled hairline on the flagged card
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

      // §8 — one duration set, one easing curve.
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
        // No float / bounce-gentle / pulse-slow. Zero infinite animations (§8, L-13).
      },
    },
  },
  plugins: [
    // @tailwindcss/typography removed (§6): 18.5 KB for one `prose` call site,
    // and it ships maxWidth 65ch (≈80 Hebrew chars) plus a sloped blockquote.
    //
    // tailwindcss-animate is RETAINED for now, deliberately against §6: twelve
    // ui/* files still ship animate-in / fade-in-0 / zoom-in-95 / slide-in-from-*.
    // §6 requires it be dropped in the SAME commit as the §13.3 ui/* deletions —
    // remove this line then, not before.
    require("tailwindcss-animate"),
  ],
} satisfies Config;
