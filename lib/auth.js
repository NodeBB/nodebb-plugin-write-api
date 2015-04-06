'use strict';
/* globals require, module */

var db = module.parent.parent.require('./database'),
	utils = require.main.require('./public/src/utils'),
	async = require.main.require('async'),

	Auth = {};

Auth.getTokens = function(uid, callback) {
	db.getSetMembers('uid:' + uid + ':tokens', callback);
};

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
		var token = utils.generateUUID();

		async.parallel([
			async.apply(db.setObjectField, 'writeToken:uid', token, uid),
			async.apply(db.setAdd, 'uid:' + uid + ':tokens', token)
		], function(err) {
			callback(err, token);
		});
	} else {
		callback(new Error('uid-required'));
	}
};

Auth.generateMasterToken = function(callback) {
	db.setAdd('masterTokens', utils.generateUUID(), callback);
};

Auth.revokeToken = function(token, type, callback) {
	if (!type) type = 'user';

	switch(type) {
		case 'user':
			db.getObjectField('writeToken:uid', token, function(err, uid) {
				async.parallel([
					async.apply(db.deleteObjectField, 'writeToken:uid', token),
					async.apply(db.setRemove, 'uid:' + uid + ':tokens', token)
				], callback);
			});
			break;

		case 'master':
			db.setRemove('masterTokens', token, callback);
			break;
	}
};

module.exports = Auth;