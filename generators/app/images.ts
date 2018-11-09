const camelCase = require('lodash/camelCase')
import { Answers, Question } from 'yeoman-generator'
import AppGenerator from './index'

export type Files = string[];

export interface ContainerOptions {
  prompts?: Question[]
  default?: any
  files?: Files
  before?: (this: Container | ContainerGroup, generator: AppGenerator) => void
  after?: (this: Container | ContainerGroup, generator: AppGenerator) => void
}

export class Container {
  readonly name: string
  readonly additionalPromptsEntries: Question[]
  readonly default: any
  readonly files: Files

  constructor (name: string, options: ContainerOptions = {}) {
    this.name = name
    this.additionalPromptsEntries = options.prompts || []
    this.default = options.default
    this.files = options.files || []
    this.before = options.before
    this.after = options.after
  }

  before?: (generator: AppGenerator) => void
  after?: (generator: AppGenerator) => void

  prompts (): Question[] {
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
        name: this.containerVariable,
        message: `Use ${this.name} container`,
        default: this.default,
        when: undefined,
        store: true
      }
    ]
  }

  additionalPrompts (image?: Container): Question[] {
    if (!image) {
      image = this
    }

    return image.additionalPromptsEntries.map((prompt: Question) => {
      return Object.assign({}, prompt, {
        when: (answers: Answers) => {
          return answers[prompt.name!] === undefined && answers[this.containerVariable] &&
            (!answers[this.imageVariable] || answers[this.imageVariable] === image!.name)
        }
      })
    })
  }

  get containerVariable (): string {
    return `${camelCase(this.name)}Container`
  }

  get imageVariable (): string {
    return `${camelCase(this.name)}Image`
  }
}

export class ContainerGroup extends Container {
  readonly images: Container[]

  constructor (name: string, images: Container[]) {
    super(name)
    this.images = images
  }

  prompts () {
    const prompts = super.prompts()

    for (const image of this.images) {
      const additionalPrompts = this.additionalPrompts(image)
      if (additionalPrompts) {
        prompts.push(...additionalPrompts)
      }
    }

    return prompts
  }

  mainPrompts () {
    const prompts = super.mainPrompts()

    const choices = this.images.map(image => image.name)

    if (choices.length > 1) {
      prompts.push({
        type: 'list',
        name: this.imageVariable,
        message: `Which ${this.name} image`,
        when: (answers: Answers) => {
          return answers[this.containerVariable]
        },
        store: true,
        choices: choices
      })
    }

    return prompts
  }
}

const prompts = {
  phpVersion: {
    type: 'list',
    name: 'phpVersion',
    message: 'PHP Version',
    store: true,
    choices: ['7.2', '7.1', '7.0', '5.6']
  },
  postgresVersion: {
    type: 'list',
    name: 'postgresVersion',
    message: 'PostgreSQL Version',
    default: '9.6',
    store: true,
    choices: ['10.0', '9.6', '9.5', '9.4', '9.3']
  },
  mysqlVersion: {
    type: 'list',
    name: 'mysqlVersion',
    message: 'MySQL Version',
    store: true,
    choices: ['5.7', '5.6', '5.5']
  }
}

const images = [
  new ContainerGroup('web', [
    new Container('php', {
      prompts: [prompts.phpVersion],
      files: ['.bin/php', '.bin/composer']
    })
  ]),
  new ContainerGroup('db', [
    new Container('postgres', {
      prompts: [prompts.postgresVersion],
      files: ['.bin/psql', '.bin/psql-postgres', '.bin/pg_dump', '.bin/pg_dump-postgres', '.bin/pg_restore', '.bin/pg_restore-postgres']
    }),
    new Container('mysql', {
      prompts: [prompts.mysqlVersion],
      files: ['.bin/mysql']
    })
  ]),
  new Container('node', {
    default: false,
    files: ['.bin/node', '.bin/npm', '.bin/yarn']
  }),
  new Container('mailcatcher'),
  new Container('phing', {
    default: false,
    prompts: [prompts.phpVersion],
    files: ['.bin/phing']
  }),
  new Container('node-sass', {
    default: false,
    files: ['.bin/node-sass']
  }),
  new Container('mapserver', {
    default: false
  }),
  new Container('maven', {
    default: false,
    files: ['.bin/mvn']
  }),
  new Container('sonar-scanner', {
    default: false,
    files: ['.bin/sonar-scanner']
  })
]

export default images
