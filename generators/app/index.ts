import { Templating } from './templating'
import { ChoiceOptions } from 'inquirer'
import { features } from './features'
import { DockerComposeFeature, Feature, FeatureAsyncInit, FeatureInstance } from './features/feature'
import { Helpers } from './helpers'
import * as Generator from 'yeoman-generator'

import 'source-map-support/register'
import { DockerDevboxConfigBuilderOptions } from './docker'
import { newBuilder, Version } from '@gfi-centre-ouest/docker-compose-builder'
import * as yaml from 'js-yaml'

import * as path from 'path'
import * as process from 'process'

import chalk from 'chalk'
import { bash } from './system'
import { NameManager, PortsManager } from './managers'

const cloneDeep = require('lodash/cloneDeep')

const yosay = require('yosay')

interface AnswersStart extends Generator.Answers {
  projectName: string
  authorName: string
  authorEmail: string
}

interface AnswersEnd extends Generator.Answers {
  portPrefix: number
}

interface RawAnswersFeatures extends Generator.Answers {

}

export interface AnswersMain extends AnswersStart, AnswersEnd {
  features: AnswersFeatures[]
}

export interface FeatureContext<F extends Feature> extends AnswersMain, Generator.Answers {
  group: AnswersFeatures
  options: { [name: string]: any }
  instance: FeatureInstance<F>
  instances: { [name: string]: FeatureInstance<F> }
}

export type AnswersFeatures = { [featureId: string]: AnswersFeature }

export type AnswersFeature = Generator.Answers

/**
 * Main generator class, asks questions, read features and write project.
 */
export default class AppGenerator extends Generator {
  answersMain!: AnswersMain
  templating: Templating
  helpers: Helpers

  constructor (args: string | string[], options: {}) {
    super(args, options)
    this.templating = new Templating(this.fs, this.destinationRoot())
    this.helpers = new Helpers(this)

    this.argument('bash-disabled', {
      default: false,
      description: 'Disable execution of bash scripts at the end of the generation to initialize environment.'
    })
  }

  private _sanitizeProjectName (input: string) {
    return input.replace(/(?:(?![\.])[\s\W_])+/g, '-').toLowerCase()
  }

  private _sanitizeRegistryRepository (input: string) {
    return input.replace(/(?:(?![\.])[\s\W_])+/g, '-').toLowerCase()
  }

  private async _promptStart () {
    const prompts: Generator.Question<AnswersStart>[] = [
      {
        type: 'input',
        name: 'projectName',
        message: 'Technical project name',
        default: this._sanitizeProjectName(this.appname),
        validate: (v) => !!v && this._sanitizeProjectName(v) === v,
        store: true
      },
      {
        type: 'input',
        name: 'authorName',
        message: 'Author name',
        default: this.user.git.name(),
        validate: (v) => !!v,
        store: true
      },
      {
        type: 'input',
        name: 'authorEmail',
        message: 'Author email',
        default: this.user.git.email(),
        validate: (v) => !!v,
        store: true
      }
    ]
    return this.prompt(prompts)
  }

