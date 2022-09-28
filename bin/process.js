#!/usr/bin/env node
// modified from https://github.com/Niels-IO/next-image-export-optimizer/blob/43337bd2a2712fd8b54c969493bf16b6a8a03aa9/package.json

const fs = require('fs')
const sharp = require('sharp')
const path = require('path')
const cliProgress = require('cli-progress')

const IMAGE_FILE_TYPES = ['JPG', 'JPEG', 'WEBP', 'PNG', 'AVIF']

const ErrorScaleRatio = new Error('Scale Ratio must be less than one!')
const ErrorOpacity = new Error('Opacity must be less than one!')

const getDimensions = (H, W, h, w, outputRatio) => {
  let hh, ww

  if (H > W && w >= h) {
    // tall main image, wide watermark
    ww = outputRatio * H
    hh = (ww / w) * h
  } else if (H < W && w <= h) {
    // wide main image, tall watermark
    hh = outputRatio * W
    ww = (hh / h) * w
  } else if (H > W && w <= h) {
    // tall main image, tall watermark
    hh = outputRatio * H
    ww = (hh / h) * h
  } else {
    // wide main image, wide watermark or both square
    ww = outputRatio * W
    hh = (ww / w) * h
  }
  return [Math.floor(hh), Math.floor(ww)]
}
// original algorithm
// if (H / W < h / w) {
//   hh = outputRatio * H
//   ww = (hh / h) * w
// } else {
//   ww = outputRatio * W
//   hh = (ww / w) * h
// }
// return [Math.floor(hh), Math.floor(ww)]

// area based algorithm
// const factorIncrease = (H * W * desiredRatio) / (w * h)
// const nh = Math.sqrt(factorIncrease) * h
// const nw = Math.sqrt(factorIncrease) * w
// return [Math.floor(nh), Math.floor(nw)]

