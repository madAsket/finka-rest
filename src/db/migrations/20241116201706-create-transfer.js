'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Transfers', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      transferredAmount: {
        type: Sequelize.DECIMAL(20, 10),
        allowNull:false,
        defaultValue:0.0000000000
      },
      receivedAmount: {
        type: Sequelize.DECIMAL(20, 10),
        allowNull:false,
        defaultValue:0.0000000000
      },
      fromStorageId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Storages',
          key: 'id',
        },
      },
      toStorageId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Storages',
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
      transferrerId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        },
      },
      currencyRate: {
        type: Sequelize.DECIMAL(20, 10),
        allowNull:false,
        defaultValue:0.0000000000
      },
      transferredAt: {
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
    await queryInterface.dropTable('Transfers');
  }
};