module.exports = {

    autoUpdatedAt: false,

    attributes: {

        coinCode: {
            type: 'string',
            required: true
        },

        exchangeId: {
            type: 'integer',
            required: true
        },

        price: {
            type: 'float'
        }
    }
}