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
    generator.templating.handlebars.registerHelper('hasFeature', function (this: any, featureId: string, options: HelperOptions) {
      return self.hasFeature(featureId, options.data.root) ? options.fn(this) : options.inverse(this)
    })
    generator.templating.handlebars.registerHelper('hasFeatureInGroup', function (this: any, featureId: string, options: HelperOptions) {
      return self.hasFeatureInGroup(featureId, options.data.root) ? options.fn(this) : options.inverse(this)
    })
    generator.templating.handlebars.registerHelper('semver', function (this: any, version: string, semverConstraint: string, options: HelperOptions) {
      return self.semver(version, semverConstraint) ? options.fn(this) : options.inverse(this)
    })
  }

  /**
   * Check a feature is available globally.
   *
   * @param featureId
   * @param context
   */
  hasFeature (featureId: string, context: FeatureContext<any>): boolean {
    for (const answersFeature of context.features) {
      if (answersFeature[featureId]) {
        return true
      }
    }
    return false
  }

  /**
   * Check a feature is available in the same context group.
   *
   * @param featureId
   * @param context
   */
  hasFeatureInGroup (featureId: string, context: FeatureContext<any>): boolean {
    return !!context.group[featureId]
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
}
