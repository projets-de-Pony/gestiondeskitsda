/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      animation: {
        glow: 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          from: {
            boxShadow: '0 0 20px -10px rgba(66, 153, 225, 0.5)',
          },
          to: {
            boxShadow: '0 0 30px -5px rgba(66, 153, 225, 0.8)',
          },
        },
      },
    },
  },
  plugins: [],
};