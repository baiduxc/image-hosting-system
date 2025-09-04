/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f2f3ff',
          100: '#d9e1ff',
          200: '#b5c7ff',
          300: '#8eabff',
          400: '#618dff',
          500: '#366ef4',
          600: '#0052d9',
          700: '#003cab',
          800: '#002a7c',
          900: '#001a57',
        }
      }
    },
  },
  plugins: [],
}