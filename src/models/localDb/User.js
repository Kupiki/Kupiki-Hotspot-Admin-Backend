'use strict';

import crypto from 'crypto';

const validatePresenceOf = function(value) {
  return value && value.length;
};

export default function(sequelize, DataTypes) {
  const User = sequelize.define('User', {
    _id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    name: DataTypes.STRING,
    username: DataTypes.STRING,
    language: DataTypes.STRING,
    email: {
      type: DataTypes.STRING,
      unique: {
        msg: 'The specified email address is already in use.'
      },
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: true
      }
    },
    provider: DataTypes.STRING,
    salt: DataTypes.STRING
    
  }, {
    
    /**
     * Virtual Getters
     */
    getterMethods: {
      // Public profile information
      profile() {
        return {
          name    : this.name,
          language: this.language,
          role    : this.role
        };
      },
      
      // Non-sensitive info we'll be putting in the token
      token() {
        return {
          _id: this._id,
          role: this.role
        };
      }
    },
    
    /**
     * Pre-save hooks
     */
    hooks: {
      beforeCreate(user) {
        return user.updatePassword(user)
          .then( (hashedPassword) => {
            user.password = hashedPassword;
          })
          .catch( (err) => {
            if (err) {
              console.log(err);
              throw new Error(err)
            }
          });
      },
      beforeUpdate(user) {
        if(user.changed('password')) {
          return user.updatePassword(user)
            .then( (hashedPassword) => {
              user.password = hashedPassword;
            })
            .catch( (err) => {
              if (err) {
                console.log(err);
                throw new Error(err)
              }
            });
        }
      }
    }
  });
  
  User.prototype.authenticate = function(password, callback) {
    if(!callback) {
      return this.password === this.encryptPassword(password);
    }
    
    let _this = this;
    this.encryptPassword(password, function(err, pwdGen) {
      if(err) {
        callback(err);
      }
      
      if(_this.password === pwdGen) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    });
  };
  
  User.prototype.encryptPassword = function(password, callback) {
    if(!password || !this.salt) {
      return callback ? callback(null) : null;
    }
    
    const defaultIterations = 10000;
    const defaultKeyLength = 64;
    const salt = new Buffer(this.salt, 'base64');
    
    if(!callback) {
      // eslint-disable-next-line no-sync
      return crypto.pbkdf2Sync(password, salt, defaultIterations, defaultKeyLength, 'sha256')
        .toString('base64');
    }
    
    return crypto.pbkdf2(password, salt, defaultIterations, defaultKeyLength, 'sha256',
      function(err, key) {
        if(err) {
          callback(err);
        }
        return callback(null, key.toString('base64'));
      });
  };
  
  User.prototype.makeSalt = function(...args) {
    let byteSize;
    let callback;
    let defaultByteSize = 16;
    
    if(typeof arguments[0] === 'function') {
      callback = arguments[0];
      byteSize = defaultByteSize;
    } else if(typeof arguments[1] === 'function') {
      callback = arguments[1];
    } else {
      throw new Error('Missing Callback');
    }
    
    if(!byteSize) {
      byteSize = defaultByteSize;
    }
    
    return crypto.randomBytes(byteSize, function(err, salt) {
      if(err) {
        callback(err);
      }
      return callback(null, salt.toString('base64'));
    });
  };
  
  User.prototype.updatePassword = function(user) {
    return new Promise(function (resolve, reject) {
      if (!user.password) return reject('Password missing');
    
      if (!validatePresenceOf(user.password)) {
        return reject('Invalid password');
      }
      user.makeSalt((saltErr, salt) => {
        if (saltErr) {
          return reject(saltErr);
        }
        user.salt = salt;
        user.encryptPassword(user.password, (encryptErr, hashedPassword) => {
          if (encryptErr) {
            return reject(encryptErr);
          }
          return resolve(hashedPassword);
        });
      });
    });
  };
  
  return User;
}
