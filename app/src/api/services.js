import resource from 'resource-router-middleware';
import * as script from '../lib/system.service.js';

export default ({ config, db }) => resource({

  id : 'services',

  index({ params }, res) {
    script.sendCommandRequest('service all').then((response) => {
      const responseJSON = JSON.parse(response);
      if (responseJSON.status !== 'success') return res.status(500).json({ status: 'failed', code : 500, message : responseJSON.message });
      let services = [];
      responseJSON.message.split('\n').forEach((elt) => {
        if (elt.trim().length > 0) {
          let arrTmp = elt.trim().split(/[\s\t]+/);
          services.push({
            name: arrTmp[3],
            status: (arrTmp[1] === '+'),
          });
        }
      });
      if (services.length === 0) {
        return res.status(200).json({status: 'failed', code: -1, message: 'No services found' });
      }
      res.status(200).json({status: 'success', code: 0, message: services });
    }).catch((err) => {
      res.status(500).json({ status: 'failed', code : 500, message : err.message });
    });
  },

  update({ params, body }, res) {
    if (typeof body.status !== 'undefined') {
      let command = 'service';
      body.status ? command += ' start' : command += ' stop';
      command += ' '+ params.services;
      console.log(command)
      script.sendCommandRequest(command).then((response) => {
        const responseJSON = JSON.parse(response);
        if (responseJSON.status !== 'success') return res.status(500).json({ status: 'failed', code : 500, message : responseJSON.message });
        res.status(200).json({ status: 'success', code : 0, message : '' });
      }).catch((err) => {
        res.status(500).json({ status: 'failed', code : 500, message : err.message });
      });
    } else {
      res.status(200).json({ status: 'failed', code : -1, message : 'Switch service - Unable to detect service' });
    }
  }

});