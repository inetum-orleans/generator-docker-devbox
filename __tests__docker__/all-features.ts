import * as helpers from 'yeoman-test'
import AppGenerator from '../generators/app'
import * as path from 'path'
import { bash } from '../generators/app/system'

describe('All features', () => {
  beforeAll(async () => {
    return helpers.run(AppGenerator, {
      resolved: require.resolve(path.join(__dirname, '../generators/app')),
      namespace: 'generator-docker-devbox:app'
    }).withArguments('bash-disabled')
      .withPrompts({
        'features~0': [
          'mail-catcher',
          'map-server',
          'mysql',
          'node',
          'phing',
          'php-apache',
          'postgresql',
          'sonar-scanner'
        ]
      }).toPromise()
  })

  it('should have valid docker-compose configuration', async () => {
    return bash('. .bash_enter && dc config')
  }, 1000 * 60 * 5)

  it('should build docker images with no error', async () => {
    return bash('. .bash_enter && dc build')
  }, 1000 * 60 * 30)
})
