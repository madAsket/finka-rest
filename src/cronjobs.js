const cron = require('node-cron');
const { CurrencyRate } = require('./db/models');
const { Op } = require("sequelize");
const { Client } = require('@coingate/coingate-sdk');
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
          } catch(error) {
                console.error(error);
          }
    }
}

const runCronJobs = ()=>{
    console.log("CRONJOB RUNNING");
    cron.schedule(process.env.TASK_CURRENCY_UPDATE_FREQ, async () => {
        await updateCurrencyRates();
    });
}

module.exports = runCronJobs;