'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Deposit extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
        this.belongsTo(models.Project, {foreignKey:"projectId"});
        this.belongsTo(models.User, {foreignKey:"userId"});
        this.belongsTo(models.Storage, {foreignKey:"storageId"});
    }
  }
  Deposit.init({
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
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'User',
        key: 'id',
      },
    },
    amount:{
      type: DataTypes.DECIMAL(20, 10),
      allowNull:false,
      defaultValue:0.0000000000
    },
    depositedAt: {
      allowNull: false,
      type: DataTypes.DATE
    },
    createdAt: {
      allowNull: false,
      type: DataTypes.DATE
    },
  }, {
    sequelize,
    modelName: 'Deposit',
    paranoid:true
  });
  return Deposit;
};