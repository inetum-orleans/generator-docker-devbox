import * as process from 'process'
import { spawn } from 'child_process'

export interface ProcessOutput {
  code: number,
  output: any[],
  stdout: any[],
  stderr: any[]
}

export async function bash (cmd: string,
                            stdout: NodeJS.WriteStream | null = process.stdout,
                            stderr: NodeJS.WriteStream | null = process.stderr): Promise<ProcessOutput> {

  const bash = spawn('bash', ['-c', cmd])
  const output: any[] = []
  const outputStderr: any[] = []
  const outputStdout: any[] = []

  return new Promise<ProcessOutput>((resolve, reject) => {
    bash.stdout.on('data', (data: any) => {
      output.push(data)
      if (stdout) {
        stdout.write(data)
      }
      outputStdout.push(data)
    })

    bash.stderr.on('data', (data: any) => {
      output.push(data)
      if (stderr) {
        stderr.write(data)
      }
      outputStderr.push(data)
    })

    bash.on('close', (code: number) => {
      if (code) {
        reject({ code, output, stdout: outputStdout, stderr: outputStderr })
      } else {
        resolve({ code, output, stdout: outputStdout, stderr: outputStderr })
      }
      bash.kill()
    })
  })
}
