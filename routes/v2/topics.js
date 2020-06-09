'use strict';
/* globals module, require */

var Topics = require.main.require('./src/topics'),
	Posts = require.main.require('./src/posts'),
	apiMiddleware = require('./middleware'),
	errorHandler = require('../../lib/errorHandler'),
	utils = require('./utils'),
	winston = require.main.require('winston');

const { wrapPromise } = utils;

module.exports = function(middleware) {
	var app = require('express').Router();

	app.route('/')
		.post(apiMiddleware.requireUser, function(req, res) {
			if (!utils.checkRequired(['cid', 'title', 'content'], req, res)) {
				return false;
			}

			var payload = Object.assign({}, req.body);
			payload.tags = payload.tags || []
			payload.uid = req.user.uid

			Topics.post(payload, function(err, data) {
				return errorHandler.handle(err, res, data);
			});
		});

	app.route('/:tid')
		.post(apiMiddleware.requireUser, apiMiddleware.validateTid, function(req, res) {
			if (!utils.checkRequired(['content'], req, res)) {
				return false;
			}

			var payload = {
					tid: req.params.tid,
					uid: req.user.uid,
					req: utils.buildReqObject(req),	// For IP recording
					content: req.body.content,
					timestamp: req.body.timestamp
				};

			if (req.body.toPid) { payload.toPid = req.body.toPid; }

			Topics.reply(payload, function(err, returnData) {
				errorHandler.handle(err, res, returnData);
			});
		})
		.delete(apiMiddleware.requireUser, apiMiddleware.validateTid, function(req, res) {
			Topics.purgePostsAndTopic(req.params.tid, req.params._uid, function(err) {
				errorHandler.handle(err, res);
			});
		})
		.put(apiMiddleware.requireUser, function(req, res) {
			if (!utils.checkRequired(['pid', 'content'], req, res)) {
				return false;
			}

			var payload = {
				uid: req.user.uid,
				pid: req.body.pid,
				content: req.body.content,
				options: {}
			};
			console.log(payload);

			// Maybe a "set if available" utils method may come in handy
			if (req.body.handle) { payload.handle = req.body.handle; }
			if (req.body.title) { payload.title = req.body.title; }
			if (req.body.topic_thumb) { payload.options.topic_thumb = req.body.topic_thumb; }
			if (req.body.tags) { payload.options.tags = req.body.tags; }

			Posts.edit(payload, function(err, returnData) {
				errorHandler.handle(err, res, returnData);
			});
		});

	app.route('/:tid/state')
		.put(apiMiddleware.requireUser, apiMiddleware.validateTid, function (req, res) {
			Topics.restore(req.params.tid, req.params._uid, function (err) {
				errorHandler.handle(err, res);
			});
		})
		.delete(apiMiddleware.requireUser, apiMiddleware.validateTid, function (req, res) {
			Topics.delete(req.params.tid, req.params._uid, function (err) {
				errorHandler.handle(err, res);
			});
		});

	app.route('/:tid/follow')
		.put(apiMiddleware.requireUser, apiMiddleware.validateTid, function(req, res) {
			Topics.follow(req.params.tid, req.user.uid, function(err) {
				errorHandler.handle(err, res);
			});
		})
		.delete(apiMiddleware.requireUser, apiMiddleware.validateTid, function(req, res) {
			Topics.unfollow(req.params.tid, req.user.uid, function(err) {
				errorHandler.handle(err, res);
			});
		});

	app.route('/:tid/tags')
		.put(apiMiddleware.requireUser, apiMiddleware.validateTid, function(req, res) {
			if (!utils.checkRequired(['tags'], req, res)) {
				return false;
			}

			Topics.createTags(req.body.tags, req.params.tid, Date.now(), function(err) {
				errorHandler.handle(err, res);
			});
		})
		.delete(apiMiddleware.requireUser, apiMiddleware.validateTid, function(req, res) {
			Topics.deleteTopicTags(req.params.tid, function(err) {
				errorHandler.handle(err, res);
			});
		});

	app.route('/:tid/pin')
		.put(apiMiddleware.requireUser, apiMiddleware.validateTid, function(req, res) {
			Topics.tools.pin(req.params.tid, req.user.uid, function(err) {
				errorHandler.handle(err, res);
			});
		})
		.delete(apiMiddleware.requireUser, apiMiddleware.validateTid, function(req, res) {
			Topics.tools.unpin(req.params.tid, req.user.uid, function(err) {
				errorHandler.handle(err, res);
			});
		});

	// **DEPRECATED** Do not use.
	app.route('/follow')
		.post(apiMiddleware.requireUser, function(req, res) {
			winston.warn('[write-api] /api/v1/topics/follow route has been deprecated, please use /api/v1/topics/:tid/follow instead.');
			if (!utils.checkRequired(['tid'], req, res)) {
				return false;
			}

			Topics.follow(req.body.tid, req.user.uid, function(err) {
				errorHandler.handle(err, res);
			});
		})
		.delete(apiMiddleware.requireUser, function(req, res) {
			winston.warn('[write-api] /api/v1/topics/follow route has been deprecated, please use /api/v1/topics/:tid/follow instead.');
			if (!utils.checkRequired(['tid'], req, res)) {
				return false;
			}

			Topics.unfollow(req.body.tid, req.user.uid, function(err) {
				errorHandler.handle(err, res);
			});
		});

	app.route('/sugessted')
		.get(apiMiddleware.requireUser, wrapPromise(async (req) => {
			const numTopics = 10;
			const { topicId = null, categoryId = null } = req.query;

			let topicData;
			if (topicId) {
				topicData = await Topics.getSuggestedTopics(topicId, req.user.uid, 0, numTopics);
			} else if (categoryId) {
				const data = await Topics.getSortedTopics({
					cid: categoryId,
					uid: req.user.uid,
					start: 0,
					stop: 2 * numTopics,
					term: 'alltime',
					sort: 'votes',
				});
				topicData = data ? _.shuffle(data.topics).slice(0, numTopics + 1) : [];
			} else {
				const data = await Topics.getTopicsFromSet('topics:recent', req.user.uid, 0, numTopics);
				topicData = data ? data.topics : [];
			}

			return topicData;
	}));

	app.route('/popular')
		.get(apiMiddleware.requireUser, wrapPromise(async (req) => {
				const numTopics = 10;
				const data = await Topics.getSortedTopics({
					uid: req.user.uid,
					start: 0,
					stop: numTopics - 1,
					term: 'alltime',
					sort: 'posts',
				});

			return data.topics;
		}));

	app.route('/top')
		.get(apiMiddleware.requireUser, wrapPromise(async (req) => {
				const numTopics = 10;
				const data = await Topics.getSortedTopics({
					uid: req.user.uid,
					start: 0,
					stop: numTopics - 1,
					term: 'alltime',
					sort: 'votes',
				});

			return data.topics;
		}));

	app.route('/recent')
		.get(apiMiddleware.requireUser, wrapPromise(async (req) => {
			const numTopics = 10;
			const { categoryIds = []} = req.query;

			let key;
			if (categoryIds.length) {
				if (categoryIds.length === 1) {
					key = 'cid:' + categoryIds[0] + ':tids';
				} else {
					key = categoryIds.map(cid => 'cid:' + cid + ':tids');
				}
			} else {
				key = 'topics:recent';
			}
			const data = await Topics.getTopicsFromSet(key, req.user.uid, 0, Math.max(0, numTopics));
			data.topics.forEach(function (topicData) {
				if (topicData && !topicData.teaser) {
					topicData.teaser = {
						user: topicData.user,
					};
				}
			});

			return data.topics;
		}));

	return app;
};
