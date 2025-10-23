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
        // Primary brand colors - cream, gray, black, white
        cream: {
          50: '#fefdf9',
          100: '#fdf8f0',
          200: '#faf1e4',
          300: '#f5e6d3',
          400: '#edd5b7',
          500: '#e2c19d',
          600: '#d4a574',
          700: '#c08552',
          800: '#a06945',
          900: '#7f5539',
        },
        warm: {
          50: '#fafaf9',
          100: '#f5f5f4',
          200: '#e7e5e4',
          300: '#d6d3d1',
          400: '#a8a29e',
          500: '#78716c',
          600: '#57534e',
          700: '#44403c',
          800: '#292524',
          900: '#1c1917',
        },
        // Override default gray with warmer tones
        gray: {
          50: '#fafaf9',
          100: '#f5f5f4',
          200: '#e7e5e4',
          300: '#d6d3d1',
          400: '#a8a29e',
          500: '#78716c',
          600: '#57534e',
          700: '#44403c',
          800: '#292524',
          900: '#1c1917',
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'cream-gradient': 'linear-gradient(135deg, #fdf8f0 0%, #faf1e4 50%, #f5e6d3 100%)',
        'warm-gradient': 'linear-gradient(135deg, #f5f5f4 0%, #e7e5e4 50%, #d6d3d1 100%)',
        'cream-gray-gradient': 'linear-gradient(135deg, #faf1e4 0%, #e7e5e4 50%, #d6d3d1 100%)',
      },
    },
  },
  plugins: [],
}