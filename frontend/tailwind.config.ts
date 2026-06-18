import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "'Fira Code'", "monospace"],
      },
      colors: {
        penda: {
          50:  "#f5f3ff",
          100: "#ede9fe",
          200: "#ddd6fe",
          300: "#c4b5fd",
          400: "#a78bfa",
          500: "#8b5cf6",
          600: "#7c3aed",
          700: "#6d28d9",
          800: "#5b21b6",
          900: "#4c1d95",
          950: "#2e1065",
        },
        zinc: {
          950: "#09090b",
        },
      },
      backgroundImage: {
        "penda-gradient":  "linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)",
        "mesh-gradient":
          "radial-gradient(at 40% 20%, hsla(265,80%,30%,0.3) 0, transparent 50%), radial-gradient(at 80% 80%, hsla(240,70%,25%,0.25) 0, transparent 50%)",
        "mesh-accent":
          "radial-gradient(at 60% 50%, hsla(265,90%,55%,0.08) 0, transparent 60%)",
      },
      animation: {
        // Streaming cursor — glowing pulse
        "cursor-glow":    "cursorGlow 1.1s ease-in-out infinite",
        "cursor-blink":   "blink 1s step-end infinite",

        // Background orb drift
        "orb-drift-a":    "orbDriftA 18s ease-in-out infinite alternate",
        "orb-drift-b":    "orbDriftB 22s ease-in-out infinite alternate",
        "orb-drift-c":    "orbDriftC 28s ease-in-out infinite alternate",

        // Tool pill breathing dot
        "breathe":        "breathe 1.6s ease-in-out infinite",

        // Generic utilities
        "fade-up":        "fadeUp 0.4s ease-out",
        "shimmer":        "shimmer 1.5s infinite",
        "pulse-slow":     "pulse 3s ease-in-out infinite",
        "slide-in-left":  "slideInLeft 0.3s ease-out",
        "float":          "float 4s ease-in-out infinite",
      },
      keyframes: {
        cursorGlow: {
          "0%, 100%": { opacity: "1",   transform: "scaleY(1)",    boxShadow: "0 0 8px 2px rgba(167,139,250,0.8)" },
          "50%":       { opacity: "0.3", transform: "scaleY(0.85)", boxShadow: "0 0 3px 1px rgba(167,139,250,0.3)" },
        },
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%":       { opacity: "0" },
        },
        breathe: {
          "0%, 100%": { transform: "scale(1)",    opacity: "1"   },
          "50%":       { transform: "scale(1.45)", opacity: "0.6" },
        },
        orbDriftA: {
          "0%":   { transform: "translate(0px, 0px)   scale(1)"    },
          "100%": { transform: "translate(60px, 40px) scale(1.08)" },
        },
        orbDriftB: {
          "0%":   { transform: "translate(0px, 0px)    scale(1)"    },
          "100%": { transform: "translate(-50px, 30px) scale(1.05)" },
        },
        orbDriftC: {
          "0%":   { transform: "translate(0px, 0px)   scale(1)"    },
          "100%": { transform: "translate(30px, -50px) scale(1.1)" },
        },
        slideInLeft: {
          from: { opacity: "0", transform: "translateX(-16px)" },
          to:   { opacity: "1", transform: "translateX(0)"     },
        },
        fadeUp: {
          from: { opacity: "0", transform: "translateY(12px)" },
          to:   { opacity: "1", transform: "translateY(0)"    },
        },
        shimmer: {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0"  },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)"  },
          "50%":       { transform: "translateY(-8px)" },
        },
      },
      boxShadow: {
        "glow-violet":  "0 0 24px -4px rgba(124, 58, 237, 0.55)",
        "glow-sm":      "0 0 14px -2px rgba(124, 58, 237, 0.4)",
        "glow-lg":      "0 0 48px -8px rgba(124, 58, 237, 0.6)",
        "glass":        "0 8px 32px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.06)",
        "glass-strong": "0 16px 48px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)",
        "inner-top":    "inset 0 1px 0 0 rgba(255,255,255,0.06)",
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};

export default config;
