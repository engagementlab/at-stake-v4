/**
 * @Stake v3
 * Developed by Engagement Lab, 2015
 * ==============
 * Game template loader (for debugging).
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
const TemplateLoader = require('../../lib/TemplateLoader');

const GameSession = keystone.list('GameSession');

// var debugData =

exports.load = (req, res) => {
  const {
    locals,
  } = res;

  const data = (req.method === 'POST') ? req.body : req.query;

  locals.section = 'debug';

  GameSession.model.findOne({
    accessCode: 'TEST',
  }).exec((err, game) => {
    const Templates = new TemplateLoader(game.gameType);
    let templateData;

    if (game._doc.debugData) {
      templateData = game._doc.debugData[data.event_id];
    }

    Templates.Load(data.template_path, templateData, (html) => {
      res.send({
        id: data.event_id,
        eventData: html,
      });
    });
  });
};
