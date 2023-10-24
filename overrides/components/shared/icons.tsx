import NextImage from 'next/image'

export const HomeIcon = () => (
  <NextImage
    src="/favicon/android-chrome-192x192.png"
    alt="Home"
    fill
    unoptimized
    crossOrigin="anonymous"
  />
)

export * from '@/components/shared/icons'
