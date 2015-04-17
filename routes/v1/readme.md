# `api/v1` Endpoints

*This list is incomplete*

* `/api/v1`
    * `/users`
        * `POST /`
            * Creates a new user
            * Accepts: `username`, `password`, `email`
            * Any other data passed in will be saved into the user hash
        * `PUT /:uid`
            * Updates a user's profile information
            * Accepts: `username`, `email`, `fullname`, `website`, `location`, `birthday`, `signature`
            * Also accepts any values exposed via the `action:user.updateProfile` hook
            * The `uid` specified in the route path is optional. Without it, the profile of the calling user is edited.
        * `POST /:uid/follow`
            * Follows another user
            * Accepts: No parameters
        * `DELETE /:uid/follow`
            * Unfollows another user
            * Accepts: No parameters
        * `POST /:uid/chats`
            * Sends a chat message to another user
            * Accepts: `message`, `timestamp`, `quiet`
            * `timestamp` (unix timestamp in ms) allows messages to be sent from the past (useful when importing chats)
            * `quiet` if set, will not notify the user that a chat message has been received (also useful during imports)
        * `GET /:uid/tokens`
            * Retrieves a list of active tokens for that user
            * Accepts: No parameters
        * `POST /:uid/tokens`
            * Creates a new user token for the passed in uid
            * Accepts: No parameters
            * Must be called with an active token for that user
        * `DELETE /:uid/tokens/:token`
            * Revokes an active user token
            * Accepts: No parameters
    * `/categories`
        * `POST /`
            * Creates a new category
            * Accepts: `name`, `description`, `bgColor`, `color`
        * `PUT /:cid`
            * Updates a category's data
            * Accepts: `name`, `description`, `bgColor`, `color`, `parentCid`
    * `/groups`
        * `POST /:slug/membership`
            * Joins a group (or requests membership if it is a private group)
            * Accepts: No parameters
        * `DELETE /:slug/membership`
            * Leaves a group
            * Accepts: No parameters
    * `/topics`
        * `POST /`
            * Creates a new topic
            * Accepts: `cid`, `title`, `content`
        * `POST /:tid`
            * Posts a new reply to the topic
            * Accepts: `content`, `toPid`
        * `PUT /:tid`
            * Updates a topic
            * Accepts: `content`, `handle`, `title`, `topic_thumb`, `tags`
        * `DELETE /:tid`
            * Deletes a topic
            * Accepts: No parameters
        * `POST /follow`
            * Subscribes a user to a topic
            * Accepts: `tid`
        * `DELETE /follow`
            * Unsubscribes a user to a topic
            * Accepts: `tid`
