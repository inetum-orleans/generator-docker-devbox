import { DefaultFeature, DockerComposeFeature, Feature } from '../feature'
import { ConfigBuilder } from '@gfi-centre-ouest/docker-compose-builder'
import { FeatureContext } from '../../index'
import { PortsManager } from '../../managers'

export class SonarScanner extends DefaultFeature implements Feature, DockerComposeFeature<SonarScanner> {
  name: string = 'sonar-scanner'
  label: string = 'Sonar Scanner'
  instanceName: string = this.name
  directory: string = __dirname
  duplicateAllowed: boolean = true

  dockerComposeConfiguration (builder: ConfigBuilder, context: FeatureContext<this>, portsManager: PortsManager, dev?: boolean): void {
    if (!dev) {
      builder.service(context.instance.name)
        .with.default()
        .assign({ command: '/bin/true' })
        .volume.project('/root/src')
    }
  }
}
