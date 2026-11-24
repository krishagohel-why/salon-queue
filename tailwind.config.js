/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Deep Royal Maroon & Burgundy
        maroon: {
          950: '#140308',
          900: '#22060F',
          850: '#2D0A15',
          800: '#3B0D1B',
          750: '#451020',
          700: '#4F1124',
          600: '#681630',
          500: '#831B3D',
        },
        // Warm Champagne & Luxury Beige
        beige: {
          50: '#FAF6F0',
          100: '#F4ECE1',
          200: '#EADBC7',
          300: '#DFC8A9',
          400: '#D3B38B',
          500: '#C59D6D',
          600: '#B08655',
          700: '#8E693F',
        },
        // Aliased for seamless backward compatibility with high-contrast maroon & beige styling
        charcoal: {
          950: '#140308', // Deepest wine maroon
          900: '#22060F', // Rich dark maroon
          850: '#2D0A15', // Card background maroon
          800: '#3B0D1B', // Border & surface maroon
          700: '#4F1124', // Light maroon border
          600: '#681630',
        },
        gold: {
          300: '#F4ECE1', // Soft light beige
          400: '#DFC8A9', // Warm champagne beige
          500: '#D3B38B', // Classic salon beige
          600: '#C59D6D', // Deep beige
          700: '#B08655', // Bronzed beige
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['Cinzel', 'Playfair Display', 'Georgia', 'serif'],
      },
      animation: {
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'flash-gold': 'flashBeige 1.5s ease-in-out infinite',
      },
      keyframes: {
        flashBeige: {
          '0%, 100%': { backgroundColor: 'rgba(211, 179, 139, 0.15)', borderColor: '#D3B38B' },
          '50%': { backgroundColor: 'rgba(211, 179, 139, 0.65)', borderColor: '#F4ECE1' },
        }
      }
    },
  },
  plugins: [],
}
