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
router.all('/*', keystone.middleware.cors);

// Views
router.get('/', routes.views.index);
router.get('/play/host/:accesscode', routes.views.decider.game);
router.get('/play/:accesscode?/:username?', routes.views.game.play);

router.post('/login', routes.views.game.player);
// API Endpoints
router.get('/api/generate', keystone.middleware.api, routes.api.gamesession.generate);
router.post('/api/create', keystone.middleware.api, routes.api.gamesession.create);
router.post('/api/load', keystone.middleware.api, routes.api.templates.load);

module.exports = router;
