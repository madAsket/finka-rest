const {sequelize, Project, User, UserProjects} = require("../db/models");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const CurrencyService = require("../services/CurrencyService");

const createProject = catchAsync(async (req,res,next)=>{
    const body = req.body;
    const t = await sequelize.transaction();
    let newUserProject;
    let newProject;
    try {
        newProject = await Project.create(
            {
                name:body.name,
                currency:body.currency,
                owner:req.user.id
            },
            { transaction: t },
        );
        if(body.isCurrent){
            //make other user's projects as not current;
            await UserProjects.update(
                {isCurrent:false},
                {
                    where:{
                        userId:req.user.id,
                    }
                }, 
                { transaction: t }
            )
        }
        newUserProject = await UserProjects.create({
            isCurrent:body.isCurrent,
            projectId:newProject.id,
            userId:req.user.id
        }, { transaction: t });
        await t.commit();
    } catch (error) {
        console.log(error);
        await t.rollback();
    }
    newUserProject = newUserProject.toJSON();
    newUserProject.Project = newProject.toJSON();
    let currencySettings = null;
    if(newUserProject.isCurrent){
        currencySettings = await CurrencyService.getProjectCurrencySettings(newUserProject.Project.currency);
    }
    return res.status(201).json({
        status:"success",
        data:{
            newProject:newUserProject,
            currency:currencySettings
        }
    });
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
        order:[["updatedAt", "DESC"]]
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


const switchProject = catchAsync(async (req, res, next)=>{
    const projectId = req.params.id;
    let projectToSwitch;
    const t = await sequelize.transaction();
    try {
        //make other user's projects as not current;
        await UserProjects.update(
            {isCurrent:false},
            {
                where:{
                    userId:req.user.id
                }
            }, 
            { transaction: t }
        );
        await UserProjects.update(
            {
                isCurrent:true
            },
            {
                where:{
                    projectId:projectId,
                    userId:req.user.id
                },
            },
            { transaction: t },
        );
        projectToSwitch = await UserProjects.findOne(
            {
                where:{
                    projectId:projectId,
                    userId:req.user.id
                },
                include:[Project]
            },
            { transaction: t },
        );
        await t.commit();
    } catch (error) {
        console.log(error);
        await t.rollback();
    }
    const currencySettings = await CurrencyService.getProjectCurrencySettings(projectToSwitch.Project.currency);
    return res.status(201).json({
        status:"success",
        data:{
            project:projectToSwitch,
            currency:currencySettings
        }
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
        where:{id:projectId}
    });
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

const inviteUserToProject = catchAsync(async (req, res, next)=>{
    const projectId = req.params.id;
    const {email} = req.body;
    
    const user = await User.findOne({
        where:{
            email:email
        },
        attributes: { exclude: ['password'] },
    });
    if(!user){
        throw new AppError("User not found", 400, {
            email:"User with this email not found"
        });
    }
    if(user.id === req.user.id){
        throw new AppError("Wrong user", 400, {
            email:"You're already in the project"
        });
    };
    const project = await UserProjects.findOne({
        where:{
            projectId: projectId,
            userId:user.id
        },
    });
    if(project){
        throw new AppError("Wrong user", 400, {
            email:"User's already in the project"
        });
    }
    await UserProjects.create({
        projectId: projectId,
        userId:user.id
    });
    return res.status(201).json({
        status:"success",
        data:user
    })
});

module.exports = {createProject, getAllProjects, getProjectById, 
 updateProject, deleteProject, getProjectUsers, switchProject,
 inviteUserToProject}