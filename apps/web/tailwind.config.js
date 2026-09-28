/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        slateDark: '#0F172A',
        charcoal: '#1E293B',
        slateHover: '#334155',
        p1Cyan: '#00E5FF',
        p2Coral: '#FF5252',
        amberWall: '#F59E0B',
      }
    },
  },
  plugins: [],
}
