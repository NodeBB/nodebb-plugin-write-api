'use strict';
/* globals module, require */

var	passport = module.parent.require('passport'),
	BearerStrategy = require('passport-http-bearer').Strategy,

	auth = require('./lib/auth'),
	sockets = require('./lib/sockets'),

	API = {};

API.init = function(data, callback) {
	var routes = require('./routes')(data.middleware);

	// Set up HTTP bearer authentication via Passport
	passport.use(new BearerStrategy({}, function(token, done) {
		// Find the user by token.  If there is no user with the given token, set
		// the user to `false` to indicate failure.  Otherwise, return the
		// authenticated `user`.  Note that in a production-ready application, one
		// would want to validate the token for authenticity.
		auth.verifyToken(token, done);
	}));

	// API Versions
	data.router.use('/api/v1', routes.v1);

	// ACP
	require('./routes/admin')(data.router, data.middleware);

	// WebSocket listeners
	sockets.init();

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

module.exports = API;