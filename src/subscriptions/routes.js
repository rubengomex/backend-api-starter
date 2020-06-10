const router = require('express').Router()
const { isAuthenticated } = require('../middlewares/auth')
const { catchAsync } = require('../utils/errors')
const controller = require('./controller')

router.get('/:id', isAuthenticated, catchAsync(async (req, res) => res.json(await controller.findOne(req.params.id, req.user_object))))

router.get(
  '/:id/customer_invoices',
  isAuthenticated,
  catchAsync(async (req, res) => res.json(await controller.getSubscriptionCustomerInvoices(req.params.id, req.user_object)))
)

router.post(
  '/',
  isAuthenticated,
  catchAsync(async (req, res) =>
    res.send({
      success: true,
      message: 'Successfully subscribed to selected plan!',
      subscription: await controller.create(req.user_object, req.body)
    })
  )
)

router.put(
  '/:id',
  isAuthenticated,
  catchAsync(async (req, res) => {
    await controller.update(req.params.id, req.user_object, req.body)
    res.json({ success: true, message: 'Successfully changed subscription plan!' })
  })
)

router.patch(
  '/:id/trial_end',
  isAuthenticated,
  catchAsync(async (req, res) => {
    await controller.endTrial(req.params.id, req.user_object)
    res.json({ success: true, message: 'Successfully trial ended!' })
  })
)

router.delete(
  '/:id',
  isAuthenticated,
  catchAsync(async (req, res) => {
    await controller.cancelSubscription(req.params.id, req.user_object)
    res.send({ status: true, message: 'Subscription plan successfully canceled!' })
  })
)

module.exports = router
