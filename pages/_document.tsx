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

export default class MyDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <Head>
          <>{makeGoogleFontLink()}</>
          <script
            dangerouslySetInnerHTML={{
              __html: blockingSetInitialColorMode,
            }}
          ></script>
          <link
            rel="apple-touch-icon"
            sizes="180x180"
            href="/favicon/apple-touch-icon.png"
          />
          <link
            rel="icon"
            type="image/png"
            sizes="32x32"
            href="/favicon/favicon-32x32.png"
          />
          <link
            rel="icon"
            type="image/png"
            sizes="16x16"
            href="/favicon/favicon-16x16.png"
          />
          <link rel="manifest" href="/favicon/site.webmanifest" />
          <link rel="shortcut icon" href="/favicon/favicon.ico" />
          <meta name="theme-color" content="#000" />
          <meta
            name="theme-color"
            media="(prefers-color-scheme: light)"
            content="#fff"
          />
          <meta
            name="theme-color"
            media="(prefers-color-scheme: dark)"
            content="#000"
          />
        </Head>
        <body className="bg-zinc-100 dark:bg-zinc-900 dark:text-zinc-200">
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}

const blockingSetInitialColorMode = `!function() {
	${setInitialColorMode.toString()}
	setInitialColorMode();
}()`

function setInitialColorMode() {
  if (
    localStorage.theme === 'dark' ||
    (!('theme' in localStorage) &&
      window.matchMedia('(prefers-color-scheme: dark)').matches)
  ) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}
