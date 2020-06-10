const db = require('../../database')
const config = require('../../configuration')
const { getCache, setCache } = require('../../services/cache')

exports.list = async () => {
  const key = 'api-list-countries'
  const cachedCountries = await getCache({ key })
  if (cachedCountries) return cachedCountries

  const countries = await db.model('countries').findAll()
  await setCache({ key, data: countries, time: config.get('ADMIN_CACHE_SECONDS') })
  return countries
}
