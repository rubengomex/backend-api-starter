const stripe = require('../../services/stripe')

exports.list = async ({ customerId }) => {
  if (!customerId) return []
  const invoices = await stripe.getInvoices({ customer: customerId })
  return invoices
}

exports.createInvoiceItem = async item => {
  if (!item.customer || !item.currency) return []
  const createInvoiceItem = await stripe.createInvoiceItem(item)
  return createInvoiceItem
}
