#!/usr/bin/env node
// modified from https://github.com/Niels-IO/next-image-export-optimizer/blob/43337bd2a2712fd8b54c969493bf16b6a8a03aa9/package.json

const fs = require('fs')
const sharp = require('sharp')
const path = require('path')
const cliProgress = require('cli-progress')
const jimp = require('jimp')
// import fs from 'fs'
// import sharp from 'sharp'
// import path from 'path'
// import cliProgress from 'cli-progress'
// import jimp from 'jimp'
// import {
//   SLIDESHOW_FOLDER_PATH,
//   SLIDESHOW_URL_BASE,
//   PROCESSED_DIRECTORY,
//   WATERMARK_FILE,
//   IMAGE_QUALITY,
//   STORE_PICTURES_IN_WEBP,
//   GENERATE_AND_USE_BLUR_IMAGES,
// } from '../lib/constants.js/index.js'
// export const SLIDESHOW_FOLDER_PATH = 'public/assets/slideshows'
// export const SLIDESHOW_URL_BASE = '/assets/slideshows/'
// export const PROCESSED_DIRECTORY = 'processed'
// export const WATERMARK_FILE = 'public/assets/watermark.png'
// export const IMAGE_QUALITY = 75
// export const STORE_PICTURES_IN_WEBP = false
// export const GENERATE_AND_USE_BLUR_IMAGES = true
const IMAGE_FILE_TYPES = ['JPG', 'JPEG', 'WEBP', 'PNG', 'AVIF']
/**
 * modified from:
 * https://github.com/sushantpaudel/jimp-watermark/blob/master/index.js
 */
const watermarkDefaultOptions = {
  ratio: 0.6,
  opacity: 0.6,
  dstPath: './watermark.jpg',
  text: 'jimp-watermark',
  textSize: 1,
}

const ErrorScaleRatio = new Error('Scale Ratio must be less than one!')
const ErrorOpacity = new Error('Opacity must be less than one!')

const getDimensions = (H, W, h, w, ratio) => {
  let hh, ww
  if (H / W < h / w) {
    //GREATER HEIGHT
    hh = ratio * H
    ww = (hh / h) * w
  } else {
    //GREATER WIDTH
    ww = ratio * W
    hh = (ww / w) * h
  }
  return [hh, ww]
}

const watermarkCheckOptions = (options) => {
  options = { ...watermarkDefaultOptions, ...options }
  if (options.ratio > 1) {
    throw ErrorScaleRatio
  }
  if (options.opacity > 1) {
    throw ErrorOpacity
  }
  return options
}

/*
 * @param {String} mainImage - Path of the image to be watermarked
 * @param {String} watermarkImage - Path of the watermark image to be applied
 * @param {Object} options
 * @param {Float} options.ratio     - Ratio in which the watermark is overlaid
 * @param {Float} options.opacity   - Value of opacity of the watermark image during overlay
 * @param {String} options.dstPath  - Destination path where image is to be exported
 */
async function addWatermark(mainImage, watermarkImage, options) {
  try {
    options = watermarkCheckOptions(options)
    const main = await jimp.read(mainImage)
    const watermark = await jimp.read(watermarkImage)
    const [newHeight, newWidth] = getDimensions(
      main.getHeight(),
      main.getWidth(),
      watermark.getHeight(),
      watermark.getWidth(),
      options.ratio
    )
    watermark.resize(newWidth, newHeight)
    watermark.opacity(options.opacity)
    main.composite(
      watermark,
      main.getWidth() - newWidth - 40,
      main.getHeight() - newHeight - 40,
      jimp.HORIZONTAL_ALIGN_CENTER | jimp.VERTICAL_ALIGN_MIDDLE
    )
    await main.quality(100).writeAsync(options.dstPath)
    return {
      destinationPath: options.dstPath,
      imageHeight: main.getHeight(),
      imageWidth: main.getWidth(),
    }
  } catch (err) {
    throw err
  }
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

const processer = async function (opts = {}) {
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
    imageSizes,
    slideshowFolderPath,
    quality,
    storePicturesInWEBP,
    blurSize,
  } = { ...defaults, ...opts }

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
      // const currentProcessedFile = path.join(
      //   slideshowFolderPath,
      //   fileDirectory,
      //   processedDirectory,
      //   file
      // )
      // if (fs.existsSync(currentProcessedFile)) {
      //   console.log(currentProcessedFile)
      //   incrementProgressbar(currentProcessedFile)
      //   continue
      // }
      let imagePath = path.join(slideshowFolderPath, fileDirectory, file)
      let extension = file.split('.').pop().toUpperCase()

      if (watermarkFile !== null) {
        const watermarkedPath = path.join(
          slideshowFolderPath,
          fileDirectory,
          processedDirectory,
          file
        )
        await addWatermark(imagePath, watermarkFile, {
          dstPath: watermarkedPath,
          ratio: 0.1,
        })
        imagePath = watermarkedPath
      }
      const imageBuffer = fs.readFileSync(imagePath)
      // Begin sharp transformation logic
      const transformer = sharp(imageBuffer)
      // console.log(transformer)
      const metadata = await transformer.metadata()

      const widthsToUrls = {}
      // Loop through all widths
      for (let indexWidth = 0; indexWidth < widths.length; indexWidth++) {
        const width = widths[indexWidth]

        const filename = path.parse(file).name
        if (storePicturesInWEBP) {
          extension = 'WEBP'
        }

        const processsedFileNameAndPath = path.join(
          slideshowFolderPath,
          fileDirectory,
          processedDirectory,
          `${filename}-w${width}.${extension.toLowerCase()}`
        )

        await transformer.rotate()

        //  if (metaWidth && metaWidth > width) {
        transformer.resize(width)
        //  }
        if (extension === 'AVIF') {
          if (transformer.avif) {
            const avifQuality = quality - 15
            transformer.avif({
              quality: Math.max(avifQuality, 0),
              chromaSubsampling: '4:2:0', // same as webp
            })
          } else {
            transformer.webp({ quality })
          }
        } else if (extension === 'WEBP' || storePicturesInWEBP) {
          transformer.webp({ quality })
        } else if (extension === 'PNG') {
          transformer.png({ quality })
        } else if (extension === 'JPEG' || extension === 'JPG') {
          transformer.jpeg({ quality })
        }

        // Write the optimized image to the file system
        ensureDirectoryExists(processsedFileNameAndPath)
        await transformer.toFile(processsedFileNameAndPath)
        incrementProgressbar(processsedFileNameAndPath)
        widthsToUrls[width] = path.join(
          slideshowUrlBase,
          fileDirectory,
          processedDirectory,
          `${filename}-w${width}.${extension.toLowerCase()}`
        )
      }
      // const imageAspectRatio = metadata.width / metadata.height
      const isPortraitMode = metadata.height > metadata.width
      directoryData[file] = {
        width: metadata.width,
        height: metadata.height,
        srcset: Object.entries(widthsToUrls).reduce(
          (srcset, [currentSize, filenameAndPath], index) =>
            index > 0
              ? `${srcset}, ${filenameAndPath} ${currentSize}w`
              : `${filenameAndPath} ${currentSize}w`,
          ''
        ),
        widthsToUrls,
        sizesString: isPortraitMode ? `32vw` : `80vw`,
      }
    }
    let manifest = JSON.stringify(directoryData, null, 4)
    fs.writeFileSync(directoryDataFilePath, manifest)
  }

  console.log('----  End processing... ---- ')
}

processer()

// if (require.main === module) {
//   processer()
// }
// module.exports = processer
