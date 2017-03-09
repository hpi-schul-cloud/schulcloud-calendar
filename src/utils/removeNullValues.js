/**
 * filter key-value-pairs with null values
 * @param json
 * @returns {*}
 */
function removeNullValues(json) {
    Object.keys(json).forEach(function (key) {
        let value = json[key];
        if (value === null) {
            delete json[key];
        } else if (Object.prototype.toString.call(value) === '[object Object]') {
            removeNullValues(value);
        } else if (Array.isArray(value)) {
            value.forEach(function (k) {
                removeNullValues(value[k]);
            });
        }
    });
}

module.exports = removeNullValues;
