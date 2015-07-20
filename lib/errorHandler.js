'use strict';
/* globals module */

var translator = require.main.require('./public/src/modules/translator'),
	isLanguageKey = /^\[\[[\w.\-_:]+]]$/,

	ErrorHandler = {};

ErrorHandler.respond = function(status, res) {
	var errorPayload = ErrorHandler.generate(status);

	res.status(status).json(errorPayload);
	return true;
};

ErrorHandler.handle = function(err, res, payload) {
	if (err) {
		if (isLanguageKey.test(err.message)) {
			translator.translate(err.message, 'en_GB', function(translated) {
				res.status(500).json(ErrorHandler.generate(500, undefined, translated));
			});
		} else {
			res.status(500).json(ErrorHandler.generate(500, undefined, err.message));
		}
	} else {
		res.status(200).json({
			code: 'ok',
			payload: payload || {}
		});
	}
};

ErrorHandler.generate = function(status, code, message, params) {
	// All arguments are optional
	var errorPayload = ErrorHandler.statusToCode(status);

	errorPayload.code = code || errorPayload.code;
	errorPayload.message = message || errorPayload.message;
	errorPayload.params = params || errorPayload.params;

	return errorPayload;
};

ErrorHandler.statusToCode = function(status) {
	var payload = {
			code: 'internal-server-error',
			message: 'An unexpected error was encountered while attempting to service your request.',
			params: {}
		};

	switch(status) {
		case 400:
			payload.code = 'bad-request';
			payload.message = 'Something was wrong with the request payload you passed in.';
			break;

		case 401:
			payload.code = 'not-authorised';
			payload.message = 'A valid login session was not found. Please log in and try again.';
			break;

		case 403:
			payload.code = 'forbidden';
			payload.message = 'You are not authorised to make this call';
			break;

		case 404:
			payload.code = 'not-found';
			payload.message = 'Invalid API call';
			break;

		case 426:
			payload.code = 'upgrade-required';
			payload.message = 'HTTPS is required for requests to the write api, please re-send your request via HTTPS';
			break;
	}

	return payload;
};

module.exports = ErrorHandler;