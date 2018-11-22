import * as assert from 'yeoman-assert'
import * as helpers from 'yeoman-test'
import AppGenerator from '../generators/app'

const path = require('path')

describe('generator-docker-devbox:app', () => {
  describe('Default answers', () => {
    beforeAll(async () => {
      return helpers.run(AppGenerator, {
        resolved: require.resolve(path.join(__dirname, '../generators/app')),
        namespace: 'generator-docker-devbox:app'
      }).toPromise()
    })

    it('should have SmartCD entrypoint files', () => {
      assert.file('.bash_enter')
    })

    it('should have default .bin scripts', () => {
      assert.file([
        '.bin/dc',
        '.bin/system',
        '.bin/yo',
        '.bin/mo'
      ])
    })

    it('should have default .bash_enter.d scripts', () => {
      assert.file([
        '.bash_enter.d/01-env',
        '.bash_enter.d/03-functions',
        '.bash_enter.d/05-variables',
        '.bash_enter.d/10-path',
        '.bash_enter.d/12-install-jq',
        '.bash_enter.d/20-mo',
        '.bash_enter.d/30-env-symlinks',
        '.bash_enter.d/50-ca-certificates',
        '.bash_enter.d/60-cfssl-cli-gencert',
        '.bash_enter.d/62-nginx-proxy-config',
        '.bash_enter.d/95-init'
      ])
    })

    it('should have default .bash_leave.d scripts', () => {
      assert.file([
        '.bash_leave.d/01-env',
        '.bash_leave.d/90-cleanup-path',
        '.bash_leave.d/95-cleanup-variables'
      ])
    })
  })

  describe('single group, apache-php', () => {
    beforeAll(async () => {
      return helpers.run(AppGenerator, {
        resolved: require.resolve(path.join(__dirname, '../generators/app')),
        namespace: 'generator-docker-devbox:app'
      }).withPrompts({
        'features~0': [
          'php-apache'
        ]
      }).toPromise()
    })

    it('should have Dockerfile.mo in web service', () => {
      assert.file('.docker/web/Dockerfile.mo')
      assert.noFile('.docker/db/Dockerfile.mo')
    })
  })

  describe('single group, apache-php + postgres', () => {
    beforeAll(async () => {
      return helpers.run(AppGenerator, {
        resolved: require.resolve(path.join(__dirname, '../generators/app')),
        namespace: 'generator-docker-devbox:app'
      }).withPrompts({
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
