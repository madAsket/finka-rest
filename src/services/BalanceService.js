const AbstractService = require("./AbstractService");
const {sequelize, Storage, Project, ExpenseLimit} = require("../db/models");
const { Op, Sequelize } = require("sequelize");
const CurrencyService = require("./CurrencyService");

class BalanceService extends AbstractService {
    constructor() {
        super();
    }
    async getProjectBalance(projectId, categories){
        const {totalLimit, totalSpent, project, rates} = await this.getMonthBalanceData(projectId, categories, new Date());
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
    async getMonthBalanceData(projectId, categories, date){
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
        let expenseList = [];
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
                const amount = Number(item.projectCurrencyAmount);
                expenseList.push(amount);
                spent += (amount);
            });
            cat = cat.toJSON();
            cat.limit = limit;
            cat.spent = spent;
            totalSpent += spent;
            totalLimit += Number(limit.limit);
            result.push(cat);
        }
        return {categories:result, expenses:expenseList, totalLimit, totalSpent, project, rates};
    }
}

module.exports = new BalanceService();