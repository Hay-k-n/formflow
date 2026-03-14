/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
        display: ['"Instrument Serif"', 'Georgia', 'serif'],
      },
      colors: {
        ink: '#1a1a2e',
        paper: '#faf9f7',
        accent: '#e85d04',
        muted: '#6b7280',
        border: '#e5e2de',
        surface: '#f3f1ed',
      },
    },
  },
  plugins: [],
};
