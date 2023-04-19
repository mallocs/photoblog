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
  if (!exif || !exif.gps) {
    console.error(
      "Couldn't extract GPS latitude and longitude from given EXIF data"
    )
    return undefined
  }
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
}
