const {Project, User, UserProjects, Storage} = require("../db/models");
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
    const storage = await Storage.create({
        projectId:projectId,
        name:name,
        currency:currency.value
    });
    //TODO add transaction if exists balance;
    //TODO update global statistic;
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
    });
    return res.status(201).json({
        status:"success",
        data:result
    })
});

module.exports = {addStorage, getAllStorages}