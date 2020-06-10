const db = require('../../database')
const config = require('../../configuration')
const { getCache, setCache } = require('../../services/cache')

exports.list = async () => {
  const key = 'api-list-roles'
  const cachedRoles = await getCache({ key })
  if (cachedRoles) return cachedRoles

  const roles = await db.model('roles').findAll()
  await setCache({ key, data: roles, time: config.get('ADMIN_CACHE_SECONDS') })
  return roles
}
