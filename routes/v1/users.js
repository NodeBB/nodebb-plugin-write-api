'use strict';
/* globals module, require */

var Users = require.main.require('./src/user'),
	// Meta = require.main.require('./src/meta'),
	apiMiddleware = require('../../middleware'),
	errorHandler = require('../../lib/errorHandler'),
	utils = require('./utils');


module.exports = function(middleware) {
	var app = require('express').Router();

	app.post('/', apiMiddleware.requireUser, apiMiddleware.requireAdmin, function(req, res) {
		if (!utils.checkRequired(['username', 'password'], req, res)) {
			return false;
		}

		// Create a new user
	});

	app.post('/:userslug/follow', apiMiddleware.requireUser, function(req, res) {
		Users.getUidByUserslug(req.params.userslug, function(err, targetUid) {
			console.log(targetUid);
			Users.follow(req.user.uid, targetUid, function(err) {
				return errorHandler.handle(err, res);
			});
		});
	});

	app.put('/', apiMiddleware.requireUser, function(req, res) {
		var uid = req.user ? req.user.uid : 0;

		Users.updateProfile(uid, req.body, function(err) {
			return errorHandler.handle(err, res);
		});
	});

	app.delete('/:userslug/follow', apiMiddleware.requireUser, function(req, res) {
		Users.getUidByUserslug(req.params.userslug, function(err, targetUid) {
			Users.unfollow(req.user.uid, targetUid, function(err) {
				return errorHandler.handle(err, res);
			});
		});
	});

	return app;
};