/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
      accent: "#f4b400", // example
      dark: "#111111",
    },
    },
  },
  plugins: [],
}