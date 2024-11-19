require('dotenv').config({ path: `${process.cwd()}/.env` });
const { User, UserProjects, Project } = require("../db/models")
const jwt = require("jsonwebtoken")
const bcrypt = require('bcrypt');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const CurrencyService = require("../services/CurrencyService")
const generateToken = (payload) => {
    return jwt.sign(payload, process.env.JWT_SECRET_KEY, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
}

const signup = catchAsync(async (req, res, next) => {
    const body = req.body;
    const newUser = await User.create({
        userType: '1',
        firstName: body.firstName,
        lastName: body.lastName,
        email: body.email,
        password: body.password,
        confirmPassword: body.confirmPassword
    })
    if (!newUser)
        throw new AppError("Failed to create the user", 400);

    const defaultProject = await Project.create({
        name: 'Family budgeting',
        owner: newUser.id,
    });
    await newUser.addProject(defaultProject, { through: { isCurrent: true } });
    const currentProject = await UserProjects.findOne({
        where: {
            isCurrent: true,
            userId: newUser.id
        },
        include: {
            model: Project
        },
    });
    const result = newUser.toJSON();
    delete result.deletedAt;
    delete result.password;
    const currencySettings  = await CurrencyService.getProjectCurrencySettings(currentProject.Project.currency);
    return res.status(201).json({
        status: 'success',
        data: {
            user: result,
            token: generateToken({
                id: result.id
            }),
            currentProject: currentProject.toJSON(),
            currency:currencySettings
        }
    });
});

const login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
        throw new AppError("Auth error", 400, {
            email: "Please, provide email",
            password: "Please, provide password"
        });
    }

    const result = await User.findOne({
        where: { email }
    })
    if (!result || !(await bcrypt.compare(password, result.password))) {
        throw new AppError("Auth error", 401, { email: "Email or password are incorrect" });
    }
    jsonResult = result.toJSON();
    delete jsonResult.deletedAt;
    delete jsonResult.password;
    const currentProject = await UserProjects.findOne({
        where: {
            isCurrent: true,
            userId: result.id
        },
        include: {
            model: Project
        },
    });
    const currencySettings  = await CurrencyService.getProjectCurrencySettings(currentProject.Project.currency);
    return res.json({
        status: "success",
        data: {
            user: jsonResult,
            token: generateToken({
                id: result.id
            }),
            currentProject:currentProject.toJSON(),
            currency:currencySettings
        }
    })
});

const getCurrenUser = catchAsync(async (req, res, next) => {
    const result = req.user;
    jsonResult = result.toJSON();
    delete jsonResult.deletedAt;
    delete jsonResult.password;
    const currentProject = await UserProjects.findOne({
        where: {
            isCurrent: true,
            userId: req.user.id
        },
        include: {
            model: Project
        },
    });
    const currencySettings  = await CurrencyService.getProjectCurrencySettings(currentProject.Project.currency);
    return res.json({
        status: "success",
        data: {
            user: jsonResult,
            currentProject: currentProject.toJSON(),
            currency:currencySettings
        }
    })
});

const authentication = catchAsync(async (req, res, next) => {
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
    return next();
});


module.exports = { signup, login, getCurrenUser, authentication };