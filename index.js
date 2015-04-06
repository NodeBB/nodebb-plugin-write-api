'use strict';
/* globals module, require */

var	passport = module.parent.require('passport'),
	BearerStrategy = require('passport-http-bearer').Strategy,

	auth = require('./lib/auth'),
	sockets = require('./lib/sockets'),

	API = {};

API.init = function(data, callback) {
	// API Versions
	var routes = require('./routes')(data.middleware);
	data.router.use('/api/v1', routes.v1);

	// Set up HTTP bearer authentication via Passport
	passport.use(new BearerStrategy({}, function(token, done) {
		// Find the user by token.  If there is no user with the given token, set
		// the user to `false` to indicate failure.  Otherwise, return the
		// authenticated `user`.  Note that in a production-ready application, one
		// would want to validate the token for authenticity.
		auth.verifyToken(token, done);
	}));

	require('./routes/admin')(data.router, data.middleware);	// ACP
	sockets.init();	// WebSocket listeners

	callback();
};

API.addMenuItem = function(custom_header, callback) {
	custom_header.plugins.push({
		route: '/plugins/write-api',
		icon: 'fa-cogs',
		name: 'Write API'
	});

	callback(null, custom_header);
};

API.authenticate = function(data) {
	require('./routes/v1/middleware').requireUser(data.req, data.res, data.next);
};

module.exports = API;