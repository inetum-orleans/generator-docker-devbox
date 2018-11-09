const extend = require('deep-extend')
const path = require('path')

import * as Handlebars from 'handlebars'
import AppGenerator from './index'
import { MemFsEditor } from 'yeoman-generator'

Handlebars.registerHelper('if_eq', function (this: any, a: any, b: any, opts: any) {
  if (a === b) return opts.fn(this)
  return opts.inverse(this)
})

export function copyTpl (fs: MemFsEditor, from: string, to: string, context?: {}, tplSettings?: {}, options?: {}) {
  context = context || {}

  options = extend(options || {}, { globOptions: { dot: true } })

  if (fs.exists(from)) {
    fs.copy(
      from,
      to,
      extend(options, {
        process: function (contents: Buffer, filename: string) {
          if (filename.endsWith('.hbs')) {
            const precompileTplSettings = extend({ srcName: filename }, tplSettings)
            const templateAst = (Handlebars.parse as any)(contents.toString(), precompileTplSettings)
            const template = Handlebars.compile(templateAst)
            return template(context)
          }
          return contents
        }
      })
    )
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
      generator.fs,
      generator.templatePath(`${defaultInclude}`),
      destination,
      generator.answers
    )
  }

}
