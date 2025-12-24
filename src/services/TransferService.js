const AbstractService = require("./AbstractService");
const {sequelize, Transfer, Storage, User} = require("../db/models");
const { Op } = require("sequelize");
const AppError = require("../utils/appError");

class TransferService extends AbstractService {
    constructor() {
        super();
    }
    async getAllTransfers(projectId){
        return await Transfer.findAll({
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
                    model:User
                }
            ],
            order: [['transferredAt', 'DESC']],
        });
    }

    async addTransfer(projectId, fromStorage, toStorage, transferredAmount, receivedAmount, transferredAt, transferrer){
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
        return await Transfer.findOne({
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
                    model:User
                }
            ],
        })
    }

    async deleteTransfer(projectId, transferId){
        const t = await sequelize.transaction();
        try {
            const transfer = await Transfer.findOne({
                where:{
                    id:transferId,
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
        return true;
    }

    async updateTransfer(projectId, transferId, author, transferredAt){
        const transfer = await Transfer.update(
            {   
                transferrerId:author,
                transferredAt:transferredAt
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
        return await Transfer.findOne({
            where:{
                id:transferId,
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
                    model:User
                }
            ],
        });
    }
}

module.exports = new TransferService();