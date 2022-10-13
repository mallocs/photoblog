export type SlideMarkdown = {
  filename: string
  caption?: string
}

export type SlideExternal = {
  url: string // external URL
  filename: string
  caption?: string
  srcset?: string
  sizes?: string
  width?: string
  height?: string
  sizesString?: string
  blurDataURL?: string
}
