const diskspace = require('diskspace');
import * as script from '../lib/system.service.js';
import resource from 'resource-router-middleware';
import { formatBytes } from '../lib/util.js';

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
        script.execPromise('data disk')
          .then((result) => {
            result.stdout.split('\n').forEach(function (elt) {
              if (elt.indexOf(':') > 0) {
                let stat = elt.split(':');
                if (stat.length === 2) {
                  stat[1] = parseFloat(stat[1].replace(',', '.'));
                  disk.chartData.push(stat)
                }
              }
            });
            disk.chartData = JSON.stringify(disk.chartData)
            res.status(200).json(disk);
          })
          .catch(() => {
            res.status(500).json(disk);
          })
      }
    });
  }
  
});