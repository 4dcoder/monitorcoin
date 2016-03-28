var Q = require('q');
var rest = require('rest-validator');


function getCoins( user, coins ) {
    var deferred = Q.defer();

    var CoinModel = Coin.find().where( { userVisible: true } );
    if ( coins.length > 0 ) {
        CoinModel = CoinModel.where( { code: coins } );
    }
    CoinModel.done(function(err, coins) {
        if (err) {
            deferred.reject( err )
        } else {
            deferred.resolve( [ user, coins ] );
        }
    });
    return deferred.promise;
}

function getWallets(user, coins) {
    var deferred = Q.defer();

    var coinIds = [];
    var coinsById = {};
    for ( var i in coins ) {
        var coin = coins[ i ];
        coinIds.push( coin.id );
        coinsById[ coin.id ] = coin;
    }

    Wallet.find()
        .where( { userId: user.id } )
        .where( { coinId: coinIds } )
        .done( function( err, wallets ) {
            if (err) {
                deferred.reject( err )
            } else {
                for ( var i in wallets ) {
                    var wallet = wallets[ i ];
                    wallet = rest.formatJSON( [ 'id', 'address', 'coinId' ], wallet );
                    wallet.coin = rest.formatJSON( [ 'name', 'code' ], coinsById[ wallet.coinId ] );
                    delete wallet[ 'coinId' ];
                    wallets[ i ] = wallet;
                }
                console.log( wallets );
                deferred.resolve( wallets );
            }
    } );
    return deferred.promise;
}

function getCoinsAndWallets(user, coins) {
    var deferred = Q.defer();

    var coinIds = [];
    var coinsById = {};
    for ( var i in coins ) {
        var coin = coins[ i ];
        coinIds.push( coin.id );
        coinsById[ coin.id ] = coin;
    }

    Wallet.find()
        .where( { userId: user.id } )
        .where( { coinId: coinIds } )
        .done( function( err, wallets ) {
            if (err) {
                deferred.reject( err )
            } else {
                for ( var i in wallets ) {
                    var wallet = wallets[ i ];
                    wallet = rest.formatJSON( [ 'id', 'address', 'coinId' ], wallet );
                    wallet.coin = rest.formatJSON( [ 'name', 'code' ], coinsById[ wallet.coinId ] );
                    delete coinsById[ wallet.coinId ];
                    delete wallet[ 'coinId' ];

                    wallets[ i ] = wallet;
                }
                for ( var i in coinsById ) {
                    var coin = coinsById[ i ];
                    wallet = {
                        id : 0,
                        address : "",
                        coin : rest.formatJSON( [ 'name', 'code' ], coin )
                    };
                    wallets.push(wallet);
                }
                deferred.resolve( wallets );
            }
        } );
    return deferred.promise;
}


module.exports = {

    get: function (req, res) {
        var coinsSelected = [];
        if ( req.body.coins != null) {
            coinsSelected = req.body.coins.split(",");
        }

        rest.getUser( req )
            .then( function( user ) { return getCoins( user, coinsSelected ); } )
            .spread( getWallets )
            .then( function( wallets ){ res.json( { success: true, wallets: wallets } ); } )
            .fail( function( err ) {
                res.json( { success: false, error: err} );
            });
    },

    getAll: function(req, res) {
        var coinsSelected = [];
        if ( req.body.coins != null) {
            coinsSelected = req.body.coins.split(",");
        }

        rest.getUser(req)
            .then( function( user ) { return getCoins( user, coinsSelected ); } )
            .spread( getCoinsAndWallets )
            .then( function( wallets ){ res.json( { success: true, wallets: wallets } ); } )
            .fail( function( err ) {
                res.json( { success: false, error: err} );
            });
    },

    createSocket: function(req, res) {
        console.log( BlockChainWS );
        BlockChainWS.subscribe( '1dice8EMZmqKvrGE4Qc9bUFf9PX3xaYDp',  function( data ) {
            console.log(data);
        } );
        res.json( {success: true }  );
    }
}