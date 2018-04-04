import { Router } from 'express'
import Sequelize from 'sequelize';
import async from 'async';

export default ({ config, dbs }) => {
  function handleError(res, statusCode) {
    statusCode = statusCode || 500;
    return function(err) {
      return res.status(statusCode).send(err);
    };
  }
  
  function upsert(model, condition, values) {
    return model
      .findOne({ where: condition })
      .then( obj => {
        if(obj) { // update
          // console.log(obj);
          return obj.update(values);
        }
        else { // insert
          // console.log(values)
          return model.create(values);
        }
      })
  }
  
  const freeradius = new Router();
  
  freeradius.get('/users', (req, res) => {
    let findUsers = "SELECT userinfo.*, radcheck.value as password, radcheck.attribute FROM userinfo, radcheck WHERE userinfo.username = radcheck.username AND radcheck.attribute LIKE '%-Password'";
    dbs.freeradius.sequelize.query(findUsers, { type: Sequelize.QueryTypes.SELECT })
      .then(users => {
        res.status(200).json({status: 'success', code: 0, message: users });
      })
      .catch(handleError(res));
  });
  
  freeradius.delete('/:username', (req, res) => {
    let asyncs = [];
    asyncs.push( callback => {
      dbs.freeradius.radcheck.destroy({ where: { username: req.params.username }}).then( () => {
        callback();
      });
    });
    asyncs.push( callback => {
      dbs.freeradius.userinfo.destroy({ where: { username: req.params.username }}).then( () => {
        callback();
      });
    });
    async.series(asyncs, err => {
      if (!err) {
        res.status(200).json({ status: 'success', code : 0, message : '' });
      } else {
        res.status(200).json({ status: 'failed', code : 500, message : `Unable to delete user ${req.params.username} and its attributes` });
      }
    });
  });
  
  freeradius.get('/radcheck', (req, res) => {
    return dbs.freeradius.radcheck.findAll({
      where: {
        username: req.query.username
      },
      attributes: { exclude : ['createdAt', 'updatedAt'] }
    }).then(userCheckAttributes => {
      res.status(200).json(userCheckAttributes);
    }).catch(handleError(res));
  });
  
  freeradius.post('/radcheck', (req, res) => {
    let attributes = [];
    (Array.isArray(req.body.radcheck))?attributes = req.body.radcheck:attributes.push(req.body.radcheck);
    if ( req.body.username ) {
      let asyncs = [];
      dbs.freeradius.radcheck.destroy({
        where: {
          username: req.body.username
        }
      }).then( () => {
        attributes.forEach( attribute => {
          asyncs.push( callback => {
            dbs.freeradius.radcheck.create({username: attribute.username, attribute: attribute.attribute, op: attribute.op, value: attribute.value }).then( () => {
              callback();
            });
          });
        });
        async.series( asyncs, err => {
          if (!err) {
            res.status(200).json({ status: 'success', code : 0, message : '' });
          } else {
            // console.log(err);
            res.status(200).json({ status: 'failed', code : 500, message : 'Unable to update attributes' });
          }
        });
      });
    } else {
      res.status(200).json({ status: 'failed', code : 500, message : 'Attributes is not array' });
    }
  });
  
  freeradius.get('/radreply', (req, res) => {
    return dbs.freeradius.radreply.findAll({
      where: {
        username: req.query.username
      },
      attributes: { exclude : ['createdAt', 'updatedAt'] }
    }).then( userReplyAttributes => {
      res.status(200).json(userReplyAttributes);
    }).catch(handleError(res));
  });
  
  freeradius.get('/userinfo', (req, res) => {
    return dbs.freeradius.userinfo.findOrCreate({
      where: {
        username: req.query.username
      },
      attributes: { exclude : ['createdAt', 'updatedAt'] }
    }).then(userInfo => {
      res.status(200).json(userInfo[0]);
    })
      .catch(handleError(res));
  });
  
  freeradius.post('/userinfo', (req, res) => {
    let userinfoData = req.body.userinfo;
    return upsert(dbs.freeradius.userinfo, {
      username: userinfoData.username
    }, {
      username              : userinfoData.username,
      firstname             : userinfoData.firstname,
      lastname              : userinfoData.lastname,
      email                 : userinfoData.email,
      department            : userinfoData.department,
      company               : userinfoData.company,
      workphone             : userinfoData.workphone,
      homephone             : userinfoData.homephone,
      mobilephone           : userinfoData.mobilephone,
      address               : userinfoData.address,
      city                  : userinfoData.city,
      state                 : userinfoData.state,
      country               : userinfoData.country,
      zip                   : userinfoData.zip,
      notes                 : userinfoData.notes,
      changeuserinfo        : userinfoData.changeuserinfo?parseInt(userinfoData.changeuserinfo):0,
      portalloginpassword   : userinfoData.portalloginpassword,
      enableportallogin     : userinfoData.enableportallogin?parseInt(userinfoData.enableportallogin):0
    }).then( () => {
      res.status(200).json({ status: 'success', code : 0, message : '' });
    })
      .catch( () => {
        res.status(200).json({ status: 'failed', code : 500, message : 'Error while saving data' });
      });
  });
  
  return freeradius
}
