import { DefaultFeature, DockerComposeFeature } from '../feature'
import { ConfigBuilder } from '@gfi-centre-ouest/docker-compose-builder'
import { DockerDevboxExt } from '../../docker'
import { FeatureContext } from '../../index'
import { PortsManager } from '../../managers'

export class Maildev extends DefaultFeature implements DockerComposeFeature<Maildev> {
  name: string = 'maildev'
  label: string = 'Maildev'
  instanceName: string = this.name
  directory: string = __dirname
  duplicateAllowed: boolean = false

  dockerComposeConfiguration (builder: ConfigBuilder, context: FeatureContext<Maildev>, portsManager: PortsManager, dev?: boolean): void {
    if (dev) {
      builder.service(context.instance.name)
        .with.default()
        .ext(DockerDevboxExt).nginxProxy(context.instance.name)
    }
  }
}
