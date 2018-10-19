const extend = require('deep-extend');
const path = require('path');

const Handlebars = require('handlebars');
Handlebars.registerHelper('if_eq', function (a, b, opts) {
  if (a === b) return opts.fn(this);
  return opts.inverse(this);
});

function copyTpl(fs, from, to, context, tplSettings, options) {
  context = context || {};

  options = extend(options || {}, {globOptions: {dot: true}});

  try {
    fs.copy(
      from,
      to,
      extend(options, {
        process: function (contents, filename) {
          if (filename.endsWith('.hbs')) {
            const precompileTplSettings = extend({srcName: filename}, tplSettings);
            const templateAst = Handlebars.parse(contents.toString(), precompileTplSettings);
            const template = Handlebars.compile(templateAst);
            return template(context);
          }
          return contents;
        }
      })
    );
  } catch (err) {
    if (err.code !== 'ERR_ASSERTION') {
      throw err;
    }
  }
}

function copyAllTpl(generator, includes) {
  for (const defaultInclude of includes) {
    let destination;
    if (defaultInclude.indexOf('*') > -1) {
      destination = generator.destinationRoot();
    } else {
      destination = path.join(generator.destinationRoot(), defaultInclude);
    }

    copyTpl(
      generator.fs,
      generator.templatePath(`${defaultInclude}`),
      destination,
      generator.props
    )
  }

}

module.exports = {
  copyTpl,
  copyAllTpl
};
