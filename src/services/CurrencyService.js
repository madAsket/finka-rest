const AbstractService = require("./AbstractService");
const currencyConfig = require("../db/config/currencyConfig")
const {sequelize, CurrencyRate,} = require("../db/models");

class CurrencyService extends AbstractService {
    constructor() {
        super();
    }
    getCurrencyList(){
        let currencyNames = {};
        for(const cType of Object.keys(currencyConfig)){
            Object.assign(currencyNames, currencyConfig[cType]);
        }
        return currencyNames;
    }
    wrapRates(rates){
        const rateList = {};
        rates.forEach((item)=>{
            rateList[item.fromCurrency] = item.rate;
        });
        return rateList;
    }
    async getCurrencyForPair(fromCurrency, toCurrency){
        return await CurrencyRate.findOne({
            where:{
                fromCurrency:fromCurrency,
                toCurrency:toCurrency
            }
        });
    }
    async getProjectCurrencySettings(baseCurrency){
        const rates = await CurrencyRate.findAll({
            where:{
                toCurrency:baseCurrency
            }
        });
        return {
            rates:this.wrapRates(rates),
            currency:currencyConfig
        };
    }
}

module.exports = new CurrencyService();