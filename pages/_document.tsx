import Document, { Html, Head, Main, NextScript } from 'next/document'
import tailwindConfig from '#/tailwind.config.js'

const makeGoogleFontLink = () => {
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

const setColorMode = () => (
  <script
    dangerouslySetInnerHTML={{
      __html: `
    if (
      localStorage.theme === 'dark' ||
      (!('theme' in localStorage) &&
        window.matchMedia('(prefers-color-scheme: dark)').matches)
    ) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }`,
    }}
  />
)

export default class MyDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <Head>
          <>{makeGoogleFontLink()}</>
          <>{setColorMode()}</>
        </Head>
        <body className="bg-zinc-100 dark:bg-zinc-900">
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}