  private async _promptEnd () {
    const prompts: Generator.Questions<AnswersEnd> = {
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
    return this.prompt(prompts)

  }

  private _featureCount (featureId: string, rawAnswersFeatures: RawAnswersFeatures[]) {
    if (!rawAnswersFeatures) return 0
    let count = 0
    for (const answersFeatures of rawAnswersFeatures) {
      if (answersFeatures[featureId]) {
        count++
      }
    }
    return count
  }

  private async _promptFeatures (featuresGroup: number, rawAnswersFeatures: RawAnswersFeatures[]) {
    const choicesFeature: ChoiceOptions<Generator.Answers>[] = []

    for (const feature of features) {
      const featureCount = this._featureCount(feature.name, rawAnswersFeatures)
      if (!featureCount || feature.duplicateAllowed) {
        choicesFeature.push(feature.choice)
      }
    }

    if (choicesFeature) {
      return this.prompt({
        type: 'checkbox',
        name: `features~${featuresGroup}`,
        message: 'Features',
        choices: choicesFeature,
        store: true
      }) as Promise<RawAnswersFeatures>
    } else {
      return { features: [] } as RawAnswersFeatures
    }
  }

  private _applyFeatureToQuestion (feature: Feature, featuresGroup: number, question: Generator.Question) {
    question.message = `${feature.label} > ${question.message}`
    question.name = `features~${featuresGroup}~${feature.name}~${question.name}`
    question.store = true
  }

  private _applyFeatureToQuestions (feature: Feature, featuresGroup: number, questions: Generator.Questions) {
    if (Array.isArray(questions)) {
      for (const question of questions) {
        this._applyFeatureToQuestion(feature, featuresGroup, question)
      }
    } else if ((questions as Generator.Question).message) {
      this._applyFeatureToQuestion(feature, featuresGroup, questions as Generator.Question)
    }
  }

  private _formatFeatureAnswers (feature: Feature, featuresGroup: number, answersFeatures: AnswersFeatures): AnswersFeature {
    const formatted: AnswersFeature = {}

    for (const key of Object.keys(answersFeatures)) {
      if (key.indexOf(`features~${featuresGroup}~${feature.name}~`) === 0) {
        const properKey = key.substr(`features~${featuresGroup}~${feature.name}~`.length, key.length)
        formatted[properKey] = answersFeatures[key]
      }
    }

    return formatted
  }

  private _rawFeatureAnswers (feature: Feature, featuresGroup: number, formattedAnswersFeatures: AnswersFeatures): AnswersFeature {
    const raw: AnswersFeature = {}

    for (const key of Object.keys(formattedAnswersFeatures)) {
      const rawKey = `features~${featuresGroup}~${feature.name}~${key}`
      raw[rawKey] = formattedAnswersFeatures[key]
    }

    return raw
  }

  initializing () {
    const exitListeners = process.listeners('exit')
    for (const exitListener of exitListeners) {
      if (exitListener.name === 'bound navigate') {
        process.removeListener('exit', exitListener)
      }
    }

    // It seems yeoman can't setup sourceRoot automatically, don't know why :(
    this.sourceRoot(path.join(__dirname, 'templates'))
  }

  async prompting () {
    this.log(
      yosay('Welcome to the epic ' + chalk.red('@gfi-centre-ouest/docker-devbox') + ' generator!')
    )

    const answersStart = await this._promptStart()

    const rawAnswersFeatures: RawAnswersFeatures[] = []

    const initializedFeatures: Feature[] = []

    let featuresGroup = 0
    while (true) {
      let answersFeatures = await this._promptFeatures(featuresGroup, rawAnswersFeatures)

      const initFeaturesPromises: Promise<void>[] = []

      if (answersFeatures[`features~${featuresGroup}`]) {
        for (const feature of features) {
          const featureAsyncInit = (feature as unknown as FeatureAsyncInit)
          if (featureAsyncInit.initAsync &&
            answersFeatures[`features~${featuresGroup}`].indexOf(feature.name) > -1 &&
            initializedFeatures.indexOf(feature) === -1) {
            initFeaturesPromises.push(featureAsyncInit.initAsync())
            initializedFeatures.push(feature)
          }
        }

        await Promise.all(initFeaturesPromises)

        for (const feature of features) {
          if (feature.questions && answersFeatures[`features~${featuresGroup}`].indexOf(feature.name) > -1) {
            const featureQuestions = cloneDeep(feature.questions())
            if (featureQuestions) {
              this._applyFeatureToQuestions(feature, featuresGroup, featureQuestions)
              let featureAnswers = await this.prompt(featureQuestions)
              featureAnswers = await this._postProcessFeatureAnswers(feature, featuresGroup, featureAnswers, true)
              Object.assign(answersFeatures, featureAnswers)
            }
          }
        }

        rawAnswersFeatures.push(answersFeatures)

        const answersMore = await this.prompt({
          type: 'confirm',
          name: `features~${featuresGroup}~more`,
          default: false,
          message: 'Do you need to duplicate some features ?',
          store: true
        })

        if (!answersMore[`features~${featuresGroup}~more`]) {
          break
        }

        featuresGroup++
      } else {
        break
      }
    }

    featuresGroup = 0
    const allAnswersFeatures: AnswersFeatures[] = []
    for (const answersFeatures of rawAnswersFeatures) {
      const groupAnswersFeature: AnswersFeatures = {}
      for (const feature of features) {
        if (answersFeatures[`features~${featuresGroup}`].indexOf(feature.name) > -1) {
          groupAnswersFeature[feature.name] = this._formatFeatureAnswers(feature, featuresGroup, answersFeatures)
        }
      }
      allAnswersFeatures.push(groupAnswersFeature)
      featuresGroup++
    }

    for (const groupAnswersFeature of allAnswersFeatures) {
      for (const feature of features) {
        let answersFeature = groupAnswersFeature[feature.name]
        if (answersFeature && feature.postProcessAnswers) {
          const questions = feature.postProcessAnswers(answersFeature, groupAnswersFeature, allAnswersFeatures)
          if (questions) {
            this._applyFeatureToQuestions(feature, featuresGroup, questions)
            const additionalAnswers = await this.prompt(questions)
            answersFeature = { ...answersFeature, ...this._formatFeatureAnswers(feature, featuresGroup, additionalAnswers) }
            answersFeature = await this._postProcessFeatureAnswers(feature, featuresGroup, answersFeature)
          }
          groupAnswersFeature[feature.name] = answersFeature
        }
      }
    }

    const answersEnd = await this._promptEnd()

    this.answersMain = { ...answersStart, ...answersEnd, features: allAnswersFeatures }
  }

  writing () {
    const featureById: { [featureId: string]: Feature } = {}

    for (const feature of features) {
      featureById[feature.name] = feature
    }

    const envFiles: string[] = ['docker-compose.override.yml']
    const moDirectories: string[] = ['$DOCKER_DEVBOX_DIR/.docker[*]']

    const builderOptions = new DockerDevboxConfigBuilderOptions()

    const composeBuilder = newBuilder(undefined, builderOptions)
    const composeDevBuilder = newBuilder(undefined, builderOptions)

    let instanceNameManager = new NameManager()
    let portsManager = new PortsManager()
    for (const answersFeatures of this.answersMain.features) {
      for (const featureId of Object.keys(answersFeatures)) {
        const feature = featureById[featureId]
        const instances = feature.instances(instanceNameManager)

        const context: FeatureContext<typeof feature> = {
          ...this.answersMain,
          options: this.options,
          group: answersFeatures,
          ...answersFeatures[featureId],
          instance: instances[feature.instanceName],
          instances
        }

        feature.write(this.templating, this.helpers, context)

        if (feature.envFiles) {
          envFiles.push(...feature.envFiles(context))
        }
        if (feature.moDirectories) {
          moDirectories.push(...feature.moDirectories(context))
        }

        const dockerComposeFeature = feature as unknown as DockerComposeFeature<typeof feature>

        if (dockerComposeFeature.dockerComposeConfiguration) {
          dockerComposeFeature.dockerComposeConfiguration(composeBuilder, context, portsManager)
          dockerComposeFeature.dockerComposeConfiguration(composeDevBuilder, context, portsManager, true)
        }
      }
    }

    const composeYaml = yaml.dump(composeBuilder.get(), { lineWidth: 9999 })
    const composeDevYaml = yaml.dump(composeDevBuilder.get(), { lineWidth: 9999 })

    const composeYamlRendered = this.templating.renderHandlebars(composeYaml, this.answersMain)
    const composeDevYamlRendered = this.templating.renderHandlebars(composeDevYaml, this.answersMain)

    this.fs.write('docker-compose.yml', composeYamlRendered)
    this.fs.write('docker-compose.override.dev.yml', composeDevYamlRendered)

    const defaultIncludes = [
      '*',
      '.bin/dc', '.bin/run', '.bin/system', '.bin/yo', '.bin/mo',
      '**/*.d/*'
    ]

    const computed = { 'registryRepository': this._sanitizeRegistryRepository(this.answersMain['projectName']) }

    this.templating.bulk(defaultIncludes, {
      ...this.answersMain,
      ...computed,
      envFiles: envFiles.join(' '),
      moDirectories: moDirectories.join(' ')
    })
  }

  async install () {
    this.log('')
    this.log(chalk.bold.blue('Initializing environment ...'))
    this.log('')

    this.log(chalk.bold.cyan('$ . .bash_enter'))
    this.log('')

    if (this.options['bash-disabled']) {
      this.log(chalk.red('bash execution is disabled (bash-disabled argument). You should run the command manually.'))
    } else {
      await bash('. .bash_enter')
    }

    this.log('')

    this.log(chalk.bold.green('🎉 Everything has been generated properly ! 🎉'))
    this.log('')

    this.log(chalk.green('run ') +
      chalk.bold.cyan('. .bash_enter') +
      chalk.green(' to initialize the environment.')
    )
    this.log('')

    this.log(chalk.bold.cyan('dc') +
      chalk.green(' is available as an alias for ') +
      chalk.bold.cyan('docker-compose') +
      chalk.green('.')
    )

    this.log(chalk.bold.cyan('.bin') +
      chalk.green(' directory is registered in PATH to bring commands from docker containers right in your bash environment.')
    )

    this.log(chalk.green('Run ') +
      chalk.bold.cyan('dc build') +
      chalk.green(' to build images, ') +
      chalk.bold.cyan('dc up -d') +
      chalk.green(' to start containers, ') +
      chalk.bold.cyan('dc logs -f') +
      chalk.green(' to follow the container logs.'
      )
    )
    this.log('')
  }

  private async _postProcessFeatureAnswers (feature: Feature, featuresGroup: number, featureAnswers: Generator.Answers, rawInput = false) {
    if (feature.postProcessFeatureAnswers) {
      const formattedFeatureAnswers = rawInput ? this._formatFeatureAnswers(feature, featuresGroup, featureAnswers) : featureAnswers
      const questions = feature.postProcessFeatureAnswers(formattedFeatureAnswers)
      featureAnswers = rawInput ? this._rawFeatureAnswers(feature, featuresGroup, formattedFeatureAnswers) : formattedFeatureAnswers
      if (questions) {
        this._applyFeatureToQuestions(feature, featuresGroup, questions)
        const additionalAnswers = await this.prompt(questions)
        featureAnswers = { ...featureAnswers, ...rawInput ? additionalAnswers : this._formatFeatureAnswers(feature, featuresGroup, additionalAnswers) }
      }
    }
    return featureAnswers
  }
}
