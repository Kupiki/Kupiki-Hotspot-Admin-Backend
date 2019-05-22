import { Router } from 'express'

export default ({ config, dbs }) => {
  const users = new Router();

  function validationError(res, statusCode) {
    statusCode = statusCode || 422;
    return (err) => {
      return res.status(statusCode).json(err);
    };
  }

  users.get('/me', (req, res, next) => {
    const userId = req.user._id;

    return dbs.localDb.User.find({
      where: {
        _id: userId
      },
      attributes: [
        '_id',
        'name',
        'username',
        'language',
        'email',
        'provider'
      ]
    })
      .then(user => { // don't ever give out the password or salt
        if(!user) {
          return res.status(401).end();
        }
        return res.status(200).json(user);
      })
      .catch(err => next(err));
  });

  users.put('/:id/password', (req, res) => {
    const userId = req.user._id;
    const oldPass = String(req.body.oldPassword);
    const newPass = String(req.body.newPassword);

    return dbs.localDb.User.find({
      where: {
        _id: userId
      }
    })
      .then(user => {
        if(user.authenticate(oldPass)) {
          user.password = newPass;
          return user.save()
            .then(() => {
              res.status(200).end();
            })
            .catch(validationError(res));
        } else {
          return res.status(403).end();
        }
      });
  });

  users.post('/language', (req, res, next) => {
    const userId = req.user._id;

    dbs.localDb.User.findOne({
      where: {
        _id: userId
      }
    })
      .then(user => {
        if (!user) {
          res.status(200).json({ status: 'failed', code: 500, message: 'Unable to save user language.'});
        }
        user.update({
          language: req.body.language
        }).then(function () {
          res.status(200).json({ status: 'success', code: 0, message: 'New language selected'});
        });
      })
      .catch(err => next(err));
  });

  return users;
};


