'use strict';

const jwt = require('jsonwebtoken');
const async = require('async');
const util = require('util');

const passport = require.main.require('passport');
const nconf = require.main.require('nconf');

const user = require.main.require('./src/user');
const groups = require.main.require('./src/groups');
const posts = require.main.require('./src/posts');
const topics = require.main.require('./src/topics');
const categories = require.main.require('./src/categories');
const plugins = require.main.require('./src/plugins');

const errorHandler = require('../../lib/errorHandler');
const utils = require('./utils');

const Middleware = {
	regexes: {
		tokenRoute: new RegExp('^' + nconf.get('relative_path') + '\\/api\\/v\\d+\\/users\\/(\\d+)\\/tokens$'),
	},
};

const passportAuthenticateAsync = function (req, res) {
	return new Promise((resolve, reject) => {
		passport.authenticate('bearer', { session: false }, (err, user) => {
			if (err) {
				reject(err);
			} else {
				resolve(user);
			}
		})(req, res);
	});
};

Middleware.requireUser = async function (req, res, next) {
	var writeApi = require.main.require('nodebb-plugin-write-api');
	const query = req.query || {};
	const body = req.body || {};
	var token = (writeApi.settings['jwt:payloadKey'] ? (query[writeApi.settings['jwt:payloadKey']] || body[writeApi.settings['jwt:payloadKey']]) : null) || query.token || body.token;
	const loginAsync = util.promisify(req.login).bind(req);
	var routeMatch;

	await plugins.hooks.fire('response:plugin.write-api.authenticate', {
		req: req,
		res: res,
		next: function () {},	// noop for backwards compatibility purposes
		utils: utils,
		errorHandler: errorHandler,
	});

	// If plugins handle the response, stop default actions
	if (res.headersSent) {
		return;
	}

	if (req.headers.hasOwnProperty('authorization')) {
		const user = await passportAuthenticateAsync(req, res);
		if (!user) { return errorHandler.respond(401, res); }

		// If the token received was a master token, a _uid must also be present for all calls
		if (user.hasOwnProperty('uid')) {
			try {
				await loginAsync(user);
			} catch (e) {
				return errorHandler.respond(500, res);
			}

			req.uid = user.uid;
			req.loggedIn = req.uid > 0;
			next();
		} else if (user.hasOwnProperty('master') && user.master === true) {
			if (req.body.hasOwnProperty('_uid') || req.query.hasOwnProperty('_uid')) {
				user.uid = req.body._uid || req.query._uid;
				delete user.master;

				try {
					await loginAsync(user);
				} catch (e) {
					return errorHandler.respond(500, res);
				}

				req.uid = user.uid;
				req.loggedIn = req.uid > 0;
				next();
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
	} else if (token && writeApi.settings['jwt:enabled'] === 'on' && writeApi.settings.hasOwnProperty('jwt:secret')) {
		jwt.verify(token, writeApi.settings['jwt:secret'], {
			ignoreExpiration: true,
		}, function (err, decoded) {
			if (!err && decoded) {
				if (!decoded.hasOwnProperty('_uid')) {
					return res.status(400).json(errorHandler.generate(
						400, 'params-missing',
						'Required parameters were missing from this API call, please see the "params" property',
						['_uid']
					));
				}

				req.login({
					uid: decoded._uid,
				}, function (err) {
					if (err) { return errorHandler.respond(500, res); }

					req.uid = decoded._uid;
					req.loggedIn = req.uid > 0;

					// Use decoded token as payload if no request body passed in
					if (Object.keys(decoded).length > 1 && (!req.body || !Object.keys(req.body).length)) {
						req.body = decoded;
					}
					next();
				});
			} else {
				errorHandler.respond(401, res);
			}
		});
	// eslint-disable-next-line no-cond-assign
	} else if ((routeMatch = req.originalUrl.match(Middleware.regexes.tokenRoute))) {
		// If token generation route is hit, check password instead
		if (!utils.checkRequired(['password'], req, res)) {
			return false;
		}

		var uid = routeMatch[1];

		user.isPasswordCorrect(uid, req.body.password, req.ip, function (err, ok) {
			if (!err && ok) {
				req.login({ uid: parseInt(uid, 10) }, function (err) {
					if (err) { return errorHandler.respond(500, res); }

					req.uid = user.uid;
					req.loggedIn = req.uid > 0;
					next();
				});
			} else {
				errorHandler.respond(401, res);
			}
		});
	} else {
		// No bearer token, jwt, or special handling instructions, transparently pass-through
		next();
	}
};

Middleware.associateUser = async function (req, res, next) {
	if (req.headers.hasOwnProperty('authorization')) {
		await plugins.hooks.fire('response:plugin.write-api.authenticate', {
			req: req,
			res: res,
			next: function () {},	// noop for backwards compatibility purposes
			utils: utils,
			errorHandler: errorHandler,
		});

		// If plugins handle the response, stop default actions
		if (res.headersSent) {
			return next();
		}

		passport.authenticate('bearer', { session: false }, function (err, user) {
			if (err || !user) { return next(err); }

			// If the token received was a master token, a _uid must also be present for all calls
			if (user.hasOwnProperty('uid')) {
				req.login(user, function (err) {
					if (err) { return errorHandler.respond(500, res); }

					req.uid = user.uid;
					req.loggedIn = req.uid > 0;
					next();
				});
			} else if (user.hasOwnProperty('master') && user.master === true) {
				if (req.body.hasOwnProperty('_uid') || req.query.hasOwnProperty('_uid')) {
					user.uid = req.body._uid || req.query._uid;
					delete user.master;

					req.login(user, function (err) {
						if (err) { return errorHandler.respond(500, res); }

						req.uid = user.uid;
						req.loggedIn = req.uid > 0;
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
	} else {
		return next();
	}
};

Middleware.requireAdmin = function (req, res, next) {
	if (!req.user) {
		return errorHandler.respond(401, res);
	}

	user.isAdministrator(req.user.uid, function (err, isAdmin) {
		if (err || !isAdmin) {
			return errorHandler.respond(403, res);
		}

		next();
	});
};

Middleware.exposeAdmin = function (req, res, next) {
	// Unlike `requireAdmin`, this middleware just checks the uid, and sets `isAdmin` in `res.locals`
	res.locals.isAdmin = false;

	if (!req.user) {
		return next();
	}

	user.isAdministrator(req.user.uid, function (err, isAdmin) {
		if (err) {
			return errorHandler.handle(err, res);
		}
		res.locals.isAdmin = isAdmin;
		return next();
	});
};

Middleware.validatePid = function (req, res, next) {
	if (req.params.hasOwnProperty('pid')) {
		posts.exists(req.params.pid, function (err, exists) {
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

Middleware.validateTid = function (req, res, next) {
	if (req.params.hasOwnProperty('tid')) {
		topics.exists(req.params.tid, function (err, exists) {
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

Middleware.validateCid = function (req, res, next) {
	if (req.params.hasOwnProperty('cid')) {
		categories.exists(req.params.cid, function (err, exists) {
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

Middleware.validateCidIncludingGlobal = function (req, res, next) {
	if (req.params.cid && parseInt(req.params.cid, 10) === 0) {
		return next();
	}

	Middleware.validateCid(req, res, next);
};

Middleware.validateGroup = function (req, res, next) {
	if (res.locals.groupName) {
		next();
	} else {
		errorHandler.respond(404, res);
	}
};

Middleware.requireGroupOwner = function (req, res, next) {
	if (!req.user || !req.user.uid) {
		errorHandler.respond(401, res);
	}

	async.parallel({
		isAdmin: async.apply(user.isAdministrator, req.user.uid),
		isOwner: async.apply(groups.ownership.isOwner, req.user.uid, res.locals.groupName),
	}, function (err, checks) {
		if (!err && (checks.isOwner || checks.isAdmin)) {
			next();
		} else {
			errorHandler.respond(403, res);
		}
	});
};

module.exports = Middleware;
