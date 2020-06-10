const { BadRequestError } = require('../utils/errors')
const { catchAsync } = require('./errors')

exports.validateSchema = ({ schema }) =>
  catchAsync(async (req, _, next) => {
    try {
      req.body = await schema.validateAsync(req.body)
      next()
    } catch (err) {
      throw new BadRequestError(err.details[0].message)
    }
  })
