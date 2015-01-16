'use strict';
/* globals module */

var auth = require('./auth'),

	Sockets = {};

Sockets.init = function() {
	var Plugins = module.parent.parent.require('./socket.io/plugins').writeApi = {};

	Plugins.createToken = function(socket, uid, callback) {
		auth.generateToken(uid, callback);
	};
};

module.exports = Sockets;