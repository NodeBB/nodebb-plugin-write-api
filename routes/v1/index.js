'use strict';
/* globals module, require */

var apiMiddleware = require('../../middleware'),
	errorHandler = require('../../lib/errorHandler'),
	plugins = require.main.require('./src/plugins');

module.exports = function(app, middleware) {
	app.use('/users', require('./users')(middleware));
	app.use('/groups', require('./groups')(middleware));
	app.use('/posts', require('./posts')(middleware));
	app.use('/topics', require('./topics')(middleware));
	app.use('/categories', require('./categories')(middleware));

	app.get('/ping', function(req, res) {
		res.status(200).json({
			code: 'ok',
			message: 'pong',
			params: {}
		});
	});

	app.post('/ping', apiMiddleware.requireUser, function(req, res) {
		res.status(200).json({
			code: 'ok',
			message: 'pong, accepted test POST ping for uid ' + req.user.uid,
			params: {
				uid: req.user.uid
			}
		});
	});

	// This router is reserved exclusively for plugins to add their own routes into the write api plugin. Confused yet? :trollface:
	var customRouter = require('express').Router();
	plugins.fireHook('filter:plugin.write-api.routes', {
		router: customRouter
	}, function(err, payload) {
		app.use('/', payload.router);

		app.use(function(req, res) {
			// Catch-all
			errorHandler.respond(404, res);
		});
	});

	return app;
};