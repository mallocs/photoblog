import { SlideExternal } from '#/interfaces/slide'
import { default as NextImage } from 'next/image'
import { isDevEnvironment } from '#/lib/isDevEnvironment'
import { useContext, useState } from 'react'
import { EditContext } from '#/pages/posts/[slug]'

type Props = {
  slide: SlideExternal
  id: string
}

function SaveButton({ saveFn, disabled }) {
  return (
    <button
      className="inline absolute left-20 top-1 rounded pointer p-2 bg-primary text-sm text-black font-bold uppercase leading-normal shadow-md shadow-zinc-500/20 dark:shadow-slate-300/70 transition-all hover:shadow-md hover:shadow-zinc-500/40 dark:hover:shadow-slate-400/50 focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] active:shadow-none disabled:opacity-40 disabled:shadow-none"
      title="Save changes"
      onClick={saveFn}
      disabled={disabled}
    >
      Save
    </button>
  )
}

function UndoButton({ undoFn, disabled }) {
  return (
    <button
      className="inline absolute left-4 top-1 rounded pointer p-2 bg-primary text-sm text-black font-bold uppercase leading-normal shadow-md shadow-zinc-500/20 dark:shadow-slate-300/70 transition-all hover:shadow-md hover:shadow-zinc-500/40 dark:hover:shadow-slate-400/50 focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] active:shadow-none disabled:opacity-40 disabled:shadow-none"
      title="Undo changes"
      onClick={undoFn}
      disabled={disabled}
    >
      Undo
    </button>
  )
}

function EditableFigcaption({ slide }) {
  const { editModeEnabled, saveFn } = useContext(EditContext)
  const [caption, setCaption] = useState(slide?.caption)
  const [editCount, setEditCount] = useState(0)
  const [editedCaption, setEditedCaption] = useState(slide?.caption)
  const [isSubmitting, setIsSubmitting] = useState(false)

  return (
    <>
      <figcaption
        contentEditable={editModeEnabled && !isSubmitting}
        className="bg-zinc-300 dark:bg-zinc-400 py-1 px-4 mx-auto"
        onInput={(e) => setEditedCaption(e.currentTarget.innerHTML)}
        key={editCount}
        dangerouslySetInnerHTML={{
          __html: caption || '\u00A0',
        }}
      ></figcaption>
      {editModeEnabled && (
        <span className="relative">
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
              saveFn(
                {
                  filename: slide.filename,
                  caption: editedCaption,
                },
                ({ data }) => {
                  setIsSubmitting(false)
                  if (data !== undefined && slide.filename in data) {
                    setCaption(data[slide.filename])
                  } else {
                    setCaption(slide?.caption)
                  }
                }
              )
            }}
          />
        </span>
      )}
    </>
  )
}

function Slide({ slide, id }: Props) {
  return (
    <div id={id} key={slide?.url} className="mb-16">
      <figure>
        <NextImage
          className={'!bg-auto object-contain w-full max-h-[180vmin]'}
          alt="slideshow"
          key={slide.url}
          src={slide.url}
          width={Number(slide?.width)}
          height={Number(slide?.height)}
          placeholder="blur"
          blurDataURL={slide?.blurDataURL}
          sizes="100vw"
        />
        {isDevEnvironment ? (
          <EditableFigcaption slide={slide} />
        ) : (
          <figcaption
            className="bg-zinc-300 dark:bg-zinc-400 py-1 px-4 mx-auto"
            dangerouslySetInnerHTML={{
              __html: slide?.caption || '\u00A0',
            }}
          ></figcaption>
        )}
      </figure>
    </div>
  )
}
export default Slide
