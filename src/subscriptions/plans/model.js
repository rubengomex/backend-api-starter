const Sequelize = require('sequelize')

const Schema = {
  // [1-basic, 2-standard, 3-premium]
  type: { type: Sequelize.INTEGER, default: 1 },
  amount: Sequelize.DECIMAL(65, 2),
  interval: { type: Sequelize.STRING, defaultValue: 'month' },
  name: { type: Sequelize.STRING, defaultValue: '' },
  currency: { type: Sequelize.STRING, defaultValue: 'eur' },
  active: { type: Sequelize.BOOLEAN, defaultValue: true },
  popular: Sequelize.BOOLEAN,
  features_included: { type: Sequelize.JSON, allowNull: true },
  trial_days: { type: Sequelize.INTEGER, defaultValue: 7 },
  stripe_plan_id: Sequelize.STRING,
  stripe_coupon_id: Sequelize.STRING
}

module.exports = sequelize => {
  const SubscriptionPlan = sequelize.define('subscriptionPlans', Schema)

  return SubscriptionPlan
}
