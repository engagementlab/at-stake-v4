/**
 * @Stake v3
 * Developed by Engagement Lab, 2015
 * ==============
 * Game entry view controller.
 *
 * Help: http://keystonejs.com/docs/getting-started/#routesviews-firstview
 *
 * @class game
 * @static
 * @author Johnny Richardson
 *
 * ==========
 */

const keystone = require('keystone');

const Intro = keystone.list('Intro');

// eslint-disable-next-line no-multi-assign
exports = module.exports = (req, res) => {
  const view = new keystone.View(req, res);
  const {
    locals,
  } = res;

  // locals.section is used to set the currently loaded view
  locals.section = 'play';

  // Save host to allow path specification for socket.io
  locals.socketHost = req.headers.host;
  if (process.env.NODE_ENV !== 'development') locals.socketHost = `${(process.env.NODE_ENV === 'staging') ? 'qa.' : ''}atstakegame.org`;

  // Enable debugging on staging/dev only
  if (process.env.NODE_ENV !== 'production') {
    if (req.query.debug !== undefined) locals.debug = true;

    // Has access code/username in URL? (testing)
    if (req.params.accesscode) {
      locals.accesscode = req.params.accesscode;
    }
    if (req.params.username) {
      locals.username = req.params.username;
    }
  } else if (req.params.mode === 'mobile') locals.mobile = true;

  Intro.model.findOne({}, (err, intro) => {
    locals.text = intro.text;

    view.on('init', (next) => {
      next();
    });

    // Render the view
    view.render('game/player');
  });
};