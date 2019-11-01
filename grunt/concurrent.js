module.exports = function (grunt, options) {
  const devTasks = [
    'nodemon:serve',
    'watch',
  ];

  const config = {

    dev: {
      tasks: devTasks,
      options: {
        logConcurrentOutput: true,
      },
    },

  };

  return config;
};
