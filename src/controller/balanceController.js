const {sequelize, 
    Project, 
    User, 
    UserProjects, 
    Storage, 
    Deposit, 
    ExpenseCategory, ExpenseLimit, Expense,
    Transfer} = require("../db/models");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync")
const { Op } = require("sequelize");
const CurrencyService = require("../services/CurrencyService");
const BalanceService = require("../services/BalanceService");

const addStorage = catchAsync(async (req,res,next)=>{
    const {name, currency, balance} = req.body;
    const projectId = req.params.id;
    const userHasProject = await UserProjects.findOne({
        where:{
            userId:req.user.id,
            projectId:projectId
        }
    })
    if(!userHasProject){
        throw new AppError("Project not found", 400);
    }
    if(!CurrencyService.getCurrencyList()[currency]){
        throw new AppError("Project not found", 400,{
            currency:"Currency is not valid"
        });
    }
    let storage = await Storage.create({
        projectId:projectId,
        name:name,
        currency:currency
    });
    if(balance){
        const t = await sequelize.transaction();
        try {
            const deposit = await Deposit.create(
                {
                    projectId: projectId,
                    storageId: storage.id,
                    amount:balance,
                    userId:req.user.id,
                    depositedAt:new Date(),
                },
                { transaction: t },
            );
            storage = await storage.increment('balance', 
                { by: deposit.amount }, 
                { transaction: t });
            await t.commit();
        } catch (error) {
            console.log(error);
            await t.rollback();
        }
    }   
    return res.status(201).json({
        status:"success",
        data:storage.toJSON()
    });
});

const getAllStorages = catchAsync(async (req,res, next)=>{
    const noEmptyCondition = req.query.noempty ? {[Op.gt]: 0} : {[Op.gte]: 0}; //FIX problem with balance below zero;
    const result = await Storage.findAll({
        where: {
            projectId: req.params.id,
            balance:noEmptyCondition
        },
        order:[['updatedAt', "DESC"]]
    });
    return res.status(201).json({
        status:"success",
        data:result
    })
});

const addDeposit = catchAsync(async(req, res, next)=>{
    const {storage, amount, author, depositedAt} = req.body;
    const projectId = req.params.id;
    const t = await sequelize.transaction();
    let deposit = null;
    try {
        let storageItem = await Storage.findOne({
            where:{
                id:storage,
                projectId:projectId
            }
        }, { transaction: t });
        deposit = await Deposit.create(
            {
                projectId: projectId,
                storageId: storage,
                amount:amount,
                userId:author,
                depositedAt:depositedAt
            },
            { transaction: t },
        );
        storageItem = await storageItem.increment('balance', 
            { by: deposit.amount }, 
            { transaction: t });

        await t.commit();
    } catch (error) {
        console.log(error);
        await t.rollback();
        throw new AppError(error.message, 401)
    }
    const result = await Deposit.findOne({
        where: {
            id:deposit.id
        },
        include: [
            {
                model: Storage,
            },
            {
                model: User,
                attributes: { exclude: ['password'] },
            },
        ]
    });
    return res.status(201).json({
        status:"success",
        data:result
    })
});

const getAllDeposits = catchAsync(async (req,res, next)=>{
    const result = await Deposit.findAll({
        where: {
            projectId: req.params.id
        },
        include: [
            {
                model: Storage,
            },
            {
                model: User,
                attributes: { exclude: ['password'] },
            },
        ],
        order: [['depositedAt', 'DESC']],
    });
    return res.status(201).json({
        status:"success",
        data:result
    })
});

const addExpenseCategory = catchAsync(async (req, res, next)=>{
    const {name, limit} = req.body;
    const projectId = req.params.id;
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
    return res.status(201).json({
        status:"success",
        data:result
    })
});

const getMonthsExpenseCategories = catchAsync(async (req,res, next)=>{
    const {categories} = await BalanceService.getMonthExpenseCategories(req.params.id);
    return res.status(201).json({
        status:"success",
        data:categories
    })
});


