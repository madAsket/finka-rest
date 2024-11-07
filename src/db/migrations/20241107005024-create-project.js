'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('project', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING,
        allowNull:false,
      },
      isCurrent:{
        type: Sequelize.BOOLEAN,
        allowNull:false,
        defaultValue:false
      },
      currency:{
        type: Sequelize.STRING,
        allowNull:false,
        defaultValue:"EUR"
      },
      owner:{
        type:Sequelize.INTEGER,
        allowNull:false,
        references:{
          model:'user',
          key:"id"
        }
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
    await queryInterface.dropTable('project');
  }
};