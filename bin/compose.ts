import fs from 'fs'
import path from 'path'
import inquirer from 'inquirer'
import DatePrompt from 'inquirer-date-prompt'
import matter from 'gray-matter'
import siteConfig from '../site.config.js'

function getSlideshowPaths({
  slideshowsPath = path.join(siteConfig.root, siteConfig.slideshowFolderPath),
  ignoreFiles = siteConfig.ignoreFiles,
}) {
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
const getDefaultDirectory = (answers) => {
  return answers.title
    .toLowerCase()
    .replace(/[^a-zA-Z0-9 ]/g, '')
    .replace(/ /g, '-')
    .replace(/-+/g, '-')
}

function main() {
  inquirer.registerPrompt('date', DatePrompt)

  inquirer
    .prompt([
      {
        name: 'title',
        message: 'Enter post title:',
        default: 'Untitled',
        type: 'input',
      },
      {
        name: 'date',
        type: 'date',
        message: 'Enter the date for the post:',
        filter: (date) => date.toISOString(),
      },
      {
        name: 'author',
        message: 'Choose author:',
        type: 'list',
        choices: Object.keys(siteConfig.authors),
      },
      {
        name: 'fileName',
        message: 'Choose filename:',
        default(answers) {
          return getDefaultDirectory(answers)
        },
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
        type: 'input',
      },
      {
        name: 'slideshowPath',
        message: 'Choose slideshow directory:',
        type: 'list',
        choices: getSlideshowPaths,
      },
      {
        name: 'addCaptions',
        message: 'Add captions',
        type: 'list',
        choices: ['yes', 'no'],
      },
      {
        name: 'indexButtonType',
        message: 'What type of navigation buttons',
        type: 'list',
        default: 'images',
        choices: ['images', 'circles', 'dots'],
      },

      {
        name: 'summary',
        message: 'Enter post summary:',
        type: 'input',
      },
      {
        name: 'geocode',
        message: 'Extract latitude and longitude and reverse geocode',
        type: 'list',
        default: 'yes',
        choices: ['yes', 'no'],
      },
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
      // },
    ])
    .then((answers) => {
      const frontMatter = matter.stringify('', {
        date: answers.date,
        title: answers.title ? answers.title : 'Untitled',
        author: answers.author,
        summary: answers.summary ? answers.summary : ' ',
        slideshow: {
          geocode: answers.geocode,
          path: answers.slideshowPath,
          indexButtonType: answers.indexButtonType,
          captions: getSlideshowCaptionObject({
            folderName: answers.slideshowPath,
          }),
        },
      })
      if (!fs.existsSync(siteConfig.postsDirectory))
        fs.mkdirSync(siteConfig.postsDirectory, { recursive: true })

      const fileFullPath = path.join(
        siteConfig.postsDirectoryFullPath,
        `${answers.fileName}.md`
      )
      fs.writeFile(fileFullPath, frontMatter, { flag: 'wx' }, (err) => {
        if (err) {
          if (err.code === 'EEXIST') {
          }
          throw err
        } else {
          console.log(`Blog post generated successfully at ${answers.fileName}`)
        }
      })
    })
    .catch((error) => {
      console.log(error)
      if (error.isTtyError) {
        console.log("Prompt couldn't be rendered in the current environment")
      } else {
        console.log('Something went wrong, sorry!')
      }
    })
}

main()
