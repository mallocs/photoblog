import nextJsConfig from '#/next.config.mjs'
import siteConfig from '#/site.config'
import { processor } from './processingUtils'

if (process.argv.includes('--export')) {
  const { imageSizes, deviceSizes, blurSize } = {
    ...siteConfig,
    ...nextJsConfig.images,
  }

  processor({
    widths: [blurSize, ...(imageSizes ?? []), ...(deviceSizes ?? [])],
    rebuild: true, // process.argv.includes('--rebuild'),
  })
} else {
  processor({ rebuild: process.argv.includes('--rebuild') })
}
