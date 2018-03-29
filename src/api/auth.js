import { Router } from 'express'
import jwt from 'jsonwebtoken'
import authLib from '../middleware/auth'

export default ({ config, dbs }) => {
  const auth = Router();
  let authService = authLib({ config, dbs });
  
  auth.get('/test', authService.isAuthenticated(), (req, res) => {
    res.status(200).json({ message: 'Hello sweetie', auth: req.isAuthenticated() })
  });
  
  auth.post('/login', (req, res) => {
    if (!req.body.username || !req.body.password) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    dbs.localDb.User.find({
        where: {
          username: req.body.username
        }
      })
      .then(user => {
        if (!user) return res.status(400).json({ message: 'No users' });
        user.authenticate(req.body.password, function(authError, authenticated) {
          if(authError) {
            return res.status(400).json({ message: 'Bad password (2)' })
          }
          if(!authenticated) {
            return res.status(400).json({ message: 'Bad password' })
          } else {
            const token = jwt.sign({_id: user._id},  config.secret, {
              expiresIn: '24h'
            });
            return res.status(200).json({ message: 'ok', 'token': token });
          }
        });
      })
      .catch((err) => {
        return res.status(400).json(err)
      })
  });
  
  return auth;
};


