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
		.put(apiMiddleware.requireUser, apiMiddleware.requireAdmin, apiMiddleware.validateCidIncludingGlobal, function(req, res) {
			changeGroupMembership(req.params.cid, req.body.privileges, req.body.groups, 'join', function(err) {
				return errorHandler.handle(err, res);
			});
		})
		.delete(apiMiddleware.requireUser, apiMiddleware.requireAdmin, apiMiddleware.validateCidIncludingGlobal, function(req, res) {
			changeGroupMembership(req.params.cid, req.body.privileges, req.body.groups, 'leave', function(err) {
				return errorHandler.handle(err, res);
			});
		});

	function changeGroupMembership(cid, privileges, groups, action, callback) {
		privileges = Array.isArray(privileges) ? privileges : [privileges];
		groups = Array.isArray(groups) ? groups : [groups];

		async.each(groups, function(group, groupCb) {
			async.each(privileges, function(privilege, privilegeCb) {
				Groups[action]('cid:' + cid + ':privileges:' + privilege, group, privilegeCb);
			}, groupCb);
		}, callback);
	}

	return app;
};
