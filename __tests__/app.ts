'use strict';
const path = require('path');
import * as assert from 'yeoman-assert';
import * as helpers from 'yeoman-test';

describe('generator-docker-devbox:app', () => {
  beforeAll(() => {
    return helpers
      .run(path.join(__dirname, '../generators/app'))
      .withPrompts({ someAnswer: true });
  });

  it('todo', () => {
    console.log('No test at the moment')
  });
});
