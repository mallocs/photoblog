import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import { Icon } from 'leaflet'
import { useEffect, useContext, useState } from 'react'
import { SlidesContext } from '#/contexts/SlideContext'
import SlideCaption from '#/components/shared/SlideCaption'
import {
  getClosestToViewportBottomIndex,
  registerGroupCallback,
} from '#/lib/intersection-observer-group/observe'
import 'leaflet/dist/leaflet.css'

function MapComponent() {
  const slides = useContext(SlidesContext)

  return (
    <>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {slides.map(
        (slide) =>
          slide.latitude !== undefined &&
          slide.longitude !== undefined && (
            <Marker
              key={slide.filename}
              position={[slide.latitude, slide.longitude]}
              icon={
                new Icon({
                  iconUrl: '/assets/markers/marker-icon.png',
                  popupAnchor: [5, -25],
                  iconAnchor: [12, 41],
                  shadowUrl: '/assets/markers/marker-shadow.png',
                  shadowAnchor: [12, 41],
                })
              }
            >
              <Popup>
                <SlideCaption
                  {...slide}
                  extendClassName="bg-white dark:bg-white"
                />
              </Popup>
            </Marker>
          )
      )}
    </>
  )
}

const RecenterAutomatically = ({ latitude, longitude }) => {
  const map = useMap()
  useEffect(() => {
    map.setView([latitude, longitude], map.getZoom(), {
      animate: true,
      duration: 1,
    })
  }, [latitude, longitude, map])
  return null
}

const useClosestToViewportBottom = (observerId, callbackFn) =>
  useEffect(() => {
    registerGroupCallback(observerId, () => {
      callbackFn(getClosestToViewportBottomIndex(observerId))
    })
  }, [callbackFn, observerId])

export default function Map() {
  const slides = useContext(SlidesContext)
  const [center, setCenterFn] = useState([
    slides[0]?.latitude,
    slides[0]?.longitude,
  ])
  const [latitude, longitude] = center
  useClosestToViewportBottom('slide', (index) => {
    setCenterFn([slides[index].latitude, slides[index].longitude])
  })
  return (
    latitude !== undefined &&
    longitude !== undefined && (
      <MapContainer
        center={[latitude, longitude]}
        zoom={13}
        className="h-full w-full"
      >
        <MapComponent />
        <RecenterAutomatically latitude={latitude} longitude={longitude} />
      </MapContainer>
    )
  )
}
