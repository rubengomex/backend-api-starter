const config = require('../configuration')
const { PRODUCTION_ENV } = require('../constants')

exports.MESSAGE_TYPES = {}

exports.MESSAGES = {}

exports.CHAT_FORBIDDEN_REPLACE_MESSAGE =
  "[Hey! Let's communicate only here. \nThis reduces the risk of scams and fraud and gives us additional escrow payment protection! \nIt's not safe to communicate outside of this website. I really mean it.]"

exports.MESSAGE_TO_EMAIL_DELAY = config.get('NODE_ENV') === PRODUCTION_ENV ? 15 * 60 * 1000 : 5 * 60 * 1000
exports.MESSAGE_TO_FETCH_LAST_MINUTES = config.get('NODE_ENV') === PRODUCTION_ENV ? 45 : 15
exports.NOTIFICATION_DELAY = 12000
