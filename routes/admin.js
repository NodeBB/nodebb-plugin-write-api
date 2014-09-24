(function() {
	"use strict";

	var async = module.parent.parent.require('async'),
		db = module.parent.parent.require('./database'),
		User = module.parent.parent.require('./user'),

		buildAdminPage = function(req, res) {
			async.parallel({
				tokens: async.apply(db.getObject, 'writeToken:uid'),
				users: function(next) {
					db.getObjectValues('writeToken:uid', function(err, uids) {
						if (err || !uids) return next(err);

						uids = uids.filter(function(uid, idx, uids) {
							return uids.indexOf(uid) === idx;
						});

						if (!uids.length) {
							return next(null, []);
						}

						User.getMultipleUserFields(uids, ['uid', 'username', 'picture'], next);
					});
				}
			}, function(err, data) {
				// Fix token object
				var mapping = data.tokens;
				delete data.tokens;
				data.tokens = [];
				for (var i in mapping) {
					data.tokens.push({
						uid: mapping[i],
						access_token: i
					});
				}

				// Make users array a hash
				var users = [];
				for(var x=0,numUsers=data.users.length,userObj;x<numUsers;x++) {
					userObj = data.users[x];
					users[userObj.uid] = userObj;
				}

				// Attach user data to tokens
				for(var y=0,numTokens=data.tokens.length,tokenObj;y<numTokens;y++) {
					tokenObj = data.tokens[y];
					tokenObj.user = users[tokenObj.uid];
				}

				res.render('admin/plugins/write-api', data);
			});
		};

	module.exports = function(app, middleware) {
		app.get('/admin/plugins/write-api', middleware.admin.buildHeader, buildAdminPage);
		app.get('/api/admin/plugins/write-api', buildAdminPage);
	};
})();