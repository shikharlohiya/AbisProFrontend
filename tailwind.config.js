/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        'inter': ['Inter', 'sans-serif'],
        'al-bayan': ['Al Bayan', 'sans-serif'],
      },
      colors: {
        primary: '#EE3741',
        'primary-dark': '#8B0E18',
        secondary: '#F98087',
      },
    },
  },
  plugins: [],
}
