import resource from 'resource-router-middleware';
import * as script from '../lib/system.service.js';

export default ({ config, db }) => resource({

  id : 'portal',

  index({ params }, res) {
    script.sendCommandRequest('portal load').then((response) => {
      const responseJSON = JSON.parse(response);
      if (responseJSON.status !== 'success') return res.status(500).json({ status: 'failed', code : 500, message : responseJSON.message });
      res.status(200).json({status: 'success', code: 0, message: JSON.parse(responseJSON.message) });
    })
    .catch( error => {
      res.status(200).json({ status: 'failed', code : error.code, message : error.stderr });
    });
  },

  update({ params, body }, res) {
    if (params.portal === 'configuration' && typeof body.configuration !== 'undefined') {
      script.sendCommandRequest('portal save '+JSON.stringify(body.configuration)).then((response) => {
        const responseJSON = JSON.parse(response);
        if (responseJSON.status !== 'success') return res.status(500).json({ status: 'failed', code : 500, message : responseJSON.message });
        res.status(200).json({status: 'success', code: 0, message: responseJSON.message });
      }).catch((err) => {
        res.status(200).json({ status: 'failed', code : 500, message : err.message });
      })
    }
  }
});