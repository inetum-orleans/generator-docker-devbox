import { DefaultFeature, DockerComposeFeature, Feature, FeatureAsyncInit } from '../feature'
import { ConfigBuilder } from '@gfi-centre-ouest/docker-compose-builder'
import { Answers, Question } from 'yeoman-generator'
import { RegistryClient } from '../../docker/registry'
import { FeatureContext } from '../../index'
import { PortsManager } from '../../managers'
import * as glob from 'glob'
import { BulkOptions } from '../../templating'
import { rsort } from '../../semver-utils'
import { DockerDevboxExt } from '../../docker'

export class Node extends DefaultFeature implements Feature, DockerComposeFeature<Node>, FeatureAsyncInit {
  name: string = 'node'
  label: string = 'Node'
  instanceName: string = this.name
  directory: string = __dirname
  duplicateAllowed: boolean = true

  asyncQuestions: Question<Answers>[] = []

  async initAsync () {
    const registry = new RegistryClient()
    const allTags = await registry.tagsList('node')

    let tags = allTags
      .filter(tag => /^\d+$/.test(tag) || ['dubnium', 'carbon', 'boron'].indexOf(tag) > -1)
      .filter(tag => !/^0$/.test(tag))
      .reverse()

    tags = rsort(tags)

    this.asyncQuestions = [
      {
        type: 'list',
        name: 'nodeVersion',
        message: 'Node version',
        choices: tags,
        default: tags[0],
        store: true
      }
    ]
  }

  questions (): Question<Answers>[] {
    return [
      ...this.asyncQuestions,
      {
        type: 'checkbox',
        name: 'nodeTools',
        message: 'Node Tools',
        choices: ['@vue/cli', '@angular/cli', 'create-react-app', 'node-sass'],
        default: [],
        store: true
      }
    ]
  }

  writeOptions<O extends glob.IOptions & BulkOptions> (options: O, context: FeatureContext<this>, directory: string): O {
    if (!options.excludeFiles) {
      options.excludeFiles = []
    }

    if (context.nodeTools.indexOf('@vue/cli') === -1) {
      options.excludeFiles.push('.bin/vue.hbs')
    }

    if (context.nodeTools.indexOf('@angular/cli') === -1) {
      options.excludeFiles.push('.bin/ng.hbs')
    }

    if (context.nodeTools.indexOf('create-react-app') === -1) {
      options.excludeFiles.push('.bin/create-react-app.hbs')
    }

    if (context.nodeTools.indexOf('node-sass') === -1) {
      options.excludeFiles.push('.bin/node-sass.hbs')
    }

    return options
  }

  dockerComposeConfiguration (builder: ConfigBuilder, context: FeatureContext<Node>, portsManager: PortsManager, dev?: boolean): void {
    if (!dev) {
      builder.service(context.instance.name)
        .with.default()
        .volume.project('/app')
        .volume.named(`${context.instance.name}-cache`, '/home/node/.cache')
        .volume.named(`${context.instance.name}-npm-packages`, '/home/node/.npm-packages')
        .ext(DockerDevboxExt).fixuid()
    }
  }
}
