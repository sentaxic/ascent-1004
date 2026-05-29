import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        void: "#050505",
        panel: "#0a0a0a",
        line: "#25211f",
        ash: "#e8e1d4",
        muted: "#918a7d",
        faint: "#575047",
        redline: "#ff3b30",
        ember: "#a72420",
        signal: "#f3eee3",
        amber: "#f5a524",
        green: "#80d68f",
        // The live, per-section accent. Driven by --accent / --accent-rgb,
        // which the ThemeProvider rewrites when data-atmosphere changes.
        accent: "rgb(var(--accent-rgb) / <alpha-value>)",
      },
      fontFamily: {
        mono: ["var(--font-jetbrains)", "var(--font-ibm-plex)", "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      // Editorial display scale — clamp-based so headlines are giant on desktop
      // yet never overflow on mobile. Pair with tracking-display + leading-none.
      fontSize: {
        eyebrow: ["clamp(0.66rem, 0.62rem + 0.2vw, 0.78rem)", { lineHeight: "1", letterSpacing: "0.34em" }],
        lead: ["clamp(1rem, 0.94rem + 0.5vw, 1.3rem)", { lineHeight: "1.55", letterSpacing: "-0.01em" }],
        "display-sm": ["clamp(1.9rem, 1.3rem + 3vw, 3.2rem)", { lineHeight: "0.98", letterSpacing: "-0.045em" }],
        "display-md": ["clamp(2.6rem, 1.4rem + 5.4vw, 5rem)", { lineHeight: "0.95", letterSpacing: "-0.055em" }],
        "display-lg": ["clamp(3.2rem, 1.2rem + 8vw, 7.5rem)", { lineHeight: "0.92", letterSpacing: "-0.06em" }],
        "display-xl": ["clamp(3.6rem, 0.4rem + 12vw, 11rem)", { lineHeight: "0.9", letterSpacing: "-0.065em" }],
      },
      letterSpacing: {
        display: "-0.06em",
        eyebrow: "0.34em",
      },
      spacing: {
        // Section rhythm — generous editorial breathing room.
        section: "clamp(5rem, 3rem + 9vw, 11rem)",
        "section-sm": "clamp(3rem, 2rem + 5vw, 6rem)",
        gutter: "clamp(1.25rem, 0.5rem + 3vw, 3rem)",
      },
      maxWidth: {
        shell: "1220px",
        reading: "68ch",
      },
      boxShadow: {
        glow: "0 0 24px rgb(var(--accent-rgb) / 0.16)",
        "glow-lg": "0 0 60px rgb(var(--accent-rgb) / 0.18)",
        soft: "0 24px 90px rgba(0, 0, 0, 0.44)",
        panel: "0 28px 90px rgba(0, 0, 0, 0.42), inset 0 1px 0 rgba(255, 255, 255, 0.04)",
        glass: "0 20px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)",
      },
      backdropBlur: {
        xs: "2px",
      },
      animation: {
        scan: "scan 9s linear infinite",
        drift: "drift 16s ease-in-out infinite alternate",
        blink: "blink 1.1s steps(2, start) infinite",
        reveal: "reveal 560ms ease both",
        pulseLine: "pulseLine 3.2s ease-in-out infinite",
        "accent-pulse": "accentPulse 3.2s ease-in-out infinite",
      },
      keyframes: {
        scan: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100%)" },
        },
        drift: {
          "0%": { transform: "translate3d(-1%, -1%, 0) scale(1)", opacity: "0.34" },
          "100%": { transform: "translate3d(2%, 1%, 0) scale(1.05)", opacity: "0.58" },
        },
        blink: {
          "0%, 45%": { opacity: "1" },
          "46%, 100%": { opacity: "0" },
        },
        reveal: {
          "0%": { transform: "translateY(12px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        pulseLine: {
          "0%, 100%": { opacity: "0.28" },
          "50%": { opacity: "0.88" },
        },
        accentPulse: {
          "0%, 100%": { opacity: "0.3" },
          "50%": { opacity: "0.9" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
