const project = require("../db/models/project");
const user = require("../db/models/user");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync")

const createProject = catchAsync(async (req,res,next)=>{
    const body = req.body;

    const newProject = await project.create({
        name:body.name,
        owner:req.user.id
    })
    return res.status(201).json({
        status:"success",
        data:newProject
    })
});
// TODO get real users project
const getAllProjects = catchAsync(async (req, res, next)=>{
    const result = await project.findAll({
        include:{ model: user, attributes:{exclude: ["password"] }},
        attributes:{
            exclude:["deletedAt"],
        }
    })
    return res.status(201).json({
        status:"success",
        data:result
    })
});

const getProjectById = catchAsync(async (req, res, next)=>{
    const projectId = req.params.id;
    const result = await project.findOne({
        where:{id:projectId,owner:req.user.id},
        include:'user'});
    if(!result){
        throw new AppError("Project not found", 400);
    }
    return res.status(201).json({
        status:"success",
        data:result
    })
});

const updateProject = catchAsync(async (req, res, next)=>{
    const projectId = req.params.id;
    const result = await project.findOne({
        where:{id:projectId,owner:req.user.id},
        include:'user'});
    if(!result){
        throw new AppError("Project not found", 400);
    }
    result.name = req.body.name;
    const updated  = await result.save();
    return res.status(201).json({
        status:"success",
        data:updated
    })
});

const deleteProject = catchAsync(async (req, res, next)=>{
    const projectId = req.params.id;
    const result = await project.findOne({
        where:{id:projectId,owner:req.user.id}});
    if(!result){
        throw new AppError("Project not found", 400);
    }
    await result.destroy();
    return res.status(201).json({
        status:"success",
        message:"Deleted successfully"
    })
});

const checkAccessByOwner = (ownerID) => {
    const checkPermission = (req, res, next) =>{
        if(ownerID !== req.user.id){
            throw new AppError("You don't have permission to perform this operation", 403);
        }
        return next();
    }
    return checkPermission;
}
module.exports = {createProject, getAllProjects, getProjectById, 
    checkAccessByOwner, updateProject, deleteProject}