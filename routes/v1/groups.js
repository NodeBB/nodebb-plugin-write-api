'use strict';
/* globals module, require */

var Groups = require.main.require('./src/groups'),
	Meta = require.main.require('./src/meta'),
	apiMiddleware = require('../../middleware'),
	errorHandler = require('../../lib/errorHandler'),
	utils = require('./utils');


module.exports = function(middleware) {
	var app = require('express').Router();

	app.post('/', apiMiddleware.requireUser, apiMiddleware.requireAdmin, function(req, res) {
		if (!utils.checkRequired(['name'], req, res)) {
			return false;
		}

		// Create a new group
	});

	app.post('/:group_name/membership', apiMiddleware.requireUser, function(req, res) {
		if (Meta.config.allowPrivateGroups !== '0') {
			Groups.isPrivate(req.params.group_name, function(err, isPrivate) {
				if (isPrivate) {
					Groups.requestMembership(req.params.group_name, req.user.uid, function(err) {
						return errorHandler.handle(err, res);
					});
				} else {
					Groups.join(req.params.group_name, req.user.uid, function(err) {
						return errorHandler.handle(err, res);
					});
				}
			});
		} else {
			Groups.join(req.params.group_name, req.user.uid, function(err) {
				return errorHandler.handle(err, res);
			});
		}
	});

	app.delete('/:group_name/membership', apiMiddleware.requireUser, function(req, res) {
		Groups.leave(req.params.group_name, req.user.uid, function(err) {
			return errorHandler.handle(err, res);
		});
	});

	return app;
};