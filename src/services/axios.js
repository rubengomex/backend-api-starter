const axios = require('axios').default
const config = require('../configuration')

exports.COUNTRIES_API = axios.create({ baseURL: config.get('COUNTRIES_API_URL') })
