/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#bae0fd',
          300: '#7cc6fc',
          400: '#36a8f8',
          500: '#0c8ce9',
          600: '#026ec7',
          700: '#0358a1',
          800: '#074a85',
          900: '#0c3e6e',
          950: '#082749',
        },
        medical: {
          blue: '#0F52BA',
          teal: '#14B8A6',
          emerald: '#10B981',
          slate: '#334155',
          navy: '#1E293B'
        },
        accent: {
          light: '#F8FAFC',
          muted: '#94A3B8',
          soft: '#E2E8F0'
        }
      },
      borderRadius: {
        '3xl': '1.5rem',
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      boxShadow: {
        'premium': '0 10px 40px -10px rgba(0, 0, 0, 0.05)',
        'premium-hover': '0 20px 60px -15px rgba(0, 0, 0, 0.1)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
      }
    },
  },
  plugins: [],
}