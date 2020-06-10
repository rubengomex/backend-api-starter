const { UnauthorizedError } = require('../utils/errors')
const { validateJWT } = require('../utils/auth')
const { ROLE_ADMIN } = require('../constants')
const { catchAsync } = require('./errors')
const db = require('../database')

exports.isAuthenticated = catchAsync(async (req, _, next) => {
  const [key, token] = (req.headers.authorization && req.headers.authorization.split(' ')) || []

  if (!key || !token) throw new UnauthorizedError('Please provide an access token.')
  if (key !== 'JWT') throw new UnauthorizedError('Invalid prefix on authorization header.')

  try {
    const user = await validateJWT(token)
    req.user = await db.model('user').findByPk(user._id)
    if (!req.user) throw new UnauthorizedError('Invalid access token!')
    next()
  } catch (err) {
    throw new UnauthorizedError('Invalid access token!')
  }
})

exports.isAdmin = (req, _, next) => {
  if (req.user.role.type !== ROLE_ADMIN) return next(new UnauthorizedError('Only admin access!'))
  next()
}
