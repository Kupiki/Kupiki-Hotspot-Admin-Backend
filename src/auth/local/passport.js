import passport from 'passport';
import {Strategy as LocalStrategy} from 'passport-local';

function localAuthenticate(User, username, password, done) {
  User.find({
    where: {
      username: username.toLowerCase()
    }
  })
    .then(user => {
      if(!user) {
        return done(null, false, {
          message: 'Username or password incorrect'
        });
      }
      user.authenticate(password, function(authError, authenticated) {
        if(authError) {
          return done(authError);
        }
        if(!authenticated) {
          return done(null, false, { message: 'Username or password incorrect' });
        } else {
          return done(null, user);
        }
      });
    })
    .catch(err => done(err));
}

export function setup(User) {
  passport.use(new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password'
  }, function(username, password, done) {
    return localAuthenticate(User, username, password, done);
  }));
}
