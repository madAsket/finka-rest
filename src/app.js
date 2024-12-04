require('dotenv').config({path: `${process.cwd()}/.env`});
const express = require("express");
const app = express();
const cors = require('cors');
const authRoute = require("./route/authRoute");
const projectRoute = require("./route/projectRoute");
const mediaRoute = require("./route/mediaRoute");
const catchAsync = require('./utils/catchAsync');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controller/errorController');
const API_URI = process.env.API_URI;
const API_VERSION = process.env.API_VERSION
const APP_PORT = process.env.NODE_LOCAL_PORT
const runCronJobs = require("./cronjobs");

app.use(express.json());

app.use(cors({
  origin: process.env.FRONT_URL,
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}));


//Routes
app.use(`${API_URI}${API_VERSION}/auth`, authRoute);
app.use(`${API_URI}${API_VERSION}/projects`, projectRoute);
app.use(`${API_URI}${API_VERSION}/upload`, mediaRoute);

// Image upload settings
app.use(express.static("upload"));
// app.use(express.static(`${__dirname}/upload`));

// 404
app.use("*", catchAsync(async (req, res, next)=>{
    throw new AppError("Route is not found", 404);
}));



app.use(globalErrorHandler);


app.listen(APP_PORT, function(){
    console.log('Listening on port ', APP_PORT);
});


runCronJobs();

// sequelize.sync();