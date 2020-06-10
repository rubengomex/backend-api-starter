const router = require('express').Router()
const { isAuthenticated } = require('../../middlewares/auth')
const { catchAsync } = require('../../utils/errors')
const controller = require('./controller')

router.get(
  '/',
  isAuthenticated,
  catchAsync(async (req, res) => res.json(await controller.list({ customerId: req.user_object.stripe_id })))
)

router.post(
  '/items',
  isAuthenticated,
  catchAsync(async (req, res) => {
    req.body.customer = req.user_object.stripe_id
    res.json(await controller.createInvoiceItem(req.body))
  })
)

module.exports = router
