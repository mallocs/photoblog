import 'dotenv/config'
import path from 'path'
import cloudinary from 'cloudinary'
import fs from 'fs'
import sharp from 'sharp'
import matter from 'gray-matter'
import { getPostMatter, getPostSlugs } from '#/lib/api'
import { getProgressBar, getExifData, ensureDirectoryExists } from '#/bin/utils'
import { cloudinaryLoader, loaderNames } from '#/interfaces/imageLoader'
import siteConfig from '#/site.config'

const GITIGNORE_TEMPLATE = './resources/template.gitignore'

// Return "https" URLs by setting secure: true
cloudinary.v2.config({
  secure: true,
})

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

const getPostedArticlesMatter = () =>
  getPostSlugs().reduce(
    (accumulator, currentSlug) =>
      accumulator.set(currentSlug, getPostMatter(currentSlug)),
    new Map<string, matter.GrayMatterFile<string>>()
  )
function falsyNo(value) {
  return Boolean(value) && value !== 'no'
}
function getMatterProcessingOptions(fileDirectory) {
  const slideshowMatterData =
    getPostedArticlesMatter().get(fileDirectory)?.data.slideshow

  return {
    loader: slideshowMatterData.loader,
    geocode: falsyNo(slideshowMatterData.geocode),
    showCoordinates: falsyNo(slideshowMatterData.showCoordinates),
    showDatetimes: falsyNo(slideshowMatterData.showDatetimes),
    stripExif: falsyNo(slideshowMatterData.stripExif),
    artist: slideshowMatterData.artist,
    copyright: slideshowMatterData.copyright,
  }
}

function preprocess(
  slugsToProcess: string[],
  {
    slideshowInputDirectory = siteConfig.slideshowInputDirectory,
    outputDirectory = siteConfig.postsDirectory,
    filterImagesFn = (filename) =>
      siteConfig.imageFileTypes.includes(
        filename.split('.').pop().toLowerCase()
      ),
    manifestFileName = siteConfig.manifestFileName,
    rebuild = false,
  } = {}
): {
  outputDirectory?: string
  imageCount: number // total number of images being processed
  directories: {
    // directory name => list of files in the directory
    [key: string]: {
      files: string[]
      manifestData: JSON[]
      outputDirectory: string
      sourceDirectory: string
      manifestFilePath: string
    }
  }
} {
  ensureDirectoryExists(outputDirectory)
  return slugsToProcess.reduce(
    (fileData, currentSlug) => {
      // Check if directory has already been processed
      const currentOutputDirectory = path.join(outputDirectory, currentSlug)

      const currentSourceDirectory =
        getPostedArticlesMatter().get(currentSlug).data.slideshow
          .sourceDirectory
      ensureDirectoryExists(currentOutputDirectory)

      const currentManifestFilePath = path.join(
        currentOutputDirectory,
        manifestFileName
      )
      const manifestData =
        !rebuild && fs.existsSync(currentManifestFilePath)
          ? JSON.parse(fs.readFileSync(currentManifestFilePath, 'utf8'))
          : {}

      fileData.directories[currentSlug] = {
        files: fs
          .readdirSync(
            path.join(slideshowInputDirectory, currentSourceDirectory)
          )
          .filter(filterImagesFn)
          .filter((file) => !(file in manifestData)), // only process files not found (ie processed) in the manifest
        manifestData,
        sourceDirectory: currentSourceDirectory,
        outputDirectory: currentOutputDirectory,
        manifestFilePath: currentManifestFilePath,
      }

      fileData.imageCount += fileData.directories[currentSlug].files.length
      return fileData
    },
    { directories: {}, imageCount: 0 }
  )
}

