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

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (!isDevEnvironment) {
    return res.status(403)
  }

  const { slug, filename, caption } = req.body

  const filePath = join(siteConfig.postsDirectoryFullPath, `${slug}.md`)
  if (!fs.existsSync(filePath)) {
    return res.status(400).json({ status: `Error: file not found` })
  }
  const m = matter.read(filePath)
  if (!m || !m.data) {
    return res.status(400).json({ status: `Error: no data found` })
  }
  if (!(filename in m.data.slideshow.captions)) {
    return res.status(400).json({ status: `Error: caption entry not found` })
  }

  m.data.slideshow.captions[filename] = caption.replace(/&nbsp;/g, ' ').trim()

  const output = matter.stringify(m.content, m.data)

  fs.writeFile(filePath, output, (err) => {
    if (err) {
      console.log('Error updating file: ', err)
      return res.status(400).json({ status: `'Error updating file` })
    }
  })
  return res
    .status(200)
    .json({ status: `success`, data: { [filename]: caption } })
}
