var restVal = require('rest-validator');
    _ = require('underscore'),
    datejs = require('datejs'),
    moment = require('moment'),
    Q = require('q');

var dateFormat = 'dddd, MMMM dd, yyyy h:mm:ss tt';

var FIVE_MINUTES = 'fiveMinutes';
var HOURLY = 'hourly';
var DAILY = 'daily';
var WEEKLY = 'weekly';
var MONTHLY = 'monthly';

function fillChartGaps( exchangesById ) {
    var chartData = {};
    var exchangeIds = _.keys( exchangesById );
    var exchangeNum = exchangeIds.length;
    _.each( exchangesById, function( exchange, exchangeId  ) {
        _.each( exchange.coinRates, function( coinRate ) {
            var date = coinRate.date;
            if ( !_.has( chartData, date ) ) {
                chartData[ date ] = {};
            }
            chartData[ date ][ exchangeId ] = coinRate.price;
        } );
    } );
    var dates = _.keys( chartData );
    dates = _.sortBy( dates, function(a, b) {
        return a > b;
    } );

    _.each( dates, function( date, index ) {
        if ( _.keys( chartData[ date ] ).length < exchangeNum ) {
            var dateData = chartData[ date ];
            _.each( exchangeIds, function( exchangeId ) {
                if ( !_.has( dateData, exchangeId ) ) {
                    dateData[ exchangeId ] = index == 0 ? 0 : chartData[ dates[ index - 1 ] ][ exchangeId ];
                }
            } );
        }
    } );
    _.each( exchangesById, function( exchange, exchangeId  ) {
        exchangesById[ exchangeId ].coinRates = [];
        _.each( chartData, function( chartDataValue, date ) {
            exchangesById[ exchangeId ].coinRates.push( {
                date: date,
                price: chartDataValue[ exchangeId ]
            } );
        } );
    } );
};

function getPercentProfitability( coinCode, type, startDate ) {
    var deferred = Q.defer();
    Exchange.find().done( function(err, exchanges) {
        if ( err ) {
            deferred.reject( MyError.get( 7, 'CoinExchangeController.getPercentProfitability' ) );
        }
        var exchangesByID = {};
        _.each( exchanges, function( exchange) {
            var exchangeObj = {
                name: exchange.name,
                coinRates: []
            }
            exchangesByID[ exchange.id ] = exchangeObj;
        } );

        var dateTo = (_.isUndefined( startDate ) ) ? moment() : startDate;
        var dateFrom = null;
        var sqlFunction = null;
        switch ( type ) {
            case FIVE_MINUTES:
                dateFrom = dateTo.subtract('minutes', 5);
                sqlFunction = 'MINUTE';
                break;
            case HOURLY:
                dateFrom = dateTo.subtract('hours', -1);
                sqlFunction = 'HOUR';
                break;
            case DAILY:
                dateFrom = dateTo.subtract('days', -1);
                sqlFunction = 'DAY';
                break;
            case WEEKLY:
                dateFrom = dateTo.subtract('days', -7);
                sqlFunction = 'WEEK';
                break;
            default :
            case MONTHLY:
                dateFrom = dateTo.subtract('months', -1);
                sqlFunction = 'MONTH';
                break;
        }

        CoinExchange.findByCoinCode( coinCode )
            //.where( { createdAt: { '>=': dateFrom.toISOString() } } )
            //.where( { createdAt: { '<=': dateTo.toISOString() } } )
            .groupBy( sqlFunction + '(createdAt)' )
            .average( 'price' )
            .sort( 'createdAt DESC')
            .limit( 2 )
            .exec( function( err, coinExchanges ) {
                if ( err ) {
                    deferred.reject( err );
                } else {
                    var profitability = 0;

                    if ( coinExchanges.length === 2 ) {
                        profitability = ( ( coinExchanges[ 0 ].price - coinExchanges[ 1 ].price ) / coinExchanges[ 0 ].price );
                    }

                    deferred.resolve( {
                        coinCode: coinCode,
                        type: type,
                        profit: profitability.toFixed( 4 )
                    } );
                }
        } );

    } );
    return deferred.promise;
}

