const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env';
require('dotenv').config({path: `${process.cwd()}/${envFile}`});
if(process.env.NODE_ENV === 'production'){
  require("./sentrytool.js");
}
const Sentry = require("@sentry/node");
const express = require("express");
const app = express();
const cors = require('cors');
const authRoute = require("./route/authRoute");
const projectRoute = require("./route/projectRoute");
const mediaRoute = require("./route/mediaRoute");
const subscriptionRoute = require("./route/subscriptionRoute");
const catchAsync = require('./utils/catchAsync');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controller/errorController');
const API_URI = process.env.API_URI;
const API_VERSION = process.env.API_VERSION
const APP_PORT = process.env.NODE_LOCAL_PORT
const runCronJobs = require("./cronjobs");
const {sequelize} = require("./db/models");

app.use(express.json());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS.split(','),
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}));


//Routes
app.use(`${API_URI}${API_VERSION}/auth`, authRoute);
app.use(`${API_URI}${API_VERSION}/projects`, projectRoute);
app.use(`${API_URI}${API_VERSION}/upload`, mediaRoute);
app.use(`${API_URI}${API_VERSION}/subscription`, subscriptionRoute);

// Image upload settings
app.use(express.static("upload"));

// 404
app.use("*", catchAsync(async (req, res, next)=>{
    throw new AppError("Route is not found", 404);
}));
if(process.env.NODE_ENV === 'production'){
  Sentry.setupExpressErrorHandler(app);
}

app.use(globalErrorHandler);

app.listen(APP_PORT, '0.0.0.0', function(){
    console.log('Listening on port ', APP_PORT);
});


runCronJobs();

if(process.env.NODE_ENV === 'production'){
  sequelize.sync();
}