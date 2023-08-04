import { ImageResponse } from '@vercel/og'
import { NextRequest } from 'next/server'
import siteConfig from '#/site.config'

export const config = {
  runtime: 'edge',
}

export default async function handler(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const imgUrl = searchParams.get('imgUrl')
  const title = searchParams.get('title')

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          fontSize: 50,
          color: 'black',
          background: '#f6f6f6',
          width: '100%',
          height: '100%',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {/*eslint-disable-next-line @next/next/no-img-element */}
        <img
          width={`${siteConfig.openGraph.imageWidth}`}
          height={`${siteConfig.openGraph.imageHeight}`}
          src={imgUrl}
          alt={title}
          style={{
            objectFit: 'cover',
          }}
        />

        {title && (
          <h2
            style={{
              opacity: '.7',
              backgroundColor: 'white',
              position: 'absolute',
              color: 'white',
              top: '60%',
              left: '5%',
              padding: '5px 20px',
              borderRadius: '10px',
            }}
          >
            {title}
          </h2>
        )}
        {title && (
          <h2
            style={{
              opacity: '1',
              color: 'black',
              position: 'absolute',
              top: '60%',
              left: '5%',
              padding: '5px 20px',
            }}
          >
            {title}
          </h2>
        )}
      </div>
    ),
    {
      width: siteConfig.openGraph.imageWidth,
      height: siteConfig.openGraph.imageHeight,
    }
  )
}
