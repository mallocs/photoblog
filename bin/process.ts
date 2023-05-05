import fs from 'fs'
import sharp from 'sharp'
import path from 'path'
import matter from 'gray-matter'
import { getPostMatter, getPostSlugs } from '#/lib/api'
import { getProgressBar, getDirectoryData, getExifData } from '#/bin/utils'
import siteConfig from '#/site.config'

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

const watermarkCheckOptions = ({
  opacity,
  ratio,
}: {
  opacity: number
  ratio: number
}) => {
  if (ratio > 1) {
    throw ErrorScaleRatio
  }
  if (opacity > 1) {
    throw ErrorOpacity
  }
  return { opacity, ratio }
}

async function makeBlurDataURL({ path, size, saturation = 1, brightness = 1 }) {
  const { data: blurData, info: blurInfo } = await sharp(path)
    .clone()
    .resize(size, size, {
      fit: 'inside',
    })
    .normalise()
    .modulate({ saturation, brightness })
    .removeAlpha()
    .toBuffer({ resolveWithObject: true })

  return `data:image/${blurInfo.format};base64,${blurData.toString('base64')}`
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

  const {
    processedDirectory,
    slideshowUrlBase,
    watermarkFile,
    watermarkSizeRatio,
    watermarkOpacity,
    saturation,
    slideshowFolderPath,
    blurSize,
  } = { ...siteConfig, ...opts }

  watermarkCheckOptions({
    ratio: watermarkSizeRatio,
    opacity: watermarkOpacity,
  })

  const postedArticlesMatter = getPostSlugs().reduce(
    (accumulator, currentSlug) => {
      const matter = getPostMatter(currentSlug)
      const path = matter.data.slideshow.path
      return accumulator.set(path, matter)
    },
    new Map<string, matter.GrayMatterFile<string>>()
  )

  const fileData = getDirectoryData(slideshowFolderPath, {
    // only process directories that have been included in a post
    filterDirectoriesFn: (directoryName) =>
      postedArticlesMatter.has(directoryName),
  })
  console.log(
    `Found ${fileData.imageCount} supported images in ${slideshowFolderPath} and subdirectories.`
  )

  const progressBar = getProgressBar()

  if (fileData.imageCount > 0) {
    console.log(`Start processing ${fileData.imageCount} images...`)
    progressBar.start(fileData.imageCount, 0, { sizeOfGeneratedImages: 0 })
  }
  let sizeOfGeneratedImages = 0
  function incrementProgressbar(filenameAndPath) {
    const stats = fs.statSync(filenameAndPath)
    const fileSizeInBytes = stats.size
    const fileSizeInMegabytes = fileSizeInBytes / (1024 * 1024)
    sizeOfGeneratedImages += fileSizeInMegabytes
    progressBar.increment({
      sizeOfGeneratedImages: sizeOfGeneratedImages.toFixed(1),
    })
  }

  function falsyNo(value) {
    return Boolean(value) && value !== 'no'
  }
  function getMatterProcessingOptions(fileDirectory) {
    const slideshowMatterData =
      postedArticlesMatter.get(fileDirectory)?.data.slideshow

    return {
      geocode: falsyNo(slideshowMatterData.geocode),
      showDatetimes: falsyNo(slideshowMatterData.showDatetimes),
      stripExif: falsyNo(slideshowMatterData.stripExif),
      artist: slideshowMatterData.artist,
      copyright: slideshowMatterData.copyright,
    }
  }

  // Loop through all directories/images
  for (const [fileDirectory, files] of Object.entries(fileData.directories)) {
    // Check if directory has already been processed
    const currentProcessedDirectory = path.join(
      processedDirectory,
      fileDirectory
    )
    if (!fs.existsSync(processedDirectory)) {
      fs.mkdirSync(processedDirectory)
    }
    if (!fs.existsSync(currentProcessedDirectory)) {
      fs.mkdirSync(currentProcessedDirectory)
    }

    const directoryDataFilePath = path.join(
      currentProcessedDirectory,
      siteConfig.manifestFileName
    )
    const directoryData = fs.existsSync(directoryDataFilePath)
      ? JSON.parse(fs.readFileSync(directoryDataFilePath, 'utf8'))
      : {}

    for (const file of files) {
      if (directoryData.hasOwnProperty(file)) {
        incrementProgressbar(path.join(currentProcessedDirectory, file))
        continue
      }
      const processedPath = path.join(currentProcessedDirectory, file)
      // Begin sharp transformation logic
      const transformer = await sharp(
        path.join(slideshowFolderPath, fileDirectory, file)
      )
      const metadata = await transformer.metadata()

      directoryData[file] = {
        ...(await processImage({
          ...getMatterProcessingOptions(fileDirectory),
          processedPath,
          transformer,
          metadata,
          watermarkFile,
          watermarkOpacity,
          watermarkSizeRatio,
          saturation,
          blurSize,
        })),
        ...(await processMetadata({
          ...getMatterProcessingOptions(fileDirectory),
          metadata,
        })),
        url: path.join(slideshowUrlBase, fileDirectory, file),
      }
      incrementProgressbar(processedPath)

      fs.writeFileSync(
        directoryDataFilePath,
        JSON.stringify(directoryData, null, 4)
      )
    }
  }

  console.log('----  End processing... ---- ')
}

