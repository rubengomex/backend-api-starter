// Load env variables based on current environment
const path = require('path')
const { getEnv } = require('./utils/env')
require('dotenv').config({ path: path.resolve(__dirname, '..', getEnv(process.env.NODE_ENV)) })

const util = require('util')
const http = require('http')
const express = require('express')
const helmet = require('helmet')
const chalk = require('chalk')
const responseTime = require('response-time')
const compression = require('compression')
const config = require('./configuration')
const bodyParser = require('body-parser')
const socketIO = require('socket.io')
const redis = require('socket.io-redis')
const ioAuth = require('socketio-jwt')
const { notFoundHandler, genericErrorHandler, terminate } = require('./middlewares/errors')
const { initializeCors } = require('./middlewares/cors')
const database = require('./database')
const { PRODUCTION_ENV } = require('./constants')

const app = express()
const docs = express.Router()
const server = http.createServer(app)
const io = socketIO(server)
const env = config.get('NODE_ENV') || 'dev'
const docsPath = path.resolve(__dirname, '..', 'api_docs', 'build')

// web sockets
io.adapter(redis(config.get('REDIS_SERVER')))
io.set('transports', 'websocket')
io.use(ioAuth.authorize({ secret: config.get('JWT_SECRET'), handshake: true }))
require('./sockets').initialize(io)

// Cors
app.use(initializeCors())
// Security & compression
app.use(helmet({ frameguard: false }))
// App
app.use(cookieParser())
app.use(compression())
app.use(responseTime())
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }))
app.use(express.json({ limit: '50mb' }))
if (env !== PRODUCTION_ENV) {
  app.use(require('morgan')('dev'))
}

docs.use(express.static(path.resolve(__dirname, '..', 'api_docs', 'build')))
docs.all('/*', (_, res) => res.sendFile('index.html', { root: docsPath }))

app.use('/', require('./routing'))
app.use('/docs', docs)
app.use(notFoundHandler)
app.use(genericErrorHandler)

// Global promise exception handler
// Graceful shut down logic for errors
const exitHandler = terminate(server, { timeout: 300 })

process.on('uncaughtException', exitHandler(1, 'Unexpected Error'))
process.on('unhandledRejection', exitHandler(1, 'Unhandled Promise'))
process.on('SIGTERM', exitHandler(0, 'SIGTERM'))
process.on('SIGINT', exitHandler(0, 'SIGINT'))

exports.app = app
exports.start = async () => {
  try {
    const port = config.get('PORT') || 3000

    await database.initialize()
    console.log('%s Connected to database %s', chalk.green('✓'), '🚀')

    await util.promisify(server.listen).bind(server)(port)
    console.log('%s App running at %d in %s mode %s', chalk.green('✓'), port, env, '🚀')
    console.log('  Press CTRL-C to stop\n')
  } catch (err) {
    if (env === PRODUCTION_ENV) {
      const logger = require('./logger')
      logger.captureException(err)
    }
    console.info('Something went wrong')
    console.error(err)
  }
}
