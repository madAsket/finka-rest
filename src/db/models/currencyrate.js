'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class CurrencyRate extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  CurrencyRate.init({
    toCurrency: {//Project default currency
      type: DataTypes.STRING,
      allowNull:false
    },
    fromCurrency: {
      type: DataTypes.STRING,
      allowNull:false
    },
    rate: {
      type: DataTypes.DECIMAL(20, 10),
      defaultValue:null
    },
  }, {
    sequelize,
    modelName: 'CurrencyRate',
  });
  return CurrencyRate;
};