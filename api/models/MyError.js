var _= require( 'underscore' );
module.exports = {
    1: {
        errorMessage: 'Wrong combination Username / Password',
        errorCode: 1
    },
    2: {
        errorMessage: 'Passwords don\'t match',
        errorCode: 2
    },
    3: {
        errorMessage: 'Parameter missing: #1',
        errorCode: 3
    },
    4: {
        errorMessage: 'No coins found',
        errorCode: 4
    },
    5: {
        errorMessage: 'Error connecting with: #1',
        errorCode: 5
    },
    6: {
        errorMessage: 'Error inserting coin exchange from: #1',
        errorCode: 6
    },
    7: {
        errorMessage: 'Database Error: #1',
        errorCode: 7
    },
    8: {
        errorMessage: 'User exist',
        errorCode: 8
    },
    9: {
        errorMessage: 'Coins #1 not found',
        errorCode: 9
    },

    get: function( code, values ) {
        if ( !_.isArray( values ) ) {
            values = [ values ];
        }
        if ( values != null) {
            for ( var i = 1; i <= values.length; i++ ) {
                this[ code ].errorMessage = this[ code ].errorMessage.replace( '#' + i, values[ i - 1] );
            }
        }

        return this[ code ];
    }
}
