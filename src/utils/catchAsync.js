const catchAsync = (fn)=>{
    const errorHandler = (req, res, next)=>{
        fn(req, res, next).catch((err)=>next(err));
    }
    return errorHandler;
}

module.exports = catchAsync;