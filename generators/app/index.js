'use strict'
const Generator = require('yeoman-generator')
const chalk = require('chalk')
const yosay = require('yosay')
const shelljs = require('shelljs')
const path = require('path')

const images = require('./images')
const inits = require('./inits')
const templating = require('./templating')

const gulpRename = require('gulp-rename')

module.exports = class extends Generator {
  prompting() {
    // Have Yeoman greet the user.
    this.log(
      yosay('Welcome to the epic ' + chalk.red('generator-docker-devbox') + ' generator!')
    )

    this.gitInfo = {
      authorName: shelljs
        .exec('git config user.name', { silent: true })
        .stdout.replace(/\n/g, ''),
      authorEmail: shelljs
        .exec('git config user.email', { silent: true })
        .stdout.replace(/\n/g, '')
    }

    const prompts = [
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
        required: true,
        validate: input => {
          const intInput = parseInt(input)
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

    return this.prompt(prompts).then(props => {
      // To access props later use this.props.someAnswer;

      props.projectName = props.projectName.replace(/ /g, "-");

      for (const groupOrImage of images) {
        if (!props[groupOrImage.imageVariable]) {
          if (groupOrImage.images && groupOrImage.images.length === 1) {
            // When there's a single image in the group, no prompt is shown to choose image.
            props[groupOrImage.imageVariable] = groupOrImage.images[0].name
          } else {
            props[groupOrImage.imageVariable] = groupOrImage.name
          }
        }

        if (!props[groupOrImage.containerVariable]) {
          delete props[groupOrImage.imageVariable]
        }
      }

      props.init = false
      for (const init of inits) {
        if (props[init.initVariable]) {
          props.init = true
        }
      }

      this.props = props
    })
  }

  writing() {
    this.registerTransformStream(
      gulpRename(function (path) {
        if (path.extname === '.hbs') {
          const splitBasename = path.basename.split('.')
          path.extname = (splitBasename.length > 1 ? '.' : '') + splitBasename.pop()
          path.basename = splitBasename.join('.')
        }
      })
    )

    for (const image of images) {
      if (this.props[image.imageVariable]) {
        if (image.before) {
          image.before(this)
        }
      }
    }

    for (const init of inits) {
      if (this.props[init.initVariable]) {
        if (init.before) {
          init.before(this)
        }
      }
    }

    const defaultIncludes = [
      '*',
      '.bin/dc', '.bin/run', '.bin/system',
      '**/*.d/*']

    templating.copyAllTpl(this, defaultIncludes)

    for (const image of images) {
      if (this.props[image.imageVariable]) {
        const imageName = this.props[image.imageVariable]

        templating.copyTpl(
          this.fs,
          this.templatePath(`**/${imageName}/**/*`),
          this.destinationRoot(),
          this.props
        )

        templating.copyTpl(
          this.fs,
          this.templatePath(`**/.${imageName}/**/*`),
          this.destinationRoot(),
          this.props
        )

        if (image.files) {
          templating.copyAllTpl(this, image.files)
        }
      }
    }

    if (this.props.init) {
      templating.copyTpl(
        this.fs,
        this.templatePath('init/*'),
        this.destinationPath('init'),
        this.props
      )
    }

    for (const init of inits) {
      if (this.props[init.initVariable]) {
        const initName = init.name

        templating.copyTpl(
          this.fs,
          this.templatePath(`**/init/init.d/${initName}.*`),
          this.destinationRoot(),
          this.props
        )

        if (init.files) {
          templating.copyAllTpl(this, init.files)
        }
      }
    }

    for (const image of images) {
      if (this.props[image.imageVariable]) {
        if (image.after) {
          image.after(this)
        }
      }
    }

    for (const init of inits) {
      if (this.props[init.initVariable]) {
        if (init.after) {
          init.after(this)
        }
      }
    }
  }

  init() {
    for (const init of inits) {
      if (this.props[init.initVariable]) {
        init.init(this)
      }
    }
  }

  install() {
    // git clone {{drupalRepositoryUrl}} .
    // rm -Rf .git/
    // Run composer install & co
  }
}
