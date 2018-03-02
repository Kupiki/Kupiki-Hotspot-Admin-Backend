'use strict';
/*eslint no-process-env:0*/

// Development specific configuration
// ==================================
module.exports = {

  // Sequelize connection options
  sequelize: {
    localDb: {
      uri: 'sqlite://',
      options: {
        logging: false,
        storage: 'dev.sqlite',
        define: {
          timestamps: false
        }
      }
    },
    freeradius: {
      username: 'root',
      password: 'raspbian',
      database: 'radius',
      // host: '192.168.1.43',
      host: '127.0.0.1',
      dialect: 'mariadb',
      insecureAuth : true
    }
  },

  client: {
    host: '192.168.10.160',
    port: '3000'
  },
  
  // Seed database on startup
  seedDB: true

};
