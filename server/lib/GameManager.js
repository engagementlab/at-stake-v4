/**
 * @Stake v4
 * Developed by Engagement Lab, 2016-2017
 * ==============
 * Game manager.
 *
 * @class lib
 * @static
 * @author Johnny Richardson
 *
 * ==========
 */

// Arrow functions can't be used as constructors, so we must use function()
// eslint-disable-next-line func-names
const GameManager = function (gameSession, callback) {
  const GameLogic = require('./GameLogic');
  const Game = new GameLogic();

  // TODO: Entire call chain is async
  Game.Initialize(gameSession, () => {
    callback();
  });

  return Game;
};

module.exports = GameManager;