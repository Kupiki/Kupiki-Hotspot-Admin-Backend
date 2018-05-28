import resource from 'resource-router-middleware';

const os = require('os');
import * as script from '../lib/system.service.js';

export default ({ config, db }) => resource({
  
  /** Property name to store preloaded entity on `request`. */
  id : 'cpu',
  
  /** GET / - List all entities */
  index({ params }, res) {
    let cpu = {
      '1m': os.loadavg()[0].toFixed(1),
      '5m': os.loadavg()[1].toFixed(1),
      '15m': os.loadavg()[2].toFixed(1)
    };
    cpu.chartData = [];
    script.execPromise('data cpu')
      .then((result) => {
        result.stdout.split('\n').forEach(function(elt) {
          if (elt.indexOf(':') > 0) {
            let stat = elt.split(':');
            if (stat.length === 2) {
              stat[1] = parseFloat(stat[1].replace(',', '.'));
              cpu.chartData.push(stat)
            }
          }
        });
        cpu.chartData = JSON.stringify(cpu.chartData);
        res.status(200).json({ status: 'success', code : 0, message : cpu });
      })
      .catch(() => {
        res.status(500).json({ status: 'failed', code : 500, message : cpu });
      })
  }
  
});
