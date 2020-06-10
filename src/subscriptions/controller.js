const { isEmail } = require('validator')
const db = require('../database')
const stripe = require('../services/stripe')
const mailer = require('../mailer')
const { PaymentRequiredError, NotFoundError, MethodNotAllowedError } = require('./../utils/errors')
const { EMAIL_SUBJECTS, EMAIL_TYPES } = require('../utils/email')
const SubscriptionPlanModel = db.model('subscriptionPlans')

exports.findOne = async (subscriptionId, user) => {
  let subscription = await stripe.getSubscription(subscriptionId)
  if (subscription.status === 'incomplete') {
    subscription = await this.cancelSubscription(subscriptionId, user)
  }
  return subscription
}

exports.getSubscriptionCustomerInvoices = async (subscriptionId, user) => {
  const customerInvoices = await stripe.getSubscriptionCustomerInvoices({
    stripeSubscriptionId: subscriptionId,
    customerId: user.stripe_id
  })

  return customerInvoices
}

exports.create = async (user, { planId, applyDiscount, trial, customTrialDays, token, coupon }) => {
  // already has a subscription
  if (user.stripe_id && user.stripe_subscription_id) {
    return stripe.getSubscription(user.stripe_subscription_id)
  }

  if (!user.stripe_id && !token) throw new PaymentRequiredError('No attached card')

  const plan = await SubscriptionPlanModel.findByPk(planId)
  if (!plan) throw new NotFoundError('Subscription Plan not found!')

  const subscription = await stripe.createSubscription({
    customer: user.stripe_id,
    plan,
    applyDiscount,
    trial,
    customTrialDays,
    coupon
  })

  user.stripe_subscription_id = subscription.id
  user.isSubscribed = true

  await user.save()

  await mailer.send(EMAIL_TYPES.SUBSCRIBED, {
    to: isEmail(user.publicEmail + '') ? user.publicEmail : user.email,
    subject: EMAIL_SUBJECTS.SUBSCRIBED.replace('{0}', plan.name),
    data: { planName: plan.name }
  })
  return subscription
}

exports.update = async (subscriptionId, user, { planId }) => {
  if (!user.stripe_id) throw new PaymentRequiredError('No attached card')

  if (!user.stripe_subscription_id || user.stripe_subscription_id !== subscriptionId) {
    throw new MethodNotAllowedError('Invalid subscription id!')
  }

  const plan = await SubscriptionPlanModel.findByPk(planId)
  if (!plan) throw new NotFoundError('Subscription Plan not found!')

  try {
    await stripe.updateSubscription({ subscriptionId, customer: user.stripe_id, stripePlanId: plan.stripe_plan_id })

    await mailer.send(EMAIL_TYPES.UPDATE_SUBSCRIPTION, {
      to: isEmail(user.publicEmail + '') ? user.publicEmail : user.email,
      subject: EMAIL_SUBJECTS.UPDATE_SUBSCRIPTION.replace('{0}', plan.name),
      data: { planName: plan.name }
    })
  } catch (err) {
    // Failed to update subscription (subscription not found on stripe) we should remove subscription id from our db and try let user know that it will need to try again
    user.stripe_subscription_id = null
    user.isSubscribed = false
    await user.save()

    throw new PaymentRequiredError('An error occurred with the payment system, please try again.')
  }
}

exports.endTrial = async (subscriptionId, user) => {
  if (!user.stripe_subscription_id) return
  if (user.stripe_subscription_id !== subscriptionId) {
    throw new MethodNotAllowedError('Invalid subscription id!')
  }

  await stripe.endTrial(subscriptionId)
}

exports.cancelSubscription = async (subscriptionId, user, attemptsLimitMaxLimitExceeded) => {
  if (!user.stripe_subscription_id) return

  if (user.stripe_subscription_id !== subscriptionId) {
    throw new MethodNotAllowedError('Invalid subscription id!')
  }

  const subscription = await stripe.getSubscription(subscriptionId)
  const planName = subscription.plan.nickname

  await stripe.cancelSubscription(subscriptionId)

  user.stripe_subscription_id = null
  user.subscription_cancelled = true
  user.isSubscribed = false
  await user.save()

  if (attemptsLimitMaxLimitExceeded) {
    await mailer.send(EMAIL_TYPES.CANCEL_SUBSCRIPTION_MAX_ATTEMPTS_EXCEEDED, {
      to: isEmail(user.publicEmail + '') ? user.publicEmail : user.email,
      subject: EMAIL_SUBJECTS.CANCEL_SUBSCRIPTION.replace('{0}', planName),
      data: { planName }
    })
  } else {
    await mailer.send(EMAIL_TYPES.CANCEL_SUBSCRIPTION, {
      to: isEmail(user.publicEmail + '') ? user.publicEmail : user.email,
      subject: EMAIL_SUBJECTS.CANCEL_SUBSCRIPTION.replace('{0}', planName),
      data: { planName }
    })
  }
}
