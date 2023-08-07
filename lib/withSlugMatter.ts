import type { NextApiRequest, NextApiResponse } from 'next'
import { getPostMatter } from '#/lib/api'

type Data = {
  data?: {
    [key: string]: string
  }
  status: string
}

export default function withSlugMatter(wrappedHandler) {
  return function handlerWithMatter(
    req: NextApiRequest,
    res: NextApiResponse<Data>
  ) {
    const { slug } = req.body
    const m = getPostMatter(slug)
    if (!m || !m.data || !m.data.slideshow) {
      return res.status(400).json({ status: `Error: no data found` })
    }
    return wrappedHandler(req, res, m)
  }
}
