'use strict';

export default function(sequelize, DataTypes) {
  const radacct = sequelize.define('radacct', {
    radacctid: {
      type: new DataTypes.BIGINT(),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    acctsessionid: {
      type: new DataTypes.STRING(64),
      allowNull: false
    },
    acctuniqueid: {
      type: new DataTypes.STRING(32),
      allowNull: false
    },
    username: {
      type: new DataTypes.STRING(64),
      allowNull: false
    },
    groupname: {
      type: new DataTypes.STRING(64),
      allowNull: false
    },
    realm: {
      type: new DataTypes.STRING(64),
      allowNull: true
    },
    nasipaddress: {
      type: new DataTypes.STRING(15),
      allowNull: false
    },
    nasportid: {
      type: new DataTypes.STRING(15),
      allowNull: true
    },
    nasporttype: {
      type: new DataTypes.STRING(32),
      allowNull: true
    },
    acctupdatetime: {
      type: new DataTypes.DATE(),
      allowNull: true
    },
    acctstarttime: {
      type: new DataTypes.DATE(),
      allowNull: true
    },
    acctstoptime: {
      type: new DataTypes.DATE(),
      allowNull: true
    },
    acctsessiontime: {
      type: new DataTypes.INTEGER(),
      allowNull: true
    },
    acctauthentic: {
      type: new DataTypes.STRING(32),
      allowNull: true
    },
    connectinfo_start: {
      type: new DataTypes.STRING(50),
      allowNull: true
    },
    connectinfo_stop: {
      type: new DataTypes.STRING(50),
      allowNull: true
    },
    acctinputoctets: {
      type: new DataTypes.BIGINT(),
      allowNull: true
    },
    acctoutputoctets: {
      type: new DataTypes.BIGINT(),
      allowNull: true
    },
    calledstationid: {
      type: new DataTypes.STRING(50),
      allowNull: false
    },
    callingstationid: {
      type: new DataTypes.STRING(50),
      allowNull: false
    },
    acctterminatecause: {
      type: new DataTypes.STRING(32),
      allowNull: false
    },
    servicetype: {
      type: new DataTypes.STRING(32),
      allowNull: true
    },
    framedprotocol: {
      type: new DataTypes.STRING(32),
      allowNull: true
    },
    framedipaddress: {
      type: new DataTypes.STRING(15),
      allowNull: false
    },
    acctstartdelay: {
      type: new DataTypes.INTEGER(),
      allowNull: true
    },
    acctstopdelay: {
      type: new DataTypes.INTEGER(),
      allowNull: true
    },
    xascendsessionsvrkey: {
      type: new DataTypes.STRING(10),
      allowNull: true
    }
  }, {
    freezeTableName: true,
    tableName: 'radacct',
    createdAt: false,
    updatedAt: false,
    deletedAt: false
  });
  
  return radacct;
}
