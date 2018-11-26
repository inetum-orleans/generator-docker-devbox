import { DefaultFeature, DockerComposeFeature, Feature, FeatureAsyncInit } from '../feature'
import { ConfigBuilder } from '@gfi-centre-ouest/docker-compose-builder'
import * as Generator from 'yeoman-generator'
import { RegistryClient } from '../../docker/registry'
import { FeatureContext } from '../../index'

export class MariaDB extends DefaultFeature implements Feature, DockerComposeFeature<MariaDB>, FeatureAsyncInit {
  name: string = 'mariadb'
  label: string = 'Mariadb'
  serviceName: string = 'db'
  directory: string = __dirname
  duplicateAllowed: boolean = true

  asyncQuestions: Generator.Question[] = []

  async initAsync () {
    const registry = new RegistryClient()
    const allTags = await registry.tagsList('mariadb')

    const tags = allTags
      .filter(tag => /^\d+\.\d$/.test(tag))
      .reverse()

    this.asyncQuestions = [
      {
        type: 'list',
        name: 'mariadbVersion',
        message: 'MariaDB version',
        choices: tags,
        default: tags[0],
        store: true
      }
    ]
  }

  questions (): Generator.Question[] {
    return this.asyncQuestions
  }

  dockerComposeConfiguration (builder: ConfigBuilder, context: FeatureContext<MariaDB>, dev?: boolean): void {
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
