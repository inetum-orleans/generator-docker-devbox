const extend = require('deep-extend');

const Handlebars = require('handlebars');
Handlebars.registerHelper('if_eq', function (a, b, opts) {
  if (a === b) return opts.fn(this);
  return opts.inverse(this);
});

// (Yes, I know eval is dangerous)
function evalPrecompiledTemplate(s) {
  return eval('(function(){return ' + s + '}());');
}

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

module.exports = {
  copyTpl
};
