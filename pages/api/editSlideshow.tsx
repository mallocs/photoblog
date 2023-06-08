import fs from 'fs'
import { join } from 'path'
import matter from 'gray-matter'
import type { NextApiRequest, NextApiResponse } from 'next'
import { isDevEnvironment } from '#/lib/isDevEnvironment'
import siteConfig from '#/site.config'

type Data = {
  data?: {
    [key: string]: string
  }
  status: string
}

// Currently just handles replacing the slideshow captions.
export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (!isDevEnvironment) {
    return res.status(403)
  }

  const { slug, slides } = req.body

  const filePath = join(
    siteConfig.postsDirectory,
    slug,
    siteConfig.postMarkdownFileName
  )
  if (!fs.existsSync(filePath)) {
    return res.status(400).json({ status: `Error: file not found` })
  }
  const m = matter.read(filePath)
  if (!m || !m.data) {
    return res.status(400).json({ status: `Error: no data found` })
  }

  m.data.slideshow = {
    ...m.data.slideshow,
    captions: slides.reduce((accumulator, current) => {
      accumulator[current.filename] = current.caption
      return accumulator
    }, {}),
  }

  const output = matter.stringify(m.content, m.data)

  fs.writeFile(filePath, output, (err) => {
    if (err) {
      console.log('Error updating file: ', err)
      return res.status(400).json({ status: `'Error updating file` })
    }
  })
  return res.status(200).json({ status: `success`, data: slides })
}
