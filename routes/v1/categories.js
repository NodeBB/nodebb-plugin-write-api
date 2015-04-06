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

	app.put('/:cid', apiMiddleware.requireUser, apiMiddleware.requireAdmin, function(req, res) {
		var payload = {};
		payload[req.params.cid] = req.body;

		Categories.update(payload, function(err) {
			return errorHandler.handle(err, res);
		});
	});

	return app;
};