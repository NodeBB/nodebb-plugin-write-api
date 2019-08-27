'use strict';
/* globals module, require */

var express = require('express');

module.exports = function (middleware) {
	var v1 = require('./v1')(express.Router(), middleware);
	var v2 = require('./v2')(express.Router(), middleware);

	return {
		v1: v1,
		v2: v2,
	};
};