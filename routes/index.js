'use strict';
/* globals module, require */

var express = require('express');

module.exports = function(middleware) {
	var v1 = require('./v1')(express.Router(), middleware);

	return {
		v1: v1
	};
};