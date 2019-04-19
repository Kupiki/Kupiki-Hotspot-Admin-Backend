'use strict';

export default function(sequelize, DataTypes) {
  const dictionary = sequelize.define('dictionary', {
    id: {
      type: new DataTypes.BIGINT(),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    Type: {
      type: new DataTypes.STRING(30),
      allowNull: true
    },
    Attribute: {
      type: new DataTypes.STRING(64),
      allowNull: true
    },
    Value: {
      type: new DataTypes.STRING(64),
      allowNull: true
    },
    Format: {
      type: new DataTypes.STRING(20),
      allowNull: true
    },
    Vendor: {
      type: new DataTypes.STRING(32),
      allowNull: true
    },
    RecommendedOP: {
      type: new DataTypes.STRING(32),
      allowNull: true
    },
    RecommendedTable: {
      type: new DataTypes.STRING(32),
      allowNull: true
    },
    RecommendedHelper: {
      type: new DataTypes.STRING(32),
      allowNull: true
    },
    RecommendedTooltip: {
      type: new DataTypes.STRING(512),
      allowNull: true
    }
  }, {
    freezeTableName: true,
    tableName: 'dictionary',
    createdAt: false,
    updatedAt: false,
    deletedAt: false
  });
  
  return dictionary;
}
