'use strict';

const os = require('os');

import * as script from '../../system/system.service';

export function temperature(req, res) {
  if (os.platform() === 'linux') {
    script.execPromise('temperature')
      .then(function (result) {
        res.status(200).json({status: 'success', result: {code: 0, message: result.stdout.trim() }});
      })
      .catch(function (err) {
        console.log('System update error');
        console.log(err);
        res.status(200).json({status: 'failed', result: {code: err.code, message: err.stderr}});
      });
  } else {
    res.status(200).json({ status: 'failed', result: { code : -1, message : 'Unsupported platform'} });
  }
}
