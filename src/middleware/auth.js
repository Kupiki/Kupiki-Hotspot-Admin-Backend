import config from '../config.json';
import expressJwt from 'express-jwt';
import compose from 'composable-middleware';

const validateJwt = expressJwt({
  secret: config.secret
});

export default ({ config, dbs }) => {
  let authService = {};
  
  authService.isAuthenticated = () => {
    return compose()
    // Validate jwt
      .use(function(req, res, next) {
        // allow access_token to be passed through query parameter as well
        if(req.query && req.query.hasOwnProperty('access_token')) {
          req.headers.authorization = `Bearer ${req.query.access_token}`;
        }
        // IE11 forgets to set Authorization header sometimes. Pull from cookie instead.
        if(req.query && typeof req.headers.authorization === 'undefined' && req.cookies) {
          req.headers.authorization = `Bearer ${req.cookies.token}`;
        }
        validateJwt(req, res, next);
      })
      // Attach users to request
      .use(function(req, res, next) {
        dbs.localDb.User.find({
          where: {
            _id: req.user._id
          }
        })
          .then(user => {
            if(!user) {
              return res.status(401).end();
            }
            req.user = user;
            next();
          })
          .catch(err => next(err));
      });
  };
  
  return authService;
}
