module.exports = {

    attributes: {

        name: {
            type: 'string',
            required: true
        },

        active: {
            type: 'boolean'
        },

        functionName: {
            type: 'string'
        },

        params: {
            type: 'json'
        }
    }
}