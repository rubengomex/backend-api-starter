const db = require('../../database')
const { NotFoundError } = require('../../utils/errors')

exports.publicUserProfile = async uid => {
  const user = await db.model('user').getPublic(uid)
  if (!user) throw new NotFoundError('NOT_FOUND')

  return user
}
