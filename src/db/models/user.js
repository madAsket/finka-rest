'use strict';
const { Model, DataTypes } = require('sequelize');
const sequelize = require("../../db/config/database")
const bcrypt = require("bcrypt");
const AppError = require('../../utils/appError');
const project = require('./project');
const user = sequelize.define('user',{
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER
  },
  firstName: {
    type: DataTypes.STRING
  },
  lastName: {
    type: DataTypes.STRING
  },
  userType: {
    type: DataTypes.ENUM('0','1','2'),
    defaultValue:'0',
    allowNull:false,
    validate:{
      notNull:{
        msg: 'userType cannot be null'
      },
      notEmpty:{
        msg:"userType cannot be empty"
      }
    }
  },
  avatar: {
    type: DataTypes.STRING
  },
  email: {
    type: DataTypes.STRING,
    allowNull:false,
    validate:{
      notNull:{
        msg: 'Email cannot be null'
      },
      notEmpty:{
        msg:"Email cannot be empty"
      },
      isEmail:{
        msg:"Invalid email"
      }
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull:false,
    validate:{
      notNull:{
        msg: 'Password cannot be null'
      },
      notEmpty:{
        msg:"Password cannot be empty"
      },

    }
  },
  confirmPassword: {
    type: DataTypes.VIRTUAL,
    set(value){
      if(this.password.length < 5){
        throw new AppError("Password must contains at least 5 characters", 400);
      }
      if(value !== this.password){
        throw new AppError('Passwords are not the same', 400);
      }else{
          const hashPassword = bcrypt.hashSync(value, 10);
          this.setDataValue('password', hashPassword);
      }
    }
  },
  createdAt: {
    allowNull: false,
    type: DataTypes.DATE
  },
  updatedAt: {
    allowNull: false,
    type: DataTypes.DATE
  },
  deletedAt:{
    type: DataTypes.DATE
  }
},{
  freezeTableName:true,
  modelName:'user',
  paranoid:true
});

user.hasMany(project, {foreignKey:"owner"});
project.belongsTo(user, {
  foreignKey:"owner"
})

module.exports = user;
// module.exports = (DataTypes, DataTypes) => {
//   class user extends Model {
//     /**
//      * Helper method for defining associations.
//      * This method is not a part of DataTypes lifecycle.
//      * The `models/index` file will call this method automatically.
//      */
//     static associate(models) {
//       // define association here
//     }
//   }
//   user.init({
//     firstName: DataTypes.STRING,
//     lastName: DataTypes.STRING,
//     userType: DataTypes.ENUM,
//     avatar: DataTypes.STRING,
//     email: DataTypes.STRING,
//     password: DataTypes.STRING
//   }, {
//     DataTypes,
//     modelName: 'user',
//   });
//   return user;
// };