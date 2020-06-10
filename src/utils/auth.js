const jwt = require('jsonwebtoken')
const config = require('../configuration')

exports.generateJWT = ({ password, ...others }) =>
  new Promise((resolve, reject) => {
    jwt.sign(others, config.get('JWT_SECRET'), { expiresIn: '7d' }, (err, token) =>
      err ? reject(err) : resolve(token)
    )
  })

exports.validateJWT = token =>
  new Promise((resolve, reject) => {
    jwt.verify(token, config.get('JWT_SECRET'), (err, decodedToken) => (err ? reject(err) : resolve(decodedToken)))
  })
