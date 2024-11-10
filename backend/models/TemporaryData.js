// models/TemporaryData.js

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TemporaryData = sequelize.define('TemporaryData', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  data: {
    type: DataTypes.JSON,
    allowNull: false,
  },
  expirationDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
}, {
  tableName: 'TemporaryData',
  timestamps: false,
});

module.exports = TemporaryData;
