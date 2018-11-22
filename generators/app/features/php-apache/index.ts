import * as Generator from 'yeoman-generator'
import { DefaultFeature, DockerComposeFeature, FeatureAsyncInit } from '../feature'
import { ConfigBuilder } from '@gfi-centre-ouest/docker-compose-builder'
import { DockerDevboxExt } from '../../docker'
import { RegistryClient } from '../../docker/registry'
import { Templating } from '../../templating'
import * as path from 'path'
import { Helpers } from '../../helpers'
import { FeatureContext } from '../../index'

export class PhpApache extends DefaultFeature implements DockerComposeFeature<PhpApache>, FeatureAsyncInit {
  name: string = 'php-apache'
  label: string = 'Apache with PHP'
  serviceName: string = 'web'
  directory: string = __dirname
  duplicateAllowed: boolean = true

  asyncQuestions!: Generator.Questions

  async initAsync () {
    const registry = new RegistryClient()
    const allTags = await registry.tagsList('php')

    const tags = allTags
      .filter(tag => /-apache$/.test(tag))
      .filter(tag => /^\d+\.\d+-/.test(tag))
      .filter(tag => !/-rc.*/.test(tag))
      .map(tag => tag.substring(0, tag.length - '-apache'.length))
      .reverse()

    this.asyncQuestions = [
      {
        type: 'list',
        name: 'phpVersion',
        message: 'PHP version',
        choices: tags,
        default: tags[0],
        store: true
      }
    ]
  }

  questions (): Generator.Questions {
    return this.asyncQuestions
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
