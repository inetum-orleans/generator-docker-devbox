import { dirnameFrom, DockerComposeFeature, FeatureAsyncInit } from '../feature'
import { ConfigBuilder } from '@gfi-centre-ouest/docker-compose-builder'
import { FeatureContext } from '../../index'
import { PortsManager } from '../../managers'
import { Php } from '../common/php'
import { DockerDevboxExt } from '../../docker'
import * as Generator from 'yeoman-generator'

export class PhpApache extends Php implements DockerComposeFeature<PhpApache>, FeatureAsyncInit {
  name: string = 'php-apache'
  label: string = 'Apache with PHP'
  instanceName: string = 'web'
  directory: string | string[] = [dirnameFrom('php'), __dirname]
  phpMode: string = 'apache'

  questions (): Generator.Question[] {
    return [
      ...super.questions(),
      {
        type: 'checkbox',
        name: 'apacheExtensions',
        message: 'Apache Extensions',
        choices: ['rewrite', 'proxy-http'],
        default: ['rewrite'],
        store: true
      }
    ]
  }

  dockerComposeConfiguration (builder: ConfigBuilder, context: FeatureContext<PhpApache>, portsManager: PortsManager, dev?: boolean): void {
    super.dockerComposeConfiguration(builder, context, portsManager, dev)
    if (!dev) {
      builder.service(context.instance.name)
        .volume.relative('apache.conf', '/etc/apache2/sites-enabled/000-default.conf')
    } else {
      builder.service(context.instance.name)
        .ext(DockerDevboxExt).nginxProxy(context.instance.name === this.instanceName ? undefined : context.instance.name)
    }
  }
}
