var Q = require('q');
var bitcoin = require('bitcoin');

(function() {

    var minConfirms = 1;
    var lastBlockIndex = 0;
    var that = {};

    var client = new bitcoin.Client({
        host: 'localhost',
        port: 22555,//8332,
        user: 'dogecoinrpc',//'user',
        pass: '9cwyjH8kQkJkhr42AWK2eaKxAQJ3qbRogbNY5bBzyj9w'//'123456'
    });

    function initService() {
        Coin.findByCode('BTC').done( function( err, coin ) {
            lastBlockIndex = coin.lastBlockIndex;
        } );
    }

    function getBlockCount() {
        var deferred = Q.defer();
        client.getBlockCount( function(err, cnt) {
            if (err) {
                deferred.reject( err );
            } else {
                console.log( 'block count: ' + ( cnt - 1 ) );
                deferred.resolve( cnt - 1 );
            }
        });
        return deferred.promise;
    }

    function getBlockHash( index ) {
        var deferred = Q.defer();
        client.getBlockHash( index, function(err, hash) {
            if (err) {
                deferred.reject( err );
            } else {
                deferred.resolve( hash );
            }
        });
        return deferred.promise;
    }

    function getBlock( blockHash ) {
        var deferred = Q.defer();
        client.getBlock( blockHash, function(err, block) {
            if (err) {
                deferred.reject( err );
            } else {
                lastBlockIndex++;
                deferred.resolve( block );
            }
        });
        return deferred.promise;
    }

    function getTransactionsSinceBlock( blockHash ) {
        var deferred = Q.defer();
        client.listSinceBlock( blockHash, minConfirms, function(err, transactions) {
            if (err) {
                deferred.reject( err );
            } else {
                lastBlockIndex++;
                deferred.resolve( transactions );
            }
        });
        return deferred.promise;
    }

    function getTransactions( transactions ) {
        var i, len = transactions.length;
        var arr = [];

        for ( i = 0; i < len; i++ ) {
            arr.push( getTransaction( transactions[ i ] ) );
        }
        return Q.allSettled( arr ).then( function() {
            console.log( 'complete ' );
        });
    };

    function getTransaction( txHash ) {
        var deferred = Q.defer();
        client.getRawTransaction( txHash, function(err, data) {
            if (err) {
                deferred.reject( err );
            } else {
                client.decodeRawTransaction( data, function(err, txData) {
                    if (err) {
                        deferred.reject( err );
                    } else {
                        var i, len = txData.vin.length;
                        for ( i = 0; i < len; i++ ) {
                            console.log( txData.vin[ i ] );
                        }
                        /*
                        var i, len = txData.vout.length;
                        for ( i = 0; i < len; i++ ) {
                            var value = txData.vout[ i ].value;
                            var address = txData.vout[ i ].scriptPubKey.addresses[ 0 ];
                        }
                        */
                        deferred.resolve( txData );
                    }
                });
            }
        });
        return deferred.promise;
    }

    function getLastTransactionFromBlockIndex(blockIndex) {
        that.lastBlockIndex = blockIndex;
        return getBlockHash( that.lastBlockIndex );
    }

    that.getLastTransactions = function() {
        if ( lastBlockIndex == 0 ) {
            getBlockCount()
                .then( getLastTransactionFromBlockIndex )
                .then( getBlock )
                .then( function( block ) { return getTransactions( block.tx ); } );
        } else {
            //getLastTransactionFromBlockIndex( lastBlockIndex );
        }
    }


    initService();
    //that.getLastTransactions();

    return that;
})();