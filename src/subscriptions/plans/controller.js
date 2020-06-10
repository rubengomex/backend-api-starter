const db = require('../../database')

exports.list = async ({ interval, currency = 'eur', active }) => {
  let where = { currency }
  if (interval) where.interval = interval
  if (active !== null && active !== undefined) where.active = active

  const subscriptionsPlans = await db.model('subscriptionPlans').findAll({ where, order: [['type', 'ASC']] })
  return subscriptionsPlans
}

exports.findOne = id => db.model('subscriptionPlans').findByPk(id)
