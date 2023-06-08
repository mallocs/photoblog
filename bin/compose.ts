import fs from 'fs'
import path from 'path'
import inquirer from 'inquirer'
import { input, confirm } from '@inquirer/prompts'
import DatePrompt from 'inquirer-date-prompt'
import matter from 'gray-matter'
import { slideshowIndexButtonOptions } from '#/interfaces/slideshow'
import { processor } from './processingUtils'
import siteConfig from '#/site.config.js'

function getSlideshowDirectories({
  slideshowsPath = path.join(
    siteConfig.root,
    siteConfig.slideshowInputDirectory
  ),
  ignoreFiles = siteConfig.ignoreFiles,
} = {}): string[] {
  return fs
    .readdirSync(slideshowsPath)
    .map((filename) => path.parse(filename).name)
    .filter((fileName) =>
      ignoreFiles.every((ignoreFileName) => ignoreFileName != fileName)
    )
}

// const getLayouts = () => {
//   const layoutPath = path.join(root, 'layouts')
//   const layoutList = fs
//     .readdirSync(layoutPath)
//     .map((filename) => path.parse(filename).name)
//     .filter((file) => file.toLowerCase().includes('post'))
//   return layoutList
// }

function getSlideshowCaptionObject({
  slideshowsPath = path.join(
    siteConfig.root,
    siteConfig.slideshowInputDirectory
  ),
  ignoreFiles = siteConfig.ignoreFiles,
  directory,
}) {
  const slideshowPath = path.join(slideshowsPath, directory)
  return fs
    .readdirSync(slideshowPath)
    .filter((fileName) =>
      ignoreFiles.every((ignoreFileName) => ignoreFileName != fileName)
    )
    .reduce((accumulator, current) => {
      accumulator[current] = ''
      return accumulator
    }, {})
}

// Remove special characters and replace space with -
const getDefaultDirectory = (input) => {
  return input
    .toLowerCase()
    .replace(/[^a-zA-Z0-9 ]/g, '')
    .replace(/ /g, '-')
    .replace(/-+/g, '-')
}

async function main() {
  inquirer.registerPrompt('date', DatePrompt)

  try {
    const title = await input({
      message: 'Enter post title:',
      default: 'Untitled',
    })

    const { date } = await inquirer.prompt({
      name: 'date',
      type: 'date',
      message: 'Enter the date for the post:',
      filter: (date) => date.toISOString(),
    })

    const { author } = await inquirer.prompt({
      name: 'author',
      type: 'list',
      message: 'Choose author:',
      choices: Object.keys(siteConfig.authors),
    })

    const { artist } = await inquirer.prompt({
      name: 'artist',
      type: 'input',
      default:
        siteConfig.authors.hasOwnProperty(author) &&
        siteConfig.authors[author].artist
          ? siteConfig.authors[author].artist
          : null,
      message: '(Optional) Choose artist for slideshow EXIF data:',
    })

    const { copyright } = await inquirer.prompt({
      name: 'copyright',
      type: 'input',
      default:
        siteConfig.authors.hasOwnProperty(author) &&
        siteConfig.authors[author].copyright
          ? siteConfig.authors[author].copyright
          : null,
      message: '(Optional) Choose copyright for slideshow EXIF data:',
    })

    const { currentPostDirectory } = await inquirer.prompt({
      name: 'currentPostDirectory',
      message: 'Choose post directory name:',
      default: getDefaultDirectory(title),
      validate(input, answers) {
        const fileFullPath = path.join(
          siteConfig.postsDirectory,
          input || getDefaultDirectory(answers),
          siteConfig.postMarkdownFileName
        )
        if (!fs.existsSync(fileFullPath)) {
          return true
        }
        return 'Directory already exists. Chose another name or delete the existing entry.'
      },
    })

    const { slideshowSourceDirectory } = await inquirer.prompt({
      name: 'slideshowSourceDirectory',
      message: 'Choose slideshow directory:',
      type: 'list',
      choices: getSlideshowDirectories,
    })

    const { indexButtonType } = await inquirer.prompt({
      name: 'indexButtonType',
      message: 'What type of navigation buttons',
      type: 'list',
      default: 'images',
      choices: slideshowIndexButtonOptions,
    })
    const summary = await input({
      message: 'Enter post summary:',
    })
    const { geocode } = await inquirer.prompt({
      name: 'geocode',
      message: 'Extract latitude and longitude and reverse geocode',
      type: 'list',
      default: 'yes',
      choices: ['yes', 'no'],
    })
    const { showDatetimes } = await inquirer.prompt({
      name: 'showDatetimes',
      message: 'Show photo date and time',
      type: 'list',
      default: 'yes',
      choices: ['yes', 'no'],
    })

    const processNow = await confirm({
      message: 'Process slideshow now?',
      default: true,
    })

    // TODO types
    // {
    //   name: 'draft',
    //   message: 'Set post as draft?',
    //   type: 'list',
    //   choices: ['yes', 'no'],
    // },
    // {
    //   name: 'private',
    //   message: 'Set post as private?',
    //   type: 'list',
    //   choices: ['yes', 'no'],
    // },
    // {
    //   name: 'tags',
    //   message: 'Any Tags? Separate them with , or leave empty if no tags.',
    //   type: 'input',
    // },
    // {
    //   name: 'layout',
    //   message: 'Select layout',
    //   type: 'list',
    //   choices: getLayouts,
    // },
    // {
    //   name: 'canonicalUrl',
    //   message: 'Enter canonical url:',
    //   type: 'input',
    // }
    const frontMatter = matter.stringify('', {
      date,
      title: title !== undefined ? title : 'Untitled',
      author,
      summary: summary !== undefined ? summary : ' ',
      slideshow: {
        geocode,
        showDatetimes,
        ...(artist && { artist }),
        ...(copyright && { copyright }),
        sourceDirectory: slideshowSourceDirectory,
        indexButtonType,
        captions: getSlideshowCaptionObject({
          directory: slideshowSourceDirectory,
        }),
      },
    })

    const outputDirectory = path.join(
      siteConfig.postsDirectory,
      currentPostDirectory
    )

    if (!fs.existsSync(outputDirectory))
      fs.mkdirSync(outputDirectory, { recursive: true })

    const fileFullPath = path.join(
      outputDirectory,
      siteConfig.postMarkdownFileName
    )

    fs.writeFile(fileFullPath, frontMatter, { flag: 'wx' }, (err) => {
      if (err) {
        throw err
      } else {
        console.log(`Blog post generated successfully at ${fileFullPath}`)
        if (processNow) {
          processor({ slugsToProcess: [currentPostDirectory] })
        }
      }
    })
  } catch (error) {
    console.log(error)
    if (error.isTtyError) {
      console.log("Prompt couldn't be rendered in the current environment")
    } else {
      console.log('Something went wrong, sorry!')
    }
  }
}

main()
