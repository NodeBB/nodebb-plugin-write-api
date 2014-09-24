var Topics = module.parent.parent.parent.parent.require('./topics'),	// omg would you like some parent with your parent?
	apiMiddleware = require('../../middleware'),
	utils = require('./utils');


module.exports = function(middleware) {
	var app = require('express').Router();

	app.post('/', apiMiddleware.requireUser, function(req, res) {
		Topics.post(req.body, function(err, data) {
			if (err) {
				return res.json(500, {
					status: 'error',
					message: err.message
				});
			}

			console.log(data);
			res.json(200, {
				status: 'ok',
				data: topicData
			});
		});
	});

	app.get('/derp', function(req, res) {
		res.json({
			status: 'okay! :D'
		});
	});

	return app;
};