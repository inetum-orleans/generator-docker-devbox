import { DefaultFeature, Feature, FeatureContext } from '../feature'
import { DockerComposeFeature } from '../docker'
import { ConfigBuilder } from '@gfi-centre-ouest/docker-compose-builder'
import * as Generator from 'yeoman-generator'

export class MySQL extends DefaultFeature implements Feature, DockerComposeFeature<MySQL> {
  name: string = 'mysql'
  label: string = 'MySQL'
  serviceName: string = 'db'
  directory: string = __dirname
  duplicateAllowed: boolean = true

  questions? (): Generator.Questions {
    return [{
      type: 'list',
      name: 'mysqlVersion',
      message: 'MySQL Version',
      choices: ['5.7', '5.6', '5.5'],
      default: '5.7',
      store: true
    }]
  }

  dockerComposeConfiguration (builder: ConfigBuilder, context: FeatureContext<MySQL>, dev?: boolean): void {
    if (!dev) {
      builder.service(context.service.name)
        .with.default()
        .env('MYSQL_ROOT_PASSWORD', context.projectName)
        .env('MYSQL_DATABASE', context.projectName)
        .env('MYSQL_USER', context.projectName)
        .env('MYSQL_PASSWORD', context.projectName)
        .volume.project('/workdir')
        .volume.named(`${context.service.name}-data`, '/var/lib/mysql')
    }
  }
}
