const router = require('express').Router()
const { catchAsync } = require('../../utils/errors')
const controller = require('./controller')

router.get(
  '/',
  catchAsync(async (req, res) => res.json(await controller.publicUserProfile(req.query.uid)))
)

module.exports = router
