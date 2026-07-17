/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        ink: '#111317',
        ember: '#ff4d2d',
        gold: '#f7b731',
        mint: '#29d39a',
        steel: '#667085',
      },
      boxShadow: {
        glow: '0 18px 60px rgba(255, 77, 45, 0.28)',
        panel: '0 20px 70px rgba(15, 23, 42, 0.12)',
      },
    },
  },
  plugins: [],
};
