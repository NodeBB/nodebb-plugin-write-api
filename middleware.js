'use strict';
/* globals module, require */

var passport = require.main.require('passport'),
	user = require.main.require('./src/user'),
	errorHandler = require('./lib/errorHandler'),

	Middleware = {};

Middleware.requireUser = passport.authenticate('bearer', { session: false });

Middleware.requireAdmin = function(req, res, next) {
	if (!req.user) {
		return errorHandler.respond(401);
	}

	user.isAdministrator(req.user.uid, function(err, isAdmin) {
		if (err || !isAdmin) {
			return errorHandler.respond(401);
		}

		next();
	});
};

module.exports = Middleware;