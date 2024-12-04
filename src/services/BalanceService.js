const AbstractService = require("./AbstractService");
const currencyConfig = require("../db/config/currencyConfig")
const {sequelize, CurrencyRate, Expense, Storage, ExpenseCategory, Project, ExpenseLimit} = require("../db/models");
const { Op } = require("sequelize");
const CurrencyService = require("./CurrencyService");

class BalanceService extends AbstractService {

    constructor() {
        super();
        if (BalanceService.serviceInstance) {
            return BalanceService.serviceInstance;
        }
        BalanceService.serviceInstance = this;
    }
    async getProjectBalance(projectId){
        const {totalLimit, totalSpent, project, rates} = await this.getMonthExpenseCategories(projectId);
        let totalBalance = 0.0;
        const storages = await Storage.findAll({
            where:{
                projectId:projectId,
                balance:{
                    [Op.gt]:0
                }
            }
        });
        storages.forEach((storage)=>{
            if(project.currency === storage.currency){
      
                totalBalance += Number(storage.balance)
            }else{
                const rate = rates[storage.currency];
                if(rate){
                    totalBalance += (storage.balance * rate);
                }
            }
        });
        return {totalLimit, totalSpent, totalBalance};
    }
    async getMonthExpenseCategories(projectId){
        const date = new Date();
        const startDate = new Date(date.getFullYear(), date.getMonth(), 1);
        const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        let categories = await ExpenseCategory.findAll({
            where: {
                projectId: projectId
            },
            order: [ [ 'createdAt', 'DESC' ]],
            include:[{
                model:Expense,
                required: false,
                include:[Storage],
                where:{
                    expensedAt: {
                        [Op.between]: [startDate, endDate] 
                    }
                }
            }]
        });
        const project = await Project.findOne({
            where:{
                id:projectId
            }
        });
        const baseCurrency = project.currency;
        const {rates} = await CurrencyService.getProjectCurrencySettings(baseCurrency);
        let result = [];
        let totalSpent = 0.0;
        let totalLimit = 0.0;
        for await (let cat of categories){
            let limit = await ExpenseLimit.findOne({
                where:{
                    expenseCategoryId:cat.id,
                    projectId:projectId,
                    month:date.getMonth()+1,
                    year:date.getFullYear()
                } 
            });
            if(!limit){
                const lastLimits = await ExpenseLimit.findAll({
                    limit: 1,
                    where:{
                        expenseCategoryId:cat.id,
                        projectId:projectId,
                        year:{
                            [Op.lte]:date.getFullYear()
                        },
                    },
                    order: [ [ 'createdAt', 'DESC' ]],
                });
                console.log(lastLimits);
                limit = await ExpenseLimit.create({
                    expenseCategoryId:cat.id,
                    projectId:projectId,
                    month:date.getMonth()+1,
                    year:date.getFullYear(),
                    limit:lastLimits.length > 0 ? lastLimits[0].limit : 0
                });
            }
            const expenses = cat.Expenses;
            let spent = 0.0;
            expenses.forEach((item)=>{
                const amount = Number(item.amount);
                const expenseCurrency = item.Storage.currency;
                if(expenseCurrency === baseCurrency){
                    spent += amount;
                }else{
                    const rate = rates[expenseCurrency];
                    if(rate){
                        spent += (amount * rate);
                    }
                }
            });
            cat = cat.toJSON()
            cat.limit = limit;
            cat.spent = spent;
            totalSpent += spent;
            totalLimit += Number(limit.limit);
            result.push(cat);
        }
        return {categories:result, totalLimit, totalSpent, project, rates};
    }
}

module.exports = new BalanceService();