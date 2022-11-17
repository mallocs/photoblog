import NextLink from 'next/link'
import {
  SUMMARY,
  SHOW_SITE_ICON,
  NAME,
  NAME_SUFFIX,
  NAME_SUFFIX_MATCH_SIZE,
} from '../lib/constants'
// import SiteIcon from './site-icon'
import SiteIcon from 'components/site-icon'

const SiteName = () => {
  return (
    <>
      <section className="flex justify-center mt-6 md:mx-10 lg:justify-between items-baseline">
        <h1 className="font-site-name-block-google dark:text-zinc-50 text-7xl md:text-8xl lg:text-9xl font-bold dark:font-medium tracking-tight leading-none md:pr-8 -mb-2 md:-mb-4">
          <NextLink
            href="/"
            className="hover:text-black flex align-center items-baseline"
          >
            {SHOW_SITE_ICON && <SiteIcon />}
            {NAME}
            <span
              className={`font-site-suffix uppercase font-thin tracking-normal ${
                NAME_SUFFIX_MATCH_SIZE
                  ? 'text-[3.1rem] md:text-7xl lg:text-[5.6rem]'
                  : 'text-3xl md:text-5xl lg:text-6xl'
              }`}
            >
              {NAME_SUFFIX}
            </span>
          </NextLink>
        </h1>
        {SUMMARY && (
          <h4 className="hidden sm:block font-sans text-center md:text-left text-2xl mt-5 md:pl-8 ml-12">
            {SUMMARY}
          </h4>
        )}
      </section>
    </>
  )
}

export default SiteName
