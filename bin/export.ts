import fs from 'fs'
import path from 'path'
import sharp from 'sharp'
import {
  getProgressBar,
  ensureDirectoryExists,
  getDirectoryData,
} from './utils.js'
import siteConfig from '#/site.config.js'
import nextJsConfig from '#/next.config.mjs'

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

  const {
    processedDirectory,
    resizedDirectoryName,
    slideshowUrlBase,
    imageSizes,
    imageQuality,
    storePicturesInWEBP,
    blurSize,
  } = { ...siteConfig, ...nextJsConfig.images, ...opts }

  const widths = [blurSize, ...imageSizes]
  const progressBar = getProgressBar()

  const fileData = getDirectoryData(processedDirectory)

  console.log(
    `Found ${fileData.imageCount} supported images in ${processedDirectory} and subdirectories.`
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
      siteConfig.manifestFileName
    )
    const directoryData = fs.existsSync(directoryDataFilePath)
      ? JSON.parse(fs.readFileSync(directoryDataFilePath, 'utf8'))
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
            const avifQuality = imageQuality - 15
            mainTransformer.avif({
              quality: Math.max(avifQuality, 0),
              chromaSubsampling: '4:2:0', // same as webp
            })
          } else {
            mainTransformer.webp({ quality: imageQuality })
          }
        } else if (extension === 'webp' || storePicturesInWEBP) {
          mainTransformer.webp({ quality: imageQuality })
        } else if (extension === 'png') {
          mainTransformer.png({ quality: imageQuality })
        } else if (extension === 'jpeg' || extension === 'jpg') {
          mainTransformer.jpeg({ quality: imageQuality })
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
