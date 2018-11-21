import { DefaultFeature, DockerComposeFeature, Feature, FeatureAsyncInit } from '../feature'
import { ConfigBuilder } from '@gfi-centre-ouest/docker-compose-builder'
import * as Generator from 'yeoman-generator'
import { RegistryClient } from '../../docker/registry'
import { FeatureContext } from '../../index'

export class Postgres extends DefaultFeature implements Feature, DockerComposeFeature<Postgres>, FeatureAsyncInit {
  name: string = 'postgresql'
  label: string = 'PostgreSQL'
  serviceName: string = 'db'
  directory: string = __dirname
  duplicateAllowed: boolean = true

  asyncQuestions!: Generator.Questions

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

  dockerComposeConfiguration (builder: ConfigBuilder, context: FeatureContext<Postgres>, dev?: boolean): void {
    if (!dev) {
      builder.service(context.service.name)
        .with.default()
        .env('POSTGRES_USER', context.projectName)
        .env('POSTGRES_PASSWORD', context.projectName)
        .volume.project('/workdir')
        .volume.named(`${context.service.name}-data`, '/var/lib/postgresql/data')
    }
  }
}
