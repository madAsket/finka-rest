const sendDevError = (err, res) =>{
    return res.status(err.statusCode || 500).json({
        status:err.status || "error",
        message:err.message,
        stack:err.stack
    });
}

const sendProdError = (err, res) =>{
    if(err.isOperational){
        return res.status(err.statusCode || 500).json({
            status:err.status || "error",
            message:err.message,
        });
    }
    return res.status(500).json({
        status:'error',
        message:"Something went wrong"
    })
}

const globalErrorHandler = (err, req,res, next)=>{
    if(process.env.NODE_ENV === "development"){
        return sendDevError(err, res)
    }
    return sendProdError(err, res);
}

module.exports = globalErrorHandler;