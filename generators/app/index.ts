require('source-map-support').install();

import * as Generator from 'yeoman-generator'
import * as gulpRename from 'gulp-rename'
const chalk = require('chalk')
const yosay = require('yosay')
const shelljs = require('shelljs')

import images, { ContainerGroup } from './images'
import inits from './inits'
import { copyAllTpl, copyTpl } from './templating'

interface GitInfo {
  authorName: string,
  authorEmail: string
}

class AppGenerator extends Generator {
  gitInfo!: GitInfo
  answers!: Generator.Answers

  prompting () {
    // Have Yeoman greet the user.
    this.log(
      yosay('Welcome to the epic ' + chalk.red('generator-docker-devbox') + ' generator!')
    )

    this.gitInfo = {
      authorName: shelljs
        .exec('git config user.name', { silent: true })
        .stdout.toString().replace(/\n/g, ''),
      authorEmail: shelljs
        .exec('git config user.email', { silent: true })
        .stdout.toString().replace(/\n/g, '')
    }

    const prompts: Generator.Question[] = [
      {
        type: 'input',
        name: 'projectName',
        message: 'Technical project name',
        default: this.appname,
        store: true
      },
      {
        type: 'input',
        name: 'authorName',
        message: 'Author name',
        default: this.gitInfo.authorName,
        store: true
      },
      {
        type: 'input',
        name: 'authorEmail',
        message: 'Author email',
        default: this.gitInfo.authorEmail,
        store: true
      },
      {
        type: 'input',
        name: 'portPrefix',
        message: 'Prefix of docker-compose port mappings [10-655]',
        default: () => {
          return Math.floor(Math.random() * (655 - 10)) + 10
        },
        validate: (input: string) => {
          const intInput = parseInt(input, 10)
          return intInput > 9 && intInput < 655
        },
        store: true
      }
    ]

    for (const image of images) {
      const imagePrompts = image.prompts()
      if (imagePrompts) {
        prompts.push(...imagePrompts)
      }
    }

    for (const init of inits) {
      const initPrompts = init.prompts()
      if (initPrompts) {
        prompts.push(...initPrompts)
      }
    }

    return this.prompt(prompts).then((answers: Generator.Answers) => {
      // To access answers later use this.answers.someAnswer;

      answers.projectName = answers.projectName.replace(/ /g, '-')

      for (const groupOrImage of images) {
        if (!answers[groupOrImage.imageVariable]) {
          if (groupOrImage instanceof ContainerGroup && groupOrImage.images.length === 1) {
            // When there's a single image in the group, no prompt is shown to choose image.
            answers[groupOrImage.imageVariable] = groupOrImage.images[0].name
          } else {
            answers[groupOrImage.imageVariable] = groupOrImage.name
          }
        }

        if (!answers[groupOrImage.containerVariable]) {
          delete answers[groupOrImage.imageVariable]
        }
      }

      answers.init = false
      for (const init of inits) {
        if (answers[init.initVariable]) {
          answers.init = true
        }
      }

      this.answers = answers
    })
  }

  writing () {
    this.registerTransformStream(
      gulpRename(function (path) {
        if (path.extname === '.hbs') {
          const splitBasename = path.basename ? path.basename.split('.') : ['']
          path.extname = (splitBasename.length > 1 ? '.' : '') + splitBasename.pop()
          path.basename = splitBasename.join('.')
        }
      })
    )

    for (const image of images) {
      if (this.answers[image.imageVariable]) {
        if (image.before) {
          image.before(this)
        }
      }
    }

    for (const init of inits) {
      if (this.answers[init.initVariable]) {
        if (init.before) {
          init.before(this)
        }
      }
    }

    const defaultIncludes = [
      '*',
      '.bin/dc', '.bin/run', '.bin/system', '.bin/yo', '.bin/mo',
      '**/*.d/*'
    ]

    copyAllTpl(this, defaultIncludes)

    for (const image of images) {
      if (this.answers[image.imageVariable]) {
        const imageName = this.answers[image.imageVariable]

        copyTpl(
          this.fs,
          this.templatePath(`**/${imageName}/**/*`),
          this.destinationRoot(),
          this.answers
        )

        copyTpl(
          this.fs,
          this.templatePath(`**/.${imageName}/**/*`),
          this.destinationRoot(),
          this.answers
        )

        if (image.files) {
          copyAllTpl(this, image.files)
        }
      }
    }

    if (this.answers.init) {
      copyTpl(
        this.fs,
        this.templatePath('.init/*'),
        this.destinationPath('.init'),
        this.answers
      )
    }

    for (const init of inits) {
      if (this.answers[init.initVariable]) {
        const initName = init.name

        copyTpl(
          this.fs,
          this.templatePath(`**/.init/init.d/${initName}.*`),
          this.destinationRoot(),
          this.answers
        )

        if (init.files) {
          copyAllTpl(this, init.files)
        }
      }
    }

    for (const image of images) {
      if (this.answers[image.imageVariable]) {
        if (image.after) {
          image.after(this)
        }
      }
    }

    for (const init of inits) {
      if (this.answers[init.initVariable]) {
        if (init.after) {
          init.after(this)
        }
      }
    }
  }

  init () {
    for (const init of inits) {
      if (this.answers[init.initVariable] && init.init) {
        init.init(this)
      }
    }
  }

  install () {
    // git clone {{drupalRepositoryUrl}} .
    // rm -Rf .git/
    // Run composer install & co
  }
}

export default AppGenerator
