const {sequelize, Project, User, UserProjects, Storage, Deposit} = require("../db/models");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync")

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
    const result = await Storage.findAll({
        where: {
            projectId: req.params.id
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
            },
        ],
        order: [['depositedAt', 'DESC']],
    });
    return res.status(201).json({
        status:"success",
        data:result
    })
});

module.exports = {addStorage, getAllStorages, getAllDeposits, addDeposit}