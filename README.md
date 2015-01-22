# Write API

This plugin exposes a *write enabled API interface* for NodeBB. It is useful if you would like to supplment the built-in *read-only* API, in order to push items/actions/events to NodeBB.

For example, without this plugin, one can easily retrieve the contents of a post by prefixing `api/` to any route. (e.g. https://community.nodebb.org/api/topic/687/help-translate-nodebb/2).

With this plugin, however, you can create content on NodeBB externally (new topics, new posts, etc), which comes in handy when third-party applications want deeper integration with NodeBB.

# Installation

### **Important: This module is currently in development and is not intended for production use, hence it has not been published to npm yet. Use with caution.**

```
$ cd /path/to/nodebb/node_modules
$ git clone git@github.com:julianlam/nodebb-plugin-write-api.git

# Then start NodeBB and activate the plugin
```

# API Resources

*This list is incomplete*

* `/api/v1`
    * `/users`
        * `POST /:userslug/follow`
            * Follows another user
            * Accepts: No parameters
        * `DELETE /:userslug/follow`
            * Unfollows another user
            * Accepts: No parameters
    * `/groups`
        * `POST /:group_name/membership`
            * Joins a group (or requests membership if it is a private group)
            * Accepts: No parameters
        * `DELETE /:group_name/membership`
            * Leaves a group
            * Accepts: No parameters
    * `/topics`
        * `POST /`
            * Creates a new topic
            * Accepts: `cid`, `title`, `content`
        * `PUT` /:tid`
            * Updates a topic
            * Accepts: `content`, `handle`, `title`, `topic_thumb`, `tags`
        * `DELETE` /:tid`
            * (Not implemented) Deletes a topic (RFC: should calling this a second time will purge the topic?)

# Quick Start

1. Install and activate the plugin, reload NodeBB
1. Generate your uid an API token in the ACP page
1. `curl -H "Authorization: Bearer {YOUR_TOKEN}" --data "title={TITLE}&content={CONTENT}&cid={CID}" http://localhost:4567/api/v1/topics`