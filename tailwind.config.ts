import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      colors: {
        // Warm amber brand — replaces purple
        brand: {
          50:  "hsl(38 100% 96%)",
          100: "hsl(38 96% 88%)",
          200: "hsl(38 93% 76%)",
          300: "hsl(38 92% 65%)",
          400: "hsl(38 92% 55%)",
          500: "hsl(38 92% 50%)",
          600: "hsl(34 88% 42%)",
          700: "hsl(30 82% 34%)",
          800: "hsl(26 74% 26%)",
          900: "hsl(22 64% 18%)",
          950: "hsl(20 58% 10%)",
        },
        // Warm near-black surfaces
        surface: {
          DEFAULT: "#0e0e0e",
          1: "#141414",
          2: "#1c1c1c",
          3: "#242424",
          4: "#2e2e2e",
        },
        accent: {
          green: "hsl(152 56% 45%)",
          amber: "hsl(38 92% 50%)",
          red:   "hsl(4 70% 55%)",
          blue:  "hsl(210 80% 56%)",
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        // Solid amber — no gradient needed
        "gradient-brand": "linear-gradient(120deg, hsl(38 92% 50%) 0%, hsl(20 88% 52%) 100%)",
        "gradient-surface": "linear-gradient(180deg, #0e0e0e 0%, #0a0a0a 100%)",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        float:        "float 6s ease-in-out infinite",
        "wave-1":     "wave 1.2s ease-in-out infinite",
        "wave-2":     "wave 1.2s ease-in-out 0.1s infinite",
        "wave-3":     "wave 1.2s ease-in-out 0.2s infinite",
        "wave-4":     "wave 1.2s ease-in-out 0.3s infinite",
        "wave-5":     "wave 1.2s ease-in-out 0.4s infinite",
        "fade-in":    "fadeIn 0.4s ease-out",
        "slide-up":   "slideUp 0.35s ease-out",
        "scale-in":   "scaleIn 0.25s ease-out",
        shimmer:      "shimmer 2s linear infinite",
        "spin-slow":  "spin 8s linear infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%":      { transform: "translateY(-10px)" },
        },
        wave: {
          "0%, 100%": { transform: "scaleY(0.3)" },
          "50%":      { transform: "scaleY(1)" },
        },
        fadeIn: {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%":   { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          "0%":   { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        shimmer: {
          "0%":   { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
      },
      boxShadow: {
        glow:        "0 4px 20px rgba(0,0,0,0.5)",
        "glow-sm":   "0 2px 10px rgba(0,0,0,0.4)",
        "glow-green":"0 4px 16px hsl(152 56% 45% / 0.25)",
        "inner-glow":"inset 0 0 20px rgba(0,0,0,0.2)",
        glass:       "0 4px 24px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04)",
      },
      backdropBlur: {
        xs: "2px",
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
    },
  },
  plugins: [],
};

export default config;
