import { Answers } from 'inquirer'

function cleanupKey (str: string): string {
  const index = str.lastIndexOf('~')
  if (index === -1) {
    return str
  }
  return str.substr(index + 1)
}

export function cleanupAnswers (answers: Answers): Answers {
  const clean: Answers = {}
  for (const key in answers) {
    clean[cleanupKey(key)] = answers[key]
  }
  return clean
}
