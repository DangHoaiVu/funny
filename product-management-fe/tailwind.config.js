/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  corePlugins: {
    preflight: false, // Giữ an toàn tuyệt đối cho các component hiện có, không bị vỡ layout/SVG
  },
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f7ff',
          100: '#e0effe',
          500: '#1a2a3a',
          600: '#142230',
          700: '#0e1823',
        }
      }
    },
  },
  plugins: [],
}
