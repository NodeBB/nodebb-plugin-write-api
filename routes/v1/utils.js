'use strict';
/* globals module */

var Utils = {};

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
		res.status(400).json({
			code: 'params-missing',
			error: 'Required parameters were missing from this API call, please see the "values" property',
			values: missing
		});
		return false;
	} else {
		return false;
	}
};

module.exports = Utils;