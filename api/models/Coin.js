var Q = require( 'q' ),
    _ = require( 'underscore' );

module.exports = {

    autoUpdatedAt: false,

    attributes: {

        code: {
            type: 'string',
            required: true,
            unique: true
        },

        name: {
            type: 'string',
            unique: true,
            required: true
        },

        userVisible: {
            type: 'boolean'
        },

        lastBlockIndex: {
            type: 'int'
        }
    },

    updateOrCreate: function (code, name) {
        var deferred = Q.defer();

        if ( _.isUndefined( name ) ) {
            name = '';
        }

        Coin.findOne().where({code: code}).then( function (coin) {
            if ( coin ) {
                //no update
            } else {
                Coin.create({code: code, name: name}).done(function (e, coin) {deferred.resolve( coin );});
            }
        }).fail(function (err) {
                deferred.reject( err )
            } );

        return deferred.promise;
    }
}