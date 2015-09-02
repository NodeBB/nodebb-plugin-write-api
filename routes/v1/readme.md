# `api/v1` Endpoints

**Note**: When requested with a master token, an additional parameter (`_uid`) is required in the data payload so the Write API can execute the requested action under the correct user context.
This limitation means that certain actions only work with a specific uid. For example, `PUT /:uid` updates a user's profile information, but is only accessible by the uid of the user itself, or
an administrative uid. All other uids passed in will result in an error.

* `/api/v1`
    * `/users`
        * `POST /`
            * Creates a new user
            * **Requires**: `username`
            * **Accepts**: `password`, `email`
            * Any other data passed in will be saved into the user hash
        * `PUT /:uid`
            * Updates a user's profile information
            * **Accepts**: `username`, `email`, `fullname`, `website`, `location`, `birthday`, `signature`
            * Also accepts any values exposed via the `action:user.updateProfile` hook
            * The `uid` specified in the route path is optional. Without it, the profile of the calling user is edited.
        * `DELETE /:uid`
            * Deletes a user from NodeBB
            * **Accepts**: No parameters
            * Can be called by either the target uid itself, or an administrative uid.
        * `PUT /:uid/password`
            * Changes a user's password
            * **Requires**: `uid`, `new`
            * **Accepts**: `current`
            * `current` is required if the calling user is not an administrator
        * `POST /:uid/follow`
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
        * `POST /:uid/ban`
            * Bans a user
        * `DELETE /:uid/ban`
            * Unbans a user
        * `GET /:uid/tokens`
            * Retrieves a list of active tokens for that user
            * **Accepts**: No parameters
        * `POST /:uid/tokens`
            * Creates a new user token for the passed in uid
            * **Accepts**: No parameters
            * Must be called with an active token for that user
        * `DELETE /:uid/tokens/:token`
            * Revokes an active user token
            * **Accepts**: No parameters
    * `/categories`
        * `POST /`
            * Creates a new category
            * **Requires**: `name`
            * **Accepts**: `description`, `bgColor`, `color`, `parentCid`, `class`
        * `PUT /:cid`
            * Updates a category's data
            * **Accepts**: `name`, `description`, `bgColor`, `color`, `parentCid`
    * `/groups`
        * `POST /`
            * Creates a new group
            * **Requires**: `name`
            * **Accepts**: `description`, `hidden`, `private`, `ownerUid`
        * `DELETE /:slug`
            * Deletes a group
            * **Accepts**: No parameters
        * `POST /:slug/membership`
            * Joins a group (or requests membership if it is a private group)
            * **Accepts**: No parameters
        * `DELETE /:slug/membership`
            * Leaves a group
            * **Accepts**: No parameters
    * `/topics`
        * `POST /`
            * Creates a new topic
            * **Requires**: `cid`, `title`, `content`
        * `POST /:tid`
            * Posts a new reply to the topic
            * **Requires**: `content`
            * **Accepts**: `toPid`
        * `PUT /:tid`
            * Updates a post in a topic
            * **Requires**: `pid`, `content`
            * **Accepts**: `handle`, `title`, `topic_thumb`, `tags`
        * `DELETE /:tid`
            * Deletes a topic
            * **Accepts**: No parameters
        * `POST /:tid/follow`
            * Subscribes a user to a topic
            * **Accepts**: No parameters
        * `DELETE /:tid/follow`
            * Unsubscribes a user to a topic
            * **Accepts**: No parameters
        * `POST /:tid/tags`
            * Creates or update tags in a topic
            * **Requires**: `tags`
            * This method does not *append* tags, it *replaces* the tag set associated with the topic
        * `DELETE /:tid/tags`
            * **Accepts**: No parameters
            * Clears the tag set associates with a topic
