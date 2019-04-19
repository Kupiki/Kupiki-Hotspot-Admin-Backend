import resource from 'resource-router-middleware';
import * as script from '../lib/system.service.js';

export default ({ config, db }) => resource({
  
  id : 'portal',
  
  index({ params }, res) {
    script.execPromise('portal getConfiguration')
      .then( result => {
        res.status(200).json({status: 'success', code: 0, message: JSON.parse(result.stdout) });
      })
      .catch( error => {
        console.log(error);
        res.status(200).json({ status: 'failed', code : error.code, message : error.stderr });
      });
  },
  
  update({ params, body }, res) {
    if (params.portal === 'configuration' && typeof body.configuration !== 'undefined') {
      let fs = require('fs');
      fs.unlink('/tmp/portal.conf', error => {
        if (error && error.code !== 'ENOENT') {
          res.status(200).json({status: 'failed', code: error.errno, message: error });
        } else {
          let stream = fs.createWriteStream('/tmp/portal.conf');
          stream.once('open', () => {
            stream.write(JSON.stringify(body.configuration, null, 4));
            stream.end();
          });
          stream.on('error', () => {
            res.status(200).json({status: 'failed', code: -1, message: 'Unable to write the portal configuration file' });
          });
          stream.on('close', () => {
            script.execPromise('portal saveConfiguration')
              .then( () => {
                res.status(200).json({ status: 'success', code : 0, message : '' });
              })
              .catch( () => {
                res.status(200).json({status: 'failed', code: -1, message: 'Unable to write the portal configuration file' });
              });
          });
        }
      });
    }
  }
  
});