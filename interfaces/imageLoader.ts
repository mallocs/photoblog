export const cloudinaryLoader = 'cloudinary'
export const vercelLoader = 'vercel'
export const loaderNames = [cloudinaryLoader, vercelLoader] as const
export type ImageLoaderName = (typeof loaderNames)[number]
