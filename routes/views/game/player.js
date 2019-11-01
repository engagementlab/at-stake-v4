/**
 * @Stake v3
 * Developed by Engagement Lab, 2015
 * ==============
 * Game player view controller.
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

const GameSession = keystone.list('GameSession');
const Session = require('learning-games-core').SessionManager;

// eslint-disable-next-line no-multi-assign
exports = module.exports = (req, res) => {
  const data = (req.method === 'POST') ? req.body : req.query;

  const {
    locals,
  } = res;

  const accessCode = data.code.toUpperCase();

  locals.game_not_found = false;

  // locals.section is used to set the currently selected
  // item in the header navigation.
  locals.section = 'player';
  locals.env = 'development';

  if (Session.Get(accessCode)) {
    if (Session.Get(accessCode).IsFull()) {
      res.send({
        error_code: 'session_full',
        msg: 'Sorry! This game is full!',
      });
      return;
    }
    if (data.name === undefined || data.name.length === 0) {
      res.send({
        error_code: 'no_username',
        msg: 'You need to enter a username!',
      });
      return;
    }
  }

  GameSession.model.findOne({
    accessCode,
  }, (err, game) => {
    if (game === null || game === undefined || Session.Get(accessCode) === undefined) {
      locals.game_not_found = true;
      res.send({
        error_code: 'wrong_code',
        msg: `Game for room code "${accessCode}" not found.`,
      });

      return;
    }
    locals.game = game;

    res.send({
      code: game.accessCode,
    });
  });
};
