import { DefaultFeature, FeatureContext } from '../feature'
import { DockerComposeFeature, DockerDevboxExt } from '../docker'
import { ConfigBuilder } from '@gfi-centre-ouest/docker-compose-builder'

export class Mailcatcher extends DefaultFeature implements DockerComposeFeature<Mailcatcher> {
  name: string = 'mailcatcher'
  label: string = 'Mailcatcher'
  serviceName: string = 'mailcatcher'
  directory: string = __dirname
  duplicateAllowed: boolean = false

  dockerComposeConfiguration (builder: ConfigBuilder, context: FeatureContext<Mailcatcher>, dev?: boolean): void {
    if (dev) {
      builder.service(context.service.name)
        .with.default()
        .ext(DockerDevboxExt).nginxProxy(context.service.name)
    }
  }
}
