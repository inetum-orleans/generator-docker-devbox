const utils = require('./utils');

class Container {
  constructor(name, options = {}) {
    this.name = name;
    this.additionalPromptsEntries = options.prompts || [];
    this.default = options.default;
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
        name: this.containerVariable,
        message: `Use ${this.name} container`,
        default: this.default,
        store: true
      }
    ];
  }

  additionalPrompts(image) {
    if (!image) {
      image = this;
    }

    return image.additionalPromptsEntries.map(prompt => {
      return Object.assign({}, prompt, {
        when: answers => {
          return answers[prompt.name] === undefined && answers[this.containerVariable] && (!answers[this.imageVariable] || answers[this.imageVariable] === image.name);
        }
      });
    });
  }

  get containerVariable() {
    return `${utils.toCamel(this.name)}Container`;
  }

  get imageVariable() {
    return `${utils.toCamel(this.name)}Image`;
  }
}

class ContainerGroup extends Container {
  constructor(name, images) {
    super(name);
    this.images = images;
  }

  prompts() {
    const prompts = super.prompts();

    for (const image of this.images) {
      const additionalPrompts = this.additionalPrompts(image);
      if (additionalPrompts) {
        prompts.push(...additionalPrompts);
      }
    }

    return prompts;
  }

  mainPrompts() {
    const prompts = super.mainPrompts();

    const choices = this.images.map(image => image.name);

    if (choices.length > 1) {
      prompts.push({
        type: 'list',
        name: this.imageVariable,
        message: `Which ${this.name} image`,
        when: answers => {
          return answers[this.containerVariable];
        },
        store: true,
        choices: choices
      });
    }

    return prompts;
  }
}

prompts = {
  phpVersion: {
    type: 'list',
    name: 'phpVersion',
    message: 'PHP Version',
    store: true,
    choices: ['7.2', '7.1', '7.0', '5.6']
  },
  phpFpmVersion: {
    type: 'list',
    name: 'phpFpmVersion',
    message: 'PHP-FPM Version',
    store: true,
    choices: ['7.2-fpm', '7.1-fpm']
  },
  postgresVersion: {
    type: 'list',
    name: 'postgresVersion',
    message: 'PostgreSQL Version',
    default: '9.6',
    store: true,
    choices: ['10.0', '9.6', '9.5', '9.4', '9.3']
  },
  mysqlVersion:  {
    type: 'list',
    name: 'mysqlVersion',
    message: 'MySQL Version',
    store: true,
    choices: ['5.7', '5.6', '5.5']
  },
  mariaDbVersion: {
    type: 'list',
    name: 'mariaDbVersion',
    message: 'MariaDB Version',
    store: true,
    choices: ['latest', '10.2', '10.1', '10.0', '5.5']
  },
  solrVersion: {
    type: 'list',
    name: 'solrVersion',
    message: 'SolR Version',
    store: true,
    choices: ['latest']
  }
}

images = [
  new ContainerGroup('web', [
    new Container('php', {
      prompts: [prompts.phpVersion]
    }),
    new Container('php-fpm', {
      prompts: [prompts.phpVersion]
    })
  ]),
  new ContainerGroup('db', [
    new Container('postgres', {
      prompts: [prompts.postgresVersion]
    }),
    new Container('mysql', {
      prompts: [prompts.mysqlVersion]
    }),
    new Container('mariadb', {
      prompts: [prompts.mysqlVersion]
    }),
  ]),
  new Container('node', {
    default: false
  }),
  new Container('mailcatcher'),
  new Container('phing', {
    default: false,
    prompts: [prompts.phpVersion]
  }),
  new Container('node-sass', {
    default: false
  }),
  new Container('mapserver', {
    default: false
  }),
  new Container('maven', {
    default: false
  }),
  new Container('selenium', {
    default: false
  }),
  new Container('solr', {
    default: false
  })
];

module.exports = images;
