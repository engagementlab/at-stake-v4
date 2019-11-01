module.exports = function (grunt, options) {
  const sass = require('node-sass');
  const destPath = `${__dirname}/../public/styles/core.css`;
  const srcPath = `${__dirname}/../public/styles/core.scss`;

  const dist = {
    options: {
      style: 'expanded',
      trace: true,
      sourceMap: true,
      implementation: sass,
    },
    files: {

    },
  };

  dist.files[destPath] = srcPath;

  return { dist };
};
