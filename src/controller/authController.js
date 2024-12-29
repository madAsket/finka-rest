const catchAsync = require('../utils/catchAsync');
const UserService = require("../services/UserService");

const signup = catchAsync(async (req, res, next) => {
    const {email, username, password, confirmPassword} = req.body;
    const data = await UserService.signup(email.toLowerCase(), username, password, confirmPassword)
    return res.status(201).json({
        status: 'success',
        data: data
    });
});

const login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;
    const data = await UserService.login(email.toLowerCase(), password);
    return res.json({
        status: "success",
        data: data
    })
});

const googleAuth = catchAsync(async (req, res, next) => {
    const { token } = req.body;
    const data = await UserService.googleAuth(token);
    return res.json({
        status: "success",
        data: data
    });
});

const getCurrenUser = catchAsync(async (req, res, next) => {
    const data = await UserService.getCurrenUserData(req.user);
    return res.json({
        status: "success",
        data: data
    })
});

const changePassword = catchAsync(async (req, res, next)=>{
    const { password, confirmPassword } = req.body;
    await UserService.changePassword(req.user, password, confirmPassword);
    return res.json({
        status:"success"
    })
});


const changeProfile = catchAsync(async (req, res, next)=>{
    const {firstName, lastName} = req.body;
    const user = await UserService.updateProfile(req.user, firstName, lastName);
    return res.json({
        status:"success",
        data:user
    })
});

const authentication = catchAsync(async (req, res, next) => {
    await UserService.authentication(req);
    return next();
});

module.exports = { signup, login, getCurrenUser, googleAuth,
    authentication, 
    changePassword, changeProfile};