const { DataTypes } = require('sequelize');
const sequelize = require('./database'); // arquivo database.js

const Usuario = sequelize.define('Usuario', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nome: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  senha: { type: DataTypes.STRING, allowNull: true }, // null se login Google
  foto: { type: DataTypes.STRING, allowNull: true },
  role: { type: DataTypes.STRING, defaultValue: 'cliente' }
}, {
  timestamps: true,
  tableName: 'usuarios'
});

module.exports = Usuario;
