class AppError extends Error{
    constructor(message, statusCode, fieldErrors=null){
        super(message);
        this.fieldErrors = fieldErrors;
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith(4) ? 'fail' : 'error';
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = AppError;