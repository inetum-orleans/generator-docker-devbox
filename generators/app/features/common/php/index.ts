import { DefaultFeature, DockerComposeFeature, FeatureAsyncInit } from '../../feature'
import * as Generator from 'yeoman-generator'
import { RegistryClient } from '../../../docker/registry'
import { ConfigBuilder } from '@gfi-centre-ouest/docker-compose-builder'
import { FeatureContext } from '../../../index'
import { PortsManager } from '../../../managers'
import { DockerDevboxExt } from '../../../docker'
import { BulkOptions } from '../../../templating'
import * as glob from 'glob'

export abstract class Php extends DefaultFeature implements DockerComposeFeature<Php>, FeatureAsyncInit {
  instanceName: string = 'web'
  directory: string | string[] = __dirname
  duplicateAllowed: boolean = true

  asyncQuestions: Generator.Question[] = []

  abstract phpMode: string

  async initAsync () {
    const registry = new RegistryClient()
    const allTags = await registry.tagsList('php')

    const tags = allTags
      .filter(tag => new RegExp(`-${this.phpMode}$`).test(tag))
      .filter(tag => /^\d+\.\d+-/.test(tag))
      .filter(tag => !/-rc.*/.test(tag))
      .map(tag => tag.substring(0, tag.length - `-${this.phpMode}`.length))
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

  questions (): Generator.Question[] {
    return [...this.asyncQuestions,
      {
        type: 'checkbox',
        name: 'phpExtensions',
        message: 'PHP Extensions',
        choices: ['xdebug', 'gd', 'opcache', 'ldap', 'zip'],
        default: ['xdebug'],
        store: true
      },
      {
        type: 'checkbox',
        name: 'phpTools',
        message: 'PHP Tools',
        choices: [
          { value: 'composer', name: 'Composer' },
          { value: 'symfony-client', name: 'Symfony client' },
          { value: 'phing', name: 'Phing' },
          { value: 'drupal-console', name: 'Drupal Console' },
          { value: 'drush-launcher', name: 'Drush Launcher' },
          'wkhtmltopdf'],
        default: ['composer'],
        store: true
      }
    ]
  }

  get projectVolume () {
    return '/var/www/html'
  }

  dockerComposeConfiguration (builder: ConfigBuilder, context: FeatureContext<Php>, portsManager: PortsManager, dev?: boolean): void {
    if (!dev) {
      builder.service(context.instance.name)
        .with.default()
        .volume.project(this.projectVolume)

      if (context.phpTools.indexOf('composer') !== -1) {
        builder.service(context.instance.name)
          .volume.named(`${context.instance.name}-composer-cache`, '/composer/cache')
      }
    } else {
      builder.service(context.instance.name)
        .ext(DockerDevboxExt).xdebug()
    }
  }

  writeOptions<O extends glob.IOptions & BulkOptions> (options: O, context: FeatureContext<this>, directory: string): O {
    if (!options.excludeFiles) {
      options.excludeFiles = []
    }

    if (context.phpTools.indexOf('composer') === -1) {
      options.excludeFiles.push('.bin/composer.hbs')
    }
    if (context.phpTools.indexOf('drupal-console') === -1) {
      options.excludeFiles.push('.bin/drupal.hbs')
    }
    if (context.phpTools.indexOf('drush-launcher') === -1) {
      options.excludeFiles.push('.bin/drush.hbs')
    }
    if (context.phpTools.indexOf('phing') === -1) {
      options.excludeFiles.push('.bin/phing.hbs')
    }
    if (context.phpTools.indexOf('symfony-client') === -1) {
      options.excludeFiles.push('.bin/symfony.hbs')
    }

    return options
  }
}
