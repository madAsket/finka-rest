'use strict';
const {sequelize, Expense, Storage, Project} = require("../models");
const { Op } = require("sequelize");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const expensesToUpdate = await Expense.findAll({
      where:{
          projectCurrencyAmount:0
      },
      include:[
          {
              model:Project
          },
          {
              model:Storage,
              where:{
                  currency:{
                      [Op.eq]:{
                          [Op.col]: 'Project.currency'
                      }
                  }
              }
          },
      ]
    });
    for await(const item of expensesToUpdate){
          const amount = Number(item.amount);
          item.projectCurrencyAmount = (amount);
          await item.save();
      }
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  }
};
