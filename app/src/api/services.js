import resource from 'resource-router-middleware';
import * as script from '../lib/system.service.js';

export default ({ config, db }) => resource({
  
  id : 'services',
  
  index({ params }, res) {
    script.execPromise('services')
      .then( (result) => {
        let services = [];
        result.stdout.split('\n').forEach(elt => {
          if (elt.trim().length > 0) {
            let arrTmp = elt.trim().split(/[\s\t]+/);
            services.push({
              name: arrTmp[3],
              status: (arrTmp[1] === '+'),
            });
          }
        });
        if (services.length === 0) {
          res.status(200).json({status: 'failed', code: -1, message: 'No services found' });
        } else {
          res.status(200).json({status: 'success', code: 0, message: services });
        }
      })
      .catch( (error) => {
        res.status(200).json({ status: 'failed', code : error.code, message : error.stderr });
      });
  },
  
  update({ params, body }, res) {
    if (typeof body.status !== 'undefined') {
      let command = 'service '+ params.services;
      body.status ? command += ' start' : command += ' stop';
      script.execPromise(command)
        .then( () => {
          res.status(200).json({ status: 'success', code : 0, message : '' });
        })
        .catch( error => {
          res.status(200).json({ status: 'failed', code : error.code, message : error.stderr });
        })
    } else {
      res.status(200).json({ status: 'failed', code : -1, message : 'Switch service - Unable to detect service' });
    }
  }
  
});