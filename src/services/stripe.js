const moment = require('moment')
const config = require('../configuration')
const { BadRequestError } = require('../utils/errors')
const db = require('../database')
const Stripe = require('stripe')
const stripe = Stripe(config.get('STRIPE_SECRET_KEY'), {
  apiVersion: '2019-09-09',
  timeout: 20000, // 20 seconds of timeout for any stripe request
  maxNetworkRetries: 2 // retry requests until 2 if stripe fails to reply due networking issues
})

/****************************************************
 * CUSTOMERS
 *******************************************************/
exports.createNewCustomerFromSourceToken = async ({ user }, pm) => {
  const { id: customerId } = await stripe.customers.create({
    email: user.email,
    payment_method: pm || null,
    invoice_settings: { default_payment_method: pm || null }
  })
  return customerId
}

exports.retrieveCustomer = stripeId => stripe.customers.retrieve(stripeId)
exports.updateCustomer = (stripeId, updates) => stripe.customers.update(stripeId, updates)

/****************************************************
 * Charges
 *******************************************************/
exports.createCharge = async ({ amount, currency = 'gbp', description, customerId, metadata }) => {
  try {
    const opts = { amount: parseFloat(amount), currency, customer: customerId, metadata: { ...metadata } }

    if (description) opts.description = description
    await stripe.charges.create(opts)
  } catch (err) {
    switch (err.code) {
      case 'parameter_invalid_string_blank':
      case 'parameter_invalid_empty':
      case 'missing':
        err.message = 'Please add a valid payment method to your account first.'
        break
      case 'card_declined':
        err.message = 'Your card has been declined. Please try another card or contact support for more information.'
        break
      default:
        err.message = 'An error occurred with the payment system, please contact support.'
    }

    throw err
  }
}

exports.createMinCharge = chargeableObj => stripe.charges.create(chargeableObj)

exports.getCharges = async ({ created, transactions = [], lastTransactionId }) => {
  const opts = lastTransactionId ? { starting_after: lastTransactionId, limit: 100 } : { limit: 100 }

  if (created) opts.created = { gte: created }

  const { has_more: hasMore, data } = await stripe.charges.list(opts)
  let newTransactions = [...data]
  let lastTransaction = newTransactions[newTransactions.length - 1].id

  newTransactions = await Promise.all(
    newTransactions
      .filter(t => t.balance_transaction)
      .map(async t => {
        t.created = new Date(t.created * 1000)
        t.transaction = await stripe.balanceTransactions.retrieve(t.balance_transaction)

        return t
      })
  )
  transactions = [...transactions, ...newTransactions]

  return { transactions, hasMore, lastTransaction }
}

/****************************************************
 * PLANS
 *******************************************************/
exports.createSubscriptionPlan = async plan => {
  const stripePlan = await stripe.plans.create({
    nickname: plan.name,
    product: config.get('STRIPE_SUBSCRIPTION_PRODUCT_ID') || { name: 'Sewport Subscription' },
    amount: Math.round(plan.amount * 100 * 100) / 100,
    currency: plan.currency,
    interval: plan.interval,
    metadata: { type: plan.type }
  })

  return stripePlan
}

exports.updateSubscriptionPlan = plan => stripe.plans.update(plan.stripe_plan_id, { nickname: plan.name })
exports.removeSubscriptionPlan = plan => stripe.plans.del(plan.stripe_plan_id)

/****************************************************
 * SUBSCRIPTIONS
 *******************************************************/
exports.getSubscriptions = async ({ stripePlanId, lastSubscriptionId }) => {
  const opts = { status: 'all', limit: 100 }
  if (lastSubscriptionId) opts.starting_after = lastSubscriptionId
  if (stripePlanId) opts.plan = stripePlanId

  let subscriptions = []
  let { has_more: hasMore, data } = await stripe.subscriptions.list(opts)
  subscriptions = [...data]

  let tries = 5
  while (hasMore && --tries > 0) {
    let result = await stripe.subscriptions.list({
      ...opts,
      starting_after: subscriptions[subscriptions.length - 1].id
    })
    subscriptions = [...subscriptions, ...result.data]
    hasMore = result.has_more
  }

  const mappedSubscriptions = await Promise.all(
    subscriptions.map(async s => {
      s.customerEmails = await db.model('user').findOne({
        attributes: ['email', 'publicEmail'],
        where: { stripe_id: s.customer }
      })
      return s
    })
  )

  return { subscriptions: mappedSubscriptions, hasMore, lastSubscriptionId: subscriptions[subscriptions.length - 1].id }
}

exports.getSubscription = async stripeSubscriptionId => {
  const subscription = await stripe.subscriptions.retrieve(stripeSubscriptionId, {
    expand: ['latest_invoice.payment_intent', 'pending_setup_intent']
  })
  return subscription
}

exports.getSubscriptionCustomerInvoices = async ({ stripeSubscriptionId, customerId }) => {
  const invoices = await stripe.invoices.list({ subscription: stripeSubscriptionId, customer: customerId })
  return invoices
}

