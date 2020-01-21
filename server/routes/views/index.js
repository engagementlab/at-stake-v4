/**
 * @Stake v3
 * Developed by Engagement Lab, 2015
 * ==============
 * Home page view controller.
 *
 * Help: http://keystonejs.com/docs/getting-started/#routesviews-firstview
 *
 * @class index
 * @static
 * @author Johnny Richardson
 *
 * ==========
 */
const keystone = require('keystone');

const GameConfig = keystone.list('GameConfig');
const Homepage = keystone.list('Homepage');

// eslint-disable-next-line no-multi-assign
exports = module.exports = (req, res) => {
  const view = new keystone.View(req, res);
  const {
    locals,
  } = res;

  locals.section = 'homepage';

  // Query to get current game config data
  const queryConfig = GameConfig.model.findOne({}, {}, {
    sort: {
      createdAt: -1,
    },
  });

  // var queryHomepage = Homepage.model.findOne({}, {}, {
  //   sort: {
  //       'createdAt': -1
  //   }
  // }).populate("principalInvestigator");

  const queryHomepage = Homepage.model.findOne({}, {}, {
    sort: {
      createdAt: -1,
    },
  });

  queryConfig.exec((err, resultConfig) => {
    // If game is enabled, get home page content
    queryHomepage.exec((_err, resultHomepage) => {
      locals.content = resultHomepage;

      // Render the view
      res.render('index');
    });
  });
};
