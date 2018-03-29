import resource from 'resource-router-middleware';

const os = require('os');

export default ({ config, db }) => resource({
  
  /** Property name to store preloaded entity on `request`. */
  id : 'uptime',
  
  /** GET / - List all entities */
  index({ params }, res) {
    res.status(200).json({'uptime': os.uptime()});
  }
  
});