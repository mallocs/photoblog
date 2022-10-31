module.exports = {
  future: {
    hoverOnlyWhenSupported: true,
  },
  content: ['./components/**/*.tsx', './pages/**/*.tsx'],
  theme: {
    extend: {
      colors: {
        'accent-1': '#FAFAFA',
        'accent-2': '#EAEAEA',
        'accent-7': '#333',
        success: '#0070f3',
        cyan: '#79FFE1',
        'extra-light-gray': '#F1F1F1',
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
      boxShadow: {
        sm: '0 5px 10px rgba(0, 0, 0, 0.12)',
        md: '0 8px 30px rgba(0, 0, 0, 0.12)',
      },
      screens: {
        'hover-hover': { raw: '(hover: hover)' },
      },
    },
  },
  plugins: [],
}
