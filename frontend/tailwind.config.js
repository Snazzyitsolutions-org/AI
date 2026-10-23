/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f3fbf7',
          100: '#e3f9ee',
          200: '#c7f2dd',
          300: '#8ddfba',
          400: '#55c493',
          500: '#24a372',
          600: '#16845c',
          700: '#116a4b',
          800: '#0e533c',
          900: '#0d3b2c',
          950: '#0a2f23',
        },
        green: {
          50: '#f3fbf7',
          100: '#e3f9ee',
          200: '#c7f2dd',
          300: '#8ddfba',
          400: '#55c493',
          500: '#24a372',
          600: '#16845c',
          700: '#116a4b',
          800: '#0e533c',
          900: '#0d3b2c',
          950: '#0a2f23',
        },
        whatsapp: {
          light: '#dcf8c6',
          50: '#f0fbf4',
          100: '#dcf8e4',
          200: '#b8f0cb',
          300: '#7fe3a8',
          400: '#34d975',
          500: '#25d366',
          600: '#128c7e',
          700: '#075e54',
          800: '#05463e',
          900: '#04342d',
        },
        ink: {
          DEFAULT: '#15372b',
          soft: '#35584a',
        },
        muted: {
          DEFAULT: '#667e73',
          light: '#8ba196',
        },
        line: {
          DEFAULT: '#dfefe6',
          strong: '#cfe5d9',
        },
        danger: {
          DEFAULT: '#b43d3d',
          soft: '#fff2f2',
          line: '#f3d2d2',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Segoe UI', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        xl: '30px',
        lg: '18px',
        md: '14px',
      },
      boxShadow: {
        shell: '0 40px 100px -36px rgba(12, 73, 50, 0.32), 0 4px 20px rgba(12, 73, 50, 0.05)',
        'whatsapp-glow': '0 0 35px -5px rgba(37, 211, 102, 0.45), 0 8px 24px -6px rgba(18, 140, 126, 0.35)',
        'packet-float': '0 12px 28px -10px rgba(7, 94, 84, 0.25), 0 4px 12px rgba(0, 0, 0, 0.03)',
      },
      keyframes: {
        broadcast: {
          '0%': { transform: 'scale(0.85)', opacity: '0.85' },
          '100%': { transform: 'scale(2.4)', opacity: '0' },
        },
        floatSlow: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        floatReverse: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(6px)' },
        },
        radarSpin: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        soundwave: {
          '0%': { height: '5px' },
          '100%': { height: '22px' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(200%)' },
        },
      },
      animation: {
        broadcast: 'broadcast 2.5s cubic-bezier(0, 0.2, 0.8, 1) infinite',
        'broadcast-delayed': 'broadcast 2.5s cubic-bezier(0, 0.2, 0.8, 1) infinite 0.8s',
        'broadcast-late': 'broadcast 2.5s cubic-bezier(0, 0.2, 0.8, 1) infinite 1.6s',
        'float-slow': 'floatSlow 4s ease-in-out infinite',
        'float-reverse': 'floatReverse 4.5s ease-in-out infinite',
        'radar-spin': 'radarSpin 12s linear infinite',
        soundwave: 'soundwave 1.2s ease-in-out infinite alternate',
        shimmer: 'shimmer 2s infinite linear',
      },
    },
  },
  plugins: [],
}
