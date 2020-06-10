const Sequelize = require('sequelize')

const Schema = { description: { type: Sequelize.STRING, allowNull: true } }

// Associations
const associate = UserTypes => models => {
  // Associations 1: m ( Fk on right)
  UserTypes.hasMany(models.user)
}

module.exports = sequelize => {
  const Roles = sequelize.define('roles', Schema)
  // Associations
  Roles.associate = associate(Roles)

  return Roles
}
