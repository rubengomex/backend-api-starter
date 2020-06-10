const config = require('../configuration')
const { NotFoundError, UserFacingError } = require('../utils/errors')
const { HTTP_STATUS_SERVER_ERROR } = require('../constants')
const env = config.get('NODE_ENV')
const logger = require('../logger')

exports.catchAsync = handler => (...args) => handler(...args).catch(args[2])

exports.notFoundHandler = (req, _, next) => {
  if (req.path === '/favicon.ico') return next()
  const err = new NotFoundError('Route not found!')
  next(err)
}

exports.genericErrorHandler = (err, req, res, _) => {
  const { status, message, ...others } = err
  if (err instanceof UserFacingError) {
    res.status(status).json({ message, ...others })
  } else {
    res.sendStatus(HTTP_STATUS_SERVER_ERROR)
  }

  // Add proper logger in future
  if (env === 'production') {
    const { password, ...rest } = req.body // remove pass from the log
    logger.addBreadcrumb({
      category: 'request-info',
      data: {
        path: req.path,
        headers: req.headers,
        params: req.params,
        query: req.query,
        body: rest
      },
      level: logger.Severity.Info
    })

    return err instanceof UserFacingError
      ? logger.captureMessage(`User handled error: ${err.message}`, logger.Severity.Info)
      : logger.captureException(err)
  }

  console.info(
    JSON.stringify(
      {
        path: req.path,
        headers: req.headers,
        params: req.params,
        query: req.query,
        body: req.body,
        errorStatus: err.status,
        error: err instanceof UserFacingError ? err.message : err
      },
      null,
      2
    )
  )
}

exports.terminate = (server, opts = ({ timeout = 300 } = {})) => {
  const exit = code => process.exit(code)

  return (code, reason) => err => {
    console.info(`\n Process exiting with code: ${code}, reason: ${reason}`)
    if (err && err instanceof Error) console.error(err)

    // try a grateful shutdown
    server.close(exit)
    setTimeout(exit, opts.timeout).unref()
  }
}
