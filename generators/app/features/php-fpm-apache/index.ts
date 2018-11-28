import { dirnameFrom, DockerComposeFeature, FeatureAsyncInit } from '../feature'
import { ConfigBuilder } from '@gfi-centre-ouest/docker-compose-builder'
import { FeatureContext } from '../../index'
import { PortsManager } from '../../managers'
import { Php } from '../common/php'
import { DockerDevboxExt } from '../../docker'
import { RegistryClient } from '../../docker/registry'

export class PhpFpmApache extends Php implements DockerComposeFeature<PhpFpmApache>, FeatureAsyncInit {
  name: string = 'php-fpm-apache'
  label: string = 'Apache with PHP-FPM'
  instanceName: string = 'php'
  otherInstanceNames: string[] = ['web']
  directory: string | string[] = [dirnameFrom('php'), __dirname]
  phpMode: string = 'fpm'

  async initAsync () {
    await super.initAsync()

    const registry = new RegistryClient()
    const apacheTags = await registry.tagsList('httpd')

    const tags = apacheTags
      .filter(tag => /^\d+\.\d+(?:.\d+)?$/.test(tag))
      .reverse()

    this.asyncQuestions = [
      ...this.asyncQuestions,
      {
        type: 'list',
        name: 'apacheVersion',
        message: 'Apache version',
        choices: tags,
        default: '2.4',
        store: true
      }
    ]
  }

  questions () {
    const questions = super.questions()

    return [
      ...questions,
      {
        type: 'checkbox',
        name: 'apacheExtensions',
        message: 'Apache Extensions',
        choices: ['rewrite', 'proxy-http'],
        default: ['rewrite'],
        store: true
      }]
  }

  dockerComposeConfiguration (builder: ConfigBuilder, context: FeatureContext<PhpFpmApache>, portsManager: PortsManager, dev?: boolean): void {
    super.dockerComposeConfiguration(builder, context, portsManager, dev)

    if (!dev) {
      builder.service(context.instances.web.name)
        .with.default()
        .volume.project(this.projectVolume)
        .volume.relative('apache.conf', '/usr/local/apache2/conf/custom/apache.conf')
    } else {
      builder.service(context.instances.web.name)
        .ext(DockerDevboxExt).nginxProxy()
    }
  }
}
