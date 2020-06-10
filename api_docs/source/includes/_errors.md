# Errors

> Bad Request (`400`) -- Your request is invalid.

> Unauthorized (`401`) -- Your API key is wrong.

> Payment Required (`402`) -- The FitCRM api request needs requires payment to proceed.

> Forbidden (`403`) -- The FitCRM api endpoint requested is hidden for administrators only.

> Not Found (`404`) -- The specified resource could not be found.

> Method Not Allowed (`405`) -- You tried to access a FitCRM api endpoint with an invalid method.

> Not Acceptable (`406`) -- You requested a format that isn't json.

> Conflict (`409`) -- The request could not be completed due to a conflict with the current state of the resource.

> Unprocesable entity (`422`) -- The request could not process the entity.

> Locked (`423`) -- The current request is looked for future requests.

> Internal Server Error (`500`) -- We had a problem with our server. Try again later.

The FitCRM API uses the following error codes:

| Code | Meaning                                                                                                  |
| ---- | -------------------------------------------------------------------------------------------------------- |
| 400  | Bad Request -- Your request is invalid.                                                                  |
| 401  | Unauthorized -- Your API key is wrong.                                                                   |
| 402  | Payment Required -- The FitCRM api request needs requires payment to proceed.                           |
| 403  | Forbidden -- The FitCRM api endpoint requested is hidden for administrators only.                       |
| 404  | Not Found -- The specified resource could not be found.                                                  |
| 405  | Method Not Allowed -- You tried to access a FitCRM api endpoint with an invalid method.                 |
| 406  | Not Acceptable -- You requested a format that isn't json.                                                |
| 409  | Conflict -- The request could not be completed due to a conflict with the current state of the resource. |
| 422  | Unprocesable entity -- The request could not process the entity.                                         |
| 423  | Locked -- The current request is looked for future requests.                                             |
| 500  | Internal Server Error -- We had a problem with our server. Try again later.                              |
