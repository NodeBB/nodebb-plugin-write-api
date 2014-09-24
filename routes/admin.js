var async = module.parent.parent.require('async'),
	db = module.parent.parent.require('./database'),

	buildAdminPage = function(req, res) {
		async.parallel({
			tokens: async.apply(db.getObject, 'writeToken:uid')
		}, function(err, data) {
			// Fix token object
			var mapping = data.tokens;
			delete data.tokens;
			data.tokens = [];
			for (i in mapping) {
				data.tokens.push({
					uid: mapping[i],
					access_token: i
				});
			}

			res.render('admin/plugins/write-api', data);
		});
	};

module.exports = function(app, middleware) {
	app.get('/admin/plugins/write-api', middleware.admin.buildHeader, buildAdminPage);
	app.get('/api/admin/plugins/write-api', buildAdminPage);
};