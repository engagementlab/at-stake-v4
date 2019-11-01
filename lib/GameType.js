/**
 * @Stake v3
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

module.exports = function (gameSession) {
  const _SESSION_CONFIG = gameSession;
  const _PLAYERS = [];

  this.PlayerReady = function (player) {
    _PLAYERS.push(player);
  };
};
