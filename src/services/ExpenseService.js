const AbstractService = require("./AbstractService");
const {sequelize, Expense, Storage, ExpenseCategory, User, ExpenseLimit} = require("../db/models");
const { Op } = require("sequelize");
const AppError = require("../utils/appError");

class ExpenseService extends AbstractService {
    constructor() {
        super();
    }
    async getExpensesInCategories(projectId){
        const date = new Date();
        const startDate = new Date(date.getFullYear(), date.getMonth(), 1);
        const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        return await ExpenseCategory.findAll({
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
    }
    async addExpenseCategory(projectId, name, limit){
        const t = await sequelize.transaction();
        let expenseCategory;
        let expenseLimit;
        try {
            expenseCategory = await ExpenseCategory.create(
                {
                    projectId: projectId,
                    name: name
                },
                { transaction: t },
            );
            const date = new Date();
            expenseLimit = await ExpenseLimit.create(
                {
                    projectId: projectId,
                    expenseCategoryId:expenseCategory.id,
                    limit:limit || 0,
                    month:date.getMonth()+1,
                    year:date.getFullYear()
                },
                { transaction: t },
            );
            await t.commit();
        } catch (error) {
            console.log(error);
            await t.rollback();
            throw new AppError(error.message, 401)
        }
        let result = expenseCategory.toJSON();
        result.limit = expenseLimit;
        return result;
    }
    async addExpense(projectId, description, amount, spender, category, storage, expensedAt){
        const selectedStorage = await Storage.findOne({
            where:{
                id:storage,
                projectId:projectId
            }
        });
        if(!selectedStorage){
            throw new AppError("Storage not found", 401, {
                storage:"Storage not found"
            });
        }
        if(selectedStorage.balance < amount){
            throw new AppError("Storage has issufficient balance", 401, {
                storage:"Storage has insufficient balance"
            });
        }
        const t = await sequelize.transaction();
        let expense;
        try {
            expense = await Expense.create(
                {
                    projectId: projectId,
                    description:description,
                    amount:amount,
                    spenderId:spender,
                    expenseCategoryId:category,
                    storageId:storage,
                    expensedAt:expensedAt,
                },
                { transaction: t },
            );
            const date = new Date(expensedAt);
            await ExpenseLimit.findOrCreate(
                {
                    where:{
                        projectId: projectId,
                        expenseCategoryId:category,
                        month:date.getMonth()+1,
                        year:date.getFullYear()
                    },
                    transaction: t
                },
            );
            await selectedStorage.increment('balance', 
                { by: -expense.amount }, 
                { transaction: t });
            await t.commit();
        } catch (error) {
            console.log(error);
            await t.rollback();
            throw new AppError(error.message, 401)
        }
        return await Expense.findOne({
            where:{
                id:expense.id
            },
            include:[
                {
                    model:Storage
                },
                {
                    model:ExpenseCategory
                },
                {
                    model:User
                }
            ]
        })
    }
    async getCurrentMonthExpenses(projectId){
        const date = new Date();//TODO get from query
        const startDate = new Date(date.getFullYear(), date.getMonth(), 1);
        const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        return await this.getMonthExpenses(projectId, startDate, endDate);
    }
    async getMonthExpenses(projectId, startDate, endDate){
        return await Expense.findAll({
            where:{
                projectId: projectId,
                expensedAt: {
                    [Op.between]: [startDate, endDate],     
                }
            },
            include:[
                {
                    model:Storage
                },
                {
                    model:ExpenseCategory
                },
                {
                    model:User
                }
            ]
        });
    }
    async updateExpense(projectId, expenseId, description, spender, category, expensedAt){
        const t = await sequelize.transaction();
        try {
            const expense = await Expense.update(
                {
                    description:description,
                    spenderId:spender,
                    expenseCategoryId:category,
                    expensedAt:expensedAt,
                },
                {
                    where:{
                        id:expenseId,
                        projectId:projectId
                    }
                },
                { transaction: t },
            );
            if(!expense){
                throw new AppError("Expense not found", 400);
            }
            const date = new Date(expensedAt);
            await ExpenseLimit.findOrCreate(
                {
                    where:{
                        projectId: projectId,
                        expenseCategoryId:category,
                        month:date.getMonth()+1,
                        year:date.getFullYear()
                    },
                    transaction: t
                },
            );
            await t.commit();
        } catch (error) {
            console.log(error);
            await t.rollback();
            throw new AppError(error.message, 401)
        }
        return await Expense.findOne({
            where:{
                id:expenseId,
                projectId:projectId
            },
            include:[
                {
                    model:Storage
                },
                {
                    model:ExpenseCategory
                },
                {
                    model:User
                }
            ]
        })
    }

    async updateExpenseCategory(projectId, catId, name, limit){
        const t = await sequelize.transaction();
        try {
            const cat = await ExpenseCategory.update(
                {
                    name:name,
                },
                {
                    where:{
                        id:catId,
                        projectId:projectId
                    }
                },
                { transaction: t },
            );
            if(!cat){
                throw new AppError("Category not found", 400);
            }
            const date = new Date();
            await ExpenseLimit.update(
                {
                    limit:limit
                },
                {
                    where:{
                        projectId: projectId,
                        expenseCategoryId:catId,
                        month:date.getMonth()+1,
                        year:date.getFullYear()
                    },
                },
                {transaction: t}
            );
            await t.commit();
        } catch (error) {
            console.log(error);
            await t.rollback();
            throw new AppError(error.message, 401)
        }
        //TODO refactor with update;
        const category = await ExpenseCategory.findOne({
            where:{
                id:catId
            }
        });
        let result = category.toJSON();
        const date = new Date();
        const expLimit = await ExpenseLimit.findOne({
            where:{
                projectId: projectId,
                expenseCategoryId:catId,
                month:date.getMonth()+1,
                year:date.getFullYear()
            }
        });
        result.limit = expLimit;
        return result;
    }
    async deleteExpense(projectId, expenseId){
        const t = await sequelize.transaction();
        try {
            const expense = await Expense.findOne({
                where:{
                    id:expenseId,
                    projectId:projectId
                },
                include:[Storage]
            },{transaction:t});
            await expense.Storage.increment('balance', 
                { by: expense.amount }, 
                { transaction: t });
            await expense.destroy({ transaction: t });
            await t.commit();
        } catch (error) {
            await t.rollback();
            throw new AppError(error.message, 401);
        }
        return true;
    }
}

module.exports = new ExpenseService();