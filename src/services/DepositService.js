const AbstractService = require("./AbstractService");
const {sequelize, Deposit, Storage, User} = require("../db/models");
const { Op } = require("sequelize");
const AppError = require("../utils/appError");

class DepositService extends AbstractService {
    constructor() {
        super();
    }
    async addDeposit(projectId, storageId, amount, author, depositedAt){
        const t = await sequelize.transaction();
        let deposit = null;
        try {
            let storageItem = await Storage.findOne({
                where:{
                    id:storageId,
                    projectId:projectId
                }
            }, { transaction: t });
            if(!storageItem){
                throw new AppError("Storage not found", 400);
            }
            deposit = await Deposit.create(
                {
                    projectId: projectId,
                    storageId: storageId,
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
        return await Deposit.findOne({
            where: {
                id:deposit.id
            },
            include: [
                {
                    model: Storage,
                },
                {
                    model: User
                },
            ]
        });
    }
    async getAllDeposits(projectId){
        return await Deposit.findAll({
            where: {
                projectId: projectId
            },
            include: [
                {
                    model: Storage,
                },
                {
                    model: User
                },
            ],
            order: [['depositedAt', 'DESC']],
        });
    }

    async deleteDeposit(projectId, depositId){
        const t = await sequelize.transaction();
        try {
            const deposit = await Deposit.findOne({
                where:{
                    id:depositId,
                    projectId:projectId
                },
                include:[Storage]
            },{transaction:t});
            if(!deposit){
                throw new AppError('Deposit not found', 400);
            }
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
        return true;
    }

    async updateDeposit(projectId, depositId, author, depositedAt){
        const deposit = await Deposit.update(
            {   
                userId:author,
                depositedAt:depositedAt
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
        return await Deposit.findOne({
            where:{
                id:depositId
            },  
            include: [
                {
                    model: Storage,
                },
                {
                    model: User
                },
            ]
        });
    }
}

module.exports = new DepositService();