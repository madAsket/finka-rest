'use strict';
const {
  Model
} = require('sequelize');
const bcrypt = require("bcrypt");
const AppError = require('../../utils/appError');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      models.Project.belongsTo(this, {foreignKey:"owner", as:"ownerUser"});
      // define association here
    }
  }
  User.init({
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
        isEmail:({
          msg:"Invalid email"
        })
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
          throw new AppError("Password must contains at least 5 characters", 400, 
            {password:"Password must contains at least 5 characters"});
        }
        if(value !== this.password){
          throw new AppError('Passwords are not the same', 400, 
            {password:"Passwords are not the same"}
          );
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
  }, {
    sequelize,
    modelName: 'User',
    paranoid:true,
    indexes: [
      {
        unique: true,
        fields: ['email'],
      },
    ],
    defaultScope: {
      attributes: { exclude: ['password','deletedAt'] },
    },
    scopes: {
      auth: {
        attributes: { include: ['password'] },
      }
    }
  });

  return User;
};