'use strict';
const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class UserProjects extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      models.User.belongsToMany(models.Project, { through: this, foreignKey: 'userId'});
      models.Project.belongsToMany(models.User, { through: this, foreignKey: 'projectId'});
      models.Project.hasMany(this,  {foreignKey:'projectId'});
      this.belongsTo(models.Project, {foreignKey:'projectId'});
      models.User.hasMany(this, {foreignKey:'userId'});
      this.belongsTo(models.User, {foreignKey:'userId'});
    }
  }
  UserProjects.init({
    // id: {
    //   type: DataTypes.INTEGER,
    //   primaryKey: true,
    //   autoIncrement: true,
    //   allowNull: false,
    // },
    isCurrent: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    hidden: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    projectId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Project',
        key: 'id',
      },
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'User',
        key: 'id',
      },
      allowNull: false,
    },
  }, {
    sequelize,
    modelName: 'UserProjects'
  });
  
  return UserProjects;
};