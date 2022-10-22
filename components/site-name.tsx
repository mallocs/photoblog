import NextHead from 'next/head'
import NextLink from 'next/link'

import { SUMMARY, NAME, NAME_SUFFIX } from '../lib/constants'

const SiteName = () => {
  return (
    <>
      <NextHead>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css?family=Kalam&display=block"
        />
      </NextHead>
      <section className="flex-col md:flex-row flex items-center md:justify-between mx-5 mt-4 mb-16 md:mb-12">
        <h1 className="font-site-name text-5xl md:text-8xl font-bold tracking-tight leading-tight md:pr-8">
          <NextLink href="/">
            <a className="hover:underline">
              {NAME}
              <span className="font-site-suffix font-thin text-4xl tracking-normal uppercase">
                {NAME_SUFFIX}
              </span>
            </a>
          </NextLink>
        </h1>
        {SUMMARY && (
          <h4 className="text-center md:text-left text-lg mt-5 md:pl-8">
            {SUMMARY}
          </h4>
        )}
      </section>
    </>
  )
}

export default SiteName
