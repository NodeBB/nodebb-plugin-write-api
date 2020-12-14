# Deprecation

As of NodeBB v1.15.0, this plugin is deprecated and has entered maintenance mode. You can of course still use this plugin with versions of v1.15.x and beyond, and I will continue to ensure it is compatible; however new features will not be added.

[Please see this blog post for more information](https://blog.nodebb.org/api-continues-to-evolve/)

New users are recommended to use [the built-in Write API](https://docs.nodebb.org/api/write) that comes with NodeBB v1.15.0 and up.

# Write API

This plugin exposes a *write enabled API interface* for NodeBB. It is useful if you would like to supplment the built-in *read-only* API, in order to push items/actions/events to NodeBB.

For example, without this plugin, one can easily retrieve the contents of a post by prefixing `api/` to the corresponding route. (e.g. https://community.nodebb.org/api/topic/687/help-translate-nodebb/2).

With this plugin, however, you can create content on NodeBB externally (new topics, new posts, etc), which comes in handy when third-party applications want deeper integration with NodeBB.

# Installation

**Install this plugin via the plugins page in the ACP.**

Alternatively:

```
$ cd /path/to/nodebb/node_modules
$ git clone git@github.com:NodeBB/nodebb-plugin-write-api.git
$ cd nodebb-plugin-write-api
$ npm i
```

In both methods, you will need to `./nodebb build` before (re-)starting your NodeBB forum.

# API Resources

* [`api/v1` Endpoints](routes/v1/readme.md)
* [`api/v2` Endpoints](routes/v2/readme.md)

# Quick Start

1. Install and activate the plugin, reload NodeBB
1. Generate your uid an API token in the ACP page
1. `curl -H "Authorization: Bearer {YOUR_TOKEN}" --data "title={TITLE}&content={CONTENT}&cid={CID}" http://localhost:4567/api/v1/topics`

# Authentication

Authentication is handled either via HTTP Bearer Token or JSON Web Token, as generated/specified in the Write API.

## Bearer Tokens

There are two types of tokens:
  * A *user token* is associated with a specific uid, and all calls made are made in the name of that user
  * A *master token* is not associated with any specific uid, though a `_uid` parameter is required in the request, and then all calls are made in the name of *that* user.
    This is the only difference between the two tokens. A master token with `_uid` set to a non-administrator will not allow you to make administrative calls.

*Note*: The first token can be generated via the administration page (`admin/plugins/write-api`), or via the token generation route (`POST /api/v1/users/{UID}/tokens`) by sending in a password, but additional *user* tokens can be generated using an existing user/master token.

## JSON Web Tokens

JSON Web Tokens are an open, industry standard RFC 7519 method for representing claims securely between two parties.

To make requests with a JSON Web Token instead of a user/master token, sign the entire request payload with the same secret as defined in the plugin, and either send it in the POST body, or as a query string parameter. In both cases, the key `token` is used.

For example,

``` bash
$ curl http://localhost:4567/api/v1/users/1/tokens?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfdWlkIjoxfQ.pbm5wbAZ4__yFh5y8oeCsJyT0dm8ROcd5SEBr4yGlNw  # secret is 'secret'
```

# Error Handling

When the API encounters an error, it will do it's best to report what went wrong. Errors will follow the format specified in this example:

    {
        "code": "not-authorised",
        "message": "You are not authorised to make this call",
        "params": {}
    }

# Changelog

## v5.0

* Introduced v2 router with breaking changes to some routes (see [`api/v2` Endpoints](routes/v2/readme.md) for more information)
* Additional validation for post routes in v2 router only

## v4.6

* Bug fixes
* Allowing users to generate token via password input (only in token generation route)

## v4.5

* Bug fixes
* Updated integration with NodeBB so that privileged assets in NodeBB (e.g. `/unread`) can be retrieved for a user via user/master tokens

## v4.2

* Fix bug with topic deletion
* Introduced support for category enable/disable, and category purge (deletion)

## v4.1

* Allow addition of tags when creating topics
* Handling post deletion via API

## v3.x to v4.x

* Made compatible with NodeBB v1.0.0

## v3.1

* Introduced support for JSON Web Tokens

## v2.x to v3.x

* `users/` routes now take a uid instead of a userslug. This affects the following routes:
    * `PUT /api/v1/users/:userslug` -> `PUT /api/v1/users/:uid`
    * `POST /api/v1/users/:userslug/follow` -> `POST /api/v1/users/:uid/follow`
    * `DELETE /api/v1/users/:userslug/follow` -> `DELETE /api/v1/users/:uid/follow`
