'use strict';
/* globals module, require */

var passport = require.main.require('passport'),

	Middleware = {};

Middleware.requireUser = passport.authenticate('bearer', { session: false });

module.exports = Middleware;