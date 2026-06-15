/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        app: {
          bg:          "#09090f",
          surface:     "#111118",
          elevated:    "#18181f",
          input:       "#0c0c14",
          border:      "#1e1e2e",
          line:        "#2a2a3e",
          text:        "#eeecf8",
          secondary:   "#8988a8",
          muted:       "#4c4b65",
          accent:      "#818cf8",
          "accent-lt": "#a5b0ff",
        }
      },
      animation: {
        "fade-in":  "fade-in 0.2s ease-out",
        "fade-up":  "fade-up 0.25s ease-out",
        "spin-slow": "spin 1.4s linear infinite",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0" },
          to:   { opacity: "1" },
        },
        "fade-up": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
      },
      boxShadow: {
        glow:    "0 0 0 1px rgba(129,140,248,0.12), 0 0 40px rgba(129,140,248,0.10)",
        card:    "0 1px 3px rgba(0,0,0,0.5), 0 1px 2px rgba(0,0,0,0.4)",
        "accent-sm": "0 0 12px rgba(129,140,248,0.35)",
      }
    }
  },
  plugins: []
};
