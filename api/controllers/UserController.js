/**
 * UserController
 *
 * @module      :: Controller
 * @description	:: A set of functions called `actions`.
 *
 *                 Actions contain code telling Sails how to respond to a certain type of request.
 *                 (i.e. do stuff, then send some JSON, show an HTML page, or redirect to another URL)
 *
 *                 You can configure the blueprint URLs which trigger these actions (`config/controllers.js`)
 *                 and/or override them with custom routes (`config/routes.js`)
 *
 *                 NOTE: The code you write here supports both HTTP and Socket.io automatically.
 *
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */

module.exports = {

    register: function (req, res) {
        /*
        if ( _.has( req.body, "username" ) ) {
            return res.json( {success: false, error: MyError.get( 2 )}  );
        } else if ( _.has( req.body, "password" ) ) {
            return res.json( {success: false, error: MyError.get( 2 )}  );
        } else if ( _.has( req.body, "passwordConfirmation" ) ) {
            return res.json( {success: false, error: MyError.get( 2 )}  );
        }
        */
        if (req.body.password !== req.body.passwordConfirmation) {
            return res.json( {success: false, error: MyError.get( 2 )}  );
        }

        User.create( {
          username: req.body.username,
          password: req.body.password,
          email: req.body.email
        } ).done(function(err, user) {
              if (err) {
                  return res.json( {success: false, error: MyError.get( 8 )}  );
              } else {
                  return res.json( {success: true, user: user} );
              }

          });
    },


  /**
   * Action blueprints:
   *    `/user/update`
   */
   update: function (req, res) {
    
    // Send a JSON response
    return res.json({
      hello: 'world'
    });
  },


  /**
   * Action blueprints:
   *    `/user/destroy`
   */
   destroy: function (req, res) {
    
    // Send a JSON response
    return res.json({
      hello: 'world'
    });
  },


    /**
    * Action blueprints:
    *    `/user/get`
    */
    get: function (req, res) {

        // Send a JSON response
        return res.json({
          hello: 'world'
        });
    },


    login: function (req, res) {

        var restVal = require('rest-validator');
        var missing = restVal.validateArray(req.body, [ "username", "password"]);
        if ( missing != null) {
            return res.json( {success: false, error: MyError.get( 3, [ missing ])}  );
        }

        var bcrypt = require('bcrypt');

        function validateUser(err, user, cb) {

            if (err) {
                res.json({ error: 'DB error' }, 500);
                cb( true );
            }
            if (user) {
                bcrypt.compare(req.body.password, user.password, function (err, match) {
                    if (err) res.json({ error: 'Server error' }, 500);
                    console.log(match ? 'true' : 'false');
                    if ( match ) {
                        req.session.token = user.token;
                        res.json( { success: true, 'user':user } );
                        cb( true );
                    } else {
                        // invalid password
                        if (req.session.token)
                            req.session.token = null;
                        res.json( {success: false, error: MyError.get( 2 )} );
                        cb( true );
                    }
                });
            } else {
                cb( false );
            }
        }
        User.findOneByUsername(req.body.username).done(function (err, user) {

            if ( !validateUser( err, user, function( valid ) {

                if ( !valid ) {
                    User.findOneByEmail(req.body.username).done(function (err, user) {
                        if ( !validateUser( err, user, function( valid ) {

                            if ( !valid ) {
                                res.json( {success: false, error: MyError.get( 1 )} );
                            }
                        } ) );
                    } );
                }
            } ) );
        });
    },

    validateToken: function ( req, res ) {
        var token = req.body.token;
        if ( !token ) {
            token = req.session.token;
        }

        User.findOneByToken( token ).done( function ( err, user ) {
            if ( err )
                res.json( { error: 'DB error' }, 500 );

            if ( user ) {
                res.json( { success: false, error: MyError.get( 1 ) } );
            }

            res.json( user );
        } );
    },




  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to UserController)
   */
  _config: {}

  
};
