import * as script from '../lib/system.service.js';
import resource from 'resource-router-middleware';
import { formatBytes } from '../lib/util.js';

const diskspace = require('diskspace');

export default ({ config, db }) => resource({

  /** Property name to store preloaded entity on `request`. */
  id : 'disk',

  /** GET / - List all entities */
  index({ params }, res) {
    let disk = {
      free: '',
      freeUnit: '',
      total: '',
      totalUnit: '',
      chartMaxY: 0,
      percent: undefined
    };
    diskspace.check('/', (err, result) => {
      if (err || result.status !== 'READY') {
        res.status(500).json(disk);
      } else {
        let freeDisk = formatBytes(result.free, 0);
        let usedDisk = formatBytes(result.used, 0);
        let totalDisk = formatBytes(result.total, 0);
        disk.free = freeDisk.value.toFixed(1);
        disk.freeUnit = freeDisk.unit;
        disk.used = usedDisk.value.toFixed(1);
        disk.usedUnit = usedDisk.unit;
        disk.total = totalDisk.value.toFixed(1);
        disk.totalUnit = totalDisk.unit;
        disk.percent = 100 * result.used / result.total;
        disk.chartMaxY = result.total;

        disk.chartData = [];
        script.sendCommandRequest('data disk').then((result) => {
          const responseJSON = JSON.parse(result);
          if (responseJSON.status !== 'success') return res.status(500).json({ status: 'failed', code : 500, message : responseJSON.message });
          responseJSON.message.split('\n').forEach((elt) => {
            if (elt.indexOf(':') > 0) {
              let stat = elt.split(':');
              if (stat.length === 2) {
                stat[1] = parseFloat(stat[1].replace(',', '.'));
                disk.chartData.push(stat)
              }
            }
          });
          disk.chartData = JSON.stringify(disk.chartData);
          res.status(200).json({ status: 'success', code : 0, message : disk });
        })
        .catch((err) => {
          res.status(500).json({ status: 'failed', code : 500, message : err.message });
        })
      }
    });
  }

});