export async function processor({
  slugsToProcess = Array.from(getPostedArticlesMatter().keys()),
  widths = undefined,
  rebuild = false,
  ...opts
} = {}) {
  const {
    manifestFileName,
    watermarkFile,
    watermarkSizeRatio,
    watermarkOpacity,
    saturation,
    slideshowInputDirectory,
    blurSize,
  } = { ...siteConfig, ...opts }
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

  watermarkCheckOptions({
    ratio: watermarkSizeRatio,
    opacity: watermarkOpacity,
  })

  const directoryData = preprocess(slugsToProcess, {
    slideshowInputDirectory,
    rebuild,
    manifestFileName,
  })
  console.log(
    `Found ${directoryData.imageCount} supported images in ${slideshowInputDirectory} and subdirectories.`
  )

  if (directoryData.imageCount === 0) {
    return
  }

  if (Array.isArray(widths)) {
    console.log(`Using sizes: ${widths.toString()}`)
    console.log(
      `Start processing ${directoryData.imageCount} images with ${
        widths.length
      } sizes resulting in ${
        directoryData.imageCount * widths.length
      } optimized images...`
    )
  } else {
    console.log(`Start processing ${directoryData.imageCount} images...`)
  }

  const multiBar = getProgressBar()
  const progressBar = multiBar.create(
    directoryData.imageCount * (widths?.length ?? 1),
    0,
    {
      sizeOfGeneratedImages: 0,
    }
  )
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
  const oldConsoleLog = console.log
  const oldConsoleError = console.error

  // console.log = (...args) => args.forEach((arg) => multiBar.log(`${arg}\n`))
  // console.error = (...args) => args.forEach((arg) => multiBar.log(`${arg}\n`))
  // Loop through all directories/images
  for (const [
    fileDirectory,
    { files, manifestData, outputDirectory, manifestFilePath, sourceDirectory },
  ] of Object.entries(directoryData.directories)) {
    const processingOptions = getMatterProcessingOptions(fileDirectory)

    for (const file of files) {
      const processedPath = path.join(outputDirectory, file)
      // Begin sharp transformation logic
      const transformer = await sharp(
        path.join(slideshowInputDirectory, sourceDirectory, file)
      )
      const metadata = await transformer.metadata()

      manifestData[file] = {
        ...(await processImage({
          ...processingOptions,
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
          ...processingOptions,
          metadata,
        })),
        ...(await generateWidths({
          file,
          fileDirectory,
          widths,
          outputDirectory,
          transformer,
          incrementProgressbar,
        })),
        // src: processedPath, A custom src can be added here if a host doesn't
        // have a loader that can map to the default path. A src set in
        // manifest.json should override the default used by api.ts
      }
      if (
        loaderNames.find(
          (loaderName) => loaderName === processingOptions.loader
        )
      ) {
        if (processingOptions.loader === cloudinaryLoader) {
          const outputGitignore = `${outputDirectory}/.gitignore`
          !fs.existsSync(outputGitignore) &&
            fs.copyFile(GITIGNORE_TEMPLATE, outputGitignore, (err) => {
              if (err) throw err
              console.log(`.gitignore copied to ${outputDirectory}`)
            })

          const options = {
            tags: [fileDirectory],
            media_metadata: true,
            folder: outputDirectory,
            use_filename: true,
            unique_filename: false,
            overwrite: true,
          }

          try {
            const result = await cloudinary.v2.uploader.upload(
              processedPath,
              options
            )
            // TODO: debug levels console.log(result)
          } catch (err) {
            console.error(err)
            process.exit(1)
          }
        }
      }

      incrementProgressbar(processedPath)
      fs.writeFileSync(manifestFilePath, JSON.stringify(manifestData, null, 4))
    }
  }
  console.log('----  End processing... ---- ')
  console.log = oldConsoleLog
  console.error = oldConsoleError
}

async function generateWidths({
  file,
  fileDirectory,
  widths,
  outputDirectory,
  transformer,
  incrementProgressbar,
  ...opts
}) {
  if (!widths) {
    return {}
  }
  const {
    resizedDirectory,
    storePicturesInWEBP,
    imageQuality,
    postsDirectory,
  } = { ...siteConfig, ...opts }
  const currentResizedDirectory = path.join(outputDirectory, resizedDirectory)
  ensureDirectoryExists(currentResizedDirectory)
  let extension = storePicturesInWEBP
    ? 'webp'
    : file.split('.').pop().toLowerCase()
  const filename = path.parse(file).name

  // if (directoryData[file]?.widthsToUrls) {
  //   Object.keys(directoryData[file]?.widthsToUrls).forEach((widthString) =>
  //     incrementProgressbar(
  //       path.join(
  //         currentResizedDirectory,
  //         `${filename}-w${widthString}.${extension.toLowerCase()}`
  //       )
  //     )
  //   )
  // }
  const widthsToUrls = {}

  // Loop through all widths
  for (const width of widths) {
    const resizedAndProcessedFileNameAndPath = path.join(
      currentResizedDirectory,
      `${filename}-w${width}.${extension.toLowerCase()}`
    )

    await transformer.clone().resize(width)
    if (extension === 'avif') {
      if (transformer.avif) {
        const avifQuality = imageQuality - 15
        transformer.avif({
          quality: Math.max(avifQuality, 0),
          chromaSubsampling: '4:2:0', // same as webp
        })
      } else {
        transformer.webp({ quality: imageQuality })
      }
    } else if (extension === 'webp') {
      transformer.webp({ quality: imageQuality })
    } else if (extension === 'png') {
      transformer.png({ quality: imageQuality })
    } else if (extension === 'jpeg' || extension === 'jpg') {
      transformer.jpeg({ quality: imageQuality })
    }

    // Write the optimized image to the file system
    await transformer.toFile(resizedAndProcessedFileNameAndPath)
    incrementProgressbar(resizedAndProcessedFileNameAndPath)
    widthsToUrls[width] = path.join(
      postsDirectory,
      fileDirectory,
      `${filename}-w${width}.${extension.toLowerCase()}`
    )
  }
  return {
    srcset: Object.entries(widthsToUrls).reduce(
      (srcset, [currentSize, filenameAndPath], index) =>
        index > 0
          ? `${srcset}, ${filenameAndPath} ${currentSize}w`
          : `${filenameAndPath} ${currentSize}w`,
      ''
    ),
    widthsToUrls,
  }
}

async function processMetadata({
  metadata,
  geocode,
  showDatetimes,
  showCoordinates,
}) {
  return {
    ...(await getExifData({
      rawExif: metadata.exif,
      showCoordinates,
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
