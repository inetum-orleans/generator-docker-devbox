# generator-docker-devbox

[![npm](https://img.shields.io/npm/v/@gfi-centre-ouest/generator-docker-devbox.svg)](https://www.npmjs.com/package/@gfi-centre-ouest/generator-docker-devbox)
[![Build Status](https://img.shields.io/travis/gfi-centre-ouest/generator-docker-devbox.svg)](https://travis-ci.org/gfi-centre-ouest/generator-docker-devbox)

> Yeoman Generator for dockerized development environment.

## Installation

First, install [Yeoman](http://yeoman.io) and generator-docker-devbox using [npm](https://www.npmjs.com/) 
(we assume you have pre-installed [node.js](https://nodejs.org/)).

```bash
npm install -g yo
npm install -g @gfi-centre-ouest/generator-docker-devbox
```

Then generate your new project:

```bash
mkdir my-project
cd my-project
yo @gfi-centre-ouest/docker-devbox
```

## Use local installation of generator for development

Use [npm link](https://docs.npmjs.com/cli/link) to use local installation of generator

```bash
git clone https://github.com/gfi-centre-ouest/generator-docker-devbox
cd generator-docker-devbox
npm link
```

Then you need run the project in watch mod for TypeScript sources to be compiled on change.

```bash
npm run start
```

## License

MIT © [GFI Informatique](https://www.gfi.world/)
