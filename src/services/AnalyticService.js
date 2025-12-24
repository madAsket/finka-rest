const AbstractService = require("./AbstractService");
const {sequelize, Expense} = require("../db/models");
const { Op } = require("sequelize");
const CurrencyService = require("./CurrencyService");
const ExpenseService = require("./ExpenseService");
const BalanceService = require("./BalanceService");
const { median } = require("../utils/mathFunctions");

class AnalyticService extends AbstractService {

    async getSummmarizedExpenseStatistic(projectId, startDate, endDate){
        let avgExpense = 0;
        let medianExpense = 0;
        let maxExpense = 0;
        const expensesInCategoires = await ExpenseService.getExpensesInCategories(projectId, startDate, endDate);
        const {categories, totalLimit, expenses, totalSpent} = await BalanceService.getMonthBalanceData(projectId, 
            expensesInCategoires, startDate);
        if(expenses.length){
            avgExpense = totalSpent / expenses.length;
            medianExpense = median(expenses);
            maxExpense = Math.max(...expenses);
        }
        return {
            stat:{
                totalSpent,
                totalLimit,
                avgExpense,
                medianExpense,
                maxExpense
            },
            categories
        }
    }
}

module.exports = new AnalyticService();