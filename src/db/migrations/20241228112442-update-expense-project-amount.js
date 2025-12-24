'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.addColumn(
          'Expenses',
          'projectCurrencyAmount',
          {
            type: Sequelize.DECIMAL(20, 10),
            allowNull:false,
            defaultValue:0.0000000000
          },
          { transaction: t },
        ),
      ]);
    });
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  }
};
