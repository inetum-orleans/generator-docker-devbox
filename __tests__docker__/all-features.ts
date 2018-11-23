import * as helpers from 'yeoman-test'
import AppGenerator from '../generators/app'

import * as os from 'os'
import * as path from 'path'

import { spawn } from 'child_process'
import chalk from 'chalk'

async function bash (cmd: string) {
  const process = spawn('bash', ['-c', cmd])

  const output: string[] = []
  return new Promise((resolve, reject) => {
    process.stdout.on('data', (data: any) => {
      const line = chalk.gray(`${data}`.trimRight())
      output.push(line)
    })

    process.stderr.on('data', (data: any) => {
      const line = chalk.red(`${data}`.trimRight())
      console.log(line)
      output.push(line)
    })

    process.on('close', (code: number) => {
      process.kill()
      if (code) {
        console.error(`process exited with code ${code}`)
        console.log(output.join(os.EOL))
        reject(code)
      } else {
        resolve(code)
      }
    })
  })
}

describe('All features', () => {
  beforeAll(async () => {
    return helpers.run(AppGenerator, {
      resolved: require.resolve(path.join(__dirname, '../generators/app')),
      namespace: 'generator-docker-devbox:app'
    }).withPrompts({
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
    await bash('source .bash_enter && dc config')
  }, 1000 * 60 * 5)

  it('should build docker images with no error', async () => {
    await bash('source .bash_enter && dc build')
  }, 1000 * 60 * 30)
})
