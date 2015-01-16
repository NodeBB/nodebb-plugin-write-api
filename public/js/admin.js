(function() {
	'use strict';
	/* globals define, $, socket, ajaxify, app */

	define('admin/plugins/write-api', function() {
		var Admin = {};

		Admin.init = function() {
			$('#newToken-create').on('click', Admin.createToken);
		};

		Admin.createToken = function() {
			var uid = parseInt($('#newToken-uid').val(), 10) || 1;

			socket.emit('plugins.writeApi.createToken', uid, function(err) {
				if (!err) {
					ajaxify.refresh();
				} else {
					app.alertError(err.message);
				}
			});
		};

		return Admin;
	});
})();