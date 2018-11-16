import { Feature } from './feature'
import { PhpApache } from './php-apache'
import { Postgres } from './postgresql'
import { MySQL } from './mysql'
import { Node } from './node'
import { Mapserver } from './mapserver'
import { Mailcatcher } from './mailcatcher'
import { SonarScanner } from './sonar-scanner'
import { Phing } from './phing'

export const features: Feature[] = [
  new PhpApache(),
  new Postgres(),
  new MySQL(),
  new Node(),
  new Mapserver(),
  new Mailcatcher(),
  new SonarScanner(),
  new Phing()
]
