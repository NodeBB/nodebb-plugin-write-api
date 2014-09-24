# NodeBB Write API

Current version : 1.0.0

## General

This spec outlines the various calls exposed by this plugin, as well as expected inputs and outputs.
All API calls are prefixed `/api/vX`, where `X` is the version of API you are interfacing with.

## Authentication

In development mode (with `NODE_ENV` environment variable set to `development`), you can pass in `uid`
in either the query string or request body in order to set (or override) the current user.

*To be expanded*

## Error Handling

When the API encounters an error, it will do it's best to report what went wrong.
Errors will follow the format specified in this example:

    {
        status: "error",
        message: "User authentication is required for this API endpoint."
    }

## Endpoints

### Topics

#### `POST /topics`

**Creates a new topic**

* (Required) cid
    * The category id which this topic will be associated with
* (Required) title
    * A topic title
* (Required) content
    * The topic's main text body content