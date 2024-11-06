const {Sequelize} = require("sequelize");
require('dotenv').config({path: `${process.cwd()}/.env`});

const config = require('./config')[process.env.NODE_ENV]
const sequelize = new Sequelize(config);

module.exports = sequelize;