# Authentication

> To authorize, use this code:

```shell
# With shell, you can just pass the correct header with each request
curl "api_endpoint_here"
  -H "Authorization: JWT your-api-token"
```

> Make sure to replace `your-api-token` with your API key token.

Backend Starter uses API keys to allow access to the API. You can get a Backend Starter API key by [creating a new user](http://127.0.0.1:3000/auth/signup/).

Backend Starter expects for the API key to be included in all API requests to the server in a header that looks like the following:

`Authorization: JWT your-api-token`

<aside class="notice">
You must replace <code>your-api-token</code> with your personal API key.
</aside>

<aside class="warning">If you're not using an administrator API key, note that some Backend Starter api endpoints will return 403 Forbidden if they are hidden for admins only</aside>

## Create a User

> POST http:/127:0.0.1:3000/auth/signup

> Example Request

```shell
  $ curl http:/127:0.0.1:3000/auth/signup \
    -X POST \
    -d email=test@test.com
    -d password=your_password
    -d role=member
    -d name=test
    -d surname=surname
```

> Example Response

```json
{
  "token": "your-api-token"
}
```

Creates a new user on Backend Starter.

<aside class="success">
This endpoint has public access which means that authentication is not required.
</aside>

### Arguments

|                             |                                                                                                     |
| --------------------------- | --------------------------------------------------------------------------------------------------- |
| email (**_required_**)      | User's email.                                                                                       |
| password (`optional`)       | User's password. If no one is provided by the user it will be automatic generated                   |
| role (**_required_**)       | Defines the role of the user. Allowed values: `Admin` |
| name (`optional`)           | User's first name. If wasn't provided, the first block of valid `email` will be used instead.       |

### Returns

The newly created user api token, if the call succeeded. This token now can be use as authentication through our entire api. Something went wrong during the process this call returns an [error](?md#errors).

## Login a User

> POST https:/127:0.0.1:3000/auth/login

> Example Request

```shell
  $ curl http:/127:0.0.1:3000/auth/login \
    -X POST \
    -d email=test@test.com
    -d password=your_password
```

> Example Response

```json
{
  "token": "your-api-token"
}
```

Login's a user on Backend Starter.

<aside class="success">
This endpoint has public access which means that authentication is not required.
</aside>

### Arguments

|                           |                                                                                   |
| ------------------------- | --------------------------------------------------------------------------------- |
| email (**_required_**)    | User's email.                                                                     |
| password (**_required_**) | User's password. If no one is provided by the user it will be automatic generated |

### Returns

The authenticated user api token, if the call succeeded. This token now can be use as authentication through our entire api. Something went wrong during the process this call returns an [error](?md#errors).
