import * as process from 'process'
import { spawn } from 'child_process'

export async function bash (cmd: string, stdout = process.stdout, stderr = process.stderr): Promise<{ code: number, output: any[], stdout: any[], stderr: any[] }> {
  const bash = spawn('bash', ['-c', cmd])

  const output: any[] = []
  const outputStderr: any[] = []
  const outputStdout: any[] = []

  const code = await new Promise<number>((resolve, reject) => {
    bash.stdout.on('data', (data: any) => {
      output.push(data)
      stdout.write(data)
      outputStdout.push(data)
    })

    bash.stderr.on('data', (data: any) => {
      output.push(data)
      stderr.write(data)
      outputStderr.push(data)
    })

    bash.on('close', (code: number) => {
      if (code) {
        console.error(`process exited with code ${code}`)
        reject(code)
      } else {
        resolve(code)
      }
      bash.kill()
    })
  })
  return { code, output, stdout: outputStdout, stderr: outputStderr }
}
