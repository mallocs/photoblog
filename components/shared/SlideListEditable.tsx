import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import React from 'react'
import { default as NextImage } from 'next/image'
import { resetServerContext } from 'react-beautiful-dnd'
import { SlideExternal } from '#/interfaces/slide'
import getImageLoader from '#/lib/imageLoaders'
import siteConfig from '#/site.config'

type Props = {
  initialOrderMap: Map<string, number>
  slides: SlideExternal[]
  setSlideOrderFn: unknown
}

const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list)
  const [removed] = result.splice(startIndex, 1)
  result.splice(endIndex, 0, removed)

  return result
}

function onDragEnd(result, orderedSlides, setOrderedSlidesFn) {
  // dropped outside the list
  if (!result.destination) {
    return
  }

  const slides = reorder(
    orderedSlides,
    result.source.index,
    result.destination.index
  )

  setOrderedSlidesFn(slides)
}

function SlideListEditable({
  initialOrderMap,
  slides,
  setSlideOrderFn,
}: Props) {
  return (
    <section>
      <div className="mb-8 md:mb-16 sm:mx-0 w-[500px] flex justify-center">
        <DragDropContext
          onDragEnd={(result) => onDragEnd(result, slides, setSlideOrderFn)}
        >
          <Droppable droppableId="droppable">
            {(provided, snapshot) => (
              <div
                {...provided.droppableProps}
                className={`p-3 w-60 ${
                  snapshot.isDraggingOver ? 'bg-sky-100' : 'bg-gray-200'
                }`}
                ref={provided.innerRef}
              >
                {slides.map((slide, index) =>
                  slide?.src ? (
                    <Draggable
                      key={String(slide.src)}
                      draggableId={String(slide.src)}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <div
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`p-2 mb-2 ${
                            snapshot.isDragging ? 'bg-primary' : 'bg-slate-400'
                          }`}
                          style={provided.draggableProps.style}
                          ref={provided.innerRef}
                        >
                          <div className="flex justify-between">
                            <span className="font-bold text-lg">
                              {index + 1}
                            </span>
                            <span>
                              Initial: {initialOrderMap.get(slide.src) + 1}
                            </span>
                          </div>
                          <NextImage
                            loader={getImageLoader(slide.loader)}
                            className="m-auto"
                            alt="slideshow"
                            loading="eager"
                            src={slide.src}
                            width={Number(slide?.width) / 20}
                            height={Number(slide?.height) / 20}
                            placeholder={siteConfig.blurSize ? 'blur' : 'empty'}
                            blurDataURL={slide?.blurDataURL}
                            sizes="10vw"
                            crossOrigin="anonymous"
                          />
                        </div>
                      )}
                    </Draggable>
                  ) : null
                )}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
    </section>
  )
}
resetServerContext()

export default SlideListEditable
