'use strict';
/* globals module */

var auth = require('./auth'),

	Sockets = {};

Sockets.init = function() {
	var Plugins = module.parent.parent.require('./socket.io/plugins').writeApi = {};

	Plugins.createToken = function(socket, uid, callback) {
		auth.generateToken(uid, callback);
	};

	Plugins.createMasterToken = function(socket, nothing, callback) {
		auth.generateMasterToken(callback);
	};

	Plugins.revokeToken = function(socket, data, callback) {
		auth.revokeToken(data.token, data.type, callback);
	};
};

module.exports = Sockets;