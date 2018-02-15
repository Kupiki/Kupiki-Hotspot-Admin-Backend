'use strict';

import * as script from '../../system/system.service';

export function getStats(req, res) {
  script.execPromise('netflow stats')
    .then(function (result) {
      var netflowStats = [];
      result.stdout.split('\n').forEach(function (elt) {
        if (elt.trim().length > 0) {
          var arrTmp = elt.trim().split(/:[\s\t]/);
          netflowStats.push({
            name: arrTmp[0].trim(),
            value: arrTmp[1].trim()
          });
        }
      });
      if (netflowStats.length === 0) {
        res.status(200).json({status: 'failed', result: {code: -1, message: 'No statistics found'}});
      } else {
        res.status(200).json({status: 'success', result: {code: 0, message: netflowStats}});
      }
    })
    .catch(function (error) {
      console.log(error);
      res.status(200).json({status: 'failed', result: {code: error.code, message: error.stderr}});
    });
}

