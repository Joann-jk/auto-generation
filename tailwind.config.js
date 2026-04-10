/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./lib/**/*.{js,jsx,ts,tsx}",
    "./pages/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "brand-black": "#0a0a0a",
        "brand-charcoal": "#111111",
        "brand-gold": "#f46e09",
        "brand-gold-soft": "#E0B85A",
        "brand-cream": "#f5f1e8",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "ui-sans-serif", "system-ui"],
        display: ["var(--font-playfair)", "Georgia", "serif"],
      },
      boxShadow: {
        "premium-1": "0 8px 30px rgba(0,0,0,0.6)",
        "glow-gold": "0 10px 40px rgba(244,110,9,0.12)",
      },
      borderRadius: {
        "3xl": "1.5rem",
      },
    },
  },
  plugins: [],
};