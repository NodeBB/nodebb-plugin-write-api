'use strict';

var apiMiddleware = require('./middleware');
var errorHandler = require('../../lib/errorHandler');

var multipart = require.main.require('connect-multiparty');
var uploadController = require.main.require('./src/controllers/uploads');
var meta = require.main.require('./src/meta');
var privileges = require.main.require('./src/privileges');

module.exports = function (/* middleware */) {
	var app = require('express').Router();

	app.route('/upload').post(apiMiddleware.requireUser, multipart(), async function (req, res, next) {
		const ok = await privileges.global.can('upload:post:file', req.user.uid) || parseInt(meta.config.allowFileUploads, 10) === 1;
		if (!ok) {
			return next(new Error('[[error:uploads-are-disabled]]'));
		}

		await uploadController.upload(req, res, async function (uploadedFile) {
			return await uploadController.uploadFile(req.user.uid, uploadedFile);
        	});
	});

	app.route('/maintenance')
		.post(apiMiddleware.requireUser, apiMiddleware.requireAdmin, function (req, res) {
			meta.configs.set('maintenanceMode', 1, function (err) {
				return errorHandler.handle(err, res);
			});
		})
		.delete(apiMiddleware.requireUser, apiMiddleware.requireAdmin, function (req, res) {
			meta.configs.set('maintenanceMode', 0, function (err) {
				return errorHandler.handle(err, res);
			});
		});

	return app;
};
