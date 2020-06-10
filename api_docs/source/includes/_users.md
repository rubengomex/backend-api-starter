# Users

## Retrieve current user

> GET http://127.0.0.1:3000/api/v1/me

> Example Request

```shell
  $ curl http://127.0.0.1:3000/api/v1/me \
    -H "Authorization: Bearer your-api-token"
```

> Example Response

```json
{
  "id": 20,
  "photo_url": "https://files.backend-starter.com/200x200/20/profile/screenshot_20190128_at_143329.png",
  "email": "test@test.com",
  "first_name": "test",
  "last_name": "test",
  "phone_number": null,
  "role": "Admin",
  "created_at": "2019-01-26T20:15:53.350Z",
  "updated_at": "2019-01-26T20:15:53.350Z",
  "address": {
    "address1": "Street lisbon, nr x Lisbon, Portugal",
    "address2": "",
    "state": "",
    "city": "Lisbon"
    "country": {
      "id": 1,
      "name": "Portugal",
      "code": "PT"
    },
    "zip_code": "xxxx-xxx"
  }
}
```

Retrieves the current authenticated user.

<aside class="notice">
This endpoint needs authentication, so to perform this operation you will need to have a valid api token
</aside>

### Arguments

|     |                 |
| --- | --------------- |
|     | No arguments... |

### Returns

Returns the current authenticate user object, if the call succeeded. If your api token is invalid or something went wrong during the process this call returns an [error](?md#errors).
