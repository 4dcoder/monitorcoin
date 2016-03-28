/**
 * PaymentController
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
   *    `/payment/create`
   */
   create: function (req, res) {
    var restVal = require('rest-validator');
    var missing = restVal.validateArray(req.body,
        [     "userId"
            , "coinId"
            , "merchantAddress"
            , "buyerAddress"
            , "amount"
            , "returnUrl"
            , "cancelUrl"
            , "ipnUrl"
        ]
    );

    if ( missing != null) {
      return res.json( {success: false, error: MyError.get( 3, [ missing ])}  );
    }

    Payment.create({
        userId: req.body.userId,
        coinCode: req.body.coinCode,
        coinId: req.body.coinId,
        merchantAddress: req.body.merchantAddress,
        buyerAddress: req.body.buyerAddress,
        amount: req.body.amount,
        returnUrl: req.body.returnUrl,
        cancelUrl: req.body.cancelUrl,
        ipnUrl: req.body.ipnUrl
    }).done(function(err, payment){
        if (err) {
            console.log(err);
            return res.json({
                error: err,
                success: false
            });
        } else {
            return res.json({
                transactionId: payment.transactionId,
                success: true
            });
        }
    });
  },


  /**
   * Action blueprints:
   *    `/payment/destroy`
   */
   destroy: function (req, res) {
    
    // Send a JSON response
    return res.json({
      hello: 'world'
    });
  },


  /**
   * Action blueprints:
   *    `/payment/tag`
   */
   tag: function (req, res) {
    
    // Send a JSON response
    return res.json({
      hello: 'world'
    });
  },


  /**
   * Action blueprints:
   *    `/payment/like`
   */
   like: function (req, res) {
    
    // Send a JSON response
    return res.json({
      hello: 'world'
    });
  },




  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to PaymentController)
   */
  _config: {}

  
};