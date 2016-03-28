var Q = require('q'),
    _ = require('underscore');

function Commands() {

    var that = {};
    var _this = this;
    _this.coinExchangesParams = {};
    /*
    _this.insertCoinExchanges = function( coinExchanges ) {
        var arr = [];
        for( var exchangeName in coinExchanges) {
            console.log( 'Storing: ' + exchangeName );
            var coinExchange = coinExchanges[ exchangeName ];
            var i, len = coinExchange.length;
            console.log( len );
            for ( i = 0; i < len; i++ ) {
                var coinExchangeParams = coinExchange[ i ];
                var fn = function() {
                    return CoinExchange.create(coinExchangeParams).done( function( err, result ) {
                        if ( err ) {
                            deferred.reject( MyError.get( 6, exchangeName ) );
                        } else {
                            deffered.resolve
                        }
                    } );
                }
                arr.push( fn );
            }
        }
        return Q.allSettled( arr );
    };
    */
     _this.insertCoinExchanges = function( coinExchanges ) {
         var arr = [];
         for( var exchangeName in coinExchanges) {
            console.log( 'Storing: ' + exchangeName );
            var coinExchange = coinExchanges[ exchangeName ];
            var i, len = coinExchange.length;
            console.log( exchangeName + ' ' + len + ' rows' );
            for ( i = 0; i < len; i++ ) {
                var coinExchangeParams = coinExchange[ i ];
                arr.push( CoinExchange.create(coinExchangeParams) );
                Coin.updateOrCreate( coinExchangeParams.coinCode, coinExchangeParams.coinCode ).done( function( err, coin ) {});
            }
         }
         return Q.allSettled( arr );
     };


    _this.coinMarketCap = function( coinExchange ) {
        var request = require('request');
        var jsdom = require('jsdom');
        var deferred = Q.defer();
        request({uri: 'http://coinmarketcap.com/'}, function(error, response, body) {
            jsdom.env( {
                html: body,
                scripts: [ 'http://code.jquery.com/jquery-1.10.2.min.js'],
                done: function (err, window) {
                    var $ = window.jQuery;
                    if (err) {
                        deferred.reject( MyError.get( 5, 'http://coinmarketcap.com/') );
                    } else {
                        var exchangeParams = [];
                        $('#currencies > tbody  > tr').each( function() {
                            var btcPrice = $( this ).find('.price').attr('data-btc');
                            if ( btcPrice == undefined ) {
                                btcPrice = 0;
                            }
                            //console.log( $( this ).attr( 'id' ) );
                            exchangeParams.push( {
                                coinCode: $( this ).attr( 'id' ),
                                exchangeId: coinExchange.id,
                                minValue: 0,
                                maxValue: 0,
                                price: parseFloat( btcPrice )
                            } );
                        });
                        //_this.insertCoinExchanges( coinExchange.name, coinExchangeParams );
                        _this.coinExchangesParams[ coinExchange.name ] = exchangeParams;
                        console.log( 'coinmarketcap DONE' );
                        deferred.resolve();
                    }
                }
            } );
        } );
        return deferred.promise;
    };

    _this.cryptsy = function( coinExchange ) {
        var CryptsyAPI = require('cryptsy');
        var cryptsy = new CryptsyAPI('', '');
        var deferred = Q.defer();
        cryptsy.api('marketdatav2', null, function (err, data) {
            if (err) {
                deferred.reject( MyError.get( 5, 'https://cryptsy.com/') );
            } else {
                var exchangeParams = [];
                for (var marketName in data.markets) {
                    var market = data.markets[ marketName ];

                    if ( market.secondarycode === 'BTC' ) {
                        //console.log( market.primarycode );
                        var btcPrice = market.lasttradeprice;
                        if ( btcPrice == undefined ) {
                            btcPrice = 0;
                        }
                        exchangeParams.push( {
                            coinCode: market.primarycode,
                            exchangeId: coinExchange.id,
                            minValue: 0,
                            maxValue: 0,
                            price: parseFloat( btcPrice )
                        } );
                    }
                }
                _this.coinExchangesParams[ coinExchange.name ] = exchangeParams;
                console.log( 'cryptsy DONE' );
                //_this.insertCoinExchanges( coinExchange.name, coinExchangeParams );
                deferred.resolve();
            }
        });
        return deferred.promise;
    };

    _this.mintpal = function( coinExchange ) {
	    var request = require('request');
        var deferred = Q.defer();
        request( { uri: 'https://api.mintpal.com/market/summary/BTC', json:true }, function(error, response, body) {
            if (error) {
                deferred.reject( MyError.get( 5, 'https://api.mintpal.com/') );
            } else {
                var exchangeParams = [];
            	_.each( body, function( market ) {
                    console.log( market );
                    if ( market.exchange !== 'BTC' ) {
                        return;
                    }

                    var btcPrice = market.last_price;
                    if ( btcPrice == undefined ) {
                        btcPrice = 0;
                    }

                    exchangeParams.push( {
                        coinCode: market.code,
                        exchangeId: coinExchange.id,
                        minValue: 0,
                        maxValue: 0,
                        price: parseFloat( btcPrice )
                    } );

                    _this.coinExchangesParams[ coinExchange.name ] = exchangeParams;
                    console.log( 'mintpal DONE' );
                    deferred.resolve();
            	} );
            }
        } );
        return deferred.promise;
    };

    _this.coinMarketIO = function( coinExchange ) {
        var request = require('request');
        var jsdom = require('jsdom');
        var deferred = Q.defer();
        request({uri: 'https://www.coinmarket.io/'}, function(error, response, body) {
            jsdom.env( {
                html: body,
                scripts: [ 'http://code.jquery.com/jquery-1.10.2.min.js'],
                done: function (err, window) {
                    var $ = window.jQuery;
                    if (err) {
                        deferred.reject( MyError.get( 5, 'https://www.coinmarket.io/') );
                    } else {
                        var exchangeParams = [];
                        $('a[href^="/market/"]').each( function() {

                            var btcPrice = 0;
                            var coinCode = '';
                            $( this ).find('span').each( function() {

                                if ( $.isNumeric( $(this).text() ) ) {
                                    btcPrice = $(this).text();
                                } else {
                                    coinCode = $(this).text().split('/')[ 0 ];
                                }
                            } );
                            //console.log( $( this ).attr( 'id' ) );

                            if ( coinCode == '' ) {
                                return;
                            }
                            exchangeParams.push( {
                                coinCode: coinCode,
                                exchangeId: coinExchange.id,
                                minValue: 0,
                                maxValue: 0,
                                price: parseFloat( btcPrice )
                            } );
                        });
                        //_this.insertCoinExchanges( coinExchange.name, coinExchangeParams );
                        _this.coinExchangesParams[ coinExchange.name ] = exchangeParams;
                        console.log( 'coinmarketIO DONE' );
                        deferred.resolve();
                    }
                }
            } );
        } );
        return deferred.promise;
    };

    //not working
    _this.poloniex = function( coinExchange ) {
        var request = require('request');
        var jsdom = require('jsdom');
        var deferred = Q.defer();
        request( { uri: 'https://www.poloniex.com/exchange', strictSSL:false }, function(error, response, body) {
            jsdom.env( {
                html: body,
                scripts: [ 'http://code.jquery.com/jquery-1.10.2.min.js'],
                done: function (err, window) {
                    var $ = window.jQuery;
                    if ( err ) {
                        deferred.reject( MyError.get( 5, 'https://www.poloniex.com/exchange') );
                    } else {
                        var exchangeParams = [];
                        $( window.document ).ready( function() {
                            setTimeout(function() {
                                // call your code here that you want to run after all $(document).ready() calls have run

                                $( 'span[id^="BTC_"]' ).each( function() {
                                    var btcPrice = $( this ).text();
                                    var coinCode = $( this ).attr('id').replace( 'BTC_', '').replace( 'last', '');
                                    console.log( coinCode + ' ' + btcPrice );
                                    if ( btcPrice == undefined ) {
                                        btcPrice = 0;
                                    }

                                    exchangeParams.push( {
                                        coinCode: coinCode,
                                        exchangeId: coinExchange.id,
                                        minValue: 0,
                                        maxValue: 0,
                                        price: parseFloat( btcPrice )
                                    } );
                                });
                                //_this.insertCoinExchanges( coinExchange.name, coinExchangeParams );
                                _this.coinExchangesParams[ coinExchange.name ] = exchangeParams;
                                console.log( 'poloniex DONE' );
                                deferred.resolve();
                            }, 1000);
                        } );
                    }
                }
            } );
        } );
        return deferred.promise;
    };

    _this.initImport = function( exchanges ) {
        var i, len = exchanges.length;
        var arr = [];

        for ( i = 0; i < len; i++ ) {

            var exchange = exchanges[ i ];
            console.log( 'Connecting with: ' + exchange.functionName );
            var fn = _this[ exchange.functionName ];
            arr.push( fn( exchange ) );
        }
        return Q.allSettled( arr ).then( function() {
            return _this.insertCoinExchanges( _this.coinExchangesParams );
        });
    };

    that.CoinExchangeImport = function ( done ) {
        _this.coinExchangesParams = {};
        Exchange.findByActive( 1 )
            .then( _this.initImport )
            .then( function() {
                console.error( 'DONE' );
                done();
            } )
            .fail( function( err ) {
                console.error( 'error' );
                console.error( err );
            } );
    };

    return that;
};

module.exports = Commands();


