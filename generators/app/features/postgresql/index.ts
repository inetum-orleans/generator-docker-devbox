import { DefaultFeature, DockerComposeFeature, Feature, FeatureAsyncInit } from '../feature'
import { ConfigBuilder } from '@gfi-centre-ouest/docker-compose-builder'
import { Answers, Question, Questions } from 'yeoman-generator'
import { RegistryClient } from '../../docker/registry'
import { AnswersFeature, FeatureContext } from '../../index'
import { PortsManager } from '../../managers'
import * as semver from 'semver'
import { rsort } from '../../semver-utils'
import { DockerDevboxExt } from '../../docker'

export class Postgres extends DefaultFeature implements Feature, DockerComposeFeature<Postgres>, FeatureAsyncInit {
  name: string = 'postgresql'
  label: string = 'PostgreSQL'
  instanceName: string = 'db'
  directory: string = __dirname
  duplicateAllowed: boolean = true

  asyncQuestions: Question<Answers>[] = []

  async initAsync () {
    const registry = new RegistryClient()
    const allTags = await registry.tagsList('postgres')

    let tags = allTags
      .filter(tag => /^\d+\.\d+$/.test(tag))
      .reverse()

    tags = rsort(tags)

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

  postProcessFeatureAnswers? (answers: AnswersFeature): Questions | null | undefined | void {
    const postgresVersion = semver.coerce(answers['postgresVersion'])!
    const major = semver.major(postgresVersion, true)
    const minor = semver.minor(postgresVersion, true)

    answers['postgresClientVersion'] = major >= 10 ? `${major}` : `${major}.${minor}`
  }

  dockerComposeConfiguration (builder: ConfigBuilder, context: FeatureContext<Postgres>, portsManager: PortsManager, dev?: boolean): void {
    if (!dev) {
      builder.service(context.instance.name)
        .with.default()
        .env('POSTGRES_USER', context.projectName)
        .env('POSTGRES_PASSWORD', context.projectName)
        .volume.project('/workdir')
        .volume.named(`${context.instance.name}-data`, '/var/lib/postgresql/data')
        .ext(DockerDevboxExt).fixuid()
    } else {
      builder.service(context.instance.name)
        .port(`${portsManager.uniquePort(32)}:5432`)
    }
  }
}
