const Sequelize = require('sequelize')

const Schema = { connection: Sequelize.STRING }

// Associations
const associate = Sockets => models => {
  // Associations 1:1 ( Fk on left)
  Sockets.belongsTo(models.user)
}

// Static methods
const onConnect = Sockets => async (conn, userId) => {
  const connection = await Sockets.findOne({ where: { userId, connection: conn } })
  if (connection) return connection

  return Sockets.create({ userId, connection: conn })
}

const onDisconnect = Sockets => async (conn, userId) => {
  const connection = await Sockets.findOne({ where: { userId, connection: conn } })
  if (!connection) return

  await connection.destroy()
}

const resolve = Sockets => userId => Sockets.findAll({ attributes: ['connection'], where: { userId } })

module.exports = sequelize => {
  const Sockets = sequelize.define('sockets', Schema)
  // Associations
  Sockets.associate = associate(Sockets)
  // Static methods
  Sockets.onConnect = onConnect(Sockets)
  Sockets.onDisconnect = onDisconnect(Sockets)
  Sockets.resolve = resolve(Sockets)

  return Sockets
}
