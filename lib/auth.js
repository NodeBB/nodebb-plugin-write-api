'use strict';
/* globals require, module */

var db = module.parent.parent.require('./database'),
	utils = require.main.require('./public/src/utils'),

	Auth = {};

Auth.verifyToken = function(token, callback) {
	console.log('got', token);
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

Auth.generateToken = function(uid, callback) {
	if (uid) {
		db.setObjectField('writeToken:uid', utils.generateUUID(), uid, callback);
	} else {
		callback(new Error('uid-required'));
	}
};

module.exports = Auth;