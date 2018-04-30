'use strict';
/* global module, require */

var apiMiddleware = require('./middleware');
var errorHandler = require('../../lib/errorHandler');

var multipart = require.main.require('connect-multiparty');
var uploadController = require.main.require('./src/controllers/uploads');
var meta = require.main.require('./src/meta');

module.exports = function(/*middleware*/) {
	var app = require('express').Router();

	app.route('/upload').post(apiMiddleware.requireUser, multipart(), function(req, res, next) {
		uploadController.upload(req, res, function(uploadedFile, callback) {
			if (parseInt(meta.config.allowFileUploads) !== 1) {
				return callback(new Error('[[error:uploads-are-disabled]]'));
			}

			uploadController.uploadFile(req.user.uid, uploadedFile, callback);
		}, next);
	});

	app.route('/maintenance')
		.post(apiMiddleware.requireUser, apiMiddleware.requireAdmin, function (req, res, next) {
			meta.configs.set('maintenanceMode', 1, function (err) {
				return errorHandler.handle(err, res);
			})
		})
		.delete(apiMiddleware.requireUser, apiMiddleware.requireAdmin, function (req, res, next) {
			meta.configs.set('maintenanceMode', 0, function (err) {
				return errorHandler.handle(err, res);
			})
		});

	return app;
};
