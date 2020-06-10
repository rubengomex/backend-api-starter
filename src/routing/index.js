const router = require('express').Router()
const { isAuthenticated } = require('../middlewares/auth')
const auth = require('../auth/routes')
const subscriptions = require('../subscriptions/routes')
const subscriptionsPlans = require('../subscriptions/plans/routes')
const subscriptionsCoupons = require('../subscriptions/coupons/routes')
const subscriptionsInvoices = require('../subscriptions/invoices/routes')
const payments = require('../payments/routes')
const api = require('../api/routes')

router.use('/auth', auth)
router.use('/subscriptions', subscriptions)
router.use('/subscriptions_plans', subscriptionsPlans)
router.use('/subscriptions_coupons', subscriptionsCoupons)
router.use('/subscriptions_invoices', subscriptionsInvoices)
router.use('/payments', isAuthenticated, payments)
router.use('/api/v1', api)

module.exports = router
