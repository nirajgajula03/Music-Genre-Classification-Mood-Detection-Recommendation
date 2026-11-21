/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: { bg: "#05060f", panel: "#0d1024", brand: "#7c3aed", cyan: "#22d3ee" },
      fontFamily: { sans: ['Inter','ui-sans-serif','system-ui'], display: ['Sora','Inter','sans-serif'] },
      backgroundImage: { 'hero': "radial-gradient(1200px 600px at 20% -10%, rgba(124,58,237,.35), transparent), radial-gradient(900px 500px at 90% 10%, rgba(34,211,238,.25), transparent), linear-gradient(180deg,#05060f 0%,#0a0b1e 100%)" },
      animation: { 'float': 'float 6s ease-in-out infinite', 'pulse-bar': 'pulseBar 1s ease-in-out infinite' },
      keyframes: { float: { '0%,100%': { transform: 'translateY(0)'}, '50%': { transform: 'translateY(-12px)'}}, pulseBar: { '0%,100%': { transform: 'scaleY(0.3)'}, '50%': { transform: 'scaleY(1)'}}},
    },
  },
  plugins: [],
}
