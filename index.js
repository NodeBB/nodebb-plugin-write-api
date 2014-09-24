var	passport = module.parent.require('passport'),
	BearerStrategy = require('passport-http-bearer').Strategy,
	db = module.parent.require('./database'),
	apiMiddleware = require('./middleware'),	// Required here so all routes can use it
	API = {};

API.init = function(app, middleware, controllers, callback) {
	var routes = require('./routes')(middleware),
		render = function(req, res, next) {
			res.render('admin/plugins/write-api', {});
		};

	// Set up HTTP bearer authentication via Passport
	passport.use(new BearerStrategy({}, function(token, done) {
		// Find the user by token.  If there is no user with the given token, set
		// the user to `false` to indicate failure.  Otherwise, return the
		// authenticated `user`.  Note that in a production-ready application, one
		// would want to validate the token for authenticity.
		API.verifyToken(token, done);
	}));

	// API Versions
	app.use('/api/v1', routes.v1);

	// ACP
	require('./routes/admin')(app, middleware);

	callback();
};

API.addMenuItem = function(custom_header, callback) {
	custom_header.plugins.push({
		"route": '/plugins/write-api',
		"icon": 'fa-cogs',
		"name": 'Write API'
	});

	callback(null, custom_header);
};

API.verifyToken = function(token, callback) {
	db.getObjectField('writeToken:uid', token, function(err, uid) {
		if (err) {
			return callback(err);
		} else {
			return callback(null, uid ? {
				uid: parseInt(uid, 10)
			} : false);
		}
	});
};

module.exports = API;