import { useState } from 'react'
import DateFormatter from '#/components/shared/DateFormatter'

function LocationDetails({ geodata }) {
  if (!Boolean(geodata)) {
    return null
  }

  const { name, admin1Code, admin2Code, distance } = geodata

  if (admin1Code?.name == undefined && admin2Code?.name == undefined) {
    return <span>{name}</span>
  } else if (admin2Code?.name == undefined) {
    return (
      <span>
        {distance < 10 ? `${name}, ${admin1Code.name}` : `${admin1Code.name}`}
      </span>
    )
  }
  return (
    <span>
      {distance < 10
        ? `${name}, ${admin1Code.name}`
        : `${admin2Code.name}, ${admin1Code.name}`}
    </span>
  )
}

function CaptionDate({ dateTimeOriginal }) {
  return (
    Boolean(dateTimeOriginal) && (
      <span className="mr-2">
        <DateFormatter dateString={dateTimeOriginal} format="L/d h aaa" />
      </span>
    )
  )
}

function SlideCaption({
  caption,
  geodata = null,
  dateTimeOriginal = null,
  captionProps = {},
  style = {},
}) {
  const [showMetadetails, setShowMetadetails] = useState(true)
  const hasMetaDetails = Boolean(geodata) || Boolean(dateTimeOriginal)
  return (
    <figcaption
      className="figcaption bg-zinc-300 dark:bg-zinc-600 py-1 px-4 mx-auto text-lg"
      style={style}
    >
      <div className="flex justify-between">
        <span
          className="captionText w-full"
          {...captionProps}
          // Using || so empty strings don't collapse. 0, null, and undefined also get replaced
          dangerouslySetInnerHTML={{
            __html: caption || '\u00A0',
          }}
        ></span>
        {hasMetaDetails && (
          <button
            title={`${showMetadetails ? 'Hide details' : 'Show photo details'}`}
            className="self-end font-bold text-2xl font-sans text-primary dark:text-primaryDark hover:text-zinc-100 dark:hover:text-zinc-100"
            onClick={() => setShowMetadetails(!showMetadetails)}
          >{`${showMetadetails ? '–' : '+'}`}</button>
        )}
      </div>
      {hasMetaDetails && showMetadetails && (
        <div className="font-extralight text-sm pt-1 border-t border-solid border-zinc-100 dark:border-zinc-900">
          <CaptionDate dateTimeOriginal={dateTimeOriginal} />
          <LocationDetails geodata={geodata} />
        </div>
      )}
    </figcaption>
  )
}

export default SlideCaption
