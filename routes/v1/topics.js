'use strict';
/* globals module, require */

var Topics = require.main.require('./src/topics'),
	apiMiddleware = require('../../middleware'),
	utils = require('./utils');


module.exports = function(middleware) {
	var app = require('express').Router();

	app.post('/', apiMiddleware.requireUser, function(req, res) {
		if (!utils.checkRequired(['cid', 'title', 'content'], req, res)) {
			return false;
		}

		var payload = {
				cid: req.body.cid,
				title: req.body.title,
				content:req.body.content,
				uid: req.user.uid
			};

		Topics.post(payload, function(err, data) {
			if (err) {
				return res.json(500, {
					code: 'server-error',
					error: 'NodeBB rejected this request with the error specified in the "values" property',
					values: err.message
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