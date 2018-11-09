require('source-map-support').install()

const path = require('path')
import * as Generator from 'yeoman-generator'
import * as gulpRename from 'gulp-rename'
import images, { ContainerGroup } from './images'
import inits from './inits'
import { copyAllTpl, copyTpl } from './templating'

const chalk = require('chalk')
const yosay = require('yosay')

interface GitInfo {
  authorName: string,
  authorEmail: string
}

export default class AppGenerator extends Generator {
  gitInfo!: GitInfo
  answers!: Generator.Answers

  paths () {
    // It seems yeoman can't setup sourceRoot automatically, don't know why :(
    this.sourceRoot(path.join(__dirname, 'templates'))
  }

  prompting () {
    // Have Yeoman greet the user.
    this.log(
      yosay('Welcome to the epic ' + chalk.red('generator-docker-devbox') + ' generator!')
    )

    this.gitInfo = {
      authorName: this.user.git.name(),
      authorEmail: this.user.git.email()
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
          this,
          this.templatePath(`**/${imageName}/**/*`),
          this.destinationRoot(),
        )

        copyTpl(
          this,
          this.templatePath(`**/.${imageName}/**/*`),
          this.destinationRoot(),
        )

        if (image.files) {
          copyAllTpl(this, image.files)
        }
      }
    }

    if (this.answers.init) {
      copyTpl(
        this,
        this.templatePath('.init/*'),
        this.destinationPath('.init'),
      )
    }

    for (const init of inits) {
      if (this.answers[init.initVariable]) {
        const initName = init.name

        copyTpl(
          this,
          this.templatePath(`**/.init/init.d/${initName}.*`),
          this.destinationRoot(),
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
