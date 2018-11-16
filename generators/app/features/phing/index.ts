import { DefaultFeature, Feature, FeatureContext } from '../feature'
import { DockerComposeFeature } from '../docker'
import { ConfigBuilder } from '@gfi-centre-ouest/docker-compose-builder'
import * as Generator from 'yeoman-generator'

export class Phing extends DefaultFeature implements Feature, DockerComposeFeature<Phing> {
  name: string = 'phing'
  label: string = 'Phing'
  serviceName: string = 'phing'
  directory: string = __dirname
  duplicateAllowed: boolean = false

  questions? (): Generator.Questions {
    return [{
      type: 'list',
      name: 'phpVersion',
      message: 'PHP Version',
      choices: ['7.2', '7.1', '7.0', '5.6'],
      default: '7.2',
      store: true
    }]
  }

  dockerComposeConfiguration (builder: ConfigBuilder, context: FeatureContext<Phing>, dev?: boolean): void {
    if (!dev) {
      builder.service(context.service.name)
        .with.default()
      // TODO: build args:
      // TODO: DOCKER_VERSION: ${DOCKER_VERSION}
      // TODO: DOCKER_COMPOSE_VERSION: ${DOCKER_COMPOSE_VERSION}
        .env('COMPOSE_PROJECT_DIR', '${COMPOSE_PROJECT_DIR}')
        .env('BUILD_WORKING_DIR', '/app')
        .assign({ privileged: true, working_dir: '/app', entrypoint: '/bin/true' })
        .volume.project('/app')
        .volume.project(`${context.service.name}-cache`, '/home/node/.cache')
        .volume.named('/var/run/docker.sock', '/var/run/docker.sock')
    }
  }
}
