const assert = require('assert');

module.exports = {
    definedProperty: function(param) {
        return function (actual) {
            const actualData = JSON.parse(actual);

            assert(actualData[param]);
        }
    },
    hasLength: function(length) {
        return function (actual) {
            const actualData = JSON.parse(actual);

            assert.equal(actualData.length, length);
        }
    }
};
