import AppGenerator, { FeatureContext } from './index'
import * as semver from 'semver'
import HelperOptions = Handlebars.HelperOptions

/**
 * Handlebars custom helpers available as Handlerbars helpers and typescript methods.
 */
export class Helpers {
  generator!: AppGenerator

  constructor (generator: AppGenerator) {
    this.generator = generator
    const self = this
    generator.templating.handlebars.registerHelper('hasFeature', function (this: any) {
      const options: HelperOptions = arguments[arguments.length - 1]
      return self.hasFeature.apply(self, Array.from(arguments) as []) ? options.fn(this) : options.inverse(this)
    })
    generator.templating.handlebars.registerHelper('getFeatureOption', function (this: any, featureId: string, option: string, options: HelperOptions) {
      return self.getFeatureOption(featureId, option, options)
    })
    generator.templating.handlebars.registerHelper('hasFeatureInGroup', function (this: any) {
      const options: HelperOptions = arguments[arguments.length - 1]
      return self.hasFeatureInGroup.apply(self, Array.from(arguments) as []) ? options.fn(this) : options.inverse(this)
    })
    generator.templating.handlebars.registerHelper('getFeatureInGroupOption', function (this: any, featureId: string, option: string, options: HelperOptions) {
      return self.getFeatureInGroupOption(featureId, option, options)
    })
    generator.templating.handlebars.registerHelper('semver', function (this: any, version: string, semverConstraint: string, options: HelperOptions) {
      return self.semver(version, semverConstraint) ? options.fn(this) : options.inverse(this)
    })
    generator.templating.handlebars.registerHelper('semverMajor', function (this: any, version: string, options: HelperOptions) {
      return self.semverMajor(version)
    })
    generator.templating.handlebars.registerHelper('semverMinor', function (this: any, version: string, options: HelperOptions) {
      return self.semverMinor(version)
    })
    generator.templating.handlebars.registerHelper('semverPatch', function (this: any, version: string, options: HelperOptions) {
      return self.semverPatch(version)
    })
  }

  /**
   * Check a feature is available globally.
   */
  hasFeature (): boolean {
    const options: HelperOptions = arguments[arguments.length - 1]
    const context: FeatureContext<any> = options.data.root

    for (let i = 0; i < arguments.length - 1; i++) {
      const featureId = arguments[i]

      for (const answersFeature of context.features) {
        {
          if (answersFeature[featureId]) {
            return true
          }
        }
      }
    }
    return false
  }

  getFeatureOption (featureId: string, option: string, options: HelperOptions): any {
    const context: FeatureContext<any> = options.data.root

    for (const answersFeature of context.features) {
      {
        if (answersFeature[featureId]) {
          return answersFeature[featureId][option]
        }
      }
    }
    return null
  }

  /**
   * Check if a feature is available in the same context group.
   */
  hasFeatureInGroup (): boolean {
    const options: HelperOptions = arguments[arguments.length - 1]
    const context: FeatureContext<any> = options.data.root

    for (let i = 0; i < arguments.length - 1; i++) {
      const featureId = arguments[i]

      if (context.group[featureId]) {
        return true
      }
    }

    return false
  }

  getFeatureInGroupOption (featureId: string, option: string, options: HelperOptions): any {
    const context: FeatureContext<any> = options.data.root

    if (context.group[featureId]) {
      return context.group[featureId][option]
    }

    return null
  }

  /**
   * Check if a semver constraint is satisfied by the given version.
   *
   * @param version
   * @param semverConstraint
   */
  semver (version: string, semverConstraint: string): boolean {
    const coercedVersion = semver.coerce(version)
    return semver.satisfies(coercedVersion ? coercedVersion : version, semverConstraint, true)
  }

  semverMajor (version: string): number {
    const coercedVersion = semver.coerce(version)
    return semver.major(coercedVersion ? coercedVersion : version, true)
  }

  semverMinor (version: string): number {
    const coercedVersion = semver.coerce(version)
    return semver.minor(coercedVersion ? coercedVersion : version, true)
  }

  semverPatch (version: string): number {
    const coercedVersion = semver.coerce(version)
    return semver.patch(coercedVersion ? coercedVersion : version, true)
  }
}
