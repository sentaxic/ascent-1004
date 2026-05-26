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
        redline: "#ff3b30",
        ember: "#a72420",
        signal: "#f3eee3",
        amber: "#f5a524",
      },
      fontFamily: {
        mono: ["var(--font-jetbrains)", "var(--font-ibm-plex)", "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      boxShadow: {
        glow: "0 0 24px rgba(255, 59, 48, 0.12)",
        soft: "0 24px 90px rgba(0, 0, 0, 0.44)",
      },
      animation: {
        scan: "scan 9s linear infinite",
        drift: "drift 16s ease-in-out infinite alternate",
        blink: "blink 1.1s steps(2, start) infinite",
        reveal: "reveal 560ms ease both",
        pulseLine: "pulseLine 3.2s ease-in-out infinite",
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
      },
    },
  },
  plugins: [],
};

export default config;
