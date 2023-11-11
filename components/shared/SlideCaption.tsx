import { useContext, useState } from 'react'
import { EditContext } from '#/pages/posts/[slug]'
import DateFormatter from '#/components/shared/DateFormatter'
import LocationDetails from '#/components/shared/LocationDetails'
import {
  UndoButton,
  SaveButton,
  DeleteButton,
} from '#/components/shared/buttons/EditMode'

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
  extendClassName = '',
}) {
  const [showMetadetails, setShowMetadetails] = useState(true)
  const hasMetaDetails = Boolean(geodata) || Boolean(dateTimeOriginal)
  return (
    <figcaption
      className={`figcaption bg-zinc-300 dark:bg-zinc-600 py-1 px-4 mx-auto text-lg ${extendClassName}`}
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

export function EditableCaption({ slide }) {
  const { editModeEnabled, saveCaptionFn, deletePhotoFn } =
    useContext(EditContext)
  const [caption, setCaption] = useState(slide?.caption)
  const [editCount, setEditCount] = useState(0)
  const [editedCaption, setEditedCaption] = useState(slide?.caption)
  const [isSubmitting, setIsSubmitting] = useState(false)

  return (
    <>
      <SlideCaption
        caption={caption}
        geodata={slide.geodata}
        dateTimeOriginal={slide.dateTimeOriginal}
        captionProps={{
          contentEditable: editModeEnabled && !isSubmitting,
          onInput: (e) => setEditedCaption(e.currentTarget.innerHTML),
          key: editCount,
        }}
      />
      {editModeEnabled && (
        <span className="flex justify-between mx-4 mt-2">
          <span className="flex justify-between gap-3">
            <UndoButton
              disabled={isSubmitting}
              undoFn={(e) => {
                setCaption(caption)
                // since React doesn't see innerHTML, this triggers the update
                setEditCount((value) => value + 1)
                e.target.blur()
              }}
            />
            <SaveButton
              disabled={isSubmitting}
              saveFn={() => {
                setIsSubmitting(true)
                saveCaptionFn(
                  {
                    filename: slide.filename,
                    caption: editedCaption,
                  },
                  () => setIsSubmitting(false)
                )
              }}
            />
          </span>
          <DeleteButton
            disabled={isSubmitting}
            deleteFn={() => {
              setIsSubmitting(true)
              deletePhotoFn(
                {
                  filename: slide.filename,
                },
                () => setIsSubmitting(false)
              )
            }}
          />
        </span>
      )}
    </>
  )
}

export default SlideCaption
