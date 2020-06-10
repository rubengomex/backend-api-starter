const router = require('express').Router()
const { catchAsync } = require('../../utils/errors')
const controller = require('./controller')

router.get(
  '/',
  catchAsync(async (_, res) => res.json({ countries: await controller.list() }))
)

module.exports = router
