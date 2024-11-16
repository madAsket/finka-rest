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
    let storage = await Storage.create({
        projectId:projectId,
        name:name,
        currency:currency.value
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
    const noEmptyCondition = req.query.noempty ? {[Op.gt]: 0} : {[Op.gte]: 0};
    const result = await Storage.findAll({
        where: {
            projectId: req.params.id,
            balance:noEmptyCondition
        },
        order:['id']
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
    let result = [];
    let categories = await ExpenseCategory.findAll({
        where: {
            projectId: req.params.id
        },
        // order: [['depositedAt', 'DESC']],
    });
    // 
    const date = new Date();
    for await (let cat of categories){
        const limit = await ExpenseLimit.findOrCreate({
            where:{
                expenseCategoryId:cat.id,
                projectId:req.params.id,
                month:date.getMonth()+1,
                year:date.getFullYear()
            } 
        });
        cat = cat.toJSON()
        cat.limit = limit[0];
        result.push(cat);
    }
    return res.status(201).json({
        status:"success",
        data:result
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
        const [limit, created] = await ExpenseLimit.findOrCreate({
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

module.exports = {
    addStorage, getAllStorages, 
    getAllDeposits, addDeposit, 
    addExpenseCategory, getMonthsExpenseCategories,
    addExpense, getMonthExpenses,
    addTransfer, getAllTransfers
}