import * as assert from 'yeoman-assert'
import * as helpers from 'yeoman-test'
import AppGenerator from '../generators/app'

jest.setTimeout(1000 * 60 * 2)

describe('generator-docker-devbox:app', () => {
  describe('Default answers', () => {
    beforeAll(async () => {
      await helpers.run(AppGenerator)
        .withArguments('bash-disabled')
        .toPromise()
    })

    it('should have SmartCD entrypoint files', () => {
      assert.file(['.bash_enter', '.bash_leave'])
    })

    it('should have yo .bin scripts', () => {
      assert.file([
        '.bin/yo'
      ])
    })
  })

  describe('single group, apache-php', () => {
    beforeAll(async () => {
      await helpers.run(AppGenerator)
        .withArguments('bash-disabled')
        .withPrompts({
          'features~0': [
            'php-apache'
          ]
        }).toPromise()
    })

    it('should have Dockerfile.mo in web service', () => {
      assert.file('.docker/web/Dockerfile.mo')
      assert.noFile('.docker/db/Dockerfile.mo')
    })

    it('should have php and composer in .bin', () => {
      assert.file('.bin/php')
      assert.file('.bin/composer')
    })
  })

  describe('single group, apache-php + postgres', () => {
    beforeAll(async () => {
      await helpers.run(AppGenerator)
        .withArguments('bash-disabled')
        .withPrompts({
          'features~0': [
            'php-apache',
            'postgresql'
          ]
        }).toPromise()
    })

    it('should have Dockerfile.mo in db and web services', () => {
      assert.file('.docker/db/Dockerfile.mo')
      assert.file('.docker/web/Dockerfile.mo')
    })
  })
})
