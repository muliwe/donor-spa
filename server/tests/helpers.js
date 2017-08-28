const assert = require('assert');

module.exports = {
    definedProperty: function(param) {
        return function (actual, length) {
            const actualData = JSON.parse(actual);

            assert(actualData[param]);

            if (length) {
                assert.equal(('' + actualData[param]).length, length);
            }
        }
    },
    hasLength: function(length) {
        return function (actual) {
            const actualData = JSON.parse(actual);

            assert.equal(actualData.length, length);
        }
    }
};
