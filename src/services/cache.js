const { promisify } = require('util')
const redis = require('redis')
const config = require('../configuration')
const client = redis.createClient(config.get('REDIS_SERVER'))
const getAsync = promisify(client.get).bind(client)
const setAsync = promisify(client.set).bind(client)

exports.getCache = async ({ key }) => {
  try {
    const cacheData = await getAsync(key)
    return JSON.parse(cacheData)
  } catch (err) {
    console.error('err when getting from cache with key %s', key)
    return null
  }
}

exports.setCache = async ({ key, data, time }) => {
  try {
    await setAsync(key, JSON.stringify(data), 'EX', time)
  } catch (err) {
    console.error('err when setting cache data for key %s', key)
    return null
  }
}
