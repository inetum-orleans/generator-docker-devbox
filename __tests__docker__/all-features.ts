import * as helpers from 'yeoman-test'
import AppGenerator from '../generators/app'

import * as path from 'path'
import * as os from 'os'

import { spawn } from 'child_process'

async function run (cmd: string) {
  const process = spawn('bash', ['-c', cmd])

  const output: string[] = []
  return new Promise((resolve, reject) => {
    process.stdout.on('data', (data: any) => {
      output.push(`${data}`)
    })

    process.stderr.on('data', (data: any) => {
      output.push(`${data}`)
    })

    process.on('close', (code: number) => {
      process.kill()
      if (code) {
        console.error(`process exited with code ${code}`)
        console.error(output.join(os.EOL))
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
    await run('source .bash_enter && dc config')
  }, 1000 * 60 * 5)

  it('should build docker images with no error', async () => {
    await run('source .bash_enter && dc build')
  }, 1000 * 60 * 30)
})