exports.createSubscription = async ({ customer, plan, trial, applyDiscount, customTrialDays, coupon }) => {
  let subscriptionOptions = {
    customer,
    items: [{ plan: plan.stripe_plan_id }],
    off_session: true,
    expand: ['latest_invoice.payment_intent', 'pending_setup_intent']
  }
  if (trial) {
    subscriptionOptions.trial_end = moment()
      .add(customTrialDays || plan.trial_days, 'days')
      .unix()
  }

  if (applyDiscount && (coupon || plan.stripe_coupon_id)) {
    subscriptionOptions.coupon = coupon || plan.stripe_coupon_id
  }

  const subscription = await stripe.subscriptions.create(subscriptionOptions)
  return subscription
}

exports.updateSubscription = async ({ subscriptionId, customer, stripePlanId }) => {
  const subscription = await stripe.subscriptions.retrieve(subscriptionId)
  await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: false,
    items: [{ id: subscription.items.data[0].id, plan: stripePlanId }]
  })

  try {
    // invoice costumer
    // charges the prorate until final of the subscription
    await stripe.invoices.create({ customer })
  } catch (_) {
    // Do nothing
  }
}

exports.endTrial = stripeSubscriptionId => stripe.subscriptions.update(stripeSubscriptionId, { trial_end: 'now' })
exports.cancelSubscription = stripeSubscriptionId => stripe.subscriptions.del(stripeSubscriptionId)

/****************************************************
 * COUPONS
 *******************************************************/
exports.getCoupons = () => stripe.coupons.list()

exports.getCoupon = async code => {
  try {
    const coupon = await stripe.coupons.retrieve(code)
    return coupon
  } catch (err) {
    return null
  }
}

/****************************************************
 * INVOICES
 *******************************************************/
exports.getInvoices = async opts => {
  const { data: invoices } = await stripe.invoices.list(opts)
  return invoices
}
exports.createInvoiceItem = async opts => {
  const item = await stripe.invoiceItems.create(opts)
  return item
}
/****************************************************
 * CARDS
 *******************************************************/

exports.getCards = async customerId => {
  const { data } = await stripe.customers.listSources(customerId)
  return data
}
exports.setDefaultCard = ({ customerId, cardId }) => stripe.customers.update(customerId, { default_source: cardId })

exports.attachedNewCardFromSourceToken = async ({ customerId, token }) => {
  const { id: cardId } = await stripe.customers.createSource(customerId, { source: token })
  // update customer default source
  await this.setDefaultCard({ customerId, cardId })
}

exports.removeCard = ({ customerId, cardId }) => stripe.customers.deleteCard(customerId, cardId)

exports.deleteDefaultCard = async customerId => {
  const { default_source: defaultCardId } = await await stripe.customers.retrieve(customerId)
  if (!defaultCardId) return

  await this.removeCard({ customerId, cardId: defaultCardId })
}

/****************************************************
 * PAYMENT INTENTS
 *******************************************************/

exports.createPaymentIntent = data => stripe.paymentIntents.create(data)

exports.confirmPaymentIntent = async data => {
  const piConfirm = await stripe.paymentIntents.confirm(data.id, {
    return_url: data.return_url,
    save_payment_method: true
  })
  return piConfirm
}

exports.updatePaymentIntent = data => stripe.paymentIntents.update(data.id, data.updates)
exports.getPaymentIntents = data => stripe.paymentIntents.list(data)

/****************************************************
 * PAYMENT METHODS
 *******************************************************/

exports.createPaymentMethod = async ({ parameters, user }) => {
  const pm = await stripe.paymentMethods.create({
    type: 'card',
    card: parameters.card,
    billing_details: parameters.billing_details
  })
  if (user.stripe_id) {
    const getPaymentMethods = await this.getPaymentMethods(user)
    getPaymentMethods.pms_list.data.forEach(function (existingPm) {
      if (existingPm.card.fingerprint === pm.card.fingerprint) {
        throw new BadRequestError('Card already exist', { code: 'exist' })
      }
    })
  }
  return pm
}

exports.getPaymentMethods = async user => {
  const [dpm, pms] = await Promise.all([
    this.retrieveCustomer(user.stripe_id),
    stripe.paymentMethods.list({ type: 'card', customer: user.stripe_id })
  ])

  return { pms_list: pms, default_pm: dpm.invoice_settings.default_payment_method }
}

exports.setDefaultPaymentMethod = (stripeId, pm) =>
  this.updateCustomer(stripeId, { invoice_settings: { default_payment_method: pm } })

exports.attachPaymentMethod = async ({ user }, pm) => {
  await stripe.paymentMethods.attach(pm, { customer: user.stripe_id })
  await this.setDefaultPaymentMethod(user.stripe_id, pm)
}
exports.detachPaymentMethod = pm => stripe.paymentMethods.detach(pm)
