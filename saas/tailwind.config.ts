import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "hsl(250 22% 5%)",
        surface: "hsl(250 18% 8%)",
        card: "hsl(250 16% 10%)",
        border: "hsl(250 12% 18%)",
        muted: "hsl(250 8% 62%)",
        gold: {
          DEFAULT: "#ecc878",
          bright: "#f9e7ad",
          deep: "#c79a3e",
        },
        violet: {
          glow: "#8b7cf6",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      boxShadow: {
        glow: "0 0 30px rgba(236,200,120,.25)",
        "glow-lg": "0 0 60px rgba(236,200,120,.35)",
        card: "0 8px 30px rgba(0,0,0,.35)",
      },
      backgroundImage: {
        "gold-grad": "linear-gradient(135deg, #f9e7ad, #ecc878 55%, #c79a3e)",
        "grid-faint":
          "linear-gradient(rgba(255,255,255,.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.03) 1px, transparent 1px)",
      },
      keyframes: {
        "fade-up": {
          from: { opacity: "0", transform: "translateY(14px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 24px rgba(236,200,120,.2)" },
          "50%": { boxShadow: "0 0 44px rgba(236,200,120,.45)" },
        },
      },
      animation: {
        "fade-up": "fade-up .5s ease both",
        "pulse-glow": "pulseGlow 3s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