const addExpense = catchAsync(async (req, res, next)=>{
    const {description, amount, spender, category, storage, expensedAt} = req.body;
    const projectId = req.params.id;
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
        const [limit, created] = await ExpenseLimit.findOrCreate(
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
    expense = await Expense.findOne({
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
                model:User,
                attributes: { exclude: ['password'] },
            }
        ]
    })
    return res.status(201).json({
        status:"success",
        data:expense
    })
});

const getMonthExpenses = catchAsync(async (req,res,next)=>{
    const projectId = req.params.id;
    const date = new Date();//TODO get from query
    const startDate = new Date(date.getFullYear(), date.getMonth(), 1);
    const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    const expenses = await Expense.findAll({
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
                model:User,
                attributes: { exclude: ['password'] },
            }
        ]
    });
    return res.status(201).json({
        status:"success",
        data:expenses
    })
});

const getAllTransfers = catchAsync(async (req,res, next)=>{
    const projectId = req.params.id;
    const transfers = await Transfer.findAll({
        where:{
            projectId:projectId
        },
        include:[
            {
                model:Storage,
                as:"fromStorage"
            },
            {
                model:Storage,
                as:"toStorage"
            },
            {
                model:User,
                attributes: { exclude: ['password'] },
            }
        ],
        order: [['transferredAt', 'DESC']],
    });
    return res.status(201).json({
        status:"success",
        data:transfers
    })
});

const addTransfer = catchAsync(async (req, res, next)=>{
    const projectId = req.params.id;
    const {fromStorage, toStorage, transferredAmount, receivedAmount, transferredAt, transferrer} = req.body;
    const t = await sequelize.transaction();
    let transfer;
    try {
       transfer = await Transfer.create({
            projectId:projectId,
            fromStorageId:fromStorage,
            toStorageId:toStorage,
            transferredAmount:transferredAmount,
            receivedAmount:receivedAmount,
            transferredAt:transferredAt,
            transferrerId:transferrer,
            currencyRate:transferredAmount/receivedAmount //200RUB to 2EUR => 200/2 = 100; 
        },
        { transaction: t });
        await Storage.increment({balance:-transferredAmount},
        {where: {
            id: fromStorage,
        }}, 
        { transaction: t });
        await Storage.increment({balance:receivedAmount},
        { where: {
            id: toStorage,
        }}, 
        { transaction: t });

        await t.commit();
    } catch (error) {
        console.log(error);
        await t.rollback();
        throw new AppError(error.message, 401)
    }
    const transferResult = await Transfer.findOne({
        where:{
            id:transfer.id
        },
        include:[
            {
                model:Storage,
                as:"fromStorage"
            },
            {
                model:Storage,
                as:"toStorage"
            },
            {
                model:User,
                attributes: { exclude: ['password'] },
            }
        ],
    })
    return res.status(201).json({
        status:"success",
        data:transferResult
    })
});

