import { DefaultFeature, Feature, FeatureContext } from '../feature'
import { DockerComposeFeature } from '../docker'
import { ConfigBuilder } from '@gfi-centre-ouest/docker-compose-builder'
import * as Generator from 'yeoman-generator'

export class Postgres extends DefaultFeature implements Feature, DockerComposeFeature<Postgres> {
  name: string = 'postgresql'
  label: string = 'PostgreSQL'
  serviceName: string = 'db'
  directory: string = __dirname
  duplicateAllowed: boolean = true

  questions? (): Generator.Questions {
    return [{
      type: 'list',
      name: 'postgresVersion',
      message: 'PostgreSQL Version',
      choices: ['10.0', '9.6', '9.5', '9.4', '9.3'],
      default: '9.6',
      store: true
    }]
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
