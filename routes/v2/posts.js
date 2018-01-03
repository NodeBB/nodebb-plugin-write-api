'use strict';
/* globals module, require */

var posts = require.main.require('./src/posts'),
  topics = require.main.require('./src/topics'),
  utils = require.main.require('./src/utils'),
  privileges = require.main.require('./src/privileges'),
  // socketPosts = require.main.require('./src/socket.io/SocketPosts'),
  apiMiddleware = require('./middleware'),
  errorHandler = require('../../lib/errorHandler'),
  utils = require('./utils');

var async = require('async');

function getReplies(uid, pid, callback) {
  if (!(!isNaN(parseFloat(pid)) && isFinite(pid))) {
    return callback(new Error('[[error:invalid-data]]'));
  }
  var postPrivileges;
  async.waterfall([
    function (next) {
      posts.getPidsFromSet('pid:' + pid + ':replies', 0, -1, false, next);
    },
    function (pids, next) {
      async.parallel({
        posts: function (next) {
          posts.getPostsByPids(pids, uid, next);
        },
        privileges: function (next) {
          privileges.posts.get(pids, uid, next);
        },
      }, next);
    },
    function (results, next) {
      postPrivileges = results.privileges;
      results.posts = results.posts.filter(function (postData, index) {
        return postData && postPrivileges[index].read;
      });
      topics.addPostData(results.posts, uid, next);
    },
    function (postData, next) {
      postData.forEach(function (postData) {
        posts.modifyPostByPrivilege(postData, postPrivileges.isAdminOrMod);
      });
      next(null, postData);
    },
  ], callback);
};


module.exports = function (middleware) {
  var app = require('express').Router();

  app.route('/:pid')
    .put(apiMiddleware.requireUser, function (req, res) {
      if (!utils.checkRequired(['content'], req, res)) {
        return false;
      }

      var payload = {
        uid: req.user.uid,
        pid: req.params.pid,
        content: req.body.content,
        options: {}
      };

      if (req.body.handle) {
        payload.handle = req.body.handle;
      }
      if (req.body.title) {
        payload.title = req.body.title;
      }
      if (req.body.topic_thumb) {
        payload.options.topic_thumb = req.body.topic_thumb;
      }
      if (req.body.tags) {
        payload.options.tags = req.body.tags;
      }

      posts.edit(payload, function (err) {
        errorHandler.handle(err, res);
      })
    })
    .delete(apiMiddleware.requireUser, apiMiddleware.validatePid, function (req, res) {
      posts.purge(req.params.pid, req.user.uid, function (err) {
        errorHandler.handle(err, res);
      });
    });

  app.route('/:pid/state')
    .put(apiMiddleware.requireUser, apiMiddleware.validatePid, function (req, res) {
      posts.restore(req.params.pid, req.user.uid, function (err) {
        errorHandler.handle(err, res);
      });
    })
    .delete(apiMiddleware.requireUser, apiMiddleware.validatePid, function (req, res) {
      posts.delete(req.params.pid, req.user.uid, function (err) {
        errorHandler.handle(err, res);
      });
    });

  app.route('/:pid/vote')
    .post(apiMiddleware.requireUser, function (req, res) {
      if (!utils.checkRequired(['delta'], req, res)) {
        return false;
      }

      if (req.body.delta > 0) {
        posts.upvote(req.params.pid, req.user.uid, function (err, data) {
          errorHandler.handle(err, res, data);
        })
      } else if (req.body.delta < 0) {
        posts.downvote(req.params.pid, req.user.uid, function (err, data) {
          errorHandler.handle(err, res, data);
        })
      } else {
        posts.unvote(req.params.pid, req.user.uid, function (err, data) {
          errorHandler.handle(err, res, data);
        })
      }
    })
    .delete(apiMiddleware.requireUser, function (req, res) {
      posts.unvote(req.params.pid, req.user.uid, function (err, data) {
        errorHandler.handle(err, res, data);
      })
    });

  app.route('/:pid/bookmark')
    .post(apiMiddleware.requireUser, function (req, res) {
      posts.bookmark(req.params.pid, req.user.uid, function (err) {
        errorHandler.handle(err, res);
      });
    })
    .delete(apiMiddleware.requireUser, function (req, res) {
      posts.unbookmark(req.params.pid, req.user.uid, function (err) {
        errorHandler.handle(err, res);
      });
    });

  app.route('/:pid/replies')
    .post(apiMiddleware.requireUser, function (req, res) {
      getReplies(req.user.uid, req.params.pid, function (err, data) {
        errorHandler.handle(err, res, data);
      });
    });

  return app;
};
