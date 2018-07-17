'use strict';

export default function(sequelize, DataTypes) {
  const dictionary = sequelize.define('dictionary', {
    id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    Type: {
      type: DataTypes.STRING(30),
      allowNull: true
    },
    Attribute: {
      type: DataTypes.STRING(64),
      allowNull: true
    },
    Value: {
      type: DataTypes.STRING(64),
      allowNull: true
    },
    Format: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    Vendor: {
      type: DataTypes.STRING(32),
      allowNull: true
    },
    RecommendedOP: {
      type: DataTypes.STRING(32),
      allowNull: true
    },
    RecommendedTable: {
      type: DataTypes.STRING(32),
      allowNull: true
    },
    RecommendedHelper: {
      type: DataTypes.STRING(32),
      allowNull: true
    },
    RecommendedTooltip: {
      type: DataTypes.STRING(512),
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
