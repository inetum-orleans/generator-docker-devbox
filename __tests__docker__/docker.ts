import * as helpers from 'yeoman-test'
import AppGenerator from '../generators/app'
import * as path from 'path'
import { features } from '../generators/app/features'
import { bash, buildOptions, BuildOptionsChoiceType } from './utils'

// Because docker sometimes fails to pull images, or hits authentication failures ...
(jest as any).retryTimes(3)

jest.setTimeout(1000 * 60 * 15)

describe('All features', () => {
  describe('Default options', () => {
    beforeAll(async () => {
      return helpers.run(AppGenerator, {
        resolved: require.resolve(path.join(__dirname, '../generators/app')),
        namespace: 'generator-docker-devbox:app'
      }).withArguments('bash-disabled')
        .withPrompts({
          'features~0': features.map(f => f.name)
        }).toPromise()
    })

    it('should validate docker-compose configuration', async () => {
      return bash('. .bash_enter && dc config')
    })

    it('should build docker image', async () => {
      return bash('. .bash_enter && dc build --pull')
    })
  })

  const allOptions = buildOptions('features~0', BuildOptionsChoiceType.ALL, ...features)

  if (allOptions) {
    describe('All options', () => {
      beforeAll(async () => {
        return helpers.run(AppGenerator, {
          resolved: require.resolve(path.join(__dirname, '../generators/app')),
          namespace: 'generator-docker-devbox:app'
        }).withArguments('bash-disabled')
          .withPrompts({
            'features~0': features.map(f => f.name),
            ...allOptions
          }).toPromise()
      })

      it('should validate docker-compose configuration', async () => {
        return bash('. .bash_enter && dc config')
      })

      it('should build docker images', async () => {
        return bash('. .bash_enter && dc build --pull')
      })
    })
  }

  const noOption = buildOptions('features~0', BuildOptionsChoiceType.NO, ...features)

  if (noOption) {
    describe('No option', () => {
      beforeAll(async () => {
        return helpers.run(AppGenerator, {
          resolved: require.resolve(path.join(__dirname, '../generators/app')),
          namespace: 'generator-docker-devbox:app'
        }).withArguments('bash-disabled')
          .withPrompts({
            'features~0': features.map(f => f.name),
            ...noOption
          }).toPromise()
      })

      it('should validate docker-compose configuration', async () => {
        return bash('. .bash_enter && dc config')
      })

      it('should build docker images', async () => {
        return bash('. .bash_enter && dc build --pull')
      })
    })
  }
})

describe('Each feature', () => {
  describe('Default options', () => {
    for (const feature of features) {
      describe(feature.label, () => {
        beforeAll(async () => {
          return helpers.run(AppGenerator, {
            resolved: require.resolve(path.join(__dirname, '../generators/app')),
            namespace: 'generator-docker-devbox:app'
          }).withArguments('bash-disabled')
            .withPrompts({
              'features~0': [
                'mail-catcher'
              ]
            }).toPromise()
        })

        it('should validate docker-compose configuration', async () => {
          return bash('. .bash_enter && dc config')
        })

        it('should build docker images', async () => {
          return bash('. .bash_enter && dc build --pull')
        })
      })
    }
  })

  describe('All options', () => {
    for (const feature of features) {
      const allOptions = buildOptions('features~0', BuildOptionsChoiceType.ALL, feature)

      if (allOptions) {
        describe(feature.label, () => {
          beforeAll(async () => {
            return helpers.run(AppGenerator, {
              resolved: require.resolve(path.join(__dirname, '../generators/app')),
              namespace: 'generator-docker-devbox:app'
            }).withArguments('bash-disabled')
              .withPrompts({
                'features~0': [
                  feature.name
                ],
                ...allOptions
              }).toPromise()
          })

          it('should validate docker-compose configuration', async () => {
            return bash('. .bash_enter && dc config')
          })

          it('should build docker images', async () => {
            return bash('. .bash_enter && dc build --pull')
          })
        })
      }
    }
  })

  describe('No option', () => {
    for (const feature of features) {
      const noOption = buildOptions('features~0', BuildOptionsChoiceType.NO, feature)

      if (noOption) {
        describe(feature.label, () => {
          beforeAll(async () => {
            return helpers.run(AppGenerator, {
              resolved: require.resolve(path.join(__dirname, '../generators/app')),
              namespace: 'generator-docker-devbox:app'
            }).withArguments('bash-disabled')
              .withPrompts({
                'features~0': [
                  feature.name
                ],
                ...noOption
              }).toPromise()
          })

          it('should validate docker-compose configuration', async () => {
            return bash('. .bash_enter && dc config')
          })

          it('should build docker images', async () => {
            return bash('. .bash_enter && dc build --pull')
          })
        })
      }
    }
  })
})
