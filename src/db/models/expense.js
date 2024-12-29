'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Expense extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.Project, {foreignKey:"projectId"});
      this.belongsTo(models.Storage, {foreignKey:"storageId"});
      this.belongsTo(models.User, {foreignKey:"spenderId"});
      this.belongsTo(models.ExpenseCategory, {foreignKey:"expenseCategoryId"});
    }
  }
  Expense.init({
    amount: {
      type: DataTypes.DECIMAL(20, 10),
      allowNull:false,
      defaultValue:0.0000000000
    },
    projectCurrencyAmount: {
      type: DataTypes.DECIMAL(20, 10),
      allowNull:false,
      defaultValue:0.0000000000
    },
    description: {
      type: DataTypes.STRING,
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
    storageId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Storage',
        key: 'id',
      },
    },
    spenderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'User',
        key: 'id',
      },
    },
    expensedAt: {
      allowNull: false,
      type: DataTypes.DATE
    },
  }, {
    sequelize,
    modelName: 'Expense',
    paranoid:true,
    indexes: [
      {
        fields: ['projectId'],
      },
      {
        fields:['projectId','expenseCategoryId', 'expensedAt']
      },
      {
        fields:['storageId']
      }
    ]
  });
  return Expense;
};