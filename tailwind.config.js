/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      maxWidth: {
        '8xl': '88rem',
      },
      spacing: {
        '18': '4.5rem',
      },
    },
  },
  plugins: [],
}

