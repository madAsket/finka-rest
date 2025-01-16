const AppError = require("../utils/appError")
const sendDevError = (err, res) =>{
    let data = {
        status:err.status || "error",
        message:err.message,
        stack:err.stack
    };
    if(err.fieldErrors){
        data.fieldErrors = err.fieldErrors
    }
    return res.status(err.statusCode || 500).json(data);
}

const sendProdError = (err, res) =>{
    if(err.isOperational){
        let data = {
            status:err.status || "error",
            message:err.message,
        };
        if(err.fieldErrors){
            data.fieldErrors = err.fieldErrors
        }
        return res.status(err.statusCode || 500).json(data);
    }
    return res.status(500).json({
        status:'error',
        message:"Something went wrong"
    })
}

const globalErrorHandler = (err, req,res, next)=>{
    if(err.name === "JsonWebTokenError"){
        err = new AppError("Invalid auth token", 401);
    }
    if(err.name === "SequelizeUniqueConstraintError"){
        err = new AppError(err.errors[0].message, 400);
    }
    if(err.name === "SequelizeValidationError"){
        let errorsForFields = {};
        err.errors.forEach((item)=>{
            errorsForFields[item.path] = item.message;
        })
        err = new AppError("Validation error", 400, errorsForFields);
    }
    if(process.env.NODE_ENV === "development"){
        return sendDevError(err, res)
    }
    return sendProdError(err, res);
}

module.exports = globalErrorHandler;