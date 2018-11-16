import { CopyOptions } from 'mem-fs-editor'
import * as Handlebars from 'handlebars'
import * as handlebarsHelpers from 'handlebars-helpers'
import * as Generator from 'yeoman-generator'
import * as Mustache from 'mustache'
import * as assert from 'assert'
import * as glob from 'glob'

const path = require('path')

export interface BulkOptions {
  excludeFiles?: (string | RegExp)[]
  appendFiles?: (string | RegExp)[]
  filepathDestinationTransformer?: (filepath: string) => string
}

export class Templating {
  private handlebars: typeof Handlebars
  private handlebarsHelpers: any

  constructor (private fs: Generator.MemFsEditor,
               private destinationRoot: string) {
    this.handlebars = Handlebars.create()
    this.handlebarsHelpers = handlebarsHelpers({ handlebars: this.handlebars })
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

  renderHandlebars (input: string, context: any, handlebarsOptions?: CompileOptions | RuntimeOptions): string {
    const precompiledTemplate = (this.handlebars.parse as any)(input, handlebarsOptions)
    const template = this.handlebars.compile(precompiledTemplate, handlebarsOptions)
    return template(context)
  }

  renderMustache (input: string, context: any, tags?: string[]): string {
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
    assert(this.fs.exists(from), 'Trying to copy from a source that does not exist: ' + from)
    to = this.removeTemplateExtension(to)

    this.fs.copy(
      from,
      to,
      this.copyOptionsFactory(context, handlebarsOptions, copyOptions)
    )
  }

  write (from: string, to: string, context: any, handlebarsOptions?: CompileOptions) {
    assert(this.fs.exists(from), 'Trying to write from a source that does not exist: ' + from)
    to = this.removeTemplateExtension(to)

    const fromContent = this.fs.read(from)
    const renderedContent = this.render(fromContent, context, from, handlebarsOptions)
    this.fs.write(to, renderedContent)
  }

  append (from: string, to: string, context: any, handlebarsOptions?: CompileOptions) {
    if (this.fs.exists(to)) {
      assert(this.fs.exists(from), 'Trying to append from a source that does not exist: ' + from)
      to = this.removeTemplateExtension(to)

      const fromContent = this.fs.read(from)
      const renderedContent = this.render(fromContent, context, from, handlebarsOptions)
      this.fs.append(to, renderedContent)
    } else {
      this.write(from, to, context, handlebarsOptions)
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

        const absoluteFromFilepath = path.join(options.cwd, filepath)

        const toFilepath = options.filepathDestinationTransformer ?
          options.filepathDestinationTransformer(filepath) : filepath

        let renderedToFilepath = this.renderFilepath(toFilepath, context)
        const absoluteToFilepath = path.join(this.destinationRoot, renderedToFilepath)

        if (append) {
          this.append(absoluteFromFilepath, absoluteToFilepath, context)
        } else {
          this.write(absoluteFromFilepath, absoluteToFilepath, context)
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
