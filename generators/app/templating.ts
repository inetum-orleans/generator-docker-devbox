import { AssertionError } from 'assert'
import AppGenerator from './index'

const extend = require('deep-extend')
const path = require('path')

export function copyTpl (generator: AppGenerator, from: string, to: string, tplSettings?: {}, options?: {}) {
  const context = generator.answers || {}

  options = extend(options || {}, { globOptions: { dot: true } })

  try {
    generator.fs.copy(
      from,
      to,
      extend(options, {
        process: function (contents: Buffer, filename: string) {
          if (filename.endsWith('.hbs')) {
            const precompileTplSettings = extend({ srcName: filename }, tplSettings)
            const templateAst = (generator.handlebars.parse as any)(contents.toString(), precompileTplSettings)
            const template = generator.handlebars.compile(templateAst)
            return template(context)
          }
          return contents
        }
      })
    )
  } catch (err) {
    if (!(err instanceof AssertionError)) {
      throw err
    }
    // No files maches from glob
  }
}

export function copyAllTpl (generator: AppGenerator, includes: string[]) {
  for (const defaultInclude of includes) {
    let destination

    if (defaultInclude.indexOf('*') > -1) {
      destination = generator.destinationRoot()
    } else {
      destination = path.join(generator.destinationRoot(), defaultInclude)
    }

    copyTpl(
      generator,
      generator.templatePath(`${defaultInclude}`),
      destination
    )
  }

}
