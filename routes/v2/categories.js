'use strict';
/* globals module, require */

var async = require('async');

const winston = require.main.require('winston');

var Categories = require.main.require('./src/categories');
var Groups = require.main.require('./src/groups');
var apiMiddleware = require('./middleware');
var errorHandler = require('../../lib/errorHandler');
var utils = require('./utils');


module.exports = function(/*middleware*/) {
	var app = require('express').Router();

	app.post('/', apiMiddleware.requireUser, apiMiddleware.requireAdmin, function(req, res) {
		if (!utils.checkRequired(['name'], req, res)) {
			return false;
		}

		Categories.create(req.body, function(err, categoryObj) {
			return errorHandler.handle(err, res, categoryObj);
		});
	});

	app.route('/:cid')
		.put(apiMiddleware.requireUser, apiMiddleware.requireAdmin, apiMiddleware.validateCid, function(req, res) {
			var payload = {};
			payload[req.params.cid] = req.body;

			Categories.update(payload, function(err) {
				return errorHandler.handle(err, res);
			});
		})
		.delete(apiMiddleware.requireUser, apiMiddleware.requireAdmin, apiMiddleware.validateCid, function(req, res) {
			Categories.purge(req.params.cid, req.user.uid, function(err) {
				return errorHandler.handle(err, res);
			});
		});

	app.route('/:cid/state')
		.put(apiMiddleware.requireUser, apiMiddleware.requireAdmin, apiMiddleware.validateCid, function(req, res) {
			var payload = {};
			payload[req.params.cid] = {
				disabled: 0
			};

			Categories.update(payload, function(err) {
				return errorHandler.handle(err, res);
			});
		})
		.delete(apiMiddleware.requireUser, apiMiddleware.requireAdmin, apiMiddleware.validateCid, function(req, res) {
			var payload = {};
			payload[req.params.cid] = {
				disabled: 1
			};

			Categories.update(payload, function(err) {
				return errorHandler.handle(err, res);
			});
		});

	app.route('/:cid/privileges')
		.put(apiMiddleware.requireUser, apiMiddleware.requireAdmin, async (req, res) => {
			try {
				utils.required(['privileges'], req);

				const cidOk = await Categories.exists(req.params.cid);
				if (!cidOk && parseInt(req.params.cid, 10) !== 0) {
					return res.status(400).json(errorHandler.generate(
						400, 'invalid-data',
						'Invalid category ID received',
					));
				}

				// Deprecate in v3
				if (!req.body.ids && req.body.groups) {
					winston.warn('[plugins/write-api] `/:cid/privileges` endpoint uses `ids` now instead of `groups`, to be deprecated in v3');
					req.body.ids = req.body.groups;
					delete req.body.groups;
				}

				await changeGroupMembership(req.params.cid, req.body.privileges, req.body.ids, 'join');
				errorHandler.handle(null, res);
			} catch (err) {
				errorHandler.handle(err, res);
			}
		})
		.delete(apiMiddleware.requireUser, apiMiddleware.requireAdmin, async (req, res) => {
			try {
				utils.required(['privileges'], req);

				const cidOk = await Categories.exists(req.params.cid);
				if (!cidOk && parseInt(req.params.cid, 10) !== 0) {
					return res.status(400).json(errorHandler.generate(
						400, 'invalid-data',
						'Invalid category ID received',
					));
				}

				// Deprecate in v3
				if (!req.body.ids && req.body.groups) {
					winston.warn('[plugins/write-api] `/:cid/privileges` endpoint uses `ids` now instead of `groups`, to be deprecated in v3');
					req.body.ids = req.body.groups;
					delete req.body.groups;
				}

				await changeGroupMembership(req.params.cid, req.body.privileges, req.body.ids, 'leave');
				errorHandler.handle(null, res);
			} catch (err) {
				errorHandler.handle(err, res);
			}
		});

	async function changeGroupMembership(cid, privileges, ids, action) {
		privileges = Array.isArray(privileges) ? privileges : [privileges];
		ids = Array.isArray(ids) ? ids : [ids];
		const tasks = [];

		for(const x in ids) {
			for(const y in privileges) {
				const id = ids[x];
				const privilege = privileges[y];
				tasks.push(Groups[action]('cid:' + cid + ':privileges:' + privilege, id));
			}
		}

		await Promise.all(tasks);
	}

	return app;
};
