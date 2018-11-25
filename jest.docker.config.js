module.exports = {
  'preset': 'ts-jest',
  'testEnvironment': 'node',
  'testRunner': 'jest-circus/runner',
  'testMatch': ['!**/utils.ts', '**/__tests__docker__/**/*.js?(x)', '**/?(*.)+(spec|test).js?(x)', '**/__tests__docker__/**/*.ts?(x)', '**/?(*.)+(spec|test).ts?(x)']
}
