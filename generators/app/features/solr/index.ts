import { DefaultFeature, DockerComposeFeature, Feature, FeatureAsyncInit } from '../feature'
import { ConfigBuilder } from '@gfi-centre-ouest/docker-compose-builder'
import * as Generator from 'yeoman-generator'
import { RegistryClient } from '../../docker/registry'
import { FeatureContext } from '../../index'
import { PortsManager } from '../../managers'
import { rsort } from '../../semver-utils'

export class Solr extends DefaultFeature implements Feature, DockerComposeFeature<Solr>, FeatureAsyncInit {
  name: string = 'solr'
  label: string = 'Solr'
  instanceName: string = this.name
  directory: string = __dirname
  duplicateAllowed: boolean = true

  asyncQuestions: Generator.Question[] = []

  async initAsync () {
    const registry = new RegistryClient()
    const allTags = await registry.tagsList('solr')

    let tags = allTags
      .filter(tag => /^\d+\.\d$/.test(tag))
      .reverse()

    tags = rsort(tags)

    this.asyncQuestions = [
      {
        type: 'list',
        name: 'solrVersion',
        message: 'Solr version',
        choices: tags,
        default: tags[0],
        store: true
      }
    ]
  }

  questions (): Generator.Question[] {
    return this.asyncQuestions
  }

  dockerComposeConfiguration (builder: ConfigBuilder, context: FeatureContext<Solr>, portsManager: PortsManager, dev?: boolean): void {
    if (!dev) {
      builder.service(context.instance.name)
        .with.default()
        .volume.relative('conf', '/solr-conf/conf')
        .volume.named(`${context.instance.name}-data`, '/opt/solr/server/solr/gfi_sandbox')
        .entrypoint(['docker-entrypoint.sh', 'solr-precreate', context.projectName, '/solr-conf'])
    } else {
      builder.service(context.instance.name)
      .port(`${portsManager.uniquePort(83)}:8983`)
    }
  }
}
