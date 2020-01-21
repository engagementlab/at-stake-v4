module.exports = (grunt, options) => {
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
