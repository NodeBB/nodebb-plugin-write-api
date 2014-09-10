var	API = {};

API.init = function(app, middleware, controllers, callback) {
	var routes = require('./routes')(middleware);

	console.log('adding route!!!!');
	app.use('/api/v1', routes.v1);
	callback();
};

module.exports = API;