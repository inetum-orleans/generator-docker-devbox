import { bash as _bash, ProcessOutput } from '../generators/app/system'
import { Feature, FeatureAsyncInit } from '../generators/app/features/feature'
import { ChoiceType } from 'inquirer'

export enum BuildOptionsChoiceType {
  NO,
  ALL
}

export async function bash (cmd: string): Promise<ProcessOutput> {
  try {
    const out = await _bash(cmd)
    return out
  } catch (e) {
    const err = e as ProcessOutput
    throw new Error(err.output.join(''))
  }
}

export async function initFeatures (...features: Feature[]) {
  const promises: Promise<any>[] = []
  for (const feature of features) {
    if ((feature as unknown as FeatureAsyncInit).initAsync) {
      promises.push((feature as unknown as FeatureAsyncInit).initAsync())
    }
  }
  return Promise.all(promises)
}

export function buildOptions (featuresPrefix: string, pattern: BuildOptionsChoiceType, ...features: Feature[]): object | null {
  const options: { [k: string]: string[] } = {}
  for (const feature of features) {
    if (feature.questions) {
      const questions = feature.questions()
      for (const question of questions) {
        if (question.choices) {
          const key = `${featuresPrefix}~${feature.name}~${question.name}`
          const values: string[] = []
          if (pattern === BuildOptionsChoiceType.ALL) {
            for (const choice of (question.choices as ReadonlyArray<ChoiceType>)) {
              if (typeof choice === 'string') {
                values.push(choice)
              }
            }
          }
          options[key] = values
        }
      }
    }
  }
  if (!Object.keys(options).length) {
    return null
  }
  return options
}
