import config from './config.json';
// import freeradius_dictionary from './models/data/freeradius_dictionary';
import sql from './models/data/freeradius_dictionary'
import Sequelize from 'sequelize';

const Op = Sequelize.Op;

export default callback => {
	let dbs = {};
	
  dbs.freeradius = {
    Sequelize,
    sequelize: new Sequelize(config.sequelize.freeradius)
  };
  dbs.freeradius.userinfo = dbs.freeradius.sequelize.import('./models/freeradius/userinfo.js');
  dbs.freeradius.radreply = dbs.freeradius.sequelize.import('./models/freeradius/radreply.js');
  dbs.freeradius.radcheck = dbs.freeradius.sequelize.import('./models/freeradius/radcheck.js');
  dbs.freeradius.radacct = dbs.freeradius.sequelize.import('./models/freeradius/radacct.js');
  dbs.freeradius.dictionary = dbs.freeradius.sequelize.import('./models/freeradius/dictionary.js')

  dbs.freeradius.dictionary.count().then( attributes => {
    if (attributes === 0) {
      sql.sqlRequests.forEach( sqlRequest => {
        dbs.freeradius.sequelize.query(sqlRequest).then(results => {})
      })
    }
  });

  dbs.localDb = {
    Sequelize,
    sequelize: new Sequelize(config.sequelize.localDb.uri, config.sequelize.localDb.options)
  };
  dbs.localDb.User = dbs.localDb.sequelize.import('./models/localDb/User.js');
  dbs.localDb.User.findOrCreate({
		where: {
			username: {
				[Op.eq] : 'admin'
			}
		},
		defaults: {
			provider: 'local',
			language: 'en',
			role: 'admin',
			name: 'Admin',
			username: 'admin',
			password: 'admin'
		}

	}).then(() => console.log('finished populating users'))
		.catch(err => console.log('error populating users', err));
  
  dbs.localDb.sequelize.sync().then(dbs.freeradius.sequelize.sync().then(callback(dbs)))
  
}
