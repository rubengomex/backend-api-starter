const router = require('express').Router()
const { isAuthenticated, isAdmin } = require('../middlewares/auth')
const admin = require('./admin/routes')
const me = require('./me/routes')
const users = require('./users/routes')
const roles = require('./roles/routes')
const countries = require('./countries/routes')

router.use('/admin', isAuthenticated, isAdmin, admin)
router.use('/users', isAuthenticated, users)
router.use('/me', isAuthenticated, me)
router.use('/roles', roles)
router.use('/countries', countries)

module.exports = router
