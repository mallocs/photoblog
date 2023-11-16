import path from 'path'
import fs from 'fs'
import env from '@next/env'
import cloudinary from 'cloudinary'
import inquirer from 'inquirer'
import { cloudinaryLoader, loaderNames } from '#/interfaces/imageLoader'
import {
  getMatterProcessingOptions,
  getPostedArticlesMatter,
  getSlideshowFiles,
} from '#/bin/processingUtils'
import { commitAsync, addFile, getGitRootPath, isCommitted } from './git/'
import siteConfig from '#/site.config'

env.loadEnvConfig(process.cwd())

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
})

async function publishToCloudinary(
  fileFullPath,
  userOptions,
  options = {
    media_metadata: true,
    use_filename: true,
    unique_filename: false,
    overwrite: true,
    ...userOptions,
  }
) {
  try {
    console.log(`Pushing to cloudinary: ${fileFullPath}`)
    const result = await cloudinary.v2.uploader.upload(fileFullPath, options)
    // TODO: debug levels console.log(result)
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
}

function getPostDirectories({
  slideshowsPath = siteConfig.postsDirectory,
  ignoreFiles = siteConfig.ignoreFiles,
} = {}): string[] {
  return fs
    .readdirSync(slideshowsPath)
    .map((filename) => path.parse(filename).name)
    .filter((fileName) =>
      ignoreFiles.every((ignoreFileName) => ignoreFileName != fileName)
    )
}

async function main() {
  console.log(siteConfig.root)
  const publishableDirectories = getPostDirectories().filter(
    (directory) =>
      !isCommitted(
        siteConfig.root,
        path.join(
          siteConfig.postsDirectory,
          directory,
          siteConfig.postMarkdownFileName
        )
      )
  )
  if (publishableDirectories.length === 0) {
    console.log(
      'No posts ready to publish. Run compose and process to prepare a post to publish'
    )
    return
  }
  const { slug } = await inquirer.prompt({
    name: 'slug',
    message: 'Choose a post to publish:',
    type: 'list',
    choices: publishableDirectories,
  })

  const directoryToPublish = path.join(siteConfig.postsDirectory, slug)
  // TODO: git doesn't seem to add the symlink path.
  const directoryToPublishNoSym = path.join(
    siteConfig.root,
    siteConfig.postsFullPath,
    slug
  )

  const processingOptions = getMatterProcessingOptions(slug)
  const slugMatter = getPostedArticlesMatter().get(slug)
  const repoPath = getGitRootPath()

  addFile(
    repoPath,
    path.join(directoryToPublishNoSym, siteConfig.postMarkdownFileName)
  )
  addFile(
    repoPath,
    path.join(directoryToPublishNoSym, siteConfig.manifestFileName)
  )
  const slideshowFiles = getSlideshowFiles({
    slug,
    slideshowPath: directoryToPublish,
  })
  if (
    loaderNames.find((loaderName) => loaderName === processingOptions.loader)
  ) {
    if (processingOptions.loader === cloudinaryLoader) {
      slideshowFiles?.forEach((file) => {
        publishToCloudinary(path.join(directoryToPublish, file), {
          tags: [slug],
          folder: directoryToPublish,
        })
      })
    }
  } else {
    //no loader specified so use built in vercel which reads images committed to the repo
    slideshowFiles?.forEach((file) => {
      addFile(repoPath, path.join(directoryToPublishNoSym, file))
    })
  }
  const result = await commitAsync(
    repoPath,
    `Post: ${slugMatter?.data.title ?? new Date().toLocaleDateString('en-US')}`,
    {}
  )
  if (result === true) {
    console.log('Run git push to finish publishing.')
  }
}
main()
