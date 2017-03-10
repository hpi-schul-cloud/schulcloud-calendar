/**
 * filter key-value-pairs with null values
 * @param originalJson
 * @returns {*}
 */
function removeNullValues(originalJson) {
    // copy the object
    let json = JSON.parse(JSON.stringify(originalJson));
    Object.keys(json).forEach(function (key) {
        let value = json[key];
        if (value === null) {
            delete json[key];
        } else if (Object.prototype.toString.call(value) === '[object Object]') {
            json[key] = removeNullValues(value);
        } else if (Array.isArray(value)) {
            let cleanedArray = [];
            value.forEach(function (k) {
                cleanedArray.push(removeNullValues(k));
            });
            if (cleanedArray.length > 0) {
                json[key] = cleanedArray;
            } else {
                delete json[key];
            }
        }
    });
    return json;
}

module.exports = removeNullValues;
