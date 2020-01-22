/**
 * @Stake v4
 * Developed by Engagement Lab, 2016-2017
 * ==============
 * Game type core methods
 *
 * @class Gametype
 * @static
 * @author Johnny Richardson
 *
 * ==========
 */
const keystone = require('keystone');

// Arrow functions can't be used as constructors, so we must use function()
// eslint-disable-next-line func-names
module.exports = function (gameSession) {
  const _SESSION_CONFIG = gameSession;
  const _PLAYERS = [];

  this.PlayerReady = (player) => {
    _PLAYERS.push(player);
  };
};