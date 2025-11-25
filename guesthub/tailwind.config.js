/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx,js,jsx,html}"
  ],
  theme: {
    extend: {
      colors: {
        fontFamily: {
        serif: ['"Cormorant Garamond"', 'serif'], 
        sans: ['"Montserrat"', 'sans-serif'],     
        },
        primary: {
          DEFAULT: "#14b8a6",   // teal-500
          600: "#0d9488"
        },
      },
      boxShadow: {
        card: "0 10px 30px -15px rgba(0,0,0,0.15)"
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', "serif"]
      }
    },
  },
  plugins: [],
}
