'use strict';
/* globals module, require */

var posts = require.main.require('./src/posts'),
	apiMiddleware = require('./middleware'),
	errorHandler = require('../../lib/errorHandler'),
	utils = require('./utils');


module.exports = function(middleware) {
	var app = require('express').Router();

	app.route('/:pid')
		.put(apiMiddleware.requireUser, function(req, res) {
			if (!utils.checkRequired(['content'], req, res)) {
				return false;
			}

			var payload = {
				uid: req.user.uid,
				pid: req.params.pid,
				content: req.body.content,
				options: {}
			};

			if (req.body.handle) { payload.handle = req.body.handle; }
			if (req.body.title) { payload.title = req.body.title; }
			if (req.body.topic_thumb) { payload.options.topic_thumb = req.body.topic_thumb; }
			if (req.body.tags) { payload.options.tags = req.body.tags; }

			posts.edit(payload, function(err) {
				errorHandler.handle(err, res);
			})
		})
		.delete(apiMiddleware.requireUser, function(req, res) {
			posts.delete(req.params.pid, req.user.uid, function(err) {
				errorHandler.handle(err, res);
			});
		});

		

	return app;
};
