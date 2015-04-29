'use strict';
/* globals module, require */

var Users = require.main.require('./src/user'),
	Messaging = require.main.require('./src/messaging'),
	apiMiddleware = require('./middleware'),
	errorHandler = require('../../lib/errorHandler'),
	auth = require('../../lib/auth'),
	utils = require('./utils');


module.exports = function(/*middleware*/) {
	var app = require('express').Router();

	app.post('/', apiMiddleware.requireUser, apiMiddleware.requireAdmin, function(req, res) {
		if (!utils.checkRequired(['username', 'password'], req, res)) {
			return false;
		}

		Users.create(req.body, function(err, uid) {
			return errorHandler.handle(err, res, {
				uid: uid
			});
		});
	});

	app.put('/:uid?', apiMiddleware.requireUser, apiMiddleware.exposeAdmin, function(req, res) {
		if (parseInt(req.params.uid, 10) !== parseInt(req.user.uid, 10) && !res.locals.isAdmin) {
			return errorHandler.respond(401, res);
		}

		Users.updateProfile(res.locals.uid || req.user.uid, req.body, function(err) {
			return errorHandler.handle(err, res);
		});
	});

    app.put('/:uid/password', apiMiddleware.requireUser, apiMiddleware.exposeAdmin, function(req, res) {
        if (!utils.checkRequired(['currentPassword', 'newPassword'], req, res)) {
            return false;
        }

        var uid = parseInt(req.params.uid, 10);
        if (uid !== parseInt(req.user.uid, 10) && !res.locals.isAdmin) {
            return errorHandler.respond(401, res);
        }
        var data = {
            uid: uid,
            currentPassword: req.body.currentPassword,
            newPassword: req.body.newPassword
        };
        Users.changePassword(uid, data, function(err) {
            return errorHandler.handle(err, res);
        });
    });

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
			if (parseInt(req.params.uid, 10) !== req.user.uid) {
				return errorHandler.respond(401, res);
			}

			auth.getTokens(req.params.uid, function(err, tokens) {
				return errorHandler.handle(err, res, {
					tokens: tokens
				});
			});
		})
		.post(apiMiddleware.requireUser, function(req, res) {
			if (parseInt(req.params.uid, 10) !== req.user.uid) {
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
