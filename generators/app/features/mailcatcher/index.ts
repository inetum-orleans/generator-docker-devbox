import { DefaultFeature, DockerComposeFeature } from '../feature'
import { ConfigBuilder } from '@gfi-centre-ouest/docker-compose-builder'
import { DockerDevboxExt } from '../../docker'
import { FeatureContext } from '../../index'
import { PortsManager } from '../../managers'

export class Mailcatcher extends DefaultFeature implements DockerComposeFeature<Mailcatcher> {
  name: string = 'mailcatcher'
  label: string = 'Mailcatcher'
  instanceName: string = this.name
  directory: string = __dirname
  duplicateAllowed: boolean = false

  dockerComposeConfiguration (builder: ConfigBuilder, context: FeatureContext<Mailcatcher>, portsManager: PortsManager, dev?: boolean): void {
    if (dev) {
      builder.service(context.instance.name)
        .with.default()
        .ext(DockerDevboxExt).reverseProxy(context.instance.name)
    }
  }
}
