const catchAsync = require("../utils/catchAsync");
const ProjectService = require("../services/ProjectService");

const createProject = catchAsync(async (req,res,next)=>{
    const {name, currency, isCurrent} = req.body;
    const data = await ProjectService.createProject(name, currency, isCurrent, req.user);
    return res.status(201).json({
        status:"success",
        data:data
    });
});

const getAllProjects = catchAsync(async (req, res, next)=>{
    const data = await ProjectService.getAllProjects(req.user);
    return res.status(201).json({
        status:"success",
        data:data
    })
});

const getProjectById = catchAsync(async (req, res, next)=>{
    const data = await ProjectService.getProjectById(req.user, req.params.id);
    return res.status(201).json({
        status:"success",
        data:data
    });
});

const updateProject = catchAsync(async (req, res, next)=>{
    await ProjectService.updateProject(req.params.id, req.body.name);
    return res.status(201).json({
        status:"success"
    })
});


const switchProject = catchAsync(async (req, res, next)=>{
    const data = await ProjectService.switchProject(req.user, req.params.id);
    return res.status(201).json({
        status:"success",
        data:data
    })
});

const deleteProject = catchAsync(async (req, res, next)=>{
    await ProjectService.deleteProject(req.user, req.params.id);
    return res.status(201).json({
        status:"success"
    })
});

const getProjectUsers = catchAsync(async (req,res, next)=>{
    const users = await ProjectService.getProjectUsers(req.params.id);
    return res.status(201).json({
        status:"success",
        data:users
    })
});

const inviteUserToProject = catchAsync(async (req, res, next)=>{
    const {email} = req.body;
    const data = await ProjectService.inviteUserToProject(req.user, req.params.id, email);
    return res.status(201).json({
        status:"success",
        data:data
    })
});

module.exports = {createProject, getAllProjects, getProjectById, 
 updateProject, deleteProject, getProjectUsers, switchProject,
 inviteUserToProject}