require('dotenv').config({path: `${process.cwd()}/.env`});
const express = require("express");
const app = express();
const authRoute = require("./route/authRoute");
const catchAsync = require('./utils/catchAsync');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controller/errorController');
const API_URI = process.env.API_URI;
const API_VERSION = process.env.API_VERSION
const APP_PORT = process.env.NODE_LOCAL_PORT

app.use(express.json());


//Routes
app.use(`${API_URI}${API_VERSION}/auth`, authRoute);

// 404
app.use("*", catchAsync(async (req, res, next)=>{
    throw new AppError("Route is not found", 404);
}));

app.use(globalErrorHandler);

app.listen(APP_PORT, function(){
    console.log('Listening on port ', APP_PORT);
});