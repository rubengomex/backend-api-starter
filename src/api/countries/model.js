const Sequelize = require('sequelize')

const Schema = {
  name: Sequelize.STRING,
  code: Sequelize.STRING(10)
}

// Associations
const associate = Countries => models => {
  // Associations 1:m ( Fk on right)
  Countries.hasMany(models.user)
}

module.exports = sequelize => {
  const Countries = sequelize.define('countries', Schema)
  // Associations
  Countries.associate = associate(Countries)

  return Countries
}
