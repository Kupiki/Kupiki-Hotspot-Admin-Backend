import { Router } from 'express';
import * as script from '../lib/system.service.js';

export default ({ config, dbs }) => {
  const coova = new Router();
  
  coova.get('/macauth', (req, res) => {
    script.execPromise('coova getMacAuth')
      .then( result => {
        res.status(200).json({status: 'success', code: 0, message: JSON.parse(result.stdout) });
      })
      .catch( error => {
        console.log(error);
        res.status(200).json({ status: 'failed', code : error.code, message : error.stderr });
      });
  });
  
  coova.put('/macauth', (req, res) => {
    console.log(req.body);
    if (req.body.configuration) {
      script.execPromise('coova setMacAuth ' + req.body.configuration.active + ' ' + req.body.configuration.password)
        .then(result => {
          if (req.body.restart) {
            script.execPromise('service chilli restart')
              .then( () => {
                res.status(200).json({ status: 'success', code : 0, message : 'Configuration saved and service restarted' });
              })
              .catch(function (error) {
                res.status(200).json({ status: 'failed', code : error.code, message : error.stderr });
              });
          } else {
            res.status(200).json({ status: 'success', code : 0, message : 'Configuration saved' });
          }
        })
        .catch(error => {
          console.log(error);
          res.status(200).json({status: 'failed', code: error.code, message: error.stderr});
        });
    } else {
      res.status(200).json({status: 'failed', code: 500, message: "Missing configuration parameters"});
    }
  });

  return coova
}
