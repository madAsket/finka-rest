'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ExpenseLimits', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      limit:{
        type: Sequelize.DECIMAL(20, 10),
        allowNull:false,
        defaultValue:0.0000000000
      },
      spent:{
        type: Sequelize.DECIMAL(20, 10),
        allowNull:false,
        defaultValue:0.0000000000
      },
      year: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      month: {
        allowNull: false,
        validate: {
          min:1,
          max:12,
        },
        type: Sequelize.INTEGER
      },
      expenseCategoryId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'ExpenseCategories',
          key: 'id',
        },
      },
      projectId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Projects',
          key: 'id',
        },
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      deletedAt: {
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('ExpenseLimits');
  }
};