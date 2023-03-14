module.exports = {
  future: {
    hoverOnlyWhenSupported: true,
  },
  content: ['./components/**/*.tsx', './pages/**/*.tsx', './layouts/**/*.tsx'],
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
        /* ending a fontFamily tag name with block-google or optional-google will trigger the link
        tag to be automatically included but only for the first entry in the value array */
        'site-name-block-google': ['Kalam'],
        'site-suffix': ['Helvetica'],
      },
      fontSize: {
        '5xl': '2.5rem',
        '6xl': '2.75rem',
        '7xl': '4.5rem',
        '8xl': '6.25rem',
      },
    },
  },
  plugins: [],
}
