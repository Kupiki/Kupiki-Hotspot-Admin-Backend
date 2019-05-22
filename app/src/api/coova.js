import { Router } from 'express';
import * as script from '../lib/system.service.js';

export default ({ config, dbs }) => {
  const coova = new Router();

  coova.get('/macauth', (req, res) => {
    script.sendCommandRequest('macauth load').then((response) => {
      const responseJSON = JSON.parse(response);
      if (responseJSON.status !== 'success') return res.status(500).json({ status: 'failed', code : 500, message : responseJSON.message });
      res.status(200).json({status: 'success', code: 0, message: responseJSON.message });
    })
    .catch( error => {
      res.status(500).json({ status: 'failed', code : error.code, message : error.stderr });
    });
  });

  coova.put('/macauth', (req, res) => {
    if (req.body.configuration) {
      script.sendCommandRequest('macauth save '+ req.body.configuration.active + ' ' + req.body.configuration.password).then((response) => {
        const responseJSON = JSON.parse(response);
        if (responseJSON.status !== 'success') return res.status(500).json({ status: 'failed', code : 500, message : responseJSON.message });
        if (req.body.restart) {
          script.sendCommandRequest('service restart chilli').then((response) => {
            res.status(200).json({status: 'success', code: 0, message: responseJSON.message });
          })
          .catch( error => {
            res.status(200).json({ status: 'failed', code : error.code, message : error.stderr });
          });
        } else {
          res.status(200).json({status: 'success', code: 0, message: responseJSON.message });
        }
      })
      .catch( error => {
        res.status(200).json({ status: 'failed', code : error.code, message : error.stderr });
      });
    } else {
      res.status(500).json({status: 'failed', code: 500, message: "Missing configuration parameters"});
    }
  });

  return coova
}
