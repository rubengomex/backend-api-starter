const Sequelize = require('sequelize')
const bcrypt = require('bcrypt')
const crypto = require('crypto')
const db = require('../../database')
const config = require('../../configuration')
const { ForbiddenError, NotFoundError } = require('../../utils/errors')
const { getCache, setCache } = require('../../services/cache')
const SALT_ROUNDS = 10

const Schema = {
  uuid: { type: Sequelize.STRING, unique: true },
  email: { type: Sequelize.STRING, unique: true, isLowerCase: true },
  publicEmail: { type: Sequelize.STRING, unique: true },
  password: Sequelize.STRING,
  firstName: Sequelize.STRING,
  lastName: Sequelize.STRING,
  stripe_id: Sequelize.STRING,
  stripe_subscription_id: Sequelize.STRING,
  subscription_cancelled: Sequelize.BOOLEAN,
  gender: Sequelize.INTEGER,
  phone: Sequelize.TEXT,
  city: Sequelize.STRING,
  postal: Sequelize.STRING,
  address: Sequelize.TEXT,
  lat: Sequelize.FLOAT,
  lng: Sequelize.FLOAT,
  picture: { type: Sequelize.STRING, defaultValue: '' },
  facebook: Sequelize.STRING,
  google: Sequelize.STRING,
  twitter: Sequelize.STRING,
  blocked: { type: Sequelize.BOOLEAN, defaultValue: false },
  verified: { type: Sequelize.BOOLEAN, defaultValue: false },
  // 0 = offline, 1 = away, 2 = busy, 3 = online
  status: { type: Sequelize.INTEGER, defaultValue: 0 },
  lastOpenRoom: { type: Sequelize.INTEGER, defaultValue: 0 },
  showEmail: { type: Sequelize.BOOLEAN, defaultValue: false },
  firstTime: { type: Sequelize.BOOLEAN, defaultValue: true },
  deleted: { type: Sequelize.BOOLEAN, defaultValue: false },
  isSubscribed: { type: Sequelize.BOOLEAN, defaultValue: true },
  last_online_at: { type: Sequelize.TIME, allowNull: true }
}

const associate = User => models => {
  // Associations 1:1, Fk on left
  User.belongsTo(models.roles, { onDelete: 'CASCADE', foreignKey: { allowNull: false } })
  User.belongsTo(models.countries, { onDelete: 'CASCADE', foreignKey: { allowNull: false } })
  User.hasMany(models.chat)
  User.hasMany(models.chatMessages)
  User.hasMany(models.sockets)
}

// Instance methods
const comparePassword = async function (password) {
  const match = await bcrypt.compare(password, this.password)
  return match
}

// Hooks
const beforeCreate = async user => {
  if (user.userTypeId <= 2) throw new ForbiddenError('Not allowed!')
  const salt = bcrypt.genSaltSync(SALT_ROUNDS)
  if (user.password) {
    const hash = await bcrypt.hash(user.password, salt)
    user.password = hash
  }

  if (user.branding) {
    user.uuid =
      user.branding
        .toLowerCase()
        .replace(/[^\w ]+/g, '')
        .replace(/ +/g, '-') +
      '_' +
      crypto.randomBytes(2).toString('hex')
  }
}

const beforeUpdate = async user => {
  if (!user.changed('password')) return
  const salt = bcrypt.genSaltSync(SALT_ROUNDS)
  const hash = await bcrypt.hash(user.password, salt)
  user.password = hash
}

// Static methods
const getShort = User => async id => {
  const attributes = ['id', 'email', 'stripe_id', 'status', 'lastOpenRoom']
  const user = await User.findOne({ attributes, where: { id } })
  return user
}

const getShortByEmail = User => async email => {
  const attributes = [
    'uuid',
    'id',
    'email',
    'stripe_id',
    'stripe_subscription_id',
    'subscription_cancelled',
    'isSubscribed'
  ]
  const user = await User.findOne({ attributes, where: { email } })
  return user
}

const setOnline = User => id => User.update({ status: 3 }, { where: { id } })
const getUUID = User => id => User.findOne({ attributes: ['uuid'], where: { id } })
const setOffline = User => async id => {
  const user = await User.findOne({ where: { id } })
  user.status = 0

  return user.save()
}

const updateProfileUrl = User => async ({ uuid, id }) => {
  const profile = await User.findOne({ where: { uuid } })
  if (!profile) throw new NotFoundError('This profile URL is not available!')
  const user = await User.findOne({ where: { id } })
  const meta = await db.model('pageMeta').findOne({ where: { url: { $like: '%' + user.uuid } } })

  user.uuid = uuid
  await user.save()

  if (!meta) return
  meta.url = '/profile/' + user.uuid
  await meta.save()
}

const getRights = User => ({ user: id }) => User.findOne({ attributes: ['roleId'], where: { id } })

const ORDERS_AVAILABLE = {
  updated: ['updatedAt', 'DESC'],
  oldest: ['createdAt', 'ASC'],
  newest: ['createdAt', 'DESC'],
  online: ['status', 'DESC']
}

// Find public
const getPublic = User => uuid => {
  const options = {
    attributes: [
      'uuid',
      'id',
      'picture',
      'status',
      'description',
      'countryId',
      'firstName',
      'address',
      'lastName',
      'rating',
      'lat',
      'lng',
      'phone',
      'website',
      'roleId',
      'createdAt',
      'updatedAt',
      'isSubscribed'
    ],
    where: { uuid },
    include: [{ model: db.model('countries') }]
  }

  return User.findOne(options)
}

// Fetch user
const fetch = User => uuid => {
  const options = {
    attributes: [
      'id',
      'status',
      'picture',
      'email',
      'publicEmail',
      'description',
      'firstName',
      'address',
      'lastName',
      'rating',
      'uuid',
      'lat',
      'lng',
      'phone',
      'website',
      'roleId',
      'lastOpenRoom',
      'createdAt',
      'updatedAt',
      'isSubscribed'
    ],
    where: { id: uuid },
    include: [{ model: db.model('countries') }]
  }

  return User.findOne(options)
}

module.exports = sequelize => {
  const User = sequelize.define('user', Schema)
  // Associations
  User.associate = associate(User)
  // Instance methods
  User.prototype.comparePassword = comparePassword
  // Hooks
  User.beforeCreate(beforeCreate)
  User.beforeUpdate(beforeUpdate)
  // Static methods
  User.getShort = getShort(User)
  User.getShortByEmail = getShortByEmail(User)
  User.setOnline = setOnline(User)
  User.getUUID = getUUID(User)
  User.setOffline = setOffline(User)
  User.updateProfileUrl = updateProfileUrl(User)
  User.getRights = getRights(User)
  User.getPublic = getPublic(User)
  User.fetch = fetch(User)

  return User
}
