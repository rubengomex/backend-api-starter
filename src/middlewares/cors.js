const cors = require('cors')
const config = require('../configuration')
const allowedOrigins = config.get('CORS_ORIGINS')

exports.initializeCors = () =>
  cors({
    origin: allowedOrigins || '*',
    methods: 'POST,GET,DELETE,PUT,PATCH,OPTIONS',
    allowedHeaders:
      'Host,Origin,Pragma,Referer,User-Agent,Accept,Accept-Encoding,Accept-Language,Cache-Control,Connection,Content-Length,Content-Type,Authorization,X-Requested-With,Access-Control-Request-Headers,Access-Control-Request-Method',
    credentials: true,
    maxAge: 1728000,
    optionsSuccessStatus: 200
  })