processor()

async function processMetadata({ metadata, geocode, showDatetimes }) {
  return {
    ...(await getExifData({
      rawExif: metadata.exif,
      coordinates: geocode,
      geocode,
      dateTimeOriginal: showDatetimes,
    })),
  }
}

async function processImage({
  stripExif,
  copyright,
  artist,
  processedPath,
  transformer,
  metadata,
  watermarkFile,
  watermarkOpacity,
  watermarkSizeRatio,
  saturation,
  blurSize,
}) {
  transformer.rotate()
  // account for exif orientation
  const [mainImageActualHeight, mainImageActualWidth] =
    metadata.orientation <= 4 || metadata.orientation === undefined
      ? [metadata.height, metadata.width]
      : [metadata.width, metadata.height]

  if (watermarkFile !== null) {
    const watermarkTransformer = await sharp(watermarkFile)
    const watermarkMetadata = await watermarkTransformer.metadata()

    const [watermarkActualHeight, watermarkActualWidth] =
      watermarkMetadata.orientation <= 4 ||
      watermarkMetadata.orientation === undefined
        ? [watermarkMetadata.height, watermarkMetadata.width]
        : [watermarkMetadata.width, watermarkMetadata.height]

    const [newHeight, newWidth] = getDimensions(
      mainImageActualHeight,
      mainImageActualWidth,
      watermarkActualHeight,
      watermarkActualWidth,
      watermarkSizeRatio
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

    await transformer
      .composite([
        {
          input: opaqueWatermark,
          top: mainImageActualHeight - Math.floor(1.5 * newHeight),
          left: mainImageActualWidth - Math.floor(newWidth + 0.5 * newHeight),
        },
      ])
      .toBuffer()
  }

  const outputMetadata = {
    exif: {
      IFD0: {
        ...(copyright && { Copyright: copyright }),
        ...(artist && { Artist: artist }),
      },
    },
  }

  if (stripExif) {
    // sharp doesn't seem to have a way to strip exif data when using .withMetadata
    // so this strips the exif data and then adds in the requested fields.
    const buffer = await transformer
      .modulate({
        saturation,
      })
      .toBuffer()
    await sharp(buffer).withMetadata(outputMetadata).toFile(processedPath)
  } else {
    await transformer
      .modulate({
        saturation,
      })
      .withMetadata(outputMetadata)
      .toFile(processedPath)
  }

  return {
    blurDataURL: blurSize
      ? await makeBlurDataURL({
          path: processedPath,
          size: blurSize,
        })
      : null,
    width: mainImageActualWidth,
    height: mainImageActualHeight,
  }
}
