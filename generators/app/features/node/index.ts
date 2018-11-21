import { DefaultFeature, DockerComposeFeature, Feature, FeatureAsyncInit } from '../feature'
import { ConfigBuilder } from '@gfi-centre-ouest/docker-compose-builder'
import * as Generator from 'yeoman-generator'
import { RegistryClient } from '../../docker/registry'
import { FeatureContext } from '../../index'

export class Node extends DefaultFeature implements Feature, DockerComposeFeature<Node>, FeatureAsyncInit {
  name: string = 'node'
  label: string = 'Node'
  serviceName: string = 'node'
  directory: string = __dirname
  duplicateAllowed: boolean = true

  asyncQuestions!: Generator.Questions

  async initAsync () {
    const registry = new RegistryClient()
    const allTags = await registry.tagsList('node')

    const tags = allTags
      .filter(tag => /^\d+$/.test(tag) || ['dubnium', 'carbon', 'boron'].indexOf(tag) > -1)
      .filter(tag => !/^0$/.test(tag))
      .reverse()

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

  questions () {
    return this.asyncQuestions
  }

  dockerComposeConfiguration (builder: ConfigBuilder, context: FeatureContext<Node>, dev?: boolean): void {
    if (!dev) {
      builder.service(context.service.name)
        .with.default()
        .volume.project('/app')
        .volume.named(`${context.service.name}-cache`, '/home/node/.cache')
        .volume.named(`${context.service.name}-npm-packages`, '/home/node/.npm-packages')
    }
  }
}
