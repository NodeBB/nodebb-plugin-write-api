'use strict';
/* globals module, require */

var apiMiddleware = require('../../middleware'),
	errorHandler = require('../../lib/errorHandler');

module.exports = function(app, middleware) {
	app.use('/users', require('./users')(middleware));
	app.use('/groups', require('./groups')(middleware));
	app.use('/topics', require('./topics')(middleware));

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

	app.use(function(req, res) {
		// Catch-all
		errorHandler.respond(404, res);
	});

	return app;
};