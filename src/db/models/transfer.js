'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Transfer extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.Storage, {foreignKey:"fromStorageId", as:"fromStorage"});
      this.belongsTo(models.Storage, {foreignKey:"toStorageId", as:"toStorage"});
      this.belongsTo(models.User, {foreignKey:"transferrerId"});
    }
  }
  Transfer.init({
    transferredAmount: {
      type: DataTypes.DECIMAL(20, 10),
      allowNull:false,
      defaultValue:0.0000000000
    },
    receivedAmount: {
      type: DataTypes.DECIMAL(20, 10),
      allowNull:false,
      defaultValue:0.0000000000
    },
    fromStorageId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Storage',
        key: 'id',
      },
    },
    toStorageId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Storage',
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
    transferrerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'User',
        key: 'id',
      },
    },
    currencyRate: {
      type: DataTypes.DECIMAL(20, 10),
      allowNull:false,
      defaultValue:0.0000000000
    },
    transferredAt: {
      allowNull: false,
      type: DataTypes.DATE
    },
  }, {
    sequelize,
    modelName: 'Transfer',
    paranoid:true,
    indexes: [
      {
        fields: ['fromStorageId', 'toStorageId'],
      },
      {
        fields:['projectId']
      },
      {
        fields:['transferrerId']
      },
      {
        fields:['transferredAt']
      }
    ]
  });
  return Transfer;
};