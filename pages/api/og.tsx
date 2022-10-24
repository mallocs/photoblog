import { ImageResponse } from '@vercel/og'
import { NextRequest } from 'next/server'
import {
  OG_EXTERNAL_IMAGES_BASE_URL,
  OG_IMAGE_HEIGHT,
  OG_IMAGE_WIDTH,
} from '../../lib/constants'

export const config = {
  runtime: 'experimental-edge',
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
          fontSize: 60,
          color: 'black',
          background: '#f6f6f6',
          width: '100%',
          height: '100%',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <img
          width={`${OG_IMAGE_WIDTH}`}
          height={`${OG_IMAGE_HEIGHT}`}
          src={`${OG_EXTERNAL_IMAGES_BASE_URL}${imgUrl}`}
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
              top: '50%',
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
              top: '50%',
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
      width: OG_IMAGE_WIDTH,
      height: OG_IMAGE_HEIGHT,
    }
  )
}
