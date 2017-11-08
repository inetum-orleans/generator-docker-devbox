const utils = require('./utils');

const shelljs = require('shelljs');

const path = require('path');


class Init {
  constructor(name, options = {}) {
    this.name = name;
    this.additionalPromptsEntries = options.prompts || [];
    this.default = options.default;
  }

  init(props) {
    // Default implementation do nothing
  }

  prompts() {
    const prompts = [];

    const mainPrompt = this.mainPrompts();
    if (mainPrompt) {
      prompts.push(...mainPrompt);
    }

    const additionalPrompts = this.additionalPrompts();
    if (additionalPrompts) {
      prompts.push(...additionalPrompts);
    }

    return prompts;
  }

  mainPrompts() {
    return [
      {
        type: 'confirm',
        name: this.initVariable,
        message: `Initialize ${this.name}`,
        default: this.default,
        store: true
      }
    ];
  }

  additionalPrompts(init) {
    if (!init) {
      init = this;
    }

    return init.additionalPromptsEntries.map(prompt => {
      return Object.assign({}, prompt, {
        when: answers => {
          return answers[this.initVariable];
        }
      });
    });
  }

  get initVariable() {
    return `${utils.toCamel(this.name)}Init`;
  }
}

inits = [
  new Init('drupal', {
    default: false,
    prompts: [
      {
        type: 'list',
        name: 'drupalInitProfil',
        message: 'Profil',
        store: true,
        default: 'standard',
        choices: ['standard', 'gfi']
      }
    ]
  })
];

module.exports = inits;
