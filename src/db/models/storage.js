'use strict';
const {
  Model,
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Storage extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.Project, {foreignKey:"projectId"});
    }
  }
  Storage.init({
    name: {
      allowNull:false,
      type: DataTypes.STRING
    },
    currency:{
      type: DataTypes.STRING,
      allowNull:false,
      defaultValue:"EUR",
    },
    balance:{
      type: DataTypes.DECIMAL(20, 10),
      allowNull:false,
      defaultValue:0.0000000000
    },
    projectId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Project',
        key: 'id',
      },
    },
  }, {
    sequelize,
    modelName: 'Storage',
    paranoid:true,
    indexes: [
      {
        fields: ['projectId'],
      },
      {
        fields: ['balance'],
      },
    ]
  });

  return Storage;
};