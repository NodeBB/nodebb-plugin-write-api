'use strict';
/* globals module, require */

var Groups = require.main.require('./src/groups'),
	Meta = require.main.require('./src/meta'),
	apiMiddleware = require('./middleware'),
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

	app.post('/:slug/membership', apiMiddleware.requireUser, middleware.exposeGroupName, function(req, res) {
		if (Meta.config.allowPrivateGroups !== '0') {
			Groups.isPrivate(res.locals.groupName, function(err, isPrivate) {
				if (isPrivate) {
					Groups.requestMembership(res.locals.groupName, req.user.uid, function(err) {
						return errorHandler.handle(err, res);
					});
				} else {
					Groups.join(res.locals.groupName, req.user.uid, function(err) {
						return errorHandler.handle(err, res);
					});
				}
			});
		} else {
			Groups.join(res.locals.groupName, req.user.uid, function(err) {
				return errorHandler.handle(err, res);
			});
		}
	});

	app.delete('/:slug/membership', apiMiddleware.requireUser, middleware.exposeGroupName, function(req, res) {
		Groups.leave(res.locals.groupName, req.user.uid, function(err) {
			return errorHandler.handle(err, res);
		});
	});

	return app;
};