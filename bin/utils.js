const fs = require('fs')
const path = require('path')
const cliProgress = require('cli-progress')

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
          let seconds = (ms / 1000).toFixed(1)
          let minutes = (ms / (1000 * 60)).toFixed(1)
          let hours = (ms / (1000 * 60 * 60)).toFixed(1)
          let days = (ms / (1000 * 60 * 60 * 24)).toFixed(1)
          if (seconds < 60) return seconds + ' seconds'
          else if (minutes < 60) return minutes + ' minutes'
          else if (hours < 24) return hours + ' hours'
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

module.exports = {
  getProgressBar,
  getDirectories,
  ensureDirectoryExists,
  IMAGE_FILE_TYPES: ['jpg', 'jpeg', 'webp', 'png', 'avif'],
  MANIFEST_FILENAME: 'manifest.json',
}
