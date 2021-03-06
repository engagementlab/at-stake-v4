/**
 * @Stake v4
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

const GameSession = keystone.list('GameSession');
const Session = require('learning-games-core').SessionManager;
const randomstring = require('randomstring');

const Game = require('../../lib/GameManager');

const Deck = keystone.list('Deck');

/**
 * Create a GameSession
 */
exports.create = (req, res) => {
  const data = (req.method === 'POST') ? req.body : req.query;

  // Check if accessCode defined
  if (!data.accessCode) {
    return res.apiError('Game code not sent!');
  }

  // Check if deck id specified
  if (!data.deckId) {
    return res.apiError('Deck not specified!');
  }

  const session = new GameSession.model();

  session.getUpdateHandler(req).process(data, (err) => {
    if (err) return res.apiError('error', err);

    // Save this session to memory for faster retrieval (deleted when game ends)
    Session.Create(data.accessCode, new Game(session, () => {
      res.apiResponse({
        sessionCreated: true,
        accessCode: data.accessCode,
        decider: data.deciderName,
      });
    }));
  });
};

/**
 * Generate info for Game creation menu
 */
exports.generate = (req, res) => {
  let gameCode;

  function generateCode() {
    // If dev env, default to 'TEST' code to ease testing
    if (process.env.NODE_ENV === 'development') return 'TEST';

    return randomstring.generate({
      length: 4,
      charset: 'alphabetic',
    }).toUpperCase();
  }

  gameCode = generateCode();

  // Check if there's already a game with the generated access code
  GameSession.model.findOne({
    accessCode: gameCode,
  }, (err, session) => {
    // There is! A one in 15,000 probability! Make a new one
    if (session) {
      gameCode = generateCode();
    }

    // Get all decks
    const decksQuery = Deck.model.find({}).populate('roles');
    decksQuery.exec((_err, decks) => {
      // Shuffle deck roles and only get 6
      _.each(decks, (deck, i) => {
        deck.roles = _.sample(deck.roles, 6);
      });

      res.send({
        code: gameCode,
        decks,
      });
    });
  });
};