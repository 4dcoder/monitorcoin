/**
 * isAuthenticated
 *
 * @module      :: Policy
 * @description :: Simple policy to allow any authenticated user
 *                 Assumes that your login action in one of your controllers sets `req.session.authenticated = true;`
 * @docs        :: http://sailsjs.org/#!documentation/policies
 *
 */
module.exports = function(req, res, next) {

    var token = req.session.token ? req.session.token : req.body.token;

    User.findOneByToken(token).then( function (user) {
        if ( !user ) {
            res.redirect('/');
        } else {
            req.user = user;
            next();
        }
    } )
    .fail(function (err) {
            res.redirect('/');
    } );
};
