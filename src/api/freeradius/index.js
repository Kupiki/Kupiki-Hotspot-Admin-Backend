'use strict';

import {Router} from 'express';
import * as controller from './freeradius.controller';
import * as auth from '../../auth/auth.service';

var router = new Router();

router.get('/users', auth.hasRole('admin'), controller.getUsers);

router.get('/user/radcheck', auth.hasRole('admin'), controller.getUserRadcheck);
router.post('/user/radcheck', auth.hasRole('admin'), controller.saveUserRadcheck);

router.get('/user/radreply', auth.hasRole('admin'), controller.getUserRadreply);

router.get('/user/userinfo', auth.hasRole('admin'), controller.getUserUserinfo);
router.post('/user/userinfo', auth.hasRole('admin'), controller.saveUserUserinfo);

router.get('/user/lastsession', auth.hasRole('admin'), controller.getLastSession);
router.get('/user/sessionstotal', auth.hasRole('admin'), controller.getSessionsTotal);
router.get('/user/allsessions', auth.hasRole('admin'), controller.getAllSessions);

router.post('/user/check', auth.hasRole('admin'), controller.checkUserConnectivity);
router.post('/user/disconnect', auth.hasRole('admin'), controller.disconnectUser);
router.post('/user/delete', auth.hasRole('admin'), controller.deleteUser);
// router.post('/user/create', auth.hasRole('admin'), controller.createUser);

module.exports = router;
