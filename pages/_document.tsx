import Document, { Html, Head, Main, NextScript } from 'next/document'
import tailwindConfig from '../tailwind.config.js'

export default class MyDocument extends Document {
  makeGoogleFontLink = () => {
    const fonts = tailwindConfig?.theme?.extend?.fontFamily
    if (fonts === undefined) {
      return null
    }
    const baseUrl = `https://fonts.googleapis.com/css?`
    const fontsString = Object.entries(fonts)
      .reduce((acc, [currentKey, currentValue]) => {
        if (!Array.isArray(currentValue) || !currentKey.endsWith('-google')) {
          return acc
        }
        return currentKey.endsWith('block-google')
          ? `${acc}family=${currentValue[0]}&display=block&`
          : `${acc}family=${currentValue[0]}&display=optional&`
      }, '')
      .slice(0, -1)

    return <link rel="stylesheet" href={`${baseUrl}${fontsString}`} />
  }
  render() {
    return (
      <Html lang="en">
        <Head>{this.makeGoogleFontLink()}</Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}
