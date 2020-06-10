const router = require('express').Router()
const { catchAsync } = require('../../utils/errors')
const controller = require('./controller')

router.get(
  '/',
  catchAsync(async (req, res) => res.json(await controller.list(req.query)))
)
router.get(
  '/:id',
  catchAsync(async (req, res) => res.send(await controller.findOne(req.params.id)))
)

module.exports = router
