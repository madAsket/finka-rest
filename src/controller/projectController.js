const {Project, User, UserProjects} = require("../db/models");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync")

const createProject = catchAsync(async (req,res,next)=>{
    const body = req.body;

    const newProject = await Project.create({
        name:body.name,
        owner:req.user.id
    })
    return res.status(201).json({
        status:"success",
        data:newProject
    })
});

const getAllProjects = catchAsync(async (req, res, next)=>{
    const result = await UserProjects.findAll({
        where: {
            userId: req.user.id
        },
        include: {
            model: Project,
            include:{
                model: User,
                as:"ownerUser",
                attributes: { exclude: ['password'] },
            }
        },
    });
    return res.status(201).json({
        status:"success",
        data:result
    })
});

const getProjectById = catchAsync(async (req, res, next)=>{
    const projectId = req.params.id;
    const result = await Project.findOne({
        where:{id:projectId, owner:req.user.id},
        include:'User'});
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
    const result = await Project.findOne({
        where:{id:projectId,owner:req.user.id},
        include:'User'});
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
    const result = await Project.findOne({
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

const getProjectUsers = catchAsync(async (req,res, next)=>{
    const projectId = req.params.id;
    const project = await Project.findOne({
        where:{id:projectId}});
    
    const users = await project.getUsers({
        attributes:{
            exclude:['password']
        }
    });
    return res.status(201).json({
        status:"success",
        data:users
    })
});


module.exports = {createProject, getAllProjects, getProjectById, 
 updateProject, deleteProject, getProjectUsers}