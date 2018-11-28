import { DefaultFeature, DockerComposeFeature, Feature, FeatureAsyncInit } from '../feature'
import { ConfigBuilder } from '@gfi-centre-ouest/docker-compose-builder'
import * as Generator from 'yeoman-generator'
import { RegistryClient } from '../../docker/registry'
import { FeatureContext } from '../../index'
import { PortsManager } from '../../managers'

export class Phing extends DefaultFeature implements Feature, DockerComposeFeature<Phing>, FeatureAsyncInit {
  name: string = 'phing'
  label: string = 'Phing'
  instanceName: string = this.name
  directory: string = __dirname
  duplicateAllowed: boolean = false

  asyncQuestions: Generator.Question[] = []

  async initAsync () {
    const registry = new RegistryClient()
    const allTags = await registry.tagsList('php')

    const tags = allTags
      .filter(tag => /-cli$/.test(tag))
      .filter(tag => /^\d+\.\d+-/.test(tag))
      .filter(tag => !/-rc.*/.test(tag))
      .map(tag => tag.substring(0, tag.length - '-cli'.length))
      .reverse()

    this.asyncQuestions = [
      {
        type: 'list',
        name: 'phpVersion',
        message: 'PHP version',
        choices: tags,
        default: tags[0],
        store: true
      }
    ]
  }

  questions (): Generator.Question[] {
    return this.asyncQuestions
  }

  dockerComposeConfiguration (builder: ConfigBuilder, context: FeatureContext<Phing>, portsManager: PortsManager, dev?: boolean): void {
    if (!dev) {
      builder.service(context.instance.name)
        .with.default()
        .arg('DOCKER_VERSION', '${DOCKER_VERSION}')
        .arg('DOCKER_COMPOSE_VERSION', '${DOCKER_COMPOSE_VERSION}')
        .env('COMPOSE_PROJECT_DIR', '${COMPOSE_PROJECT_DIR}')
        .env('BUILD_WORKING_DIR', '/app')
        .assign({ privileged: true, working_dir: '/app', entrypoint: '/bin/true' })
        .volume.project('/app')
        .volume.add('/var/run/docker.sock', '/var/run/docker.sock')
    }
  }
}
