const AbstractService = require("./AbstractService");
const CurrencyService = require("./CurrencyService")
const {sequelize, Project, User, UserProjects} = require("../db/models");
const { Op } = require("sequelize");
const AppError = require("../utils/appError");

class ProjectService extends AbstractService {
    constructor() {
        super();
    }
    async createProject(name, currency, isCurrent, user){
        const t = await sequelize.transaction();
        let newUserProject;
        let newProject;
        try {
            newProject = await Project.create(
                {
                    name:name,
                    currency:currency,
                    owner:user.id
                },
                { transaction: t },
            );
            if(isCurrent){
                //make other user's projects as not current;
                await UserProjects.update(
                    {isCurrent:false},
                    {
                        where:{
                            userId:user.id,
                        }
                    }, 
                    { transaction: t }
                )
            }
            newUserProject = await UserProjects.create({
                isCurrent:isCurrent,
                projectId:newProject.id,
                userId:user.id
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
        return {
            newProject:newUserProject,
            currency:currencySettings
        }
    }
    async getAllProjects(user){
        return await UserProjects.findAll({
            where: {
                userId: user.id
            },
            include: {
                model: Project,
                include:{
                    model: User,
                    as:"ownerUser"
                }
            },
            order:[["updatedAt", "DESC"]]
        });
    }

    async getProjectById(user, projectId){
        const result = await Project.findOne({
            where:{id:projectId, owner:user.id},
            include:'User'});
        if(!result){
            throw new AppError("Project not found", 400);
        }
        return result;
    }

    async updateProject(projectId, newName){
        const result = await Project.findOne({
            where:{id:projectId}});
        if(!result){
            throw new AppError("Project not found", 400);
        }
        result.name = newName;
        await result.save();
        return result;
    }

    async switchProject(user, projectId){
        let projectToSwitch;
        const t = await sequelize.transaction();
        try {
            //make other user's projects as not current;
            await UserProjects.update(
                {isCurrent:false},
                {
                    where:{
                        userId:user.id
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
                        userId:user.id
                    },
                },
                { transaction: t },
            );
            projectToSwitch = await UserProjects.findOne(
                {
                    where:{
                        projectId:projectId,
                        userId:user.id
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
        return {
            project:projectToSwitch,
            currency:currencySettings
        }
    }

    async deleteProject(user, projectId){
        const result = await Project.findOne({
            where:{id:projectId,owner:user.id}});
        if(!result){
            throw new AppError("Project not found", 400);
        }
        await result.destroy();
        return true;
    }

    async getProjectUsers(projectId){
        const project = await Project.findOne({
            where:{id:projectId}
        });
        return await project.getUsers();
    }

    async inviteUserToProject(currentUser, projectId, email){        
        const user = await User.findOne({
            where:{
                email:email
            }
        });
        if(!user){
            throw new AppError("User not found", 400, {
                email:"User with this email not found"
            });
        }
        if(user.id === currentUser.id){
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
        return user;
    }
}

module.exports = new ProjectService();