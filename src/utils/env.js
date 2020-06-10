const { DEV_ENV, STAGING_ENV, PRODUCTION_ENV } = require('../constants')
const ALLOWED_ENVS = { [DEV_ENV]: DEV_ENV, [STAGING_ENV]: STAGING_ENV, [PRODUCTION_ENV]: PRODUCTION_ENV }

exports.getEnv = key => (key ? (key === DOT_ENV ? '.env' : ALLOWED_ENVS[key] || '.env') : '.env')
