'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ExpenseLimit extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.ExpenseCategory, {foreignKey:"expenseCategoryId"});
    }
  }
  ExpenseLimit.init({
    limit:{
      type: DataTypes.DECIMAL(20, 10),
      allowNull:false,
      defaultValue:0.0000000000
    },
    spent:{
      type: DataTypes.DECIMAL(20, 10),
      allowNull:false,
      defaultValue:0.0000000000
    },
    year: {
      allowNull: false,
      type: DataTypes.INTEGER
    },
    month: {
      allowNull: false,
      validate: {
        min:1,
        max:12,
      },
      type: DataTypes.INTEGER
    },
    expenseCategoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'ExpenseCategory',
        key: 'id',
      },
    },
    projectId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Project',
        key: 'id',
      },
    },
  }, {
    sequelize,
    modelName: 'ExpenseLimit',
    paranoid:true,
    indexes: [
      {
        fields: ['projectId'],
      },
      {
        fields: ['projectId','year','month'],
      },
      {
        fields:['expenseCategoryId']
      },
      {
        fields:['expenseCategoryId','projectId']
      }
    ]
  });
  return ExpenseLimit;
};