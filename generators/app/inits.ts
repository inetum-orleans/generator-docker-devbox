import { Answers, Question } from 'yeoman-generator'
import { Files } from './images'
import AppGenerator from '.'

const camelCase = require('lodash/camelCase')

export interface InitOptions {
  prompts?: Question[]
  default?: any
  files?: Files,
  before?: (this: Init, generator: AppGenerator) => void
  after?: (this: Init, generator: AppGenerator) => void
  init?: (this: Init, generator: AppGenerator) => void
}

class Init {
  readonly name: string
  readonly additionalPromptsEntries: Question[]
  readonly default: any
  readonly files: Files

  constructor (name: string, options: InitOptions = {}) {
    this.name = name
    this.additionalPromptsEntries = options.prompts || []
    this.default = options.default
    this.files = options.files || []
    this.before = options.before ? options.before.bind(this) : options.before
    this.after = options.after ? options.after.bind(this) : options.after
    this.init = options.init ? options.init.bind(this) : options.init
  }

  before?: (generator: AppGenerator) => void
  after?: (generator: AppGenerator) => void
  init?: (generator: AppGenerator) => void

  prompts () {
    const prompts = []

    const mainPrompt = this.mainPrompts()
    if (mainPrompt) {
      prompts.push(...mainPrompt)
    }

    const additionalPrompts = this.additionalPrompts()
    if (additionalPrompts) {
      prompts.push(...additionalPrompts)
    }

    return prompts
  }

  mainPrompts (): Question[] {
    return [
      {
        type: 'confirm',
        name: this.initVariable,
        message: `Initialize ${this.name}`,
        default: this.default,
        store: true
      }
    ]
  }

  additionalPrompts (init?: Init): Question[] {
    if (!init) {
      init = this
    }

    return init.additionalPromptsEntries.map(prompt => {
      return Object.assign({}, prompt, {
        when: (answers: Answers) => {
          return answers[this.initVariable]
        }
      })
    })
  }

  get initVariable () {
    return `${camelCase(this.name)}Init`
  }
}

const inits = [
  new Init('drupal', {
    default: false,
    prompts: [
      {
        type: 'list',
        name: 'drupalInitProfil',
        message: 'Profil',
        store: true,
        default: 'standard',
        choices: ['standard', 'gfi']
      }
    ],
    files: ['.bin/drush', '.bin/drupal'],
    before (this: Init, generator: AppGenerator) {
      if (generator.answers.get('nodeSassContainer')) {
        this.files.push('.bin/build-sass')
        this.files.push('.bin/watch-sass')
      }
    }
  })
]

export default inits
