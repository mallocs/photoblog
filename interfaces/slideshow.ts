import { SlideExternal } from './slide'

export type SlideshowIndexButton = 'images' | 'circles' | 'dots'
export const slideshowIndexButtonOptions = ['images', 'circles', 'dots']

export type SlideshowInternal = {
  indexButtonType?: SlideshowIndexButton
  path: string
}

export type SlideshowExternal = {
  showMap: boolean
  indexButtonType?: SlideshowIndexButton
  dateRange?: [string, string]
  slides: SlideExternal[]
}
