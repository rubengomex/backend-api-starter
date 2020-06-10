const { catchAsync } = require('./errors')
const { getSubscription, retrieveCustomer, setDefaultPaymentMethod } = require('../services/stripe')

const { cancelSubscription } = require('../subscriptions/controller')

exports.checkSubscription = catchAsync(async (req, _, next) => {
  // setting default payment method for exist users (users without payment methods)
  if (req.user.stripe_id) {
    const c = await retrieveCustomer(req.user.stripe_id)
    if (c.invoice_settings && !c.invoice_settings.default_payment_method && c.default_source) {
      setDefaultPaymentMethod(req.user.stripe_id, c.default_source)
    }
  }

  const { status, latest_invoice: latestInvoice } = await getSubscription(req.user.stripe_subscription_id)

  if (!['trialing', 'active'].includes(status)) {
    req.user.isSubscribed = false

    if (status === 'past_due' && latestInvoice.attempt_count > 3) {
      // already attempt to pay 3 times and it fails so we will cancel subscription from the user and send email top notify the state of subscription

      await cancelSubscription(req.user.stripe_subscription_id, req.user, true)
      return next()
    }

    if (status === 'canceled') {
      req.user.subscription_cancelled = true
      req.user.stripe_subscription_id = null
    }
  }

  if (status === 'active') {
    req.user.isSubscribed = true
  }

  await req.user.save()

  next()
})
