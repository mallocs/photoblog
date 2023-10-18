import NextLink from 'next/link'
import { HomeIcon } from '#/components/shared/icons'
import { buttonOpacityFn } from './utils'
import siteConfig from '#/site.config'

export function HomeButton({ hide }) {
  return (
    <NextLink
      className={`${buttonOpacityFn(
        hide
      )} grid place-items-center transition-opacity duration-300 rounded-full pointer h-12 w-12 lg:h-16 lg:w-16 p-1 bg-transparent`}
      title="Home"
      href={siteConfig.siteHome}
    >
      {!hide && <HomeIcon />}
    </NextLink>
  )
}
