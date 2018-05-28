import resource from 'resource-router-middleware';

const os = require('os');

export default ({ config, db }) => resource({
  
  /** Property name to store preloaded entity on `request`. */
  id : 'information',
  
  /** GET / - List all entities */
  index({ params }, res) {
    let information = [
      { 'name': 'architecture', 'value': os.arch() },
      { 'name': 'CPU', 'value': os.cpus().length },
      { 'name': 'hostname', 'value': os.hostname() },
      { 'name': 'OS Type', 'value': os.type() },
      { 'name': 'plateform', 'value': os.platform() },
      { 'name': 'release', 'value': os.release() }
    ];
    res.status(200).json({ status: 'success', code : 0, message : information });
  
  }
  
});
