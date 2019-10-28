import { DefaultFeature, DockerComposeFeature, FeatureAsyncInit, ReverseProxyService } from '../feature'
import { ConfigBuilder } from '@gfi-centre-ouest/docker-compose-builder'
import { DockerDevboxExt } from '../../docker'
import { Answers, Question } from 'yeoman-generator'
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

  asyncQuestions: Question<Answers>[] = []

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

  questions (): Question<Answers>[] {
    return this.asyncQuestions
  }

  envFiles (context: FeatureContext<this>): string[] {
    return [`.docker/${context.instance.name}/mapserver.map`]
  }

  reverseProxyServices (context: FeatureContext<this>): ReverseProxyService[] {
    return [{ service: context.instance.name, subdomainPrefix: context.instance.name }]
  }

  dockerComposeConfiguration (builder: ConfigBuilder, context: FeatureContext<this>, portsManager: PortsManager, dev?: boolean): void {
    if (!dev) {
      builder.service(context.instance.name)
        .with.default()
        .env('LISTEN_PORT_80', '1')
        .volume.relative('', '/etc/mapserver')
        .user('${USER_ID}')
    }
  }
}
