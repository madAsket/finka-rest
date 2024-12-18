'use strict';
const {sequelize, CurrencyRate, Storage, Project} = require("../models");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const storages = await Storage.findAll({
      include:[Project]
    });
    for await (const storage of storages){
      if(storage.Project.currency !== storage.currency){
        await CurrencyRate.findOrCreate({
          where: { 
            fromCurrency: storage.currency,
            toCurrency: storage.Project.currency
           },
        })
      }
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
