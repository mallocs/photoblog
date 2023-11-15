import { ImageLoaderName } from '#/interfaces/imageLoader'
import { AddressObject } from 'local-reverse-geocoder'

export type SlideExternal = {
  loader: ImageLoaderName
  src: string // path to file that can be specific for each loader
  filename: string
  caption?: string
  srcset?: string
  sizes?: string
  width?: number
  height?: number
  blurDataURL?: string
  latitude?: number
  longitude?: number
  geodata?: AddressObject
  dateTimeOriginal?: string
}
