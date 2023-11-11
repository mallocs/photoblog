import type { NextApiRequest, NextApiResponse } from 'next'
import { isDevEnvironment } from '#/lib/isDevEnvironment'
import writeSlug from '#/lib/writeSlug'
import matter from 'gray-matter'
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

    const { slug, filename, caption } = req.body
    m.data.slideshow.captions[filename] = caption
    return writeSlug(slug, m, res)
  }
)
