const AbstractService = require("./AbstractService");
const jwt = require("jsonwebtoken")
const bcrypt = require('bcrypt');
const AppError = require('../utils/appError');
const CurrencyService = require("./CurrencyService");
const {User, UserProjects, Project, Subscription} = require("../db/models");
const { default: axios } = require("axios");
const {defaultSender: mailSender} = require("../modules/email/MailSender")

class UserService extends AbstractService {
    constructor() {
        super();
    }
    static generateToken(payload, expiresIn=process.env.JWT_EXPIRES_IN){
        return jwt.sign(payload, process.env.JWT_SECRET_KEY, {
            expiresIn: expiresIn
        });
    }
    static validateToken(tokenId){
        const tokenDetail = jwt.verify(tokenId, process.env.JWT_SECRET_KEY);
        if(!tokenDetail){
            throw new AppError("Token is expired or invalid", 400);
        }
        return tokenDetail;
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
    async createDefaultUserSubscription(user){
        const defaultSubscription = await Subscription.create({
            status:"early_adopters",
            userId: user.id,
        });
        return defaultSubscription;
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
    async getUserByEmail(email){
        return await User.findOne({
            where:{
                email:email
            }
        });
    }
    async signup(email, username, password, confirmPassword){
        const exist = await this.getUserByEmail(email);
        if(exist){
            throw new AppError("User already exists. Please, sign in.", 400, {
                email:"This email already taken."
            });
        }
        return await this.createUser(email, username, password, confirmPassword);
    }
    async login(email, password){
        if (!email || !password) {
            throw new AppError("Auth error", 401, {
                email: "Please, provide email",
                password: "Please, provide password"
            });
        }
        return await this.authUser(email, password)
    }
    async authUser(email, password){
        const result = await User.scope('auth').findOne({
            where: { email }
        })
        if (!result || (password && !(await bcrypt.compare(password, result.password)))) {
            throw new AppError("User with provided data not found", 401, { email: "Email or password are incorrect" });
        }
        return await this.buildUserData(result);
    }
    async createUser(email, username, password, confirmPassword){
        const newUser = await User.create({
            userType: '1',
            firstName: username,
            email: email,
            password: password,
            confirmPassword: confirmPassword
        })
        if (!newUser)
            throw new AppError("Failed to create user", 400);
    
        await this.createDefaultUserProject(newUser);
        await this.createDefaultUserSubscription(newUser);
        return await this.buildUserData(newUser);
    }
    async buildUserData(user){
        const result = user.toJSON();
        delete result.deletedAt;
        delete result.password;
        const {currentProject, currency} = await this.getCurrenUserData(user);
        return {
            user: result,
            token: UserService.generateToken({
                id: result.id
            }),
            currentProject: currentProject,
            currency:currency
        }
    }
    async googleAuth(token){
        if (!token) {
            throw new AppError("Google authentication error", 401);
        }
        let userDetails = null;
        try{
            const response = await axios.post(
            'https://oauth2.googleapis.com/token',
            {
                code:token,
                client_id: process.env.GOOGLE_CLIEND_ID,
                client_secret: process.env.GOOGLE_CLIENT_SECRET,
                redirect_uri: 'postmessage',
                grant_type: 'authorization_code'
            }
            );
            const accessToken = response.data.access_token;
            const userResponse = await axios.get(
            'https://www.googleapis.com/oauth2/v3/userinfo',
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            });
            userDetails = userResponse.data;
        }catch(e){
            throw new AppError(e, 401);
        }
        const exist = await this.getUserByEmail(userDetails.email);
        if(exist){
            return await this.authUser(userDetails.email);
        }else{
            const password = crypto.randomUUID();
            return await this.createUser(userDetails.email, userDetails.name, password, password);
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
    async generateResetPasswordToken(email){
        const user = await User.findOne({
            where: {
                email: email
            }
        });
        if(user){
            const token = UserService.generateToken({email}, process.env.JWT_RESET_PASSWORD_EXPIRES_IN);
            mailSender.sendResetPasswordEmail(email, token);
        }
    }
    checkResetPasswordToken(token){
        return UserService.validateToken(token);
    }
    async resetPassword(token, password, confirmPassword){
        const tokenDetail = UserService.validateToken(token);
        await User.update({
            password: password,
            confirmPassword: confirmPassword
        }, 
        {
            where:{
                email:tokenDetail.email
            }
        });
        return true;
    }
    async authentication(req){
        let idToken = "";
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            idToken = req.headers.authorization.split(' ')[1];
        }
        if (!idToken) {
            throw new AppError("Please login to get access", 401);
        }
        const tokenDetail = UserService.validateToken(idToken);
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