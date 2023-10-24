import NextImage from 'next/image'
import siteConfig from '#/site.config'

type Props = {
  author: { name: string; pictureURL?: string } | string
}

// Authors should be defined in the siteConfig and if not found or defined
// the default image and name will be used.
const Avatar = (props: Props) => {
  let { pictureURL, name } = siteConfig.authors.default
  if (typeof props.author === 'string') {
    ;({ pictureURL, name } = siteConfig.authors.hasOwnProperty(props.author)
      ? siteConfig.authors[props.author]
      : siteConfig.authors.default)
  } else if (props.author?.pictureURL) {
    ;({ pictureURL, name } = props.author)
  }

  return (
    <div className="flex items-center">
      {
        <NextImage
          src={pictureURL}
          className="w-12 h-12 rounded-full mr-4"
          alt={name}
          width="48"
          height="48"
          crossOrigin="anonymous"
        />
      }
      <div className="text-xl font-bold">{name}</div>
    </div>
  )
}

export default Avatar
