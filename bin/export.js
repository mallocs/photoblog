#!/usr/bin/env node

const fs = require('fs')
const sharp = require('sharp')
const path = require('path')
const {
  getProgressBar,
  ensureDirectoryExists,
  getDirectories,
  IMAGE_FILE_TYPES,
  MANIFEST_FILENAME,
} = require('./utils')

async function exporter(opts = {}) {
  console.log('----  Begin exporting... ---- ')

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
    resizedDirectoryName: processorConfig._processorRESIZED_DIRECTORY_NAME,
    slideshowUrlBase: processorConfig._processorSLIDESHOW_URL_BASE,
    imageSizes: [
      ...(imageConfig.imageSizes || [16, 32, 48, 64, 96, 128, 256, 384]),
      ...(imageConfig.deviceSizes || [
        640, 750, 828, 1080, 1200, 1920, 2048, 3840,
      ]),
    ],
    quality: processorConfig._processorIMAGE_QUALITY,
    storePicturesInWEBP: processorConfig._processorSTORE_PICTURES_IN_WEBP,
    blurSize: processorConfig._processorBLUR_SIZE,
  }

  const {
    processedDirectory,
    resizedDirectoryName,
    slideshowUrlBase,
    imageSizes,
    quality,
    storePicturesInWEBP,
    blurSize,
  } = { ...defaults, ...opts }

  const directories = getDirectories(processedDirectory)
  const fileData = directories.reduce(
    (fileData, currentSlideshowDirectory) => {
      fileData.directories[currentSlideshowDirectory] = fs
        .readdirSync(path.join(processedDirectory, currentSlideshowDirectory))
        .filter((filename) =>
          IMAGE_FILE_TYPES.includes(filename.split('.').pop().toLowerCase())
        )
      fileData.imageCount +=
        fileData.directories[currentSlideshowDirectory].length
      return fileData
    },
    { directories: {}, imageCount: 0 }
  )

  console.log(
    `Found ${fileData.imageCount} supported images in ${processedDirectory} and subdirectories.`
  )

  const widths = [blurSize, ...imageSizes]
  const progressBar = getProgressBar()

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
  function incrementProgressbar(filenameAndPath) {
    const stats = fs.statSync(filenameAndPath)
    const fileSizeInBytes = stats.size
    const fileSizeInMegabytes = fileSizeInBytes / (1024 * 1024)
    sizeOfGeneratedImages += fileSizeInMegabytes
    progressBar.increment({
      sizeOfGeneratedImages: sizeOfGeneratedImages.toFixed(1),
    })
    return sizeOfGeneratedImages
  }

  // Loop through all directories/images
  for (const [fileDirectory, files] of Object.entries(fileData.directories)) {
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
      MANIFEST_FILENAME
    )
    const directoryData = fs.existsSync(directoryDataFilePath)
      ? JSON.parse(fs.readFileSync(directoryDataFilePath))
      : {}

    const currentResizedDirectory = path.join(
      currentProcessedDirectory,
      resizedDirectoryName
    )
    if (!fs.existsSync(currentResizedDirectory)) {
      fs.mkdirSync(currentResizedDirectory)
    }

    for (const file of files) {
      let imagePath = path.join(currentProcessedDirectory, file)
      let extension = file.split('.').pop().toLowerCase()
      const filename = path.parse(file).name

      if (directoryData[file]?.widthsToUrls) {
        Object.keys(directoryData[file]?.widthsToUrls).forEach((widthString) =>
          incrementProgressbar(
            path.join(
              currentResizedDirectory,
              `${filename}-w${widthString}.${extension.toLowerCase()}`
            )
          )
        )
      }

      directoryData[file] = {
        ...directoryData[file],
      }

      // Begin sharp transformation logic
      const mainTransformer = await sharp(imagePath)
      const mainMetadata = await mainTransformer.metadata()
      mainTransformer.rotate()

      const widthsToUrls = {}

      // Loop through all widths
      for (let indexWidth = 0; indexWidth < widths.length; indexWidth++) {
        const width = widths[indexWidth]

        if (storePicturesInWEBP) {
          extension = 'webp'
        }

        const resizedAndProcessedFileNameAndPath = path.join(
          currentResizedDirectory,
          `${filename}-w${width}.${extension.toLowerCase()}`
        )
        await mainTransformer.clone().resize(width)
        if (extension === 'avif') {
          if (mainTransformer.avif) {
            const avifQuality = quality - 15
            mainTransformer.avif({
              quality: Math.max(avifQuality, 0),
              chromaSubsampling: '4:2:0', // same as webp
            })
          } else {
            mainTransformer.webp({ quality })
          }
        } else if (extension === 'webp' || storePicturesInWEBP) {
          mainTransformer.webp({ quality })
        } else if (extension === 'png') {
          mainTransformer.png({ quality })
        } else if (extension === 'jpeg' || extension === 'jpg') {
          mainTransformer.jpeg({ quality })
        }

        // Write the optimized image to the file system
        ensureDirectoryExists(resizedAndProcessedFileNameAndPath)
        await mainTransformer.toFile(resizedAndProcessedFileNameAndPath)
        incrementProgressbar(resizedAndProcessedFileNameAndPath)
        widthsToUrls[width] = path.join(
          slideshowUrlBase,
          fileDirectory,
          `${filename}-w${width}.${extension.toLowerCase()}`
        )
      }
      directoryData[file] = {
        ...directoryData[file],
        url: path.join(slideshowUrlBase, fileDirectory, file),
        width: mainMetadata.width,
        height: mainMetadata.height,
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
    let manifest = JSON.stringify(directoryData, null, 4)
    fs.writeFileSync(directoryDataFilePath, manifest)
  }

  console.log('----  End exporting... ---- ')
}

exporter()
