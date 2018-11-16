import * as Generator from 'yeoman-generator'
import { Templating } from './templating'
import { ChoiceType } from 'inquirer'
import { features } from './features'
import { Feature, FeatureContext, Service } from './features/feature'
import { newBuilder, Version } from '@gfi-centre-ouest/docker-compose-builder'
import { DockerComposeFeature, DockerDevboxConfigBuilderOptions } from './features/docker'
import * as yaml from 'js-yaml'

require('source-map-support').install()

const path = require('path')

const chalk = require('chalk')
const yosay = require('yosay')

interface AnswersStart extends Generator.Answers {
  projectName: string
  authorName: string
  authorEmail: string,
}

interface AnswersEnd extends Generator.Answers {
  portPrefix: number
}

interface RawAnswersFeatures extends Generator.Answers {

}

export interface AnswersMain extends AnswersStart, AnswersEnd {
  features: AnswersFeatures[]
}

export type AnswersFeatures = { [featureId: string]: AnswersFeature }

export type AnswersFeature = Generator.Answers

export default class AppGenerator extends Generator {
  answersMain!: AnswersMain
  templating: Templating

  constructor (args: string | string[], options: {}) {
    super(args, options)
    this.templating = new Templating(this.fs, this.destinationRoot())
  }

  paths () {
    // It seems yeoman can't setup sourceRoot automatically, don't know why :(
    this.sourceRoot(path.join(__dirname, 'templates'))
  }

  async prompting () {
    // Have Yeoman greet the user.
    this.log(
      yosay('Welcome to the epic ' + chalk.red('@gfi-centre-ouest/docker-devbox') + ' generator!')
    )

    const answersStart = await this._promptStart()

    const rawAnswersFeatures: RawAnswersFeatures[] = []

    let featuresGroup = 0
    while (true) {
      let answersFeatures = await this._promptFeatures(featuresGroup, rawAnswersFeatures)

      if (answersFeatures[`features~${featuresGroup}`]) {
        for (const feature of features) {
          if (answersFeatures[`features~${featuresGroup}`].indexOf(feature.name) > -1 && feature.questions) {
            const featureQuestions = feature.questions()
            if (featureQuestions) {
              this._applyFeatureToQuestions(feature, featuresGroup, featureQuestions)
              const featureAnswers = await this.prompt(featureQuestions)
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

    const answersEnd = await this._promptEnd()

    featuresGroup = 0
    const allAnswersFeatures: AnswersFeatures[] = []
    for (const answersFeatures of rawAnswersFeatures) {
      const groupAnswersFeature: AnswersFeatures = {}
      for (const feature of features) {
        if (answersFeatures[`features~${featuresGroup}`].indexOf(feature.name) > -1) {
          const answersFeature: AnswersFeature = {}
          for (const key of Object.keys(answersFeatures)) {
            if (key.indexOf(`features~${featuresGroup}~${feature.name}~`) === 0) {
              const properKey = key.substr(`features~${featuresGroup}~${feature.name}~`.length, key.length)
              answersFeature[properKey] = answersFeatures[key]
            }
          }
          groupAnswersFeature[feature.name] = answersFeature
        }
      }
      allAnswersFeatures.push(groupAnswersFeature)
      featuresGroup++
    }

    this.answersMain = { ...answersStart, ...answersEnd, features: allAnswersFeatures }
  }

  async write () {
    const featureById: { [featureId: string]: Feature } = {}

    for (const feature of features) {
      featureById[feature.name] = feature
    }

    const envFiles: string[] = ['docker-compose.override.yml']
    const moDirectories: string[] = ['$DOCKER_DEVBOX_DIR/.docker[*]']

    const builderOptions = new DockerDevboxConfigBuilderOptions()

    const composeBuilder = newBuilder({ version: Version.v22 }, builderOptions)
    const composeDevBuilder = newBuilder({ version: Version.v22 }, builderOptions)

    let servicesByName: { [name: string]: Service<any> } = {}
    for (const answersFeatures of this.answersMain.features) {
      for (const featureId of Object.keys(answersFeatures)) {
        const feature = featureById[featureId]
        const service = feature.service(servicesByName)
        servicesByName[service.name] = service

        const context: FeatureContext<typeof feature> = {
          ...this.answersMain,
          ...answersFeatures[featureId],
          service
        }

        feature.write(this.templating, context)

        if (feature.envFiles) {
          envFiles.push(...feature.envFiles(context))
        }
        if (feature.moDirectories) {
          moDirectories.push(...feature.moDirectories(context))
        }

        const dockerComposeFeature = feature as unknown as DockerComposeFeature<typeof feature>

        if (dockerComposeFeature.dockerComposeConfiguration) {
          dockerComposeFeature.dockerComposeConfiguration(composeBuilder, context)
          dockerComposeFeature.dockerComposeConfiguration(composeDevBuilder, context, true)
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

    this.templating.bulk(defaultIncludes, {
      ...this.answersMain,
      envFiles: envFiles.join(' '),
      moDirectories: moDirectories.join(' ')
    })
  }

  private async _promptStart () {
    const prompts: Generator.Question[] = [
      {
        type: 'input',
        name: 'projectName',
        message: 'Technical project name',
        default: this.appname,
        validate: (v) => !!v,
        store: true
      },
      {
        type: 'input',
        name: 'authorName',
        message: 'Author name',
        default: this.user.git.name(),
        store: true
      },
      {
        type: 'input',
        name: 'authorEmail',
        message: 'Author email',
        default: this.user.git.email(),
        store: true
      }
    ]
    return this.prompt(prompts) as Promise<AnswersStart>
  }

  private async _promptEnd () {
    const prompts = {
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
    return this.prompt(prompts) as Promise<AnswersEnd>

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
    const choicesFeature: ChoiceType[] = []

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
}
