/* eslint-disable no-multi-assign */

exports = module.exports = (done) => {
  const Role = require('keystone').list('Role');

  Role.model.find({}, (err, roleDocs) => {
    const functions = [];

    for (let i = 0; i < roleDocs.length; i += 1) {
      functions.push(((doc) => {
        return function (callback) {
          doc.needs = ['Sample need 1', 'Sample need 2'];
          doc.secretGoal = 'Sample Secret Goal';
          doc.save(callback);
        };
      })(roleDocs[i]));
    }

    require('async').parallel(functions, (_err, results) => {
      console.log(_err);
      console.log(results);
      done();
    });
  });
};
