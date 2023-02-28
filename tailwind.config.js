/** @type {import('tailwindcss').Config} */
const colors = require('tailwindcss/colors')
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './hooks/**/*.{js,ts,jsx,tsx}',
    './contexts/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: { ...colors.pink, DEFAULT: colors.pink['600'] },
        secondary: { ...colors.blue, DEFAULT: colors.blue['600'] },
        theme: {
          black: '#000000',
          blue: '#4141FF',
          lightblue: '#A2BAFB',
          sky: '#E3FFFF',
          gray: '#EEEEEE',
          white: '#FFFFFF',
        },
      },
      fontFamily: {
        mono: ['Monofonto', 'monospace'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
    require('@tailwindcss/forms'),
    require('@tailwindcss/line-clamp'),
  ],
}
