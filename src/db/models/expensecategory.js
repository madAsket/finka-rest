'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ExpenseCategory extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.Project, {foreignKey:"projectId"});
      // this.hasMany(models.ExpenseLimit, {foreignKey:"expenseCategoryId"});
      this.hasMany(models.Expense, {foreignKey:'expenseCategoryId'});
    }
  }
  ExpenseCategory.init({
    name: {
      allowNull: false,
      type: DataTypes.STRING
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
    modelName: 'ExpenseCategory',
    paranoid:true
  });
  return ExpenseCategory;
};
//TODO: index: name/projectId