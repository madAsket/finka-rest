const AbstractService = require("./AbstractService");
const {sequelize, Deposit, Storage} = require("../db/models");
const { Op } = require("sequelize");
const CurrencyService = require("./CurrencyService");
const AppError = require("../utils/appError");

class StorageService extends AbstractService {
    constructor() {
        super();
    }
    async addStorage(user, projectId, name, currency, balance){
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
                        userId:user.id,
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
        return storage;
    }
    async getAllStorages(projectId, filters={}){
        let where = {
            projectId: projectId,
        }
        if(filters.noempty){
            where.balance = {[Op.gt]: 0};
        }
        return await Storage.findAll({
            where,
            order:[['updatedAt', "DESC"]]
        });
    }
    async updateStorage(projectId, storageId, newName){
        const result = await Storage.findOne({
            where:{projectId:projectId, id:storageId}});
        if(!result){
            throw new AppError("Storage not found", 400);
        }
        result.name = newName;
        return await result.save();
    }
}

module.exports = new StorageService();