import siteConfig from '#/site.config'
import { ImageLoaderName } from '#/interfaces/imageLoader'
import { cloudinaryLoader } from '#/interfaces/imageLoader'
import { SlideExternal } from '@/interfaces/slide'
import { ImageLoader, ImageLoaderProps } from 'next/image'

export function cloudinaryLoaderFn({
  src,
  width,
  quality,
}: ImageLoaderProps): string {
  const params = [
    // f_auto commented out because cloudinary seems to strip copyright related
    // exif data when converting to webp.
    /*'f_auto', */
    'c_limit',
    `w_${width}`,
    `q_${quality || 'auto'}`,
  ]

  return `${siteConfig.loaders.cloudinary.baseUrl}${params.join(
    ','
  )}/fl_keep_attribution/${src}`
}

export default function getImageLoader(loader: ImageLoaderName): ImageLoader {
  if (loader === cloudinaryLoader) {
    return cloudinaryLoaderFn
  }
  return undefined
}

export function getImageUrl(slide: SlideExternal): string {
  const loaderFn = getImageLoader(slide.loader)
  if (loaderFn === undefined) {
    return `${siteConfig.siteUrl}${slide.src}`
  }
  return loaderFn({ src: slide.src, width: Number(slide.width) })
}

export function getOGImageUrl(backgroundImageUrl, title) {
  return backgroundImageUrl === undefined
    ? undefined
    : `${siteConfig.siteUrl}/api/og?imgUrl=${encodeURIComponent(
        getImageUrl(backgroundImageUrl)
      )}&title=${encodeURIComponent(title)}`
}
