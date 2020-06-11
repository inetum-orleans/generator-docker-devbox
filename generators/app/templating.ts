import { CopyOptions } from 'mem-fs-editor'
import * as Handlebars from 'handlebars'
import * as handlebarsHelpers from 'handlebars-helpers'
import * as Generator from 'yeoman-generator'
import * as Mustache from 'mustache'
import * as glob from 'glob'

import * as path from 'path'

import * as realFs from 'fs'

export interface BulkOptions {
  excludeFiles?: (string | RegExp)[]
  appendFiles?: (string | RegExp)[]
  filepathDestinationTransformer?: (filepath: string) => string
}

function walkSync (dir: string, filelist: string[] = []) {
  const files = realFs.readdirSync(dir)
  files.forEach(function (file) {
    const fp = path.join(dir, file)
    if (realFs.statSync(fp).isDirectory()) {
      filelist = walkSync(fp, filelist)
    } else {
      filelist.push(fp)
    }
  })
  return filelist
}

/**
 * Templating support for the generator.
 */
export class Templating {
  handlebars: typeof Handlebars
  handlebarsHelpers: { [name: string]: Handlebars.HelperDelegate }

  constructor (private fs: Generator.MemFsEditor,
               public destinationRoot: string) {
    this.handlebars = Handlebars.create()
    this.handlebarsHelpers = handlebarsHelpers({ handlebars: this.handlebars })

    const partialsDirectory = path.join(__dirname, 'partials')

    const partials = walkSync(partialsDirectory).filter((f) => f.endsWith('.hbs'))
    for (const partial of partials) {
      const partialContent = realFs.readFileSync(partial).toString('utf-8')
      const relative = path.relative(partialsDirectory, partial)
      const key = relative.substr(0, relative.length - '.hbs'.length)
      this.handlebars.registerPartial(key, partialContent)
    }
  }

  processFactory (context: any, handlebarsOptions?: CompileOptions | RuntimeOptions) {
    const process = (contents: Buffer, filename: string) => {
      return this.render(contents.toString(), context, filename, handlebarsOptions)
    }
    return process
  }

  render (input: string, context: any, filename: string, handlebarsOptions?: CompileOptions | RuntimeOptions) {
    if (filename.endsWith('.hbs')) {
      const precompileOptions = Object.assign({ srcName: filename }, handlebarsOptions)
      return this.renderHandlebars(input, context, precompileOptions)
    } else if (filename.endsWith('.mustache')) {
      return this.renderMustache(input, context)
    }
    return input
  }

  removeTemplateExtension (filepath: string) {
    const extname = path.extname(filepath)
    const extensions = ['.hbs', '.mustache']
    for (const extension of extensions) {
      if (filepath.endsWith(extension)) {
        return filepath.substr(0, filepath.length - extension.length)
      }
    }

    return filepath
  }

  /**
   * @see https://github.com/npm/npm/issues/7252
   * @param filepath
   */
  npmignoreWorkaround (filepath: string) {
    const basename = path.basename(filepath)
    if (basename === '.npmignore') {
      return path.join(path.dirname(filepath), '.gitignore')
    }
    if (basename === 'npmignore') {
      return path.join(path.dirname(filepath), '.npmignore')
    }
    return filepath
  }

  renderHandlebars (input: string, context: any, handlebarsOptions?: CompileOptions | RuntimeOptions): string {
    const template = this.handlebars.compile(input, handlebarsOptions)
    return template(context, handlebarsOptions)
  }

  renderMustache (input: string, context: any, tags?: [string, string]): string {
    return Mustache.render(input, context, undefined, tags)
  }

  renderFilepath (filepath: string, context: any) {
    return filepath.split(path.sep)
      .map((segment) => this.renderMustache(segment, context, ['[', ']']))
      .join(path.sep)
  }

  copyOptionsFactory (context: any, handlebarsOptions?: CompileOptions | RuntimeOptions, copyOptions?: CopyOptions): CopyOptions {
    if (!copyOptions) {
      copyOptions = {}
    }
    copyOptions = Object.assign(copyOptions, { globOptions: { dot: true, nonull: true } })
    copyOptions.process = this.processFactory(context, handlebarsOptions)
    return copyOptions
  }

  copy (from: string, to: string, context: any, handlebarsOptions?: CompileOptions | RuntimeOptions, copyOptions?: CopyOptions) {
    to = this.removeTemplateExtension(to)
    to = this.npmignoreWorkaround(to)

    this.fs.copy(
      from,
      to,
      this.copyOptionsFactory(context, handlebarsOptions, copyOptions)
    )
  }

  copySingle (from: string, to: string, context: any, handlebarsOptions?: CompileOptions) {
    to = this.removeTemplateExtension(to)
    to = this.npmignoreWorkaround(to)

    const fromContent = this.fs.read(from)
    const renderedContent = this.render(fromContent, context, from, handlebarsOptions)
    this.fs.write(to, renderedContent)
  }

  append (from: string, to: string, context: any, handlebarsOptions?: CompileOptions) {
    if (this.fs.exists(to)) {
      to = this.removeTemplateExtension(to)
      to = this.npmignoreWorkaround(to)

      const fromContent = this.fs.read(from)
      const renderedContent = this.render(fromContent, context, from, handlebarsOptions);
      (this.fs as any).append(to, renderedContent)
    } else {
      this.copySingle(from, to, context, handlebarsOptions)
    }
  }

  bulk (from: string | string[],
        context: any,
        options?: glob.IOptions & BulkOptions) {
    options = Object.assign({
      dot: true,
      nodir: true,
      cwd: path.join(__dirname, 'templates')
    }, options || {})

    if (!Array.isArray(from)) {
      from = [from]
    }

    for (const fromItem of from) {
      const filepaths = glob.sync(fromItem, options)
      for (const filepath of filepaths) {
        if (options.excludeFiles && this.match(filepath, options.excludeFiles, options)) {
          continue
        }

        const append = options.appendFiles && this.match(filepath, options.appendFiles, options)

        const absoluteFromFilepath = path.join(options.cwd!, filepath)

        const toFilepath = options.filepathDestinationTransformer ?
          options.filepathDestinationTransformer(filepath) : filepath

        let renderedToFilepath = this.renderFilepath(toFilepath, context)
        const absoluteToFilepath = path.join(this.destinationRoot, renderedToFilepath)

        if (append) {
          this.append(absoluteFromFilepath, absoluteToFilepath, context)
        } else {
          this.copySingle(absoluteFromFilepath, absoluteToFilepath, context)
        }
      }
    }
  }

  private match (filepath: string, files: (string | RegExp)[], options: glob.IOptions) {
    const globOptions = Object.assign({}, options, { nonull: true })
    for (const file of files) {
      if (file instanceof RegExp && file.exec(filepath)) {
        return true
      } else if (file === filepath) {
        return true
      } else if (file === glob.sync(filepath, globOptions)[0]) {
        return true
      }
    }
    return false
  }
}
