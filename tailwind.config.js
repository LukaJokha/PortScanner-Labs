/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        accent: {
          400: '#67e8f9',
          500: '#22d3ee',
        },
      },
      boxShadow: {
        neon: '0 0 0 1px rgba(34,211,238,0.36), 0 0 28px rgba(34,211,238,0.15)',
      },
    },
  },
  plugins: [],
}
