'use strict';
/* globals module, require */

var Topics = require.main.require('./src/topics'),
	apiMiddleware = require('../../middleware'),
	utils = require('./utils');


module.exports = function(middleware) {
	var app = require('express').Router();

	app.post('/:cid?', apiMiddleware.requireUser, function(req, res) {
		if (!req.params.cid || isNaN(parseInt(req.params.cid))) {
			return res.json(400, {
				status: 'error',
				message: 'Category ID must be specified'
			});
		}

		var payload = {
				cid: req.params.cid,
				title: req.body.title,
				content:req.body.content,
				uid: req.user.uid
			};

		Topics.post(payload, function(err, data) {
			if (err) {
				return res.json(500, {
					status: 'error',
					message: err.message
				});
			}

			res.status(200).json({
				status: 'ok',
				data: {
					topic: data.topicData,
					post: data.postData
				}
			});
		});
	});

	return app;
};