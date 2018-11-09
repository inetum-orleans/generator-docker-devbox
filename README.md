# generator-docker-devbox

![npm](https://img.shields.io/npm/v/@gfi-centre-ouest/generator-docker-devbox.svg)
![Build Status](https://img.shields.io/travis/gfi-centre-ouest/generator-docker-devbox.svg)

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
yo docker-devbox
```

## Use local installation of generator for development

Use [npm link](https://docs.npmjs.com/cli/link) to use local installation of generator

```bash
git clone https://github.com/gfi-centre-ouest/generator-docker-devbox
cd generator-docker-devbox
npm link
```

Then you need run the project in watch mod for TypeScript source changes to be compiled on change.

```bash
npm run start
```

## Getting To Know Yeoman

 * Yeoman has a heart of gold.
 * Yeoman is a person with feelings and opinions, but is very easy to work with.
 * Yeoman can be too opinionated at times but is easily convinced not to be.
 * Feel free to [learn more about Yeoman](http://yeoman.io/).

## License

MIT © [GFI Informatique](https://www.gfi.world/)
