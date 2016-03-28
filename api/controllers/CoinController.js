var rest = require('rest-validator');

module.exports = {

    get: function (req, res) {

        var rest = require('rest-validator');

        rest.getUser( req ).done( function( user, err ) {
            if ( err ) {
                res.json( { success: false, error: MyError.get( 1 ) } );
                return;
            }
            Coin.find().where( { 'userVisible' : true } ).done( function (err, coins) {
                if ( err ) {
                    res.json( { success: false, error: MyError.get( 1 ) } );
                }

                res.json( { success: true, coins: rest.formatJSON( [ 'name', 'code' ], coins ) } );
            } );
        } );
    },

    getAll: function (req, res) {
        Coin.find().done( function (err, coins) {
            if ( err ) {
                res.json( { success: false, error: MyError.get( 1 ) } );
            }

            res.json( { success: true, coins: rest.formatJSON( [ 'name', 'code' ], coins ) } );
        } );
    }

}
