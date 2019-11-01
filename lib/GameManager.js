
/**
 * @Stake v3
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

const GameManager = function (gameSession) {
  const GameLogic = require('./GameLogic');
  const Game = new GameLogic();

  Game.Initialize(gameSession);

  return Game;
};

module.exports = GameManager;
