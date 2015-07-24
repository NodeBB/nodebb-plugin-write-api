'use strict';
/* globals module, require */

var Users = require.main.require('./src/user'),
	Messaging = require.main.require('./src/messaging'),
	apiMiddleware = require('./middleware'),
	errorHandler = require('../../lib/errorHandler'),
	auth = require('../../lib/auth'),
	utils = require('./utils'),
	async = require.main.require('async');


module.exports = function(/*middleware*/) {
	var app = require('express').Router();

	app.post('/', apiMiddleware.requireUser, apiMiddleware.requireAdmin, function(req, res) {
		if (!utils.checkRequired(['username'], req, res)) {
			return false;
		}

		Users.create(req.body, function(err, uid) {
			return errorHandler.handle(err, res, {
				uid: uid
			});
		});
	});

	app.route('/:uid')
		.put(apiMiddleware.requireUser, apiMiddleware.exposeAdmin, function(req, res) {
			if (parseInt(req.params.uid, 10) !== parseInt(req.user.uid, 10) && !res.locals.isAdmin) {
				return errorHandler.respond(401, res);
			}

			Users.updateProfile(req.params.uid, req.body, function(err) {
				return errorHandler.handle(err, res);
			});
		})
		.delete(apiMiddleware.requireUser, apiMiddleware.exposeAdmin, function(req, res) {
			if (parseInt(req.params.uid, 10) !== parseInt(req.user.uid, 10) && !res.locals.isAdmin) {
				return errorHandler.respond(401, res);
			}

			// Clear out any user tokens belonging to the to-be-deleted user
			async.waterfall([
				async.apply(auth.getTokens, req.params.uid),
				function(tokens, next) {
					async.each(tokens, function(token, next) {
						auth.revokeToken(token, 'user', next);
					}, next);
				},
				async.apply(Users.delete, req.params.uid)
			], function(err) {
				return errorHandler.handle(err, res);
			});
		})

	app.post('/:uid/follow', apiMiddleware.requireUser, function(req, res) {
		Users.follow(req.user.uid, req.params.uid, function(err) {
			return errorHandler.handle(err, res);
		});
	});

	app.delete('/:uid/follow', apiMiddleware.requireUser, function(req, res) {
		Users.unfollow(req.user.uid, req.params.uid, function(err) {
			return errorHandler.handle(err, res);
		});
	});

	app.route('/:uid/chats')
		.post(apiMiddleware.requireUser, function(req, res) {
			if (!utils.checkRequired(['message'], req, res)) {
				return false;
			}

			var timestamp = parseInt(req.body.timestamp, 10) || undefined;

			Messaging.canMessage(req.user.uid, req.params.uid, function(err, allowed) {
				if (err) {
					return errorHandler.handle(err, res);
				} else if (!allowed) {
					return errorHandler.respond(403, res);
				}

				Messaging.addMessage(req.user.uid, req.params.uid, req.body.message, timestamp, function(err, message) {
					if (parseInt(req.body.quiet, 10) !== 1 && !timestamp) {
						Messaging.notifyUser(req.user.uid, req.params.uid, message);
					}

					return errorHandler.handle(err, res, message);
				});
			});
		});

	app.route('/:uid/tokens')
		.get(apiMiddleware.requireUser, function(req, res) {
			if (parseInt(req.params.uid, 10) !== parseInt(req.user.uid, 10)) {
				return errorHandler.respond(401, res);
			}

			auth.getTokens(req.params.uid, function(err, tokens) {
				return errorHandler.handle(err, res, {
					tokens: tokens
				});
			});
		})
		.post(apiMiddleware.requireUser, function(req, res) {
			if (parseInt(req.params.uid, 10) !== parseInt(req.user.uid)) {
				return errorHandler.respond(401, res);
			}

			auth.generateToken(req.params.uid, function(err, token) {
				return errorHandler.handle(err, res, {
					token: token
				});
			});
		});

	app.delete('/:uid/tokens/:token', apiMiddleware.requireUser, function(req, res) {
		if (parseInt(req.params.uid, 10) !== req.user.uid) {
			return errorHandler.respond(401, res);
		}

		auth.revokeToken(req.params.token, 'user', function(err) {
			errorHandler.handle(err, res);
		});
	});

	return app;
};
