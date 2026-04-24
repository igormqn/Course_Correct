/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1565C0',
          dark: '#0D47A1',
          light: '#E3F2FD',
        },
        secondary: {
          DEFAULT: '#5c6bc0',
        },
      },
    },
  },
  plugins: [],
}

