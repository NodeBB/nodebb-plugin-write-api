'use strict';
/* globals define, $, socket, ajaxify, app */

define('admin/plugins/write-api', ['settings'], function(Settings) {
	var Admin = {};

	Admin.init = function() {
		Admin.initSettings();
		$('#newToken-create').on('click', Admin.createToken);
		$('#masterToken-create').on('click', Admin.createMasterToken);
		$('table').on('click', '[data-action="revoke"]', Admin.revokeToken);
	};

	Admin.initSettings = function() {
		Settings.load('writeapi', $('.writeapi-settings'));

		$('#save').on('click', function() {
			Settings.save('writeapi', $('.writeapi-settings'), function() {
				app.alert({
					type: 'success',
					alert_id: 'writeapi-saved',
					title: 'Settings Saved',
					timeout: 2500
				});
			});
		});
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

	Admin.createMasterToken = function() {
		socket.emit('plugins.writeApi.createMasterToken', {}, function(err) {
			if (!err) {
				ajaxify.refresh();
			} else {
				app.alertError(err.message);
			}
		});
	};

	Admin.revokeToken = function() {
		var rowEl = $(this).parents('tr'),
			token = rowEl.attr('data-token'),
			tokenType = rowEl.attr('data-token-type');

		socket.emit('plugins.writeApi.revokeToken', {
			type: tokenType,
			token: token
		}, function(err) {
			if (!err) {
				ajaxify.refresh();
			} else {
				app.alertError(err.message);
			}
		});
	};

	return Admin;
});
