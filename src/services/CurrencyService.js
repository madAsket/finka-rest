const AbstractService = require("./AbstractService");
const currencyConfig = require("../db/config/currencyConfig")
const {sequelize, CurrencyRate,} = require("../db/models");

class CurrencyService extends AbstractService {

    constructor() {
        super();
        if (CurrencyService.serviceInstance) {
            return CurrencyService.serviceInstance;
        }
        CurrencyService.serviceInstance = this;
    }
    getCurrencyList(){
        let currencyNames = {};
        for(const cType of Object.keys(currencyConfig)){
            Object.assign(currencyNames, currencyConfig[cType]);
        }
        return currencyNames;
    }
    async getProjectCurrencySettings(baseCurrency){
        const rates = await CurrencyRate.findAll({
            where:{
                toCurrency:baseCurrency
            }
        });
        const rateList = {}
        rates.forEach((item)=>{
            rateList[item.fromCurrency] = item.rate;
        });
        return {
            rates:rateList,
            currency:currencyConfig
        };
    }
}

module.exports = new CurrencyService();