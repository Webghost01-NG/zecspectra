/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        zcash: {
          gold: '#F4B728',
          goldHover: '#E5A617',
          dark: '#0B0E14',
          navy: '#141A24',
          card: '#18202C',
          border: '#263142',
          shield: '#00D2FF',
        },
      },
    },
  },
  plugins: [],
};
