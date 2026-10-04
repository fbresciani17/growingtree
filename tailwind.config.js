/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        family: {
          50: '#f4f7f4',
          100: '#e5eee5',
          200: '#cddfce',
          300: '#a6c6a8',
          400: '#77a67b',
          500: '#528757',
          600: '#3f6c44',
          700: '#335637',
          800: '#2b452e',
          900: '#243927',
          950: '#111f13',
        },
        warm: {
          50: '#faf8f5',
          100: '#f5f0e8',
          200: '#eae0d0',
          300: '#dc Cab1',
          400: '#c8ad8d',
          500: '#b8946e',
          600: '#aa7f5c',
          700: '#8e664b',
          800: '#735340',
          900: '#5e4537',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        serif: ['Lora', 'Georgia', 'serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(36, 57, 39, 0.08)',
        'card': '0 8px 30px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 14px 38px rgba(36, 57, 39, 0.14)',
        'glow': '0 0 25px rgba(82, 135, 87, 0.25)',
      }
    },
  },
  plugins: [],
}
