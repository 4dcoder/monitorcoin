/**
 * User
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

module.exports = {

    attributes: {

      username: {
          type: 'string',
          required: true,
          unique:true,
          maxLength: 20,
          minLength: 5
      },

      email: {
          type: 'string',
          unique: true
      },

      admin: {
          type: 'boolean'
      },

      password: {
          type: 'string',
          required: true,
          minLength: 6
      },

      token: {
          type: 'string'
      }

    },


    beforeCreate: function (attrs, cb) {
        var bcrypt = require('bcrypt');
        attrs.admin = false;

        require('bcrypt').genSalt(10, function(err, salt) {
            if (err) return cb(err);

            bcrypt.hash(attrs.password, salt, function(err, hash) {
                if (err) return cb(err);

                attrs.password = hash;
                User.createRandomToken(attrs, cb);

            });
        });
    },

    createRandomToken: function(attrs, cb) {
        var crypto = require('crypto');

        crypto.randomBytes(48, function(ex, buf) {
            if (ex) {
                cb(ex);
            }
            var token = buf.toString('hex');
            User.findOneByToken(token).done( function(err, user) {
                if ( user == undefined) {
                    attrs.token = token;
                    cb();
                } else {
                    User.createRandomToken(attrs, cb);
                }
            } );

        });

    }



};
