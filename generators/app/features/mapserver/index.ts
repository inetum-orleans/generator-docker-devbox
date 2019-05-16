import { DefaultFeature, DockerComposeFeature, FeatureAsyncInit } from '../feature'
import { ConfigBuilder } from '@gfi-centre-ouest/docker-compose-builder'
import { DockerDevboxExt } from '../../docker'
import * as Generator from 'yeoman-generator'
import { RegistryClient } from '../../docker/registry'
import { FeatureContext } from '../../index'
import { PortsManager } from '../../managers'
import { rsort } from '../../semver-utils'

export class Mapserver extends DefaultFeature implements DockerComposeFeature<Mapserver>, FeatureAsyncInit {
  name: string = 'mapserver'
  label: string = 'Mapserver'
  instanceName: string = this.name
  directory: string = __dirname
  duplicateAllowed: boolean = true

  asyncQuestions: Generator.Question[] = []

  async initAsync () {
    const registry = new RegistryClient()
    const allTags = await registry.tagsList('camptocamp/mapserver')

    let tags = allTags
      .filter(tag => /^\d+\.\d$/.test(tag))
      .reverse()

    tags = rsort(tags)

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

  questions (): Generator.Question[] {
    return this.asyncQuestions
  }

  envFiles (context: FeatureContext<Mapserver>): string[] {
    return [`.docker/${context.instance.name}/mapserver.map`]
  }

  dockerComposeConfiguration (builder: ConfigBuilder, context: FeatureContext<Mapserver>, portsManager: PortsManager, dev?: boolean): void {
    if (!dev) {
      builder.service(context.instance.name)
        .with.default()
        .env('LISTEN_PORT_80', '1')
        .volume.relative('', '/etc/mapserver')
        .user('${USER_ID}')
    } else {
      builder.service(context.instance.name)
        .ext(DockerDevboxExt).reverseProxy(context.instance.name)
    }
  }
}
