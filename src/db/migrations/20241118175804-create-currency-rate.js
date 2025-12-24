'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('CurrencyRates', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      toCurrency: {
        type: Sequelize.STRING,
        allowNull:false
      },
      fromCurrency: {
        type: Sequelize.STRING,
        allowNull:false
      },
      rate: {
        type: Sequelize.DECIMAL(20, 10),
        defaultValue:null
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('CurrencyRates');
  }
};