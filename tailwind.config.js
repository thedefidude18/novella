/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class', // Ensure dark mode is enabled via class
  theme: {
    extend: {
      colors: {
        brand: 'var(--brand-color)',
        'brand-hover': 'var(--brand-color-hover)',
        dark: {
          primary: '#111827',
          secondary: '#030712',
          tertiary: '#374151',
        },
      },
      backgroundColor: {
        'dark-primary': '#010409',
        'dark-secondary': '#030712',
        'dark-tertiary': '#374151',
      },
      textColor: {
        'dark-primary': '#F9FAFB',
        'dark-secondary': '#D1D5DB',
        'dark-tertiary': '#9CA3AF',
      },
      borderColor: {
        'dark-border': '#374151',
      },
    },
  },
  plugins: [require('@tailwindcss/forms'), require('@tailwindcss/typography')],
};