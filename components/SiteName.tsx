import NextLink from 'next/link'
import { SiteIcon } from '#/components/shared/icons'
import siteConfig from '#/site.config'

const SiteName = () => {
  return (
    <>
      <section className="flex justify-center mt-6 md:mx-10 lg:justify-between items-baseline">
        <h1 className="font-site-name-block-google text-[3.75rem] leading-[2.5rem] sm:text-[4.25rem] sm:leading-[3rem] md:text-[5.8rem] md:leading-[3.7rem] lg:text-[7rem] lg:leading-[4.5rem] font-bold dark:font-medium tracking-tight md:pr-8">
          <NextLink
            href={siteConfig.siteHome}
            className="hover:text-black flex align-center items-baseline"
          >
            {siteConfig.showSiteIcon && (
              <div className="pt-2 pr-2 w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24">
                <SiteIcon />
              </div>
            )}
            {siteConfig.name}
            <span
              className={`ml-0.5 font-site-suffix uppercase font-thin tracking-normal ${
                siteConfig.nameSuffixMatchSize
                  ? 'text-[2.6rem] sm:text-[3rem] md:text-[4rem] lg:text-[4.9rem]'
                  : 'text-[1.75rem] md:text-[2.25rem] lg:text-[2.5rem]'
              }`}
            >
              {siteConfig.nameSuffix}
            </span>
          </NextLink>
        </h1>
      </section>
    </>
  )
}

export default SiteName
