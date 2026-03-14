/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        darkbg: '#0F111A',
        darkpanel: '#151822',
        darkborder: '#1F2937', // Synced correctly
        primary: {
          500: '#3451b2',
          600: '#2c4599',
          700: '#1d2e67',
          bold: '#1c36a4',
          accent: '#1f3ea8',
        },
        danger: '#e63946',
        warning: '#f4a261',
        success: '#2a9d8f'
      },
      boxShadow: {
        'soft': '0 4px 20px rgba(0, 0, 0, 0.4)',
      },
    },
  },
  plugins: [],
}
