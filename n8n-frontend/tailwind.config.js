/** @type {import('tailwindcss').Config} */
const { default: flattenColorPalette, } = require("tailwindcss/lib/util/flattenColorPalette");

module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        'brand-charcoal': '#111111',
        'brand-navy': '#1A1A2E',
        'brand-gold': '#FFD700',
        'brand-orange': '#FFA500',
        'brand-green': '#43D675',
        'brand-purple': '#a044ff',
      },
      fontFamily: {
        sans: ['var(--font-inter)'],
        mono: ['var(--font-space-grotesk)'],
      },
      animation: {
        "meteor-effect": "meteor 5s linear infinite",
        "text-generate": "text-generate 0.5s forwards",
        "aurora": "aurora 60s linear infinite",
        "grid": "grid 15s linear infinite",
      },
      keyframes: {
        meteor: {
          "0%": {
            transform: "rotate(215deg) translateX(0)",
            opacity: "1"
          },
          "70%": {
            opacity: "1"
          },
          "100%": {
            transform: "rotate(215deg) translateX(-500px)",
            opacity: "0",
          },
        },
        "text-generate": {
          "0%": {
            opacity: 0,
          },
          "100%": {
            opacity: 1,
          },
        },
        aurora: {
          from: {
            backgroundPosition: "50% 50%, 50% 50%",
          },
          to: {
            backgroundPosition: "350% 50%, 350% 50%",
          },
        },
        grid: {
          "0%": {
            transform: "translateY(-50%)"
          },
          "100%": {
            transform: "translateY(0)"
          },
        },
      },
    },
  },
  plugins: [addVariablesForColors],
};

function addVariablesForColors({ addBase, theme }) {
  let allColors = flattenColorPalette(theme("colors"));
  let newVars = Object.fromEntries(
    Object.entries(allColors).map(([key, val]) => [`--${key}`, val])
  );
  addBase({
    ":root": newVars,
  });
} 