'use strict';
const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Project extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      // 
    }
  }
  Project.init({
    name: {
      type: DataTypes.STRING,
      allowNull:false,
      validate:{
        notNull:{
          msg: 'Project name cannot be null'
        },
        notEmpty:{
          msg:"Project name cannot be empty"
        }
      }
    },
    currency:{
      type: DataTypes.STRING,
      allowNull:false,
      defaultValue:"EUR"
    },
    owner:{
      type:DataTypes.INTEGER,
      allowNull:false,
      references:{
        model:'User',
        key:"id"
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
    deletedAt: {
      type: DataTypes.DATE
    }
  }, {
    sequelize,
    modelName: 'Project',
    paranoid:true,
    indexes: [
      {
        fields: ['owner'],
      },
    ]
  });
  return Project;
};