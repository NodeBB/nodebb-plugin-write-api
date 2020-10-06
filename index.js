'use strict';

var	passport = require.main.require('passport');
var	winston = require.main.require('winston');
var BearerStrategy = require('passport-http-bearer').Strategy;

var meta = require.main.require('./src/meta');

var auth = require('./lib/auth');
var sockets = require('./lib/sockets');

var API = {};

API.init = function (data, callback) {
	// API Versions
	var routes = require('./routes')(data.middleware);
	data.router.use('/api/v1', routes.v1);
	data.router.use('/api/v2', routes.v2);

	// Set up HTTP bearer authentication via Passport
	passport.use(new BearerStrategy({}, function (token, done) {
		// Find the user by token.  If there is no user with the given token, set
		// the user to `false` to indicate failure.  Otherwise, return the
		// authenticated `user`.  Note that in a production-ready application, one
		// would want to validate the token for authenticity.
		auth.verifyToken(token, done);
	}));

	require('./routes/admin')(data.router, data.middleware);	// ACP
	sockets.init();	// WebSocket listeners

	API.reloadSettings();
	callback();
};

API.addMenuItem = function (custom_header, callback) {
	custom_header.plugins.push({
		route: '/plugins/write-api',
		icon: 'fa-cogs',
		name: 'Write API',
	});

	callback(null, custom_header);
};

API.authenticate = async (data) => {
	await require('./routes/v2/middleware').requireUser(data.req, data.res, data.next);
};

API.associateUser = require('./routes/v2/middleware').associateUser;

API.reloadSettings = function (hash) {
	if (!hash || hash === 'settings:writeapi') {
		meta.settings.get('writeapi', function (err, settings) {
			if (err) {
				winston.warn('[plugins/write-api] Unable to reload settings');
			}

			API.settings = settings;
		});
	}
};

module.exports = API;
