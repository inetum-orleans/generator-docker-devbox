import { DefaultFeature, FeatureContext } from '../feature'
import { DockerComposeFeature, DockerDevboxExt } from '../docker'
import { ConfigBuilder } from '@gfi-centre-ouest/docker-compose-builder'

export class Mapserver extends DefaultFeature implements DockerComposeFeature<Mapserver> {
  name: string = 'mapserver'
  label: string = 'Mapserver'
  serviceName: string = 'mapserver'
  directory: string = __dirname
  duplicateAllowed: boolean = true

  envFiles (context: FeatureContext<Mapserver>): string[] {
    return [`.docker/${context.service.name}/mapserver.map`]
  }

  dockerComposeConfiguration (builder: ConfigBuilder, context: FeatureContext<Mapserver>, dev?: boolean): void {
    if (!dev) {
      builder.service(context.service.name)
        .with.default()
        .env('LISTEN_PORT_80', '1')
        .volume.relative('', '/etc/mapserver')
        .user('${USER_ID}')
    } else {
      builder.service(context.service.name)
        .ext(DockerDevboxExt).nginxProxy(context.service.name)
    }
  }
}
