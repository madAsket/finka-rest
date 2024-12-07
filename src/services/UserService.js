const AbstractService = require("./AbstractService");
require('dotenv').config({ path: `${process.cwd()}/.env` });
const jwt = require("jsonwebtoken")
const bcrypt = require('bcrypt');
const AppError = require('../utils/appError');
const CurrencyService = require("./CurrencyService");
const {User, UserProjects, Project} = require("../db/models");
const { Op } = require("sequelize");

class UserService extends AbstractService {
    constructor() {
        super();
    }
    static generateToken(payload){
        return jwt.sign(payload, process.env.JWT_SECRET_KEY, {
            expiresIn: process.env.JWT_EXPIRES_IN
        });
    }
     //TODO move to Project Service?
    async createDefaultUserProject(user, projectName="Family budgeting"){
        const defaultProject = await Project.create({
            name: projectName,
            owner: user.id,
        });
        await user.addProject(defaultProject, { through: { isCurrent: true } });
        return defaultProject;
    }
    //TODO move to Project Service?
    async getCurrentUserProject(user){
        return await UserProjects.findOne({
            where: {
                isCurrent: true,
                userId: user.id
            },
            include: {
                model: Project
            },
        });
    }
    async signup(email, username, password, confirmPassword){
        const exist = await User.findOne({
            where:{
                email:email
            }
        });
        if(exist){
            throw new AppError("User already exists", 400, {
                email:"This email already taken."
            });
        }
        const newUser = await User.create({
            userType: '1',
            firstName: username,
            email: email,
            password: password,
            confirmPassword: confirmPassword
        })
        if (!newUser)
            throw new AppError("Failed to create the user", 400);
    
        await this.createDefaultUserProject(newUser);
        const result = newUser.toJSON();
        delete result.deletedAt;
        delete result.password;
        const {currentProject, currency} = await this.getCurrenUserData(newUser);
        return {
            user: result,
            token: UserService.generateToken({
                id: result.id
            }),
            currentProject: currentProject,
            currency:currency
        }
    }
    async login(email, password){
        if (!email || !password) {
            throw new AppError("Auth error", 400, {
                email: "Please, provide email",
                password: "Please, provide password"
            });
        }
        const result = await User.scope('auth').findOne({
            where: { email }
        })
        if (!result || !(await bcrypt.compare(password, result.password))) {
            throw new AppError("Auth error", 401, { email: "Email or password are incorrect" });
        }
        let jsonResult = result.toJSON();
        delete jsonResult.deletedAt;
        delete jsonResult.password;
        const {currentProject, currency} = await this.getCurrenUserData(result);
        return {
            user: jsonResult,
            token: UserService.generateToken({
                id: result.id
            }),
            currentProject:currentProject,
            currency:currency
        }
    }
    async getCurrenUserData(user){
        const currentProject = await this.getCurrentUserProject(user);
        const currencySettings = await CurrencyService.getProjectCurrencySettings(currentProject.Project.currency);
        return {
            user: user,
            currentProject: currentProject,
            currency:currencySettings
        }
    }
    
    async changePassword(user, password, confirmPassword){
        if(!password){
            throw new AppError("Provide new password", 400, { password: "Provide new password" });
        }
        await User.update({
            password: password,
            confirmPassword: confirmPassword
        }, 
        {
            where:{
                id:user.id
            }
        });
        return true;
    }
    async updateProfile(user, firstName, lastName){
        const [updated, updatedUser] = await User.update({
            firstName: firstName,
            lastName: lastName
        }, 
        {
            where:{
                id:user.id
            },
            returning: true,
        });
        const result = updatedUser[0].toJSON();
        delete result.deletedAt;
        delete result.password;
        return result;
    }    
    async authentication(req){
        let idToken = "";
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            idToken = req.headers.authorization.split(' ')[1];
        }
        if (!idToken) {
            throw new AppError("Please login to get access", 401);
        }
        const tokenDetail = jwt.verify(idToken, process.env.JWT_SECRET_KEY)
        const freshUser = await User.findByPk(tokenDetail.id);
        if (!freshUser) {
            throw new AppError("User not found or no longer exists", 400);
        }
        req.user = freshUser;
        const projectId = req.params.id;
        if(projectId){
            const accessToProject = await UserProjects.findOne({
                where: {
                    projectId:projectId,
                    userId: req.user.id
                }
            });
            if(!accessToProject){
                throw new AppError("Access denied", 403);
            }
        }
    }
}

module.exports = new UserService();