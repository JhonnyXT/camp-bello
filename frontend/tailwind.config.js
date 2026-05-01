/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        secondary: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
        camp: {
          verde:  '#3D5A3E',
          dorado: '#C8922A',
          arena:  '#D4C5A9',
          carbon: '#1A1A1A',
          rojo:   '#A93226',
          hueso:  '#F5F0E8',
          bronce: '#8B6914',
        },
      },
      fontFamily: {
        display:  ['"Bebas Neue"', 'sans-serif'],
        military: ['"Barlow Condensed"', 'sans-serif'],
      },
      animation: {
        'fade-in':    'fadeIn 0.3s ease-in-out',
        'slide-in':   'slideIn 0.3s ease-in-out',
        'float-up':   'floatUp 10s ease-in infinite',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'glow':       'glow 2s ease-in-out infinite alternate',
        'zoom-in':    'zoomIn 0.4s ease-out',
        'flash-red':  'flashRed 0.6s ease-in-out',
        'flash-gold': 'flashGold 0.6s ease-in-out',
        'march':      'march 1s ease-in-out infinite',
        'shake':      'shake 0.5s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%':   { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        floatUp: {
          '0%':   { transform: 'translateY(0px)', opacity: '0.6' },
          '100%': { transform: 'translateY(-100vh)', opacity: '0' },
        },
        glow: {
          '0%':   { filter: 'drop-shadow(0 0 6px #C8922A) drop-shadow(0 0 12px #C8922A60)' },
          '100%': { filter: 'drop-shadow(0 0 20px #C8922A) drop-shadow(0 0 40px #C8922A)' },
        },
        zoomIn: {
          '0%':   { transform: 'scale(0.4)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        flashRed: {
          '0%,100%': { backgroundColor: 'transparent' },
          '50%':     { backgroundColor: '#A93226' },
        },
        flashGold: {
          '0%,100%': { backgroundColor: 'transparent' },
          '50%':     { backgroundColor: 'rgba(200,146,42,0.25)' },
        },
        march: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%':     { transform: 'translateY(-4px)' },
        },
        shake: {
          '0%,100%': { transform: 'translateX(0)' },
          '25%':     { transform: 'translateX(-6px)' },
          '75%':     { transform: 'translateX(6px)' },
        },
        fadeInOut: {
          '0%':   { opacity: '0', transform: 'scale(0.95)' },
          '15%':  { opacity: '1', transform: 'scale(1)' },
          '70%':  { opacity: '1', transform: 'scale(1)' },
          '100%': { opacity: '0', transform: 'scale(1.02)' },
        },
      },
    },
  },
  plugins: [],
}
