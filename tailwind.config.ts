import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        kotoba: {
          bg:          "#0D0D0D",
          surface:     "#141414",
          elevated:    "#1C1C1C",
          gold:        "#C9A84C",
          "gold-light":"#E8C97E",
          coral:       "#E8825A",
          "coral-dark":"#C96B43",
          text:        "#F0EDE6",
          muted:       "#7A7065",
          border:      "#2A2520",
          "border-light": "#3A342E",
        },
      },
      fontFamily: {
        display: ["var(--font-cormorant)", "Georgia", "serif"],
        sans:    ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      fontSize: {
        "2xs": ["0.65rem", { lineHeight: "1rem" }],
      },
      keyframes: {
        "fade-in": {
          "0%":   { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-up": {
          "0%":   { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "pulse-gold": {
          "0%, 100%": { opacity: "1" },
          "50%":      { opacity: "0.6" },
        },
      },
      animation: {
        "fade-in":   "fade-in 0.4s ease-out both",
        "fade-up":   "fade-up 0.5s ease-out both",
        shimmer:     "shimmer 2s linear infinite",
        "pulse-gold":"pulse-gold 2s ease-in-out infinite",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "kotoba-hero":     "linear-gradient(135deg, #0D0D0D 0%, #1C1208 50%, #0D0D0D 100%)",
        "gold-shimmer":    "linear-gradient(90deg, transparent, rgba(201,168,76,0.15), transparent)",
      },
      boxShadow: {
        "gold-glow":  "0 0 20px rgba(201,168,76,0.2)",
        "gold-glow-sm":"0 0 8px rgba(201,168,76,0.15)",
        "coral-glow": "0 0 20px rgba(232,130,90,0.3)",
        "card":       "0 4px 24px rgba(0,0,0,0.4)",
        "card-hover": "0 8px 40px rgba(0,0,0,0.6)",
      },
    },
  },
  plugins: [],
};

export default config;
