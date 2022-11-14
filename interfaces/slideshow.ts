import { SlideExternal } from './slide'

export type SlideshowIndexButton = 'circles' | 'dots' | 'images'
export const slideshowIndexButtonOptions = ['circles', 'dots', 'images']

export type SlideshowInternal = {
  indexButtonType?: SlideshowIndexButton
  path: string
}

export type SlideshowExternal = {
  indexButtonType?: SlideshowIndexButton
  slides: SlideExternal[]
}
