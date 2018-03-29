import resource from 'resource-router-middleware';

import * as script from '../lib/system.service.js';

export default ({ config, db }) => resource({
  
  /** Property name to store preloaded entity on `request`. */
  id : 'netflow',
  
  /** GET / - List all entities */
  index({ params }, res) {
    script.execPromise('netflow stats')
      .then( result => {
        let netflowStats = [];
        result.stdout.split('\n').forEach(function (elt) {
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
      })
      .catch( error => {
        res.status(200).json({ status: 'failed', code: error.code, message: error.stderr });
      });
  }
  
});