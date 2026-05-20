/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      boxShadow: {
        glow: "0 0 50px rgba(45, 212, 191, 0.16)"
      }
    }
  },
  plugins: []
};
