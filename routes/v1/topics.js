module.exports = function(middleware) {
	var app = require('express').Router();

	app.get('/derp', function(req, res) {
		res.json({
			status: 'okay! :D'
		});
	});

	return app;
};