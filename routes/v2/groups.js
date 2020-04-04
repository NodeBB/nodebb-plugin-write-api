'use strict';
/* globals module, require */

var Groups = require.main.require('./src/groups'),
	Users = require.main.require('./src/user'),
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

		Groups.create(req.body, function(err, groupObj) {
			errorHandler.handle(err, res, groupObj);
		});
	});

	app.delete('/:slug', apiMiddleware.requireUser, middleware.exposeGroupName, apiMiddleware.validateGroup, apiMiddleware.requireGroupOwner, function(req, res) {
		Groups.destroy(res.locals.groupName, function(err) {
			errorHandler.handle(err, res);
		});
	});

	app.put('/:slug/membership', apiMiddleware.requireUser, middleware.exposeGroupName, apiMiddleware.validateGroup, function(req, res) {
		if (Meta.config.allowPrivateGroups !== '0') {
			Groups.isPrivate(res.locals.groupName, function(err, isPrivate) {
				if (isPrivate) {
					Groups.requestMembership(res.locals.groupName, req.user.uid, function(err) {
						errorHandler.handle(err, res);
					});
				} else {
					Groups.join(res.locals.groupName, req.user.uid, function(err) {
						errorHandler.handle(err, res);
					});
				}
			});
		} else {
			Groups.join(res.locals.groupName, req.user.uid, function(err) {
				errorHandler.handle(err, res);
			});
		}
	});

	app.put('/:slug/membership/:uid', middleware.exposeGroupName, apiMiddleware.validateGroup, apiMiddleware.requireUser, apiMiddleware.requireAdmin, function(req, res) {
		Groups.join(res.locals.groupName, req.params.uid, function(err) {
			errorHandler.handle(err, res);
		});
	});

	app.delete('/:slug/membership', apiMiddleware.requireUser, middleware.exposeGroupName, apiMiddleware.validateGroup, function(req, res) {
		Groups.isMember(req.user.uid, res.locals.groupName, function(err, isMember) {
			if (isMember) {
				Groups.leave(res.locals.groupName, req.user.uid, function(err) {
					errorHandler.handle(err, res);
				});
			} else {
				errorHandler.respond(400, res);
			}
		});
	});

	app.delete('/:slug/membership/:uid', middleware.exposeGroupName, apiMiddleware.validateGroup, apiMiddleware.requireUser, apiMiddleware.requireAdmin, function(req, res) {
			Groups.isMember(req.params.uid, res.locals.groupName, function(err, isMember) {
					if (isMember) {
							Groups.leave(res.locals.groupName, req.params.uid, function(err) {
									errorHandler.handle(err, res);
							});
					} else {
							errorHandler.respond(400, res);
					}
			});
	});

	app.post('/:slug/invite/:uid', apiMiddleware.requireUser, middleware.exposeGroupName, apiMiddleware.validateGroup, apiMiddleware.requireGroupOwner, function(req, res) {
		Users.exists(req.params.uid, function(err, exists) {
			if (exists) {
				Groups.invite(res.locals.groupName, req.params.uid, function(err) {
					errorHandler.handle(err, res);
				});
			} else {
				errorHandler.respond(400, res);
			}
		});
	});

	app.put('/:slug/invite', apiMiddleware.requireUser, middleware.exposeGroupName, apiMiddleware.validateGroup, function(req, res) {
		Groups.isInvited(req.user.uid, res.locals.groupName, function(err, isInvited) {
			if (isInvited) {
				Groups.acceptMembership(res.locals.groupName, req.user.uid, function(err) {
					errorHandler.handle(err, res);
				});
			} else {
				errorHandler.respond(400, res);
			}
		});
	});

	app.delete('/:slug/invite', apiMiddleware.requireUser, middleware.exposeGroupName, apiMiddleware.validateGroup, function(req, res) {
		Groups.isInvited(req.user.uid, res.locals.groupName, function(err, isInvited) {
			if (isInvited) {
				Groups.rejectMembership(res.locals.groupName, req.user.uid, function(err) {
					errorHandler.handle(err, res);
				});
			} else {
				errorHandler.respond(400, res);
			}
		});
	});

	return app;
};