const watermarkCheckOptions = (options = {}) => {
  const { ratio, opacity } = options
  if (ratio > 1) {
    throw ErrorScaleRatio
  }
  if (opacity > 1) {
    throw ErrorOpacity
  }
  return options
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

async function processor(opts = {}) {
  console.log('----  Begin processing... ---- ')

  // Give the user a warning, if the public directory of Next.js is not found as the user
  // may have run the command in a wrong directory
  if (!fs.existsSync('public')) {
    console.warn(
      '\x1b[41m',
      'Could not find a public folder in this directory. Make sure you run the command in the main directory of your project.',
      '\x1b[0m'
    )
  }

  // Read in the configuration parameters
  // Path to Next.js config in the current directory
  const nextConfigPath = path.join(process.cwd(), 'next.config.mjs')
  const nextJsConfig = await import(nextConfigPath)

  const processorConfig = nextJsConfig.default?.env
  const imageConfig = nextJsConfig.default?.images
  const defaults = {
    processedDirectory: processorConfig._processorPROCESSED_DIRECTORY,
    slideshowUrlBase: processorConfig._processorSLIDESHOW_URL_BASE,
    watermarkFile: processorConfig._processorWATERMARK_FILE,
    watermarkRatio: processorConfig._processorWATERMARK_RATIO,
    watermarkOpacity: processorConfig._processorWATERMARK_OPACITY,
    saturation: processorConfig._processorSATURATION,
    slideshowFolderPath: processorConfig._processorSLIDESHOW_FOLDER_PATH,
    imageSizes: [...imageConfig.imageSizes, ...imageConfig.deviceSizes],
    quality: processorConfig._processorIMAGE_QUALITY,
    storePicturesInWEBP: processorConfig._processorSTORE_PICTURES_IN_WEBP,
    blurSize: [10],
  }

  const {
    processedDirectory,
    slideshowUrlBase,
    watermarkFile,
    watermarkRatio,
    watermarkOpacity,
    saturation,
    imageSizes,
    slideshowFolderPath,
    quality,
    storePicturesInWEBP,
    blurSize,
  } = { ...defaults, ...opts }
  watermarkCheckOptions({
    watermarkRatio,
    watermarkOpacity,
  })

  const directories = getDirectories(slideshowFolderPath)
  const fileData = directories.reduce(
    (fileData, currentDirectory) => {
      fileData.directories[currentDirectory] = fs
        .readdirSync(path.join(slideshowFolderPath, currentDirectory))
        .filter((filename) =>
          IMAGE_FILE_TYPES.includes(filename.split('.').pop().toUpperCase())
        )
      fileData.imageCount += fileData.directories[currentDirectory].length
      return fileData
    },
    { directories: {}, imageCount: 0 }
  )

  console.log(
    `Found ${fileData.imageCount} supported images in ${slideshowFolderPath} and subdirectories.`
  )

  const widths = [...blurSize, ...imageSizes]

  const progressBar = new cliProgress.SingleBar(
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

  if (fileData.imageCount > 0) {
    console.log(`Using sizes: ${widths.toString()}`)
    console.log(
      `Start processing ${fileData.imageCount} images with ${
        widths.length
      } sizes resulting in ${
        fileData.imageCount * widths.length
      } optimized images...`
    )
    progressBar.start(fileData.imageCount * widths.length, 0, {
      sizeOfGeneratedImages: 0,
    })
  }
  let sizeOfGeneratedImages = 0
  const allGeneratedImages = []
  function incrementProgressbar(filenameAndPath) {
    const stats = fs.statSync(filenameAndPath)
    const fileSizeInBytes = stats.size
    const fileSizeInMegabytes = fileSizeInBytes / (1024 * 1024)
    sizeOfGeneratedImages += fileSizeInMegabytes
    progressBar.increment({
      sizeOfGeneratedImages: sizeOfGeneratedImages.toFixed(1),
    })
    allGeneratedImages.push(filenameAndPath)
  }

  // Loop through all directories/images
  for (const [fileDirectory, files] of Object.entries(fileData.directories)) {
    const directoryData = {}
    const directoryDataFilePath = path.join(
      slideshowFolderPath,
      fileDirectory,
      processedDirectory,
      'manifest.json'
    )
    for (const file of files) {
      // // Check if directory has already been processed
      const currentProcessedDirectory = path.join(
        slideshowFolderPath,
        fileDirectory,
        processedDirectory
      )

      if (!fs.existsSync(currentProcessedDirectory)) {
        fs.mkdirSync(currentProcessedDirectory)
      }
      let imagePath = path.join(slideshowFolderPath, fileDirectory, file)
      let extension = file.split('.').pop().toUpperCase()

      // Begin sharp transformation logic
      const mainTransformer = await sharp(imagePath)
      const mainMetadata = await mainTransformer.metadata()
      mainTransformer.rotate()

      if (watermarkFile !== null) {
        const watermarkTransformer = await sharp(watermarkFile)
        const watermarkMetadata = await watermarkTransformer.metadata()
        const [newHeight, newWidth] = getDimensions(
          mainMetadata.height,
          mainMetadata.width,
          watermarkMetadata.height,
          watermarkMetadata.width,
          watermarkRatio
        )

        const opaqueWatermark = await watermarkTransformer
          .resize(newWidth, newHeight)
          .composite([
            {
              input: Buffer.from([
                255,
                255,
                255,
                Math.floor(255 * watermarkOpacity),
              ]),
              raw: {
                width: 1,
                height: 1,
                channels: 4,
              },
              tile: true,
              blend: 'dest-in',
            },
          ])
          .toBuffer()

        await mainTransformer
          .composite([
            {
              input: opaqueWatermark,
              top: mainMetadata.height - 2 * newHeight,
              left: mainMetadata.width - newWidth - newHeight,
            },
          ])
          .toBuffer()
      }

      const initialProcessedPath = path.join(
        slideshowFolderPath,
        fileDirectory,
        processedDirectory,
        file
      )
      await mainTransformer
        .modulate({
          saturation,
        })
        .toFile(initialProcessedPath)

      const widthsToUrls = {}
      // Loop through all widths
      for (let indexWidth = 0; indexWidth < widths.length; indexWidth++) {
        const width = widths[indexWidth]

        const filename = path.parse(file).name
        if (storePicturesInWEBP) {
          extension = 'WEBP'
        }

        const resizedAndProcessedFileNameAndPath = path.join(
          slideshowFolderPath,
          fileDirectory,
          processedDirectory,
          `${filename}-w${width}.${extension.toLowerCase()}`
        )
        await mainTransformer.clone().resize(width)
        if (extension === 'AVIF') {
          if (mainTransformer.avif) {
            const avifQuality = quality - 15
            mainTransformer.avif({
              quality: Math.max(avifQuality, 0),
              chromaSubsampling: '4:2:0', // same as webp
            })
          } else {
            mainTransformer.webp({ quality })
          }
        } else if (extension === 'WEBP' || storePicturesInWEBP) {
          mainTransformer.webp({ quality })
        } else if (extension === 'PNG') {
          mainTransformer.png({ quality })
        } else if (extension === 'JPEG' || extension === 'JPG') {
          mainTransformer.jpeg({ quality })
        }

        // Write the optimized image to the file system
        ensureDirectoryExists(resizedAndProcessedFileNameAndPath)
        await mainTransformer.toFile(resizedAndProcessedFileNameAndPath)
        incrementProgressbar(resizedAndProcessedFileNameAndPath)
        widthsToUrls[width] = path.join(
          slideshowUrlBase,
          fileDirectory,
          processedDirectory,
          `${filename}-w${width}.${extension.toLowerCase()}`
        )
      }
      const isPortraitMode = mainMetadata.height > mainMetadata.width
      directoryData[file] = {
        width: mainMetadata.width,
        height: mainMetadata.height,
        // srcset: Object.entries(widthsToUrls).reduce(
        //   (srcset, [currentSize, filenameAndPath], index) =>
        //     index > 0
        //       ? `${srcset}, ${filenameAndPath} ${currentSize}w`
        //       : `${filenameAndPath} ${currentSize}w`,
        //   ''
        // ),
        widthsToUrls,
        sizesString: isPortraitMode ? `32vw` : `80vw`,
      }
    }
    let manifest = JSON.stringify(directoryData, null, 4)
    fs.writeFileSync(directoryDataFilePath, manifest)
  }

  console.log('----  End processing... ---- ')
}

processor()
