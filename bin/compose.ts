import fs from 'fs'
import path from 'path'
import inquirer from 'inquirer'
import { input } from '@inquirer/prompts'
import DatePrompt from 'inquirer-date-prompt'
import matter from 'gray-matter'
import { slideshowIndexButtonOptions } from '#/interfaces/slideshow'
import siteConfig from '#/site.config.js'

function getSlideshowPaths({
  slideshowsPath = path.join(siteConfig.root, siteConfig.slideshowFolderPath),
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
  slideshowsPath = path.join(siteConfig.root, siteConfig.slideshowFolderPath),
  ignoreFiles = siteConfig.ignoreFiles,
  folderName,
}) {
  const slideshowPath = path.join(slideshowsPath, folderName)
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
    const { filename } = await inquirer.prompt({
      name: 'filename',
      message: 'Choose filename:',
      default: getDefaultDirectory(title),
      validate(input, answers) {
        const fileFullPath = path.join(
          siteConfig.postsDirectoryFullPath,
          `${input || getDefaultDirectory(answers)}.md`
        )
        if (!fs.existsSync(fileFullPath)) {
          return true
        }
        return 'Filename already exists. Chose another name or delete the existing entry.'
      },
    })

    const { slideshowPath } = await inquirer.prompt({
      name: 'slideshowPath',
      message: 'Choose slideshow directory:',
      type: 'list',
      choices: getSlideshowPaths,
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
        path: slideshowPath,
        indexButtonType,
        captions: getSlideshowCaptionObject({
          folderName: slideshowPath,
        }),
      },
    })

    if (!fs.existsSync(siteConfig.postsDirectory))
      fs.mkdirSync(siteConfig.postsDirectory, { recursive: true })

    const fileFullPath = path.join(
      siteConfig.postsDirectoryFullPath,
      `${filename}.md`
    )
    fs.writeFile(fileFullPath, frontMatter, { flag: 'wx' }, (err) => {
      if (err) {
        if (err.code === 'EEXIST') {
        }
        throw err
      } else {
        console.log(`Blog post generated successfully at ${filename}`)
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
