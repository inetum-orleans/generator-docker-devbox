import { DefaultFeature, DockerComposeFeature, Feature, FeatureAsyncInit } from '../feature'
import { ConfigBuilder } from '@gfi-centre-ouest/docker-compose-builder'
import * as Generator from 'yeoman-generator'
import { RegistryClient } from '../../docker/registry'
import { FeatureContext } from '../../index'

export class Solr extends DefaultFeature implements Feature, DockerComposeFeature<Solr>, FeatureAsyncInit {
  name: string = 'solr'
  label: string = 'Solr'
  serviceName: string = 'solr'
  directory: string = __dirname
  duplicateAllowed: boolean = true

  asyncQuestions: Generator.Question[] = []

  async initAsync () {
    const registry = new RegistryClient()
    const allTags = await registry.tagsList('solr')

    const tags = allTags
      .filter(tag => /^\d+\.\d$/.test(tag))
      .reverse()

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

  dockerComposeConfiguration (builder: ConfigBuilder, context: FeatureContext<Solr>, dev?: boolean): void {
    if (!dev) {
      builder.service(context.service.name)
        .with.default()
        .volume.relative('conf', '/solr-conf/conf')
        .volume.named(`${context.service.name}-data`, '/opt/solr/server/solr/gfi_sandbox')
        .entrypoint(['docker-entrypoint.sh', 'solr-precreate', context.projectName, '/solr-conf'])
    } else {
      // builder.service(context.service.name)
      // .port('8983')
    }
  }
}
