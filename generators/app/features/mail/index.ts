import { DefaultFeature, DockerComposeFeature } from '../feature'
import { ConfigBuilder } from '@gfi-centre-ouest/docker-compose-builder'
import { DockerDevboxExt } from '../../docker'
import { FeatureContext } from '../../index'
import { PortsManager } from '../../managers'
import { Answers, Question } from 'yeoman-generator'
import * as path from 'path'

export class Mail extends DefaultFeature implements DockerComposeFeature<Mail> {
  name: string = 'mail'
  label: string = 'Mail'
  instanceName: string = this.name
  directory: string = __dirname
  duplicateAllowed: boolean = false

  questions (): Question<Answers>[] {
    return [{
      type: 'list',
      name: 'mailserver',
      message: 'Mail server',
      choices: ['mailcatcher', 'maildev', 'mailhog'],
      default: 'mailcatcher',
      store: true
    }
    ]
  }

  templateDirectory (context: FeatureContext<this>, directory: string): string {
    return path.join(directory, `${context.mailserver}-templates`)
  }

  dockerComposeConfiguration (builder: ConfigBuilder, context: FeatureContext<Mail>, portsManager: PortsManager, dev?: boolean): void {
    if (dev) {
      builder.service(context.instance.name)
        .with.default()
        .ext(DockerDevboxExt).reverseProxy(context.instance.name)
    }
  }
}
