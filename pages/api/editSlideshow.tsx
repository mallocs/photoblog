import { unlink } from 'fs'
import { join } from 'path'
import type { NextApiRequest, NextApiResponse } from 'next'
import matter from 'gray-matter'
import { isDevEnvironment } from '#/lib/isDevEnvironment'
import siteConfig from '#/site.config'
import writeSlug from '#/lib/writeSlug'
import withSlugMatter from '#/lib/withSlugMatter'

type Data = {
  data?: {
    [key: string]: string
  }
  status: string
}

export default withSlugMatter(
  (
    req: NextApiRequest,
    res: NextApiResponse<Data>,
    m: matter.GrayMatterFile<string>
  ) => {
    if (!isDevEnvironment) {
      return res.status(403)
    }

    const { slug, slides, deleteFilename = undefined } = req.body

    if (deleteFilename !== undefined) {
      const deleteFullPath = join(
        siteConfig.postsDirectory,
        slug,
        deleteFilename
      )
      unlink(deleteFullPath, (err) => {
        if (err) {
          console.log(`Error deleting ${deleteFullPath}: `, err)
          return res.status(400).json({ status: `'Error deleting file` })
        }
        console.log(`${deleteFullPath} was deleted`)
      })
    }

    m.data.slideshow = {
      ...m.data.slideshow,
      captions: slides
        .filter(
          (slide) =>
            deleteFilename === undefined || slide.filename !== deleteFilename
        )
        .reduce((accumulator, current) => {
          accumulator[current.filename] = current.caption
          return accumulator
        }, {}),
    }
    return writeSlug(slug, m, res)
  }
)
