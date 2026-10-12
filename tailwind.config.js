/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        volt: 'rgb(var(--volt) / <alpha-value>)',
        ink: { 950: '#08090b', 900: '#0c0e11', 850: '#101316', 800: '#15181c', 700: '#1c2025', 600: '#272c33', 500: '#3a4049' },
      },
      fontFamily: {
        display: ['"Barlow Condensed"', 'Impact', 'sans-serif'],
        sans: ['Manrope', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 44px -6px rgb(var(--volt) / .45)',
        'glow-sm': '0 0 22px -4px rgb(var(--volt) / .5)',
      },
      keyframes: {
        rise: { '0%': { opacity: '0', transform: 'translateY(12px)' }, '100%': { opacity: '1', transform: 'none' } },
        pop: { '0%': { transform: 'scale(.5)', opacity: '0' }, '60%': { transform: 'scale(1.14)' }, '100%': { transform: 'scale(1)', opacity: '1' } },
        ring: { '0%': { transform: 'scale(1)', opacity: '.5' }, '100%': { transform: 'scale(1.6)', opacity: '0' } },
        flame: { '0%,100%': { transform: 'translateY(0) rotate(-3deg) scale(1)' }, '50%': { transform: 'translateY(-5px) rotate(3deg) scale(1.07)' } },
        burst: { '0%': { transform: 'translate(0,0) scale(1)', opacity: '1' }, '100%': { transform: 'translate(var(--tx),var(--ty)) scale(0)', opacity: '0' } },
        drawer: { '0%': { transform: 'translateX(-100%)' }, '100%': { transform: 'none' } },
        spin: { to: { transform: 'rotate(360deg)' } },
        beat: { '0%,100%': { opacity: '1' }, '50%': { opacity: '.25' } },
        sweep: { '0%': { strokeDashoffset: '600' }, '100%': { strokeDashoffset: '0' } },
      },
      animation: {
        rise: 'rise .55s cubic-bezier(.2,.8,.2,1) both',
        pop: 'pop .5s cubic-bezier(.2,.8,.2,1) both',
        ring: 'ring 2.4s ease-out infinite',
        flame: 'flame 1.8s ease-in-out infinite',
        burst: 'burst .9s ease-out forwards',
        drawer: 'drawer .3s cubic-bezier(.2,.8,.2,1) both',
        beat: 'beat 1.4s ease-in-out infinite',
        sweep: 'sweep 2.6s ease-out forwards',
      },
    },
  },
  plugins: [],
}
