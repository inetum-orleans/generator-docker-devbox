import { ChoiceType } from 'inquirer'
import * as Generator from 'yeoman-generator'
import { FeatureContext } from '..'
import * as path from 'path'
import { Templating } from '../templating'
import { ConfigBuilder } from '@gfi-centre-ouest/docker-compose-builder'
import { Helpers } from '../helpers'
import { NameManager, PortsManager } from '../managers'

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
   * Creates an instance with unique name, avoiding collision with already created features.
   *
   * @param manager instance names already registered
   */
  instance (manager: NameManager): FeatureInstance<this>

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
  abstract instanceName: string
  abstract directory: string

  excludeFiles: (string | RegExp)[] = []
  appendFiles: (string | RegExp)[] = ['.gitignore.hbs']

  private uniqueName (name: string, count: number) {
    return `${name}${count}`
  }

  instance (manager: NameManager): FeatureInstance<this> {
    const registered = manager.uniqueName(this.instanceName)

    let filepathDestinationTransformer: ((filepath: string) => string) | undefined = undefined

    if (registered.name !== this.instanceName) {
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
    this.beforeWrite(templating, helpers, context)
    templating.bulk(this.files(context), context, {
      excludeFiles: this.excludeFiles,
      appendFiles: this.appendFiles,
      filepathDestinationTransformer: context.instance.filepathDestinationTransformer,
      cwd: path.join(this.directory, 'templates')
    })
  }

  beforeWrite (templating: Templating, helpers: Helpers, context: FeatureContext<this>) {
    // Do nothing
  }
}
