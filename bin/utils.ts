import fs from 'fs'
import path from 'path'
import cliProgress from 'cli-progress'
import exifReader from 'exif-reader'
import { getLatLngDecimalFromExif, geocodeFromExif } from './geoUtils'
import siteConfig from '#/site.config.js'

function getProgressBar() {
  return new cliProgress.SingleBar(
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
            `\nFinished optimization in: ${msToTime(elapsedTime)}`
          )
        } else {
          return progressString
        }
      },
    },
    cliProgress.Presets.shades_classic
  )
}

function getDirectoryData(
  directoryFullPath,
  {
    filterDirectoriesFn = (_: string): boolean => true,
    filterImagesFn = (filename) =>
      siteConfig.imageFileTypes.includes(
        filename.split('.').pop().toLowerCase()
      ),
  } = {}
): {
  imageCount: number // total number of images being processed
  directories: {
    // directory name => list of files in the directory
    [key: string]: string[]
  }
} {
  const directories = getDirectories(directoryFullPath)

  return directories.filter(filterDirectoriesFn).reduce(
    (fileData, currentDirectory) => {
      fileData.directories[currentDirectory] = fs
        .readdirSync(path.join(directoryFullPath, currentDirectory))
        .filter(filterImagesFn)
      fileData.imageCount += fileData.directories[currentDirectory].length
      return fileData
    },
    { directories: {}, imageCount: 0 }
  )
}

const getDirectories = (source) =>
  fs
    .readdirSync(source, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name)

function ensureDirectoryExists(filePath) {
  const dirName = path.dirname(filePath)
  if (fs.existsSync(dirName)) {
    return true
  }
  ensureDirectoryExists(dirName)
  fs.mkdirSync(dirName)
}

function promisify(f) {
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

export async function getExifData({
  rawExif,
  exif = exifReader(rawExif),
  dateTimeOriginal = true,
  coordinates = true,
  geocode = true,
}) {
  return {
    ...(dateTimeOriginal && {
      dateTimeOriginal: getExifDateTimeOriginal(exif),
    }),
    ...(coordinates && { ...getLatLngDecimalFromExif(exif) }),
    ...(geocode && { geodata: await geocodeFromExif(exif) }),
  }
}

export {
  promisify,
  getProgressBar,
  getDirectories,
  ensureDirectoryExists,
  getDirectoryData,
}
