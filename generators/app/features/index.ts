import { Feature } from './feature'
import { PhpApache } from './php-apache'
import { Postgres } from './postgresql'
import { MySQL } from './mysql'
import { Node } from './node'
import { Mapserver } from './mapserver'
import { Mailcatcher } from './mailcatcher'
import { SonarScanner } from './sonar-scanner'
import { Phing } from './phing'
import { MariaDB } from './mariadb'
import { Solr } from './solr'
import { PhpFpmNginx } from './php-fpm-nginx'

export const features: Feature[] = [
  new PhpApache(),
  new PhpFpmNginx(),
  new Postgres(),
  new MySQL(),
  new MariaDB(),
  new Node(),
  new Mapserver(),
  new Mailcatcher(),
  new SonarScanner(),
  new Phing(),
  new Solr()
]
