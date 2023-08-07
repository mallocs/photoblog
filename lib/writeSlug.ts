import fs from 'fs/promises'
import { join } from 'path'
import matter from 'gray-matter'
import { getPostSlideshow } from '#/lib/api'
import siteConfig from '#/site.config'

export default async function writeSlug(slug, m, res) {
  const filePath = join(
    siteConfig.postsDirectory,
    slug,
    siteConfig.postMarkdownFileName
  )
  const output = matter.stringify(m.content, m.data)

  try {
    await fs.writeFile(filePath, output)
  } catch (err) {
    console.log('Error updating file: ', err)
    return res.status(400).json({ status: `'Error updating file` })
  }
  return res.status(200).json({
    status: `success`,
    data: {
      slideshow: getPostSlideshow(slug, m.data.slideshow),
    },
  })
}
