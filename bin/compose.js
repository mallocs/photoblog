// Loosely based on https://github.com/timlrx/tailwind-nextjs-starter-blog/blob/master/scripts/compose.js

import fs from 'fs'
import path from 'path'
import inquirer from 'inquirer'
import dedent from 'dedent'
import DatePrompt from 'inquirer-date-prompt'

const root = process.cwd()

const ignoreFiles = ['.DS_Store']
const DEFAULT_POSTS_DIRECTORY = '_posts'

// const getAuthors = () => {
//   const authorPath = path.join(root, 'public', 'assets', 'authors')
//   const authorList = fs
//     .readdirSync(authorPath)
//     .map((filename) => path.parse(filename).name)
//   return authorList
// }

const getSlideshowPaths = () => {
  const slideshowsPath = path.join(root, 'public', 'assets', 'slideshows')
  const slideshowsList = fs
    .readdirSync(slideshowsPath)
    .map((filename) => path.parse(filename).name)
    .filter((fileName) =>
      ignoreFiles.every((ignoreFileName) => ignoreFileName != fileName)
    )
  return slideshowsList
}

// const getLayouts = () => {
//   const layoutPath = path.join(root, 'layouts')
//   const layoutList = fs
//     .readdirSync(layoutPath)
//     .map((filename) => path.parse(filename).name)
//     .filter((file) => file.toLowerCase().includes('post'))
//   return layoutList
// }

function getSlideshowCaptionYaml(folderName) {
  const slideshowsPath = path.join(
    root,
    'public',
    'assets',
    'slideshows',
    folderName
  )
  return fs
    .readdirSync(slideshowsPath)
    .filter((fileName) =>
      ignoreFiles.every((ignoreFileName) => ignoreFileName != fileName)
    )
    .reduce((accumulator, current) => {
      return `${accumulator}\n      ${current}: ""`
    }, 'captions: ')
}

const genFrontMatter = (answers) => {
  // const tagArray = answers.tags.split(',')
  // tagArray.forEach((tag, index) => (tagArray[index] = tag.trim()))
  // const tags = "'" + tagArray.join("','") + "'"
  // const authorArray =
  //   answers.authors.length > 0 ? "'" + answers.authors.join("','") + "'" : ''

  // TODO:
  // tags: [${answers.tags ? tags : ''}]
  //  tags:
  // draft:  ${answers.draft === 'yes' ? true : false}
  // layout: ${answers.layout}'
  // canonicalUrl: ${answers.canonicalUrl}
  let frontMatter = dedent`---
  date: '${answers.date}'
  title: ${answers.title ? answers.title : 'Untitled'}
  summary: ${answers.summary ? answers.summary : ' '}
  draft: no
  layout: Default 
  slideshow:
    path: '${answers.slideshowPath}'
    indexButtonType: '${answers.indexButtonType}'
    ${answers.addCaptions && getSlideshowCaptionYaml(answers.slideshowPath)}
  `

  // if (answers.authors.length > 0) {
  //   frontMatter = frontMatter + '\n' + `authors: [${authorArray}]`
  // }

  frontMatter = frontMatter + '\n---'

  return frontMatter
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
        type: 'input',
      },
      {
        name: 'date',
        type: 'date',
        message: 'Enter the date for the post:',
        filter: (date) => date.toISOString(),
      },
      {
        name: 'fileName',
        message: 'Choose filename:',
        default(answers) {
          return getDefaultDirectory(answers)
        },
        validate(input, answers) {
          const fileFullPath = path.join(
            root,
            DEFAULT_POSTS_DIRECTORY,
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
      // {
      //   name: 'authors',
      //   message: 'Choose authors:',
      //   type: 'checkbox',
      //   choices: getAuthors,
      // },
      {
        name: 'summary',
        message: 'Enter post summary:',
        type: 'input',
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
      const frontMatter = genFrontMatter(answers)
      if (!fs.existsSync(DEFAULT_POSTS_DIRECTORY))
        fs.mkdirSync(DEFAULT_POSTS_DIRECTORY, { recursive: true })

      const fileFullPath = path.join(
        root,
        DEFAULT_POSTS_DIRECTORY,
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
