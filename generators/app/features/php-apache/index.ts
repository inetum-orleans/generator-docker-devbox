import * as Generator from 'yeoman-generator'
import { DefaultFeature, FeatureContext } from '../feature'
import { ConfigBuilder } from '@gfi-centre-ouest/docker-compose-builder'
import { DockerComposeFeature, DockerDevboxExt } from '../docker'

export class PhpApache extends DefaultFeature implements DockerComposeFeature<PhpApache> {
  name: string = 'php-apache'
  label: string = 'Apache with PHP'
  serviceName: string = 'web'
  directory: string = __dirname
  duplicateAllowed: boolean = true

  questions? (): Generator.Questions {
    return [{
      type: 'list',
      name: 'phpVersion',
      message: 'PHP Version',
      choices: ['7.2', '7.1', '7.0', '5.6'],
      default: '7.2',
      store: true
    }]
  }

  dockerComposeConfiguration (builder: ConfigBuilder, context: FeatureContext<PhpApache>, dev?: boolean): void {
    if (!dev) {
      builder.service(context.service.name)
        .with.default()
        .volume.project('/var/www/html')
        .volume.relative('apache.conf', '/etc/apache2/sites-enabled/000-default.conf')
        .volume.named(`${context.service.name}-composer-cache`, '/composer/cache')
    } else {
      builder.service(context.service.name)
        .ext(DockerDevboxExt).nginxProxy().xdebug()
    }
  }
}