module.exports = {

    get: function (req, res) {
        var missing = restVal.validateArray(req.body, [ "coinCode" ] );

        if ( missing != null) {
            return res.json( {success: false, error: MyError.get( 3, missing )}  );
        }

        var coinCode = req.body.coinCode;
        var dateRange = _.has( req.body, 'dateRange' ) ? req.body.dateRange : FIVE_MINUTES;

        var valuesNum = 0;
        var sqlFormat = null;
        var jsFormat = null;
        switch ( dateRange ) {
            case FIVE_MINUTES:
                valuesNum = 12;
                sqlFormat = '%Y-%m-%d %H:%i';
                jsFormat = 'YYYY-MM-DD HH:mm';
                break;
            case HOURLY:
                valuesNum = 24;
                sqlFormat = '%Y-%m-%d %H';
                jsFormat = 'YYYY-MM-DD HH';
                break;
            case DAILY:
                valuesNum = 30;
                sqlFormat = '%Y-%m-%d';
                jsFormat = 'YYYY-MM-DD';
                break;
            case WEEKLY:
                valuesNum = 9;
                sqlFormat = '%Y-%u';
                jsFormat = 'GGGG-WW';
                break;
            default :
            case MONTHLY:
                valuesNum = 6;
                sqlFormat = '%Y-%m';
                jsFormat = 'YYYY-MM';
                break;
        }

        Exchange.find().done( function(err, exchanges) {
            if ( err ) {
                return res.json( {success: false, error: MyError.get( 7, 'CoinExchangeController.get' )}  );
            }
            var exchangesByID = {};
            _.each( exchanges, function( exchange) {
                var exchangeObj = {
                    name: exchange.name,
                    coinRates: []
                }
                exchangesByID[ exchange.id ] = exchangeObj;
            } );
            CoinExchange.findByCoinCode( coinCode )
                //.where( { createdAt: { '>=': dateFrom.toISOString() } } )
                .groupBy( "DATE_FORMAT( createdAt, '" + sqlFormat + "') , exchangeId" )
                .average( 'price' )
                .sort( 'createdAt DESC')
                .limit( valuesNum )
                .exec( function( err, coinExchanges ) {
                    if ( err ) {
                        deferred.reject( err );
                    } else {
                        _.each( coinExchanges, function( coinExchange ) {

                            exchangesByID[ coinExchange.exchangeId ].coinRates.push( {
                                date: moment( coinExchange[ "DATE_FORMAT( createdAt, '" + sqlFormat + "')" ], jsFormat ),
                                price: coinExchange.price
                            } );
                        } );
                        _.each( exchangesByID, function( coinExchange, key ) {
                            if ( coinExchange.coinRates.length === 0) {
                                delete exchangesByID[ key ];
                            }
                        } );
                        fillChartGaps( exchangesByID );

                        _.each( exchangesByID, function( coinExchange, key ) {
                            coinExchange.coinRates = coinExchange.coinRates.reverse();
                        } );
                        return res.json( {success: true,
                            data: {
                                coinCode: coinCode,
                                dateRange: dateRange,
                                exchanges: _.values( exchangesByID )
                            }
                        } );
                    }
                } );
        } );
    },

    monitor: function (req, res) {
        var coinCode = req.param( 'id' );

        Coin.findOneByCode( req.param( 'id' ) )
            .then( function( coin, err) {
                if ( err ) {
                    res.json( { success: false, error : MyError.get( 7, 'CoinExchangeController.monitor' )})
                } else {
                    if ( _.isUndefined( coin ) ) {
                        res.json( { success: false, error : MyError.get( 9, coinCode )})
                    } else {
                        var arr = [];
                        arr.push( getPercentProfitability( coinCode, FIVE_MINUTES) );
                        arr.push( getPercentProfitability( coinCode, HOURLY) );
                        arr.push( getPercentProfitability( coinCode, DAILY) );
                        arr.push( getPercentProfitability( coinCode, WEEKLY) );
                        arr.push( getPercentProfitability( coinCode, MONTHLY) );
                        return Q.allSettled( arr );
                    }
                }
            } )
            .spread( function( fiveMinutes, hourly, daily, weekly, monthly ) {
                var profits = {};
                profits[ fiveMinutes.value.type ] = fiveMinutes.value.profit;
                profits[ hourly.value.type ] = hourly.value.profit;
                profits[ daily.value.type ] = daily.value.profit;
                profits[ weekly.value.type ] = weekly.value.profit;
                profits[ monthly.value.type ] = monthly.value.profit;

              res.json( {
                  success: true,
                  data: {
                      profits: profits
                  }
              } );
            } );
    },

    getAll: function (req, res) {

        var dateFrom = '';
        var dateTo = '';
        //default is 24h
        if ( !_.has(req, 'dateFrom') || !_.has(req, 'dateTo') ) {
            var now = Date.today();
            dateFrom = now.toString( dateFormat );
            dateTo = now.add( { hours: -24 }).toString( dateFormat );
        }

        Exchange.find().done( function(err, exchanges) {
            if ( err ) {
                return res.json( {success: false, error: MyError.get( 7, 'CoinExchangeController.get' )}  );
            }
            var exchangesByID = {};
            var i, len = exchanges.length;
            for ( i = 0; i < len; i++ ) {
                var exchange = exchanges[ i ];
                exchangesByID[ exchange.id ] = exchange;
            }
            var exchangeResults = {};
            CoinExchange.find().done( function( err, coinExchanges ) {
                var i, len = coinExchanges.length;
                for ( i = 0; i < len; i++ ) {
                    var coinExchange = coinExchanges[ i ];
                    if ( !_.has( exchangeResults, coinExchange.coinCode ) ) {
                        exchangeResults[ coinExchange.coinCode ] = {
                            coinCode: coinExchange.coinCode,
                            exchanges:{}
                        };
                    }

                    if ( !_.has( exchangeResults[ coinExchange.coinCode ].exchanges, coinExchange.exchangeId ) ) {
                        exchangeResults[ coinExchange.coinCode ].exchanges[ coinExchange.exchangeId ] = {
                            name: exchangesByID[ coinExchange.exchangeId ].name,
                            coinRates:[]
                        };
                    }

                    restVal.formatJSON( [ 'price', 'createdAt'], coinExchange )
                    exchangeResults[ coinExchange.coinCode ].exchanges[ coinExchange.exchangeId ].coinRates.push( {
                        date: new Date( coinExchange.createdAt).getTime(),
                        price: coinExchange.price
                    } );
                }

                return res.json( {
                    success: true,
                    data: {
                        coins: _.values( exchangeResults )
                    }
                } );
            } );

        } );
    }
}
