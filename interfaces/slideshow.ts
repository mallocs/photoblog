import { SlideExternal } from './slide'

export type SlideshowIndexButton = 'circles' | 'images'
export const slideshowIndexButtonOptions = ['circles', 'images']

export type SlideshowInternal = {
  indexButtonType?: SlideshowIndexButton
  path: string
}

export type SlideshowExternal = {
  indexButtonType?: SlideshowIndexButton
  slides: SlideExternal[]
}
