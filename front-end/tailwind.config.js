/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        coffee: {
          50: '#FDF8F5',
          100: '#F7EBE1',
          200: '#EED5C1',
          300: '#E4BEA0',
          400: '#DDB892',
          500: '#B08968',
          600: '#9C6644',
          700: '#7F5539',
          800: '#5C3A21',
          900: '#4A2E1B',
        },
        forest: {
          50: '#F2F7F5',
          100: '#E1EFE8',
          200: '#C4DFD2',
          300: '#9BCCB7',
          400: '#6CB297',
          500: '#4A9D7D',
          600: '#357F63',
          700: '#2A6550',
          800: '#245242',
          900: '#1B4332',
        },
        brand: {
          lightcream: '#F4F3ED',
          lightgreen: '#E8EFE8',
          darkgreen: '#3C6B46',
          creambg: '#FAF5EE',
          brownbtn: '#382520',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
      },
    },
  },
  plugins: [],
}
