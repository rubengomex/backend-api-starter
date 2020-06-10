const { generate: generatePassword } = require('generate-password')
const db = require('../../database')
const { generateJWT } = require('../../utils/auth')
const { BadRequestError, UnauthorizedError, ConflictError } = require('../../utils/errors')
const { signupValidationSchema } = require('./validations')

// Login user
exports.login = async ({ email, password }) => {
  const user = await db.model('User').findOne({ email }).select('+password').populate('role', '-_id')
  if (!user) throw new UnauthorizedError('Invalid username / password.')

  const isMatch = await user.checkPassword({ password })
  if (!isMatch) throw new UnauthorizedError('Invalid username / password.')

  return generateJWT(user.toJSON())
}

exports.signup = async ({ email, password }) => {
  // TODO: IN FUTURE NEED TO CREATE THE SUBSCRIPTION PLAN AND ATTACHED IT TO THE CLIENT
  // maybe we allow default of 14 days and the block user until he full fills he's card information
  // this will be all done in stripe
  const user = await db.model('User').findOne({ email })
  if (user) throw new ConflictError('Such email is already registered!')

  try {
    const encryptedPassword = password || generatePassword({ length: 11, numbers: true })
    const userObject = { email, password: encryptedPassword }

    await signupValidationSchema.validateAsync(userObject)

    const [role, client] = await Promise.all([
      db.model('Role').findOne({ type: 'Admin' }),
      db.model('Client').findOneAndUpdate({}, { stripe_id: '' }, { upsert: true, new: true }) // We need to insert the subscription plan here
    ])

    let createdUser = await db.model('User').create({ ...userObject, role, client })

    const gym = await db.model('Gym').findOneAndUpdate({}, { owner: createdUser }, { upsert: true, new: true })

    createdUser.gym = gym
    createdUser = await createdUser.save()
    const userObj = await db.model('User').findById(createdUser._id).lean()

    return generateJWT(userObj) || null
  } catch (err) {
    throw new BadRequestError((err.details && err.details.length && err.details[0].message) || err)
  }
}
