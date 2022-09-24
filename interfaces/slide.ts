export type SlideInternal = {
  filename: string //
  caption?: string
}

export type SlideExternal = {
  url: string // external URL
  caption?: string
  srcset?: string
  sizes?: string
  width?: string
  height?: string
  sizesString?: string
}
