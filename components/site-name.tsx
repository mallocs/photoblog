import NextLink from 'next/link'
import {
  showSiteIcon,
  name,
  nameSuffix,
  nameSuffixMatchSize,
} from '#/site.config'
// import SiteIcon from './site-icon'
import SiteIcon from 'components/site-icon'

const SiteName = () => {
  return (
    <>
      <section className="flex justify-center mt-6 md:mx-10 lg:justify-between items-baseline">
        <h1 className="font-site-name-block-google text-7xl md:text-8xl lg:text-9xl font-bold dark:font-medium tracking-tight leading-none md:pr-8 -mb-2 md:-mb-4">
          <NextLink
            href="/"
            className="hover:text-black flex align-center items-baseline"
          >
            {showSiteIcon && <SiteIcon />}
            {name}
            <span
              className={`font-site-suffix uppercase font-thin tracking-normal ${
                nameSuffixMatchSize
                  ? 'text-[3.1rem] md:text-7xl lg:text-[5.6rem]'
                  : 'text-3xl md:text-5xl lg:text-6xl'
              }`}
            >
              {nameSuffix}
            </span>
          </NextLink>
        </h1>
      </section>
    </>
  )
}

export default SiteName
