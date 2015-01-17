'use strict';
/* globals module, require */

var errorHandler = require('../../lib/errorHandler');

module.exports = function(app, middleware) {
	app.use('/users', require('./users')(middleware));
	app.use('/groups', require('./groups')(middleware));
	app.use('/topics', require('./topics')(middleware));

	app.get('/ping', function(req, res) {
		res.json(200, {
			code: 'ok',
			params: 'pong'
		});
	});

	app.use(function(req, res) {
		// Catch-all
		errorHandler.respond(404, res);
	});

	return app;
};