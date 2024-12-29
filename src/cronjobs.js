const cron = require('node-cron');
const { CurrencyRate, Expense, Storage, Project } = require('./db/models');
const { Op } = require("sequelize");
const { Client } = require('@coingate/coingate-sdk');
const CurrencyService = require('./services/CurrencyService');
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env';
require('dotenv').config({path: `${process.cwd()}/${envFile}`});


async function updateCurrencyRates(){
    const exchangeRateClient = new Client();
    const date = new Date();
    date.setHours(date.getHours() - process.env.CURRENCY_UPDATE_DELAY_HOURS);
    const rates = await CurrencyRate.findAll({
        where:{
            [Op.or]:[
                {
                    rate:null
                },
                {
                    updatedAt:{
                        [Op.lte]:date
                    }
                }
            ]
        }
    });
    for await(const rate of rates){
        try {
            const exchangeRate = await exchangeRateClient.public.getExchangeRate({
              from: rate.fromCurrency,
              to: rate.toCurrency
            });
            rate.rate = exchangeRate;
            await rate.save();
            rateList[rate.fromCurrency] = rate.rate;
          } catch(error) {
                console.error(error);
          }
    }
}


async function updateExpenses(){
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
                        [Op.not]:{
                            [Op.col]: 'Project.currency'
                        }
                    }
                }
            },
        ]
    });
    for await(const item of expensesToUpdate){
        const rate = await CurrencyService.getCurrencyForPair(item.Storage.currency, item.Project.currency);
        if(rate){
            const amount = Number(item.amount);
            item.projectCurrencyAmount = (amount * rate.rate);
            await item.save();
        }
    }
}

const runCronJobs = ()=>{
    console.log("CRONJOB RUNNING");
    cron.schedule(process.env.TASK_CURRENCY_UPDATE_FREQ, async () => {
        await updateCurrencyRates();
        await updateExpenses();
    });
}

module.exports = runCronJobs;