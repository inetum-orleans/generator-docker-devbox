import { Answers, ChoiceType } from 'inquirer'
import * as Generator from 'yeoman-generator'
import { AnswersFeature, AnswersFeatures, FeatureContext } from '..'
import * as path from 'path'
import { BulkOptions, Templating } from '../templating'
import { ConfigBuilder } from '@gfi-centre-ouest/docker-compose-builder'
import { Helpers } from '../helpers'
import { NameManager, PortsManager } from '../managers'
import * as glob from 'glob'

const clone = require('lodash/clone')

export interface FeatureInstance<F extends Feature> {
  name: string
  filepathDestinationTransformer?: (filepath: string) => string
  feature: F
}

export interface DockerComposeFeature<F extends Feature> {
  dockerComposeConfiguration (builder: ConfigBuilder, context: FeatureContext<F>, portsManager: PortsManager, dev?: boolean): void
}

export interface FeatureAsyncInit {
  initAsync (): Promise<void>
}

export interface Feature<A = Answers> {
  name: string
  label: string
  directory: string | string[]
  choice: ChoiceType<A>
  instanceName: string

  duplicateAllowed?: boolean
  excludeFiles?: (string | RegExp)[]
  appendFiles?: (string | RegExp)[]

  moDirectories? (context: FeatureContext<this>): string[]

  envFiles? (context: FeatureContext<this>): string[]

  /**
   * Creates instances with unique names, avoiding services collision with already created features.
   *
   * @param manager instance names already registered
   */
  instances (manager: NameManager): { [name: string]: FeatureInstance<any> }

  /**
   * Additional questions to ask when this feature is selected.
   */
  questions? (): Generator.Question[]

  /**
   * Post process feature answers
   *
   * @param answers
   * @param answersFeatures
   * @param allAnswers
   */
  postProcessFeatureAnswers? (answers: AnswersFeature): Generator.Questions | null | undefined | void

  /**
   * Post process answers
   *
   * @param answers
   * @param answersFeatures
   * @param allAnswers
   */
  postProcessAnswers? (answers: AnswersFeature, answersFeatures: AnswersFeatures, allAnswers: AnswersFeatures[]): Generator.Questions | null | undefined | void

  /**
   * Write files related to this feature.
   *
   * @param templating
   * @param helpers
   * @param context
   */
  write (templating: Templating, helpers: Helpers, context: FeatureContext<this>): void
}

export function dirnameFrom (name: string, common: boolean = true) {
  if (common) {
    return path.join(__dirname, 'common', name)
  }
  return path.join(__dirname, name)
}

export abstract class DefaultFeature<A = Answers> implements Feature<A> {
  abstract name: string
  abstract label: string
  abstract instanceName: string
  abstract directory: string | string[]

  otherInstanceNames: string[] = []

  excludeFiles: (string | RegExp)[] = []
  appendFiles: (string | RegExp)[] = ['.gitignore.hbs']

  instance (manager: NameManager, instanceName = this.instanceName): FeatureInstance<this> {
    const registered = manager.uniqueName(instanceName)

    let filepathDestinationTransformer: ((filepath: string) => string) | undefined = undefined

    if (registered.name !== instanceName) {
      filepathDestinationTransformer = (filepath) => {
        if (filepath.startsWith('.bin/')) {
          const ext = path.extname(filepath)
          return filepath.substr(0, filepath.length - ext.length) + '-' + registered.name + ext
        }
        return filepath
      }
    }

    return {
      name: registered.name,
      filepathDestinationTransformer,
      feature: this
    }
  }

  instances (manager: NameManager): { [name: string]: FeatureInstance<any> } {
    const instances = {
      [this.instanceName]: this.instance(manager)
    }

    for (const otherInstanceName of this.otherInstanceNames) {
      instances[otherInstanceName] = this.instance(manager, otherInstanceName)
    }

    return instances
  }

  get choice () {
    return { name: this.label, value: this.name }
  }

  private match (filepath: string, files: (string | RegExp)[]) {
    for (const file of files) {
      if (file instanceof RegExp) {
        if (file.exec(filepath)) {
          return true
        }
      } else if (file === filepath) {
        return true
      }
    }

    return false

  }

  /**
   * Override this method to include only some files based on answers given to questions.
   *
   * @param context Answers given to this feature.
   */
  files (context: FeatureContext<this>): string[] {
    return ['**']
  }

  writeOptions (options: glob.IOptions & BulkOptions, context: FeatureContext<this>, directory: string): glob.IOptions & BulkOptions {
    return options
  }

  templateDirectory (context: FeatureContext<this>, directory: string) {
    return path.join(directory, 'templates')
  }

  write (templating: Templating, helpers: Helpers, context: FeatureContext<this>) {
    let directories = this.directory

    if (!Array.isArray(this.directory)) {
      directories = [this.directory]
    }

    for (const directory of directories) {
      let options: glob.IOptions & BulkOptions = {
        excludeFiles: clone(this.excludeFiles),
        appendFiles: clone(this.appendFiles),
        filepathDestinationTransformer: context.instance.filepathDestinationTransformer,
        cwd: this.templateDirectory(context, directory)
      }
      options = this.writeOptions(options, context, directory)
      templating.bulk(this.files(context), context, options)
    }
  }
}
