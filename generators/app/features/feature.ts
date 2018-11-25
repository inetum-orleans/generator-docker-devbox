import { ChoiceType } from 'inquirer'
import * as Generator from 'yeoman-generator'
import { FeatureContext } from '..'
import * as path from 'path'
import { Templating } from '../templating'
import { ConfigBuilder } from '@gfi-centre-ouest/docker-compose-builder'
import { Helpers } from '../helpers'

export interface Service<F extends Feature> {
  name: string
  filepathDestinationTransformer?: (filepath: string) => string
  feature: F
}

export interface DockerComposeFeature<F extends Feature> {
  dockerComposeConfiguration (builder: ConfigBuilder, context: FeatureContext<F>, dev?: boolean): void
}

export interface FeatureAsyncInit {
  initAsync (): Promise<void>
}

export interface Feature {
  name: string
  label: string
  directory: string
  choice: ChoiceType

  duplicateAllowed?: boolean
  excludeFiles?: (string | RegExp)[]
  appendFiles?: (string | RegExp)[]

  moDirectories? (context: FeatureContext<this>): string[]

  envFiles? (context: FeatureContext<this>): string[]

  /**
   * Creates a service with unique name, avoiding collision with already created services.
   *
   * @param serviceNames service names already registered
   */
  service (serviceNames: { [name: string]: Service<any> }): Service<this>

  /**
   * Additional questions to ask when this feature is selected.
   */
  questions? (): Generator.Question[]

  /**
   * Write files related to this feature.
   *
   * @param templating
   * @param helpers
   * @param context
   */
  write (templating: Templating, helpers: Helpers, context: FeatureContext<this>): void
}

export abstract class DefaultFeature implements Feature {
  abstract name: string
  abstract label: string
  abstract serviceName?: string
  abstract directory: string

  excludeFiles?: (string | RegExp)[] = []
  appendFiles?: (string | RegExp)[] = ['.gitignore.hbs']

  private uniqueName (name: string, count: number) {
    return `${name}${count}`
  }

  service (serviceNames: { [name: string]: Service<any> }): Service<this> {
    let name = this.serviceName ? this.serviceName : this.name
    let filepathDestinationTransformer: ((filepath: string) => string) | undefined = undefined
    let count = 1

    while (name in serviceNames) {
      count++
      name = this.uniqueName(name, count)
    }

    if (count > 1) {
      filepathDestinationTransformer = (filepath) => {
        if (filepath.startsWith('.bin/')) {
          const ext = path.extname(filepath)
          return this.uniqueName(filepath.substr(0, filepath.length - ext.length), count) + ext
        }
        return filepath
      }
    }

    return {
      name: name,
      filepathDestinationTransformer,
      feature: this
    }
  }

  get choice (): ChoiceType {
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

  write (templating: Templating, helpers: Helpers, context: FeatureContext<this>) {
    templating.bulk(this.files(context), context, {
      excludeFiles: this.excludeFiles,
      appendFiles: this.appendFiles,
      filepathDestinationTransformer: context.service.filepathDestinationTransformer,
      cwd: path.join(this.directory, 'templates')
    })
  }
}
