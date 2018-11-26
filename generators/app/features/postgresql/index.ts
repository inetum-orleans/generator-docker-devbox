import { DefaultFeature, DockerComposeFeature, Feature, FeatureAsyncInit } from '../feature'
import { ConfigBuilder } from '@gfi-centre-ouest/docker-compose-builder'
import * as Generator from 'yeoman-generator'
import { RegistryClient } from '../../docker/registry'
import { FeatureContext } from '../../index'
import { PortsManager } from '../../managers'

export class Postgres extends DefaultFeature implements Feature, DockerComposeFeature<Postgres>, FeatureAsyncInit {
  name: string = 'postgresql'
  label: string = 'PostgreSQL'
  instanceName: string = 'db'
  directory: string = __dirname
  duplicateAllowed: boolean = true

  asyncQuestions: Generator.Question[] = []

  async initAsync () {
    const registry = new RegistryClient()
    const allTags = await registry.tagsList('postgres')

    const tags = allTags
      .filter(tag => /^\d+\.\d+$/.test(tag))
      .reverse()

    this.asyncQuestions = [
      {
        type: 'list',
        name: 'postgresVersion',
        message: 'PostgreSQL version',
        choices: tags,
        default: tags[0],
        store: true
      }
    ]
  }

  questions () {
    return this.asyncQuestions
  }

  dockerComposeConfiguration (builder: ConfigBuilder, context: FeatureContext<Postgres>, portsManager: PortsManager, dev?: boolean): void {
    if (!dev) {
      builder.service(context.instance.name)
        .with.default()
        .env('POSTGRES_USER', context.projectName)
        .env('POSTGRES_PASSWORD', context.projectName)
        .volume.project('/workdir')
        .volume.named(`${context.instance.name}-data`, '/var/lib/postgresql/data')
    } else {
      builder.service(context.instance.name)
        .port(`${portsManager.uniquePort(32)}:5432`)
    }
  }
}
