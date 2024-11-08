require('dotenv').config({path: `${process.cwd()}/.env`});
const user = require("../db/models/user");
const jwt  = require("jsonwebtoken")
const bcrypt = require('bcrypt');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const { json } = require('sequelize');
const generateToken = (payload)=>{
    return jwt.sign(payload, process.env.JWT_SECRET_KEY, {
        expiresIn:process.env.JWT_EXPIRES_IN
    });
}

const signup = async (req, res, next)=>{
    const body = req.body;
    const newUser = await user.create({
        userType:'1',
        firstName:body.firstName,
        lastName:body.lastName,
        email:body.email,
        password:body.password,
        confirmPassword:body.confirmPassword
    })

    if(!newUser){
        throw new AppError("Failed to create the user", 400);
    }else{
        const result = newUser.toJSON();
        delete result.deletedAt;
        delete result.password;
        result.token = generateToken({
            id:result.id
        })
        return res.status(201).json({
            status:'success',
            data:result
        });
    }
}

const login = async (req, res, next)=>{
    const {email, password} = req.body;
    if(!email || !password){
        throw new AppError("Please provide email and password", 400);
    }

    const result = await user.findOne({
        where:{email}
    })
    if(!result || !(await bcrypt.compare(password, result.password))){
        throw new AppError("Email or password is incorrect", 401);
    }
    jsonResult = result.toJSON();
    delete jsonResult.deletedAt;
    delete jsonResult.password;
    return res.json({
        status:"success",
        data:{
            user:jsonResult,
            token:generateToken({
                id:result.id
            })
        }
    })
}

const getCurrenUser = async (req, res, next)=>{
    const result = req.user;
    jsonResult = result.toJSON();
    delete jsonResult.deletedAt;
    delete jsonResult.password;
    return res.json({
        status:"success",
        data:{
            user:jsonResult
        }
    })
}

const authentication = catchAsync(async (req, res, next)=>{
    let idToken = "";
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        idToken = req.headers.authorization.split(' ')[1];
    }
    if(!idToken){
        throw new AppError("Please login to get access", 401);
    }
    const tokenDetail = jwt.verify(idToken, process.env.JWT_SECRET_KEY)
    const freshUser = await user.findByPk(tokenDetail.id);
    if(!freshUser){
        throw new AppError("User not found or no longer exists", 400);
    }
    req.user = freshUser;
    return next();
});


module.exports = {signup, login, getCurrenUser, authentication};