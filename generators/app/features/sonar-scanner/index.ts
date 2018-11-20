import { DefaultFeature, DockerComposeFeature, Feature, FeatureContext } from '../feature'
import { ConfigBuilder } from '@gfi-centre-ouest/docker-compose-builder'

export class SonarScanner extends DefaultFeature implements Feature, DockerComposeFeature<SonarScanner> {
  name: string = 'sonar-scanner'
  label: string = 'Sonar Scanner'
  serviceName: string = 'sonar-scanner'
  directory: string = __dirname
  duplicateAllowed: boolean = true

  dockerComposeConfiguration (builder: ConfigBuilder, context: FeatureContext<SonarScanner>, dev?: boolean): void {
    if (!dev) {
      builder.service(context.service.name)
        .with.default()
        .assign({ command: '/bin/true' })
        .volume.project('/root/src')
    }
  }
}
