import { DefaultFeature, DockerComposeFeature, FeatureContext } from '../feature'
import { ConfigBuilder } from '@gfi-centre-ouest/docker-compose-builder'
import { DockerDevboxExt } from '../../docker'

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
