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

  system.get('/upgrade', (req, res) => {
    if (os.platform() === 'linux') {
      script.execPromise('system check')
        .then( (result) => {
          res.status(200).json({ status: 'success', code: 0, message: result.stdout.trim() });
        })
        .catch( (err) => {
          res.status(200).json({ status: 'failed', code: err.code, message: err.stderr });
        });
    } else {
      res.status(200).json({ status: 'failed', code : -1, message : 'Unsupported platform' });
    }
  });

  system.get('/reboot', (req, res) => {
    if (os.platform() === 'linux') {
      const reboot = script.exec('system reboot');
      reboot.stderr.on('data', (data) => {
        console.log(`reboot stderr: ${data}`);
      });
      reboot.on('close', (code) => {
        if (code !== 0) {
          console.log(`reboot process exited with code ${code}`);
          res.status(500).json({ status: 'failed', code : code, message : 'Reboot process exited abnormaly.<br/>Check server logs.' });
        } else {
          res.status(200).json({ status: 'success', code : 0, message : 'Reboot executed in one minute' });
        }
      });
    } else {
      res.status(500).json({ status: 'failed', code : -1, message : 'Unsupported platform' });
    }
  });

  system.get('/shutdown', (req, res) => {
    if (os.platform() === 'linux') {
      const shutdown = script.exec('system shutdown');
      shutdown.stderr.on('data', (data) => {
        console.log(`shutdown stderr: ${data}`);
      });
      shutdown.on('close', (code) => {
        if (code !== 0) {
          console.log(`shutdown process exited with code ${code}`);
          res.status(200).json({ status: 'failed', code : code, message : 'Shutdown process exited abnormaly.<br/>Check server logs.' });
        } else {
          res.status(200).json({ status: 'success', code : 0, message : 'Shutdown executed in one minute' });
        }
      });
    } else {
      res.status(200).json({ status: 'failed', code : -1, message : 'Unsupported platform' });
    }
  });

  system.get('/update', (req, res) => {
    if (socket) {
      socket.emit('system:update', {status: 'progress', result: ''});
      script.execPromise('system update')
        .then( () => {
          script.execPromise('system upgrade')
            .then( () => {
              socket.emit('system:update', {status: 'finished', result: ''});
              res.status(200).json({ status: 'success', code: 0, message: 'System updated finished.' });
            })
            .catch( err => {
              console.log(err);
              res.status(500).json({ status: 'failed', code: err.code, message: err.stderr });
            })
        })
        .catch( err => {
          console.log(err);
          res.status(500).json({ status: 'failed', code: err.code, message: err.stderr });
        });
    } else {
      res.status(500).json({ status: 'failed', code: -1, message: 'Socket not registred' });
    }
  });

  return system;
};


