# `api/v1` Endpoints

*This list is incomplete*

* `/api/v1`
    * `/users`
        * `POST /`
            * Creates a new user
            * Accepts: `username`, `password`, `email`
            * Any other data passed in will be saved into the user hash
        * `PUT /:userslug`
            * Updates a user's profile information
            * Accepts: `username`, `email`, `fullname`, `website`, `location`, `birthday`, `signature`
            * Also accepts any values exposed via the `action:user.updateProfile` hook
            * The `userslug` specified in the route path is optional. Without it, the profile of the calling user is edited.
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