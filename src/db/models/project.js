'use strict';
const {Model, DataTypes} = require('sequelize');
const sequelize = require("../../db/config/database")

module.exports = sequelize.define('project',{
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER
  },
  name: {
    type: DataTypes.STRING,
    allowNull:false,
    validate:{
      notNull:{
        msg: 'Project name cannot be null'
      },
      notEmpty:{
        msg:"Project name cannot be empty"
      }
    }
  },
  isCurrent:{
    type: DataTypes.BOOLEAN,
    allowNull:false,
    defaultValue:false
  },
  currency:{
    type: DataTypes.STRING,
    allowNull:false,
    defaultValue:"EUR"
  },
  owner:{
    type:DataTypes.INTEGER,
    allowNull:false,
    references:{
      model:'user',
      key:"id"
    }
  },
  createdAt: {
    allowNull: false,
    type: DataTypes.DATE
  },
  updatedAt: {
    allowNull: false,
    type: DataTypes.DATE
  },
  deletedAt: {
    type: DataTypes.DATE
  }
},{
  freezeTableName:true,
  modelName:'project',
  paranoid:true
});