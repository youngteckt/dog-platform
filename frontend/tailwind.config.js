/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-blue': '#2853db', // User's specific blue
        'light-gray': '#F3F4F6', // For search bars and filters
      }
    },
  },
  plugins: [],
}
