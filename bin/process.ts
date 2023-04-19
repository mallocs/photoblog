import fs from 'fs'
import sharp from 'sharp'
import exifReader from 'exif-reader'
import path from 'path'
import matter from 'gray-matter'
import { getPostMatter, getPostSlugs } from '#/lib/api'
import { getProgressBar, getDirectoryData } from '#/bin/utils'
import { getLatLngDecimalFromExif } from '#/bin/geoUtils'
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

    const extractExifLatLng =
      Boolean(
        postedArticlesMatter.get(fileDirectory)?.data.slideshow.coordinates
      ) &&
      Boolean(
        postedArticlesMatter.get(fileDirectory)?.data.slideshow.coordinates !==
          'no'
      )

    for (const file of files) {
      const processedPath = path.join(currentProcessedDirectory, file)
      if (directoryData.hasOwnProperty(file)) {
        incrementProgressbar(processedPath)
        continue
      }
      directoryData[file] = {}
      let imagePath = path.join(slideshowFolderPath, fileDirectory, file)

      // Begin sharp transformation logic
      const mainTransformer = await sharp(imagePath)
      const mainMetadata = await mainTransformer.metadata()
      mainTransformer.rotate()
      // account for exif orientation
      const [mainImageActualHeight, mainImageActualWidth] =
        mainMetadata.orientation <= 4 || mainMetadata.orientation === undefined
          ? [mainMetadata.height, mainMetadata.width]
          : [mainMetadata.width, mainMetadata.height]

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

        await mainTransformer
          .composite([
            {
              input: opaqueWatermark,
              top: mainImageActualHeight - Math.floor(1.5 * newHeight),
              left:
                mainImageActualWidth - Math.floor(newWidth + 0.5 * newHeight),
            },
          ])
          .toBuffer()
      }

      await mainTransformer
        .modulate({
          saturation,
        })
        .toFile(processedPath)
      incrementProgressbar(processedPath)

      directoryData[file].blurDataURL = blurSize
        ? await makeBlurDataURL({
            path: processedPath,
            size: blurSize,
          })
        : null

      directoryData[file] = {
        ...directoryData[file],
        ...(extractExifLatLng && {
          map: getLatLngDecimalFromExif(exifReader(mainMetadata.exif)),
        }),
        url: path.join(slideshowUrlBase, fileDirectory, file),
        width: mainImageActualWidth,
        height: mainImageActualHeight,
      }
    }
    let manifest = JSON.stringify(directoryData, null, 4)
    fs.writeFileSync(directoryDataFilePath, manifest)
  }

  console.log('----  End processing... ---- ')
}

processor()
