import resource from 'resource-router-middleware';

const os = require('os');
import * as script from '../lib/system.service.js';

export default ({ config, db }) => resource({

  /** Property name to store preloaded entity on `request`. */
  id : 'temperature',

  /** GET / - List all entities */
  index({ params }, res) {
    if (os.platform() === 'linux') {
      script.sendCommandRequest('temperature').then((response) => {
        const responseJSON = JSON.parse(response);
        if (responseJSON.status !== 'success') return res.status(500).json({ status: 'failed', code : 500, message : responseJSON.message });
        res.status(200).json({ status: 'success', code : 0, message : responseJSON.message.trim() });
      }).catch((err) => {
        res.status(500).json({ status: 'failed', code : 500, message : err.message });
      });
    } else {
      res.status(200).json({ status: 'failed', code : -1, message : 'Unsupported platform' });
    }
  }
});