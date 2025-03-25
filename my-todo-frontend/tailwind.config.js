/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class", // Enables dark mode via class
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        lightBg: "#f3f4f6",
        lightText: "#1f2937",
        darkBg: "#111827",
        darkText: "#f9fafb",
        primary: "#3b82f6",
        secondary: "#10b981",
      },
    },
  },
  plugins: [],
};
