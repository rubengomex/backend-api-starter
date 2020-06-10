const config = require('../config')

exports.get = key => process.env[key] || config[key]
