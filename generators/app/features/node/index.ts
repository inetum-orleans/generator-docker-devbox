import { DefaultFeature, Feature, FeatureContext } from '../feature'
import { DockerComposeFeature } from '../docker'
import { ConfigBuilder } from '@gfi-centre-ouest/docker-compose-builder'

export class Node extends DefaultFeature implements Feature, DockerComposeFeature<Node> {
  name: string = 'node'
  label: string = 'Node'
  serviceName: string = 'node'
  directory: string = __dirname
  duplicateAllowed: boolean = true

  dockerComposeConfiguration (builder: ConfigBuilder, context: FeatureContext<Node>, dev?: boolean): void {
    if (!dev) {
      builder.service(context.service.name)
        .with.default()
        .volume.project('/app')
        .volume.named(`${context.service.name}-cache`, '/home/node/.cache')
        .volume.named(`${context.service.name}-npm-packages`, '/home/node/.npm-packages')
    }
  }
}
