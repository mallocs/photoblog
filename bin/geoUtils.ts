import geocoder from 'local-reverse-geocoder'
import { promisify } from './utils'

type CoordinateDegrees = [number, number, number]
type CoordinateDecimals = {
  latitude: number
  longitude: number
}

function convertDMSToDD(degrees, minutes, seconds, direction) {
  var dd = degrees + minutes / 60 + seconds / (60 * 60)

  if (direction == 'S' || direction == 'W') {
    dd = dd * -1
  } // Don't do anything for N or E
  return dd
}

export function getLatLngDecimalFromExif(exif): CoordinateDecimals {
  try {
    const {
      gps: { GPSLatitudeRef, GPSLatitude, GPSLongitudeRef, GPSLongitude },
    }: {
      gps: {
        GPSLatitudeRef: string
        GPSLatitude: CoordinateDegrees
        GPSLongitudeRef: string
        GPSLongitude: CoordinateDegrees
      }
    } = exif
    return {
      latitude: convertDMSToDD(...GPSLatitude, GPSLatitudeRef),
      longitude: convertDMSToDD(...GPSLongitude, GPSLongitudeRef),
    }
  } catch (error) {
    console.error(
      "Couldn't extract GPS latitude and longitude from given EXIF data"
    )
    return undefined
  }
}

const geocodeInitPromise = promisify((cb) => {
  geocoder.init(
    {
      citiesFileOverride: 'cities500', // one of 'cities500', 'cities1000', 'cities5000', 'cities15000' or null to keep the default city database (cities1000)
      load: {
        admin1: true,
        admin2: true,
        admin3And4: true,
        alternateNames: false,
      },
    },
    cb
  )
})

let isGeocodeInited = false
const geocodePromise = promisify(async (point: CoordinateDecimals, cb) => {
  if (!isGeocodeInited) {
    await geocodeInitPromise()
    isGeocodeInited = true
  }
  geocoder.lookUp(point, 1, function (err, res) {
    cb(err, res)
  })
})

export async function geocode(point: CoordinateDecimals) {
  return await geocodePromise(point)
}

export async function geocodeFromExif(exif) {
  const point = getLatLngDecimalFromExif(exif)
  if (typeof point === 'undefined') {
    return undefined
  }
  try {
    const data = await geocode(point)
    return data[0][0]
  } catch (error) {
    console.error('Error geocoding point')
    return undefined
  }
}
