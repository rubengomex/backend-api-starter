const db = require('../database')
const { BadRequestError } = require('../utils/errors')
const stripe = require('../services/stripe')

exports.c_retrieve = stripeId => stripe.retrieveCustomer(stripeId)
exports.c_update = (stripeId, updates) => stripe.updateCustomer(stripeId, updates)

exports.pi_create = async (data, user) => {
  let createPaymentIntent
  // Payment Intent by invoice id
  if (data.invoiceId && data.return_url) {
    const [invoices, pm] = await Promise.all([
      db.model('projectInvoices').findAll({ where: { id: { $in: data.invoiceId }, status: 0 } }),
      stripe.retrieveCustomer(user.stripe_id)
    ])
    if (pm.invoice_settings && !pm.invoice_settings.default_payment_method) {
      throw new BadRequestError('Please add a valid payment method to your account first.', { type: 'card_error' })
    }
    const pis = await stripe.getPaymentIntents({ customer: user.stripe_id })
    const existingPi = pis.data.find(value => Number(value.metadata.invoiceId) === data.invoiceId[0])
    await Promise.all(
      invoices.map(async i => {
        try {
          if (existingPi) {
            if (existingPi.status === 'requires_payment_method' || existingPi.status === 'requires_source') {
              createPaymentIntent = await stripe.updatePaymentIntent({
                id: existingPi.id,
                updates: { payment_method: pm.invoice_settings.default_payment_method }
              })
              if (createPaymentIntent.status === 'requires_confirmation') {
                createPaymentIntent = await stripe.confirmPaymentIntent({
                  id: existingPi.id,
                  return_url: data.return_url
                })
              }
            }
            if (existingPi.status === 'requires_confirmation') {
              createPaymentIntent = await stripe.confirmPaymentIntent({
                id: existingPi.id,
                return_url: data.return_url
              })
            }
            if (existingPi.status === 'requires_source_action' || existingPi.status === 'requires_action' || existingPi.status === 'succeeded') {
              createPaymentIntent = existingPi
            }
          } else {
            createPaymentIntent = await stripe.createPaymentIntent({
              amount: Math.round(i.amount * 100 * 100) / 100,
              currency: i.currency,
              customer: user.stripe_id,
              payment_method: pm.invoice_settings.default_payment_method,
              save_payment_method: true,
              metadata: { userId: user.id, userEmail: user.email, invoiceId: i.id },
              confirm: true,
              return_url: data.return_url
            })
          }
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
          throw new BadRequestError(null, err)
        }
      })
    )
  } else {
    createPaymentIntent = await stripe.createPaymentIntent(data)
  }
  return createPaymentIntent
}

exports.pi_confirm = data => stripe.confirmPaymentIntent(data)
exports.pi_update = data => stripe.updatePaymentIntent(data)

exports.pm_create = async ({ parameters, user }) => {
  try {
    const createPaymentMethod = await stripe.createPaymentMethod({ parameters, user })
    let customerId
    if (!user.stripe_id) {
      customerId = await stripe.createNewCustomerFromSourceToken({ user, returnCustomer: true }, createPaymentMethod.id)
      user.stripe_id = customerId
      await user.save()
    } else {
      if (createPaymentMethod.id) {
        await stripe.attachPaymentMethod({ user }, createPaymentMethod.id)
      }
    }
    if (createPaymentMethod.id) {
      return { paymentMethod: createPaymentMethod.id, stripeId: user.stripe_id }
    } else {
      throw new BadRequestError(null, createPaymentMethod)
    }
  } catch (err) {
    throw new BadRequestError(err.message, err)
  }
}

exports.pms_get = user => stripe.getPaymentMethods(user)
exports.pm_detach = pm => stripe.detachPaymentMethod(pm)
