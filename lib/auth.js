'use strict';
/* globals require, module */

var db = module.parent.parent.require('./database'),
	utils = require.main.require('./public/src/utils'),
	async = require.main.require('async'),

	Auth = {};

Auth.verifyToken = function(token, callback) {
	async.parallel({
		uid: async.apply(db.getObjectField, 'writeToken:uid', token),
		master: async.apply(db.isSetMember, 'masterTokens', token)
	}, function(err, results) {
		if (err) {
			return callback(err);
		} else {
			return callback(null, results.uid ? {
				uid: parseInt(results.uid, 10)
			} : results.master ? {
				master: true
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

Auth.generateMasterToken = function(callback) {
	db.setAdd('masterTokens', utils.generateUUID(), callback);
};

module.exports = Auth;