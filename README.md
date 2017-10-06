# Write API

This plugin exposes a *write enabled API interface* for NodeBB. It is useful if you would like to supplment the built-in *read-only* API, in order to push items/actions/events to NodeBB.

For example, without this plugin, one can easily retrieve the contents of a post by prefixing `api/` to the corresponding route. (e.g. https://community.nodebb.org/api/topic/687/help-translate-nodebb/2).

With this plugin, however, you can create content on NodeBB externally (new topics, new posts, etc), which comes in handy when third-party applications want deeper integration with NodeBB.

# Installation

**Install this plugin via the plugins page in the ACP.**

Alternatively:

```
$ cd /path/to/nodebb/node_modules
$ git clone git@github.com:julianlam/nodebb-plugin-write-api.git
$ cd nodebb-plugin-write-api
$ npm i

# Then start NodeBB and activate the plugin
```

# API Resources

* [`api/v1` Endpoints](routes/v1/readme.md)
* [`api/v2` Endpoints](routes/v2/readme.md)

# Quick Start

1. Install and activate the plugin, reload NodeBB
1. Generate your uid an API token

1. `curl -H "Authorization: bearer {YOUR_TOKEN}" --data "title={TITLE}&content={CONTENT}&cid={CID}" http://localhost:4567/api/v1/topics`

# Authentication

Authentication is handled either via HTTP bearer Token or JSON Web Token, as generated/specified in the Write API.

## Tokens

There are two types of tokens the **bearer/master token** and the **user token**. Think of these tokens as keys to two locks. The first token the bearer/master token is the key to the lock on the gate of your front yard. Its gets you onto the property but you can't get into your house with it, but you can get into the garage and walk around the house. So it has a certain level of rights to it.  In some cases you wont need the user token when using the bearer/master token. 
The second token the user token is the key to your front door. It can get you into the house, but it can't get you on the property. So if you will always need the bearer/master token when using the user token. 



### bearer/master token
   This token grants you access to the API. To get a bearer/mater token. Go the admin section of the site select plugins > write-api > create token button under master tokens. <br>
   You then add this token your headers<br> 
   key = **authorization** and **value** = 'bearer {your bearer/master token}'
   <br>
  
### user token
     Is associated with a specific uid. You need a user token to make calls that requrie a userID to be associated the enity creation. This is 95% of the rest of the api.  To get a user token admin section of the site select plugins > write-api > in the active tokens section input a UID and then push create token button . <br>
     You append the user token as a paramater to the querty string <br>
     http://localhost:4567/api/v2/topics/?_uid=1
   
    addtionally you can create a user token via API route (`POST /api/v1/users/{UID}/tokens`) using just the bearer/master token.

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
