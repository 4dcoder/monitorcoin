var app = angular.module('cryptcart', [
    'ngRoute',
    'ui.bootstrap',
    'ngAnimate',
    'ngCookies',
    'nvd3ChartDirectives',
    'components',
    'cryptcartControllers',
    'cryptcartAnimations',
    'toggle-switch'
]);



app.config( function( $locationProvider, $routeProvider) {
    $locationProvider.html5Mode(false)
                     .hashPrefix('!');
    $routeProvider.
            when( '/exchangeMonitor', {
                templateUrl: '/js/ng/views/index.html',
                controller: 'ExchangeMonitorCtrl',
                state: 'exchangeMonitor'
            } ).
            when( '/coinsVisibility', {
                templateUrl: '/js/ng/views/index.html',
                controller: 'ExchangeMonitorCtrl',
                state: 'coinsVisibility'
            } ).
            otherwise( {
                redirectTo: '/exchangeMonitor'
            });
    } );