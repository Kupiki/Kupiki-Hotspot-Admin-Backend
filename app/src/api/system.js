import { Router } from 'express'

const os = require('os');
import * as script from '../lib/system.service';

let socket = undefined;

export function register(socketToRegister) {
  console.log('Socket registered for System API');
  socket = socketToRegister;
}

export default ({ config, dbs }) => {
  const system = new Router();

  system.get('/check', (req, res) => {
    if (os.platform() === 'linux') {
      script.sendCommandRequest('system check').then((response) => {
        const responseJSON = JSON.parse(response);
        if (responseJSON.status !== 'success') return res.status(500).json({ status: 'failed', code : 500, message : responseJSON.message });
        res.status(200).json({ status: 'success', code : 0, message : responseJSON.message.trim() });
      }).catch((err) => {
        res.status(500).json({ status: 'failed', code : 500, message : err.message });
      });
    } else {
      res.status(200).json({ status: 'failed', code : -1, message : 'Unsupported platform' });
    }
  });

  system.get('/update', (req, res) => {
    if (socket) {
      socket.emit('system:update', {status: 'progress', result: ''});
      script.sendCommandRequest('system update').then((response) => {
        const responseJSON = JSON.parse(response);
        if (responseJSON.status !== 'success') return res.status(500).json({ status: 'failed', code : 500, message : responseJSON.message });
        script.sendCommandRequest('system upgrade').then((response) => {
          const responseJSON = JSON.parse(response);
          if (responseJSON.status !== 'success') return res.status(500).json({ status: 'failed', code : 500, message : responseJSON.message });
          socket.emit('system:update', {status: 'finished', result: ''});
          res.status(200).json({ status: 'success', code : 0, message : 'System updated finished.' });
        }).catch((err) => {
          res.status(500).json({ status: 'failed', code : 500, message : err.message });
        });
      }).catch((err) => {
        res.status(500).json({ status: 'failed', code : 500, message : err.message });
      });
    } else {
      res.status(500).json({ status: 'failed', code: -1, message: 'Socket not registred' });
    }
  });

  system.get('/reboot', (req, res) => {
    if (os.platform() === 'linux') {
      script.sendCommandRequest('system reboot').then((response) => {
        const responseJSON = JSON.parse(response);
        if (responseJSON.status !== 'success') return res.status(500).json({ status: 'failed', code : 500, message : responseJSON.message });
        res.status(200).json({ status: 'success', code : 0, message : responseJSON.message.trim().split(',')[0] });
      }).catch((err) => {
        res.status(500).json({ status: 'failed', code : 500, message : err.message });
      });
    } else {
      res.status(500).json({ status: 'failed', code : -1, message : 'Unsupported platform' });
    }
  });

  system.get('/shutdown', (req, res) => {
    if (os.platform() === 'linux') {
      script.sendCommandRequest('system shutdown').then((response) => {
        const responseJSON = JSON.parse(response);
        if (responseJSON.status !== 'success') return res.status(500).json({ status: 'failed', code : 500, message : responseJSON.message });
        res.status(200).json({ status: 'success', code : 0, message : responseJSON.message.trim().split(',')[0] });
      }).catch((err) => {
        res.status(500).json({ status: 'failed', code : 500, message : err.message });
      });
    } else {
      res.status(200).json({ status: 'failed', code : -1, message : 'Unsupported platform' });
    }
  });

  return system;
};


