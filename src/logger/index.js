const Sentry = require('@sentry/node')
const config = require('../configuration')
const { PRODUCTION_ENV } = require('../constants')

if (config.get('NODE_ENV') === PRODUCTION_ENV) {
  Sentry.init({ dsn: config.get('SENTRY_DSN') })
}

module.exports = Sentry
