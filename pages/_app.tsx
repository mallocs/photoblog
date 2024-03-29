import { AppProps } from 'next/app'
import { DefaultLayout } from '#/layouts/Default'
import type { NextPage } from 'next'
import type { PropsWithChildren } from 'react'
import { kalam } from '#/styles/fonts'
import '#/styles/index.css'

type NextPageWithLayout = NextPage & {
  Layout?: ({ children }: PropsWithChildren<unknown>) => JSX.Element
}

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout
}

export default function MyApp({ Component, pageProps }: AppPropsWithLayout) {
  const ComponentLayout = Component.Layout ?? DefaultLayout
  return (
    <div className={`${kalam.variable}`}>
      <ComponentLayout>
        <Component {...pageProps} />
      </ComponentLayout>
    </div>
  )
}
