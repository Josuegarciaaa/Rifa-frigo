/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  theme: {
    extend: {
      colors: {
        primary: '#C4161C',
        secondary: '#4B265B',
        mainBg: '#0F0F0F',
        altBg: '#C06AA6',
        mainText: '#FFFFFF',
        secText: '#E3A6C9',
      },
    },
  },
  plugins: [],
}
