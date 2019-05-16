import { DefaultFeature, DockerComposeFeature, Feature, FeatureAsyncInit } from '../feature'
import { ConfigBuilder } from '@gfi-centre-ouest/docker-compose-builder'
import * as Generator from 'yeoman-generator'
import { RegistryClient } from '../../docker/registry'
import { AnswersFeature, FeatureContext } from '../../index'
import { PortsManager } from '../../managers'
import * as semver from 'semver'
import { rsort } from '../../semver-utils'

export class MariaDB extends DefaultFeature implements Feature, DockerComposeFeature<MariaDB>, FeatureAsyncInit {
  name: string = 'mariadb'
  label: string = 'Mariadb'
  instanceName: string = 'db'
  directory: string = __dirname
  duplicateAllowed: boolean = true

  asyncQuestions: Generator.Question[] = []

  async initAsync () {
    const registry = new RegistryClient()
    const allTags = await registry.tagsList('mariadb')

    let tags = allTags
      .filter(tag => /^\d+\.\d$/.test(tag))
      .reverse()

    tags = rsort(tags)

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

  postProcessAnswers (answers: AnswersFeature): AnswersFeature {
    const postgresVersion = semver.coerce(answers['mariadbVersion'])!
    const major = semver.major(postgresVersion, true)
    const minor = semver.minor(postgresVersion, true)

    answers['mariadbClientVersion'] = `${major}.${minor}`
    return answers
  }

  dockerComposeConfiguration (builder: ConfigBuilder, context: FeatureContext<MariaDB>, portsManager: PortsManager, dev?: boolean): void {
    if (!dev) {
      builder.service(context.instance.name)
        .with.default()
        .env('MYSQL_ROOT_PASSWORD', context.projectName)
        .env('MYSQL_DATABASE', context.projectName)
        .env('MYSQL_USER', context.projectName)
        .env('MYSQL_PASSWORD', context.projectName)
        .volume.project('/workdir')
        .volume.named(`${context.instance.name}-data`, '/var/lib/mysql')
    } else {
      builder.service(context.instance.name)
        .port(`${portsManager.uniquePort(6)}:3306`)
    }
  }
}
