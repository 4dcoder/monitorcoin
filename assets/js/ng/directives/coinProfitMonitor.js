angular.module('components', [])
    .directive('coinProfitMonitor', function () {
        return {
            restrict: 'EA',
            scope: {
                coinCode: '@',
                showChart: '&'
            },
            templateUrl: '/js/ng/partials/directives/coinProfitMonitor.html',
            controller: function ( $scope, $http, $modal, $filter, $cookieStore ) {
                $scope.profits = {
                    fiveMinutes: {
                        profitPercent: 0.0000,
                        arrow: 'minus',
                        color: 'grey'
                    },
                    hourly: {
                        profitPercent: 0.0000,
                        arrow: 'minus',
                        color: 'grey'
                    },
                    daily: {
                        profitPercent: 0.0000,
                        arrow: 'minus',
                        color: 'grey'
                    },
                    weekly: {
                        profitPercent: 0.0000,
                        arrow: 'minus',
                        color: 'grey'
                    },
                    monthly: {
                        profitPercent: 0.0000,
                        arrow: 'minus',
                        color: 'grey'
                    }
                };
                $scope.getMonitorData = function( coinCode ) {
                    $http({
                        url: "/coinExchange/monitor/" + coinCode,
                        method: "get"
                    }).success(function (data, status, headers, config) {
                            $scope.coinCode = coinCode;
                            $scope.profits = {};
                            angular.forEach( data.data.profits, function( value, key ){
                                $scope.profits[ key ] = {};
                                $scope.profits[ key ].profitPercent = value;
                                if ( value > 0 ) {
                                    $scope.profits[ key ].arrow = 'caret-up';
                                    $scope.profits[ key ].color = 'green';
                                } else if ( value < 0 ) {
                                    $scope.profits[ key ].arrow = 'caret-down';
                                    $scope.profits[ key ].color = 'red';
                                } else {
                                    $scope.profits[ key ].arrow = 'minus';
                                    $scope.profits[ key ].color = 'grey';
                                }

                            } );
                        }).error(function (data, status, headers, config) {
                            $scope.coinCode = coinCode;
                        });
                }
                $scope.showChart = function( dateRange ) {
                    $modal.open( {
                        templateUrl: '/js/ng/partials/modalChart.html',
                        controller: 'ModalChartCtrl',
                        resolve: {
                            coinCode: function() {
                                return $scope.coinCode;
                            },
                            dateRange: function() {
                                return dateRange;
                            }
                        }
                    } );
                }

                $scope.showHideCoinModal = function() {
                    var modalInstance = $modal.open( {
                        templateUrl: '/js/ng/partials/modalYesNo.html',
                        controller: 'ModalYesNoCtrl',
                        resolve: {
                            title: function() {
                                return 'Warning'
                            },
                            message: function() {
                                return 'Do you want to hide <strong>' + $scope.coinCode + '</strong> widget?'
                            },
                            yesTitle: function() {
                                return 'yes'
                            },
                            noTitle: function() {
                                return 'no'
                            }
                        }
                    } );

                    modalInstance.result.then(function ( result ) {
                        if ( result === 1 ) {
                            hideCoin();
                        }
                    });

                    function hideCoin() {

                        var hiddenCoins = $cookieStore.get( 'hiddenCoins' );

                        if ( angular.isUndefined( hiddenCoins ) || !angular.isArray( hiddenCoins ) ) {
                            hiddenCoins = [];
                        }

                        if ( hiddenCoins.indexOf( $scope.coinCode ) === -1 ) {
                            hiddenCoins.push( $scope.coinCode );
                            angular.element( '#coin_' + $scope.coinCode ).remove();
                            $cookieStore.put( 'hiddenCoins', hiddenCoins );
                        }
                    }
                }
            },
            link: function( $scope, $element, $attrs, $ctrl ) {
                $scope.getMonitorData( $attrs.coinCode );
            }
        }
    });