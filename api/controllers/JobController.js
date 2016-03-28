/**
 * CryptsyController
 *
 * @module      :: Controller
 * @description	:: A set of functions called `actions`.
 *
 *                 Actions contain code telling Sails how to respond to a certain type of request.
 *                 (i.e. do stuff, then send some JSON, show an HTML page, or redirect to another URL)
 *
 *                 You can configure the blueprint URLs which trigger these actions (`config/controllers.js`)
 *                 and/or override them with custom routes (`config/routes.js`)
 *
 *                 NOTE: The code you write here supports both HTTP and Socket.io automatically.
 *
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */

module.exports = {


  /**
   * Action blueprints:
   *    `/cryptsy/getInfo`
   */
   importCoins: function (req, res) {

      var Cryptsy = require('cryptsy');

      var cryptsy = new Cryptsy('', '');//Cryptsy('8836f432cae89ef4ac1ee43a8445911c8ac43483', '29d0cea7acb7330f249e26e09dd810cb010ccfaee8a7763311a74c2c2a8720a9a75980ba75c1491f');
      cryptsy.api('marketdatav2', null, function (err, data) {
          if (err) {
              console.log( err );
          } else {
              var coins = [];
              for (var marketName in data.markets) {
                  var market = data.markets[ marketName ];

                  if ( _.indexOf( coins, market.primarycode ) == -1 ) {
                      coins.push( market.primarycode );
                      Coin.updateOrCreate( market.primarycode, market.primaryname ).done( function( err, coin ) {} );
                  }
                  if ( _.indexOf( coins, market.secondarycode ) == -1 ) {
                      coins.push( market.secondarycode );
                      Coin.updateOrCreate( market.secondarycode, market.secondaryname ).done( function( err, coin ) {});
                  }
              }

              return res.json({
                  data: { success: true, coins:coins }
              });
          }
      });
  },

  get: function (req, res) {

  },




  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to CryptsyController)
   */
  _config: {}

  
};
