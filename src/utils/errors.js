const {
  HTTP_STATUS_BAD_REQUEST,
  HTTP_STATUS_UNAUTHORIZED,
  HTTP_STATUS_NOT_FOUND,
  HTTP_STATUS_CONFLICT,
  HTTP_STATUS_SERVER_ERROR
} = require('../constants')

class ApplicationError extends Error {
  get name() {
    return this.constructor.name
  }
}

class UserFacingError extends ApplicationError {}
class BadRequestError extends UserFacingError {
  constructor(message, opts = {}) {
    super(message)
    for (const [key, value] of Object.entries(opts)) {
      this[key] = value
    }
  }

  get status() {
    return HTTP_STATUS_BAD_REQUEST
  }
}

class UnauthorizedError extends UserFacingError {
  get status() {
    return HTTP_STATUS_UNAUTHORIZED
  }
}

class NotFoundError extends UserFacingError {
  get status() {
    return HTTP_STATUS_NOT_FOUND
  }
}

class ConflictError extends UserFacingError {
  get status() {
    return HTTP_STATUS_CONFLICT
  }
}

class InternalServerError extends UserFacingError {
  get status() {
    return HTTP_STATUS_SERVER_ERROR
  }
}

exports.UserFacingError = UserFacingError
exports.BadRequestError = BadRequestError
exports.UnauthorizedError = UnauthorizedError
exports.NotFoundError = NotFoundError
exports.ConflictError = ConflictError
exports.InternalServerError = InternalServerError
