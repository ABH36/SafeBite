/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          green: '#10B981', // Safe
          yellow: '#FBBF24', // Caution
          red: '#EF4444',    // Danger
          dark: '#1F2937'    // Text
        }
      }
    },
  },
  plugins: [],
}