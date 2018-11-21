import AppGenerator, { FeatureContext } from './index'
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
  }

  /**
   * Check a feature is available globally.
   *
   * @param featureId
   * @param context
   */
  hasFeature (featureId: string, context: FeatureContext<any>) {
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
  hasFeatureInGroup (featureId: string, context: FeatureContext<any>) {
    return context.group[featureId]
  }
}
