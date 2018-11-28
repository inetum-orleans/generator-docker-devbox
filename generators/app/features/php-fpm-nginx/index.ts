import { dirnameFrom, DockerComposeFeature, FeatureAsyncInit } from '../feature'
import { ConfigBuilder } from '@gfi-centre-ouest/docker-compose-builder'
import { FeatureContext } from '../../index'
import { PortsManager } from '../../managers'
import { Php } from '../common/php'
import { DockerDevboxExt } from '../../docker'

export class PhpFpmNginx extends Php implements DockerComposeFeature<PhpFpmNginx>, FeatureAsyncInit {
  name: string = 'php-fpm-nginx'
  label: string = 'Nginx with PHP-FPM'
  instanceName: string = 'php'
  otherInstanceNames: string[] = ['web']
  directory: string | string[] = [dirnameFrom('php'), __dirname]
  phpMode: string = 'fpm'

  dockerComposeConfiguration (builder: ConfigBuilder, context: FeatureContext<PhpFpmNginx>, portsManager: PortsManager, dev?: boolean): void {
    super.dockerComposeConfiguration(builder, context, portsManager)

    if (!dev) {
      builder.service(context.instances.web.name)
        .with.default()
        .volume.project('/var/www/html')
        .volume.relative('nginx.conf', '/etc/nginx/conf.d/default.conf')
    } else {
      builder.service(context.instances.web.name)
        .ext(DockerDevboxExt).nginxProxy()
    }
  }
}
