'use strict';
/* globals module, require */

var Users = require.main.require('./src/user'),
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

		Users.create(req.body, function(err) {
			return errorHandler.handle(err, res);
		});
	});

	app.put('/:uid?', apiMiddleware.requireUser, function(req, res) {
		if (parseInt(req.params.uid, 10) !== req.user.uid) {
			return errorHandler.respond(401, res);
		}

		Users.updateProfile(res.locals.uid || req.user.uid, req.body, function(err) {
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