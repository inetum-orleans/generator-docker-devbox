import { DefaultFeature, DockerComposeFeature, FeatureAsyncInit } from '../feature'
import { ConfigBuilder } from '@gfi-centre-ouest/docker-compose-builder'
import { DockerDevboxExt } from '../../docker'
import * as Generator from 'yeoman-generator'
import { RegistryClient } from '../../docker/registry'
import { FeatureContext } from '../../index'

export class Mapserver extends DefaultFeature implements DockerComposeFeature<Mapserver>, FeatureAsyncInit {
  name: string = 'mapserver'
  label: string = 'Mapserver'
  serviceName: string = 'mapserver'
  directory: string = __dirname
  duplicateAllowed: boolean = true

  asyncQuestions!: Generator.Questions

  async initAsync () {
    const registry = new RegistryClient()
    const allTags = await registry.tagsList('camptocamp/mapserver')

    const tags = allTags
      .filter(tag => /^\d+\.\d$/.test(tag))
      .reverse()

    this.asyncQuestions = [
      {
        type: 'list',
        name: 'mapserverVersion',
        message: 'Mapserver version',
        choices: tags,
        default: tags[0],
        store: true
      }
    ]
  }

  questions (): Generator.Questions {
    return this.asyncQuestions
  }

  envFiles (context: FeatureContext<Mapserver>): string[] {
    return [`.docker/${context.service.name}/mapserver.map`]
  }

  dockerComposeConfiguration (builder: ConfigBuilder, context: FeatureContext<Mapserver>, dev?: boolean): void {
    if (!dev) {
      builder.service(context.service.name)
        .with.default()
        .env('LISTEN_PORT_80', '1')
        .volume.relative('', '/etc/mapserver')
        .user('${USER_ID}')
    } else {
      builder.service(context.service.name)
        .ext(DockerDevboxExt).nginxProxy(context.service.name)
    }
  }
}
