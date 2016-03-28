'use strict';

/* Controllers */

var app = angular.module( 'cryptcartControllers', [] );

app.controller('LoginCtrl', function ( $scope, $http, $location ) {
    $scope.user = {
        loggedIn:false,
        token: ''
    }
    $scope.loginData = {
        username:'',
        password:'',
        rememberMe:false
    };
    $scope.registerData = {
        username:'',
        email:'',
        password:'',
        passwordConfirmation:''
    };

    $scope.isLoginVisible = true;

    $scope.showRegister = function() {
        $scope.isLoginVisible = false;
    }
    $scope.showLogin = function() {
        $scope.isLoginVisible = true;
    }

    $scope.login = function() {
        $scope.message = null;

        $http({
            method  : 'POST',
            url     : '/user/login',
            data    : $.param($scope.loginData),  // pass in data as strings
            headers : { 'Content-Type': 'application/x-www-form-urlencoded' }  // set the headers so angular passing info as form data (not request payload)
        })
            .success(function(data) {
                console.log(data);

                if (!data.success) {
                    // if not successful, bind errors to error variables
                    $scope.message = data.error.errorMessage;
                } else {
                    $location.path( '/dashboard' );
                }
            });
    }

    $scope.register = function() {
        $scope.message = null;
        $http({
            method  : 'POST',
            url     : '/user/register',
            data    : $.param($scope.registerData),  // pass in data as strings
            headers : { 'Content-Type': 'application/x-www-form-urlencoded' }  // set the headers so angular passing info as form data (not request payload)
        })
            .success(function(data) {
                console.log(data);

                if (!data.success) {
                    // if not successful, bind errors to error variables
                    $scope.message = data.error.errorMessage;
                } else {
                    $location.path( '/dashboard' );
                }
            });
    }
} );


app.controller( 'CoinCtrl' , function ( $scope, $http ) {
    $http.post( '/coin/get', null ).success( function( response )
    {
        $scope.coins = response.coins;
    });
} );

app.controller( 'ExchangeMonitorCtrl' , function ( $scope, $http, $filter, $window, $cookieStore, $modal, $route ) {
    var hiddenCoins = $cookieStore.get( 'hiddenCoins' );
    $scope.state = $route.current.state;
    $http( {
        method  : 'POST',
        url     : '/coin/getAll',
        data    : encodeURIComponent( angular.toJson( { exclude: hiddenCoins } ) ),
        headers : { 'Content-Type': 'application/x-www-form-urlencoded' }  // set the headers so angular passing info as form data (not request payload)
    } ).success( function( response ) {
            if ( !response.success ) {
                $modal.open( {
                    templateUrl: '/js/ng/partials/modalAlert.html',
                    controller: 'ModalAlertCtrl',
                    resolve: {
                        title: function() {
                            return 'Error';
                        },
                        message: function() {
                            return 'Error connecting with server!';
                        }
                    }
                } );
                return;
            }

            $scope.coins = [];
            $scope.chartData = [];
            if ( $scope.state === 'exchangeMonitor' ) {
                $scope.totalCoins = response.coins.length;
                _.chain( response.coins )
                    .filter( function( coin ) {
                        return ( hiddenCoins.indexOf ( coin.code ) === -1 )
                    } )
                    .each( function( coin ) {
                        coin.chartData = 'chart_' + coin.code;
                        $scope.coins.push( coin );
                    } );
            } else if ( $scope.state === 'coinsVisibility' ) {
                $scope.coins = response.coins;
                $scope.hiddenCoins = {};
                _.each( response.coins, function( coin ) {
                    $scope.hiddenCoins[ coin.code ] = hiddenCoins.indexOf( coin.code ) === -1;
                } );
                $scope.switchModel = { showAll: true };

                $scope.saveHiddenCoins = function() {
                    var hiddenCoins = [];
                    _.each( $scope.hiddenCoins, function( nonVisible, code ) {
                        if ( !nonVisible ) {
                            hiddenCoins.push( code );
                        };
                    } );
                    $cookieStore.put( 'hiddenCoins', hiddenCoins );
                }

                var firstTime = true;
                $scope.$watchCollection( 'switchModel', function() {
                    if ( firstTime ) {
                        firstTime = false;
                        return;
                    }

                    var newValue = $scope.showAll;
                    var hiddenCoins = {};//for not dispatch watch event for each code
                    _.each( $scope.hiddenCoins, function( visible, code ) {
                        hiddenCoins[ code ] = newValue;
                    } );
                    $scope.hiddenCoins = hiddenCoins;
                } );
            }
    });
} );

app.controller( 'ModalAlertCtrl' , function ($scope, $http, $modalInstance, title, message) {

    $scope.title = title;
    $scope.message = message;
    $scope.close = function(){
        $modalInstance.close();
    };
} );

app.controller( 'ModalYesNoCtrl' , function ($scope, $http, $modalInstance, title, message, yesTitle, noTitle) {

    $scope.title = title;
    $scope.message = message;
    $scope.yesTitle = yesTitle;
    $scope.noTitle = noTitle;
    $scope.close = function(){
        $modalInstance.close( 0 );
    };
    $scope.no = function(){
        $modalInstance.close( 0 );
    };
    $scope.yes = function(){
        $modalInstance.close( 1 );
    };
} );

app.controller( 'ModalChartCtrl' , function ($scope, $http, $modalInstance, coinCode, dateRange) {

    $scope.title = coinCode + ' ' + dateRange;
    $scope.close = function(){
        $modalInstance.close();
    };

    function generateChartData( data ) {
        var dateRange = data.dateRange;
        var exchangesData = [];
        console.log( data );
        _.each( data.exchanges, function( exchange, exchangeId ) {
            var exchangeData = {
                "key": exchange.name,
                "values": []
            }

            _.each( exchange.coinRates, function( coinRate, index ) {
                exchangeData.values.push( [ new Date( coinRate.date ), coinRate.price] );
            } );
            exchangesData.push( exchangeData );
        } );

        $scope.chartData = exchangesData;

        $scope.xAxisDateFormat = function(){

            var FIVE_MINUTES = 'fiveMinutes';
            var HOURLY = 'hourly';
            var DAILY = 'daily';
            var WEEKLY = 'weekly';
            var MONTHLY = 'monthly';

            var format = null;
            switch ( dateRange ) {
                case FIVE_MINUTES:
                    format = '%H:%M';
                    break;
                case HOURLY:
                    format = '%H:00';
                    break;
                case DAILY:
                    format = '%Y-%m-%d';
                    break;
                case WEEKLY:
                    format = '%Y-%W';
                    break;
                default :
                case MONTHLY:
                    format = '%Y-%m';
                    break;
            }

            return function(d){
                return d3.time.format( format ) (moment.unix( d / 1000 ).toDate() );
            }
        };
    };

    function getChartData( coinCode, dateRange ) {

        $http( {
            method  : 'POST',
            url     : '/coinExchange/get',
            data    : $.param( { coinCode: coinCode, dateRange: dateRange } ),
            headers : { 'Content-Type': 'application/x-www-form-urlencoded' }  // set the headers so angular passing info as form data (not request payload)
        } ).success(function(response) {
                generateChartData( response.data );
            });
    };

    getChartData( coinCode, dateRange );

} );
