import resource from 'resource-router-middleware';

import * as script from '../lib/system.service.js';

export default ({ config, db }) => resource({

  /** Property name to store preloaded entity on `request`. */
  id : 'netflow',

  /** GET / - List all entities */
  index({ params }, res) {
    script.sendCommandRequest('data netflow').then((response) => {
      const responseJSON = JSON.parse(response);
      if (responseJSON.status !== 'success') return res.status(500).json({ status: 'failed', code : 500, message : responseJSON.message });
      let netflowStats = [];
      responseJSON.message.split('\n').forEach(function (elt) {
        if (elt.trim().length > 0) {
          let arrTmp = elt.trim().split(/:[\s\t]/);
          netflowStats.push({
            name: arrTmp[0].trim(),
            value: arrTmp[1].trim()
          });
        }
      });
      if (netflowStats.length === 0) {
        res.status(200).json({ status: 'failed', code: -1, message: 'No statistics found' });
      } else {
        res.status(200).json({ status: 'success', code: 0, message: netflowStats });
      }
    }).catch((err) => {
      res.status(500).json({ status: 'failed', code : 500, message : err.message });
    });
    // script.execPromise('netflow stats')
    //   .then( result => {
    //     let netflowStats = [];
    //     result.stdout.split('\n').forEach(function (elt) {
    //       if (elt.trim().length > 0) {
    //         let arrTmp = elt.trim().split(/:[\s\t]/);
    //         netflowStats.push({
    //           name: arrTmp[0].trim(),
    //           value: arrTmp[1].trim()
    //         });
    //       }
    //     });
    //     if (netflowStats.length === 0) {
    //       res.status(200).json({ status: 'failed', code: -1, message: 'No statistics found' });
    //     } else {
    //       res.status(200).json({ status: 'success', code: 0, message: netflowStats });
    //     }
    //   })
    //   .catch( error => {
    //     res.status(200).json({ status: 'failed', code: error.code, message: error.stderr });
    //   });
  }

});