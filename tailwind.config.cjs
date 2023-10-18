const { fontFamily } = require('tailwindcss/defaultTheme')

module.exports = {
  future: {
    hoverOnlyWhenSupported: true,
  },
  content: [
    './overrides/**/*.tsx',
    './components/**/*.tsx',
    './pages/**/*.tsx',
    './layouts/**/*.tsx',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#ffb400',
        secondary: '#DB9A00',
        tertiary: '#A87600',
        primaryDark: '#e69043',
        secondaryDark: '#E36C05',
        tertiaryDark: '#995F2C',
      },
      spacing: {
        28: '7rem',
      },
      letterSpacing: {
        tighter: '-.04em',
      },
      lineHeight: {
        tight: 1.2,
      },
      fontFamily: {
        logo: ['var(--font-logo)', ...fontFamily.sans],
        sans: ['Helvetica', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
