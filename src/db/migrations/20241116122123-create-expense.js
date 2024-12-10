'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Expenses', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      amount: {
        type: Sequelize.DECIMAL(20, 10),
        allowNull:false,
        defaultValue:0.0000000000
      },
      description: {
        type: Sequelize.STRING,
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
      storageId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Storages',
          key: 'id',
        },
      },
      spenderId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        },
      },
      expensedAt: {
        allowNull: false,
        type: Sequelize.DATE
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
    await queryInterface.dropTable('Expenses');
  }
};