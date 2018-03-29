import resource from 'resource-router-middleware';
import * as script from '../lib/system.service.js';
import { formatBytes } from '../lib/util.js';
const os = require('os');

export default ({ config, db }) => resource({
  
  /** Property name to store preloaded entity on `request`. */
  id : 'memory',
  
  /** GET / - List all entities */
  index({ params }, res) {
    let memory = {
      free: '',
      freeUnit: '',
      total: '',
      totalUnit: '',
      percent: undefined
    };
    let freeMem = formatBytes(os.freemem(), 0);
    let totalMem = formatBytes(os.totalmem(), 0);
    memory.free = freeMem.value.toFixed(0);
    memory.freeUnit = freeMem.unit;
    memory.total = totalMem.value.toFixed(0);
    memory.totalUnit = totalMem.unit;
    if (totalMem.value !== 0) memory.percent = 100*os.freemem()/os.totalmem();
    memory.chartMaxY = os.totalmem();
    memory.chartData = [];
    script.execPromise('data memory')
      .then( result => {
        result.stdout.split('\n').forEach(function(elt) {
          if (elt.indexOf(':') > 0) {
            let stat = elt.split(':');
            if (stat.length === 2) {
              stat[1] = parseFloat(stat[1].replace(',', '.'));
              memory.chartData.push(stat)
            }
          }
        });
        memory.chartData = JSON.stringify(memory.chartData);
        res.status(200).json(memory);
      })
      .catch( () => {
        res.status(200).json(memory);
      })
  }
  
});