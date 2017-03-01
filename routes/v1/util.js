'use strict';
/* globals module, require */

var apiMiddleware = require('./middleware');
var multipart = require.main.require('connect-multiparty');
var uploadController = require.main.require('./src/controllers/uploads');

var path = require('path');
var async = require.main.require('async');
var nconf = require.main.require('nconf');
var validator = require.main.require('validator');

var meta = require.main.require('./src/meta');
var file = require.main.require('./src/file');
var plugins = require.main.require('./src/plugins');

module.exports = function(/*middleware*/) {
  var app = require('express').Router();
  app.route('/upload').post(apiMiddleware.requireUser, multipart(), function(req, res, next){
    uploadController.upload(req, res, function(uploadedFile, callback){
      if (plugins.hasListeners('filter:uploadFile')) {
        return plugins.fireHook('filter:uploadFile', {
          file: uploadedFile,
          uid: req.user.uid,
        }, callback);
      }
      if (!uploadedFile) {
        return callback(new Error('[[error:invalid-file]]'));
      }
      if (uploadedFile.size > parseInt(meta.config.maximumFileSize, 10) * 1024) {
        return callback(new Error('[[error:file-too-big, ' + meta.config.maximumFileSize + ']]'));
      }
      if(parseInt(meta.config.allowFileUploads) !== 1){
        return callback(new Error('[[error:uploads-are-disabled]]'));
      }
      var extension = file.typeToExtension(uploadedFile.type);
    	if (meta.config.hasOwnProperty('allowedFileExtensions')) {
    		var allowed = file.allowedExtensions();
    		if (!extension || (allowed.length > 0 && allowed.indexOf(extension) === -1)) {
    			return callback(new Error('[[error:invalid-file-type, ' + allowed.join('&#44; ') + ']]'));
    		}
    	}
      if (!extension) {
        return callback(new Error('[[error:invalid-extension]]'));
      }
      var filename = uploadedFile.name || 'upload';
      filename = Date.now() + '-' + validator.escape(filename.replace(path.extname(uploadedFile.name) || '', '')).substr(0, 255) + extension;
      async.waterfall([
        function (next) {
          file.saveFileToLocal(filename, 'files', uploadedFile.path, next);
        },
        function (upload, next) {
          next(null, {
            url: nconf.get('relative_path') + upload.url,
            path: upload.path,
            name: uploadedFile.name,
          });
        },
      ], callback);
    }, next);
  });
  return app;
}
