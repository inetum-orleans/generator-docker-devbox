import { DefaultFeature, DockerComposeFeature, Feature, FeatureAsyncInit } from '../feature'
import { ConfigBuilder } from '@gfi-centre-ouest/docker-compose-builder'
import * as Generator from 'yeoman-generator'
import { RegistryClient } from '../../docker/registry'
import { FeatureContext } from '../../index'
import { PortsManager } from '../../managers'

export class Redis extends DefaultFeature implements Feature, DockerComposeFeature<Redis>, FeatureAsyncInit {
  name: string = 'redis'
  label: string = 'Redis'
  instanceName: string = this.name
  directory: string = __dirname
  duplicateAllowed: boolean = true

  asyncQuestions: Generator.Question[] = []

  async initAsync () {
    const registry = new RegistryClient()
    const allTags = await registry.tagsList('redis')

    const tags = allTags
      .filter(tag => /^\d+\.\d$/.test(tag))
      .reverse()

    this.asyncQuestions = [
      {
        type: 'list',
        name: 'redisVersion',
        message: 'Redis version',
        choices: tags,
        default: tags[0],
        store: true
      }
    ]
  }

  questions (): Generator.Question[] {
    return this.asyncQuestions
  }

  dockerComposeConfiguration (builder: ConfigBuilder, context: FeatureContext<Redis>, portsManager: PortsManager, dev?: boolean): void {
    if (!dev) {
      builder.service(context.instance.name)
        .with.default()
    } else {
      builder.service(context.instance.name)
        .port(`${portsManager.uniquePort(79)}:6379`)
    }
  }
}
