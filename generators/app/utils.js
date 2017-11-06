function toCamel(str) {
  return str.replace(/-([a-z])/g, function(g) {
    return g[1].toUpperCase();
  });
}

var walkSync = function(dirs, filelist, fs) {
  var fs = fs || require('fs');
  for (dir of dirs) {
    const files = fs.readdirSync(dir);
    filelist = filelist || [];
    files.forEach(function(file) {
      if (fs.statSync(dir + file).isDirectory()) {
        filelist = walkSync(dir + file + '/', filelist);
      } else {
        filelist.push(file);
      }
    });
    return filelist;
  }
};

module.exports = {
  toCamel,
  walkSync
};
