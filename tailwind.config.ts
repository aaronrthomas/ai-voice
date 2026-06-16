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
        brand: {
          50: "hsl(248 100% 97%)",
          100: "hsl(248 96% 92%)",
          200: "hsl(248 90% 84%)",
          300: "hsl(248 85% 74%)",
          400: "hsl(248 80% 63%)",
          500: "hsl(248 75% 55%)",
          600: "hsl(248 72% 47%)",
          700: "hsl(248 70% 40%)",
          800: "hsl(248 68% 32%)",
          900: "hsl(248 65% 24%)",
          950: "hsl(248 62% 14%)",
        },
        surface: {
          DEFAULT: "hsl(228 20% 7%)",
          1: "hsl(228 18% 10%)",
          2: "hsl(228 16% 14%)",
          3: "hsl(228 14% 18%)",
          4: "hsl(228 12% 22%)",
        },
        accent: {
          green: "hsl(158 64% 52%)",
          amber: "hsl(43 96% 56%)",
          red: "hsl(0 72% 58%)",
          blue: "hsl(210 100% 56%)",
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-brand":
          "linear-gradient(135deg, hsl(248 75% 55%) 0%, hsl(280 65% 50%) 100%)",
        "gradient-surface":
          "linear-gradient(180deg, hsl(228 20% 7%) 0%, hsl(228 22% 5%) 100%)",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        float: "float 6s ease-in-out infinite",
        "wave-1": "wave 1.2s ease-in-out infinite",
        "wave-2": "wave 1.2s ease-in-out 0.1s infinite",
        "wave-3": "wave 1.2s ease-in-out 0.2s infinite",
        "wave-4": "wave 1.2s ease-in-out 0.3s infinite",
        "wave-5": "wave 1.2s ease-in-out 0.4s infinite",
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-up": "slideUp 0.4s ease-out",
        "scale-in": "scaleIn 0.3s ease-out",
        shimmer: "shimmer 2s linear infinite",
        "spin-slow": "spin 8s linear infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
        },
        wave: {
          "0%, 100%": { transform: "scaleY(0.3)" },
          "50%": { transform: "scaleY(1)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.9)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        shimmer: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
      },
      boxShadow: {
        glow: "0 0 20px hsl(248 75% 55% / 0.4)",
        "glow-sm": "0 0 10px hsl(248 75% 55% / 0.3)",
        "glow-green": "0 0 20px hsl(158 64% 52% / 0.4)",
        "inner-glow": "inset 0 0 20px hsl(248 75% 55% / 0.1)",
        glass: "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)",
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
