'use strict';

var express = require('express');
import * as auth from '../../auth/auth.service';
var controller = require('./netflow.controller');

var router = express.Router();

router.get('/stats', auth.isAuthenticated(), controller.getStats);

module.exports = router;
