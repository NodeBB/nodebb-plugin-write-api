var passport = module.parent.parent.require('passport'),

	Middleware = {};

Middleware.requireUser = passport.authenticate('bearer', { session: false });

module.exports = Middleware;