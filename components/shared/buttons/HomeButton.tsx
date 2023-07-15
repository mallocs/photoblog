import NextLink from 'next/link'
import { HomeIcon } from '#/components/shared/icons'
import { buttonOpacityFn, buttonSharedCSS } from './utils'
import siteConfig from '#/site.config'

export function HomeButton({ hide }) {
  return (
    <NextLink
      className={`${buttonOpacityFn(
        hide
      )} grid place-items-center ${buttonSharedCSS} p-1 bg-transparent`}
      title="Home"
      href={siteConfig.siteHome}
    >
      {!hide && <HomeIcon />}
    </NextLink>
  )
}
