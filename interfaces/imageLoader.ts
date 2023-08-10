export const cloudinaryLoader = 'cloudinary'
export const vercelLoader = 'vercel'
export const loaderNames = [vercelLoader, cloudinaryLoader] as const
export type ImageLoaderName = (typeof loaderNames)[number]
