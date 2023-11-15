import fs from 'fs'
import cliProgress from 'cli-progress'
import exifReader from 'exif-reader'
import { getLatLngDecimalFromExif, geocodeFromExif } from './geoUtils'

function getProgressBar() {
  return new cliProgress.MultiBar(
    {
      stopOnComplete: true,
      format: (options, params, payload) => {
        const bar = options.barCompleteString.substring(
          0,
          Math.round(params.progress * options.barsize)
        )
        const percentage = Math.floor(params.progress * 100) + ''
        const progressString = `${bar} ${percentage}% | ETA: ${params.eta}s | ${params.value}/${params.total} | Total size: ${payload.sizeOfGeneratedImages} MB`

        const stopTime = params.stopTime || Date.now()

        // calculate elapsed time
        const elapsedTime = Math.round(stopTime - params.startTime)
        function msToTime(ms) {
          let seconds = ms / 1000
          let minutes = ms / (1000 * 60)
          let hours = ms / (1000 * 60 * 60)
          let days = ms / (1000 * 60 * 60 * 24)
          if (seconds < 60) return seconds.toFixed(1) + ' seconds'
          else if (minutes < 60) return minutes.toFixed(1) + ' minutes'
          else if (hours < 24) return hours.toFixed(1) + ' hours'
          else return days + ' days'
        }

        if (params.value >= params.total) {
          return (
            progressString +
            `\nFinished processing in: ${msToTime(elapsedTime)}`
          )
        } else {
          return progressString
        }
      },
    },
    cliProgress.Presets.shades_classic
  )
}

const getDirectories = (source) =>
  fs
    .readdirSync(source, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name)

function ensureDirectoryExists(dir) {
  if (fs.existsSync(dir)) {
    return true
  }
  fs.mkdirSync(dir, { recursive: true })
}

function promisify(f: Function) {
  return function (...args) {
    return new Promise((resolve, reject) => {
      function callback(err, result) {
        if (err) {
          reject(err)
        } else {
          resolve(result)
        }
      }
      args.push(callback)
      f.call(this, ...args)
    })
  }
}

function getExifDateTimeOriginal(exif) {
  if (!exif || !exif.exif) {
    return undefined
  }
  // exif-reader seems to assume utc and ignores the exif timezone offset field.
  // https://github.com/devongovett/exif-reader/blob/7c4ab9d475621cab87ed720037dd2955025cdefe/index.js#L203
  return exif.exif.DateTimeOriginal.toISOString().slice(0, -5)
}

async function getExifData({
  rawExif,
  exif = exifReader(rawExif),
  dateTimeOriginal = true,
  showCoordinates = true,
  geocode = true,
}) {
  return {
    ...(dateTimeOriginal && {
      dateTimeOriginal: getExifDateTimeOriginal(exif),
    }),
    ...(showCoordinates && { ...getLatLngDecimalFromExif(exif) }),
    ...(geocode && { geodata: await geocodeFromExif(exif) }),
  }
}

export {
  getExifData,
  promisify,
  getProgressBar,
  getDirectories,
  ensureDirectoryExists,
}
