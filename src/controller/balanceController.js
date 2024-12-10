const catchAsync = require("../utils/catchAsync")
const BalanceService = require("../services/BalanceService");
const StorageService = require("../services/StorageService");
const DepositService = require("../services/DepositService");
const TransferService = require("../services/TransferService");
const ExpenseService = require("../services/ExpenseService");

const addStorage = catchAsync(async (req,res,next)=>{
    const {name, currency, balance} = req.body;
    const projectId = req.params.id;
    const result = await StorageService.addStorage(req.user, projectId, name, currency, balance);
    return res.status(201).json({
        status:"success",
        data:result
    });
});

const getAllStorages = catchAsync(async (req,res, next)=>{
    const result = await StorageService.getAllStorages(req.params.id, req.query)
    return res.status(201).json({
        status:"success",
        data:result
    })
});

const addDeposit = catchAsync(async(req, res, next)=>{
    const {storage, amount, author, depositedAt} = req.body;
    const projectId = req.params.id;
    const result = await DepositService.addDeposit(projectId, storage, amount, author, depositedAt);
    return res.status(201).json({
        status:"success",
        data:result
    })
});

const getAllDeposits = catchAsync(async (req,res, next)=>{
    const result = await DepositService.getAllDeposits(req.params.id);
    return res.status(201).json({
        status:"success",
        data:result
    })
});

const addExpenseCategory = catchAsync(async (req, res, next)=>{
    const {name, limit} = req.body;
    const projectId = req.params.id;
    const result = await ExpenseService.addExpenseCategory(projectId, name, limit);
    return res.status(201).json({
        status:"success",
        data:result
    })
});

const getMonthsExpenseCategories = catchAsync(async (req,res, next)=>{
    const catAndExpenses = await ExpenseService.getExpensesInCategories(req.params.id);

    const {categories} = await BalanceService.getMonthBalanceData(req.params.id, catAndExpenses, new Date());
    return res.status(201).json({
        status:"success",
        data:categories
    })
});


const addExpense = catchAsync(async (req, res, next)=>{
    const {description, amount, spender, category, storage, expensedAt} = req.body;
    const projectId = req.params.id;
    const result = await ExpenseService.addExpense(projectId, description, amount, spender, category, storage, expensedAt);
    return res.status(201).json({
        status:"success",
        data:result
    });
});

const getMonthExpenses = catchAsync(async (req,res,next)=>{
    const projectId = req.params.id;
    const result = await ExpenseService.getCurrentMonthExpenses(projectId);
    return res.status(201).json({
        status:"success",
        data:result
    })
});

const getAllTransfers = catchAsync(async (req,res, next)=>{
    const transfers = await TransferService.getAllTransfers(req.params.id);
    return res.status(201).json({
        status:"success",
        data:transfers
    })
});

const addTransfer = catchAsync(async (req, res, next)=>{
    const projectId = req.params.id;
    const {fromStorage, toStorage, transferredAmount, receivedAmount, transferredAt, transferrer} = req.body;
    const result = await TransferService.addTransfer(projectId, fromStorage, toStorage, 
        transferredAmount, receivedAmount, transferredAt, transferrer);
    return res.status(201).json({
        status:"success",
        data:result
    })
});

const deleteExpense = catchAsync(async (req, res, next)=>{
    const {id, expenseId} = req.params;
    await ExpenseService.deleteExpense(id, expenseId);
    return res.status(201).json({
        status:"success"
    });
});

const deleteTransfer = catchAsync(async (req, res, next)=>{
    const {id, transferId} = req.params;
    await TransferService.deleteTransfer(id, transferId);
    return res.status(201).json({
        status:"success"
    });
});

const deleteDeposit = catchAsync(async (req, res, next)=>{
    const {id, depositId} = req.params;
    await DepositService.deleteDeposit(id, depositId);
    return res.status(201).json({
        status:"success"
    });
});

const balanceData = catchAsync(async (req, res, next)=>{
    //GET TOTAL BALANCE FROM ALL STORAGES / CONVERT TO CURRENCY;
    //GET LIMITS FROM ALL LIMITS AND EXPENSES FOR CURRENT MONTH;
    const expensesInCategoires = await ExpenseService.getExpensesInCategories(req.params.id);
    const {totalLimit, totalSpent, totalBalance} = await BalanceService.getProjectBalance(req.params.id, expensesInCategoires);
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
    const {id, storageId} = req.params;
    await StorageService.updateStorage(id, storageId, req.body.name);
    return res.status(201).json({
        status:"success"
    })
});

const updateDeposit = catchAsync(async (req, res, next)=>{
    const {id, depositId} = req.params;
    const {author, depositedAt} = req.body;
    const result = await DepositService.updateDeposit(id, depositId, author, depositedAt)
    return res.status(201).json({
        status:"success",
        data:result
    })
});

const updateTransfer = catchAsync(async (req, res, next)=>{
    const {id, transferId} = req.params;
    const {author, transferredAt} = req.body;
    const result = await TransferService.updateTransfer(id, transferId, author, transferredAt);
    return res.status(201).json({
        status:"success",
        data:result
    })
});

const updateExpense = catchAsync(async (req, res, next)=>{
    const {id, expenseId} = req.params;
    const {description, spender, category, expensedAt} = req.body;
    const result = await ExpenseService.updateExpense(id, expenseId, description, spender, category, expensedAt);
    return res.status(201).json({
        status:"success",
        data:result
    })
});


const updateExpenseCategory = catchAsync(async (req, res, next)=>{
    const {id, catId} = req.params;
    const {name, limit} = req.body;
    const result = await ExpenseService.updateExpenseCategory(id,catId,name,limit);
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