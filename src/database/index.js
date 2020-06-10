const path = require('path')
const find = require('find')
const Sequelize = require('sequelize')
const config = require('../configuration')
const env = config.get('NODE_ENV')

const { Op } = Sequelize
const operatorsAliases = {
  $eq: Op.eq,
  $ne: Op.ne,
  $gte: Op.gte,
  $gt: Op.gt,
  $lte: Op.lte,
  $lt: Op.lt,
  $not: Op.not,
  $in: Op.in,
  $notIn: Op.notIn,
  $is: Op.is,
  $like: Op.like,
  $notLike: Op.notLike,
  $iLike: Op.iLike,
  $notILike: Op.notILike,
  $regexp: Op.regexp,
  $notRegexp: Op.notRegexp,
  $iRegexp: Op.iRegexp,
  $notIRegexp: Op.notIRegexp,
  $between: Op.between,
  $notBetween: Op.notBetween,
  $overlap: Op.overlap,
  $contains: Op.contains,
  $contained: Op.contained,
  $adjacent: Op.adjacent,
  $strictLeft: Op.strictLeft,
  $strictRight: Op.strictRight,
  $noExtendRight: Op.noExtendRight,
  $noExtendLeft: Op.noExtendLeft,
  $and: Op.and,
  $or: Op.or,
  $any: Op.any,
  $all: Op.all,
  $values: Op.values,
  $col: Op.col
}

// Lazy loading (after require this module and call create this will have the sequelize instance that we will use inside of our entire project)
let sequelize = null
let models = {}

exports.getInstance = () => sequelize

// Creates an instance of sequelize
// After calling this sequelize instance will be cached
// Because imported modulus in node are singletons after first call
exports.create = () => {
  sequelize =
    sequelize ||
    new Sequelize(config.get('SEQUELIZE_DB_NAME'), config.get('SEQUELIZE_DB_USER'), config.get('SEQUELIZE_DB_PASS'), {
      host: config.get('SEQUELIZE_DB_HOST'),
      dialect: config.get('SEQUELIZE_DB_DIALECT'),
      dialectOptions: { connectTimeout: env === 'production' ? 200000 : 60000 },
      port: config.get('SEQUELIZE_DB_PORT'),
      operatorsAliases,
      logging: null,
      benchmark: env !== 'production',
      logQueryParameters: env !== 'production',
      pool: env === 'production' ? { min: 5, max: 120, acquire: 200000, idle: 10000 } : { max: 10 }, // Change to acquire more performance
      retry: {
        match: [
          /SequelizeDatabaseError: terminating connection/,
          /SequelizeDatabaseError: read ECONNRESET/,
          /SequelizeConnectionError/,
          /SequelizeConnectionRefusedError/,
          /SequelizeHostNotFoundError/,
          /SequelizeHostNotReachableError/,
          /SequelizeInvalidConnectionError/,
          /SequelizeConnectionTimedOutError/
        ],
        name: 'query',
        backoffBase: 100,
        backoffExponent: 1.1,
        timeout: env === 'production' ? 200000 : 60000,
        max: 3
      }
    })
  // Loads all connections after creating instance
  this.loadModelsAndRelations()
  return this
}

exports.loadModelsAndRelations = () => {
  const modelPaths = find.fileSync(/model.js$/, path.resolve(__dirname, '..'))
  // Import models to sequelize
  modelPaths.forEach(path => {
    const model = sequelize.import(path)
    models[model.name] = models[model.name] || model
  })

  // Add associations through all models
  Object.keys(models).forEach(modelName => {
    if (models[modelName].associate) {
      models[modelName].associate(models)
    }
  })
}

// Connects to database
exports.connect = async () => {
  await sequelize.authenticate()
}

// Syncs all the new created db models
exports.sync = async () => {
  if (config.get('TO_SYNC')) await sequelize.sync()
}

exports.connectAndSync = async () => {
  await this.connect()
  await this.sync()
}

exports.close = async () => {
  if (!sequelize) return
  await sequelize.close()
}

// Maybe do some seeding when development env
exports.seed = async () => {}

exports.model = key => sequelize.models[key]
