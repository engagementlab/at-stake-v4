/* @Stake v3 */

/**
 * Route definitions
 *
 * @module routes
 * */

const express = require('express');

const router = express.Router();
const keystone = require('keystone');
const middleware = require('./middleware');

const importRoutes = keystone.importer(__dirname);

router.use(middleware.locals);
// Import Route Controllers

const routes = {
  api: importRoutes('./api'),
  views: importRoutes('./views'),
};

// Setup Route Bindings

// CORS
router.all('/*', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, HEAD, PUT');
  res.header('Access-Control-Expose-Headers', 'Content-Length');
  res.header('Access-Control-Allow-Headers', 'Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method');

  if (req.method === 'OPTIONS') res.sendStatus(200);
  else next();
});

// Views
router.get('/', routes.views.index);
router.get('/play/host/:accesscode', routes.views.decider.game);
router.get('/play/:accesscode?/:username?', routes.views.game.play);

router.post('/login', routes.views.game.player);

// API Endpoints
router.get('/api/data/get/:type/:key?', keystone.middleware.api, routes.api.data.get);

router.get('/api/generate', keystone.middleware.api, routes.api.gamesession.generate);
router.post('/api/create', keystone.middleware.api, routes.api.gamesession.create);
router.post('/api/load', keystone.middleware.api, routes.api.templates.load);

module.exports = router;
