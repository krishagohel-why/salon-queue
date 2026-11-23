/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        charcoal: {
          950: '#0B0F17',
          900: '#111827',
          800: '#1F2937',
          700: '#374151',
          600: '#4B5563',
        },
        gold: {
          300: '#FDE047',
          400: '#FACC15',
          500: '#D4A017',
          600: '#CA8A04',
          700: '#A16207',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      animation: {
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'flash-gold': 'flashGold 1.5s ease-in-out infinite',
      },
      keyframes: {
        flashGold: {
          '0%, 100%': { backgroundColor: 'rgba(212, 160, 23, 0.15)', borderColor: '#D4A017' },
          '50%': { backgroundColor: 'rgba(212, 160, 23, 0.65)', borderColor: '#FDE047' },
        }
      }
    },
  },
  plugins: [],
}
