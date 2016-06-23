'use strict';
/* globals module, require */

var Categories = require.main.require('./src/categories'),
	apiMiddleware = require('./middleware'),
	errorHandler = require('../../lib/errorHandler'),
	utils = require('./utils');


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

	return app;
};