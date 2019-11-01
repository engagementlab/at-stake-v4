/* eslint-disable no-console */

module.exports = (grunt, options) => {
  const ignoreFilter = [
    '../node_modules/.git/',
    '../node_modules/node_modules/',
    '../client/',
  ];
  // var watchFilter = [];
  // var fs = require('fs');

  return {

    debug: {
      script: 'app.js',
      options: {
        nodeArgs: ['--inspect'],
        verbose: true,
        env: {
          port: 3000,
        },
      },
    },

    serve: {
      script: 'app.js',
      options: {
        nodeArgs: ['--inspect'],
        verbose: true,
        ignore: ignoreFilter,
        ext: 'js,hbs',
        callback(nodemon) {
          nodemon.on('log', (event) => {
            console.log(event.colour);
          });
          nodemon.on('restart', (event) => {
            console.log('node restarted');
          });
        },
      },
    },

  };
};
