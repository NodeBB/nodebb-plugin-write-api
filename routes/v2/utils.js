'use strict';
/* globals module, require */

var errorHandler = require('../../lib/errorHandler.js'),

	Utils = {};

Utils.checkRequired = function(required, req, res) {
	var missing = [];
	for(var x=0,numRequired=required.length;x<numRequired;x++) {
		if (!req.body.hasOwnProperty(required[x])) {
			missing.push(required[x]);
		}
	}

	if (!missing.length) {
		return true;
	} else if (res) {
		res.status(400).json(errorHandler.generate(
			400, 'params-missing',
			'Required parameters were missing from this API call, please see the "params" property',
			missing
		));
		return false;
	} else {
		return false;
	}
};

// variant of checkRequired that throws error instead of returning Boolean
Utils.required = async (required, req) => {
	var missing = [];
	for(var x=0,numRequired=required.length;x<numRequired;x++) {
		if (!req.body.hasOwnProperty(required[x])) {
			missing.push(required[x]);
		}
	}

	if (!missing.length) {
		return;
	}

	const error = new Error('Required parameters were missing from this API call, please see the "params" property');
	error.code = 'params-missing';
	throw error;
}

Utils.buildReqObject = function (req) {
	var headers = req.headers;
	var encrypted = !!req.connection.encrypted;
	var host = headers.host;
	var referer = headers.referer || '';
	if (!host) {
		host = url.parse(referer).host || '';
	}

	return {
		uid: req.uid,
		params: req.params,
		method: req.method,
		body: req.body,
		ip: req.ip,
		host: host,
		protocol: encrypted ? 'https' : 'http',
		secure: encrypted,
		url: referer,
		path: referer.substr(referer.indexOf(host) + host.length),
		headers: headers,
	};
};

module.exports = Utils;