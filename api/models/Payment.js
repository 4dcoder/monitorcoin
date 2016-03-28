module.exports = {

    attributes: {

        transactionId: {
            type: 'string',
            required: true,
            unique: true
        },

        userId: {
            type: 'integer',
            required: true
        },

        coinCode: {
            type: 'string',
            required: true
        },

        merchantAddress: {
            type: 'string',
            required: true
        },

        buyerAddress: {
            type: 'string',
            required: true
        },

        amount: {
            type: 'float',
            required: true
        },

        status: {
            type: 'integer',
            required: true
        },

        returnUrl: {
            type: 'string',
            required: true
        },

        cancelUrl: {
            type: 'string',
            required: true
        },

        ipnUrl: {
            type: 'string',
            required: true
        }
    },

    beforeValidation: function (attrs, cb) {
        console.log('before create');
        var uuid = require('node-uuid');
        attrs.transactionId = uuid.v4();
        attrs.status = Payment.STATUS.PENDING;
        cb();
    },

    /*
    afterCreate: function(payment, cb) {
        console.log(payment.id);
        cb();
    },
    */

    STATUS : {
        PENDING : 1,
        PAID: 2,
        FAILED: 3
    }
};