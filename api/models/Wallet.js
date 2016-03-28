/**
 * User
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

module.exports = {

    attributes: {

        userId: {
            type: 'int',
            required: true
        },

        coinId: {
            type: 'int',
            required: true
        },

        address: {
            type: 'string',
            required: true
        }
    }

};
