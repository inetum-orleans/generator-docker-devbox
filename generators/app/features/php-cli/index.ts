import { dirnameFrom, DockerComposeFeature, FeatureAsyncInit } from '../feature'
import { Php } from '../common/php'

export class PhpCli extends Php implements DockerComposeFeature<PhpCli>, FeatureAsyncInit {
  name: string = 'php-cli'
  label: string = 'PHP (cli)'
  instanceName: string = 'php'
  directory: string | string[] = [dirnameFrom('php'), __dirname]
  phpMode: string = 'cli'
}
