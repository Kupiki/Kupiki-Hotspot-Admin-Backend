'use strict';

import express from 'express';
import passport from 'passport';
import {signToken} from '../auth.service';

var router = express.Router();

router.post('/', function(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    var error = err || info;
    if(error) {
      return res.status(401).json(error);
    }
    if(!user) {
      return res.status(404).json({message: 'Something went wrong, please try again.'});
    }
    
    var token = signToken(user._id, user.role);
    
    var result = {
      token: token,
      language: user.language
    };
    // res.json({ token });
    res.json(result);
  })(req, res, next);
});

export default router;
