'use strict';

var express = require('express');
import * as auth from '../../auth/auth.service';
var controller = require('./temperature.controller');

var router = express.Router();

router.get('/', auth.isAuthenticated(), controller.temperature);

module.exports = router;
