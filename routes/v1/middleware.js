'use strict';
/* globals module, require */

var passport = require.main.require('passport'),
	async = require.main.require('async'),
	jwt = require('jsonwebtoken'),
	user = require.main.require('./src/user'),
	groups = require.main.require('./src/groups'),
	topics = require.main.require('./src/topics'),
	categories = require.main.require('./src/categories'),
	errorHandler = require('../../lib/errorHandler'),

	writeApi = module.parent.parent.parent.exports,
	Middleware = {};

Middleware.requireUser = function(req, res, next) {
	if (req.headers.hasOwnProperty('authorization')) {
		passport.authenticate('bearer', { session: false }, function(err, user) {
			if (err) { return next(err); }
			if (!user) { return errorHandler.respond(401, res); }

			// If the token received was a master token, a _uid must also be present for all calls
			if (user.hasOwnProperty('uid')) {
				req.login(user, function(err) {
					if (err) { return errorHandler.respond(500, res); }

					req.uid = user.uid;
					next();
				});
			} else if (user.hasOwnProperty('master') && user.master === true) {
				if (req.body.hasOwnProperty('_uid') || req.query.hasOwnProperty('_uid')) {
					user.uid = req.body._uid || req.query._uid;
					delete user.master;

					req.login(user, function(err) {
						if (err) { return errorHandler.respond(500, res); }

						req.uid = user.uid;
						next();
					});
				} else {
					res.status(400).json(errorHandler.generate(
						400, 'params-missing',
						'Required parameters were missing from this API call, please see the "params" property',
						['_uid']
					));
				}
			} else {
				return errorHandler.respond(500, res);
			}
		})(req, res, next);
	} else if (writeApi.settings['jwt:enabled'] === 'on' && writeApi.settings.hasOwnProperty('jwt:secret')) {
		var token = (writeApi.settings['jwt:payloadKey'] ? (req.query[writeApi.settings['jwt:payloadKey']] || req.body[writeApi.settings['jwt:payloadKey']]) : null) || req.query.token || req.body.token;
		jwt.verify(token, writeApi.settings['jwt:secret'], {
			ignoreExpiration: true,
		}, function(err, decoded) {
			if (!err && decoded) {
				if (!decoded.hasOwnProperty('_uid')) {
					return res.status(400).json(errorHandler.generate(
						400, 'params-missing',
						'Required parameters were missing from this API call, please see the "params" property',
						['_uid']
					));
				}

				req.login({
					uid: decoded._uid
				}, function(err) {
					if (err) { return errorHandler.respond(500, res); }

					req.uid = decoded._uid
					req.body = decoded;
					next();
				});
			} else {
				errorHandler.respond(401, res);
			}
		});
	} else {
		errorHandler.respond(401, res);
	}
};

Middleware.requireAdmin = function(req, res, next) {
	if (!req.user) {
		return errorHandler.respond(401, res);
	}

	user.isAdministrator(req.user.uid, function(err, isAdmin) {
		if (err || !isAdmin) {
			return errorHandler.respond(403, res);
		}

		next();
	});
};

Middleware.exposeAdmin = function(req, res, next) {
	// Unlike `requireAdmin`, this middleware just checks the uid, and sets `isAdmin` in `res.locals`
	res.locals.isAdmin = false;

	if (!req.user) {
		return next();
	}

	user.isAdministrator(req.user.uid, function(err, isAdmin) {
		if (err) {
			return errorHandler.handle(err, res);
		} else {
			res.locals.isAdmin = isAdmin;
			return next();
		}
	});
}

Middleware.validateTid = function(req, res, next) {
	if (req.params.hasOwnProperty('tid')) {
		topics.exists(req.params.tid, function(err, exists) {
			if (err) {
				errorHandler.respond(500, res);
			} else if (!exists) {
				errorHandler.respond(404, res);
			} else {
				next();
			}
		});
	} else {
		errorHandler.respond(404, res);
	}
};

Middleware.validateCid = function(req, res, next) {
	if (req.params.hasOwnProperty('cid')) {
		categories.exists(req.params.cid, function(err, exists) {
			if (err) {
				errorHandler.respond(500, res);
			} else if (!exists) {
				errorHandler.respond(404, res);
			} else {
				next();
			}
		});
	} else {
		errorHandler.respond(404, res);
	}
};

Middleware.validateGroup = function(req, res, next) {
	if (res.locals.groupName) {
		next();
	} else {
		errorHandler.respond(404, res);
	}
};

Middleware.requireGroupOwner = function(req, res, next) {
	if (!req.user || !req.user.uid) {
		errorHandler.respond(401, res);
	}

	async.parallel({
		isAdmin: async.apply(user.isAdministrator, req.user.uid),
		isOwner: async.apply(groups.ownership.isOwner, req.user.uid, res.locals.groupName)
	}, function(err, checks) {
		if (checks.isOwner || checks.isAdmin) {
			next();
		} else {
			errorHandler.respond(403, res);
		}
	});
};

module.exports = Middleware;