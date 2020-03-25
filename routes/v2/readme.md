# `api/v2` Endpoints

**Note**: When requested with a master token, an additional parameter (`_uid`) is required in the data payload so the Write API can execute the requested action under the correct user context.
This limitation means that certain actions only work with a specific uid. For example, `PUT /:uid` updates a user's profile information, but is only accessible by the uid of the user itself, or
an administrative uid. All other uids passed in will result in an error.

**Migrating from v1?** Take a look at the migration info at the bottom of this page.

* `/api/v2`
    * `/users`
        * `POST /`
            * Creates a new user
            * **Requires**: `username` (In case it's taken, nodebb will append a number.)
            * **Accepts**: `password`, `email`
            * Any other data passed in will be saved into the user hash
        * `PUT /:uid`
            * Updates a user's profile information
            * **Accepts**: `username`, `email`, `fullname`, `website`, `location`, `birthday`, `signature`
            * Also accepts any values exposed via the `action:user.updateProfile` hook
            * The `uid` specified in the route path is optional. Without it, the profile of the calling user is edited.
        * `DELETE /:uid`
            * Deletes a user from NodeBB (**Careful**: There is no confirmation!)
            * **Accepts**: No parameters
            * Can be called by either the target uid itself, or an administrative uid.
        * `PUT /:uid/password`
            * Changes a user's password
            * **Requires**: `new`
            * **Accepts**: `current`
            * `current` is required if the calling user is not an administrator
        * `PUT /:uid/follow`
            * Follows another user
            * **Accepts**: No parameters
        * `DELETE /:uid/follow`
            * Unfollows another user
            * **Accepts**: No parameters
        * `POST /:uid/chats`
            * Sends a chat message to another user
            * **Requires**: `message`
            * **Accepts**: `timestamp`, `quiet`
            * `timestamp` (unix timestamp in ms) allows messages to be sent from the past (useful when importing chats)
            * `quiet` if set, will not notify the user that a chat message has been received (also useful during imports)
        * `PUT /:uid/ban`
            * Bans a user
            * **Accepts**: `until`, `reason`
            * `until` (unix timestamp in ms) Specifies expiration for the ban
            * `reason` A string containing the reason for the ban
        * `DELETE /:uid/ban`
            * Unbans a user
        * `GET /:uid/tokens`
            * Retrieves a list of active tokens for that user
            * **Accepts**: No parameters
        * `POST /:uid/tokens`
            * Creates a new user token for the passed in uid
            * **Accepts**: No parameters normally, will accept `password` in lieu of Bearer token
            * Can be called with an active token for that user
            * This is the only route that will allow you to pass in `password` in the request body. Generate a new token and then use the token in subsequent calls.
        * `DELETE /:uid/tokens/:token`
            * Revokes an active user token
            * **Accepts**: No parameters
    * `/groups`
        * `POST /`
            * Creates a new group
            * **Requires**: `name`
            * **Accepts**: `description`, `hidden`, `private`, `ownerUid`
        * `DELETE /:slug`
            * Deletes a group (**Careful**: There is no confirmation!)
            * **Accepts**: No parameters
        * `PUT /:slug/membership`
            * Joins a group (or requests membership if it is a private group)
            * **Accepts**: No parameters
        * `PUT /:slug/membership/:uid`
            * Adds a user to a group (The calling user has to be an administrator)
            * **Accepts**: No parameters
        * `DELETE /:slug/membership`
            * Leaves a group
            * **Accepts**: No parameters
        * `DELETE /:slug/membership/:uid`
            * Removes a user from a group (The calling user has to be an administrator)
            * **Accepts**: No parameters
    * `/categories`
        * `POST /`
            * Creates a new category
            * **Requires**: `name`
            * **Accepts**: `description`, `bgColor`, `color`, `parentCid`, `class`
        * `PUT /:cid`
            * Updates a category's data
            * **Accepts**: `name`, `description`, `bgColor`, `color`, `parentCid`, `backgroundImage`
        * `DELETE /:cid`
            * Purges a category, including all topics and posts inside of it (**Careful**: There is no confirmation!)
            * **Accepts**: No parameters
        * `PUT /:cid/state`
            * Enables a category
            * **Accepts**: No parameters
        * `DELETE /:cid/state`
            * Disables a category
            * **Accepts**: No parameters
        * `PUT /:cid/privileges`
            * Adds user or group privileges to a category
            * Group privileges are prefixed with `groups:`, i.e. `groups:topics:create`
            * **Requires**: `privileges (array)`, `groups (array)`
        * `DELETE /:cid/privileges`
            * Deletes group privileges from a category
            * The same restrictions apply as with privilege adding
            * **Requires**: `privileges (array)`, `groups (array)`
    * `/topics`
        * `POST /`
            * Creates a new topic
            * **Requires**: `cid`, `title`, `content`
            * **Accepts**: `tags (array)`
        * `POST /:tid`
            * Posts a new reply to the topic
            * **Requires**: `content`
            * **Accepts**: `toPid`
        * `PUT /:tid`
            * Updates a post in a topic
            * **Requires**: `pid`, `content`
            * **Accepts**: `handle`, `title`, `topic_thumb`, `tags`
        * `DELETE /:tid`
            * Purges a topic, including all posts inside (**Careful**: There is no confirmation!)
            * **Accepts**: No parameters
        * `DELETE /:tid/state`
            * Deletes a topic (that is, a soft-delete) (**Careful**: There is no confirmation!)
            * **Accepts**: No parameters
        * `PUT /:tid/state`
            * Restores a topic (**Careful**: There is no confirmation!)
            * **Accepts**: No parameters
        * `PUT /:tid/follow`
            * Subscribes a user to a topic
            * **Accepts**: No parameters
        * `DELETE /:tid/follow`
            * Unsubscribes a user to a topic
            * **Accepts**: No parameters
        * `PUT /:tid/tags`
            * Creates or update tags in a topic
            * **Requires**: `tags`
            * This method does not *append* tags, it *replaces* the tag set associated with the topic
        * `DELETE /:tid/tags`
            * **Accepts**: No parameters
            * Clears the tag set associates with a topic
        * `PUT /:tid/pin`
            * **Accepts**: No parameters
            * Pins a topic to the top of the category
        * `DELETE /:tid/pin`
            * **Accepts**: No parameters
            * Unpins a topic from the top of the category
    * `/posts`
        * `PUT /:pid`
            * Edits a post by post ID
            * **Requires**: `content`
            * **Accepts**: `title`, `topic_thumb`, `tags`
        * `DELETE /:pid`
            * Purges a post, thereby removing it from the database completely (**Careful**: There is no confirmation!)
            * **Accepts**: No parameters
        * `DELETE /:pid/state`
            * Deletes a post (that is, a soft-delete)
            * **Accepts**: No parameters
        * `PUT /:pid/state`
            * Restores a post
            * **Accepts**: No parameters
        * `POST /:pid/vote`
            * Votes for a post
            * **Requires**: `delta`
            * `delta` must be a number. If `delta > 0`, it's considered an upvote; if `delta < 0`, it's considered a downvote; otherwise, it's an unvote.
        * `DELETE /:pid/vote`
            * Unvotes a post
            * **Accepts**: No parameters
        * `POST /:pid/bookmark`
            * Bookmarks a post
            * **Accepts**: No parameters
        * `DELETE /:pid/bookmark`
            * Unbookmarks a post
            * **Accepts**: No parameters
    * `/util`
        * `POST /upload`
            * Uploads a File
            * **Accepts**: A multipart files array `files[]`
        * `POST /maintenance`
            * Enables Maintenance Mode
            * **Accepts**: No parameters
        * `DELETE /maintenance`
            * Disabled Maintenance Mode
            * **Accepts**: No parameters

## Changes from API v1

* `/topics`
    * Two new endpoints, `DELETE /:tid/state` and `PUT /:tid/state`, which deletes and restores a topic, respectively
    * `DELETE /:tid` now **purges** a topic instead of deleting it
    * `POST /:tid/tags` is now `PUT /:tid/tags`
    * `POST /:tid/follow` is now `PUT /:tid/follow`
* `/posts`
    * Two new endpoints, `DELETE /:pid/state` and `PUT /:pid/state`, which deletes and restores a post, respectively
    * `DELETE /:pid` now **purges** a post instead of deleting it
    * Additional validation added (checking for pid existence, etc.)
* `/users`
    * `POST /:uid/follow` is now `PUT /:uid/follow`
    * `POST /:uid/ban` is now `PUT /:uid/ban`
