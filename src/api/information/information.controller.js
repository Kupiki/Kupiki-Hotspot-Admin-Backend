'use strict';

const os = require('os');

export function index(req, res) {
  let information = [
    { 'name': 'architecture', 'value': os.arch() },
    { 'name': 'CPU', 'value': os.cpus().length },
    { 'name': 'hostname', 'value': os.hostname() },
    { 'name': 'OS Type', 'value': os.type() },
    { 'name': 'plateform', 'value': os.platform() },
    { 'name': 'release', 'value': os.release() }
  ];
  res.status(200).json({information});
}
