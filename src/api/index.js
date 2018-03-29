import { Router } from 'express';
import authLib from '../middleware/auth'

import auth from './auth.js';
import users from './users.js';
import cpu from './cpu.js';
import disk from './disk.js';
import memory from './memory.js';
import uptime from './uptime.js';
import temperature from './temperature.js';
import information from './information.js';
import netflow from './netflow.js';
import services from './services.js';
import system from './system.js';
import hotspot from './hotspot.js';
import portal from './portal.js';
import freeradius from './freeradius.js';

export default ({ config, dbs }) => {
	let api = Router();
  let authService = authLib({ config, dbs });
  
	api.use('/auth'         , auth({ config, dbs }));
  api.use('/users'        , authService.isAuthenticated(), users({ config, dbs }));
  api.use('/cpu'          , authService.isAuthenticated(), cpu({ config, dbs }));
  api.use('/disk'         , authService.isAuthenticated(), disk({ config, dbs }));
  api.use('/memory'       , authService.isAuthenticated(), memory({ config, dbs }));
  api.use('/uptime'       , authService.isAuthenticated(), uptime({ config, dbs }));
  api.use('/temperature'  , authService.isAuthenticated(), temperature({ config, dbs }));
  api.use('/information'  , authService.isAuthenticated(), information({ config, dbs }));
  api.use('/netflow'      , authService.isAuthenticated(), netflow({ config, dbs }));
  api.use('/services'     , authService.isAuthenticated(), services({ config, dbs }));
  api.use('/system'       , authService.isAuthenticated(), system({ config, dbs }));
  api.use('/hotspot'      , authService.isAuthenticated(), hotspot({ config, dbs }));
  api.use('/portal'       , authService.isAuthenticated(), portal({ config, dbs }));
  api.use('/freeradius'   , authService.isAuthenticated(), freeradius({ config, dbs }));
  
  return api;
}