const deleteExpense = catchAsync(async (req, res, next)=>{
    const projectId = req.params.id;
    const expenseId = req.params.expenseId;
    const t = await sequelize.transaction();
    try {
        const expense = await Expense.findOne({
            where:{
                id:expenseId,
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
    return res.status(201).json({
        status:"success"
    });
});

const deleteTransfer = catchAsync(async (req, res, next)=>{
    const projectId = req.params.id;
    const transferId = req.params.transferId;
    const t = await sequelize.transaction();
    try {
        const transfer = await Transfer.findOne({
            where:{
                id:transferId,
            },
            include:[
                {
                    model:Storage,
                    as:"fromStorage"
                },
                {
                    model:Storage,
                    as:"toStorage"
                },
            ],
        },{transaction:t});
        await transfer.fromStorage.increment('balance', 
            { by: transfer.transferredAmount }, 
            { transaction: t });
        await transfer.toStorage.increment('balance', 
            { by: -transfer.receivedAmount }, 
            { transaction: t });
        await transfer.destroy({ transaction: t });
        await t.commit();
    } catch (error) {
        await t.rollback();
        throw new AppError(error.message, 401);
    }
    return res.status(201).json({
        status:"success"
    });
});

const deleteDeposit = catchAsync(async (req, res, next)=>{
    const projectId = req.params.id;
    const depositId = req.params.depositId;
    const t = await sequelize.transaction();
    try {
        const deposit = await Deposit.findOne({
            where:{
                id:depositId,
            },
            include:[Storage]
        },{transaction:t});
        //TODO maybe in hooks?
        await deposit.Storage.increment('balance', 
            { by: -deposit.amount }, 
            { transaction: t });
        await deposit.destroy({ transaction: t });
        await t.commit();
    } catch (error) {
        await t.rollback();
        throw new AppError(error.message, 401);
    }
    return res.status(201).json({
        status:"success"
    });
});

const balanceData = catchAsync(async (req, res, next)=>{
    //GET TOTAL BALANCE FROM ALL STORAGES / CONVER TO CURRENCY;
    //GET LIMITS FROM ALL LIMITS AND EXPENSES FOR CURRENT MONTH;
    const {totalLimit, totalSpent, totalBalance} = await BalanceService.getProjectBalance(req.params.id);
    return res.status(201).json({
        status:"success",
        data:{
            totalBalance:totalBalance,
            spent:totalSpent,
            limit:totalLimit
        }
    })
});


const updateStorage = catchAsync(async (req, res, next)=>{
    const projectId = req.params.id;
    const storageId = req.params.storageId;
    const result = await Storage.findOne({
        where:{projectId:projectId, id:storageId}});
    if(!result){
        throw new AppError("Storage not found", 400);
    }
    result.name = req.body.name;
    await result.save();
    return res.status(201).json({
        status:"success"
    })
});

const updateDeposit = catchAsync(async (req, res, next)=>{
    const projectId = req.params.id;
    const depositId = req.params.depositId;
    const deposit = await Deposit.update(
        {   
            userId:req.body.author,
            depositedAt:req.body.depositedAt
        },
        {
            where:{
                projectId:projectId, 
                id:depositId
            }
        }
    );
    if(!deposit){
        throw new AppError("Deposit not found", 400);
    }
    const result = await Deposit.findOne({
        where:{
            id:depositId
        },  
        include: [
            {
                model: Storage,
            },
            {
                model: User,
                attributes: { exclude: ['password'] },
            },
        ]
    });
    return res.status(201).json({
        status:"success",
        data:result
    })
});

const updateTransfer = catchAsync(async (req, res, next)=>{
    const projectId = req.params.id;
    const transferId = req.params.transferId;
    const transfer = await Transfer.update(
        {   
            userId:req.body.author,
            transferredAt:req.body.transferredAt
        },
        {
            where:{
                projectId:projectId, 
                id:transferId
            }
        }
    );
    if(!transfer){
        throw new AppError("Transfer not found", 400);
    }
    const result = await Transfer.findOne({
        where:{
            id:transferId
        },  
        include:[
            {
                model:Storage,
                as:"fromStorage"
            },
            {
                model:Storage,
                as:"toStorage"
            },
            {
                model:User,
                attributes: { exclude: ['password'] },
            }
        ],
    });
    return res.status(201).json({
        status:"success",
        data:result
    })
});

const updateExpense = catchAsync(async (req, res, next)=>{
    const projectId = req.params.id;
    const expenseId = req.params.expenseId;
    const {description, spender, category, expensedAt} = req.body;
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
    const result = await Expense.findOne({
        where:{
            id:expenseId
        },
        include:[
            {
                model:Storage
            },
            {
                model:ExpenseCategory
            },
            {
                model:User,
                attributes: { exclude: ['password'] },
            }
        ]
    })
    return res.status(201).json({
        status:"success",
        data:result
    })
});


const updateExpenseCategory = catchAsync(async (req, res, next)=>{
    const projectId = req.params.id;
    const catId = req.params.catId;
    const {name, limit} = req.body;
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
    return res.status(201).json({
        status:"success",
        data:result
    })
});

module.exports = {
    addStorage, getAllStorages, updateStorage,
    getAllDeposits, addDeposit, deleteDeposit,updateDeposit,
    addExpenseCategory, getMonthsExpenseCategories, updateExpenseCategory,
    addExpense, getMonthExpenses,deleteExpense, updateExpense,
    addTransfer, getAllTransfers, deleteTransfer,updateTransfer,
    balanceData
}