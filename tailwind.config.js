/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        studio: {
          dark: "#334155",
          mid: "#64748b",
          muted: "#94a3b8",
          cream: "#f1efe4",
          peach: "#f3e1c8"
        }
      },
      boxShadow: {
        glow: "0 0 50px rgba(243, 225, 200, 0.10)"
      }
    }
  },
  plugins: []
};
